import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import gsap from 'gsap';
import * as THREE from 'three';
import { CARDIO_STEPS, type CardioPhase, type CardioVitals } from '../../../data/cardioSteps';
import { Label3D } from '../receptor/Label3D';
import { smooth } from '../receptor/layout';
import type { TimeRef } from '../receptor/types';
import { buildCameraPath } from '../peptide/camera';
import { CameraDirector } from './CameraDirector';
import { CursorLayer, PickLayer } from './PickLayer';
import type { Pin } from './selection';
import { cardioLabelsForStep } from './labels';
import { PLAQUE_SAMPLE, speedAt, writeFlowFrame, type CardioState, type CardioStateRef } from './flow';
import { Heart } from './Heart';
import { emptyVitals, labVitals, presetById } from './lab/labModel';
import { useLab, type CardioMode } from './lab/labStore';
import { LabFocusLabel } from './LabFocusLabel';
import { cardiacCycle, deriveGeometry, emptyCycle, emptyParams, mixVitalsInto, scriptVitals, type CycleState } from './params';
import { RedCells } from './RedCells';
import { pressureAt, pushSeries, type Series, type SeriesPoint } from './series';
import { Vessels } from './Vessels';

/*
 * Raiz da cena. Duas fontes para a ficha do quadro: o ROTEIRO (T = soma dos colaterais, fase em uso ×
 * depois de parar) e o LABORATÓRIO (controles dosados pelo aluno → física didática). A troca de modo
 * e os movimentos dos controles são suavizados aqui, para o circuito transitar em vez de pular. O
 * batimento tem relógio próprio (para quando a simulação está pausada).
 */

interface MixRef { readonly current: { m: number } }

const approach = (out: CardioVitals, to: CardioVitals, k: number): void => {
    for (const key of Object.keys(to) as (keyof CardioVitals)[]) {
        const d = to[key] - out[key];
        out[key] = Math.abs(d) < 1e-4 ? to[key] : out[key] + d * k;
    }
};

const copyVitals = (out: CardioVitals, from: CardioVitals): void => {
    for (const key of Object.keys(from) as (keyof CardioVitals)[]) out[key] = from[key];
};

/** Coração treinado de referência (o traço tracejado do monitor). */
const TRAINED_P = (() => {
    const p = emptyParams();
    copyVitals(p.v, presetById('treinado').vitals);
    return deriveGeometry(p);
})();

/** Ponto das séries no quadro: o estado atual e o treinado no mesmo instante. */
const samplePoint = (pt: SeriesPoint, st: CardioState, ref: CycleState): SeriesPoint => {
    pt.pa = pressureAt(st.cy.c, st.p.rigidez, st.p.v.paDiast, st.p.v.paSist);
    pt.paRef = pressureAt(ref.c, 0, TRAINED_P.v.paDiast, TRAINED_P.v.paSist);
    // volume do VE em relação ao fim da diástole do treinado (∝ raio² × altura)
    const vScale = (st.p.rCav / TRAINED_P.rCav) ** 2 * (st.p.hCav / TRAINED_P.hCav);
    pt.vol = 100 * vScale * st.cy.volRatio;
    pt.volRef = 100 * ref.volRatio;
    pt.vel = st.f.spd[PLAQUE_SAMPLE];
    pt.velRef = speedAt(PLAQUE_SAMPLE, TRAINED_P, ref);
    return pt;
};

interface ClockProps {
    stateRef: CardioStateRef;
    timeRef: TimeRef;
    mixRef: MixRef;
    reduced: boolean;
    series: Series;
}

/**
 * Atualiza, uma vez por quadro, tudo o que o resto da cena lê. Precisa ser o primeiro filho: os
 * `useFrame` assinam na ordem em que os componentes montam.
 */
const CardioClock = ({ stateRef, timeRef, mixRef, reduced, series }: ClockProps) => {
    const scratch = useMemo(() => ({
        script: emptyVitals(),
        labTarget: emptyVitals(),
        lab: emptyVitals(),
        refCycle: emptyCycle(),
        point: { pa: 0, paRef: 0, vol: 0, volRef: 0, vel: 0, velRef: 0 } as SeriesPoint,
    }), []);
    const clock = useRef({ beat: 0, refBeat: 0, time: 0, mode: 0, seeded: false });
    useFrame((_, delta) => {
        const st = stateRef.current;
        const lab = useLab.getState();
        const raw = Math.min(delta, 0.05);
        const dt = lab.paused ? 0 : raw;
        const c = clock.current;
        st.dt = dt;
        c.beat += dt;
        c.refBeat += dt;
        c.time += dt;

        const target = lab.mode === 'lab' ? 1 : 0;
        c.mode += (target - c.mode) * (1 - Math.exp(-raw * (reduced ? 12 : 3.2)));
        if (Math.abs(target - c.mode) < 1e-3) c.mode = target;

        labVitals(lab.controls, scratch.labTarget);
        if (!c.seeded) { copyVitals(scratch.lab, scratch.labTarget); c.seeded = true; }
        approach(scratch.lab, scratch.labTarget, 1 - Math.exp(-raw * (reduced ? 30 : 9)));
        scriptVitals(timeRef.current.t, mixRef.current.m, scratch.script);
        if (c.mode === 0) copyVitals(st.p.v, scratch.script);
        else if (c.mode === 1) copyVitals(st.p.v, scratch.lab);
        else mixVitalsInto(scratch.script, scratch.lab, smooth(c.mode), st.p.v);
        deriveGeometry(st.p);
        cardiacCycle(c.beat, st.p, reduced, st.cy);
        writeFlowFrame(st.f, st.p, st.cy);

        if (dt > 0) {
            const ref = cardiacCycle(c.refBeat, TRAINED_P, reduced, scratch.refCycle);
            pushSeries(series, c.time, samplePoint(scratch.point, st, ref));
        }
    });
    return null;
};

