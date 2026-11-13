import { CARDIO_VITALS, type CardioVitals } from '../../../../data/cardioSteps';

/*
 * Laboratório: o aluno DOSA os colaterais e o circuito responde. Este arquivo é a "física didática"
 * que liga os controles (o que o aluno mexe) à ficha completa que a cena e o monitor leem.
 *
 * Regra de ouro: os números medidos moram em `cardioSteps.ts` (fonte única). Aqui nada é inventado —
 * entre os pontos medidos, a física é um MODELO DIDÁTICO que:
 *  - passa EXATAMENTE por todas as linhas da ficha (as 8 etapas × em uso / depois de parar);
 *  - liga as grandezas na direção que a literatura descreve (parede ↑ → cavidade ↓ e FE ↓; E′ ↓ → FE ↓;
 *    hematócrito ↑ → viscosidade ↑ mais que proporcionalmente; pressão sistólica ↑ → diastólica ↑).
 *
 * Como fica exato nos pontos medidos:
 *  - diastólica(sistólica) e viscosidade(hematócrito) são curvas lineares por partes que passam pelos
 *    pares da própria ficha (fora da faixa, seguem a inclinação do último trecho);
 *  - os desfechos (FE, cavidade, fibrose, HDL, LDL) = tendência didática + correção residual
 *    interpolada por inverso da distância (Shepard) a partir das linhas da ficha. Na linha da ficha a
 *    correção vale exatamente o resíduo dela, então o desfecho volta ao número medido.
 */

export type LabKey = 'parede' | 'eLinha' | 'paSist' | 'hct' | 'placa';
export type LabControls = Record<LabKey, number>;

export interface LabControlDef {
    key: LabKey;
    label: string;
    /** Linha de apoio sob o rótulo (o que o controle representa na cena). */
    hint: string;
    unit: string;
    min: number;
    max: number;
    step: number;
    /** +1: valor maior é pior (o "mais dose" fica à direita); −1: valor menor é pior (E′). */
    worse: 1 | -1;
    format: (v: number) => string;
}

const ptBr = (v: number, digits: number) => v.toFixed(digits).replace('.', ',');

/** Placa em palavras: o índice 0…1 da ficha é um grau esquemático, não uma porcentagem medida. */
export const plaqueWord = (p: number): string =>
    p < 0.04 ? 'nenhuma' : p < 0.25 ? 'discreta' : p < 0.6 ? 'moderada' : 'extensa';

export const LAB_CONTROLS: readonly LabControlDef[] = [
    {
        key: 'parede', label: 'Hipertrofia da parede', hint: 'espessura do VE', unit: 'mm',
        min: 9, max: 17, step: 0.1, worse: 1, format: v => ptBr(v, 1),
    },
    {
        key: 'eLinha', label: 'Relaxamento (E′)', hint: 'Doppler tecidual', unit: 'cm/s',
        min: 7.5, max: 12.5, step: 0.1, worse: -1, format: v => ptBr(v, 1),
    },
    {
        key: 'paSist', label: 'Pressão e rigidez', hint: 'pressão sistólica', unit: 'mmHg',
        min: 105, max: 165, step: 1, worse: 1, format: v => `${Math.round(v)}`,
    },
    {
        key: 'hct', label: 'Hematócrito', hint: 'viscosidade do sangue', unit: '%',
        min: 40, max: 60, step: 0.5, worse: 1, format: v => {
            const half = Math.round(v * 2) / 2;
            return ptBr(half, Number.isInteger(half) ? 0 : 1);
        },
    },
    {
        key: 'placa', label: 'Placa', hint: 'parede da artéria', unit: '',
        min: 0, max: 1, step: 0.01, worse: 1, format: plaqueWord,
    },
];

export const LAB_KEYS: readonly LabKey[] = LAB_CONTROLS.map(c => c.key);

export const controlDef = (key: LabKey): LabControlDef => LAB_CONTROLS.find(c => c.key === key) as LabControlDef;

/** Controles de uma linha da ficha. */
export const controlsOf = (v: CardioVitals): LabControls => ({
    parede: v.paredeMm, eLinha: v.eLinha, paSist: v.paSist, hct: v.hct, placa: v.placa,
});

