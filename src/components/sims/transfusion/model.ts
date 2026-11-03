/**
 * Modelo ilustrativo da transfusão autóloga ao longo do tempo (dias até a prova, prova = 0).
 * Âncoras (BloodDopingAnimation.tsx): basal 42–45%; altitude 8–12 semanas antes, 3–4 semanas,
 * Hct 50–55% (52–55% na coleta); reinfusão 12–24h antes: ~43% → 49–51%, limite UCI 50%;
 * depois da reinfusão, queda abrupta de reticulócitos. Formas das curvas entre as âncoras são ilustrativas.
 */

export const T_START = -112;
export const T_WEEKS_END = -7;
export const T_DAYS_START = -3;
export const T_END = 6;

export const ALT_START = -84;
export const COLLECT_T = -56;
export const REINFUSE_T = -0.75;
export const RACE_T = 0;

/**
 * Geometria do gráfico (viewBox 706 × 486). A largura do viewBox é próxima da largura real do
 * cartão (~650 px), então 1 unidade ≈ 0,92 px: os textos de 16,5 ficam com ~15 px na tela.
 */
export const VIEW_W = 706;
export const VIEW_H = 486;
export const PLOT_X0 = 84;
export const WEEKS_X1 = 470;
export const DAYS_X0 = 498;
export const PLOT_X1 = 700;
export const HCT_TOP = 140;
export const HCT_BOTTOM = 350;
export const HCT_MIN = 40;
export const HCT_MAX = 56;
export const RET_TOP = 388;
export const RET_BOTTOM = 436;

export const BASAL_LO = 42;
export const BASAL_HI = 45;
export const UCI_LIMIT = 50;

export const tx = (t: number): number => {
    if (t <= T_WEEKS_END) return PLOT_X0 + ((t - T_START) / (T_WEEKS_END - T_START)) * (WEEKS_X1 - PLOT_X0);
    if (t >= T_DAYS_START) return DAYS_X0 + ((t - T_DAYS_START) / (T_END - T_DAYS_START)) * (PLOT_X1 - DAYS_X0);
    return WEEKS_X1 + ((t - T_WEEKS_END) / (T_DAYS_START - T_WEEKS_END)) * (DAYS_X0 - WEEKS_X1);
};

export const hy = (hct: number): number => HCT_BOTTOM - ((hct - HCT_MIN) / (HCT_MAX - HCT_MIN)) * (HCT_BOTTOM - HCT_TOP);

/** %Ret relativo: 1 = habitual do atleta, 0 = mínimo do eixo. */
export const ry = (ret: number): number => RET_BOTTOM - ret * (RET_BOTTOM - RET_TOP);

const smooth = (a: number, b: number, t: number): number => {
    const p = Math.min(1, Math.max(0, (t - a) / (b - a)));
    return p * p * (3 - 2 * p);
};

const BASAL = 43.5;
const PEAK = 53.5;
const AFTER_COLLECT = 46;
const REINFUSED = 50.5;

/** Hematócrito (%) ilustrativo no tempo t (dias). */
export const hct = (t: number): number => {
    const wiggle = t < T_WEEKS_END ? 0.35 * Math.sin(t / 4.3) + 0.2 * Math.sin(t / 1.7) : 0.1 * Math.sin(t * 2);
    if (t < ALT_START) return BASAL + wiggle;
    if (t < COLLECT_T) return BASAL + (PEAK - BASAL) * smooth(ALT_START, COLLECT_T - 3, t) + wiggle * 0.5;
    if (t < COLLECT_T + 5) return PEAK + (AFTER_COLLECT - PEAK) * smooth(COLLECT_T, COLLECT_T + 5, t);
    if (t < REINFUSE_T) return AFTER_COLLECT + (BASAL - AFTER_COLLECT) * smooth(COLLECT_T + 5, COLLECT_T + 20, t) + wiggle * smooth(COLLECT_T + 5, COLLECT_T + 20, t);
    return BASAL + (REINFUSED - BASAL) * smooth(REINFUSE_T, REINFUSE_T + 0.35, t) - 0.12 * Math.max(0, t - 0.5) + wiggle;
};

/** Reticulócitos relativos: estáveis até a reinfusão; depois, a medula "apagada". */
export const ret = (t: number): number => {
    const wiggle = t < T_WEEKS_END ? 0.03 * Math.sin(t / 3.1) : 0.01 * Math.sin(t * 3);
    if (t < REINFUSE_T) return 0.86 + wiggle;
    return 0.86 - 0.58 * smooth(REINFUSE_T + 0.2, REINFUSE_T + 3.2, t) + wiggle;
};

const sampleTimes = (): number[] => {
    const out: number[] = [];
    for (let t = T_START; t <= T_WEEKS_END; t += 0.5) out.push(t);
    for (let t = T_DAYS_START; t <= T_END + 1e-9; t += 0.05) out.push(t);
    return out;
};

const TIMES = sampleTimes();

export const linePath = (fn: (t: number) => number, toY: (v: number) => number, from = T_START, to = T_END): string =>
    TIMES.filter(t => t >= from && t <= to)
        .map((t, i) => `${i === 0 ? 'M' : 'L'}${tx(t).toFixed(1)} ${toY(fn(t)).toFixed(1)}`)
        .join(' ');

/* ---------- Coletas do ABP nos dois cenários ---------- */

export interface AbpSample {
    readonly t: number;
    readonly kind: 'basal' | 'rotina' | 'oportuna';
}

export type Scenario = 'completo' | 'falho';

export const SAMPLES: Record<Scenario, readonly AbpSample[]> = {
    completo: [
        { t: -105, kind: 'basal' },
        { t: -98, kind: 'basal' },
        { t: -91, kind: 'basal' },
        { t: -28, kind: 'rotina' },
        { t: 1, kind: 'oportuna' },
    ],
    falho: [
        { t: -98, kind: 'basal' },
        { t: -28, kind: 'rotina' },
    ],
};

/** Corredor individual (ilustrativo) que nasce depois da 3ª amostra basal. */
export const BAND_HCT = { lo: 42.2, hi: 44.8 } as const;
export const BAND_RET = { lo: 0.72, hi: 1 } as const;
export const BAND_FROM = -91;

/** Coletas de rotina mostradas durante o armazenamento (passo 1). */
export const STORAGE_CHECKS = [-42, -28, -14] as const;
