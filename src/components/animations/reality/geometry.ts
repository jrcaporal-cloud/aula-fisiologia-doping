/**
 * Geometria do "estádio": 100 atletas numa grade 20 × 5, preenchida coluna a coluna
 * da esquerda para a direita — assim cada fatia (palpite, 2%, 43%) vira um bloco
 * contínuo que se lê como uma barra.
 */
export const COLS = 20;
export const ROWS = 5;
export const TOTAL = COLS * ROWS;

/** Célula de cada atleta (px no palco de 1280). */
export const CELL_W = 31;
export const CELL_H = 50;
/** Pictograma dentro da célula. */
export const ICON_W = 22;
export const ICON_H = 44;

/** Margens do SVG: topo para as etiquetas, base para o colchete do abismo. */
export const PAD_X = 3;
export const PAD_TOP = 30;
export const PAD_BOTTOM = 50;

export const GRID_W = COLS * CELL_W;
export const GRID_H = ROWS * CELL_H;
export const SVG_W = GRID_W + PAD_X * 2;
export const SVG_H = PAD_TOP + GRID_H + PAD_BOTTOM;

export interface CellPos {
    col: number;
    row: number;
    x: number;
    y: number;
    cx: number;
    cy: number;
}

export const cellPos = (index: number): CellPos => {
    const col = Math.floor(index / ROWS);
    const row = index % ROWS;
    const x = PAD_X + col * CELL_W;
    const y = PAD_TOP + row * CELL_H;
    return { col, row, x, y, cx: x + CELL_W / 2, cy: y + CELL_H / 2 };
};

type Point = readonly [number, number];

/** Contorno (em unidades de célula) dos primeiros `n` atletas da grade. */
const prefixPolygon = (n: number): Point[] | null => {
    if (n <= 0) return null;
    const count = Math.min(n, TOTAL);
    const q = Math.floor(count / ROWS);
    const r = count % ROWS;
    if (r === 0) return [[0, 0], [q, 0], [q, ROWS], [0, ROWS]];
    if (q === 0) return [[0, 0], [1, 0], [1, r], [0, r]];
    return [[0, 0], [q + 1, 0], [q + 1, r], [q, r], [q, ROWS], [0, ROWS]];
};

/** Caminho SVG (px) do contorno dos primeiros `n` atletas. */
export const prefixPath = (n: number): string | null => {
    const pts = prefixPolygon(n);
    if (!pts) return null;
    return pts
        .map(([cx, cy], i) => `${i === 0 ? 'M' : 'L'}${PAD_X + cx * CELL_W} ${PAD_TOP + cy * CELL_H}`)
        .join(' ') + ' Z';
};

/** Borda direita (px) da fatia dos primeiros `n` atletas, na linha de cima. */
export const prefixRightEdge = (n: number): number => {
    const count = Math.min(Math.max(n, 0), TOTAL);
    return PAD_X + Math.ceil(count / ROWS) * CELL_W;
};
