import { BOX } from './geometry';

export type ColumnMode = 'bud' | 'collapsed' | 'expanded' | 'compare';

export const GAP = 12;
export const BODY_H = 480;
const FOCUS_WEIGHT = 4;
const ASPECT = BOX.w / BOX.h;
/** Fração da altura da caixa onde termina o desenho (base dos anéis A/B). */
const RING_BOTTOM = (40 + 8 - BOX.y) / BOX.h;

export interface Rect {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
}

export interface Column {
    readonly x: number;
    readonly w: number;
    readonly cx: number;
    readonly mode: ColumnMode;
}

export interface Layout {
    readonly bandH: number;
    readonly busY: number;
    readonly trunkTop: number;
    readonly root: Rect;
    readonly columns: readonly Column[];
}

const rootRect = (width: number, w: number, y: number): Rect => ({ x: width / 2 - w / 2, y, w, h: w / ASPECT });

/** Passo 0: testosterona grande; 1–3: uma família aberta; 4: as três iguais. */
export const computeLayout = (step: number, width: number): Layout => {
    const intro = step === 0;
    const focus = step >= 1 && step <= 3 ? step - 1 : -1;
    const weights = [0, 1, 2].map(i => (i === focus ? FOCUS_WEIGHT : 1));
    const total = weights.reduce((a, b) => a + b, 0);
    const usable = Math.max(width - GAP * 2, 0);

    const columns = weights.reduce<Column[]>((acc, wt, i) => {
        const x = i === 0 ? 0 : acc[i - 1].x + acc[i - 1].w + GAP;
        const w = (usable * wt) / total;
        const mode: ColumnMode = intro ? 'bud' : step === 4 ? 'compare' : i === focus ? 'expanded' : 'collapsed';
        return [...acc, { x, w, cx: x + w / 2, mode }];
    }, []);

    const root = intro ? rootRect(width, 400, 16) : rootRect(width, 92, 0);
    const bandH = intro ? 340 : 72;
    return {
        bandH,
        busY: intro ? 312 : 62,
        trunkTop: root.y + root.h * RING_BOTTOM,
        root,
        columns,
    };
};
