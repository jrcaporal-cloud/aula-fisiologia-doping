import { HOURS_PER_DAY, STRAT } from './model';
import { hoursFromU, uFromDay, xFromU } from './scales';

export interface Sample {
    u: number;
    v: number;
}

export type Interval = readonly [number, number];

/** Amostragem log-espaçada (horas desde a injeção). */
export const sampleLog = (fn: (h: number) => number, n = 480): Sample[] =>
    Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1);
        return { u, v: fn(hoursFromU(u)) };
    });

/** Amostragem em dias: passo menor na janela ampliada (para ver os picos diários). */
export const sampleStrat = (fn: (d: number) => number): Sample[] => {
    const out: Sample[] = [];
    for (let d = STRAT.start; d < STRAT.zoomFrom; d += 0.1) out.push({ u: uFromDay(d), v: fn(d) });
    for (let d = STRAT.zoomFrom; d <= STRAT.end + 1e-9; d += 1 / HOURS_PER_DAY) out.push({ u: uFromDay(d), v: fn(d) });
    return out;
};


export interface LaneBox {
    top: number;
    plotTop: number;
    plotBottom: number;
    effY: number;
    detY: number;
    bottom: number;
}

export const STRIP_H = 17;
const HEADER_H = 25;
const FOOTER_H = 2 * STRIP_H + 9;

export const laneBox = (top: number, height: number, strips: boolean): LaneBox => {
    const bottom = top + height;
    const plotBottom = bottom - (strips ? FOOTER_H : 8);
    return {
        top,
        plotTop: top + HEADER_H,
        plotBottom,
        effY: plotBottom + 4,
        detY: plotBottom + 4 + STRIP_H + 3,
        bottom,
    };
};

export type YMap = (v: number) => number;

export const logY = (box: LaneBox, lo: number, hi: number): YMap => (v) => {
    const l = v > 0 ? Math.log10(v) : lo;
    const f = Math.min(Math.max((l - lo) / (hi - lo), 0), 1);
    return box.plotBottom - f * (box.plotBottom - box.plotTop);
};

export const linY = (box: LaneBox, max: number): YMap => (v) =>
    box.plotBottom - Math.min(Math.max(v / max, 0), 1) * (box.plotBottom - box.plotTop);

const pt = (u: number, y: number) => `${xFromU(u).toFixed(1)},${y.toFixed(1)}`;

export const linePath = (s: readonly Sample[], y: YMap): string =>
    s.length ? `M${s.map(p => pt(p.u, y(p.v))).join('L')}` : '';

/** Área entre a curva e uma linha de base (limiar), só onde a curva está acima dela. */
export const areaAbove = (s: readonly Sample[], base: number, y: YMap): string => {
    if (!s.length) return '';
    const yb = y(base);
    const top = s.map(p => pt(p.u, y(Math.max(p.v, base)))).join('L');
    return `M${xFromU(s[0].u).toFixed(1)},${yb.toFixed(1)}L${top}L${xFromU(s[s.length - 1].u).toFixed(1)},${yb.toFixed(1)}Z`;
};

/** Área sob a curva até o chão do gráfico. */
export const areaUnder = (s: readonly Sample[], y: YMap, floorY: number): string => {
    if (!s.length) return '';
    return `M${xFromU(s[0].u).toFixed(1)},${floorY}L${s.map(p => pt(p.u, y(p.v))).join('L')}L${xFromU(s[s.length - 1].u).toFixed(1)},${floorY}Z`;
};

export const intervals = (s: readonly Sample[], pred: (v: number) => boolean): Interval[] => {
    const out: Interval[] = [];
    let start: number | null = null;
    s.forEach((p, i) => {
        const on = pred(p.v);
        if (on && start === null) start = p.u;
        if ((!on || i === s.length - 1) && start !== null) {
            out.push([start, p.u]);
            start = null;
        }
    });
    return out;
};

/** Junta intervalos separados por menos que `gap` (em u) — evita tracejado nos picos diários. */
export const mergeIntervals = (list: readonly Interval[], gap = 0.004): Interval[] =>
    list.reduce<Interval[]>((acc, cur) => {
        const last = acc[acc.length - 1];
        if (last && cur[0] - last[1] < gap) return [...acc.slice(0, -1), [last[0], cur[1]] as const];
        return [...acc, cur];
    }, []);
