import { useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import gsap from 'gsap';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { PEPTIDE_STEPS, type PeptideLigand } from '../../../data/peptideSteps';
import { useStore } from '../../../store/useStore';
import { smoother } from '../receptor/layout';
import { Label3D } from '../receptor/Label3D';
import type { TimeState } from '../receptor/types';
import { buildCameraPath, type CameraPath } from './camera';
import { Effectors } from './Enzymes';
import { GProteins } from './GProtein';
import { Gpcrs } from './Gpcr';
import { Granules } from './Granules';
import { peptideLabelsForStep } from './labels';
import { sideOf } from './layout';
import { Messengers } from './Messengers';
import { BloodTag } from './Overlays';
import { PepMembrane } from './PepMembrane';
import { Peptides } from './Peptide';
import { BACKDROP_FRAGMENT, BACKDROP_VERTEX, backdropUniforms, tickSignal } from './shaders';
import type { Side } from './layout';

interface TweenState { active: boolean; u: number; offP: THREE.Vector3; offT: THREE.Vector3 }
/**
 * Desvio da câmera em relação à spline durante a transição. Um só no módulo (só há uma cena aberta por
 * vez): nada é recriado a cada render e o efeito o zera ao desmontar.
 */
const TWEEN: { current: TweenState } = { current: { active: false, u: 1, offP: new THREE.Vector3(), offT: new THREE.Vector3() } };

/** Câmera: segue a spline das poses-chave, parametrizada pelo mesmo tempo T da coreografia. */
const CameraRig = ({ timeRef, tween, path }: { timeRef: { current: TimeState }; tween: { current: TweenState }; path: CameraPath }) => {
    const camera = useThree(s => s.camera);
    const controls = useThree(s => s.controls) as OrbitControlsImpl | null;
    const tp = useMemo(() => new THREE.Vector3(), []);
    const tt = useMemo(() => new THREE.Vector3(), []);
    useFrame(() => {
        const tw = tween.current;
        if (!tw.active || !controls) return;
        const T = timeRef.current.t;
        const fade = 1 - smoother(Math.min(tw.u * 1.25, 1));
        path.pos(T, tp).addScaledVector(tw.offP, fade);
        path.tgt(T, tt).addScaledVector(tw.offT, fade);
        camera.position.copy(tp);
        controls.target.copy(tt);
        controls.update();
    });
    return null;
};

/** Fundo: degradê escuro com um leve tom carmim (identidade da aula); o citosol acende com o Ca²⁺. */
const BACKDROP_GEO = new THREE.SphereGeometry(1, 32, 16);
const Backdrop = () => {
    const mat = useMemo(() => new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: backdropUniforms(),
        vertexShader: BACKDROP_VERTEX,
        fragmentShader: BACKDROP_FRAGMENT,
    }), []);
    useEffect(() => () => mat.dispose(), [mat]);
    return <mesh geometry={BACKDROP_GEO} material={mat} scale={160} />;
};

/** Passa o sinal da coreografia (ligação, proteína G, Ca²⁺, fusão) para as uniformes, uma vez por quadro. */
const SignalClock = ({ timeRef, active }: { timeRef: { current: TimeState }; active: Side }) => {
    useFrame(({ clock }) => tickSignal(timeRef.current.t, clock.elapsedTime, active));
    return null;
};

/**
 * Cursor escrito direto no canvas (sem estado do React): "ajuda" sobre uma estrutura, "pegar" no vazio e
 * "agarrando" com o botão apertado.
 */
const CursorSync = () => {
    const get = useThree(s => s.get);
    useEffect(() => {
        const el = get().gl.domElement;
        let down = false;
        const apply = () => {
            el.style.cursor = down ? 'grabbing' : useStore.getState().hoveredObject ? 'help' : 'grab';
        };
        // o hover também escreve o cursor (depois de mudar o store): a escrita daqui vem por último
        const applyLater = () => queueMicrotask(apply);
        const onDown = (e: PointerEvent) => { if (e.button === 0) { down = true; apply(); } };
        const onUp = () => { if (down) { down = false; apply(); } };
        apply();
        const unsub = useStore.subscribe(applyLater);
        el.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        return () => {
            unsub();
            el.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            el.style.cursor = '';
        };
    }, [get]);
    return null;
};