/** Mantém o controle dentro da faixa do seu deslizador. */
export const clampControl = (key: LabKey, value: number): number => {
    const d = controlDef(key);
    return Math.min(Math.max(value, d.min), d.max);
};

// ------------------------------------------------------------------ linhas da ficha

const ALL_ROWS: readonly CardioVitals[] = [...CARDIO_VITALS.uso, ...CARDIO_VITALS.apos];

const sameControls = (a: LabControls, b: LabControls) => LAB_KEYS.every(k => a[k] === b[k]);

/** Linhas distintas da ficha (a fase "depois de parar" repete as duas primeiras etapas). */
export const ANCHORS: readonly CardioVitals[] = ALL_ROWS.filter(
    (row, i) => ALL_ROWS.findIndex(other => sameControls(controlsOf(other), controlsOf(row))) === i,
);

// ------------------------------------------------------------------ curvas lineares por partes

export type Curve = readonly (readonly [number, number])[];

/** Pares (x, y) distintos da ficha, ordenados por x. Dois y para o mesmo x seriam uma ficha incoerente. */
export const curveFromRows = (x: (v: CardioVitals) => number, y: (v: CardioVitals) => number): Curve => {
    const map = new Map<number, number>();
    for (const row of ALL_ROWS) {
        const prev = map.get(x(row));
        if (prev !== undefined && prev !== y(row)) throw new Error(`ficha incoerente em x=${x(row)}: ${prev} × ${y(row)}`);
        map.set(x(row), y(row));
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
};

/** Interpolação linear por partes; fora da faixa, segue a inclinação do trecho da ponta. */
export const piecewise = (curve: Curve, x: number): number => {
    const n = curve.length;
    if (n === 1) return curve[0][1];
    let i = 0;
    if (x >= curve[n - 1][0]) i = n - 2;
    else while (i < n - 2 && x > curve[i + 1][0]) i++;
    const [x0, y0] = curve[i];
    const [x1, y1] = curve[i + 1];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
};

/** Diastólica a partir da sistólica (as duas sobem juntas na ficha). */
export const DIAST_CURVE = curveFromRows(v => v.paSist, v => v.paDiast);
/** Viscosidade relativa a partir do hematócrito. */
export const VISC_CURVE = curveFromRows(v => v.hct, v => v.viscosidade);

// ------------------------------------------------------------------ desfechos

type OutcomeKey = 'fe' | 'cavidadeMm' | 'fibrose' | 'hdl' | 'ldl';

/*
 * Tendência didática de cada desfecho (só a direção e a ordem de grandeza; a correção residual leva
 * o valor de volta ao número da ficha em cada ponto medido). Centradas no coração treinado.
 */
const TREND: Record<OutcomeKey, (c: LabControls) => number> = {
    // parede espessa, pós-carga alta, relaxamento lento e sangue espesso puxam a FE para baixo
    fe: c => 63 - 1.1 * (c.parede - 11) - 0.08 * (c.paSist - 118) - 0.6 * (11.5 - c.eLinha) - 0.1 * (c.hct - 45),
    // hipertrofia concêntrica: a parede cresce para dentro e a cavidade encolhe
    cavidadeMm: c => 55 - 2 * (c.parede - 11),
    fibrose: c => 0.1 * (c.parede - 11) + 0.1 * (11.5 - c.eLinha),
    // os lipídios andam junto com a placa (HDL cai, LDL sobe)
    hdl: c => 54 - 25 * c.placa,
    ldl: c => 100 + 40 * c.placa,
};

const OUTCOMES = Object.keys(TREND) as OutcomeKey[];

const LIMITS: Record<OutcomeKey, readonly [number, number]> = {
    fe: [35, 75], cavidadeMm: [35, 65], fibrose: [0, 1], hdl: [20, 80], ldl: [60, 200],
};

const SPAN: LabControls = Object.fromEntries(LAB_CONTROLS.map(d => [d.key, d.max - d.min])) as LabControls;

/** Distância entre dois estados no espaço dos controles, cada eixo normalizado pela faixa do deslizador. */
export const controlDistance = (a: LabControls, b: LabControls): number =>
    Math.sqrt(LAB_KEYS.reduce((s, k) => s + ((a[k] - b[k]) / SPAN[k]) ** 2, 0));

interface Anchor { c: LabControls; residual: Record<OutcomeKey, number> }

const ANCHOR_RESIDUALS: readonly Anchor[] = ANCHORS.map(row => {
    const c = controlsOf(row);
    const residual = Object.fromEntries(OUTCOMES.map(k => [k, row[k] - TREND[k](c)])) as Record<OutcomeKey, number>;
    return { c, residual };
});

const clampTo = (x: number, [lo, hi]: readonly [number, number]) => Math.min(Math.max(x, lo), hi);

/** Correção residual por inverso do quadrado da distância; exata (sem média) sobre uma linha da ficha. */
const residualAt = (c: LabControls, out: Record<OutcomeKey, number>): void => {
    let wSum = 0;
    for (const k of OUTCOMES) out[k] = 0;
    for (const a of ANCHOR_RESIDUALS) {
        const d = controlDistance(c, a.c);
        if (d < 1e-9) {
            for (const k of OUTCOMES) out[k] = a.residual[k];
            return;
        }
        const w = 1 / (d * d);
        wSum += w;
        for (const k of OUTCOMES) out[k] += w * a.residual[k];
    }
    for (const k of OUTCOMES) out[k] /= wSum;
};

const RES: Record<OutcomeKey, number> = { fe: 0, cavidadeMm: 0, fibrose: 0, hdl: 0, ldl: 0 };

/**
 * Ficha completa a partir dos controles do laboratório. Escreve em `out` (a cena chama por quadro e
 * não pode alocar). Sobre qualquer linha de `CARDIO_VITALS`, devolve essa linha.
 */
export const labVitals = (c: LabControls, out: CardioVitals = emptyVitals()): CardioVitals => {
    residualAt(c, RES);
    out.paredeMm = c.parede;
    out.eLinha = c.eLinha;
    out.paSist = c.paSist;
    out.hct = c.hct;
    out.placa = c.placa;
    out.paDiast = piecewise(DIAST_CURVE, c.paSist);
    out.viscosidade = Math.max(piecewise(VISC_CURVE, c.hct), 0.6);
    for (const k of OUTCOMES) out[k] = clampTo(TREND[k](c) + RES[k], LIMITS[k]);
    return out;
};

export const emptyVitals = (): CardioVitals => ({ ...CARDIO_VITALS.uso[1] });

// ------------------------------------------------------------------ cenários (presets)

export type LabPresetId = 'treinado' | 'uso' | 'apos';

export interface LabPreset {
    id: LabPresetId;
    label: string;
    sub: string;
    color: string;
    /** A linha da ficha que o cenário reproduz. */
    vitals: CardioVitals;
}

const LAST = CARDIO_VITALS.uso.length - 1;

export const LAB_PRESETS: readonly LabPreset[] = [
    { id: 'treinado', label: 'Treinado', sub: 'ponto de partida', color: '#7DD3FC', vitals: CARDIO_VITALS.uso[1] },
    { id: 'uso', label: 'Em uso', sub: 'os cinco somados', color: '#E11D48', vitals: CARDIO_VITALS.uso[LAST] },
    { id: 'apos', label: 'Depois de parar', sub: 'o que volta, o que fica', color: '#22D3EE', vitals: CARDIO_VITALS.apos[LAST] },
];

export const presetById = (id: LabPresetId): LabPreset => LAB_PRESETS.find(p => p.id === id) as LabPreset;

/** O cenário cujos controles são exatamente estes (ou null). */
export const matchPreset = (c: LabControls): LabPresetId | null =>
    LAB_PRESETS.find(p => sameControls(controlsOf(p.vitals), c))?.id ?? null;

// ------------------------------------------------------------------ índices didáticos da cena

/** Quanto a placa estreita o lúmen da artéria no ponto mais apertado (0…1). Esquemático. */
export const STENOSIS_PER_PLAQUE = 0.62;

/** Continuidade: no estreitamento o mesmo fluxo passa mais rápido (1/área), com teto para a cena. */
export const jetFactor = (placa: number): number => {
    const open = 1 - STENOSIS_PER_PLAQUE * Math.min(Math.max(placa, 0), 1);
    return Math.min(1 / (open * open), 3.4);
};
