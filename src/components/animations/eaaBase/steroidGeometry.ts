/**
 * Geometria do esqueleto da testosterona (anéis A, B, C hexagonais + D pentagonal).
 * Adaptado de presentation/title/SteroidMark.tsx (copiado, não importado).
 */
export type Point = readonly [number, number];

const S = 96; // comprimento da ligação
const H = S * Math.sqrt(3);
const rad = (deg: number) => (deg * Math.PI) / 180;
export const vertex = ([cx, cy]: Point, r: number, deg: number): Point => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

const A: Point = [0, 0];
const B: Point = [H, 0];
const C: Point = [1.5 * H, -1.5 * S];
const D_APOTHEM = S / (2 * Math.tan(rad(36)));
const D_RADIUS = S / (2 * Math.sin(rad(36)));
const D: Point = [C[0] + H / 2 + D_APOTHEM, C[1]];

const HEX = [-90, -30, 30, 90, 150, 210];
const hex = (c: Point) => HEX.map(d => vertex(c, S, d));
const pent = (c: Point) => [216, 288, 0, 72, 144].map(d => vertex(c, D_RADIUS, d));

const ringPath = (pts: Point[]) => `M${pts.map(p => p.join(' ')).join(' L')} Z`;
export const line = (a: Point, b: Point): string => `M${a.join(' ')} L${b.join(' ')}`;

const ringA = hex(A);
const ringC = hex(C);
const ringD = pent(D);

const C3 = ringA[4];
const C4 = ringA[3];
const C5 = ringA[2];
const C10 = ringA[1];
const C13 = ringC[1];
export const C17 = ringD[1];

const shrink = (a: Point, b: Point, k: number): [Point, Point] => {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    return [[mx + (a[0] - mx) * k, my + (a[1] - my) * k], [mx + (b[0] - mx) * k, my + (b[1] - my) * k]];
};
const inward = (p: Point): Point => [p[0] + (A[0] - p[0]) * 0.2, p[1] + (A[1] - p[1]) * 0.2];
const [d1, d2] = shrink(inward(C4), inward(C5), 0.7);
export const KETONE = vertex(C3, S * 0.85, 150);
const [k1, k2] = [vertex(C3, 7, 60), vertex(KETONE, 7, 60)];
/** 17β-OH (traço cheio, para cima). */
export const OH = vertex(C17, S * 0.8, -54);
/** Posição 17α (para a direita), onde entra a alquila. */
export const ALPHA = vertex(C17, S * 0.8, 14);

/** Ligações do esqueleto, na ordem em que são desenhadas. */
export const SKELETON: string[] = [
    ringPath(ringA),
    ringPath(hex(B)),
    ringPath(ringC),
    ringPath(ringD),
    line(d1, d2),
    line(C3, KETONE),
    line(k1, k2),
    line(C10, vertex(C10, S * 0.75, -90)),
    line(C13, vertex(C13, S * 0.75, -90)),
];

/** Ligação C17–O (17β). */
export const BOND_OH = line(C17, OH);

/** Ligação tracejada (hash wedge) C17 → 17α: série de traços que se alargam. */
export const alphaHashes = (): string[] => {
    const n = 6;
    const dx = ALPHA[0] - C17[0], dy = ALPHA[1] - C17[1];
    const len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len;
    return Array.from({ length: n }, (_, i) => {
        const t = (i + 1) / (n + 0.4);
        const cx = C17[0] + dx * t, cy = C17[1] + dy * t;
        const w = 3 + t * 13;
        return line([cx - nx * w, cy - ny * w], [cx + nx * w, cy + ny * w]);
    });
};

const ALL = [...ringA, ...ringC, ...ringD, ...hex(B), KETONE, OH, ALPHA, vertex(C13, S * 0.75, -90)];
const xs = ALL.map(p => p[0]);
const ys = ALL.map(p => p[1]);
export const BOUNDS = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };

export interface Frame {
    transform: string;
    scale: number;
    /** Converte um ponto da molécula para coordenadas do SVG externo. */
    map: (p: Point) => Point;
}

/** Encaixa a molécula (centralizada) numa caixa do SVG externo. */
export const fitMolecule = (x: number, y: number, w: number, h: number): Frame => {
    const scale = Math.min(w / BOUNDS.w, h / BOUNDS.h);
    const ox = x + (w - BOUNDS.w * scale) / 2 - BOUNDS.x * scale;
    const oy = y + (h - BOUNDS.h * scale) / 2 - BOUNDS.y * scale;
    return {
        transform: `translate(${ox} ${oy}) scale(${scale})`,
        scale,
        map: ([px, py]) => [ox + px * scale, oy + py * scale],
    };
};