export interface PeptideSceneProps {
    step: number;
    settled: number;
    ligand: PeptideLigand;
    reduced: boolean;
    onSettled: (step: number) => void;
    /** Tempo da aula, compartilhado com o painel (contador de amplificação). */
    timeRef: { current: TimeState };
}

export const PeptideScene = ({ step, settled, ligand, reduced, onSettled, timeRef }: PeptideSceneProps) => {
    const camera = useThree(s => s.camera);
    const controls = useThree(s => s.controls) as OrbitControlsImpl | null;
    const active = sideOf(ligand);
    const path = useMemo(() => buildCameraPath(PEPTIDE_STEPS, active > 0), [active]);

    useEffect(() => {
        if (!controls) return;
        const time = timeRef.current;
        const tw = TWEEN.current;
        const from = time.t;
        const d = step - from;
        tw.offP.copy(camera.position).sub(path.pos(from, new THREE.Vector3()));
        tw.offT.copy(controls.target).sub(path.tgt(from, new THREE.Vector3()));
        tw.active = true;
        tw.u = 0;
        const dist = Math.abs(d);
        const duration = reduced ? 0.35 : d > 0
            ? (dist <= 1.01 ? 4.4 : Math.min(2 + dist * 0.9, 6.5))
            : Math.min(1.3 + dist * 0.35, 3);
        const anim = gsap.to(time, {
            t: step,
            duration: Math.max(duration, 0.05),
            ease: 'power1.inOut',
            onUpdate: () => { tw.u = anim.progress(); },
            onComplete: () => { tw.active = false; onSettled(step); },
        });
        return () => {
            anim.kill();
            tw.active = false;
        };
    }, [step, controls, camera, path, reduced, onSettled, timeRef]);

    const labels = useMemo(() => (settled === step ? peptideLabelsForStep(step, active) : []), [settled, step, active]);

    return (
        <>
            <Backdrop />
            <fog attach="fog" args={['#05040c', 46, 120]} />
            <ambientLight intensity={0.35} color="#a5aad8" />
            <hemisphereLight args={['#c7d2fe', '#0b0b1a', 0.55]} />
            <directionalLight position={[8, 16, 14]} intensity={2.2} color="#f1f5ff" />
            <directionalLight position={[-10, 4, -16]} intensity={1.1} color="#fb7185" />
            <directionalLight position={[2, -14, 10]} intensity={0.55} color="#a5b4fc" />

            <SignalClock timeRef={timeRef} active={active} />
            <CursorSync />
            <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} minDistance={3} maxDistance={70} />
            <CameraRig timeRef={timeRef} tween={TWEEN} path={path} />

            <PepMembrane timeRef={timeRef} active={active} />
            <Gpcrs active={active} timeRef={timeRef} />
            <GProteins active={active} timeRef={timeRef} />
            <Effectors active={active} timeRef={timeRef} />
            <Messengers active={active} timeRef={timeRef} />
            <Granules timeRef={timeRef} />
            <Peptides active={active} timeRef={timeRef} />
            <BloodTag timeRef={timeRef} />

            {labels.map((l, i) => <Label3D key={`${step}-${ligand}-${l.id}`} spec={l} timeRef={timeRef} delay={0.08 + i * 0.12} />)}

            <EffectComposer multisampling={2}>
                <Bloom mipmapBlur luminanceThreshold={0.82} luminanceSmoothing={0.2} intensity={0.55} radius={0.55} />
                <Vignette offset={0.28} darkness={0.65} />
            </EffectComposer>
        </>
    );
};
