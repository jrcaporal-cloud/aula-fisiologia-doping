import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import gsap from 'gsap';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { STEPS } from '../../../data/steps';
import { DNA } from './DNA';
import { Label3D } from './Label3D';
import { labelsForStep } from './labels';
import { Ligands } from './Ligands';
import { Membrane } from './Membrane';
import { AR_REST, DIMER_FORM, NUCLEUS_CENTER, NUCLEUS_R, SARC_CENTER, memX, porePoint, rng, smoother } from './layout';
import { finalRiboPose } from './choreo';
import type { LigandKind } from './molecules';
import { Nucleus } from './Nucleus';
import { Receptors } from './Receptor';
import { SPHERE_LO } from './geometry';
import { Sarcomere } from './Sarcomere';
import { Transcription } from './Transcription';
import { Translation } from './Translation';
import type { TimeState } from './types';

const LAST = STEPS.length - 1;
const v3 = (a: [number, number, number]) => new THREE.Vector3(...a);

interface TweenState { active: boolean; u: number; offP: THREE.Vector3; offT: THREE.Vector3 }

/** Poses-chave da câmera: uma por etapa (em T = k) e, se houver, uma intermediária (em T = k − 0,5). */
const buildCameraPath = () => {
    const keys: { t: number; p: THREE.Vector3; q: THREE.Vector3 }[] = [];
    STEPS.forEach((s, k) => {
        if (s.via) keys.push({ t: k - 0.5, p: v3(s.via.position), q: v3(s.via.target) });
        keys.push({ t: k, p: v3(s.cameraPosition), q: v3(s.cameraTarget) });
    });
    const pos = new THREE.CatmullRomCurve3(keys.map(k => k.p), false, 'centripetal');
    const tgt = new THREE.CatmullRomCurve3(keys.map(k => k.q), false, 'centripetal');
    const n = keys.length - 1;
    /** T → parâmetro uniforme por segmento da spline. */
    const u = (T: number) => {
        const x = Math.min(Math.max(T, 0), LAST);
        let i = 0;
        while (i < n - 1 && keys[i + 1].t < x) i++;
        const span = keys[i + 1].t - keys[i].t || 1;
        return Math.min((i + (x - keys[i].t) / span) / n, 1);
    };
    return {
        pos: (T: number, out: THREE.Vector3) => pos.getPoint(u(T), out),
        tgt: (T: number, out: THREE.Vector3) => tgt.getPoint(u(T), out),
    };
};
type CameraPath = ReturnType<typeof buildCameraPath>;

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

const Backdrop = () => {
    const mat = useMemo(() => new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: {},
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `varying vec3 vP; void main(){
            float h = vP.y * 0.5 + 0.5;
            vec3 c = mix(vec3(0.008,0.008,0.02), vec3(0.04,0.035,0.11), smoothstep(0.2, 0.95, h));
            c += vec3(0.05,0.02,0.07) * pow(max(vP.x, 0.0), 3.0) * 0.6;
            gl_FragColor = vec4(c, 1.0);
        }`,
    }), []);
    return <mesh material={mat} scale={160}><sphereGeometry args={[1, 32, 16]} /></mesh>;
};

const KEEP_CLEAR = [...AR_REST, DIMER_FORM, finalRiboPose.p, porePoint(0, NUCLEUS_R + 3), ...STEPS.map(s => v3(s.cameraPosition))];

