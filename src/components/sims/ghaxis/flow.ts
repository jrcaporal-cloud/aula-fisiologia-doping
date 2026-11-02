import { COLORS } from './content';

/**
 * Geometria e "partitura" do fluxo hormonal no eixo desenhado (viewBox 460 × 490).
 * As trajetórias são desenhadas como vasos e reamostradas pelo motor de partículas.
 */

export const VIEW = { w: 460, h: 490 } as const;

/** Lupa sobre o encéfalo (corte sagital ampliado). */
export const BUBBLE = { cx: 330, cy: 128, r: 108 } as const;

/** Pontos de ancoragem dos órgãos. */
export const ANCHOR = {
    head: { x: 128, y: 56 },
    zoomSource: { x: 132, y: 64 },
    hypothalamus: { x: 340, y: 160 },
    pituitary: { x: 350, y: 193 },
    pituitaryHead: { x: 130, y: 70 },
    liver: { x: 124, y: 221 },
    muscle: { x: 153, y: 372 },
} as const;

export type PathId = 'signal' | 'ghrpHypo' | 'ghrpPit' | 'gh' | 'rhgh' | 'igf' | 'bypass';

export const PATHS: Record<PathId, string> = {
    /** Hipotálamo → hipófise (dentro da lupa). */
    signal: 'M340,162 C 342,172 345,180 350,190',
    /** Seringa de GHRP → receptores GHS-R1a no hipotálamo e na hipófise. */
    ghrpHypo: 'M370,206 C 366,192 358,178 348,166',
    ghrpPit: 'M370,206 C 368,202 366,199 362,196',
    /** Hipófise → descida pelo pescoço → fígado. */
    gh: 'M130,70 C 130,90 128,100 128,120 C 128,150 122,182 118,210',
    /** Seringa de rhGH no lado do pescoço → circulação → fígado. */
    rhgh: 'M96,110 C 112,110 126,112 128,126 C 129,152 122,182 118,210',
    /** Fígado → circulação → músculo-alvo. */
    igf: 'M130,232 C 142,262 152,292 152,326 C 152,340 152,350 152,360',
    /** IGF-1 exógeno: da seringa direto ao IGF-1R do músculo (bypass do eixo). */
    bypass: 'M246,322 C 216,330 190,336 172,346 C 164,351 158,356 154,362',
};

export interface Burst { readonly n: number; readonly phase: number; readonly spread: number }
export interface Stream { readonly rate: number }

export interface Emitter {
    readonly id: string;
    readonly path: PathId;
    readonly color: string;
    readonly exo: boolean;
    /** Tempo de trânsito pela trajetória (s). */
    readonly travel: number;
    readonly size: number;
    /** Desvio lateral máximo (px) para o fluxo parecer um feixe. */
    readonly jitter: number;
    /** Configuração por passo (0–3); null = desligado. */
    readonly steps: readonly (Burst | Stream | null)[];
}

/** Ciclo do pulso (s): sinal → pulso de GH → IGF-1. */
export const CYCLE = 3.4;

export const EMITTERS: readonly Emitter[] = [
    {
        id: 'signal', path: 'signal', color: COLORS.hipotalamo, exo: false, travel: 0.8, size: 2.6, jitter: 1.5,
        steps: [{ n: 4, phase: 0.0, spread: 0.12 }, { n: 4, phase: 0.0, spread: 0.12 }, { n: 2, phase: 0.0, spread: 0.1 }, null],
    },
    {
        id: 'ghrpHypo', path: 'ghrpHypo', color: '#A855F7', exo: true, travel: 1.0, size: 3.2, jitter: 2.5,
        steps: [null, { rate: 2.2 }, null, null],
    },
    {
        id: 'ghrpPit', path: 'ghrpPit', color: '#A855F7', exo: true, travel: 0.5, size: 3.2, jitter: 2,
        steps: [null, { rate: 1.6 }, null, null],
    },
    {
        id: 'gh', path: 'gh', color: COLORS.hipofise, exo: false, travel: 1.5, size: 2.8, jitter: 2.6,
        steps: [{ n: 6, phase: 0.3, spread: 0.12 }, { n: 15, phase: 0.27, spread: 0.18 }, { n: 2, phase: 0.3, spread: 0.08 }, null],
    },
    {
        id: 'rhgh', path: 'rhgh', color: COLORS.hipofise, exo: true, travel: 1.6, size: 3.3, jitter: 2.4,
        steps: [null, null, { rate: 4.2 }, null],
    },
    {
        id: 'igf', path: 'igf', color: COLORS.igf, exo: false, travel: 1.7, size: 2.7, jitter: 2.4,
        steps: [{ rate: 2.4 }, { rate: 3.8 }, { rate: 4.4 }, { rate: 0.6 }],
    },
    {
        id: 'bypass', path: 'bypass', color: COLORS.igf, exo: true, travel: 1.25, size: 3.4, jitter: 2.6,
        steps: [null, null, null, { rate: 5.2 }],
    },
];

/** Intensidade-alvo de cada órgão por passo (brilho do pulso / atividade de base). */
export interface OrganLevels {
    readonly hypo: number;
    readonly pit: number;
    readonly liver: number;
    readonly liverBase: number;
    readonly muscle: number;
    /** 0 = aceso, 1 = apagado (bypass). */
    readonly axisOff: number;
}

export const ORGAN_LEVELS: readonly OrganLevels[] = [
    { hypo: 0.85, pit: 0.85, liver: 0.7, liverBase: 0.12, muscle: 0.35, axisOff: 0 },
    { hypo: 1, pit: 1, liver: 0.9, liverBase: 0.25, muscle: 0.55, axisOff: 0 },
    { hypo: 0.35, pit: 0.25, liver: 0.3, liverBase: 0.75, muscle: 0.6, axisOff: 0.25 },
    { hypo: 0, pit: 0, liver: 0, liverBase: 0.08, muscle: 1, axisOff: 1 },
];

export const isBurst = (c: Burst | Stream): c is Burst => 'n' in c;
