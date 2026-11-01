import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { bubbleState } from './choreo';
import { ARE_HALF, ARE_Z, DNA_BP, DNA_CENTER, DNA_R, DNA_RISE, ph, smooth } from './layout';
import { SPHERE_LO, STICK_GEO, stickMatrix } from './geometry';
import type { TimeRef } from './types';
import { useHover } from './useHover';

/*
 * Dupla-hélice B (10,5 pb por volta, sulcos maior/menor), contas de fosfato + bases como meias-varetas.
 * O ARE fica destacado; a bolha de transcrição abre localmente onde está a RNA polimerase.
 */

const TWIST = (Math.PI * 2) / 10.5;
const GROOVE = (155 * Math.PI) / 180;
const zOf = (i: number) => (i - (DNA_BP - 1) / 2) * DNA_RISE;
const isARE = (i: number) => Math.abs(zOf(i) - ARE_Z) <= ARE_HALF;

const COL = {
    s1: new THREE.Color('#818cf8'),
    s2: new THREE.Color('#a5b4fc'),
    base: new THREE.Color('#5b6b8c'),
    gene: new THREE.Color('#7387ad'),
    are: new THREE.Color('#f0abfc').multiplyScalar(1.6),
    areBase: new THREE.Color('#e879f9').multiplyScalar(1.25),
    read: new THREE.Color('#f9a8d4'),
};

const tmpM = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const sc = new THREE.Vector3();

export const DNA = ({ timeRef }: { timeRef: TimeRef }) => {
    const beads = useRef<THREE.InstancedMesh>(null);
    const sticks = useRef<THREE.InstancedMesh>(null);
    const rungs = useRef<THREE.InstancedMesh>(null);
    const pts = useMemo(() => Array.from({ length: DNA_BP * 2 }, () => new THREE.Vector3()), []);
    const mids = useMemo(() => Array.from({ length: DNA_BP }, () => new THREE.Vector3()), []);
    const lastT = useRef(-1);
    const hover = useHover('DNA · elemento de resposta androgênica (ARE)', 'Sequência do promotor reconhecida pelo dímero AR–ligante. A ligação ao ARE recruta coativadores (SRC-1) e a maquinaria de transcrição.');

    useLayoutEffect(() => {
        const b = beads.current;
        const s = sticks.current;
        const r = rungs.current;
        if (!b || !s || !r) return;
        for (let i = 0; i < DNA_BP; i++) {
            const are = isARE(i);
            b.setColorAt(i * 2, are ? COL.are : COL.s1);
            b.setColorAt(i * 2 + 1, are ? COL.are : COL.s2);
            r.setColorAt(i * 2, are ? COL.areBase : COL.base);
            r.setColorAt(i * 2 + 1, are ? COL.areBase : COL.base);
        }
        for (let i = 0; i < (DNA_BP - 1) * 2; i++) s.setColorAt(i, isARE(i >> 1) ? COL.are : COL.s1);
        [b, s, r].forEach(x => { if (x.instanceColor) x.instanceColor.needsUpdate = true; });
    }, []);

    useFrame(() => {
        const T = timeRef.current.t;
        if (Math.abs(T - lastT.current) < 1e-5) return;
        lastT.current = T;
        const b = beads.current;
        const s = sticks.current;
        const r = rungs.current;
        if (!b || !s || !r) return;
        const { z: zb, open } = bubbleState(T);
        const readTo = zb;
        const reading = ph(T, [5.12, 5.3]);
        for (let i = 0; i < DNA_BP; i++) {
            const z = zOf(i);
            const d = (z - zb) / 1.9;
            const g = open * Math.exp(-d * d * 2.2);
            const th = i * TWIST;
            const rad = DNA_R * (1 + 0.7 * g);
            // na bolha, as fitas também se afastam verticalmente (molde para baixo)
            pts[i * 2].set(Math.cos(th) * rad, Math.sin(th) * rad + g * 0.55, z).add(DNA_CENTER);
            pts[i * 2 + 1].set(Math.cos(th + GROOVE) * rad, Math.sin(th + GROOVE) * rad - g * 0.55, z).add(DNA_CENTER);
            mids[i].addVectors(pts[i * 2], pts[i * 2 + 1]).multiplyScalar(0.5);
            const isAre = isARE(i);
            const br = isAre ? 0.23 : 0.2;
            for (let k = 0; k < 2; k++) {
                tmpM.compose(pts[i * 2 + k], q0, sc.set(br, br, br));
                b.setMatrixAt(i * 2 + k, tmpM);
                const end = sc.copy(pts[i * 2 + k]).lerp(mids[i], 0.92 * (1 - 0.75 * smooth(g)));
                r.setMatrixAt(i * 2 + k, stickMatrix(pts[i * 2 + k], end.clone(), 0.085, tmpM));
            }
            // trecho já transcrito ganha um leve tom rosado (fita-molde lida)
            if (!isAre && z > -0.9) {
                const c = z < readTo && reading > 0 ? COL.read : COL.gene;
                r.setColorAt(i * 2 + 1, c);
            }
        }
        for (let i = 0; i < DNA_BP - 1; i++) {
            s.setMatrixAt(i * 2, stickMatrix(pts[i * 2], pts[i * 2 + 2], 0.07, tmpM));
            s.setMatrixAt(i * 2 + 1, stickMatrix(pts[i * 2 + 1], pts[i * 2 + 3], 0.07, tmpM));
        }
        [b, s, r].forEach(x => { x.instanceMatrix.needsUpdate = true; });
        if (r.instanceColor) r.instanceColor.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh ref={beads} args={[SPHERE_LO, undefined, DNA_BP * 2]} frustumCulled={false}>
                <meshStandardMaterial roughness={0.35} metalness={0.1} />
            </instancedMesh>
            <instancedMesh ref={sticks} args={[STICK_GEO, undefined, (DNA_BP - 1) * 2]} frustumCulled={false}>
                <meshStandardMaterial roughness={0.4} />
            </instancedMesh>
            <instancedMesh ref={rungs} args={[STICK_GEO, undefined, DNA_BP * 2]} frustumCulled={false}>
                <meshStandardMaterial roughness={0.55} />
            </instancedMesh>
            <mesh {...hover} position={[DNA_CENTER.x, DNA_CENTER.y, DNA_CENTER.z + ARE_Z]} rotation={[Math.PI / 2, 0, 0]} scale={[1.5, ARE_HALF * 2, 1.5]}>
                <cylinderGeometry args={[1, 1, 1, 10]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
        </group>
    );
};
