import { clamp01 } from '../receptor/layout';
import { rawPressure } from './pressureWave';

/*
 * Séries rolando no tempo para o monitor: a cada quadro a cena empurra um ponto (pressão arterial em
 * mmHg, volume do VE e velocidade do sangue na placa) junto com a referência do coração treinado no
 * mesmo instante. O monitor desenha a janela dos últimos segundos. Buffer circular pré-alocado: nada
 * aloca por quadro.
 */

export const SERIES_CAP = 720;

export type SeriesKey = 'pa' | 'paRef' | 'vol' | 'volRef' | 'vel' | 'velRef';
const KEYS: readonly SeriesKey[] = ['pa', 'paRef', 'vol', 'volRef', 'vel', 'velRef'];

export interface Series {
    t: Float32Array;
    v: Record<SeriesKey, Float32Array>;
    /** Próxima posição a escrever e quantos pontos válidos há. */
    head: number;
    count: number;
}

export const makeSeries = (cap = SERIES_CAP): Series => ({
    t: new Float32Array(cap),
    v: Object.fromEntries(KEYS.map(k => [k, new Float32Array(cap)])) as Record<SeriesKey, Float32Array>,
    head: 0,
    count: 0,
});

export type SeriesPoint = Record<SeriesKey, number>;

export const pushSeries = (s: Series, t: number, p: SeriesPoint): void => {
    const cap = s.t.length;
    s.t[s.head] = t;
    for (const k of KEYS) s.v[k][s.head] = p[k];
    s.head = (s.head + 1) % cap;
    s.count = Math.min(s.count + 1, cap);
};

/** Índice físico do i-ésimo ponto mais antigo (0 = o mais velho guardado). */
export const seriesIndex = (s: Series, i: number): number => {
    const cap = s.t.length;
    return (s.head - s.count + i + cap * 2) % cap;
};

export const clearSeries = (s: Series): void => { s.head = 0; s.count = 0; };

/** Pico do formato bruto da onda de pressão por rigidez (tabela): normaliza a onda para 0…1. */
const PEAKS = Float32Array.from({ length: 21 }, (_, r) => {
    let hi = 0;
    for (let i = 0; i < 400; i++) hi = Math.max(hi, rawPressure(i / 400, r / 20));
    return hi;
});

/** Pressão arterial instantânea (mmHg) na fase `c` do ciclo, entre a diastólica e a sistólica. */
export const pressureAt = (c: number, rig: number, diast: number, sist: number): number => {
    const r = clamp01(rig) * 20;
    const i = Math.min(Math.floor(r), 19);
    const peak = PEAKS[i] + (PEAKS[i + 1] - PEAKS[i]) * (r - i);
    const s = clamp01(rawPressure(c, rig) / peak);
    return diast + (sist - diast) * s;
};
