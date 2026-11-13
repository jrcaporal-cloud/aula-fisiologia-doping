import * as THREE from 'three';
import { SARC_CENTER, V } from './layout';

/*
 * Retículo hexagonal do sarcômero (eixo x): filamentos grossos de miosina e finos de actina, com os
 * "novos" (periferia) que aparecem na hipertrofia. Fica fora do componente para o Translation poder
 * importar os pontos de entrega sem importar um arquivo de componente.
 */

const D = 1.15;
const A1 = V(0, D, 0);
const A2 = V(0, D * 0.5, D * 0.866);
export const R0_MYO = 1.2 * D;
export const R1_MYO = 2.05 * D;
export const R0_ACT = 1.25 * D;
export const R1_ACT = 2.4 * D;
export const MYO_HALF = 3.5;
export const ACT_LEN = 4.3;
export const ACT_STEP = 0.2;
export const ACT_BEADS = Math.round(ACT_LEN / ACT_STEP);
export const HEAD_ROWS = 9;

export interface Fil { p: THREE.Vector3; isNew: boolean; delay: number; phase: number }

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

export const LAT = lattice();

/** Pontos (mundo) onde chegam as proteínas recém-sintetizadas (filamentos novos da periferia). */
export const DELIVERY_TARGETS: THREE.Vector3[] = LAT.myo.filter(f => f.isNew)
    .filter((_, k) => k % 2 === 0).slice(0, 6)
    .map((f, k) => V(k % 2 === 0 ? -2 : 2, f.p.y, f.p.z).add(SARC_CENTER));
