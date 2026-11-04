import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

/** Peças comuns aos simuladores do módulo de peptídeos (Ato II). */

export const PANEL_BG = { background: 'rgba(8,8,18,0.72)' } as const;
const SVG_FONT = 'var(--font-body)';

interface StepTabsProps {
    labels: readonly string[];
    step: number;
    onSelect: (index: number) => void;
    layoutId: string;
}

/** Abas numeradas: mostram onde o passador está; o clique é atalho opcional. */
export const StepTabs = ({ labels, step, onSelect, layoutId }: StepTabsProps) => (
    <div className="flex items-center gap-1 rounded-2xl border border-white/10 p-1 self-start" style={PANEL_BG} role="tablist" aria-label="Passos">
        {labels.map((label, i) => {
            const active = i === step;
            return (
                <button key={label} type="button" role="tab" aria-selected={active} onClick={() => onSelect(i)}
                    className="relative px-3 py-1.5 rounded-xl text-[15px] font-semibold cursor-pointer transition-colors"
                    style={{ color: active ? '#fff' : '#D1D5DB' }}>
                    {active && (
                        <motion.span layoutId={layoutId} className="absolute inset-0 rounded-xl bg-brand-crimson/45 border border-brand-red/70"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                    )}
                    <span className="relative flex items-center gap-1.5">
                        <span className="font-mono text-[14px] text-rose-300">{i + 1}</span>
                        {label}
                    </span>
                </button>
            );
        })}
    </div>
);

/** Linha de fonte, discreta mas legível. */
export const Source = ({ children }: { children: ReactNode }) => (
    <p className="text-[14px] leading-snug text-gray-300">{children}</p>
);

interface SvgTextProps {
    x: number;
    y: number;
    text: string;
    color?: string;
    size?: number;
    anchor?: 'start' | 'middle' | 'end';
    weight?: number;
}

/** Texto SVG com contorno escuro, para não sumir sobre linhas e formas. */
export const SvgText = ({ x, y, text, color = '#E5E7EB', size = 16, anchor = 'start', weight = 600 }: SvgTextProps) => (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color}
        style={{ fontFamily: SVG_FONT, paintOrder: 'stroke', stroke: '#080812', strokeWidth: 4, strokeLinejoin: 'round' }}>
        {text}
    </text>
);

export const PEPTIDE_COLORS = {
    peptide: '#38BDF8',
    protein: '#F59E0B',
    steroid: '#E11D48',
    receptor: '#A78BFA',
    membrane: 'rgba(253,164,175,0.55)',
    nucleus: 'rgba(167,139,250,0.22)',
} as const;
