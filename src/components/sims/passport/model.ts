/**
 * Modelo ilustrativo do Passaporte Biológico (módulo hematológico).
 *
 * Âncoras da aula:
 * - Limites populacionais (priori): Hb 12,0–16,0 g/dL e reticulócitos 0,5–1,5% (slide "A Ciclista com Anemia").
 * - OFF-score = Hb (g/L) − 60 × √Ret%; > 85 suspeito; > 130 = probabilidade > 99,9% (slide "Raio-X do ABP").
 * - Túnel individual a partir de 3 exames; alerta ATF fora do túnel (> 99,9% de improbabilidade).
 *
 * A atualização é normal-normal (conjugada), só para desenhar o corredor: a priori é a
 * distribuição populacional e cada coleta estreita o corredor em torno do atleta.
 */

export type ProtocolId = 'limpo' | 'microdose' | 'transfusao';
export type MarkerId = 'hb' | 'ret' | 'off';

export interface Sample {
    readonly hb: number;
    readonly ret: number;
}

export interface Interval {
    readonly lo: number;
    readonly hi: number;
    readonly mean: number;
}

export interface MarkerSpec {
    readonly id: MarkerId;
    readonly name: string;
    readonly unit: string;
    readonly color: string;
    /** Limite populacional fixo inferior (ausente quando o critério é unilateral). */
    readonly popLow?: number;
    readonly popHigh: number;
    /** Centro da priori populacional. */
    readonly mu0: number;
    /** Variação dia a dia do próprio atleta (ilustrativa). */
    readonly sigmaW: number;
    readonly domain: readonly [number, number];
    readonly ticks: readonly number[];
    readonly decimals: number;
}

/** Quantil bicaudal de 99,9% da normal: fora dele, a improbabilidade passa de 99,9%. */
export const Z_999 = 3.29;
export const MIN_BASELINE = 3;
export const N_SAMPLES = 9;
export const MANIP_START = 6;
export const OFF_SUSPECT = 85;

export const offScore = (s: Sample): number => s.hb * 10 - 60 * Math.sqrt(s.ret);

export const MARKERS: readonly MarkerSpec[] = [
    {
        id: 'hb', name: 'Hemoglobina (Hb)', unit: 'g/dL', color: '#60A5FA',
        popLow: 12, popHigh: 16, mu0: 14, sigmaW: 0.25,
        domain: [11.5, 17], ticks: [12, 13, 14, 15, 16, 17], decimals: 1,
    },
    {
        id: 'ret', name: 'Reticulócitos (%Ret)', unit: '%', color: '#22D3EE',
        popLow: 0.5, popHigh: 1.5, mu0: 1, sigmaW: 0.06,
        domain: [0.3, 1.8], ticks: [0.5, 1, 1.5], decimals: 2,
    },
    {
        id: 'off', name: 'OFF-score', unit: 'Hb (g/L) − 60·√%Ret', color: '#A855F7',
        popHigh: 130, mu0: 80, sigmaW: 5,
        domain: [40, 140], ticks: [60, 85, 130], decimals: 0,
    },
];

export const markerValue = (s: Sample, id: MarkerId): number =>
    id === 'hb' ? s.hb : id === 'ret' ? s.ret : offScore(s);

const priorSd = (m: MarkerSpec): number => {
    const center = m.popLow === undefined ? m.mu0 : (m.popLow + m.popHigh) / 2;
    return (m.popHigh - center) / Z_999;
};

/** Intervalo preditivo de 99,9% para a próxima coleta, dado o histórico aceito. */
export const predictive = (m: MarkerSpec, values: readonly number[]): Interval => {
    const total = priorSd(m);
    const tau0Sq = total * total - m.sigmaW * m.sigmaW;
    const sigmaSq = m.sigmaW * m.sigmaW;
    const sum = values.reduce((a, v) => a + v, 0);
    const tauNSq = 1 / (1 / tau0Sq + values.length / sigmaSq);
    const mean = tauNSq * (m.mu0 / tau0Sq + sum / sigmaSq);
    const sd = Math.sqrt(tauNSq + sigmaSq);
    return { lo: mean - Z_999 * sd, hi: mean + Z_999 * sd, mean };
};

const BASE: readonly Sample[] = [
    { hb: 13.4, ret: 1.12 }, { hb: 13.0, ret: 1.05 }, { hb: 13.3, ret: 1.15 },
    { hb: 13.1, ret: 1.08 }, { hb: 13.4, ret: 1.10 }, { hb: 13.2, ret: 1.04 },
];

export interface Phase {
    readonly from: number;
    readonly to: number;
    readonly label: string;
    readonly color: string;
}

export interface Protocol {
    readonly id: ProtocolId;
    readonly label: string;
    readonly short: string;
    readonly color: string;
    readonly samples: readonly Sample[];
    readonly phases: readonly Phase[];
    readonly description: string;
    readonly source: string;
}

