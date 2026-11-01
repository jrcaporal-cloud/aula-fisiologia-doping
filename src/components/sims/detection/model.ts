/**
 * Modelo farmacocinético ILUSTRATIVO do slide "Ação vs Detecção".
 *
 * Curvas de Bateman (absorção do depósito + eliminação de 1ª ordem), normalizadas
 * pelo pico de uma dose única. Os limiares são calibrados para que os cruzamentos
 * batam com os números da aula:
 *  - Testosterona suspensão (aquosa): meia-vida ~10 h; excreção 1–3 dias (slide 15).
 *  - Nandrolona (decanoato): meia-vida ~15 dias (SteroidProfileVisualizer);
 *    efeito clínico 4–6 semanas; metabólito 19-Nor rastreável até 18 meses (slide 15).
 *  - Éster longo de testosterona (enantato/cipionato): meia-vida 7–10 dias e
 *    detecção ~3 meses ("EAA" em StackOlimpicoDisplay).
 * Tudo o que está entre esses pontos-âncora é forma qualitativa (selo "modelo ilustrativo").
 */

const LN2 = Math.LN2;
export const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30.4;

interface Bateman {
    ka: number;
    ke: number;
    norm: number;
}

const makeBateman = (absorptionHalfLife: number, eliminationHalfLife: number): Bateman => {
    const ka = LN2 / absorptionHalfLife;
    const ke = LN2 / eliminationHalfLife;
    const tPeak = Math.log(ka / ke) / (ka - ke);
    const norm = Math.exp(-ke * tPeak) - Math.exp(-ka * tPeak);
    return { ka, ke, norm };
};

const bateman = (b: Bateman, t: number): number =>
    t <= 0 ? 0 : (Math.exp(-b.ke * t) - Math.exp(-b.ka * t)) / b.norm;

/** Soma de doses (tempos na mesma unidade da curva). */
const multiDose = (b: Bateman, doses: readonly number[], t: number): number =>
    doses.reduce((acc, d) => acc + bateman(b, t - d), 0);

// ---------- Dose única (passos 0 e 1) — tempo em HORAS desde a injeção ----------

const SUSP = makeBateman(1, 10); // horas: absorção rápida (aquosa), meia-vida ~10 h
const NAND = makeBateman(1.5 * HOURS_PER_DAY, 15 * HOURS_PER_DAY); // meia-vida ~15 dias
/** Fase terminal lenta do metabólito urinário (depósito profundo) — forma ilustrativa. */
const NAND_TAIL = makeBateman(10 * HOURS_PER_DAY, 75 * HOURS_PER_DAY);
const NAND_TAIL_WEIGHT = 0.02;

export const ANCHORS = {
    suspDetectH: 2 * HOURS_PER_DAY, // dentro de "1–3 dias"
    suspDetectRangeH: [1 * HOURS_PER_DAY, 3 * HOURS_PER_DAY] as const,
    nandEffectH: 35 * HOURS_PER_DAY, // meio de "4–6 semanas"
    nandEffectRangeH: [28 * HOURS_PER_DAY, 42 * HOURS_PER_DAY] as const,
    nandDetectH: 18 * DAYS_PER_MONTH * HOURS_PER_DAY, // "até 18 meses"
    longDetectD: 3 * DAYS_PER_MONTH, // "3 meses"
} as const;

export const suspConc = (tH: number) => bateman(SUSP, tH);
export const nandConc = (tH: number) => bateman(NAND, tH);
export const nandMetab = (tH: number) =>
    bateman(NAND, tH) + NAND_TAIL_WEIGHT * bateman(NAND_TAIL, tH);

export const THRESH = {
    /** Efeito da suspensão: acima de metade do pico (ação curta, ilustrativo). */
    suspEffect: 0.5,
    suspDetect: suspConc(ANCHORS.suspDetectH),
    nandEffect: nandConc(ANCHORS.nandEffectH),
    nandDetect: nandMetab(ANCHORS.nandDetectH),
} as const;

