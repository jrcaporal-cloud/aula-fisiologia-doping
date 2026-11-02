/**
 * Geometria do esqueleto esteroide (anéis A, B, C hexagonais + D pentagonal),
 * em coordenadas locais (ligação = 40). Mesma construção de
 * `presentation/title/SteroidMark.tsx`, aqui exposta átomo a átomo para que
 * cada família altere só o trecho que o texto do slide descreve.
 */
export type Pt = readonly [number, number];

export const BOND = 40;
const HEX_STEP = BOND * Math.sqrt(3);
const rad = (deg: number): number => (deg * Math.PI) / 180;

export const polar = ([cx, cy]: Pt, r: number, deg: number): Pt => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

const CENTER_A: Pt = [0, 0];
const CENTER_B: Pt = [HEX_STEP, 0];
const CENTER_C: Pt = [1.5 * HEX_STEP, -1.5 * BOND];
const D_APOTHEM = BOND / (2 * Math.tan(rad(36)));
const D_RADIUS = BOND / (2 * Math.sin(rad(36)));
const CENTER_D: Pt = [CENTER_C[0] + HEX_STEP / 2 + D_APOTHEM, CENTER_C[1]];

export const RING_CENTERS: Readonly<Record<'A' | 'B' | 'C' | 'D', Pt>> = { A: CENTER_A, B: CENTER_B, C: CENTER_C, D: CENTER_D };

// Hexágono "ponta para cima": vértices a -90, -30, 30, 90, 150, 210 graus.
const hex = (c: Pt): Pt[] => [-90, -30, 30, 90, 150, 210].map(d => polar(c, BOND, d));
const pent = (c: Pt): Pt[] => [216, 288, 0, 72, 144].map(d => polar(c, D_RADIUS, d));

const RING_A = hex(CENTER_A);
const RING_C = hex(CENTER_C);
const RING_D = pent(CENTER_D);

export const ATOM = {
    C3: RING_A[4],
    C4: RING_A[3],
    C5: RING_A[2],
    C10: RING_A[1],
    C13: RING_C[1],
    C17: RING_D[1],
} as const;

export const ringPath = (pts: readonly Pt[]): string => `M${pts.map(p => p.join(' ')).join(' L')} Z`;
export const line = (a: Pt, b: Pt): string => `M${a.join(' ')} L${b.join(' ')}`;

/** Contornos dos quatro anéis (o anel A muda conforme a família). */
export const RING_PATHS = {
    A: ringPath(RING_A),
    B: ringPath(hex(CENTER_B)),
    C: ringPath(RING_C),
    D: ringPath(RING_D),
} as const;

const shrink = (a: Pt, b: Pt, k: number): [Pt, Pt] => {
    const mx = (a[0] + b[0]) / 2;
    const my = (a[1] + b[1]) / 2;
    return [[mx + (a[0] - mx) * k, my + (a[1] - my) * k], [mx + (b[0] - mx) * k, my + (b[1] - my) * k]];
};
const inward = (p: Pt): Pt => [p[0] + (CENTER_A[0] - p[0]) * 0.2, p[1] + (CENTER_A[1] - p[1]) * 0.2];

/** Segunda linha da dupla C4=C5 (testosterona: 4-eno). */
export const DOUBLE_45 = line(...shrink(inward(ATOM.C4), inward(ATOM.C5), 0.7));

/** Oxigênio em C3 (cetona na testosterona/DHT; hidroxila fenólica no estradiol). */
export const O3 = polar(ATOM.C3, BOND * 0.85, 150);
export const C3_O_BOND = line(ATOM.C3, O3);
export const C3_O_SECOND = line(polar(ATOM.C3, 6, 60), polar(O3, 6, 60));

/** 17-OH. */
export const O17 = polar(ATOM.C17, BOND * 0.8, -54);
export const C17_O_BOND = line(ATOM.C17, O17);

/** Metilas angulares: C18 (em C13) e C19 (em C10). */
export const C18_BOND = line(ATOM.C13, polar(ATOM.C13, BOND * 0.8, -90));
export const C19_END = polar(ATOM.C10, BOND * 0.8, -90);
export const C19_BOND = line(ATOM.C10, C19_END);

/** Anel aromático (estradiol): círculo interno. */
export const AROMATIC_R = BOND * 0.56;

/** Hidrogênio 5α (DHT): cunha tracejada para baixo do plano. */
export const H5_END = polar(ATOM.C5, BOND * 0.72, 90);
export const H5_HASHES: readonly string[] = Array.from({ length: 5 }, (_, i) => {
    const t = (i + 1) / 5.5;
    const x = ATOM.C5[0];
    const y = ATOM.C5[1] + (H5_END[1] - ATOM.C5[1]) * t;
    const half = 1.5 + 6 * t;
    return `M${x - half} ${y} L${x + half} ${y}`;
});

/** Caixa que contém a molécula e os rótulos de átomo (O, HO, OH, H). */
export const BOX = { x: -102, y: -132, w: 336, h: 208 } as const;
export const VIEWBOX = `${BOX.x} ${BOX.y} ${BOX.w} ${BOX.h}`;

/** Transform que põe o centro da caixa em (cx, cy) com escala k. */
export const place = (cx: number, cy: number, k: number): string =>
    `translate(${cx - k * (BOX.x + BOX.w / 2)} ${cy - k * (BOX.y + BOX.h / 2)}) scale(${k})`;

/** Converte um ponto local para o sistema da cena (mesma transformação de `place`). */
export const toScene = (p: Pt, cx: number, cy: number, k: number): Pt =>
    [cx + k * (p[0] - (BOX.x + BOX.w / 2)), cy + k * (p[1] - (BOX.y + BOX.h / 2))];
