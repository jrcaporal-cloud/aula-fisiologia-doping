import { motion } from 'framer-motion';

/** Receptor β2 esquemático (taça aberta para fora da célula). `on` = ocupado/ativo. */

interface Beta2GlyphProps {
    readonly x: number;
    readonly y: number;
    /** Ângulo (graus) para apontar a boca do receptor para fora do tecido. */
    readonly angle?: number;
    readonly on: boolean;
    readonly color: string;
    readonly scale?: number;
}

const CUP = 'M -7 9 L -7 -1 Q -7 -9 -2 -9 L -2 -3 Q 0 -1 2 -3 L 2 -9 Q 7 -9 7 -1 L 7 9 Z';

export const Beta2Glyph = ({ x, y, angle = 0, on, color, scale = 1 }: Beta2GlyphProps) => (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
        <motion.path d={CUP} strokeWidth={1.6} initial={false}
            animate={{ fill: on ? color : 'rgba(34,211,238,0.12)', stroke: on ? '#ffffff' : '#67E8F9' }}
            transition={{ duration: 0.5 }}
            style={{ filter: on ? `drop-shadow(0 0 5px ${color})` : 'none' }} />
    </g>
);
