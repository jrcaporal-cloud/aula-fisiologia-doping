import * as THREE from 'three';
import { V, clamp01, lerp, phase, seg, smooth } from '../receptor/layout';
import {
    ALPHA_LOCAL, FIRST_MSG, MSG_N, ENDO_DEPTH, MEM_HALF, POCKET_Y, PW, RECEPTOR_X, enzymes, extraTrimers, pp,
    receptorBase, trimerCoupled, trimerRest, type Side,
} from './layout';

/*
 * Coreografia da via de membrana: posições em função do tempo da aula T (e do relógio, só para
 * micro-movimentos). Funções puras que escrevem em vetores de saída para não alocar por quadro.
 * `active` = lado do receptor escolhido pelo ligante; o outro lado fica em repouso.
 */

const tv = new THREE.Vector3();
const tv2 = new THREE.Vector3();
const tv3 = new THREE.Vector3();
const IDENT = new THREE.Quaternion();
const tumble = new THREE.Euler();
const HELIX_BOTTOM = 2.1;

/** Constante por lado, calculada uma vez (as funções de layout criam um vetor novo a cada chamada). */
const bySide = (f: (s: Side) => THREE.Vector3): Record<Side, THREE.Vector3> =>
    ({ [-1]: f(-1), [1]: f(1) }) as Record<Side, THREE.Vector3>;
const REC_BASE = bySide(receptorBase);
const T_REST = bySide(trimerRest);
const T_COUPLED = bySide(trimerCoupled);

// ------------------------------------------------------------------ receptor

/** Afundamento do receptor ativo na internalização (etapa 7). */
export const receptorDrop = (s: Side, active: Side, T: number): number =>
    s === active ? -ENDO_DEPTH * pp(T, PW.endo) : 0;

export const receptorPos = (s: Side, active: Side, T: number, out: THREE.Vector3): THREE.Vector3 =>
    out.copy(REC_BASE[s]).setY(receptorDrop(s, active, T));

/** Inclinação da hélice 6 (rad): ela se afasta do feixe quando o receptor é ativado. */
export const helix6Angle = (s: Side, active: Side, T: number): number =>
    s === active ? 0.42 * pp(T, PW.h6) : 0;

// ------------------------------------------------------------------ peptídeo

const IMPACT = bySide(s => V(s * 0.75, MEM_HALF + 0.5, 0.6));
const RECOIL = bySide(s => V(s * 1.0, MEM_HALF + 1.35, 0.65));
const START = bySide(s => V(s * 6.5, 4.0, 0.8));

export interface PeptideState { compact: number; pulse: number }
const pepScratch: PeptideState = { compact: 0, pulse: 0 };

/**
 * Centro do peptídeo; `q` recebe a orientação. Devolve quanto ele está "dobrado" no bolsão.
 * Sem `out`, devolve um objeto de rascunho reaproveitado (ler na hora, não guardar).
 */
export const peptidePose = (s: Side, T: number, clock: number, p: THREE.Vector3, q: THREE.Quaternion, out: PeptideState = pepScratch): PeptideState => {
    const a = pp(T, PW.arrive);
    const b = pp(T, PW.bounce);
    const d = pp(T, PW.dock);
    p.copy(START[s]).lerp(IMPACT[s], a);
    if (b > 0) p.lerp(RECOIL[s], b);
    if (d > 0) {
        // sobe um pouco, desliza até o receptor e desce no bolsão
        const above = tv.set(s * RECEPTOR_X, 3.4, 0.5);
        const pocket = tv2.set(s * RECEPTOR_X, POCKET_Y + 0.35, 0);
        const k1 = clamp01(d / 0.6);
        const k2 = clamp01((d - 0.6) / 0.4);
        p.lerp(above, smooth(k1));
        if (k2 > 0) p.lerp(pocket, smooth(k2));
        p.y += receptorDrop(s, s, T);
    }
    const free = 1 - d;
    p.x += Math.sin(clock * 0.9 + 1) * 0.12 * free;
    p.y += Math.cos(clock * 0.7) * 0.1 * free * (1 - phase(T, 0.4, 0.7));
    p.z += Math.sin(clock * 0.6 + 2) * 0.1 * free;
    tumble.set(0.4 + clock * 0.21 + T * 1.7, clock * 0.17 + T * 2.3, 0.2 + clock * 0.13);
    q.setFromEuler(tumble).slerp(IDENT, d);
    // pulso de "barrado" quando bate na membrana
    out.compact = d;
    out.pulse = phase(T, 0.6, 0.72) * (1 - phase(T, 1.05, 1.35));
    return out;
};

// ------------------------------------------------------------------ proteína G

/** Quadro do heterotrímero principal (as subunidades ficam abaixo dele). */
export const trimerFrame = (s: Side, active: Side, T: number, out: THREE.Vector3): THREE.Vector3 => {
    out.copy(T_REST[s]);
    if (s !== active) return out;
    const c = pp(T, PW.couple) * (1 - pp(T, PW.alphaBack));
    return out.lerp(T_COUPLED[s], c);
};

const DOCK_OFF = bySide(s => V(-s * 1.4, -0.15, 0.1));
const alphaDock = (s: Side, e: number, out: THREE.Vector3) => out.copy(enzymes(s)[e]).add(DOCK_OFF[s]);

