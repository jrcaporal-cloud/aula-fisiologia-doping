import * as THREE from 'three';

/*
 * Câmara do coração em corte coronal: elipsoide de parede espessa, truncado num plano horizontal
 * (o plano das valvas) e cortado ao meio no plano frontal — só a metade de trás (z ≤ 0) existe.
 * Superfícies: endocárdio (dentro), epicárdio (fora), as duas faixas do corte (no plano z = 0, com a
 * espessura da parede à vista; no ventrículo elas se encontram no ápice e formam o "U" do eco
 * apical) e o anel da truncadura.
 *
 * Número de vértices fixo: por quadro só reescrevemos posições e normais. Atributos para o shader:
 *  aFace  0 = endocárdio, 1 = epicárdio, 2 = face do corte, 3 = anel;
 *  aDepth 0 no endocárdio → 1 no epicárdio (atravessa a parede na face do corte);
 *  aMer   fração do meridiano, 0 no polo → 1 na truncadura (sulco atrioventricular);
 *  aSide  fração da volta (0…1 de uma borda do corte à outra).
 */

/** Anel do meridiano de uma câmara de perfil livre: centro em x, raio e altura. */
export interface RingOut { cx: number; r: number; y: number }
/** Perfil livre (o VD, encostado no septo): fração do meridiano (0 = polo) → anel. */
export type RingFn = (f: number, inner: boolean, out: RingOut) => RingOut;

export interface ChamberShape {
    /** Eixo (x) e centro vertical do elipsoide, no referencial local do coração. */
    cx: number;
    yc: number;
    rIn: number;
    hIn: number;
    rOut: number;
    hOut: number;
    /** Profundidade da metade de trás em relação ao raio (1 = circular). */
    zs: number;
    /** Plano da truncadura. */
    cutY: number;
    /** 'below': câmara abaixo do plano (ventrículo, polo = ápice); 'above': acima (átrio, polo = teto). */
    keep: 'below' | 'above';
    /** Se presente, substitui o elipsoide (cx, yc, r, h) por um perfil anel a anel. */
    ring?: RingFn;
}

const NU = 30;
const NV = 26;
const GRID = NU * NV;
const OFF_OUT = GRID;
const OFF_CUT_A = GRID * 2;
const OFF_CUT_B = OFF_CUT_A + NU * 2;
const OFF_RIM = OFF_CUT_B + NU * 2;
export const CHAMBER_VERTS = OFF_RIM + NV * 2;

/**
 * Índices com a face da frente de cada superfície virada para o lado da sua normal (FrontSide).
 * No átrio o meridiano corre de cima para baixo, o que inverte todas as orientações.
 */
const buildIndex = (keep: ChamberShape['keep']): Uint16Array => {
    const idx: number[] = [];
    const inv = keep === 'above';
    const quad = (a: number, b: number, c: number, d: number, flip: boolean) =>
        (flip !== inv ? idx.push(a, c, b, a, d, c) : idx.push(a, b, c, a, c, d));
    for (let g = 0; g < 2; g++) {
        const o = g === 0 ? 0 : OFF_OUT;
        for (let i = 0; i < NU - 1; i++) {
            for (let j = 0; j < NV - 1; j++) {
                const v = o + i * NV + j;
                quad(v, v + 1, v + NV + 1, v + NV, g === 1);
            }
        }
    }
    for (const o of [OFF_CUT_A, OFF_CUT_B]) {
        for (let i = 0; i < NU - 1; i++) quad(o + i * 2, o + i * 2 + 1, o + i * 2 + 3, o + i * 2 + 2, o === OFF_CUT_A);
    }
    for (let j = 0; j < NV - 1; j++) quad(OFF_RIM + j * 2, OFF_RIM + j * 2 + 1, OFF_RIM + j * 2 + 3, OFF_RIM + j * 2 + 2, true);
    return new Uint16Array(idx);
};

const INDEX = { below: buildIndex('below'), above: buildIndex('above') };
/** φ de π a 2π: metade de trás (sen φ ≤ 0). φ = π e φ = 2π são as duas bordas do corte (z = 0). */
const COS = Float32Array.from({ length: NV }, (_, j) => Math.cos(Math.PI + (Math.PI * j) / (NV - 1)));
const SIN = Float32Array.from({ length: NV }, (_, j) => Math.min(Math.sin(Math.PI + (Math.PI * j) / (NV - 1)), 0));

/** Ângulo polar (a partir do polo de baixo) onde o elipsoide cruza o plano y. */
const polarAt = (yc: number, h: number, y: number): number => Math.acos(Math.max(Math.min((yc - y) / h, 1), -1));

