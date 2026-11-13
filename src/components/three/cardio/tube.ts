import * as THREE from 'three';
import { FLOW, wrap, type FlowFrame } from './flow';
import { WALL } from './layout';

/*
 * Vaso em corte longitudinal: só a metade de trás, com a parede de espessura real à vista nas duas
 * bordas do corte. Construído sobre as mesmas amostras que as hemácias percorrem; número de vértices
 * fixo, com o anel reescrito por quadro só quando o eixo, a luz ou a placa mudam.
 *
 * A placa é excêntrica (cresce de um lado da parede, como na lesão real): a luz encolhe do lado
 * θ = 0 — a borda de corte de baixo da artéria —, então o núcleo da placa aparece em corte, entre a
 * íntima e a média.
 *
 * Atributos para o shader: aFace (0 = luz/endotélio, 1 = adventícia, 2 = face do corte), aDepth
 * (0 na luz → 1 por fora), aPlq (na face do corte: fração da espessura ocupada pela placa; na luz:
 * quanto aquele ponto está sobre a placa) e aTube (comprimento de arco, fração da volta).
 */

/** Segmentos na meia-volta. */
const RS = 12;
const PER_RING = (RS + 1) * 2 + 4;
const COS = Float32Array.from({ length: RS + 1 }, (_, k) => Math.cos((k / RS) * Math.PI));
const SIN = Float32Array.from({ length: RS + 1 }, (_, k) => Math.sin((k / RS) * Math.PI));
/** Excentricidade da placa ao redor da luz: máxima na borda θ = 0, some na metade da volta. */
const ECC = Float32Array.from({ length: RS + 1 }, (_, k) => Math.pow(Math.max(COS[k], 0), 1.3));

/** Comprimento de arco (mundo) do início do circuito até cada amostra: a coordenada do padrão no shader. */
export const ARC = (() => {
    const out = new Float32Array(FLOW.length);
    for (let i = 1; i < FLOW.length; i++) out[i] = out[i - 1] + FLOW[i - 1].len;
    return out;
})();

export interface Tube {
    geometry: THREE.BufferGeometry;
    write: (f: FlowFrame) => void;
    /** Triângulos da luz (os primeiros do índice): o acerto do ponteiro distingue luz × parede. */
    innerTris: number;
    /** Amostra do circuito sob um triângulo da luz. */
    sampleOfFace: (face: number) => number;
}

