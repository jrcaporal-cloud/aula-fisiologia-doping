/**
 * Curvas do mini-gráfico. Formas ilustrativas, ancoradas só nos números da aula:
 * - natural: GH em pulsos (alta amplitude no sono profundo, N3) × IGF-1 estável (t½ ~15 h) — slide 35;
 * - GHRP: pico de GH em 15–30 min, janela de ação ~60–90 min; GHRP + GHRH 4–10× no pico — HPGAxis;
 * - rhGH: injeção SC às 23h, queda à metade ~3 h após o pico (t½ SC ~3–4 h), fora do plasma antes do controle das 6h;
 *   IV t½ ~15–20 min — HPGAxis/slide 35;
 * - IGF-1: livre t½ ~10 min; ligado à IGFBP-3 t½ ~15 h (decaimento exponencial exato) — HPGAxis.
 */

export interface Pt { readonly x: number; readonly y: number }

export const sampleFn = (f: (x: number) => number, x0: number, x1: number, n = 160): Pt[] =>
    Array.from({ length: n + 1 }, (_, i) => {
        const x = x0 + ((x1 - x0) * i) / n;
        return { x, y: f(x) };
    });

const gaussian = (x: number, c: number, w: number): number => Math.exp(-((x - c) ** 2) / (2 * w * w));

/* ── Passo 0: 24 h, eixo x em horas (0 = 08h) ── */
export const SLEEP: readonly [number, number] = [15, 23];
const PULSES: readonly (readonly [number, number, number])[] = [
    [1.5, 0.14, 0.35], [4.5, 0.2, 0.35], [7.5, 0.12, 0.3], [10.5, 0.18, 0.35], [13.2, 0.13, 0.3],
    [16.0, 1.0, 0.45], [18.3, 0.62, 0.42], [20.6, 0.42, 0.4], [22.4, 0.24, 0.35],
];
export const ghNatural = (x: number): number => 0.04 + PULSES.reduce((s, [c, a, w]) => s + a * gaussian(x, c, w), 0);
export const igfNatural = (x: number): number => 0.42 + 0.025 * Math.sin((x / 24) * Math.PI * 2 - 1.2);

/* ── Passo 1: minutos após GHRP ── */
const GHRP_TP = 22;
const GHRP_K = 2.53;
/** Gama normalizado: pico = 1 em 22 min; ~0,16 em 60 min; ~0,01 em 90 min. */
export const ghrpCurve = (t: number): number => (t <= 0 ? 0 : (t / GHRP_TP) ** GHRP_K * Math.exp(GHRP_K * (1 - t / GHRP_TP)));
export const GHRP_PEAK: readonly [number, number] = [15, 30];
export const GHRP_WINDOW: readonly [number, number] = [60, 90];
export const GHRH_SYNERGY: readonly [number, number] = [4, 10];

/* ── Passo 2: horas a partir das 21h ── */
export const INJ_AT = 2; // 23h
export const CONTROL_AT = 9; // 06h
const SC_PEAK = 3; // 00h — absorção SC
const SC_HALF = 3; // metade do pico ~3 h depois (faixa ~3–4 h da aula)
const SC_TAU = SC_HALF / Math.sqrt(Math.LN2);
const smooth = (u: number): number => u * u * (3 - 2 * u);
export const rhghSc = (t: number): number => {
    if (t <= INJ_AT) return 0;
    if (t <= SC_PEAK) return smooth((t - INJ_AT) / (SC_PEAK - INJ_AT));
    return Math.exp(-(((t - SC_PEAK) / SC_TAU) ** 2));
};
export const SC_HALF_POINT: Pt = { x: SC_PEAK + SC_HALF, y: 0.5 };
export const SC_PEAK_X = SC_PEAK;
const IV_HALF_H = 17.5 / 60;
export const rhghIv = (t: number): number => (t < INJ_AT ? 0 : 0.92 * 0.5 ** ((t - INJ_AT) / IV_HALF_H));

/* ── Passo 3: horas após IGF-1 exógeno ── */
export const IGF_BOUND_HALF = 15;
const IGF_FREE_HALF = 10 / 60;
export const igfBound = (t: number): number => 0.5 ** (t / IGF_BOUND_HALF);
export const igfFree = (t: number): number => 0.5 ** (t / IGF_FREE_HALF);
