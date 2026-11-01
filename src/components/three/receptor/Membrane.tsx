import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ligandPose, makePose } from './choreo';
import { MEMBRANE_CUT_Z, memX, rng, smooth } from './layout';
import { SPHERE_LO, STICK_GEO, stickMatrix } from './geometry';
import type { TimeRef } from './types';
import { useHover } from './useHover';

/*
 * Bicamada fosfolipídica (recorte): cabeças polares + duas caudas apolares por lipídio, nas duas lâminas.
 * Quando o ligante atravessa, os lipídios vizinhos se afastam um pouco (difusão simples, sem canal).
 */

const SP = 0.52;
const YR = 9.5;
const Z0 = -11;

interface Lipid { y: number; z: number; s: number; e: number; tw: number }

const buildLipids = () => {
    const rand = rng(5);
    const out: Lipid[] = [];
    let row = 0;
    for (let y = -YR; y <= YR; y += SP * 0.866, row++) {
        for (let z = MEMBRANE_CUT_Z - (row % 2) * SP * 0.5; z >= Z0; z -= SP) {
            // a borda frontal (recorte) fica nítida; as outras se dissolvem
            const edge = Math.min(1 - Math.abs(y) / YR, (z - Z0) / 6);
            const e = smooth(Math.min(edge * 5, 1));
            if (e < 0.05) continue;
            for (const s of [1, -1]) out.push({ y: y + (rand() - 0.5) * 0.08, z: z + (rand() - 0.5) * 0.08, s, e, tw: rand() });
        }
    }
    return out;
};

const tmpM = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const sc = new THREE.Vector3();
const a = new THREE.Vector3();
const b = new THREE.Vector3();
const hp = new THREE.Vector3();

const writeLipid = (heads: THREE.InstancedMesh, tails: THREE.InstancedMesh, i: number, l: Lipid, dy: number, dz: number) => {
    const y = l.y + dy;
    const z = l.z + dz;
    const x0 = memX(y, z);
    const r = 0.21 * l.e;
    hp.set(x0 + l.s * 0.98, y, z);
    tmpM.compose(hp, q0, sc.set(r, r, r));
    heads.setMatrixAt(i, tmpM);
    for (let k = 0; k < 2; k++) {
        const off = (k - 0.5) * 0.17;
        const kink = k === 1 ? Math.sin(l.tw * 6) * 0.06 : 0;
        a.set(x0 + l.s * 0.8, y + kink, z + off);
        b.set(x0 + l.s * 0.08, y + kink * 2 + (l.tw - 0.5) * 0.1, z + off * 1.3);
        tails.setMatrixAt(i * 2 + k, stickMatrix(a, b, 0.05 * l.e, tmpM));
    }
};

export const Membrane = ({ timeRef }: { timeRef: TimeRef }) => {
    const heads = useRef<THREE.InstancedMesh>(null);
    const tails = useRef<THREE.InstancedMesh>(null);
    const lipids = useMemo(() => buildLipids(), []);
    const near = useMemo(() => lipids.map((l, i) => ({ l, i })).filter(({ l }) =>
        Math.hypot(l.y - 1.9, l.z - 2.75) < 2.4 || Math.hypot(l.y + 2.4, l.z + 2.2) < 2.4), [lipids]);
    const pose = useMemo(() => makePose(), []);
    const lastT = useRef(-1);
    const hover = useHover('Membrana plasmática', 'Bicamada fosfolipídica: cabeças polares voltadas para a água e caudas apolares no meio. O esteroide, lipofílico, atravessa por difusão simples.');

    useLayoutEffect(() => {
        const h = heads.current;
        const t = tails.current;
        if (!h || !t) return;
        const c = new THREE.Color();
        const rand = rng(9);
        lipids.forEach((l, i) => {
            writeLipid(h, t, i, l, 0, 0);
            h.setColorAt(i, c.set(l.s > 0 ? '#9fb6d6' : '#8fa6c8').multiplyScalar(0.85 + rand() * 0.3));
        });
        h.instanceMatrix.needsUpdate = true;
        t.instanceMatrix.needsUpdate = true;
        if (h.instanceColor) h.instanceColor.needsUpdate = true;
    }, [lipids]);

    useFrame(({ clock }) => {
        const T = timeRef.current.t;
        if (T > 1.3 && lastT.current > 1.3) return;
        if (Math.abs(T - lastT.current) < 1e-4 && T > 1.3) return;
        lastT.current = T;
        const h = heads.current;
        const t = tails.current;
        if (!h || !t) return;
        const ligs = [0, 1].map(i => ligandPose(i, T, clock.elapsedTime, pose).p.clone());
        near.forEach(({ l, i }) => {
            let dy = 0;
            let dz = 0;
            ligs.forEach(p => {
                const inside = 1 - Math.min(Math.abs(p.x - memX(p.y, p.z)) / 2.2, 1);
                if (inside <= 0) return;
                const vy = l.y - p.y;
                const vz = l.z - p.z;
                const d = Math.hypot(vy, vz) || 1;
                const push = Math.max(1.25 - d, 0) * 0.55 * smooth(inside);
                dy += (vy / d) * push;
                dz += (vz / d) * push;
            });
            writeLipid(h, t, i, l, dy, dz);
        });
        h.instanceMatrix.needsUpdate = true;
        t.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh ref={heads} args={[SPHERE_LO, undefined, lipids.length]} frustumCulled={false}>
                <meshStandardMaterial roughness={0.5} metalness={0.05} />
            </instancedMesh>
            <instancedMesh ref={tails} args={[STICK_GEO, undefined, lipids.length * 2]} frustumCulled={false}>
                <meshStandardMaterial color="#c9a227" roughness={0.75} emissive="#3a2a05" emissiveIntensity={0.4} />
            </instancedMesh>
            <mesh {...hover} position={[memX(0, 0) - 0.6, 0, (MEMBRANE_CUT_Z + Z0) / 2]} scale={[1.6, YR * 1.6, MEMBRANE_CUT_Z - Z0]}>
                <boxGeometry />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
        </group>
    );
};
