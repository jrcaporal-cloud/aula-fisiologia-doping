/**
 * Geometria da linha do tempo (viewBox) e modelo ilustrativo de eliminação:
 * fração restante = 0,5^(t / t½), com os t½ dos cartões (Clen ~35 h; Salbutamol ~4 a 6 h).
 */

export const VB = { w: 744, h: 362 } as const;
export const PLOT = { l: 178, r: 732 } as const;
export const BAND = { y: 2, h: 20 } as const;
export const LANES = { top: 28, bottom: 318, gap: 8 } as const;
export const AXIS_Y = 322;

export const T_MIN_H = 1;
export const T_MAX_H = 42 * 24; // 6 semanas

const L0 = Math.log10(T_MIN_H);
const L1 = Math.log10(T_MAX_H);

export const clamp01 = (u: number): number => Math.min(Math.max(u, 0), 1);
export const uFromHours = (h: number): number => clamp01((Math.log10(Math.max(h, T_MIN_H)) - L0) / (L1 - L0));
export const hoursFromU = (u: number): number => 10 ** (L0 + clamp01(u) * (L1 - L0));
export const xFromU = (u: number): number => PLOT.l + u * (PLOT.r - PLOT.l);
export const xFromHours = (h: number): number => xFromU(uFromHours(h));

export const remaining = (h: number, halfLifeH: number): number => 100 * 0.5 ** (h / halfLifeH);

export interface LaneBox {
    readonly top: number;
    readonly bottom: number;
    /** Topo e base da área do gráfico (100% e 0%). */
    readonly y100: number;
    readonly y0: number;
}

const LANE_H = (LANES.bottom - LANES.top - 2 * LANES.gap) / 3;

export const laneBox = (i: number): LaneBox => {
    const top = LANES.top + i * (LANE_H + LANES.gap);
    const bottom = top + LANE_H;
    return { top, bottom, y100: top + 12, y0: bottom - 10 };
};

export const yFromPct = (box: LaneBox, pct: number): number => box.y0 - (pct / 100) * (box.y0 - box.y100);

const SAMPLES = 120;

export const curvePath = (box: LaneBox, halfLifeH: number): string =>
    Array.from({ length: SAMPLES + 1 }, (_, k) => {
        const h = hoursFromU(k / SAMPLES);
        return `${k === 0 ? 'M' : 'L'} ${xFromHours(h).toFixed(1)} ${yFromPct(box, remaining(h, halfLifeH)).toFixed(1)}`;
    }).join(' ');

/** Faixa entre duas curvas (t½ mínimo e máximo). */
export const bandPath = (box: LaneBox, hMin: number, hMax: number): string => {
    const pts = (hl: number) => Array.from({ length: SAMPLES + 1 }, (_, k) => {
        const h = hoursFromU(k / SAMPLES);
        return [xFromHours(h), yFromPct(box, remaining(h, hl))] as const;
    });
    const upper = pts(hMax);
    const lower = pts(hMin).reverse();
    return [...upper, ...lower].map(([x, y], k) => `${k === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z';
};

export interface Tick {
    readonly h: number;
    readonly label: string;
    readonly major?: boolean;
}

export const TICKS: readonly Tick[] = [
    { h: 1, label: '1 h', major: true },
    { h: 6, label: '6 h' },
    { h: 24, label: '1 dia', major: true },
    { h: 72, label: '3 dias' },
    { h: 168, label: '1 sem', major: true },
    { h: 336, label: '2 sem' },
    { h: T_MAX_H, label: '6 sem', major: true },
];

export const REGIONS = [
    { h0: T_MIN_H, h1: 24, label: 'HORAS' },
    { h0: 24, h1: 168, label: 'DIAS' },
    { h0: 168, h1: T_MAX_H, label: 'SEMANAS' },
] as const;

export const formatPct = (pct: number): string => {
    if (pct >= 10) return `${Math.round(pct)}%`;
    if (pct >= 1) return `${pct.toFixed(1).replace('.', ',')}%`;
    return '<1%';
};

export const formatHours = (h: number): string => {
    if (h < 48) return `${Math.round(h)} h`;
    return `${Math.round(h / 24)} dias`;
};

/** Posição padrão do cursor de tempo em cada passo. */
export const CURSOR_PRESET: Readonly<Record<number, number>> = {
    0: uFromHours(72),
    1: uFromHours(24),
    2: uFromHours(24),
    3: uFromHours(24),
};