/** Partículas do citosol (outras proteínas) para dar profundidade. */
const Cytosol = () => {
    const ref = useRef<THREE.InstancedMesh>(null);
    const pts = useMemo(() => {
        const rand = rng(77);
        const out: { p: THREE.Vector3; r: number }[] = [];
        while (out.length < 320) {
            const p = new THREE.Vector3(-4 + rand() * 18, -15 + rand() * 25, -11 + rand() * 20);
            if (p.distanceTo(NUCLEUS_CENTER) < NUCLEUS_R + 1) continue;
            if (p.x > memX(p.y, p.z) - 1.4) continue;
            if (KEEP_CLEAR.some(c => c.distanceTo(p) < 4.6)) continue;
            if (Math.abs(p.x - SARC_CENTER.x) < 6.5 && Math.hypot(p.y - SARC_CENTER.y, p.z - SARC_CENTER.z) < 3.6) continue;
            out.push({ p, r: 0.04 + rand() * 0.08 });
        }
        return out;
    }, []);
    useEffect(() => {
        const m = ref.current;
        if (!m) return;
        const mat = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        pts.forEach((x, i) => m.setMatrixAt(i, mat.compose(x.p, q, new THREE.Vector3(x.r, x.r, x.r))));
        m.instanceMatrix.needsUpdate = true;
    }, [pts]);
    return (
        <instancedMesh ref={ref} args={[SPHERE_LO, undefined, pts.length]} frustumCulled={false}>
            <meshStandardMaterial color="#475569" emissive="#1e293b" emissiveIntensity={0.6} roughness={0.8} />
        </instancedMesh>
    );
};

export interface ReceptorSceneProps {
    step: number;
    settled: number;
    ligand: LigandKind;
    reduced: boolean;
    onSettled: (step: number) => void;
}

export const ReceptorScene = ({ step, settled, ligand, reduced, onSettled }: ReceptorSceneProps) => {
    const timeRef = useRef<TimeState>({ t: step });
    const tween = useRef<TweenState>({ active: false, u: 1, offP: new THREE.Vector3(), offT: new THREE.Vector3() });
    const camera = useThree(s => s.camera);
    const controls = useThree(s => s.controls) as OrbitControlsImpl | null;
    const path = useMemo(() => buildCameraPath(), []);

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
            ? (dist <= 1.01 ? 4.6 : Math.min(2 + dist * 0.9, 6.5))
            : Math.min(1.3 + dist * 0.35, 3);
        const anim = gsap.to(time, {
            t: step,
            duration: Math.max(duration, 0.05),
            ease: 'power1.inOut',
            onUpdate: () => { tw.u = anim.progress(); },
            onComplete: () => { tw.active = false; onSettled(step); },
        });
        return () => { anim.kill(); };
    }, [step, controls, camera, path, reduced, onSettled]);

    const labels = useMemo(() => (settled === step ? labelsForStep(step, ligand) : []), [settled, step, ligand]);

    return (
        <>
            <Backdrop />
            <fog attach="fog" args={['#05050f', 46, 120]} />
            <ambientLight intensity={0.35} color="#9aa3d8" />
            <hemisphereLight args={['#c7d2fe', '#0b0b1a', 0.55]} />
            <directionalLight position={[10, 16, 14]} intensity={2.3} color="#f1f5ff" />
            <directionalLight position={[-10, 6, -16]} intensity={1.2} color="#c084fc" />
            <directionalLight position={[2, -12, 10]} intensity={0.45} color="#22d3ee" />

            <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.08} minDistance={3} maxDistance={70} />
            <CameraRig timeRef={timeRef} tween={tween} path={path} />

            <Membrane timeRef={timeRef} />
            <Ligands timeRef={timeRef} ligand={ligand} />
            <Receptors timeRef={timeRef} ligand={ligand} />
            <Nucleus />
            <DNA timeRef={timeRef} />
            <Transcription timeRef={timeRef} />
            <Translation timeRef={timeRef} />
            <Sarcomere timeRef={timeRef} />
            <Cytosol />

            {labels.map((l, i) => <Label3D key={`${step}-${ligand}-${l.id}`} spec={l} timeRef={timeRef} delay={0.08 + i * 0.12} />)}

            <EffectComposer multisampling={4}>
                <Bloom mipmapBlur luminanceThreshold={0.82} luminanceSmoothing={0.2} intensity={0.55} radius={0.55} />
                <Vignette offset={0.28} darkness={0.7} />
            </EffectComposer>
        </>
    );
};
