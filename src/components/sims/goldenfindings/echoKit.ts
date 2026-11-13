/** Constantes comuns aos desenhos-eco (viewBox 600 × 400). */

export const VIEW_W = 600;
export const VIEW_H = 400;
export { EASE_OUT as EASE } from '../../../lib/motion';

export interface EchoProps {
    /** Versão miniatura (passo final): só o desenho, sem rótulos. */
    readonly compact: boolean;
}

/** Escala de traço/marcadores: na miniatura o desenho encolhe ~3×, então os traços engrossam. */
export const strokeK = (compact: boolean): number => (compact ? 2.2 : 1);
