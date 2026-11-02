import type { Pt } from './geometry';

export const BODY = 'var(--font-body), sans-serif';
export const MONO = 'var(--font-mono), monospace';

/** Ponta de seta (triângulo) em `tip`, apontando na direção `from → tip`. */
export const arrowHead = (from: Pt, tip: Pt, size = 11): string => {
    const ang = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
    const a1 = ang + Math.PI * 0.84;
    const a2 = ang - Math.PI * 0.84;
    return `M${tip[0]} ${tip[1]} L${tip[0] + size * Math.cos(a1)} ${tip[1] + size * Math.sin(a1)} L${tip[0] + size * Math.cos(a2)} ${tip[1] + size * Math.sin(a2)} Z`;
};