export const PROTOCOLS: readonly Protocol[] = [
    {
        id: 'limpo', label: 'Atleta limpo', short: 'Limpo', color: '#10B981',
        samples: [...BASE, { hb: 13.3, ret: 1.06 }, { hb: 13.0, ret: 1.13 }, { hb: 13.4, ret: 1.07 }],
        phases: [],
        description: 'Sem manipulação. O atleta é comparado só com o próprio histórico: as variações naturais ficam dentro do túnel.',
        source: 'Slide "Passaporte Biológico (ABP)"',
    },
    {
        id: 'microdose', label: 'Microdose de rhEPO', short: 'Microdose', color: '#F59E0B',
        samples: [...BASE, { hb: 14.3, ret: 1.40 }, { hb: 14.9, ret: 1.28 }, { hb: 15.2, ret: 0.60 }],
        phases: [
            { from: 6, to: 7, label: 'Microdose rhEPO', color: '#F59E0B' },
            { from: 8, to: 8, label: 'Interrupção', color: '#F59E0B' },
        ],
        description: 'Microdoses (uso noturno, para fugir dos controles matinais) mantinham o hematócrito abaixo do limite de 50% da UCI. Ao parar para "limpar" o sangue, vem o crash: o %Ret despenca e a Hb segue alta.',
        source: 'Dossiê Lance Armstrong · slide "Raio-X do ABP"',
    },
    {
        id: 'transfusao', label: 'Transfusão autóloga', short: 'Transfusão', color: '#E11D48',
        samples: [...BASE, { hb: 12.8, ret: 1.12 }, { hb: 15.4, ret: 0.58 }, { hb: 15.0, ret: 0.62 }],
        phases: [
            { from: 6, to: 6, label: 'Retirada', color: '#F59E0B' },
            { from: 7, to: 8, label: 'Reinfusão', color: '#E11D48' },
        ],
        description: 'Retirada de 450–900 mL, criopreservação e reinfusão 12–24 h antes da prova. Sem molécula exógena: a Hb sobe e o %Ret afunda (medula "apagada").',
        source: 'Slide "Transfusão Autóloga" · "Passaporte Biológico (ABP)"',
    },
];

export interface SlotAnalysis {
    readonly intervals: Readonly<Record<MarkerId, Interval>>;
    /** Exames aceitos na linha de base antes desta coleta. */
    readonly baselineN: number;
    readonly visible: boolean;
    readonly flagged: boolean;
    readonly tunnelOut: Readonly<Record<MarkerId, boolean>>;
    readonly fixedOut: Readonly<Record<MarkerId, boolean>>;
}

export interface Analysis {
    readonly slots: readonly SlotAnalysis[];
    /** Corredor após todas as coletas visíveis (borda direita do gráfico). */
    readonly current: Readonly<Record<MarkerId, Interval>>;
    readonly currentN: number;
    readonly firstFlag: number | null;
}

const perMarker = <T,>(fn: (m: MarkerSpec) => T): Record<MarkerId, T> => ({
    hb: fn(MARKERS[0]), ret: fn(MARKERS[1]), off: fn(MARKERS[2]),
});

const isFixedOut = (m: MarkerSpec, v: number): boolean =>
    v > m.popHigh || (m.popLow !== undefined && v < m.popLow);

/** Percorre as coletas em ordem; coletas com ATF não entram na linha de base. */
export const analyze = (samples: readonly Sample[], visibleCount: number): Analysis => {
    const accepted: Sample[] = [];
    const slots: SlotAnalysis[] = [];
    let firstFlag: number | null = null;

    samples.forEach((s, k) => {
        const intervals = perMarker(m => predictive(m, accepted.map(a => markerValue(a, m.id))));
        const baselineN = accepted.length;
        const visible = k < visibleCount;
        const tunnelOut = perMarker(m => {
            const v = markerValue(s, m.id);
            const iv = intervals[m.id];
            return v < iv.lo || v > iv.hi;
        });
        const fixedOut = perMarker(m => isFixedOut(m, markerValue(s, m.id)));
        const flagged = visible && baselineN >= MIN_BASELINE && (tunnelOut.hb || tunnelOut.ret || tunnelOut.off);
        if (flagged && firstFlag === null) firstFlag = k;
        if (visible && !flagged) accepted.push(s);
        slots.push({ intervals, baselineN, visible, flagged, tunnelOut, fixedOut });
    });

    return {
        slots,
        current: perMarker(m => predictive(m, accepted.map(a => markerValue(a, m.id)))),
        currentN: accepted.length,
        firstFlag,
    };
};

export const fmt = (v: number, decimals: number): string =>
    v.toLocaleString('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
