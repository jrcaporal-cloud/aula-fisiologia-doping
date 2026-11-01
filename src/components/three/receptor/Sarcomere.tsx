import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SARC_CENTER, SARC_HALF, V, W, phase, ph } from './layout';
import { SPHERE_LO, STICK_GEO, stickMatrix } from './geometry';
import type { TimeRef } from './types';
import { useHover } from './useHover';

/*
 * Sarcômero (eixo x): linhas Z nas pontas, filamentos finos de actina (dupla hélice de contas) presos às
 * linhas Z e filamentos grossos de miosina (com cabeças) no centro, em retículo hexagonal.
 * Na hipertrofia, novos filamentos são acrescentados na periferia → miofibrila mais espessa.
 */

const D = 1.15;
const A1 = V(0, D, 0);
const A2 = V(0, D * 0.5, D * 0.866);
const R0_MYO = 1.2 * D;
const R1_MYO = 2.05 * D;
const R0_ACT = 1.25 * D;
const R1_ACT = 2.4 * D;
const MYO_HALF = 3.5;
const ACT_LEN = 4.3;
const ACT_STEP = 0.2;
const ACT_BEADS = Math.round(ACT_LEN / ACT_STEP);
const HEAD_ROWS = 9;

interface Fil { p: THREE.Vector3; isNew: boolean; delay: number; phase: number }

const lattice = () => {
    const myo: Fil[] = [];
    const act: Fil[] = [];
    const seen = new Set<string>();
    for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
        const p = A1.clone().multiplyScalar(i).addScaledVector(A2, j);
        const r = p.length();
        const ang = Math.atan2(p.z, p.y);
        const delay = ((ang + Math.PI) / (Math.PI * 2)) * 0.22;
        if (r <= R1_MYO) myo.push({ p, isNew: r > R0_MYO, delay, phase: i * 1.3 + j * 0.7 });
        for (const k of [1, 2]) {
            const c = p.clone().addScaledVector(A1.clone().add(A2), k / 3);
            const key = `${c.y.toFixed(2)},${c.z.toFixed(2)}`;
            const rc = c.length();
            if (rc <= R1_ACT && !seen.has(key)) {
                seen.add(key);
                act.push({ p: c, isNew: rc > R0_ACT, delay: ((Math.atan2(c.z, c.y) + Math.PI) / (Math.PI * 2)) * 0.22, phase: i + j * 2 + k });
            }
        }
    }
    return { myo, act };
};

const LAT = lattice();

/** Pontos (mundo) onde chegam as proteínas recém-sintetizadas (filamentos novos da periferia). */
export const DELIVERY_TARGETS: THREE.Vector3[] = LAT.myo.filter(f => f.isNew)
    .filter((_, k) => k % 2 === 0).slice(0, 6)
    .map((f, k) => V(k % 2 === 0 ? -2 : 2, f.p.y, f.p.z).add(SARC_CENTER));

const COL = {
    myo: new THREE.Color('#e2e8f0'),
    head: new THREE.Color('#cbd5e1'),
    act: new THREE.Color('#f87171'),
    fresh: new THREE.Color('#fde047').multiplyScalar(1.5),
};

const tmpM = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const sc = new THREE.Vector3();
const a = new THREE.Vector3();
const b = new THREE.Vector3();
const c = new THREE.Color();

const growth = (T: number, f: Fil) => (f.isNew ? phase(T, W.grow[0] + f.delay, W.grow[0] + f.delay + 0.42) : 1);

