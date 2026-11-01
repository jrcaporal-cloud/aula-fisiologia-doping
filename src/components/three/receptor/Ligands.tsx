import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ligandPose, makePose } from './choreo';
import { V } from './layout';
import { MOLECULES, type LigandKind } from './molecules';
import { LIGANDS } from './ligandInfo';
import { BallStick, Glow } from './primitives';
import type { TimeRef } from './types';
import { useHover } from './useHover';

interface LigandsProps { timeRef: TimeRef; ligand: LigandKind }

const DRIFTERS = [V(20.5, 5.2, -3.5), V(23.5, -5.5, 2.5), V(19.5, 0.5, -6.5), V(24.5, 3.2, 6.5)];

const Main = ({ index, timeRef, ligand }: LigandsProps & { index: number }) => {
    const ref = useRef<THREE.Group>(null);
    const pose = useMemo(() => makePose(), []);
    const info = LIGANDS[ligand];
    const hover = useHover(info.name, `${info.family}. ${info.fit}`);
    useFrame(({ clock }) => {
        if (!ref.current) return;
        ligandPose(index, timeRef.current.t, clock.elapsedTime, pose);
        ref.current.position.copy(pose.p);
        ref.current.quaternion.copy(pose.q);
    });
    return (
        <group ref={ref}>
            <BallStick key={ligand} data={MOLECULES[ligand]} />
            <Glow color={info.color} size={3.2} opacity={0.32} />
            <mesh {...hover} scale={1.1}>
                <sphereGeometry args={[1, 8, 6]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
        </group>
    );
};

/** Moléculas livres no meio extracelular (contexto: o hormônio circula fora da célula). */
const Drifter = ({ index, ligand }: { index: number; ligand: LigandKind }) => {
    const ref = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        const g = ref.current;
        if (!g) return;
        const t = clock.elapsedTime * 0.35 + index * 1.7;
        g.position.copy(DRIFTERS[index]).add(V(Math.sin(t) * 0.8, Math.cos(t * 0.8) * 0.6, Math.sin(t * 0.6) * 0.7));
        g.rotation.set(t * 0.9, t * 0.6, t * 0.4);
    });
    return (
        <group ref={ref}>
            <BallStick key={ligand} data={MOLECULES[ligand]} />
            <Glow color={LIGANDS[ligand].color} size={2.8} opacity={0.22} />
        </group>
    );
};

export const Ligands = ({ timeRef, ligand }: LigandsProps) => (
    <>
        <Main index={0} timeRef={timeRef} ligand={ligand} />
        <Main index={1} timeRef={timeRef} ligand={ligand} />
        {DRIFTERS.map((_, i) => <Drifter key={i} index={i} ligand={ligand} />)}
    </>
);
