import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SARC_CENTER, SARC_HALF, W, phase, ph } from './layout';
import { SPHERE_LO, STICK_GEO, stickMatrix } from './geometry';
import type { TimeRef } from './types';
import { useHover } from './useHover';
import { ACT_BEADS, ACT_STEP, HEAD_ROWS, LAT, MYO_HALF, R0_ACT, R1_ACT, type Fil } from './sarcLattice';
import { MYOSIN_ROD, Z_DISC } from './shaders';
import { commitInstances } from './instancing';

/*
 * Sarcômero (eixo x): linhas Z nas pontas, filamentos finos de actina (dupla hélice de contas) presos às
 * linhas Z e filamentos grossos de miosina (com cabeças) no centro, em retículo hexagonal.
 * Na hipertrofia, novos filamentos são acrescentados na periferia → miofibrila mais espessa.
 */

const COL = {
    myo: new THREE.Color('#e2e8f0'),
    head: new THREE.Color('#cbd5e1'),
    act: new THREE.Color('#f87171'),
    fresh: new THREE.Color('#fde047').multiplyScalar(1.5),
};

const tmpM = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const a = new THREE.Vector3();
const b = new THREE.Vector3();
const c = new THREE.Color();

const HEAD_S = new THREE.Vector3(0.16, 0.1, 0.1);
const ACT_S = new THREE.Vector3(0.105, 0.105, 0.105);
const inGrowRange = (x: number) => x > W.grow[0] - 0.05 && x < W.grow[1] + 0.05;
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
        if (was >= 0 && !inGrowRange(T) && !inGrowRange(was) && (T < W.grow[0]) === (was < W.grow[0])) return;
        const r = rods.current;
        const h = heads.current;
        const ac = actin.current;
        if (!r || !h || !ac) return;
        // só as instâncias visíveis, em sequência: count corta o resto (não desenha nem sobe para a GPU)
        let ri = 0;
        let hi = 0;
        for (let idx = 0; idx < LAT.myo.length; idx++) {
            const f = LAT.myo[idx];
            const g = growth(T, f);
            if (g <= 0.001) continue;
            const fresh = f.isNew ? 1 - 0.9 * g : 0;
            a.set(-MYO_HALF * g, f.p.y, f.p.z).add(SARC_CENTER);
            b.set(MYO_HALF * g, f.p.y, f.p.z).add(SARC_CENTER);
            r.setMatrixAt(ri, stickMatrix(a, b, 0.13, tmpM));
            r.setColorAt(ri++, c.copy(COL.myo).lerp(COL.fresh, fresh));
            const reach = MYO_HALF * g;
            for (let si = 0; si < 2; si++) {
                const side = si === 0 ? -1 : 1;
                for (let k = 0; k < HEAD_ROWS; k++) {
                    const ax = 0.55 + k * 0.36;
                    if (ax >= reach) break;
                    for (let e = 0; e < 2; e++) {
                        const ang = k * 2.09 + e * Math.PI + f.phase;
                        a.set(side * ax, f.p.y + Math.cos(ang) * 0.27, f.p.z + Math.sin(ang) * 0.27).add(SARC_CENTER);
                        h.setMatrixAt(hi, tmpM.compose(a, q0, HEAD_S));
                        h.setColorAt(hi++, c.copy(COL.head).lerp(COL.fresh, fresh));
                    }
                }
            }
        }
        let ai = 0;
        for (let idx = 0; idx < LAT.act.length; idx++) {
            const f = LAT.act[idx];
            const g = growth(T, f);
            const fresh = f.isNew ? 1 - 0.9 * g : 0;
            const shown = g * ACT_BEADS;
            for (let si = 0; si < 2; si++) {
                const side = si === 0 ? -1 : 1;
                for (let s = 0; s < 2; s++) {
                    c.copy(COL.act).lerp(COL.fresh, fresh).multiplyScalar(s === 0 ? 1 : 0.82);
                    for (let k = 0; k < ACT_BEADS && k < shown; k++) {
                        const dist = k * ACT_STEP;
                        const x = side * (SARC_HALF - 0.1 - dist);
                        const ang = dist * (Math.PI * 2 / 1.5) + s * Math.PI + f.phase;
                        a.set(x, f.p.y + Math.cos(ang) * 0.085, f.p.z + Math.sin(ang) * 0.085).add(SARC_CENTER);
                        ac.setMatrixAt(ai, tmpM.compose(a, q0, ACT_S));
                        ac.setColorAt(ai++, c);
                    }
                }
            }
        }
        commitInstances(r, ri);
        commitInstances(h, hi);
        commitInstances(ac, ai);
        const zr = (R0_ACT + 0.55) + (R1_ACT - R0_ACT) * ph(T, W.grow);
        zA.current?.scale.set(zr, 1, zr);
        zB.current?.scale.set(zr, 1, zr);
    });

    return (
        <group>
            <instancedMesh ref={rods} args={[STICK_GEO, undefined, LAT.myo.length]} frustumCulled={false} {...hoverMyo}>
                <meshStandardMaterial roughness={0.45} {...MYOSIN_ROD} />
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
                    <meshStandardMaterial color="#94a3b8" emissive="#475569" emissiveIntensity={0.4} transparent opacity={0.55} roughness={0.5} depthWrite={false} {...Z_DISC} />
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