/** Fundo: degradê quase preto, com um tom carmim que sobe do chão (identidade da aula). */
const Backdrop = () => {
    const mat = useMemo(() => new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `varying vec3 vP; void main(){
            float h = vP.y * 0.5 + 0.5;
            vec3 c = mix(vec3(0.012,0.009,0.016), vec3(0.03,0.022,0.034), smoothstep(0.25, 0.9, h));
            float glow = exp(-pow((vP.y + 0.25) / 0.3, 2.0)) * smoothstep(0.0, 0.8, -vP.z);
            c += vec3(0.035, 0.006, 0.013) * glow;
            gl_FragColor = vec4(c, 1.0);
        }`,
    }), []);
    useEffect(() => () => mat.dispose(), [mat]);
    return <mesh material={mat} scale={180} raycast={() => undefined}><sphereGeometry args={[1, 32, 16]} /></mesh>;
};

/** Luz de estúdio para tecido úmido: ambiente assado uma vez (sem arquivo HDR — a aula roda offline). */
const StudioEnvironment = () => (
    <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={1.5} color="#fff3f0" position={[0, 6, 9]} scale={[14, 5, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#ffd6dc" position={[-10, 1, 4]} rotation={[0, Math.PI / 2.4, 0]} scale={[8, 6, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#c7d2fe" position={[10, -2, 4]} rotation={[0, -Math.PI / 2.4, 0]} scale={[8, 6, 1]} />
        <Lightformer form="ring" intensity={0.6} color="#fb7185" position={[0, -6, -6]} scale={6} />
    </Environment>
);

export interface CardioSceneProps {
    step: number;
    settled: number;
    phase: CardioPhase;
    mode: CardioMode;
    reduced: boolean;
    /** Estrutura fixada (câmera em close-up) ou null. */
    pin: Pin | null;
    recenterKey: number;
    onSettled: (step: number) => void;
    /** Chamado uma vez, depois que a cena desenhou os primeiros quadros. */
    onReady: () => void;
    stateRef: CardioStateRef;
    timeRef: TimeRef;
    series: Series;
}

/**
 * Avisa quando os primeiros quadros foram desenhados (o `useFrame` do quadro N roda antes de ele ser
 * pintado). No primeiro quadro compila todos os programas da cena de uma vez, por trás do véu de
 * carga: sem isso, cada material novo que entra em quadro trava a animação na primeira vez.
 */
const ReadyProbe = ({ onReady }: { onReady: () => void }) => {
    const frames = useRef(0);
    useFrame(({ gl, scene, camera }) => {
        frames.current += 1;
        if (frames.current === 1) gl.compile(scene, camera);
        if (frames.current === 3) onReady();
    });
    return null;
};

const CardioSceneImpl = ({
    step, settled, phase, mode, reduced, pin, recenterKey, onSettled, onReady, stateRef, timeRef, series,
}: CardioSceneProps) => {
    const mixRef = useRef({ m: 0 });
    const path = useMemo(() => buildCameraPath(CARDIO_STEPS, false), []);

    // a troca de fase não pode fazer a cena pular: os parâmetros transitam
    useEffect(() => {
        const anim = gsap.to(mixRef.current, {
            m: phase === 'apos' ? 1 : 0,
            duration: reduced ? 0.3 : 1.4,
            ease: 'power2.inOut',
        });
        return () => { anim.kill(); };
    }, [phase, reduced]);

    // com algo fixado (ou no laboratório), os rótulos da etapa sairiam na frente
    const labels = useMemo(
        () => (mode === 'roteiro' && settled === step && !pin ? cardioLabelsForStep(step) : []),
        [settled, step, pin, mode],
    );

    return (
        <>
            <CardioClock stateRef={stateRef} timeRef={timeRef} mixRef={mixRef} reduced={reduced} series={series} />
            <Backdrop />
            <StudioEnvironment />
            <fog attach="fog" args={['#07050a', 60, 150]} />
            <ambientLight intensity={0.18} color="#ffe4e6" />
            <directionalLight position={[5, 12, 16]} intensity={1.9} color="#fff6f2" />
            <directionalLight position={[-14, 3, 8]} intensity={0.75} color="#fda4af" />
            <directionalLight position={[10, -8, 10]} intensity={0.45} color="#c7d2fe" />

            <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} minDistance={6} maxDistance={80} />
            <CameraDirector
                step={step} reduced={reduced} pin={pin} recenterKey={recenterKey} mode={mode}
                onSettled={onSettled} timeRef={timeRef} path={path}
            />
            <PickLayer />
            <CursorLayer />
            <ReadyProbe onReady={onReady} />

            <Heart stateRef={stateRef} />
            <Vessels stateRef={stateRef} />
            <RedCells stateRef={stateRef} reduced={reduced} />

            {labels.map((l, i) => <Label3D key={`${step}-${l.id}`} spec={l} timeRef={timeRef} delay={0.08 + i * 0.12} />)}
            {mode === 'lab' && !pin && <LabFocusLabel stateRef={stateRef} />}

            <EffectComposer multisampling={4}>
                <Bloom mipmapBlur luminanceThreshold={0.92} luminanceSmoothing={0.15} intensity={0.25} radius={0.45} />
                <Vignette offset={0.32} darkness={0.55} />
            </EffectComposer>
        </>
    );
};

/** `memo`: o modal re-renderiza a cada entrada/saída de hover, e a cena não depende disso. */
export const CardioScene = memo(CardioSceneImpl);
