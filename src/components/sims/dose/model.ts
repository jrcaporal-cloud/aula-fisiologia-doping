/**
 * Dados e modelo da curva dose-resposta (slide "O Paradoxo da Dose", id 8).
 *
 * Os 4 pontos-âncora são exatamente os do slide (0 / 1,2 / 3,5 / 6,0+ kg em
 * Fisiol. / 100 / 300 / 600+ mg). A curva contínua entre eles é um MODELO
 * ILUSTRATIVO: spline quadrática por trechos (derivada linear por trechos),
 * que passa exatamente pelos pontos, é suave (C¹) e côncava — a derivada
 * nunca sobe, o que deixa os retornos decrescentes legíveis sem inventar dado.
 */

export type StageId = 'fisio' | 'trt' | 'supra' | 'abuso';

export interface Stage {
    id: StageId;
    /** Nome curto (rótulo do ponto / faixa). */
    name: string;
    /** Rótulo da faixa no topo do gráfico. */
    bandLabel: string;
    /** Dose do ponto (mg). Fisiológico = 0 mg exógenos. */
    dose: number;
    /** Ganho de massa magra no ponto (kg). */
    gain: number;
    /** Texto do valor como está na aula. */
    gainText: string;
    doseText: string;
    color: string;
    /** Limites da faixa de fundo (mg) — só visuais, sem rótulo numérico. */
    band: [number, number];
    /** Descrição: tooltip do próprio slide (title="…"). */
    note: string;
    /** Alerta de risco citado no slide (apenas onde o slide cita). */
    risk?: string;
}

export const STAGES: readonly Stage[] = [
    {
        id: 'fisio',
        name: 'Fisiológico',
        bandLabel: 'Fisiol.',
        dose: 0,
        gain: 0,
        gainText: '~0 kg',
        doseText: 'Fisiol.',
        color: '#A1A1AA',
        band: [-40, 50],
        note: 'Níveis fisiológicos basais. Sem ganho significativo.',
    },
    {
        id: 'trt',
        name: 'TRT',
        bandLabel: 'TRT',
        dose: 100,
        gain: 1.2,
        gainText: '+1,2 kg',
        doseText: '100 mg',
        color: '#60A5FA',
        band: [50, 200],
        note: 'Doses de reposição (TRT). Otimização e recomposição corporal leve.',
    },
    {
        id: 'supra',
        name: 'Suprafisiológico',
        bandLabel: 'Suprafisiológico',
        dose: 300,
        gain: 3.5,
        gainText: '+3,5 kg',
        doseText: '300 mg',
        color: '#F87171',
        band: [200, 450],
        note: 'Doses suprafisiológicas iniciais (ciclo comum). Ganho drástico.',
    },
    {
        id: 'abuso',
        name: 'Abuso',
        bandLabel: 'Abuso',
        dose: 600,
        gain: 6.0,
        gainText: '+6,0 kg+',
        doseText: '600 mg+',
        color: '#E11D48',
        band: [450, 700],
        note: 'Doses abusivas. Retornos decrescentes de ação limpa.',
        risk: 'Altíssimo risco hepático/cardio',
    },
];

export const DOSE_MIN = 0;
export const DOSE_MAX = 600;
export const X_DOMAIN: [number, number] = [-40, 700];
export const Y_DOMAIN: [number, number] = [0, 7];

/* ---------- Spline quadrática côncava ---------- */

const KNOTS_X = STAGES.map(s => s.dose);
const KNOTS_Y = STAGES.map(s => s.gain);

/**
 * Derivada (kg/mg) em cada nó. Escolhe-se a do primeiro nó; as demais saem da
 * condição de que a integral de cada trecho bata com o Δkg da aula:
 * h·(sᵢ + sᵢ₊₁)/2 = Δyᵢ.
 */
const KNOT_SLOPES: number[] = (() => {
    const first = 0.0122; // 1,22 kg/100 mg — próxima da média 0→100 mg (1,2)
    const slopes = [first];
    for (let i = 0; i < KNOTS_X.length - 1; i++) {
        const h = KNOTS_X[i + 1] - KNOTS_X[i];
        const dy = KNOTS_Y[i + 1] - KNOTS_Y[i];
        slopes.push((2 * dy) / h - slopes[i]);
    }
    return slopes;
})();

const segmentOf = (dose: number): number => {
    for (let i = 0; i < KNOTS_X.length - 2; i++) if (dose <= KNOTS_X[i + 1]) return i;
    return KNOTS_X.length - 2;
};

const clampDose = (dose: number) => Math.min(Math.max(dose, DOSE_MIN), DOSE_MAX);

/** Ganho estimado (kg) pelo modelo ilustrativo. */
export const gainAt = (rawDose: number): number => {
    const dose = clampDose(rawDose);
    const i = segmentOf(dose);
    const h = KNOTS_X[i + 1] - KNOTS_X[i];
    const t = dose - KNOTS_X[i];
    const s0 = KNOT_SLOPES[i];
    const s1 = KNOT_SLOPES[i + 1];
    return KNOTS_Y[i] + s0 * t + ((s1 - s0) * t * t) / (2 * h);
};

/** Derivada local (kg por mg) pelo modelo ilustrativo. */
export const slopeAt = (rawDose: number): number => {
    const dose = clampDose(rawDose);
    const i = segmentOf(dose);
    const h = KNOTS_X[i + 1] - KNOTS_X[i];
    const t = dose - KNOTS_X[i];
    return KNOT_SLOPES[i] + ((KNOT_SLOPES[i + 1] - KNOT_SLOPES[i]) * t) / h;
};

export const MAX_SLOPE = Math.max(...KNOT_SLOPES);

/**
 * Rendimento médio de cada faixa entre pontos da aula (kg por 100 mg).
 * Aritmética direta dos números do slide — não depende do modelo.
 */
export interface SegmentYield {
    from: Stage;
    to: Stage;
    perHundred: number;
}

export const SEGMENT_YIELDS: readonly SegmentYield[] = STAGES.slice(0, -1).map((from, i) => {
    const to = STAGES[i + 1];
    return { from, to, perHundred: ((to.gain - from.gain) / (to.dose - from.dose)) * 100 };
});

export const segmentIndexAt = (dose: number): number => segmentOf(clampDose(dose));

export const stageAtDose = (dose: number): Stage =>
    STAGES.find(s => dose >= s.band[0] && dose < s.band[1]) ?? STAGES[STAGES.length - 1];

/* ---------- Formatação pt-BR ---------- */

export const fmt = (value: number, digits = 1): string =>
    value.toLocaleString('pt-BR', { minimumFractionDigits: digits, maximumFractionDigits: digits });
