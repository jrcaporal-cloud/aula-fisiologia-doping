import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import gsap from 'gsap';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { PEPTIDE_STEPS, type PeptideLigand } from '../../../data/peptideSteps';
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

interface TweenState { active: boolean; u: number; offP: THREE.Vector3; offT: THREE.Vector3 }

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

/** Fundo: degradê escuro com um leve tom carmim (identidade da aula). */
const Backdrop = () => {
    const mat = useMemo(() => new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `varying vec3 vP; void main(){
            float h = vP.y * 0.5 + 0.5;
            vec3 c = mix(vec3(0.012,0.008,0.02), vec3(0.05,0.03,0.09), smoothstep(0.25, 0.95, h));
            c += vec3(0.09,0.01,0.03) * pow(max(vP.y, 0.0), 2.0) * 0.5;
            gl_FragColor = vec4(c, 1.0);
        }`,
    }), []);
    return <mesh material={mat} scale={160}><sphereGeometry args={[1, 32, 16]} /></mesh>;
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
    const tween = useRef<TweenState>({ active: false, u: 1, offP: new THREE.Vector3(), offT: new THREE.Vector3() });
    const camera = useThree(s => s.camera);
    const controls = useThree(s => s.controls) as OrbitControlsImpl | null;
    const active = sideOf(ligand);
    const path = useMemo(() => buildCameraPath(PEPTIDE_STEPS, active > 0), [active]);

    useEffect(() => {
        if (!controls) return;
        const time = timeRef.current;
        const tw = tween.current;
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
        return () => { anim.kill(); };
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

            <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} minDistance={3} maxDistance={70} />
            <CameraRig timeRef={timeRef} tween={tween} path={path} />

            <PepMembrane timeRef={timeRef} active={active} />
            <Gpcrs active={active} timeRef={timeRef} />
            <GProteins active={active} timeRef={timeRef} />
            <Effectors active={active} timeRef={timeRef} />
            <Messengers active={active} timeRef={timeRef} />
            <Granules timeRef={timeRef} />
            <Peptides active={active} timeRef={timeRef} />
            <BloodTag timeRef={timeRef} />

            {labels.map((l, i) => <Label3D key={`${step}-${ligand}-${l.id}`} spec={l} timeRef={timeRef} delay={0.08 + i * 0.12} />)}

            <EffectComposer multisampling={4}>
                <Bloom mipmapBlur luminanceThreshold={0.82} luminanceSmoothing={0.2} intensity={0.55} radius={0.55} />
                <Vignette offset={0.28} darkness={0.65} />
            </EffectComposer>
        </>
    );
};
