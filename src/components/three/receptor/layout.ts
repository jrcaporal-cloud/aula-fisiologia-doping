import * as THREE from 'three';

/*
 * Layout da cena (unidades do mundo) e utilitários de tempo.
 * Toda a coreografia é uma função pura do "tempo da aula" T (0 = visão geral … 8 = hipertrofia):
 * a etapa k mostra o estado em T = k, e a transição k-1 → k é o processo acontecendo.
 * Escalas são esquemáticas: moléculas, proteínas e organelas não estão em proporção.
 */

export const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
/** Fração linear de T dentro de [a, b]. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const smoother = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
/** Fração suavizada de T dentro de [a, b]. */
export const phase = (t: number, a: number, b: number) => smoother(seg(t, a, b));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Gerador pseudoaleatório determinístico (as formas não mudam entre renders). */
export const rng = (seed: number) => {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
};

// ---------- Compartimentos ----------
export const MEMBRANE_X = 15;
/** Superfície da membrana: curva-se em direção ao citosol nas bordas (a célula é convexa). */
export const memX = (y: number, z: number) => MEMBRANE_X - 0.018 * y * y - 0.004 * z * z;
/** Recorte frontal da membrana (vista em corte transversal). */
export const MEMBRANE_CUT_Z = 3.0;
export const NUCLEUS_CENTER = V(-17, 0, 0);
export const NUCLEUS_R = 15;
export const NUCLEUS_R_INNER = 14.45;
export const PORE_HOLE = 2.75;

const n = (x: number, y: number, z: number) => V(x, y, z).normalize();
/** Janela de corte do envelope nuclear (mostra o nucleoplasma e o DNA). */
export const NUC_CUT_DIR = V(0.75, 0.42, 0.52).normalize();
export const NUC_CUT_ANG = 0.66;

const POOL = [
    n(1, 0.5, -0.5), n(1, -0.62, -0.42), n(0.75, 0.95, 0.05), n(0.8, -0.95, 0.25), n(0.85, 0.15, -1.0),
    n(0.55, -0.45, -1.0), n(0.7, -0.4, 1.0), n(0.3, 0.9, -0.6), n(0.45, -1, -0.3), n(0.2, 0.2, 1.1),
    n(0.95, -0.3, -1.1), n(0.4, 1, 0.9), n(0.6, -1, 0.9), n(1, 0.75, -0.2),
];
/** Direções (a partir do centro do núcleo) dos complexos de poro. 0 = importação, 1 = exportação. */
export const PORE_DIRS: THREE.Vector3[] = (() => {
    const out = [n(1, 0.1, -0.35), n(0.9, -0.55, 0.3)];
    POOL.forEach(d => {
        if (d.angleTo(NUC_CUT_DIR) < NUC_CUT_ANG + 0.24) return;
        if (out.some(o => o.angleTo(d) < 0.42)) return;
        if (out.length < 12) out.push(d);
    });
    return out;
})();
export const porePoint = (i: number, r = NUCLEUS_R) => PORE_DIRS[i].clone().multiplyScalar(r).add(NUCLEUS_CENTER);

// ---------- Receptor ----------
export const AR_REST = [V(8, 1.6, 0.6), V(9.6, -2.6, -3.0)];
/** Bolsão de ligação no referencial local do receptor (a abertura fica em +x). */
export const POCKET_LOCAL = V(0.25, 0.1, 0);
/** Centro do dímero logo depois de formado. */
export const DIMER_FORM = V(8.6, -0.5, -1.0);
/** Meia distância entre os dois receptores no dímero (eixo z local). */
export const DIMER_HALF = 2.05;

// ---------- DNA ----------
export const DNA_CENTER = V(-9, -1, 0);
export const DNA_BP = 50;
export const DNA_RISE = 0.3;
export const DNA_R = 1.0;
export const ARE_Z = -3.4;
export const ARE_HALF = 2.0;
/** Posição do referencial do dímero quando ancorado ao ARE. */
export const DOCK = V(-9, 1.55, ARE_Z);
export const RNAP_START_Z = -0.6;
export const RNAP_END_Z = 5.4;

// ---------- Tradução e sarcômero ----------
export const SARC_CENTER = V(6, -10.5, 2);
export const SARC_HALF = 5.5;

// ---------- Janela de cada processo (em T) ----------
export const W = {
    diffuse: [0.05, 0.95],
    enterPocket: [1.0, 1.42],
    h12: [1.36, 1.72],
    hsp: [1.5, 1.98],
    dimer: [2.05, 2.92],
    transloc: [3.02, 4.0],
    dock: [4.0, 4.42],
    src1: [4.32, 4.75],
    rnapIn: [4.55, 4.98],
    bubble: [5.0, 5.2],
    transcribe: [5.12, 5.95],
    rnapOut: [6.0, 6.3],
    export: [6.12, 6.6],
    riboAssemble: [6.55, 6.7],
    translate: [6.66, 7.0],
    deliver: [7.02, 7.6],
    grow: [7.35, 8.0],
} as const;

export type Win = readonly [number, number];
export const ph = (t: number, w: Win) => phase(t, w[0], w[1]);
export const sg = (t: number, w: Win) => seg(t, w[0], w[1]);
