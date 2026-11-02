import { AnimatePresence, motion } from 'framer-motion';
import { ChartColumn, ChevronRight, Microscope } from 'lucide-react';
import type { ReactNode } from 'react';
import { COLORS, type PanelData } from './data';
import { useCountUp } from './useCountUp';

interface StatReadoutProps {
    panel: PanelData;
    shown: boolean;
    open: boolean;
    reduced: boolean;
    /** Atraso da contagem (s) — o 43% acompanha a onda da grade. */
    countDelay: number;
    countDuration: number;
    onToggle: () => void;
    /** Linha extra que aparece depois da revelação (ex.: comparação com o palpite). */
    footnote?: ReactNode;
}

const ICONS = { wada: ChartColumn, real: Microscope } as const;

/** Leitura de um número da aula: valor grande que conta, título, fonte e botão para os dados. */
export const StatReadout = ({ panel, shown, open, reduced, countDelay, countDuration, onToggle, footnote }: StatReadoutProps) => {
    const label = useCountUp(panel.pct, shown, { duration: countDuration, delay: countDelay, reduced });
    const Icon = ICONS[panel.id];

    return (
        <div className="relative flex flex-col">
            <div className="flex items-center gap-4">
                <span className="block min-w-[7.6rem] font-display text-[3.5rem] font-bold leading-none tabular-nums">
                    {shown
                        ? <motion.span style={{ color: panel.color, textShadow: `0 0 26px ${panel.glow}` }}>{label}</motion.span>
                        : <span className="text-white/40">?</span>}
                </span>
                <p className={`font-display text-[1.3rem] font-semibold leading-tight transition-colors duration-500 ${shown ? 'text-white' : 'text-white/60'}`}>
                    {panel.title}
                </p>
            </div>
            <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold uppercase tracking-[0.12em] transition-colors duration-500"
                style={{ color: shown ? panel.color : 'rgba(148,163,184,0.9)' }}>
                <Icon size={14} strokeWidth={2.2} aria-hidden />
                {panel.subtitle}
            </p>

            {footnote !== undefined && (
                <div className="mt-1.5 min-h-[1.5rem]">
                    <AnimatePresence>
                        {shown && (
                            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                transition={{ delay: reduced ? 0 : countDelay + countDuration * 0.75, duration: 0.5 }}>
                                {footnote}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <button type="button" onClick={onToggle} disabled={!shown} aria-expanded={open}
                className={`mt-3 flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-[14px] font-semibold transition-all duration-300
                    ${shown ? 'cursor-pointer hover:bg-white/[0.06]' : 'cursor-default opacity-40'}`}
                style={{
                    color: open ? '#fff' : COLORS.amberSoft,
                    borderColor: open ? panel.color : 'rgba(255,255,255,0.10)',
                    background: open ? `${panel.glow.replace('0.35', '0.14')}` : 'rgba(255,255,255,0.02)',
                }}>
                <motion.span animate={{ rotate: open ? 90 : 0 }} className="flex">
                    <ChevronRight size={16} strokeWidth={2.4} aria-hidden />
                </motion.span>
                {panel.question}
            </button>
        </div>
    );
};
