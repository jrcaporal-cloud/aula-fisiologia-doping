/**
 * Geometria do esquema anatômico (viewBox 760 × 470) e do glifo da molécula.
 * Fluxo da esquerda para a direita: sangue → fígado → rins → bexiga → frasco.
 * Na deleção, o desvio é fígado → intestino → fezes.
 */

export const VIEW_W = 760;
export const VIEW_H = 470;

export const VESSEL = { x0: 14, x1: 746, y: 92, half: 15 } as const;
export const SYRINGE_X = 58;
export const ENZYME = { x: 192, y: 206 } as const;
export const MUSCLE = { x: 606, y: 172 } as const;
export const BLADDER = { x: 462, y: 368 } as const;
export const CUP = { x: 556, y: 396 } as const;
export const KIDNEYS = [{ x: 420, y: 212 }, { x: 504, y: 212 }] as const;

/** Medidor T/E: escala linear 0–20. */
export const GAUGE = { x: 690, w: 22, top: 136, bottom: 424, max: 20 } as const;
export const gaugeY = (v: number): number =>
    GAUGE.bottom - (Math.min(v, GAUGE.max) / GAUGE.max) * (GAUGE.bottom - GAUGE.top);

/* ───────── Rotas das moléculas (cada rota = segmentos encadeados) ───────── */

const SEG_IN = `M${VESSEL.x0} ${VESSEL.y} L 140 ${VESSEL.y} C 154 ${VESSEL.y} 160 104 162 118 C 165 140 170 168 ${ENZYME.x} ${ENZYME.y}`;
const SEG_LIVER_OUT = `M${ENZYME.x} ${ENZYME.y} C 240 206 290 196 336 190 C 370 186 392 196 412 208`;
const SEG_KIDNEY = 'M412 208 C 424 222 430 240 434 262 C 440 296 448 324 458 352 L 462 370';
const SEG_COLLECT = `M462 370 L 462 400 C 466 436 520 446 ${CUP.x - 18} 416 L ${CUP.x} ${CUP.y + 8}`;
const SEG_BILE = `M${ENZYME.x} ${ENZYME.y} C 196 236 202 270 206 322`;
const SEG_GUT = 'M206 322 C 292 322 300 352 212 352 C 120 352 116 382 212 382 C 300 382 304 412 212 412 C 150 412 104 418 78 434 L 34 452';
const SEG_BLOOD = `M${VESSEL.x0} ${VESSEL.y} L ${VESSEL.x1} ${VESSEL.y}`;
const SEG_MUSCLE = `M${VESSEL.x0} ${VESSEL.y} L ${MUSCLE.x - 14} ${VESSEL.y} C ${MUSCLE.x - 2} ${VESSEL.y} ${MUSCLE.x} 110 ${MUSCLE.x} 128 L ${MUSCLE.x} ${MUSCLE.y}`;

export type RouteId = 'blood' | 'normal' | 'del' | 'muscle';

export const ROUTES: Record<RouteId, readonly string[]> = {
    blood: [SEG_BLOOD],
    normal: [SEG_IN, SEG_LIVER_OUT, SEG_KIDNEY, SEG_COLLECT],
    del: [SEG_IN, SEG_BILE, SEG_GUT],
    muscle: [SEG_MUSCLE],
};

/** Desenho dos condutos (mesmo traçado das rotas). */
export const DUCTS = {
    hepaticIn: `M150 ${VESSEL.y} C 158 100 162 112 164 130 C 165 140 166 146 168 152`,
    liverOut: 'M318 192 C 350 188 380 190 404 204',
    bile: SEG_BILE,
    gut: SEG_GUT,
    ureterL: 'M424 246 C 430 280 444 320 452 346',
    ureterR: 'M500 246 C 494 280 480 320 472 346',
    urethra: 'M462 398 L 462 404',
    collect: `M462 404 C 466 436 520 446 ${CUP.x - 18} 416`,
    muscleIn: `M${MUSCLE.x} ${VESSEL.y + VESSEL.half} L ${MUSCLE.x} 140`,
} as const;

/* ───────── Órgãos ───────── */

export const LIVER_PATH =
    'M70 176 C 70 146 120 136 180 140 C 240 144 300 150 326 166 C 342 177 332 192 306 199 C 270 210 236 240 192 264 C 150 286 96 282 79 252 C 66 229 68 202 70 176 Z';

