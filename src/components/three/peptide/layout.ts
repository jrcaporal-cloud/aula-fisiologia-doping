import * as THREE from 'three';
import { V, phase } from '../receptor/layout';
import type { PeptideLigand } from '../../../data/peptideSteps';

/*
 * Layout da cena da via de membrana (unidades do mundo). A membrana é horizontal (y = 0): meio
 * extracelular em cima, citosol embaixo. O receptor de grelina fica à esquerda (lado s = −1) e o de
 * GHRH à direita (s = +1); cada lado tem a sua proteína G e a sua enzima. Grânulos de GH no centro.
 * Toda a coreografia é função pura do tempo da aula T (etapa k = estado em T = k).
 */

export type Side = -1 | 1;
export const sideOf = (l: PeptideLigand): Side => (l === 'ghrp' ? -1 : 1);
export const ligandOf = (s: Side): PeptideLigand => (s < 0 ? 'ghrp' : 'ghrh');

// ---------- Membrana ----------
/** Altura das cabeças polares (face de fora = +, face de dentro = −). */
export const MEM_HALF = 1.05;
export const MEM_X = 15.5;
export const MEM_Z0 = -8.5;
/** Recorte frontal (a membrana aparece em corte transversal). */
export const MEM_CUT_Z = 1.1;

// ---------- Receptores (7 hélices) ----------
export const RECEPTOR_X = 3.6;
export const RING_R = 1.05;
export const HELIX_HALF = 2.1;
export const receptorBase = (s: Side) => V(s * RECEPTOR_X, 0, 0);
/** Fundo do bolsão de ligação (face de fora), no referencial do receptor. */
export const POCKET_Y = 1.45;
/** Profundidade final da internalização (etapa 7). */
export const ENDO_DEPTH = 4.2;

// ---------- Proteína G ----------
/** Quadro do heterotrímero em repouso e acoplado (as subunidades ficam abaixo, em y negativo). */
export const trimerRest = (s: Side) => V(s * (RECEPTOR_X + 2.6), 0, 1.0);
export const trimerCoupled = (s: Side) => V(s * RECEPTOR_X, 0, 0);
export const ALPHA_LOCAL = V(0, -2.3, 0);
export const betaLocal = (s: Side) => V(-s * 1.55, -2.55, 0.15);
export const gammaLocal = (s: Side) => V(-s * 1.8, -1.7, 0.55);
/** Trímeros extras (amplificação): repouso do quadro. */
const buildExtra = (s: Side) => [V(s * (RECEPTOR_X - 0.6), 0, -3.0), V(s * (RECEPTOR_X + 1.7), 0, -2.6)];
const EXTRA: Record<Side, readonly THREE.Vector3[]> = { [-1]: buildExtra(-1), [1]: buildExtra(1) } as Record<Side, readonly THREE.Vector3[]>;
/** Somente leitura. */
export const extraTrimers = (s: Side): readonly THREE.Vector3[] => EXTRA[s];

// ---------- Enzimas e mensageiros ----------
/** Centro da enzima principal + duas extras (amplificação), logo abaixo da face de dentro. */
const buildEnzymes = (s: Side) => [V(s * 9.6, -2.15, 0.4), V(s * 8.0, -2.15, -3.1), V(s * 11.4, -2.15, -1.9)];
const ENZ: Record<Side, readonly THREE.Vector3[]> = { [-1]: buildEnzymes(-1), [1]: buildEnzymes(1) } as Record<Side, readonly THREE.Vector3[]>;
/** Somente leitura: não mutar os vetores devolvidos. */
export const enzymes = (s: Side): readonly THREE.Vector3[] => ENZ[s];
export const ER_CENTER = V(-8.8, -8.6, -2.0);
/** Achatamento vertical das cisternas do retículo. */
export const ER_SQUASH = 0.62;
export const ER_TUBE_R = [0.62, 0.5];
/** Cisternas do retículo (referencial local, antes do achatamento). */
export const ER_CURVES = [
    [V(-4.4, 0.5, 0.8), V(-2.4, 1.2, 2.5), V(0.2, 1.45, 2.9), V(2.8, 1.1, 2.2), V(4.0, 0.3, 0.6)],
    [V(-3.6, -1.3, -0.6), V(-1.6, -0.7, 0.7), V(0.6, -0.6, 1.0), V(2.6, -1.0, 0.2)],
].map(a => new THREE.CatmullRomCurve3(a));
/** Ponto absoluto sobre a cisterna i (u ∈ [0,1]), deslocado `up` acima do eixo do tubo. */
export const erPoint = (i: number, u: number, up: number, out: THREE.Vector3): THREE.Vector3 => {
    ER_CURVES[i].getPoint(u, out);
    out.y = out.y * ER_SQUASH + up;
    return out.add(ER_CENTER);
};
/** Canais do retículo que o IP3 abre (no topo da cisterna de cima). */
export const ER_CHANNELS = [0.22, 0.5, 0.78].map(u => erPoint(0, u, ER_TUBE_R[0] * ER_SQUASH + 0.12, new THREE.Vector3()));
export const CA_CHANNEL = V(12.6, 0, 0.2);
/** Partículas de mensageiro (IP3/AMPc) e de Ca²⁺; as primeiras nascem na etapa 4, o resto na 5. */
export const MSG_N = 150;
export const CA_N = 380;
export const FIRST_MSG = 30;
export const FIRST_CA = 80;
export const PKA_POS = [V(7.6, -5.4, 0.9), V(10.6, -5.8, -1.4)];

// ---------- Grânulos de GH ----------
export interface GranuleSpec { rest: THREE.Vector3; fuse: THREE.Vector3 | null }
export const GRANULE_R = 0.95;
export const GRANULES: GranuleSpec[] = [
    { rest: V(0.0, -6.0, 0.5), fuse: V(0.0, -1.5, 0.5) },
    { rest: V(-1.9, -7.5, -2.4), fuse: V(-1.5, -1.5, -2.4) },
    { rest: V(2.1, -7.2, -1.6), fuse: V(1.8, -1.5, -1.6) },
    { rest: V(-5.0, -9.4, -0.6), fuse: null },
    { rest: V(5.3, -9.6, -1.4), fuse: null },
];
export const GH_PER_GRANULE = 46;
/** Destino do GH (rótulo "sangue → fígado → IGF-1"). */
export const BLOOD = V(0.4, 3.5, -2.5);

// ---------- Janelas de cada processo (em T) ----------
export const PW = {
    arrive: [0.05, 0.68],
    bounce: [0.66, 0.98],
    dock: [1.04, 1.62],
    h6: [1.5, 1.92],
    couple: [2.02, 2.36],
    gdpOut: [2.32, 2.5],
    gtpIn: [2.42, 2.64],
    slide: [2.64, 2.98],
    enzyme: [3.02, 3.25],
    msg1: [3.1, 3.72],
    ca: [3.42, 3.96],
    wave: [4.0, 4.35],
    extraSlide: [4.2, 4.6],
    amp: [4.12, 4.92],
    granUp: [5.02, 5.48],
    fuse: [5.42, 5.7],
    release: [5.55, 5.98],
    reseal: [6.15, 6.6],
    toBlood: [6.02, 6.85],
    hydro: [6.04, 6.22],
    alphaBack: [6.18, 6.7],
    arrestin: [6.12, 6.4],
    endo: [6.38, 6.94],
    fade: [6.2, 6.85],
} as const;

export type PWin = readonly [number, number];
export const pp = (t: number, w: PWin) => phase(t, w[0], w[1]);
