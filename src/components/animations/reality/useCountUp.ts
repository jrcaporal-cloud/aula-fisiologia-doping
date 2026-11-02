import { animate, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { useEffect } from 'react';

interface CountUpOptions {
    duration: number;
    delay?: number;
    reduced: boolean;
}

/** Número que conta de 0 até `target` quando `active` vira true (e volta a 0 quando sai). */
export const useCountUp = (target: number, active: boolean, { duration, delay = 0, reduced }: CountUpOptions): MotionValue<string> => {
    const value = useMotionValue(active ? target : 0);
    const label = useTransform(value, v => `${Math.round(v)}%`);

    useEffect(() => {
        const to = active ? target : 0;
        if (reduced) {
            value.set(to);
            return undefined;
        }
        const controls = animate(value, to, {
            duration: active ? duration : 0.25,
            delay: active ? delay : 0,
            ease: [0.16, 1, 0.3, 1],
        });
        return () => controls.stop();
    }, [active, target, duration, delay, reduced, value]);

    return label;
};
