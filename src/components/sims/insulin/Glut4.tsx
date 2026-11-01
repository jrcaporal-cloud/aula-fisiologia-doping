import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CHANNELS, CHANNEL_RADIUS, VESICLE_RADIUS, VESICLE_REST } from './layout';
import { type Engine } from './engine';

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const STAVES = 7;
const PROTEINS = 6;

/** Direções fixas das proteínas GLUT4 na superfície da vesícula (espiral de Fibonacci). */
const proteinDirs = Array.from({ length: PROTEINS }, (_, k) => {
    const y = 1 - ((k + 0.5) / PROTEINS) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = k * 2.39996;
    return new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r);
});
const up = new THREE.Vector3(0, 1, 0);
const proteinQuats = proteinDirs.map(d => new THREE.Quaternion().setFromUnitVectors(up, d));

/** Ajusta brilho/opacidade de um material (mutação fora do corpo do componente). */
const setLook = (m: THREE.Material, emissive: number, opacity: number) => {
    if (m instanceof THREE.MeshStandardMaterial) m.emissiveIntensity = emissive;
    m.opacity = opacity;
};

interface UnitProps {
    engine: Engine;
    index: number;
}

const Glut4Unit = ({ engine, index }: UnitProps) => {
    const site = CHANNELS[index];
    const rest = VESICLE_REST[index];
    const vesicle = useRef<THREE.Group>(null);
    const channel = useRef<THREE.Group>(null);
    const mats = useMemo(
        () => ({
            shell: new THREE.MeshStandardMaterial({
                color: '#93c5fd',
                emissive: '#1d4ed8',
                emissiveIntensity: 0.25,
                roughness: 0.2,
                metalness: 0.1,
                transparent: true,
                opacity: 0.42,
                depthWrite: false,
            }),
            protein: new THREE.MeshStandardMaterial({ color: '#60A5FA', emissive: '#3b82f6', emissiveIntensity: 0.6, roughness: 0.3, transparent: true }),
            stave: new THREE.MeshStandardMaterial({ color: '#7cb8ff', emissive: '#3b82f6', emissiveIntensity: 0.9, roughness: 0.3 }),
            core: new THREE.MeshBasicMaterial({
                color: '#60A5FA',
                transparent: true,
                opacity: 0.35,
                side: THREE.DoubleSide,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                toneMapped: false,
            }),
            rim: new THREE.MeshBasicMaterial({ color: '#bfdbfe', toneMapped: false, transparent: true, opacity: 0.9 }),
        }),
        []
    );

    useFrame(() => {
        const v = engine.vesicle[index];
        const travel = ease(Math.min(v, 1));
        const fuse = Math.min(Math.max(v - 1, 0), 1);
        const g = vesicle.current;
        if (g) {
            const bob = Math.sin(engine.time * 0.9 + index * 1.7) * 0.06 * (1 - travel);
            const tx = rest[0] + (site.x - rest[0]) * travel + Math.sin(travel * Math.PI) * 0.25;
            const ty = rest[1] + (-0.66 - rest[1]) * travel + fuse * 0.4 + bob;
            const tz = rest[2] + (site.z - rest[2]) * travel;
            g.position.set(tx, ty, tz);
            g.scale.set(1 + fuse * 0.55, Math.max(1 - fuse * 0.9, 0.001), 1 + fuse * 0.55);
            g.visible = fuse < 0.98;
            // Sinal do Akt chegando: as vesículas "acendem" antes de subir.
            let act = 0;
            for (let r = 0; r < engine.act.length; r++) act = Math.max(act, engine.act[r]);
            const flicker = act > 0.85 && v < 0.05 ? 0.25 + 0.25 * Math.sin(engine.time * 5 + index) : 0;
            setLook(mats.shell, 0.25 + act * 0.35 + flicker, 0.42 * (1 - fuse));
            setLook(mats.protein, 0.6, 1 - fuse);
        }
        const c = channel.current;
        if (c) {
            const s = Math.max(ease(fuse), 0.001);
            c.scale.set(s, s, s);
            c.visible = fuse > 0.01;
            const pulse = engine.channelPulse[index];
            setLook(mats.stave, 0.9 + pulse * 1.8, 1);
            setLook(mats.rim, 0, 0.5 + pulse * 0.5);
            setLook(mats.core, 0, 0.3 + pulse * 0.45);
        }
    });

    return (
        <group>
            <group ref={vesicle} position={rest}>
                <mesh material={mats.shell}>
                    <sphereGeometry args={[VESICLE_RADIUS, 28, 20]} />
                </mesh>
                {proteinQuats.map((q, k) => (
                    <mesh
                        key={k}
                        material={mats.protein}
                        position={proteinDirs[k].clone().multiplyScalar(VESICLE_RADIUS)}
                        quaternion={q}
                    >
                        <capsuleGeometry args={[0.06, 0.16, 3, 8]} />
                    </mesh>
                ))}
            </group>
            <group ref={channel} position={[site.x, 0, site.z]} visible={false}>
                {Array.from({ length: STAVES }, (_, k) => {
                    const a = (k / STAVES) * Math.PI * 2;
                    return (
                        <mesh
                            key={k}
                            material={mats.stave}
                            position={[Math.cos(a) * CHANNEL_RADIUS, 0, Math.sin(a) * CHANNEL_RADIUS]}
                            rotation={[Math.sin(a) * 0.18, 0, -Math.cos(a) * 0.18]}
                        >
                            <capsuleGeometry args={[0.09, 0.78, 4, 8]} />
                        </mesh>
                    );
                })}
                <mesh material={mats.core}>
                    <cylinderGeometry args={[CHANNEL_RADIUS - 0.04, CHANNEL_RADIUS - 0.04, 1.05, 20, 1, true]} />
                </mesh>
                <mesh position={[0, 0.56, 0]} rotation={[-Math.PI / 2, 0, 0]} material={mats.rim}>
                    <torusGeometry args={[CHANNEL_RADIUS + 0.06, 0.04, 6, 32]} />
                </mesh>
            </group>
        </group>
    );
};

export const Glut4 = ({ engine }: { engine: Engine }) => (
    <group>
        {CHANNELS.map((_, i) => (
            <Glut4Unit key={i} engine={engine} index={i} />
        ))}
    </group>
);
