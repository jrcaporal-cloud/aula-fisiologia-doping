import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

/** Escala logarítmica base 10: valor do domínio → fração 0…1. */
export const logFrac = (value: number, min: number, max: number): number =>
    (Math.log10(value) - Math.log10(min)) / (Math.log10(max) - Math.log10(min));

/* ---------- Mapa anabólico × androgênico ---------- */

export const MAP_W = 540;
export const MAP_MARGIN = { left: 58, right: 20, top: 18, bottom: 46 } as const;
/** Eixo X: potência androgênica. */
export const ANDRO_DOMAIN = { min: 18, max: 700 } as const;
/** Eixo Y: potência anabólica. */
export const ANAB_DOMAIN = { min: 50, max: 700 } as const;
export const ANDRO_TICKS = [25, 50, 100, 200, 500] as const;
export const ANAB_TICKS = [50, 100, 200, 500] as const;
/** Retas de razão constante (anabólico = k × androgênico) — no log-log viram paralelas. */
export const RATIO_LINES = [
    { k: 1, label: '1:1' },
    { k: 3, label: '3:1' },
    { k: 10, label: '10:1' },
] as const;

export interface MapGeometry {
    plotW: number;
    plotH: number;
    /** Androgênico → x em px (dentro do SVG). */
    x: (androgenic: number) => number;
    /** Anabólico → y em px (dentro do SVG). */
    y: (anabolic: number) => number;
}

export const mapGeometry = (height: number): MapGeometry => {
    const plotW = MAP_W - MAP_MARGIN.left - MAP_MARGIN.right;
    const plotH = height - MAP_MARGIN.top - MAP_MARGIN.bottom;
    return {
        plotW,
        plotH,
        x: v => MAP_MARGIN.left + logFrac(v, ANDRO_DOMAIN.min, ANDRO_DOMAIN.max) * plotW,
        y: v => MAP_MARGIN.top + (1 - logFrac(v, ANAB_DOMAIN.min, ANAB_DOMAIN.max)) * plotH,
    };
};

/* ---------- Régua do tempo (meia-vida), log de horas a semanas ---------- */

export const TIME_DOMAIN = { min: 2, max: 720 } as const;
export const TIME_TICKS = [
    { h: 3, label: '3 h' },
    { h: 6, label: '6 h' },
    { h: 12, label: '12 h' },
    { h: 24, label: '1 d' },
    { h: 72, label: '3 d' },
    { h: 168, label: '1 sem' },
    { h: 336, label: '2 sem' },
] as const;
export const TIME_BANDS = [
    { from: 2, to: 24, label: 'Horas' },
    { from: 24, to: 168, label: 'Dias' },
    { from: 168, to: 720, label: 'Semanas' },
] as const;

export const timeFrac = (hours: number): number => logFrac(hours, TIME_DOMAIN.min, TIME_DOMAIN.max);

/* ---------- Interpolação suave de um número (respeita prefers-reduced-motion) ---------- */

const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const useTween = (target: number, durationMs: number): number => {
    const reduce = useReducedMotion();
    const [value, setValue] = useState(target);
    const current = useRef(target);

    useEffect(() => {
        const from = current.current;
        const start = performance.now();
        let frame = 0;
        const tick = (now: number) => {
            const t = reduce ? 1 : Math.min((now - start) / durationMs, 1);
            const next = from + (target - from) * easeInOutCubic(t);
            current.current = next;
            setValue(next);
            if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, durationMs, reduce]);

    return value;
};