// ---------- Estratégia (passo 2) — tempo em DIAS relativo ao dia da prova ----------

export const STRAT = {
    start: -224, // −32 semanas
    end: 7,
    zoomFrom: -28, // últimas 4 semanas ampliadas
    offSeason: [-224, -112] as const,
    clearance: [-112, 0] as const,
    lastSuspDose: -3,
} as const;

const LONG = makeBateman(1, 8); // dias: éster longo, meia-vida 7–10 dias
const SUSP_D = makeBateman(1 / HOURS_PER_DAY, 10 / HOURS_PER_DAY); // suspensão em dias

const range = (from: number, to: number, step: number): number[] =>
    Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + i * step);

/** Aplicações semanais durante o off-season (a última 1 semana antes do fim do bloco). */
export const LONG_DOSES = range(STRAT.offSeason[0], STRAT.offSeason[1] - 7, 7);
/** Aplicações diárias da suspensão na clearance window, até D−3. */
export const SUSP_DOSES = range(STRAT.clearance[0], STRAT.lastSuspDose, 1);

export const longConc = (d: number) => multiDose(LONG, LONG_DOSES, d);
export const suspConcD = (d: number) => multiDose(SUSP_D, SUSP_DOSES, d);

export const STRAT_THRESH = {
    longEffect: 0.5,
    longDetect: bateman(LONG, ANCHORS.longDetectD),
    suspEffect: THRESH.suspEffect,
    suspDetect: THRESH.suspDetect,
} as const;

/** Ganho estrutural (mionúcleos/massa): cresce enquanto o éster longo está ativo e fica retido. */
const GAIN_RATE = -Math.log(0.15) / (STRAT.offSeason[1] - STRAT.offSeason[0]);
const GAIN_DT = 0.25;
const GAIN_TABLE: number[] = (() => {
    const out: number[] = [0];
    let g = 0;
    for (let d = STRAT.start; d < STRAT.end; d += GAIN_DT) {
        if (longConc(d) >= STRAT_THRESH.longEffect) g += GAIN_RATE * (1 - g) * GAIN_DT;
        out.push(g);
    }
    return out;
})();
export const GAIN_MAX = GAIN_TABLE[GAIN_TABLE.length - 1];

export const structuralGain = (d: number): number => {
    const idx = Math.min(Math.max((d - STRAT.start) / GAIN_DT, 0), GAIN_TABLE.length - 1);
    const i = Math.floor(idx);
    const j = Math.min(i + 1, GAIN_TABLE.length - 1);
    return (GAIN_TABLE[i] + (GAIN_TABLE[j] - GAIN_TABLE[i]) * (idx - i)) / GAIN_MAX;
};

// ---------- Formatação ----------

const fmt = (n: number, digits = 0) =>
    n.toLocaleString('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: 0 });

/** "4 h", "2 dias", "5 semanas", "3 meses" — tempo desde a injeção (em horas). */
export const formatSinceInjection = (tH: number): string => {
    if (tH < HOURS_PER_DAY) return `${fmt(tH)} h`;
    const d = tH / HOURS_PER_DAY;
    if (d < 14) return `${fmt(d, d < 3 ? 1 : 0)} ${fmt(d, d < 3 ? 1 : 0) === '1' ? 'dia' : 'dias'}`;
    if (d < 9 * 7) return `${fmt(d / 7)} semanas`;
    const m = d / DAYS_PER_MONTH;
    return `${fmt(m)} ${fmt(m) === '1' ? 'mês' : 'meses'}`;
};

/** "D−40", "Dia da prova", "D+3" — relativo à prova (em dias). */
export const formatRelProva = (d: number): string => {
    const r = Math.round(d);
    if (r === 0) return 'Dia da prova';
    return r < 0 ? `D−${-r}` : `D+${r}`;
};
