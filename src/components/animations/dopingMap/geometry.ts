import { LANE_ORDER, LANE_ROW, SYSTEM_ORDER, SYSTEM_ROW, type Drug } from './data';

export type MapMode = 'system' | 'lane';

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

/** Altura total do mapa (px no palco de 1280). */
export const MAP_HEIGHT = 520;
export const COL_GAP = 22;
/** Coluna (sistema ou faixa) vai do topo até aqui; abaixo fica o rodapé. */
export const COLUMN_HEIGHT = 470;
export const HEADER_HEIGHT = 66;

const CARD_H = { system: 160, lane: 116 } as const;
const ROW_GAP = { system: 30, lane: 16 } as const;
const PAD_X = 12;
const TOP = { system: HEADER_HEIGHT + 34, lane: HEADER_HEIGHT + 22 } as const;

export const columnRect = (width: number, col: number): Rect => {
    const w = (width - COL_GAP * 2) / 3;
    return { x: col * (w + COL_GAP), y: 0, w, h: COLUMN_HEIGHT };
};

export const slotRect = (width: number, mode: MapMode, col: number, row: number): Rect => {
    const column = columnRect(width, col);
    const h = CARD_H[mode];
    return { x: column.x + PAD_X, y: TOP[mode] + row * (h + ROW_GAP[mode]), w: column.w - PAD_X * 2, h };
};

export const cardRect = (width: number, mode: MapMode, drug: Drug): Rect => {
    if (mode === 'system') return slotRect(width, mode, SYSTEM_ORDER.indexOf(drug.system), SYSTEM_ROW[drug.id]);
    return slotRect(width, mode, LANE_ORDER.indexOf(drug.lane), LANE_ROW[drug.id]);
};
