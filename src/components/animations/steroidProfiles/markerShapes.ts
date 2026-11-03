/** Forma de marcador de cada composto (a identidade não depende só da cor). */
export type MarkerShape = 'circle' | 'square' | 'triangle' | 'triangleDown' | 'diamond' | 'pentagon' | 'cross' | 'star';

export const SHAPE_BY_ID: Readonly<Record<string, MarkerShape>> = {
    test: 'circle',
    dianabol: 'square',
    nandrolona: 'triangle',
    trembolona: 'diamond',
    winstrol: 'triangleDown',
    oxandrolona: 'pentagon',
    primobolan: 'cross',
    hemogenin: 'star',
};

export const shapeOf = (id: string): MarkerShape => SHAPE_BY_ID[id] ?? 'circle';

