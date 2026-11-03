import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

import { VIEW_H, VIEW_W } from './echoKit';

/** Peças comuns aos desenhos-eco: moldura SVG e rótulo que some no modo compacto. */

interface EchoSvgProps {
    readonly label: string;
    readonly children: ReactNode;
}

export const EchoSvg = ({ label, children }: EchoSvgProps) => (
    <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="block h-full w-full overflow-visible select-none" role="img" aria-label={label}>
        {children}
    </svg>
);

interface LabelProps {
    readonly compact: boolean;
    readonly x: number;
    readonly y: number;
    readonly children: ReactNode;
    readonly size?: number;
    readonly fill?: string;
    readonly anchor?: 'start' | 'middle' | 'end';
    readonly weight?: number;
    readonly mono?: boolean;
    readonly delay?: number;
}

/** Texto do desenho: aparece com atraso (acompanha a animação) e some no modo compacto. */
/** Menor tamanho de texto dos desenhos (o SVG é exibido a ~1,0× do viewBox). */
export const MIN_FONT = 15;

export const Label = ({ compact, x, y, children, size = 15, fill = '#E5E7EB', anchor = 'start', weight = 500, mono = false, delay = 0 }: LabelProps) => {
    const reduce = useReducedMotion() ?? false;
    if (compact) return null;
    return (
        <motion.text
            x={x} y={y} textAnchor={anchor} fontSize={Math.max(size, MIN_FONT)} fontWeight={weight} fill={fill}
            stroke="#050510" strokeWidth={4} strokeLinejoin="round" paintOrder="stroke"
            className={mono ? 'font-mono' : 'font-body'}
            initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.45, delay: reduce ? 0 : delay }}
        >
            {children}
        </motion.text>
    );
};
