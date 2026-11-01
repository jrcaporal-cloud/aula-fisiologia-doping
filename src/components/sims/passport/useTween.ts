import { useEffect, useRef, useState } from 'react';

const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Interpola um vetor de números até o alvo (usado para o corredor estreitar suavemente).
 * O alvo deve ser memoizado pelo chamador; cada novo alvo parte do valor exibido no momento.
 */
export const useTween = (target: readonly number[], duration = 900): readonly number[] => {
    const [value, setValue] = useState<readonly number[]>(target);
    const shownRef = useRef<readonly number[]>(target);

    useEffect(() => {
        const from = shownRef.current;
        const total = prefersReducedMotion() ? 0 : duration;
        const t0 = performance.now();
        let raf = 0;
        const tick = (now: number) => {
            const p = total === 0 ? 1 : Math.min(1, (now - t0) / total);
            const e = easeInOutCubic(p);
            const next = target.map((v, i) => (from[i] ?? v) + (v - (from[i] ?? v)) * e);
            shownRef.current = next;
            setValue(next);
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration]);

    return value;
};
