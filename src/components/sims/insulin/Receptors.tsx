import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { BLOOD, RECEPTORS, cascadePoints, seeded } from './layout';
import { insulinGeometry, insulinMaterial } from './insulinMesh';
import { FREE_INSULIN_COUNT, boundInsulinPosition, type Engine } from './engine';

const ARM_OPEN = 0.5;
const ARM_CLOSED = 0.13;
const PULSES = 3;

const smooth = (a: number, b: number, v: number) => {
    const t = Math.min(Math.max((v - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
};


interface ReceptorProps {
    engine: Engine;
    index: number;
}

const Receptor = ({ engine, index }: ReceptorProps) => {
    const site = RECEPTORS[index];
    const pts = cascadePoints(site);
    const leftArm = useRef<THREE.Group>(null);
    const rightArm = useRef<THREE.Group>(null);
    const insulin = useRef<THREE.Mesh>(null);
    const pulseRefs = useRef<(THREE.Mesh | null)[]>([]);
    const ring = useRef<THREE.Mesh>(null);
    const pos = useMemo<[number, number, number]>(() => [0, 0, 0], []);

    const mats = useMemo(
        () => ({
            alpha: new THREE.MeshStandardMaterial({ color: '#34D399', emissive: '#059669', emissiveIntensity: 0.25, roughness: 0.35 }),
            beta: new THREE.MeshStandardMaterial({ color: '#10B981', emissive: '#065f46', emissiveIntensity: 0.3, roughness: 0.4 }),
            kinase: new THREE.MeshStandardMaterial({ color: '#10B981', emissive: '#10B981', emissiveIntensity: 0.15, roughness: 0.3 }),
            tube: new THREE.MeshStandardMaterial({ color: '#1e1b4b', emissive: '#A855F7', emissiveIntensity: 0, roughness: 0.5, transparent: true, opacity: 0.55 }),
            pi3k: new THREE.MeshStandardMaterial({ color: '#7e22ce', emissive: '#A855F7', emissiveIntensity: 0.1, roughness: 0.3 }),
            akt: new THREE.MeshStandardMaterial({ color: '#0e7490', emissive: '#22D3EE', emissiveIntensity: 0.1, roughness: 0.3 }),
            pulse: new THREE.MeshBasicMaterial({ color: '#f0abfc', toneMapped: false }),
            ring: new THREE.MeshBasicMaterial({ color: '#22D3EE', transparent: true, opacity: 0, toneMapped: false, depthWrite: false }),
            insulin: insulinMaterial(),
        }),
        []
    );

    const curve = useMemo(
        () =>
            new THREE.CatmullRomCurve3([
                new THREE.Vector3(...pts.kinase),
                new THREE.Vector3(pts.kinase[0] + 0.22, pts.kinase[1] - 0.35, pts.kinase[2]),
                new THREE.Vector3(...pts.pi3k),
                new THREE.Vector3(pts.pi3k[0] + 0.3, pts.pi3k[1] - 0.3, pts.pi3k[2]),
                new THREE.Vector3(...pts.akt),
            ]),
        // pts depende só do índice fixo do receptor.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [index]
    );
    const tubeGeo = useMemo(() => new THREE.TubeGeometry(curve, 48, 0.035, 6, false), [curve]);
    const tmp = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        const b = engine.bound[index];
        const act = engine.act[index];
        const close = smooth(0.72, 1, b);
        const angle = ARM_OPEN + (ARM_CLOSED - ARM_OPEN) * close;
        if (leftArm.current) leftArm.current.rotation.z = angle;
        if (rightArm.current) rightArm.current.rotation.z = -angle;
        mats.alpha.emissiveIntensity = 0.25 + close * 0.6;
        mats.kinase.emissiveIntensity = 0.15 + smooth(0.85, 1, b) * 1.6;
        mats.tube.emissiveIntensity = act * 1.2;
        mats.pi3k.emissiveIntensity = 0.1 + smooth(0.25, 0.55, act) * 2.2;
        mats.akt.emissiveIntensity = 0.1 + smooth(0.55, 0.9, act) * 2.2;

        if (insulin.current) {
            boundInsulinPosition(index, b, pos);
            insulin.current.position.set(pos[0], pos[1], pos[2]);
            insulin.current.scale.setScalar(Math.max(smooth(0, 0.12, b), 0.0001));
            insulin.current.rotation.set(engine.time * 0.6 * (1 - close), engine.time * 0.8 * (1 - close) + index, 0);
        }

        pulseRefs.current.forEach((m, k) => {
            if (!m) return;
            const u = (engine.time * 0.55 + k / PULSES + index * 0.13) % 1;
            curve.getPointAt(u, tmp);
            m.position.copy(tmp);
            m.scale.setScalar(Math.max(act * (0.6 + 0.4 * Math.sin(u * Math.PI)), 0.0001));
        });

        if (ring.current) {
            const u = (engine.time * 0.6 + index * 0.25) % 1;
            const on = smooth(0.8, 1, act);
            ring.current.scale.setScalar(0.3 + u * 2.4);
            mats.ring.opacity = on * (1 - u) * 0.7;
        }
    });

    return (
        <group>
            <group position={[site.x, 0, site.z]}>
                {/* β: atravessa a bicamada */}
                {[-0.1, 0.1].map(x => (
                    <mesh key={x} position={[x, 0, 0]} material={mats.beta}>
                        <cylinderGeometry args={[0.07, 0.07, 1.0, 10]} />
                    </mesh>
                ))}
                {/* Ponte dissulfeto entre as metades */}
                <mesh position={[0, 0.5, 0]} material={mats.alpha}>
                    <capsuleGeometry args={[0.08, 0.2, 4, 10]} />
                </mesh>
                {/* α: braços extracelulares que fecham sobre a insulina */}
                <group ref={leftArm} position={[-0.1, 0.52, 0]} rotation={[0, 0, ARM_OPEN]}>
                    <mesh position={[0, 0.3, 0]} material={mats.alpha}>
                        <capsuleGeometry args={[0.1, 0.42, 4, 12]} />
                    </mesh>
                    <mesh position={[0.04, 0.6, 0]} material={mats.alpha}>
                        <sphereGeometry args={[0.13, 14, 12]} />
                    </mesh>
                </group>
                <group ref={rightArm} position={[0.1, 0.52, 0]} rotation={[0, 0, -ARM_OPEN]}>
                    <mesh position={[0, 0.3, 0]} material={mats.alpha}>
                        <capsuleGeometry args={[0.1, 0.42, 4, 12]} />
                    </mesh>
                    <mesh position={[-0.04, 0.6, 0]} material={mats.alpha}>
                        <sphereGeometry args={[0.13, 14, 12]} />
                    </mesh>
                </group>
                {/* Domínios tirosina quinase (intracelulares) */}
                {[-0.15, 0.15].map(x => (
                    <mesh key={x} position={[x, -0.68, 0]} material={mats.kinase}>
                        <sphereGeometry args={[0.17, 16, 12]} />
                    </mesh>
                ))}
            </group>

            {/* Cascata PI3K → Akt */}
            <mesh geometry={tubeGeo} material={mats.tube} />
            <mesh position={pts.pi3k} material={mats.pi3k}>
                <dodecahedronGeometry args={[0.16, 0]} />
            </mesh>
            <mesh position={pts.akt} material={mats.akt}>
                <octahedronGeometry args={[0.17, 0]} />
            </mesh>
            {Array.from({ length: PULSES }, (_, k) => (
                <mesh
                    key={k}
                    ref={m => {
                        pulseRefs.current[k] = m;
                    }}
                    material={mats.pulse}
                >
                    <sphereGeometry args={[0.06, 10, 8]} />
                </mesh>
            ))}
            {/* Sinal do Akt irradiando para as vesículas de GLUT4 */}
            <mesh ref={ring} position={pts.akt} rotation={[-Math.PI / 2, 0, 0]} material={mats.ring}>
                <torusGeometry args={[0.5, 0.025, 6, 48]} />
            </mesh>

            <mesh ref={insulin} geometry={insulinGeometry} material={mats.insulin} scale={0.0001} />
        </group>
    );
};

export const Receptors = ({ engine }: { engine: Engine }) => (
    <group>
        {RECEPTORS.map((_, i) => (
            <Receptor key={i} engine={engine} index={i} />
        ))}
    </group>
);

/** Insulina que sobra no sangue quando todos os receptores já estão ocupados. */
export const FreeInsulin = ({ engine }: { engine: Engine }) => {
    const ref = useRef<THREE.InstancedMesh>(null);
    const mat = useMemo(() => insulinMaterial(), []);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const spin = useMemo(() => {
        const r = seeded(3);
        return Array.from({ length: FREE_INSULIN_COUNT }, () => [r() - 0.5, r() - 0.5] as const);
    }, []);

    useFrame(() => {
        const mesh = ref.current;
        if (!mesh) return;
        const f = engine.free;
        for (let i = 0; i < FREE_INSULIN_COUNT; i++) {
            const ph = f.phase[i] + engine.time * 0.6;
            dummy.position.set(
                f.x[i],
                Math.min(f.baseY[i] + Math.sin(ph) * 0.18, BLOOD.maxY),
                f.baseZ[i] + Math.cos(ph * 0.7) * 0.2
            );
            dummy.rotation.set(engine.time * spin[i][0] * 2, engine.time * spin[i][1] * 2, 0);
            dummy.scale.setScalar(Math.max(f.scale[i], 0.0001));
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
    });

    return <instancedMesh ref={ref} args={[insulinGeometry, mat, FREE_INSULIN_COUNT]} />;
};
