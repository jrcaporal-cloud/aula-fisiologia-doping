import { useCallback, useEffect, useRef, useState } from 'react';

export type Easing = (t: number) => number;

export const easeInOutCubic: Easing = t => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const linear: Easing = t => t;

export interface AnimateOptions {
    from?: number;
    duration: number; // ms
    delay?: number; // ms
    ease?: Easing;
    onDone?: () => void;
}

export interface AnimatedValue {
    value: number;
    set: (v: number) => void;
    animateTo: (to: number, opts: AnimateOptions) => void;
    stop: () => void;
}

/** Valor numérico animado por requestAnimationFrame (cancelável, limpo no unmount). */
export const useAnimatedValue = (initial: number): AnimatedValue => {
    const [value, setValue] = useState(initial);
    const current = useRef(initial);
    const raf = useRef<number | null>(null);
    const timer = useRef<number | null>(null);

    const stop = useCallback(() => {
        if (raf.current !== null) cancelAnimationFrame(raf.current);
        if (timer.current !== null) clearTimeout(timer.current);
        raf.current = null;
        timer.current = null;
    }, []);

    const set = useCallback((v: number) => {
        stop();
        current.current = v;
        setValue(v);
    }, [stop]);

    const animateTo = useCallback((to: number, opts: AnimateOptions) => {
        stop();
        const { duration, delay = 0, ease = easeInOutCubic, onDone } = opts;
        const from = opts.from ?? current.current;
        if (opts.from !== undefined) {
            current.current = from;
            setValue(from);
        }
        const run = () => {
            const t0 = performance.now();
            const tick = (now: number) => {
                const p = duration <= 0 ? 1 : Math.min((now - t0) / duration, 1);
                const v = from + (to - from) * ease(p);
                current.current = v;
                setValue(v);
                if (p < 1) raf.current = requestAnimationFrame(tick);
                else {
                    raf.current = null;
                    onDone?.();
                }
            };
            raf.current = requestAnimationFrame(tick);
        };
        if (delay > 0) timer.current = window.setTimeout(run, delay);
        else run();
    }, [stop]);

    useEffect(() => stop, [stop]);

    return { value, set, animateTo, stop };
};
