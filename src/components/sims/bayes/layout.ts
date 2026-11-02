import { N_EXAMS, Y_MAX, Y_MIN } from './model';

/** Geometria do gráfico (unidades do viewBox), compartilhada entre a série temporal e a faixa de Bayes. */
export const VB_W = 760;
export const VB_H = 452;
export const PL = 64;
export const PLOT_R = 552;
export const TOP = 30;
export const BOTTOM = 384;
export const STRIP_X0 = 590;
export const STRIP_X1 = 750;

const FIRST_SLOT = PL + 96;
const LAST_SLOT = PLOT_R - 40;
export const SLOT_W = (LAST_SLOT - FIRST_SLOT) / (N_EXAMS - 1);

export const slotX = (k: number): number => FIRST_SLOT + k * SLOT_W;
/** Nós do corredor: início (priori), um por exame e a borda direita. */
export const NODE_X: readonly number[] = [PL, ...Array.from({ length: N_EXAMS }, (_, k) => slotX(k)), PLOT_R];

export const yOf = (v: number): number => BOTTOM - ((v - Y_MIN) / (Y_MAX - Y_MIN)) * (BOTTOM - TOP);
export const vOf = (y: number): number => Y_MIN + ((BOTTOM - y) / (BOTTOM - TOP)) * (Y_MAX - Y_MIN);

/** Curva monotônica (estilo d3.curveMonotoneX): suave, sem ultrapassar os nós. */
const tangents = (xs: readonly number[], ys: readonly number[]): number[] => {
    const n = xs.length;
    const s = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i]));
    return xs.map((_, i) => {
        if (i === 0) return s[0];
        if (i === n - 1) return s[n - 2];
        const s0 = s[i - 1];
        const s1 = s[i];
        if (s0 * s1 <= 0) return 0;
        const h0 = xs[i] - xs[i - 1];
        const h1 = xs[i + 1] - xs[i];
        const p = (s0 * h1 + s1 * h0) / (h0 + h1);
        return Math.sign(s0) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p));
    });
};

const curve = (xs: readonly number[], ys: readonly number[], reverse: boolean): string => {
    const t = tangents(xs, ys);
    const segs = xs.slice(1).map((x1, i) => {
        const x0 = xs[i];
        const h = (x1 - x0) / 3;
        return { a: [x0, ys[i]], c1: [x0 + h, ys[i] + t[i] * h], c2: [x1 - h, ys[i + 1] - t[i + 1] * h], b: [x1, ys[i + 1]] };
    });
    if (!reverse) return segs.map(g => `C${g.c1[0]},${g.c1[1]} ${g.c2[0]},${g.c2[1]} ${g.b[0]},${g.b[1]}`).join(' ');
    return [...segs].reverse().map(g => `C${g.c2[0]},${g.c2[1]} ${g.c1[0]},${g.c1[1]} ${g.a[0]},${g.a[1]}`).join(' ');
};

export const bandPath = (lo: readonly number[], hi: readonly number[]): string =>
    `M${NODE_X[0]},${hi[0]} ${curve(NODE_X, hi, false)} L${NODE_X[NODE_X.length - 1]},${lo[lo.length - 1]} ${curve(NODE_X, lo, true)} Z`;

export const edgePath = (ys: readonly number[]): string => `M${NODE_X[0]},${ys[0]} ${curve(NODE_X, ys, false)}`;
