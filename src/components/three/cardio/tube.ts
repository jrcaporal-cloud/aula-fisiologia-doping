import * as THREE from 'three';
import { FLOW, type FlowFrame } from './flow';

/*
 * Parede dos vasos: um tubo por trecho, construído sobre as mesmas amostras do circuito que as
 * hemácias percorrem. O número de vértices é fixo; o raio de cada anel é reescrito por quadro a
 * partir da tabela do quadro (distensão do pulso, rigidez, estreitamento da placa).
 */

const RS = 11;
const COS = Float32Array.from({ length: RS + 1 }, (_, k) => Math.cos((k / RS) * Math.PI * 2));
const SIN = Float32Array.from({ length: RS + 1 }, (_, k) => Math.sin((k / RS) * Math.PI * 2));

export interface Tube {
    geometry: THREE.BufferGeometry;
    write: (f: FlowFrame) => void;
}

/** Tubo cobrindo as amostras [i0, i1]. `rScale` < 1 desenha a camada interna (endotélio). */
export const makeTube = (i0: number, i1: number, rScale = 1): Tube => {
    const n = i1 - i0 + 1;
    const cols = RS + 1;
    const pos = new Float32Array(n * cols * 3);
    const nrm = new Float32Array(n * cols * 3);
    const idx: number[] = [];
    for (let i = 0; i < n - 1; i++) {
        for (let k = 0; k < RS; k++) {
            const a = i * cols + k;
            idx.push(a, a + 1, a + cols + 1, a, a + cols + 1, a + cols);
        }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    geometry.setIndex(idx);
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, -1), 26);

    const write = (f: FlowFrame) => {
        for (let i = 0; i < n; i++) {
            const s = FLOW[i0 + i];
            const ax = (i0 + i) * 3;
            const px = f.ax[ax];
            const py = f.ax[ax + 1];
            const pz = f.ax[ax + 2];
            const r = f.rad[i0 + i] * rScale;
            for (let k = 0; k <= RS; k++) {
                const ux = s.n.x * COS[k] + s.b.x * SIN[k];
                const uy = s.n.y * COS[k] + s.b.y * SIN[k];
                const uz = s.n.z * COS[k] + s.b.z * SIN[k];
                const o = (i * cols + k) * 3;
                pos[o] = px + ux * r;
                pos[o + 1] = py + uy * r;
                pos[o + 2] = pz + uz * r;
                nrm[o] = ux;
                nrm[o + 1] = uy;
                nrm[o + 2] = uz;
            }
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;
    };

    return { geometry, write };
};
