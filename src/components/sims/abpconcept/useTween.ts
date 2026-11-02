import { useEffect, useRef, useState } from 'react';

const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Interpola um número até o alvo (ponteiros, faixas, morfologia do palheiro).
 * Cada novo alvo parte do valor exibido no momento; `delay` adia o início e `initial`
 * define de onde parte a primeira animação (ao montar).
 */
export const useTween = (target: number, duration = 900, delay = 0, initial?: number): number => {
    const [value, setValue] = useState(initial ?? target);
    const shownRef = useRef(initial ?? target);

    useEffect(() => {
        const from = shownRef.current;
        const reduced = prefersReducedMotion();
        const total = reduced ? 0 : duration;
        const wait = reduced ? 0 : delay;
        let raf = 0;
        let t0 = 0;
        const tick = (now: number) => {
            if (t0 === 0) t0 = now + wait;
            const p = total === 0 ? (now >= t0 ? 1 : 0) : Math.min(1, Math.max(0, (now - t0) / total));
            const next = from + (target - from) * easeInOutCubic(p);
            shownRef.current = next;
            setValue(next);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration, delay]);

    return value;
};
