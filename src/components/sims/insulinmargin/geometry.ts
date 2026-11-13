import { DOSE_MICRO } from './content';

/** Altura do cartão da cena (px); a largura vem do layout (`width`). */
export const SCENE_H = 366;
/** Largura mínima de desenho: tudo até o abismo cabe em 1100 px. */
export const MIN_W = 1100;

/** Régua esquemática: posição horizontal = dose (UI). Só ~10, ~12 e ~15+ são marcados. */
export const PX_PER_UI = 49;
export const X_ZERO = 50;
export const dx = (dose: number): number => X_ZERO + dose * PX_PER_UI;
export const X_MICRO = dx(DOSE_MICRO);

/**
 * Onde a viga começa, já em px de tela (o SVG encolhe com a caixa: `meet` + `xMinYMid`).
 * O cartão do segmento usa isso para parar antes da régua colorida em telas estreitas.
 */
export const deckEndPx = (boxWidth: number): number => X_MICRO * Math.min(1, boxWidth / MIN_W);
