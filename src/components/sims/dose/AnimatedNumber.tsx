import { animate, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { fmt } from './model';

interface AnimatedNumberProps {
    value: number;
    digits?: number;
    duration?: number;
    delay?: number;
    prefix?: string;
    suffix?: string;
}

/** Conta de 0 (ou do valor anterior) até `value`, em pt-BR. */
export const AnimatedNumber = ({ value, digits = 1, duration = 1.1, delay = 0, prefix = '', suffix = '' }: AnimatedNumberProps) => {
    const reduce = useReducedMotion();
    const [shown, setShown] = useState(reduce ? value : 0);
    const fromRef = useRef(reduce ? value : 0);

    useEffect(() => {
        if (reduce) {
            fromRef.current = value;
            const id = requestAnimationFrame(() => setShown(value));
            return () => cancelAnimationFrame(id);
        }
        const controls = animate(fromRef.current, value, {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: v => {
                fromRef.current = v;
                setShown(v);
            },
        });
        return () => controls.stop();
    }, [value, duration, delay, reduce]);

    return <>{prefix}{fmt(shown, digits)}{suffix}</>;
};
