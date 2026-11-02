/**
 * Modelo ilustrativo da noite do controle. Eixo x em horas a partir das 22h (t = 0 → 22h; t = 25 → 23h do dia seguinte).
 * Pontos-âncora (todos da aula):
 * - GH endógeno em pulsos de alta amplitude no sono profundo (fase N3) — slide 35, card "Pulsatilidade";
 * - rhGH injetado às 23h; t½ IV ~15–20 min; t½ SC ~3–4 h; "completamente eliminado do plasma antes do controle
 *   matinal às 6h" — slide 35, card "Meia-vida crítica". Como no slide 12 (ghaxis/chartModel.ts), a curva SC cai à
 *   metade ~3 h depois do pico e chega a zero antes das 6h para respeitar as duas afirmações;
 * - teste de isoformas 20/22 kDa exige amostra < 12 h após o uso — slide 35, card "Pulsatilidade";
 * - IGF-1 com meia-vida ~15 h (ligado à IGFBP-3) — slide 35, card "O eixo hepático". A subida após o GH é forma livre.
 */

export interface Pt { readonly x: number; readonly y: number }

export const T_MAX = 25;
export const INJ_T = 1; // 23h
export const CONTROL_T = 8; // 06h
export const ISO_WINDOW_H = 12; // < 12 h após o uso
export const DETECT_WINDOW_H = 24; // janela urinária/sanguínea fecha em < 24 h
export const SLEEP: readonly [number, number] = [1, 9]; // 23h → 07h

/** Blocos de sono profundo (N3) — posição ilustrativa; os pulsos de GH caem dentro deles. */
export const N3_BLOCKS: readonly (readonly [number, number])[] = [[1.55, 2.45], [3.05, 3.85], [4.5, 5.2], [6.35, 6.95]];

/** Hora do relógio para um t (arredonda para 15 min): 8 → "06h", 8.5 → "06h30". */
export const clockLabel = (t: number): string => {
    const totalMin = Math.round(((22 + t) * 60) / 15) * 15;
    const h = Math.floor(totalMin / 60) % 24;
    const m = totalMin % 60;
    return `${String(h).padStart(2, '0')}h${m ? String(m).padStart(2, '0') : ''}`;
};

export const sampleFn = (f: (x: number) => number, x0: number, x1: number, n = 200): Pt[] =>
    Array.from({ length: n + 1 }, (_, i) => {
        const x = x0 + ((x1 - x0) * i) / n;
        return { x, y: f(x) };
    });

const gaussian = (x: number, c: number, w: number): number => Math.exp(-((x - c) ** 2) / (2 * w * w));
const clamp01 = (u: number): number => Math.min(1, Math.max(0, u));
const smooth = (u: number): number => {
    const c = clamp01(u);
    return c * c * (3 - 2 * c);
};

/* ── GH endógeno: pulsos noturnos (N3) grandes, pulsos diurnos pequenos ── */
const PULSES: readonly (readonly [number, number, number])[] = [
    [2.0, 1.0, 0.24], [3.45, 0.74, 0.24], [4.85, 0.5, 0.22], [6.65, 0.32, 0.2],
    [10.6, 0.12, 0.25], [13.2, 0.15, 0.25], [16.1, 0.1, 0.25], [19.0, 0.14, 0.25], [22.0, 0.11, 0.25], [24.5, 0.2, 0.25],
];
const BASE = 0.04;
export const ghEndo = (t: number): number => BASE + PULSES.reduce((s, [c, a, w]) => s + a * gaussian(t, c, w), 0);

/* ── rhGH exógeno ── */
const EXO_PEAK = 0.82;
const SC_PEAK_T = 2; // 00h
const SC_HALF_H = 3; // metade do pico ~3 h depois (faixa ~3–4 h da aula)
const SC_TAU = SC_HALF_H / Math.sqrt(Math.LN2);
const SC_GONE_T = 7.5; // 05h30: fora do plasma antes das 6h
export const SC_HALF_T = SC_PEAK_T + SC_HALF_H;
export const SC_PEAK = { t: SC_PEAK_T, y: EXO_PEAK } as const;

export const exoSc = (t: number): number => {
    if (t <= INJ_T) return 0;
    if (t <= SC_PEAK_T) return EXO_PEAK * smooth((t - INJ_T) / (SC_PEAK_T - INJ_T));
    const taper = 1 - smooth((t - 6) / (SC_GONE_T - 6));
    return EXO_PEAK * Math.exp(-(((t - SC_PEAK_T) / SC_TAU) ** 2)) * taper;
};

export const IV_HALF_H = 17.5 / 60; // ~15–20 min
const IV_RISE_H = 0.05;
export const exoIv = (t: number): number => {
    if (t <= INJ_T) return 0;
    if (t <= INJ_T + IV_RISE_H) return EXO_PEAK * smooth((t - INJ_T) / IV_RISE_H);
    return EXO_PEAK * 0.5 ** ((t - INJ_T - IV_RISE_H) / IV_HALF_H);
};

export type Route = 'sc' | 'iv';
export const exoFn = (route: Route): ((t: number) => number) => (route === 'sc' ? exoSc : exoIv);

/* ── IGF-1 (eixo direito, u.a.): sobe devagar após o GH e decai com t½ ~15 h ── */
export const IGF_HALF_H = 15;
const KA = Math.LN2 / 2;
const KE = Math.LN2 / IGF_HALF_H;
const IGF_BASE = 0.32;
const IGF_RISE = 0.5;
const bateman = (dt: number): number => Math.exp(-KE * dt) - Math.exp(-KA * dt);
const T_PEAK_REL = Math.log(KA / KE) / (KA - KE);
const BATEMAN_MAX = bateman(T_PEAK_REL);
export const igf = (t: number): number => (t <= INJ_T ? IGF_BASE : IGF_BASE + (IGF_RISE * bateman(t - INJ_T)) / BATEMAN_MAX);
export const IGF_BASELINE = IGF_BASE;