/** Tubo cobrindo as amostras [i0, i1] (i1 pode passar de SAMPLES: o trecho atravessa o início). */
export const makeTube = (i0: number, i1: number): Tube => {
    const n = i1 - i0 + 1;
    const total = n * PER_RING;
    const pos = new Float32Array(total * 3);
    const nrm = new Float32Array(total * 3);
    const face = new Float32Array(total);
    const depth = new Float32Array(total);
    const plq = new Float32Array(total);
    const tub = new Float32Array(total * 2);
    const offInner = 0;
    const offOuter = n * (RS + 1);
    const offCutA = offOuter * 2;
    const offCutB = offCutA + n * 2;

    for (let i = 0; i < n; i++) {
        const arc = ARC[wrap(i0 + i)];
        for (let k = 0; k <= RS; k++) {
            const vi = offInner + i * (RS + 1) + k;
            const vo = offOuter + i * (RS + 1) + k;
            face[vo] = 1;
            depth[vo] = 1;
            tub[vi * 2] = arc; tub[vi * 2 + 1] = k / RS;
            tub[vo * 2] = arc; tub[vo * 2 + 1] = k / RS;
        }
        for (const [o, side] of [[offCutA, 0], [offCutB, 1]] as const) {
            for (let e = 0; e < 2; e++) {
                const v = o + i * 2 + e;
                face[v] = 2;
                depth[v] = e;
                tub[v * 2] = arc;
                tub[v * 2 + 1] = side;
            }
        }
    }

    const idx: number[] = [];
    const quad = (a: number, b: number, c: number, d: number, flip: boolean) =>
        (flip ? idx.push(a, c, b, a, d, c) : idx.push(a, b, c, a, c, d));
    for (let i = 0; i < n - 1; i++) {
        for (let k = 0; k < RS; k++) {
            const a = offInner + i * (RS + 1) + k;
            quad(a, a + 1, a + RS + 2, a + RS + 1, true);
        }
    }
    const innerTris = idx.length / 3;
    for (let i = 0; i < n - 1; i++) {
        for (let k = 0; k < RS; k++) {
            const a = offOuter + i * (RS + 1) + k;
            quad(a, a + 1, a + RS + 2, a + RS + 1, false);
        }
    }
    for (const [o, flip] of [[offCutA, false], [offCutB, true]] as const) {
        for (let i = 0; i < n - 1; i++) quad(o + i * 2, o + i * 2 + 1, o + i * 2 + 3, o + i * 2 + 2, flip);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));
    geometry.setAttribute('aFace', new THREE.BufferAttribute(face, 1));
    geometry.setAttribute('aDepth', new THREE.BufferAttribute(depth, 1));
    geometry.setAttribute('aPlq', new THREE.BufferAttribute(plq, 1));
    geometry.setAttribute('aTube', new THREE.BufferAttribute(tub, 2));
    geometry.setIndex(idx);

    /** Último eixo, luz e placa escritos por anel: só reenvia à GPU o que mudou. */
    const last = new Float32Array(n * 5).fill(NaN);
    let bounded = false;

    const write = (f: FlowFrame) => {
        let dirty = false;
        for (let i = 0; i < n; i++) {
            const si = wrap(i0 + i);
            const s = FLOW[si];
            const cx = f.ax[si * 3];
            const cy = f.ax[si * 3 + 1];
            const cz = f.ax[si * 3 + 2];
            const R = f.rad[si];
            const st = f.sten[si];
            const l = i * 5;
            if (last[l] === cx && last[l + 1] === cy && last[l + 2] === cz && last[l + 3] === R && last[l + 4] === st) continue;
            last[l] = cx; last[l + 1] = cy; last[l + 2] = cz; last[l + 3] = R; last[l + 4] = st;
            dirty = true;
            const wall = WALL[s.kind] * Math.sqrt(s.r0 / R);
            const rOut = R + wall;
            for (let k = 0; k <= RS; k++) {
                const ux = s.s.x * COS[k] + s.k.x * SIN[k];
                const uy = s.s.y * COS[k] + s.k.y * SIN[k];
                const uz = s.s.z * COS[k] + s.k.z * SIN[k];
                const rIn = R * (1 - st * ECC[k]);
                const vi = (offInner + i * (RS + 1) + k) * 3;
                const vo = (offOuter + i * (RS + 1) + k) * 3;
                pos[vi] = cx + ux * rIn; pos[vi + 1] = cy + uy * rIn; pos[vi + 2] = cz + uz * rIn;
                nrm[vi] = -ux; nrm[vi + 1] = -uy; nrm[vi + 2] = -uz;
                pos[vo] = cx + ux * rOut; pos[vo + 1] = cy + uy * rOut; pos[vo + 2] = cz + uz * rOut;
                nrm[vo] = ux; nrm[vo + 1] = uy; nrm[vo + 2] = uz;
                plq[offInner + i * (RS + 1) + k] = st * ECC[k];
            }
            // bordas do corte: θ = 0 (com a placa) e θ = π; normal = para quem olha o corte
            for (const [o, k] of [[offCutA, 0], [offCutB, RS]] as const) {
                const a = (offInner + i * (RS + 1) + k) * 3;
                const b = (offOuter + i * (RS + 1) + k) * 3;
                const v = (o + i * 2) * 3;
                pos[v] = pos[a]; pos[v + 1] = pos[a + 1]; pos[v + 2] = pos[a + 2];
                pos[v + 3] = pos[b]; pos[v + 4] = pos[b + 1]; pos[v + 5] = pos[b + 2];
                nrm[v] = -s.k.x; nrm[v + 1] = -s.k.y; nrm[v + 2] = -s.k.z;
                nrm[v + 3] = -s.k.x; nrm[v + 4] = -s.k.y; nrm[v + 5] = -s.k.z;
                const fr = k === 0 ? (R * st) / (rOut - R * (1 - st)) : 0;
                plq[o + i * 2] = fr;
                plq[o + i * 2 + 1] = fr;
            }
        }
        if (!dirty) return;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;
        geometry.attributes.aPlq.needsUpdate = true;
        if (!bounded) {
            geometry.computeBoundingSphere();
            if (geometry.boundingSphere) geometry.boundingSphere.radius += 0.6;
            bounded = true;
        }
    };

    return {
        geometry,
        write,
        innerTris,
        sampleOfFace: face => wrap(i0 + Math.floor(face / (RS * 2))),
    };
};
