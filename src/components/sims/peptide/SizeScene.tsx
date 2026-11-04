import { motion } from 'framer-motion';
import { CHAIN_ROWS, PEPTIDE_LIMIT } from './basics';
import { PEPTIDE_COLORS, SvgText } from './ui';

/** Passo 1: cada molécula como um colar de aminoácidos; a partir de ~50, proteína. */

const VIEW = { w: 700, h: 420 } as const;
const X0 = 168;
const GAP = 7.4;
const ROW_H = 41;
const Y0 = 52;
const MAX_DRAWN = 58;
const LIMIT_X = X0 + (PEPTIDE_LIMIT - 0.5) * GAP;

export const SizeScene = () => (
    <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="w-full h-full" role="img" aria-label="Tamanho de cada molécula em aminoácidos">
        <line x1={LIMIT_X} x2={LIMIT_X} y1={24} y2={VIEW.h - 14} stroke="rgba(255,255,255,0.35)" strokeDasharray="5 6" />
        <SvgText x={LIMIT_X - 8} y={22} text="peptídeo" anchor="end" color={PEPTIDE_COLORS.peptide} size={15} />
        <SvgText x={LIMIT_X + 8} y={22} text="proteína" color={PEPTIDE_COLORS.protein} size={15} />

        {CHAIN_ROWS.map((row, r) => {
            const y = Y0 + r * ROW_H;
            const drawn = Math.min(row.aminoAcids, MAX_DRAWN);
            const truncated = row.aminoAcids > MAX_DRAWN;
            const endX = X0 + (drawn - 1) * GAP;
            return (
                <g key={row.name}>
                    <SvgText x={X0 - 18} y={y + 5} text={row.name} anchor="end" size={16} color="#F3F4F6" />
                    <motion.line x1={X0} x2={endX} y1={y} y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth={1.5}
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: r * 0.08 }} />
                    {Array.from({ length: drawn }, (_, i) => (
                        <motion.circle key={i} cx={X0 + i * GAP} cy={y} r={3.2}
                            fill={i < PEPTIDE_LIMIT ? PEPTIDE_COLORS.peptide : PEPTIDE_COLORS.protein}
                            initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.2, delay: r * 0.08 + i * 0.012 }} />
                    ))}
                    <SvgText x={endX + 12} y={y + 5} text={truncated ? `… ${row.aminoAcids}` : `${row.aminoAcids}`} size={16} weight={700}
                        color={row.aminoAcids > PEPTIDE_LIMIT ? PEPTIDE_COLORS.protein : PEPTIDE_COLORS.peptide} />
                </g>
            );
        })}
    </svg>
);
