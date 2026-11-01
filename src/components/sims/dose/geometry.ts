import { X_DOMAIN, Y_DOMAIN } from './model';

/** Geometria do gráfico (px no palco de 1280). */
export const CHART_W = 760;
export const CHART_H = 440;
export const M = { left: 70, right: 22, top: 48, bottom: 60 } as const;
export const PW = CHART_W - M.left - M.right;
export const PH = CHART_H - M.top - M.bottom;

export const sx = (dose: number): number => M.left + ((dose - X_DOMAIN[0]) / (X_DOMAIN[1] - X_DOMAIN[0])) * PW;
export const sy = (kg: number): number => M.top + PH - ((kg - Y_DOMAIN[0]) / (Y_DOMAIN[1] - Y_DOMAIN[0])) * PH;
export const doseFromX = (x: number): number => X_DOMAIN[0] + ((x - M.left) / PW) * (X_DOMAIN[1] - X_DOMAIN[0]);
