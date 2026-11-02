/** Conteúdo do slide "O Dimorfismo Sexual como Variável Atlética" — verbatim do componente original. */

export interface TGroup {
    readonly label: string;
    readonly range: readonly [number, number];
    readonly mean: number;
    readonly color: string;
    /** Nota do original (aparecia ao clicar na linha). */
    readonly note?: string;
}

/** Testosterona sérica por grupo (nmol/L). */
export const T_GROUPS: readonly TGroup[] = [
    { label: 'Homem Cis', range: [8, 29], mean: 18, color: '#60A5FA', note: 'testosterona fisiológica masculina adulta' },
    { label: 'Mulher Trans (sem TRT)', range: [8, 29], mean: 17, color: '#A78BFA' },
    { label: 'Mulher Trans (2 anos TRT)', range: [0.3, 3.5], mean: 1.8, color: '#C084FC', note: 'após 2 anos de TRT feminizante padrão' },
    { label: 'Mulher Trans (WA: <2,5 nmol/L)', range: [0, 2.5], mean: 1.2, color: '#E879F9', note: 'limiar regulatório imposto pelo World Athletics' },
    { label: 'Mulher Cis', range: [0.2, 2.5], mean: 1.0, color: '#F0ABFC' },
];

export const WA_LIMIT = 2.5;

export type BodySpot = 'forca' | 'vo2' | 'mionucleos' | 'estatura' | 'coracao' | 'ossea' | 'hematocrito' | 'reacao';

export interface ReversibilityItem {
    readonly item: string;
    readonly reversed: boolean;
    readonly note: string;
    readonly spot: BodySpot;
}

/** O que a TRT feminizante reverte / não reverte (ordem do original). */
export const REVERSIBILITY: readonly ReversibilityItem[] = [
    { item: 'Força muscular relativa', reversed: true, note: '~80% normalizada em 2-3 anos', spot: 'forca' },
    { item: 'VO₂máx relativo', reversed: true, note: 'Redução de ~10-12% documentada', spot: 'vo2' },
    { item: 'Número de mionúcleos', reversed: false, note: 'Memória muscular permanente', spot: 'mionucleos' },
    { item: 'Estatura e envergadura', reversed: false, note: 'Estrutura óssea irreversível', spot: 'estatura' },
    { item: 'Tamanho do coração (VE)', reversed: false, note: 'Hipertrofia persistente', spot: 'coracao' },
    { item: 'Densidade óssea', reversed: false, note: 'Vantagem esquelética residual', spot: 'ossea' },
    { item: 'Hematócrito', reversed: true, note: 'Normaliza em ~3 meses', spot: 'hematocrito' },
    { item: 'Velocidade de reação', reversed: false, note: 'Latência neural diferencial', spot: 'reacao' },
];

export const REVERTS = REVERSIBILITY.filter(r => r.reversed);
export const PERSISTS = REVERSIBILITY.filter(r => !r.reversed);

/** Numeração usada nos cartões e na silhueta: primeiro os que revertem, depois os que não. */
export const NUMBERED: readonly { r: ReversibilityItem; n: number }[] =
    [...REVERTS, ...PERSISTS].map((r, i) => ({ r, n: i + 1 }));

export const numberOf = (r: ReversibilityItem): number => NUMBERED.find(x => x.r === r)?.n ?? 0;

export const C_REVERTS = '#10B981';
export const C_PERSISTS = '#F59E0B';

export const BIO_STEPS = [
    'Níveis séricos de testosterona por grupo',
    'O que a TRT feminizante reverte',
    'O que a TRT feminizante não reverte',
] as const;

export const fmt = (v: number): string => v.toLocaleString('pt-BR');
