import { motion } from 'framer-motion';
import type { Pt } from './geometry';
import { BODY, arrowHead } from './svgUtil';

interface CurvedArrowProps {
    readonly from: Pt;
    readonly ctrl: Pt;
    readonly to: Pt;
    readonly color: string;
    readonly label: string;
    readonly labelAt: Pt;
    readonly at: number;
    readonly still: boolean;
}

/** Seta curva (quadrática) que se desenha, com rótulo da reação. */
export const CurvedArrow = ({ from, ctrl, to, color, label, labelAt, at, still }: CurvedArrowProps) => (
    <g>
        <motion.path
            d={`M${from.join(' ')} Q${ctrl.join(' ')} ${to.join(' ')}`}
            fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round"
            initial={still ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ pathLength: { delay: at, duration: 0.6, ease: 'easeInOut' }, opacity: { delay: at, duration: 0.1 } }}
        />
        <motion.path
            d={arrowHead(ctrl, to)} fill={color}
            initial={still ? false : { opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: at + 0.55, duration: 0.2 }}
        />
        <motion.text
            x={labelAt[0]} y={labelAt[1]} textAnchor="middle" fill={color}
            fontFamily={BODY} fontSize={19} fontWeight={700}
            initial={still ? false : { opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: at + 0.2, duration: 0.4 }}
        >
            {label}
        </motion.text>
    </g>
);

interface CaptionProps {
    readonly x: number;
    readonly y: number;
    readonly text: string;
    readonly color?: string;
    readonly at: number;
    readonly still: boolean;
    readonly size?: number;
    readonly anchor?: 'start' | 'middle' | 'end';
    readonly weight?: number;
}

export const Caption = ({ x, y, text, color = '#E5E7EB', at, still, size = 19, anchor = 'middle', weight = 600 }: CaptionProps) => (
    <motion.text
        x={x} y={y} textAnchor={anchor} fill={color} fontFamily={BODY} fontSize={size} fontWeight={weight}
        initial={still ? false : { opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: at, duration: 0.45 }}
    >
        {text}
    </motion.text>
);

/** Brilho suave atrás do trecho que muda (anel A, C19…). */
export const Halo = ({ c, r, color, at, still, pulse = false }: { c: Pt; r: number; color: string; at: number; still: boolean; pulse?: boolean }) => (
    <motion.circle
        cx={c[0]} cy={c[1]} r={r} fill={color}
        initial={still ? false : { opacity: 0 }}
        animate={pulse && !still ? { opacity: [0, 0.22, 0.1, 0.22, 0.12] } : { opacity: 0.14 }}
        transition={{ delay: at, duration: pulse ? 2.4 : 0.5, ease: 'easeInOut' }}
    />
);
