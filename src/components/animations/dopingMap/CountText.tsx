import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';

interface CountTextProps {
    text: string;
    active: boolean;
    delay?: number;
    reduced: boolean;
}

const NUMBER = /\d+/g;

/**
 * Mostra `text` com os números contando de 0 até o valor (quando `active`).
 * No fim da contagem o texto é exatamente o original.
 */
export const CountText = ({ text, active, delay = 0, reduced }: CountTextProps) => {
    const progress = useMotionValue(active && reduced ? 1 : 0);
    const shown = useTransform(progress, p =>
        p >= 1 ? text : text.replace(NUMBER, n => String(Math.round(Number(n) * p))),
    );

    useEffect(() => {
        const to = active ? 1 : 0;
        if (reduced || !active) {
            progress.set(to);
            return undefined;
        }
        progress.set(0);
        const controls = animate(progress, 1, { duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] });
        return () => controls.stop();
    }, [active, delay, reduced, progress]);

    return <motion.span className="tabular-nums">{shown}</motion.span>;
};
