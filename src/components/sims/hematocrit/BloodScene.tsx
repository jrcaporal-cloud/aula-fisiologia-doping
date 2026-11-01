import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { FlowSim } from './flowSim';
import { LUMEN_R, THROMBUS_X, WALL_THICKNESS, makeErythrocyteGeometry } from './geometry';
import { HCT_EPO_LOW, HCT_MAX, HCT_MIN, aggregation, flowRel, pulseWave, sleepFlowFactor } from './model';
import type { LiveStore } from './liveStore';
import { Thrombus } from './Thrombus';
import { VesselWall, type WallInputs } from './VesselWall';

/** Hemácias em 65% de hematócrito; o número visível é proporcional ao hematócrito. */
const MAX_CELLS = 540;
const cellsFor = (hct: number) => Math.round((MAX_CELLS * hct) / HCT_MAX);

/** Tempo de formação do microtrombo (s) e de desfazê-lo ao sair do cenário de risco. */
const GROW_TIME = 6;
const UNDO_TIME = 2.2;
const MAX_SUBSTEP = 1 / 20;
const DPR_RANGE = [1, 1.75] as const;

export interface BloodSceneProps {
    hct: number;
    sleep: boolean;
    alert: boolean;
    live: LiveStore;
    onAlertChange: (alert: boolean) => void;
}

interface SimState {
    hct: number;
    sleepBlend: number;
    occlusion: number;
    alert: boolean;
    time: number;
}

const Blood = ({ hct, sleep, live, onAlertChange }: Omit<BloodSceneProps, 'alert'>) => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const geometry = useMemo(() => makeErythrocyteGeometry(), []);
    const sim = useMemo(() => new FlowSim(MAX_CELLS), []);
    useEffect(() => () => geometry.dispose(), [geometry]);
    const state = useRef<SimState>({ hct, sleepBlend: sleep ? 1 : 0, occlusion: 0, alert: false, time: 0 });
    const getProgress = useMemo(() => () => state.current.occlusion, []);
    const wallInputs = useRef<WallInputs>({ thickness: 0, danger: 0 });
    const getWallInputs = useMemo(() => () => wallInputs.current, []);

    useFrame((_, delta) => {
        // Subpassos de no máx. 50 ms: a simulação acompanha o tempo real mesmo com quadros lentos.
        const total = Math.min(delta, 0.5);
        const n = Math.max(1, Math.ceil(total / MAX_SUBSTEP));
        const s = state.current;
        let flow = 1;
        let agg = 0;
        for (let k = 0; k < n; k++) {
            const dt = total / n;
            s.time += dt;
            s.hct += (hct - s.hct) * Math.min(dt * 4, 1);
            s.sleepBlend += ((sleep ? 1 : 0) - s.sleepBlend) * Math.min(dt * 2.5, 1);

            // Estase: no sono (FC ~30 bpm) com hematócrito na faixa rhEPO o microtrombo se forma.
            const risk = sleep && s.hct >= HCT_EPO_LOW - 0.25 && s.sleepBlend > 0.85;
            s.occlusion = risk ? Math.min(s.occlusion + dt / GROW_TIME, 1) : Math.max(s.occlusion - dt / UNDO_TIME, 0);

            const sleepFactor = 1 + (sleepFlowFactor(s.time) - 1) * s.sleepBlend;
            flow = flowRel(s.hct) * sleepFactor * (1 - 0.94 * s.occlusion);
            agg = Math.min(aggregation(s.hct) + s.occlusion * 0.4, 1);
            sim.step(dt, { count: cellsFor(s.hct), flow, aggregation: agg, occlusion: s.occlusion });
        }
        if (meshRef.current) sim.write(meshRef.current, agg);

        const nextAlert = s.alert ? s.occlusion > 0.35 : s.occlusion > 0.55;
        if (nextAlert !== s.alert) {
            s.alert = nextAlert;
            onAlertChange(nextAlert);
        }

        const beat = s.sleepBlend > 0.01 ? pulseWave(s.time) : 0;
        wallInputs.current = {
            thickness: THREE.MathUtils.clamp((s.hct - HCT_MIN) / (HCT_MAX - HCT_MIN), 0, 1),
            danger: s.occlusion,
        };
        live.write({ flow, occlusion: s.occlusion, beat: beat * s.sleepBlend });
    });

    return (
        <>
            <instancedMesh ref={meshRef} args={[geometry, undefined, MAX_CELLS]} frustumCulled={false}>
                <meshPhysicalMaterial
                    color="#c8162f"
                    emissive="#4c0519"
                    emissiveIntensity={0.6}
                    roughness={0.48}
                    metalness={0}
                    clearcoat={0.18}
                    clearcoatRoughness={0.35}
                />
            </instancedMesh>
            <Thrombus getProgress={getProgress} />
            <VesselWall getInputs={getWallInputs} />
        </>
    );
};

