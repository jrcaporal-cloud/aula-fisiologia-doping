import { memo, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import gsap from 'gsap';
import * as THREE from 'three';
import { CARDIO_STEPS, type CardioPhase } from '../../../data/cardioSteps';
import { Label3D } from '../receptor/Label3D';
import type { TimeRef } from '../receptor/types';
import { buildCameraPath } from '../peptide/camera';
import { Atria } from './Atria';
import { CameraDirector } from './CameraDirector';
import { GhostHeart } from './GhostHeart';
import { PickLayer } from './PickLayer';
import type { Pin } from './selection';
import { cardioLabelsForStep } from './labels';
import { writeFlowFrame, type CardioStateRef } from './flow';
import { cardiacCycle, cardioParams } from './params';
import { RedCells } from './RedCells';
import { Valves } from './Valves';
import { Ventricle } from './Ventricle';
import { Vessels } from './Vessels';

/*
 * Raiz da cena do circuito. T (tempo da aula) é a soma dos colaterais; o batimento tem relógio
 * próprio e nunca para. A fase ("em uso" × "depois de parar") entra como uma mistura animada, para o
 * circuito transitar em vez de pular no meio de uma etapa.
 */

interface MixRef { readonly current: { m: number } }

/**
 * Atualiza, uma vez por quadro, tudo o que o resto da cena lê. Precisa ser o primeiro filho: os
 * `useFrame` assinam na ordem em que os componentes montam.
 */
const CardioClock = ({ stateRef, timeRef, mixRef, reduced }: {
    stateRef: CardioStateRef; timeRef: TimeRef; mixRef: MixRef; reduced: boolean;
}) => {
    useFrame(({ clock }) => {
        const st = stateRef.current;
        cardioParams(timeRef.current.t, mixRef.current.m, st.p);
        cardiacCycle(clock.elapsedTime, st.p, reduced, st.cy);
        writeFlowFrame(st.f, st.p, st.cy);
    });
    return null;
};

/** Fundo: degradê escuro com tom carmim (identidade da aula). */
const Backdrop = () => {
    const mat = useMemo(() => new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `varying vec3 vP; void main(){
            float h = vP.y * 0.5 + 0.5;
            vec3 c = mix(vec3(0.015,0.006,0.016), vec3(0.055,0.022,0.055), smoothstep(0.2, 0.95, h));
            c += vec3(0.1,0.012,0.04) * pow(max(vP.y, 0.0), 2.0) * 0.5;
            gl_FragColor = vec4(c, 1.0);
        }`,
    }), []);
    return <mesh material={mat} scale={180}><sphereGeometry args={[1, 32, 16]} /></mesh>;
};

export interface CardioSceneProps {
    step: number;
    settled: number;
    phase: CardioPhase;
    reduced: boolean;
    /** Estrutura fixada (câmera em close-up) ou null. */
    pin: Pin | null;
    recenterKey: number;
    /** "Sobrepor o treinado". */
    overlay: boolean;
    onSettled: (step: number) => void;
    /** Chamado uma vez, depois que a cena desenhou os primeiros quadros. */
    onReady: () => void;
    stateRef: CardioStateRef;
    timeRef: TimeRef;
}

/** Avisa quando os primeiros quadros foram desenhados (o `useFrame` do quadro N roda antes de ele ser pintado). */
const ReadyProbe = ({ onReady }: { onReady: () => void }) => {
    const frames = useRef(0);
    useFrame(() => {
        frames.current += 1;
        if (frames.current === 3) onReady();
    });
    return null;
};

const CardioSceneImpl = ({ step, settled, phase, reduced, pin, recenterKey, overlay, onSettled, onReady, stateRef, timeRef }: CardioSceneProps) => {
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

    // com algo fixado, os rótulos da etapa sairiam na frente do close-up
    const labels = useMemo(() => (settled === step && !pin ? cardioLabelsForStep(step) : []), [settled, step, pin]);

    return (
        <>
            <CardioClock stateRef={stateRef} timeRef={timeRef} mixRef={mixRef} reduced={reduced} />
            <Backdrop />
            <fog attach="fog" args={['#07040c', 54, 140]} />
            <ambientLight intensity={0.42} color="#c0b0c8" />
            <hemisphereLight args={['#fecdd3', '#120a16', 0.5]} />
            <directionalLight position={[6, 14, 20]} intensity={2.1} color="#fff5f7" />
            <directionalLight position={[-14, 2, 10]} intensity={0.9} color="#fb7185" />
            <directionalLight position={[8, -10, 14]} intensity={0.6} color="#a5b4fc" />

            <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} minDistance={6} maxDistance={90} />
            <CameraDirector
                step={step} reduced={reduced} pin={pin} recenterKey={recenterKey}
                onSettled={onSettled} timeRef={timeRef} path={path}
            />
            <PickLayer />
            <ReadyProbe onReady={onReady} />

            <Vessels stateRef={stateRef} />
            <Ventricle stateRef={stateRef} />
            <Valves stateRef={stateRef} />
            <Atria stateRef={stateRef} />
            <RedCells stateRef={stateRef} reduced={reduced} />
            <GhostHeart overlay={overlay} reduced={reduced} />

            {labels.map((l, i) => <Label3D key={`${step}-${l.id}`} spec={l} timeRef={timeRef} delay={0.08 + i * 0.12} />)}

            <EffectComposer multisampling={4}>
                <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.2} intensity={0.45} radius={0.5} />
                <Vignette offset={0.3} darkness={0.62} />
            </EffectComposer>
        </>
    );
};

/** `memo`: o modal re-renderiza a cada entrada/saída de hover, e a cena não depende disso. */
export const CardioScene = memo(CardioSceneImpl);
