import { HOURS_PER_DAY, STRAT } from './model';

/** Geometria do SVG (unidades do viewBox). */
export const VB = {
    w: 860,
    h: 452,
    pl: 44,
    pr: 846,
    bandTop: 2,
    bandH: 26,
    pillY: 33,
    lanesTop: 60,
    lanesBottom: 398,
    axisY: 404,
} as const;

const PLOT_W = VB.pr - VB.pl;

export const clamp01 = (u: number): number => Math.min(Math.max(u, 0), 1);
export const xFromU = (u: number): number => VB.pl + u * PLOT_W;
export const uFromX = (x: number): number => clamp01((x - VB.pl) / PLOT_W);

// ---------- Modo dose única: tempo desde a injeção, escala logarítmica (horas) ----------

const LOG_MIN_H = 1;
const LOG_MAX_H = 730 * HOURS_PER_DAY; // 24 meses
const L0 = Math.log10(LOG_MIN_H);
const L1 = Math.log10(LOG_MAX_H);

export const uFromHours = (h: number): number => clamp01((Math.log10(Math.max(h, LOG_MIN_H)) - L0) / (L1 - L0));
export const hoursFromU = (u: number): number => 10 ** (L0 + clamp01(u) * (L1 - L0));

export interface Tick {
    u: number;
    label: string;
    major?: boolean;
}

export const LOG_TICKS: Tick[] = [
    { u: uFromHours(1), label: '1 h' },
    { u: uFromHours(6), label: '6 h' },
    { u: uFromHours(24), label: '1 dia', major: true },
    { u: uFromHours(72), label: '3 dias' },
    { u: uFromHours(168), label: '1 sem', major: true },
    { u: uFromHours(30.4 * 24), label: '1 mês', major: true },
    { u: uFromHours(91 * 24), label: '3 meses' },
    { u: uFromHours(18 * 30.4 * 24), label: '18 meses' },
];

export interface Region {
    u0: number;
    u1: number;
    label: string;
}

/** Faixas do cabeçalho original do slide (dia 0 → limiar de competição → meses/anos). */
export const LOG_REGIONS: Region[] = [
    { u0: 0, u1: uFromHours(24), label: 'HORAS' },
    { u0: uFromHours(24), u1: uFromHours(168), label: 'DIAS' },
    { u0: uFromHours(168), u1: uFromHours(30.4 * 24), label: 'SEMANAS' },
    { u0: uFromHours(30.4 * 24), u1: 1, label: 'MESES / ANOS (RASTREIO)' },
];

// ---------- Modo estratégia: dias até a prova, últimas 4 semanas ampliadas ----------

export const ZOOM_SPLIT = 0.46;

export const uFromDay = (d: number): number => {
    if (d <= STRAT.zoomFrom) return clamp01(((d - STRAT.start) / (STRAT.zoomFrom - STRAT.start)) * ZOOM_SPLIT);
    return clamp01(ZOOM_SPLIT + ((d - STRAT.zoomFrom) / (STRAT.end - STRAT.zoomFrom)) * (1 - ZOOM_SPLIT));
};

export const dayFromU = (u: number): number => {
    const c = clamp01(u);
    if (c <= ZOOM_SPLIT) return STRAT.start + (c / ZOOM_SPLIT) * (STRAT.zoomFrom - STRAT.start);
    return STRAT.zoomFrom + ((c - ZOOM_SPLIT) / (1 - ZOOM_SPLIT)) * (STRAT.end - STRAT.zoomFrom);
};

export const STRAT_TICKS: Tick[] = [
    { u: uFromDay(-224), label: '−32 sem' },
    { u: uFromDay(-168), label: '−24 sem' },
    { u: uFromDay(-112), label: '−16 sem' },
    { u: uFromDay(-28), label: '−4 sem', major: true },
    { u: uFromDay(-21), label: '−21 d' },
    { u: uFromDay(-14), label: '−14 d' },
    { u: uFromDay(-7), label: '−7 d' },
    { u: uFromDay(0), label: 'Prova', major: true },
    { u: uFromDay(7), label: '+7 d' },
];