const ThrombusLabel = ({ visible }: { visible: boolean }) => (
    <Html position={[THROMBUS_X, LUMEN_R + WALL_THICKNESS + 0.3, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div
            className="flex flex-col items-center transition-all duration-500"
            style={{ opacity: visible ? 1 : 0, transform: `translateY(${visible ? 0 : 8}px)` }}
        >
            <div className="whitespace-nowrap rounded-lg border border-brand-red/70 bg-[rgba(40,4,14,0.88)] px-3 py-1 font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-rose-100 shadow-[0_0_24px_rgba(225,29,72,0.55)]">
                Microtrombo
            </div>
            <div className="h-5 w-px bg-gradient-to-b from-brand-red to-transparent" />
        </div>
    </Html>
);

const Lights = () => (
    <>
        <ambientLight intensity={0.35} color="#5b2340" />
        <directionalLight position={[2.5, 6, 7]} intensity={2.4} color="#ffe4ea" />
        <directionalLight position={[-5, -2, -6]} intensity={0.8} color="#60a5fa" />
        <pointLight position={[-3, 0, 0]} intensity={4} distance={7} decay={1.5} color="#ff4d6d" />
        <pointLight position={[3.5, 0.4, 0.3]} intensity={2.5} distance={6} decay={1.5} color="#ff6b81" />
    </>
);

/** Vaso em corte longitudinal com hemácias em escoamento laminar. */
/**
 * O palco da aula aplica `transform: scale`. Medimos pelo offsetSize (sem a escala) e
 * compensamos a escala no DPR, dentro da faixa [1, 1.75], para não borrar no projetor.
 */
const useStageDpr = () => {
    const ref = useRef<HTMLDivElement>(null);
    const [dpr, setDpr] = useState(1);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => {
            const scale = el.offsetWidth > 0 ? el.getBoundingClientRect().width / el.offsetWidth : 1;
            const next = Math.min(Math.max(window.devicePixelRatio * scale, DPR_RANGE[0]), DPR_RANGE[1]);
            setDpr(prev => (Math.abs(prev - next) > 0.05 ? next : prev));
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        window.addEventListener('resize', update);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', update);
        };
    }, []);
    return { ref, dpr };
};

export const BloodScene = (props: BloodSceneProps) => {
    const { ref, dpr } = useStageDpr();
    return (
        <div ref={ref} className="absolute inset-0">
            <SceneCanvas {...props} dpr={dpr} />
        </div>
    );
};

const SceneCanvas = ({ hct, sleep, alert, live, onAlertChange, dpr }: BloodSceneProps & { dpr: number }) => (
    <Canvas
        dpr={dpr}
        resize={{ offsetSize: true, scroll: false }}
        camera={{ position: [-0.3, 1.75, 9.4], fov: 30, near: 0.1, far: 60 }}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        onCreated={({ camera }) => camera.lookAt(0, -0.08, 0)}
    >
        <color attach="background" args={['#050510']} />
        <fog attach="fog" args={['#050510', 9, 20]} />
        <Lights />
        <Blood hct={hct} sleep={sleep} live={live} onAlertChange={onAlertChange} />
        <ThrombusLabel visible={alert} />
        <EffectComposer multisampling={4}>
            <Bloom intensity={0.7} luminanceThreshold={0.62} luminanceSmoothing={0.2} mipmapBlur radius={0.65} />
            <Vignette offset={0.28} darkness={0.72} />
        </EffectComposer>
    </Canvas>
);