/** Faixa do ângulo polar desenhada (do polo até a truncadura). */
const polarRange = (s: ChamberShape, h: number): [number, number] =>
    s.keep === 'below' ? [0, polarAt(s.yc, h, s.cutY)] : [Math.PI, polarAt(s.yc, h, s.cutY)];

/** Ponto da superfície (fração do meridiano a partir do polo, fração da volta), no referencial local. */
const RING: RingOut = { cx: 0, r: 0, y: 0 };

export const chamberPoint = (
    s: ChamberShape, mer: number, side: number, inner: boolean, out: THREE.Vector3,
): THREE.Vector3 => {
    if (s.ring) {
        const g = s.ring(mer, inner, RING);
        const phi = Math.PI + Math.PI * side;
        return out.set(g.cx + g.r * Math.cos(phi), g.y, Math.min(g.r * Math.sin(phi), 0) * s.zs);
    }
    const R = inner ? s.rIn : s.rOut;
    const h = inner ? s.hIn : s.hOut;
    const [a0, a1] = polarRange(s, h);
    const a = a0 + (a1 - a0) * mer;
    const phi = Math.PI + Math.PI * side;
    const r = R * Math.sin(a);
    return out.set(s.cx + r * Math.cos(phi), s.yc - h * Math.cos(a), Math.min(r * Math.sin(phi), 0) * s.zs);
};

export interface Chamber {
    geometry: THREE.BufferGeometry;
    write: (s: ChamberShape) => void;
}