const kidney = (cx: number, cy: number, mirror: boolean): string => {
    const s = mirror ? -1 : 1;
    const x = (dx: number) => cx + s * dx;
    return `M${x(4)} ${cy - 40} C ${x(-26)} ${cy - 42} ${x(-30)} ${cy - 6} ${x(-26)} ${cy + 14} C ${x(-22)} ${cy + 38} ${x(0)} ${cy + 44} ${x(14)} ${cy + 34} C ${x(22)} ${cy + 28} ${x(18)} ${cy + 16} ${x(10)} ${cy + 8} C ${x(4)} ${cy + 2} ${x(4)} ${cy - 6} ${x(10)} ${cy - 12} C ${x(20)} ${cy - 20} ${x(24)} ${cy - 38} ${x(4)} ${cy - 40} Z`;
};
export const KIDNEY_PATHS = [kidney(KIDNEYS[0].x, KIDNEYS[0].y, false), kidney(KIDNEYS[1].x, KIDNEYS[1].y, true)] as const;

export const BLADDER_PATH = `M${BLADDER.x - 36} ${BLADDER.y - 14} C ${BLADDER.x - 38} ${BLADDER.y - 34} ${BLADDER.x + 38} ${BLADDER.y - 34} ${BLADDER.x + 36} ${BLADDER.y - 14} C ${BLADDER.x + 34} ${BLADDER.y + 14} ${BLADDER.x + 14} ${BLADDER.y + 30} ${BLADDER.x} ${BLADDER.y + 30} C ${BLADDER.x - 14} ${BLADDER.y + 30} ${BLADDER.x - 34} ${BLADDER.y + 14} ${BLADDER.x - 36} ${BLADDER.y - 14} Z`;

/* ───────── Glifo da testosterona (4 anéis) e do ácido glucurônico ───────── */

type Pt = readonly [number, number];
const R = 5;
const SQ3 = Math.sqrt(3);
const fmt = (p: Pt) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`;
const polygon = (pts: readonly Pt[]) => `M${pts.map(fmt).join(' L ')} Z`;

const hexagon = (cx: number, cy: number, r: number): Pt[] =>
    Array.from({ length: 6 }, (_, k) => {
        const a = ((-90 + 60 * k) * Math.PI) / 180;
        return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
    });

/** Pentágono regular construído para fora (à direita) a partir da aresta p1→p2. */
const pentagonOnEdge = (p1: Pt, p2: Pt): Pt[] => {
    const pts: Pt[] = [p1, p2];
    let dir: Pt = [p2[0] - p1[0], p2[1] - p1[1]];
    const turn = (-72 * Math.PI) / 180;
    for (let i = 0; i < 3; i++) {
        dir = [dir[0] * Math.cos(turn) - dir[1] * Math.sin(turn), dir[0] * Math.sin(turn) + dir[1] * Math.cos(turn)];
        const last = pts[pts.length - 1];
        pts.push([last[0] + dir[0], last[1] + dir[1]]);
    }
    return pts.slice(0, 5);
};

const ringA = hexagon(0, 0, R);
const ringB = hexagon(R * SQ3, 0, R);
const cCenter: Pt = [1.5 * R * SQ3, -1.5 * R];
const ringC = hexagon(cCenter[0], cCenter[1], R);
const ringD = pentagonOnEdge([cCenter[0] + (R * SQ3) / 2, cCenter[1] - R / 2], [cCenter[0] + (R * SQ3) / 2, cCenter[1] + R / 2]);
const tip = ringD.reduce((a, b) => (b[0] > a[0] ? b : a));

/** Centraliza o esqueleto esteroide na origem. */
export const STEROID_OFFSET: Pt = [-10, 4];
export const STEROID_PATH = [ringA, ringB, ringC, ringD].map(polygon).join(' ');

const GLUC_R = 4.6;
const glucCenter: Pt = [tip[0] + 4 + GLUC_R, tip[1] + 3];
export const GLUC_BOND = `M${fmt(tip)} L ${fmt([glucCenter[0] - GLUC_R * 0.86, glucCenter[1] - GLUC_R * 0.5])}`;
export const GLUC_PATH = polygon(hexagon(glucCenter[0], glucCenter[1], GLUC_R));
export const GLUC_CENTER = glucCenter;
/** Hexágono avulso (ácido glucurônico) centrado na origem. */
export const SUGAR_PATH = polygon(hexagon(0, 0, GLUC_R));
