import * as THREE from 'three';
import { BASE_Y, CUT_PHI_LEN, CUT_PHI_START, VENT_X } from './layout';
import { longShrink, radialShrink, type CardioParams, type CycleState } from './params';

/*
 * Casca do ventrículo esquerdo em corte: elipsoide prolato de parede espessa, ápice para baixo, com
 * uma cunha frontal retirada para a cavidade ficar à vista. O número de vértices é fixo — a cada
 * quadro só reescrevemos posições e normais, sem alocar nem reconstruir geometria.
 *
 * A parede cresce para dentro: o epicárdio sai de (cavidade + parede) em diástole e fica parado,
 * enquanto a cavidade encolhe. Hipertrofia concêntrica e contração usam o mesmo mecanismo.
 */

const NU = 22;
const NV = 36;
const GRID = NU * NV;
const OFF_OUT = GRID;
const OFF_CAP_A = GRID * 2;
const OFF_CAP_B = OFF_CAP_A + NU * 2;
const OFF_RIM = OFF_CAP_B + NU * 2;
const VERTS = OFF_RIM + NV * 2;

const buildIndex = (): Uint16Array => {
    const idx: number[] = [];
    const quad = (a: number, b: number, c: number, d: number) => idx.push(a, b, c, a, c, d);
    for (let g = 0; g < 2; g++) {
        const o = g === 0 ? 0 : OFF_OUT;
        for (let i = 0; i < NU - 1; i++) {
            for (let j = 0; j < NV - 1; j++) {
                const v = o + i * NV + j;
                quad(v, v + 1, v + NV + 1, v + NV);
            }
        }
    }
    for (const o of [OFF_CAP_A, OFF_CAP_B]) {
        for (let i = 0; i < NU - 1; i++) quad(o + i * 2, o + i * 2 + 1, o + i * 2 + 3, o + i * 2 + 2);
    }
    for (let j = 0; j < NV - 1; j++) quad(OFF_RIM + j * 2, OFF_RIM + j * 2 + 1, OFF_RIM + j * 2 + 3, OFF_RIM + j * 2 + 2);
    return new Uint16Array(idx);
};

const INDEX = buildIndex();
const COS = Float32Array.from({ length: NV }, (_, j) => Math.cos(CUT_PHI_START + (CUT_PHI_LEN * j) / (NV - 1)));
const SIN = Float32Array.from({ length: NV }, (_, j) => Math.sin(CUT_PHI_START + (CUT_PHI_LEN * j) / (NV - 1)));

/** Ponto da superfície do elipsoide (fração do meridiano a partir do ápice, fração do arco φ). */
export const shellPoint = (
    aFrac: number, phiFrac: number, R: number, h: number, yc: number, out: THREE.Vector3,
): THREE.Vector3 => {
    const aMax = Math.acos(Math.max(Math.min((yc - BASE_Y) / h, 1), -1));
    const a = aMax * aFrac;
    const r = R * Math.sin(a);
    const phi = CUT_PHI_START + CUT_PHI_LEN * phiFrac;
    return out.set(VENT_X + r * Math.cos(phi), yc - h * Math.cos(a), r * Math.sin(phi));
};

export interface Shell {
    geometry: THREE.BufferGeometry;
    write: (p: CardioParams, cy: CycleState) => void;
}

export const makeShell = (): Shell => {
    const pos = new Float32Array(VERTS * 3);
    const nrm = new Float32Array(VERTS * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    geometry.setIndex(new THREE.BufferAttribute(INDEX, 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(VENT_X, 0, 0), 12);

    /** Escreve um vértice da superfície; `sgn` = +1 para fora (epicárdio), −1 para dentro (endocárdio). */
    const put = (v: number, R: number, h: number, yc: number, sinA: number, cosA: number, j: number, sgn: number) => {
        const r = R * sinA;
        const x = r * COS[j];
        const z = r * SIN[j];
        const dy = -h * cosA;
        const k = v * 3;
        pos[k] = VENT_X + x;
        pos[k + 1] = yc + dy;
        pos[k + 2] = z;
        let nx = x / (R * R);
        let ny = dy / (h * h);
        let nz = z / (R * R);
        const l = Math.hypot(nx, ny, nz) || 1;
        nx = (nx / l) * sgn;
        ny = (ny / l) * sgn;
        nz = (nz / l) * sgn;
        nrm[k] = nx;
        nrm[k + 1] = ny;
        nrm[k + 2] = nz;
    };

    const putFlat = (v: number, from: number, nx: number, ny: number, nz: number) => {
        const k = v * 3;
        const f = from * 3;
        pos[k] = pos[f];
        pos[k + 1] = pos[f + 1];
        pos[k + 2] = pos[f + 2];
        nrm[k] = nx;
        nrm[k + 1] = ny;
        nrm[k + 2] = nz;
    };

    const write = (p: CardioParams, cy: CycleState) => {
        const rIn = p.rCav * radialShrink(cy.volRatio);
        const hIn = p.hCav * longShrink(cy.volRatio);
        const yc = p.yc;
        const aIn = Math.acos(Math.max(Math.min((yc - BASE_Y) / hIn, 1), -1));
        const aOut = Math.acos(Math.max(Math.min((yc - BASE_Y) / p.hOut, 1), -1));
        for (let i = 0; i < NU; i++) {
            const f = i / (NU - 1);
            const si = Math.sin(aIn * f);
            const ci = Math.cos(aIn * f);
            const so = Math.sin(aOut * f);
            const co = Math.cos(aOut * f);
            for (let j = 0; j < NV; j++) {
                put(i * NV + j, rIn, hIn, yc, si, ci, j, -1);
                put(OFF_OUT + i * NV + j, p.rOut, p.hOut, yc, so, co, j, 1);
            }
            // faces do corte: a espessura da parede fica à vista nas duas bordas da cunha
            putFlat(OFF_CAP_A + i * 2, i * NV, SIN[0], 0, -COS[0]);
            putFlat(OFF_CAP_A + i * 2 + 1, OFF_OUT + i * NV, SIN[0], 0, -COS[0]);
            putFlat(OFF_CAP_B + i * 2, i * NV + NV - 1, -SIN[NV - 1], 0, COS[NV - 1]);
            putFlat(OFF_CAP_B + i * 2 + 1, OFF_OUT + i * NV + NV - 1, -SIN[NV - 1], 0, COS[NV - 1]);
        }
        // anel do plano basal (onde ficam as valvas)
        for (let j = 0; j < NV; j++) {
            putFlat(OFF_RIM + j * 2, (NU - 1) * NV + j, 0, 1, 0);
            putFlat(OFF_RIM + j * 2 + 1, OFF_OUT + (NU - 1) * NV + j, 0, 1, 0);
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;
    };

    return { geometry, write };
};
