import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Membrane } from './Membrane';
import { FreeInsulin, Receptors } from './Receptors';
import { Glut4 } from './Glut4';
import { Glucose, Glycogen } from './Glucose';
import { SceneLabels } from './SceneLabels';
import { createEngine, stepEngine, type Engine, type Telemetry } from './engine';
import { seeded } from './layout';

export interface SceneProps {
    step: number;
    dose: number;
    reduced: boolean;
    telemetry: Telemetry;
    onTelemetry: (t: Telemetry) => void;
}

const LOOK_AT = new THREE.Vector3(0, -0.95, 0);
const CAMERA_POS: [number, number, number] = [0, 1.75, 10.4];

interface DriverProps {
    engine: Engine;
    step: number;
    dose: number;
    onTelemetry: (t: Telemetry) => void;
}

/**
 * Só para a bancada de teste (WebGL por software roda a poucos quadros/s):
 * `&simSpeed=8` acelera o tempo da simulação. Sem o parâmetro, tempo real.
 */
const TIME_SCALE = (() => {
    const v = Number(new URLSearchParams(window.location.search).get('simSpeed'));
    return Number.isFinite(v) && v > 0 ? Math.min(v, 40) : 1;
})();

/** Avança o motor antes de todos os outros useFrame (prioridade negativa não assume o render). */
const EngineDriver = ({ engine, step, dose, onTelemetry }: DriverProps) => {
    useFrame((_, delta) => {
        const t = stepEngine(engine, { step, dose }, delta, TIME_SCALE);
        if (t) onTelemetry(t);
    }, -1);
    return null;
};

/** Parallax discreto com o mouse: dá volume ao corte sem tirar o foco. */
const CameraRig = ({ reduced }: { reduced: boolean }) => {
    const target = useRef(new THREE.Vector3(...CAMERA_POS));
    useFrame(({ camera, pointer }, delta) => {
        const k = reduced ? 0 : 1;
        target.current.set(CAMERA_POS[0] + pointer.x * 0.7 * k, CAMERA_POS[1] + pointer.y * 0.35 * k, CAMERA_POS[2]);
        camera.position.lerp(target.current, Math.min(delta * 2, 1));
        camera.lookAt(LOOK_AT);
    });
    return null;
};

/** Fundo em degradê: sangue/interstício (carmim) acima da membrana, citoplasma (azul profundo) abaixo. */
const Backdrop = () => {
    const mat = useMemo(
        () =>
            new THREE.ShaderMaterial({
                depthWrite: false,
                uniforms: {},
                vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
                fragmentShader: `varying vec3 vW;
void main(){
  float y = vW.y;
  vec3 bloodNear = vec3(0.20, 0.035, 0.07);
  vec3 bloodFar  = vec3(0.06, 0.012, 0.03);
  vec3 cytoNear  = vec3(0.035, 0.085, 0.16);
  vec3 cytoFar   = vec3(0.012, 0.02, 0.05);
  vec3 c = y > 0.0 ? mix(bloodNear, bloodFar, smoothstep(0.0, 3.6, y)) : mix(cytoNear, cytoFar, smoothstep(0.0, 4.5, -y));
  float vign = smoothstep(14.0, 4.0, abs(vW.x));
  gl_FragColor = vec4(c * (0.55 + 0.45 * vign), 1.0);
}`,
            }),
        []
    );
    return (
        <mesh position={[0, -0.6, -3.4]} material={mat}>
            <planeGeometry args={[34, 16]} />
        </mesh>
    );
};

const makeErythrocyte = () => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 20; i++) {
        const t = i / 20;
        const h = 0.5 * Math.sqrt(Math.max(1 - t * t, 0)) * (0.2 + 2 * t * t - 1.1 * t ** 4);
        pts.push(new THREE.Vector2(t, Math.max(h, 0.04)));
    }
    for (let i = 20; i >= 0; i--) pts.push(new THREE.Vector2(pts[i].x, -pts[i].y));
    const g = new THREE.LatheGeometry(pts, 32);
    g.computeVertexNormals();
    return g;
};

const RBC_COUNT = 6;

/** Hemácias ao fundo: lembram que acima da membrana é o lado do sangue. */
const Erythrocytes = () => {
    const ref = useRef<THREE.InstancedMesh>(null);
    const geo = useMemo(() => makeErythrocyte(), []);
    const cells = useMemo(() => {
        const r = seeded(9);
        return Array.from({ length: RBC_COUNT }, (_, i) => ({
            x: -9 + i * 3.2 + r() * 1.5,
            y: 1.6 + r() * 1.2,
            z: -2.6 - r() * 0.5,
            rx: r() * Math.PI,
            ry: r() * Math.PI,
            s: 0.42 + r() * 0.15,
        }));
    }, []);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    useFrame((_, delta) => {
        const mesh = ref.current;
        if (!mesh) return;
        const dt = Math.min(delta, 0.05);
        cells.forEach((c, i) => {
            c.x += dt * 0.32;
            if (c.x > 10) c.x = -10;
            c.rx += dt * 0.12;
            dummy.position.set(c.x, c.y, c.z);
            dummy.rotation.set(c.rx, c.ry, 0.3);
            dummy.scale.setScalar(c.s);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
    });
    return (
        <instancedMesh ref={ref} args={[geo, undefined, RBC_COUNT]}>
            <meshStandardMaterial color="#9f1239" emissive="#4c0519" emissiveIntensity={0.3} roughness={0.5} />
        </instancedMesh>
    );
};

export const InsulinScene = ({ step, dose, reduced, telemetry, onTelemetry }: SceneProps) => {
    const engine = useMemo(() => createEngine(), []);
    return (
        <Canvas
            dpr={[1, 1.75]}
            resize={{ offsetSize: true }}
            camera={{ position: CAMERA_POS, fov: 36, near: 0.1, far: 60 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
            <color attach="background" args={['#050510']} />
            <fog attach="fog" args={['#070714', 11, 19]} />
            <ambientLight intensity={0.45} color="#c7d2fe" />
            <directionalLight position={[4, 9, 7]} intensity={1.9} color="#fff4e6" />
            <directionalLight position={[-6, 2, -6]} intensity={0.9} color="#93c5fd" />
            <pointLight position={[0, -2.6, 3]} intensity={6} distance={12} color="#38bdf8" />
            <pointLight position={[0, 2.6, 3]} intensity={4} distance={10} color="#fb7185" />

            <EngineDriver engine={engine} step={step} dose={dose} onTelemetry={onTelemetry} />
            <CameraRig reduced={reduced} />
            <Backdrop />
            <Erythrocytes />
            <Membrane engine={engine} reduced={reduced} />
            <Receptors engine={engine} />
            <Glut4 engine={engine} />
            <Glucose engine={engine} />
            <Glycogen engine={engine} />
            <FreeInsulin engine={engine} />
            <SceneLabels step={step} dose={dose} telemetry={telemetry} />

            <EffectComposer>
                <Bloom mipmapBlur intensity={0.55} luminanceThreshold={0.6} luminanceSmoothing={0.25} />
            </EffectComposer>
        </Canvas>
    );
};
