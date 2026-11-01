import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLYCOGEN_CENTERS, GLYCOGEN_PER_ROSETTE, seeded } from './layout';
import { GLUCOSE_COUNT, GState, type Engine } from './engine';

/** Glicose: anel hexagonal (piranose) verde. */
export const Glucose = ({ engine }: { engine: Engine }) => {
    const ref = useRef<THREE.InstancedMesh>(null);
    const geo = useMemo(() => new THREE.TorusGeometry(0.09, 0.033, 6, 6), []);
    const mat = useMemo(
        () => new THREE.MeshStandardMaterial({ color: '#34d399', emissive: '#10B981', emissiveIntensity: 0.9, roughness: 0.35, flatShading: true }),
        []
    );
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        const mesh = ref.current;
        if (!mesh) return;
        const g = engine.g;
        for (let i = 0; i < GLUCOSE_COUNT; i++) {
            const hidden = g.state[i] === GState.Stored;
            dummy.position.set(g.x[i], g.y[i], g.z[i]);
            const ph = g.phase[i] + engine.time * 0.9;
            dummy.rotation.set(ph, ph * 0.7, 0);
            dummy.scale.setScalar(hidden ? 0.0001 : Math.max(g.scale[i], 0.0001));
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
    });

    return <instancedMesh ref={ref} args={[geo, mat, GLUCOSE_COUNT]} frustumCulled={false} />;
};

const GLYCOGEN_TOTAL = GLYCOGEN_CENTERS.length * GLYCOGEN_PER_ROSETTE;

/** Glicogênio: rosetas de partículas que crescem conforme a glicose é armazenada. */
export const Glycogen = ({ engine }: { engine: Engine }) => {
    const ref = useRef<THREE.InstancedMesh>(null);
    const geo = useMemo(() => new THREE.IcosahedronGeometry(0.1, 1), []);
    const mat = useMemo(
        () => new THREE.MeshStandardMaterial({ color: '#a7f3d0', emissive: '#059669', emissiveIntensity: 0.55, roughness: 0.5 }),
        []
    );
    const offsets = useMemo(() => {
        const r = seeded(21);
        return Array.from({ length: GLYCOGEN_TOTAL }, (_, p) => {
            const rosette = p % GLYCOGEN_CENTERS.length;
            const member = Math.floor(p / GLYCOGEN_CENTERS.length);
            const [cx, cy, cz] = GLYCOGEN_CENTERS[rosette];
            const a = member * 2.4 + r() * 0.5;
            const rad = member === 0 ? 0 : 0.13 + r() * 0.08;
            const yy = (r() - 0.5) * 0.18;
            return [cx + Math.cos(a) * rad, cy + yy, cz + Math.sin(a) * rad, 0.75 + r() * 0.4] as const;
        });
    }, []);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame(() => {
        const mesh = ref.current;
        if (!mesh) return;
        // engine.glycogen já é suave: cada partícula cresce quando o nível passa por ela.
        const visible = engine.glycogen * GLYCOGEN_TOTAL;
        for (let p = 0; p < GLYCOGEN_TOTAL; p++) {
            const grow = Math.min(Math.max(visible - p, 0), 1);
            const [x, y, z, s] = offsets[p];
            dummy.position.set(x, y, z);
            dummy.scale.setScalar(Math.max(grow * s, 0.0001));
            dummy.updateMatrix();
            mesh.setMatrixAt(p, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
    });

    return <instancedMesh ref={ref} args={[geo, mat, GLYCOGEN_TOTAL]} frustumCulled={false} />;
};
