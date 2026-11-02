/**
 * Modelo ilustrativo do algoritmo bayesiano (slide "Como Funciona o Algoritmo Bayesiano?").
 *
 * Âncoras da aula:
 * - Limite universal estático: T/E máximo de 4,0 (este slide); o corpo produz T/E em razão de 1:1
 *   (slide "Passaporte Biológico (ABP)", módulo esteroide).
 * - Corredor adaptativo após 3 exames; fora do túnel → Achado Atípico (ATF), > 99,9% de improbabilidade
 *   (slides "Raio-X do Passaporte Biológico" e "Passaporte Biológico").
 *
 * Atualização normal-normal (conjugada) no logaritmo do T/E, só para desenhar o corredor:
 * a priori é a população (centro 1:1, cauda de 99,9% no limite fixo de 4,0) e cada exame aceito
 * recalibra o centro do atleta e estreita a faixa esperada para o próximo exame.
 */

export const FIXED_LIMIT = 4;
export const POP_CENTER = 1;
/** Quantil bicaudal de 99,9% da normal. */
export const Z_999 = 3.29;
export const MIN_BASELINE = 3;
export const N_EXAMS = 4;
export const MONTHS = ['Jan', 'Mar', 'Jun', 'Set'] as const;

export const Y_MIN = 0;
export const Y_MAX = 4.6;
export const VALUE_MIN = 0.35;
export const VALUE_MAX = 4.4;

/** Exames do roteiro (escala ilustrativa): três dentro do perfil e o quarto fora do túnel, abaixo de 4,0. */
export const SCRIPT: readonly number[] = [1.35, 1.25, 1.42, 2.7];

const LOG_MU0 = Math.log(POP_CENTER);
const PRIOR_SD = Math.log(FIXED_LIMIT / POP_CENTER) / Z_999;
/** Variação natural exame a exame do próprio atleta (ilustrativa). */
const WITHIN_SD = 0.15;
const TAU0_SQ = PRIOR_SD ** 2 - WITHIN_SD ** 2;

/** Distribuição (log-normal) esperada para o próximo exame. */
export interface Predictive {
    readonly m: number;
    readonly s: number;
}

export interface Interval {
    readonly lo: number;
    readonly hi: number;
    readonly center: number;
}

export const PRIOR: Predictive = { m: LOG_MU0, s: PRIOR_SD };

export const predictive = (accepted: readonly number[]): Predictive => {
    if (accepted.length === 0) return PRIOR;
    const sum = accepted.reduce((a, v) => a + Math.log(v), 0);
    const postVar = 1 / (1 / TAU0_SQ + accepted.length / WITHIN_SD ** 2);
    const m = postVar * (LOG_MU0 / TAU0_SQ + sum / WITHIN_SD ** 2);
    return { m, s: Math.sqrt(postVar + WITHIN_SD ** 2) };
};

export const toInterval = (p: Predictive): Interval => ({
    lo: Math.exp(p.m - Z_999 * p.s),
    hi: Math.exp(p.m + Z_999 * p.s),
    center: Math.exp(p.m),
});

/** "Verossimilhança" do exame novo, desenhada como um sino estreito em torno do valor medido. */
export const likelihoodOf = (value: number): Predictive => ({ m: Math.log(value), s: WITHIN_SD });

/** Densidade log-normal em y (valor do T/E). */
export const density = (p: Predictive, y: number): number =>
    y <= 0 ? 0 : Math.exp(-0.5 * ((Math.log(y) - p.m) / p.s) ** 2) / (y * p.s * Math.sqrt(2 * Math.PI));

export interface ExamSlot {
    /** Corredor previsto para este exame, dado o histórico aceito antes dele. */
    readonly interval: Interval;
    readonly baselineN: number;
    readonly visible: boolean;
    readonly out: boolean;
    readonly flagged: boolean;
}

export interface Analysis {
    readonly slots: readonly ExamSlot[];
    readonly current: Predictive;
    readonly currentN: number;
    readonly firstFlag: number | null;
}

/** Percorre os exames em ordem; exame com ATF não entra no histórico do atleta. */
export const analyze = (values: readonly number[], visibleCount: number): Analysis => {
    const accepted: number[] = [];
    let firstFlag: number | null = null;
    const slots = values.map((v, k): ExamSlot => {
        const interval = toInterval(predictive(accepted));
        const baselineN = accepted.length;
        const visible = k < visibleCount;
        const out = v < interval.lo || v > interval.hi;
        const flagged = visible && baselineN >= MIN_BASELINE && out;
        if (flagged && firstFlag === null) firstFlag = k;
        if (visible && !flagged) accepted.push(v);
        return { interval, baselineN, visible, out, flagged };
    });
    return { slots, current: predictive(accepted), currentN: accepted.length, firstFlag };
};

export const clampValue = (v: number): number => Math.min(VALUE_MAX, Math.max(VALUE_MIN, v));

export const fmt = (v: number, decimals = 1): string =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