export const makeChamber = (keep: ChamberShape['keep']): Chamber => {
    const pos = new Float32Array(CHAMBER_VERTS * 3);
    const nrm = new Float32Array(CHAMBER_VERTS * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(nrm, 3));

    const face = new Float32Array(CHAMBER_VERTS);
    const depth = new Float32Array(CHAMBER_VERTS);
    const mer = new Float32Array(CHAMBER_VERTS);
    const side = new Float32Array(CHAMBER_VERTS);
    for (let i = 0; i < NU; i++) {
        const f = i / (NU - 1);
        for (let j = 0; j < NV; j++) {
            const sj = j / (NV - 1);
            const vi = i * NV + j;
            const vo = OFF_OUT + vi;
            face[vo] = 1; depth[vo] = 1;
            mer[vi] = f; mer[vo] = f;
            side[vi] = sj; side[vo] = sj;
        }
        for (const [o, sv] of [[OFF_CUT_A, 0], [OFF_CUT_B, 1]] as const) {
            face[o + i * 2] = 2; face[o + i * 2 + 1] = 2;
            depth[o + i * 2] = 0; depth[o + i * 2 + 1] = 1;
            mer[o + i * 2] = f; mer[o + i * 2 + 1] = f;
            side[o + i * 2] = sv; side[o + i * 2 + 1] = sv;
        }
    }
    for (let j = 0; j < NV; j++) {
        const sj = j / (NV - 1);
        face[OFF_RIM + j * 2] = 3; face[OFF_RIM + j * 2 + 1] = 3;
        depth[OFF_RIM + j * 2] = 0; depth[OFF_RIM + j * 2 + 1] = 1;
        mer[OFF_RIM + j * 2] = 1; mer[OFF_RIM + j * 2 + 1] = 1;
        side[OFF_RIM + j * 2] = sj; side[OFF_RIM + j * 2 + 1] = sj;
    }
    geometry.setAttribute('aFace', new THREE.BufferAttribute(face, 1));
    geometry.setAttribute('aDepth', new THREE.BufferAttribute(depth, 1));
    geometry.setAttribute('aMer', new THREE.BufferAttribute(mer, 1));
    geometry.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
    geometry.setIndex(new THREE.BufferAttribute(INDEX[keep], 1));
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, -1), 9);

    const put = (v: number, s: ChamberShape, R: number, h: number, sa: number, ca: number, j: number, sgn: number) => {
        const r = R * sa;
        const x = r * COS[j];
        const z = r * SIN[j] * s.zs;
        const dy = -h * ca;
        const k = v * 3;
        pos[k] = s.cx + x;
        pos[k + 1] = s.yc + dy;
        pos[k + 2] = z;
        const zz = s.zs * R;
        let nx = x / (R * R);
        let ny = dy / (h * h);
        let nz = z / (zz * zz);
        const l = Math.hypot(nx, ny, nz) || 1;
        nx = (nx / l) * sgn;
        ny = (ny / l) * sgn;
        nz = (nz / l) * sgn;
        nrm[k] = nx;
        nrm[k + 1] = ny;
        nrm[k + 2] = nz;
    };

    const copyAs = (v: number, from: number, nx: number, ny: number, nz: number) => {
        const k = v * 3;
        const f = from * 3;
        pos[k] = pos[f];
        pos[k + 1] = pos[f + 1];
        pos[k + 2] = pos[f + 2];
        nrm[k] = nx;
        nrm[k + 1] = ny;
        nrm[k + 2] = nz;
    };

    const ringA: RingOut[] = Array.from({ length: NU }, () => ({ cx: 0, r: 0, y: 0 }));

    /** Superfície de perfil livre: x = cx(y) + r(y)·cos φ, z = zs·r(y)·sen φ; normal = ∂φ × ∂y. */
    const writeRing = (s: ChamberShape, inner: boolean, off: number) => {
        const ring = s.ring as RingFn;
        for (let i = 0; i < NU; i++) ring(i / (NU - 1), inner, ringA[i]);
        for (let i = 0; i < NU; i++) {
            const a = ringA[Math.max(i - 1, 0)];
            const b = ringA[Math.min(i + 1, NU - 1)];
            const dy = b.y - a.y || 1e-4;
            const dcx = (b.cx - a.cx) / dy;
            const dr = (b.r - a.r) / dy;
            const g = ringA[i];
            for (let j = 0; j < NV; j++) {
                const c = COS[j];
                const sn = SIN[j];
                const k = (off + i * NV + j) * 3;
                pos[k] = g.cx + g.r * c;
                pos[k + 1] = g.y;
                pos[k + 2] = g.r * sn * s.zs;
                // ∂/∂φ = (−sen φ, 0, zs cos φ) · r ; ∂/∂y = (cx' + r' cos φ, 1, zs r' sen φ)
                const t1x = -sn; const t1z = s.zs * c;
                const t2x = dcx + dr * c; const t2z = s.zs * dr * sn;
                let nx = -t1z;
                let ny = t1z * t2x - t1x * t2z;
                let nz = t1x;
                const l = Math.hypot(nx, ny, nz) || 1;
                const sgn = inner ? 1 : -1; // ∂φ × ∂y aponta para dentro
                nx = (nx / l) * sgn; ny = (ny / l) * sgn; nz = (nz / l) * sgn;
                nrm[k] = nx; nrm[k + 1] = ny; nrm[k + 2] = nz;
            }
        }
    };

    const write = (s: ChamberShape) => {
        if (s.ring) {
            writeRing(s, true, 0);
            writeRing(s, false, OFF_OUT);
            for (let i = 0; i < NU; i++) {
                copyAs(OFF_CUT_A + i * 2, i * NV, 0, 0, 1);
                copyAs(OFF_CUT_A + i * 2 + 1, OFF_OUT + i * NV, 0, 0, 1);
                copyAs(OFF_CUT_B + i * 2, i * NV + NV - 1, 0, 0, 1);
                copyAs(OFF_CUT_B + i * 2 + 1, OFF_OUT + i * NV + NV - 1, 0, 0, 1);
            }
            for (let j = 0; j < NV; j++) {
                copyAs(OFF_RIM + j * 2, (NU - 1) * NV + j, 0, 1, 0);
                copyAs(OFF_RIM + j * 2 + 1, OFF_OUT + (NU - 1) * NV + j, 0, 1, 0);
            }
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.normal.needsUpdate = true;
            return;
        }
        const [ai0, ai1] = polarRange(s, s.hIn);
        const [ao0, ao1] = polarRange(s, s.hOut);
        for (let i = 0; i < NU; i++) {
            const f = i / (NU - 1);
            const ai = ai0 + (ai1 - ai0) * f;
            const ao = ao0 + (ao1 - ao0) * f;
            const si = Math.sin(ai);
            const ci = Math.cos(ai);
            const so = Math.sin(ao);
            const co = Math.cos(ao);
            for (let j = 0; j < NV; j++) {
                put(i * NV + j, s, s.rIn, s.hIn, si, ci, j, -1);
                put(OFF_OUT + i * NV + j, s, s.rOut, s.hOut, so, co, j, 1);
            }
            // faces do corte (plano z = 0): a espessura da parede fica à vista
            copyAs(OFF_CUT_A + i * 2, i * NV, 0, 0, 1);
            copyAs(OFF_CUT_A + i * 2 + 1, OFF_OUT + i * NV, 0, 0, 1);
            copyAs(OFF_CUT_B + i * 2, i * NV + NV - 1, 0, 0, 1);
            copyAs(OFF_CUT_B + i * 2 + 1, OFF_OUT + i * NV + NV - 1, 0, 0, 1);
        }
        // anel da truncadura (plano das valvas no ventrículo, assoalho no átrio)
        const ny = s.keep === 'below' ? 1 : -1;
        for (let j = 0; j < NV; j++) {
            copyAs(OFF_RIM + j * 2, (NU - 1) * NV + j, 0, ny, 0);
            copyAs(OFF_RIM + j * 2 + 1, OFF_OUT + (NU - 1) * NV + j, 0, ny, 0);
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.normal.needsUpdate = true;
    };

    return { geometry, write };
};