export const Sarcomere = ({ timeRef }: { timeRef: TimeRef }) => {
    const rods = useRef<THREE.InstancedMesh>(null);
    const heads = useRef<THREE.InstancedMesh>(null);
    const actin = useRef<THREE.InstancedMesh>(null);
    const zA = useRef<THREE.Mesh>(null);
    const zB = useRef<THREE.Mesh>(null);
    const lastT = useRef(-1);
    const counts = useMemo(() => ({
        heads: LAT.myo.length * 2 * HEAD_ROWS * 2,
        actin: LAT.act.length * 2 * 2 * ACT_BEADS,
    }), []);
    const hoverMyo = useHover('Miofibrila · sarcômero', 'Actina (filamentos finos, presos às linhas Z) e miosina pesada (filamentos grossos, com cabeças). Mais filamentos em paralelo = fibra mais espessa (hipertrofia).');

    useLayoutEffect(() => { lastT.current = -1; }, []);

    useFrame(() => {
        const T = timeRef.current.t;
        if (Math.abs(T - lastT.current) < 1e-5) return;
        const was = lastT.current;
        lastT.current = T;
        const inRange = (x: number) => x > W.grow[0] - 0.05 && x < W.grow[1] + 0.05;
        if (was >= 0 && !inRange(T) && !inRange(was) && (T < W.grow[0]) === (was < W.grow[0])) return;
        const r = rods.current;
        const h = heads.current;
        const ac = actin.current;
        if (!r || !h || !ac) return;
        let hi = 0;
        LAT.myo.forEach((f, idx) => {
            const g = growth(T, f);
            const fresh = f.isNew ? 1 - 0.9 * g : 0;
            a.set(-MYO_HALF * g, f.p.y, f.p.z).add(SARC_CENTER);
            b.set(MYO_HALF * g, f.p.y, f.p.z).add(SARC_CENTER);
            r.setMatrixAt(idx, g > 0.001 ? stickMatrix(a, b, 0.13, tmpM) : tmpM.makeScale(0, 0, 0));
            r.setColorAt(idx, c.copy(COL.myo).lerp(COL.fresh, Math.max(fresh, 0)));
            for (const side of [-1, 1]) for (let k = 0; k < HEAD_ROWS; k++) for (let e = 0; e < 2; e++) {
                const x = side * (0.55 + k * 0.36);
                const vis = Math.abs(x) < MYO_HALF * g;
                const ang = k * 2.09 + e * Math.PI + f.phase;
                a.set(x, f.p.y + Math.cos(ang) * 0.27, f.p.z + Math.sin(ang) * 0.27).add(SARC_CENTER);
                sc.set(0.16, 0.1, 0.1).multiplyScalar(vis ? 1 : 0);
                h.setMatrixAt(hi, tmpM.compose(a, q0, sc));
                h.setColorAt(hi++, c.copy(COL.head).lerp(COL.fresh, Math.max(fresh, 0)));
            }
        });
        let ai = 0;
        LAT.act.forEach(f => {
            const g = growth(T, f);
            const fresh = f.isNew ? 1 - 0.9 * g : 0;
            for (const side of [-1, 1]) for (let s = 0; s < 2; s++) for (let k = 0; k < ACT_BEADS; k++) {
                const dist = k * ACT_STEP;
                const vis = k < g * ACT_BEADS;
                const x = side * (SARC_HALF - 0.1 - dist);
                const ang = dist * (Math.PI * 2 / 1.5) + s * Math.PI + f.phase;
                a.set(x, f.p.y + Math.cos(ang) * 0.085, f.p.z + Math.sin(ang) * 0.085).add(SARC_CENTER);
                const rr = vis ? 0.105 : 0;
                ac.setMatrixAt(ai, tmpM.compose(a, q0, sc.set(rr, rr, rr)));
                ac.setColorAt(ai++, c.copy(COL.act).lerp(COL.fresh, fresh).multiplyScalar(s === 0 ? 1 : 0.82));
            }
        });
        [r, h, ac].forEach(m => {
            m.instanceMatrix.needsUpdate = true;
            if (m.instanceColor) m.instanceColor.needsUpdate = true;
        });
        const zr = (R0_ACT + 0.55) + (R1_ACT - R0_ACT) * ph(T, W.grow);
        [zA.current, zB.current].forEach(z => { if (z) z.scale.set(zr, 1, zr); });
    });

    return (
        <group>
            <instancedMesh ref={rods} args={[STICK_GEO, undefined, LAT.myo.length]} frustumCulled={false} {...hoverMyo}>
                <meshStandardMaterial roughness={0.45} />
            </instancedMesh>
            <instancedMesh ref={heads} args={[SPHERE_LO, undefined, counts.heads]} frustumCulled={false}>
                <meshStandardMaterial roughness={0.5} />
            </instancedMesh>
            <instancedMesh ref={actin} args={[SPHERE_LO, undefined, counts.actin]} frustumCulled={false}>
                <meshStandardMaterial roughness={0.45} />
            </instancedMesh>
            {[-1, 1].map(side => (
                <mesh key={side} ref={side < 0 ? zA : zB} position={[SARC_CENTER.x + side * SARC_HALF, SARC_CENTER.y, SARC_CENTER.z]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[1, 1, 0.14, 48]} />
                    <meshStandardMaterial color="#94a3b8" emissive="#475569" emissiveIntensity={0.4} transparent opacity={0.55} roughness={0.5} depthWrite={false} />
                </mesh>
            ))}
            {/* contorno do diâmetro inicial (referência para ver o espessamento) */}
            {[-1, 1].map(side => (
                <mesh key={`r${side}`} position={[SARC_CENTER.x + side * (SARC_HALF + 0.12), SARC_CENTER.y, SARC_CENTER.z]} rotation={[0, Math.PI / 2, 0]}>
                    <torusGeometry args={[R0_ACT + 0.55, 0.035, 6, 64]} />
                    <meshBasicMaterial color="#22d3ee" transparent opacity={0.85} toneMapped={false} />
                </mesh>
            ))}
        </group>
    );
};