const slidePath = (s: Side) => new THREE.CatmullRomCurve3([
    trimerCoupled(s).add(ALPHA_LOCAL),
    V(s * (RECEPTOR_X + 2.4), -2.55, 1.6),
    alphaDock(s, 0, new THREE.Vector3()),
], false, 'centripetal');
const SLIDE = { [-1]: slidePath(-1), [1]: slidePath(1) } as Record<Side, THREE.CatmullRomCurve3>;

/** Subunidade α do trímero principal. */
export const alphaPos = (s: Side, active: Side, T: number, out: THREE.Vector3): THREE.Vector3 => {
    if (s !== active) return trimerFrame(s, active, T, out).add(ALPHA_LOCAL);
    const sl = pp(T, PW.slide);
    const back = pp(T, PW.alphaBack);
    if (sl <= 0) return trimerFrame(s, active, T, out).add(ALPHA_LOCAL);
    SLIDE[s].getPointAt(sl, out);
    if (back > 0) out.lerp(tv2.copy(T_REST[s]).add(ALPHA_LOCAL), back);
    return out;
};

/** Subunidades α das proteínas G extras (amplificação): vão até as enzimas 1 e 2. */
export const extraAlphaPos = (s: Side, active: Side, i: number, T: number, out: THREE.Vector3): THREE.Vector3 => {
    const rest = tv2.copy(extraTrimers(s)[i]).add(ALPHA_LOCAL);
    out.copy(rest);
    if (s !== active) return out;
    const k = phase(T, PW.extraSlide[0] + i * 0.06, PW.extraSlide[1] + i * 0.06) * (1 - pp(T, PW.alphaBack));
    if (k <= 0) return out;
    alphaDock(s, i + 1, tv);
    const mid = tv3.copy(rest).lerp(tv, 0.5);
    mid.z += i === 0 ? 1.2 : -1.6;
    mid.y -= 0.35;
    // Bézier quadrática rest → mid → dock
    const u = 1 - k;
    return out.set(0, 0, 0).addScaledVector(rest, u * u).addScaledVector(mid, 2 * u * k).addScaledVector(tv, k * k);
};

export interface NucleotideState { offset: number; scale: number; gtp: number }
const nucScratch: NucleotideState = { offset: 0, scale: 1, gtp: 0 };
const setNuc = (o: NucleotideState, offset: number, scale: number, gtp: number) => {
    o.offset = offset;
    o.scale = scale;
    o.gtp = gtp;
    return o;
};

/**
 * Nucleotídeo no bolso da α principal: GDP sai, GTP entra; na etapa 7 o GTP é hidrolisado (volta a GDP).
 * Sem `o`, escreve num objeto de rascunho reaproveitado (ler na hora, não guardar).
 */
export const nucleotide = (s: Side, active: Side, T: number, o: NucleotideState = nucScratch): NucleotideState => {
    if (s !== active) return setNuc(o, 0, 1, 0);
    const out = pp(T, PW.gdpOut);
    const inn = pp(T, PW.gtpIn);
    const hydro = pp(T, PW.hydro);
    if (out < 1) return setNuc(o, out * 1.9, 1 - out, 0);
    return setNuc(o, (1 - inn) * 1.9, inn, inn * (1 - hydro));
};

/** GTP das α extras (aceso depois da onda de ativação). */
export const extraGtp = (s: Side, active: Side, i: number, T: number): number =>
    s === active ? phase(T, PW.wave[0] + 0.08 + i * 0.1, PW.wave[1] + i * 0.1) * (1 - pp(T, PW.hydro)) : 0;

/** Atividade da enzima e (0 = principal), 0…1. */
export const enzymeActivity = (s: Side, active: Side, e: number, T: number): number => {
    if (s !== active) return 0;
    const on = e === 0 ? pp(T, PW.enzyme) : phase(T, PW.extraSlide[1] - 0.05 + e * 0.06, PW.extraSlide[1] + 0.15 + e * 0.06);
    return on * (1 - pp(T, PW.fade));
};

// ------------------------------------------------------------------ amplificação e β-arrestina

/** Raio da onda de ativação que sai do receptor e alcança as proteínas G extras (0…1). */
export const waveRadius = (s: Side, active: Side, T: number): number => (s === active ? pp(T, PW.wave) : 0);
/** Opacidade da onda (0 fora da etapa 5 e no lado em repouso). */
export const waveOpacity = (s: Side, active: Side, T: number): number => Math.sin(Math.PI * waveRadius(s, active, T));

const ARRESTIN_FROM = bySide(s => V(s * (RECEPTOR_X - 1.6), -7.6, 2.2));
/** Posição da β-arrestina em `out`; devolve a escala (0 = ainda não apareceu). */
export const arrestinPos = (s: Side, T: number, out: THREE.Vector3): number => {
    const k = pp(T, PW.arrestin);
    out.copy(ARRESTIN_FROM[s]).lerp(tv.set(s * RECEPTOR_X, -HELIX_BOTTOM - 0.85, 0.15), k);
    out.y += receptorDrop(s, s, T);
    return smooth(clamp01(k * 3));
};

/** Vesícula de internalização (cresce em volta do receptor que afunda). */
export const vesicleScale = (T: number): number => lerp(0, 1, phase(T, 6.55, 6.94));

/** Fração dos mensageiros que já nasceram em T (contador de amplificação). */
export const bornFraction = (T: number): number =>
    seg(T, PW.msg1[0], PW.msg1[1]) * (FIRST_MSG / MSG_N) + seg(T, PW.amp[0], PW.amp[1] - 0.2) * (1 - FIRST_MSG / MSG_N);
