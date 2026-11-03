import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { DRUGS, SYSTEMS, UGT_NOTE } from './data';
import { cardRect, slotRect } from './geometry';
import { EASE } from './DrugCard';

interface UgtCalloutProps {
    width: number;
    reduced: boolean;
}

/** Nota do asterisco do EAA ("Não*"), presa ao cartão por uma seta tracejada. */
export const UgtCallout = ({ width, reduced }: UgtCalloutProps) => {
    const eaa = DRUGS.find(d => d.id === 'eaa');
    if (!eaa) return null;
    const from = cardRect(width, 'lane', eaa);
    const box = slotRect(width, 'lane', 1, 2);
    const y = from.y + 30;
    const color = SYSTEMS.androgenico.color;
    const delay = reduced ? 0 : 1.5;

    return (
        <>
            <svg className="absolute inset-0 pointer-events-none overflow-visible" width={width} height={1} aria-hidden>
                <motion.path
                    d={`M ${from.x + from.w - 14} ${y} H ${box.x - 6}`}
                    stroke={color}
                    strokeWidth={1.6}
                    strokeDasharray="4 4"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0 : 0.6, delay, ease: EASE }}
                />
                <motion.circle
                    cx={box.x - 6}
                    cy={y}
                    r={3.5}
                    fill={color}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: reduced ? 0 : delay + 0.5 }}
                />
            </svg>
            <motion.div
                className="absolute rounded-xl border border-dashed px-4 py-3 flex flex-col justify-center gap-2"
                style={{ left: box.x, top: box.y, width: box.w, height: box.h, borderColor: `${color}80`, background: 'rgba(8,8,18,0.82)' }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : delay + 0.35, ease: EASE }}
            >
                <p className="text-[17px] leading-snug text-slate-50">
                    <span className="font-bold" style={{ color }}>*</span>{UGT_NOTE.slice(1)}
                </p>
                <p className="flex items-center gap-1.5 font-mono text-[16px] leading-tight text-sky-200">
                    <ArrowRight size={16} className="flex-shrink-0" style={{ color }} />
                    Veja: O Polimorfismo UGT2B17
                </p>
            </motion.div>
        </>
    );
};
