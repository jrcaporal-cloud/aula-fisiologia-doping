import { AnimatePresence, motion } from 'framer-motion';
import { ChartColumn, Microscope, X } from 'lucide-react';
import { DUR, EASE_OUT, stagger } from '../../../lib/motion';
import type { PanelData } from './data';

interface DataDrawerProps {
    panel: PanelData | null;
    reduced: boolean;
    onClose: () => void;
}

const ICONS = { wada: ChartColumn, real: Microscope } as const;

/** Gaveta sobreposta à grade com os dados de um painel — não empurra o layout. */
export const DataDrawer = ({ panel, reduced, onClose }: DataDrawerProps) => {
    const Icon = panel ? ICONS[panel.id] : null;
    return (
    // Sem modo de espera: o painel novo entra na hora (a gaveta é absolute, o que sai não empurra nada).
    <AnimatePresence initial={false}>
        {panel && (
            <motion.div
                key={panel.id}
                initial={{ opacity: 0, x: reduced ? 0 : -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, transition: { duration: reduced ? 0 : DUR.exit } }}
                transition={{ duration: reduced ? 0 : DUR.enter, ease: EASE_OUT }}
                className="absolute inset-y-0 -left-3 right-0 z-20 flex flex-col rounded-xl border px-6 py-5"
                style={{
                    background: 'rgba(8,8,18,0.985)',
                    borderColor: panel.color,
                }}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="flex items-center gap-2 text-[15px] font-semibold uppercase tracking-[0.1em]" style={{ color: panel.color }}>
                            {Icon && <Icon size={16} strokeWidth={2.2} aria-hidden />}
                            {panel.title} · {panel.subtitle}
                        </p>
                        <p className="mt-1.5 font-body text-[1.35rem] font-semibold text-white leading-tight">{panel.question}</p>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Fechar dados"
                        className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--act-color,#E11D48)] flex-shrink-0 rounded-lg border border-white/15 p-1.5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white cursor-pointer">
                        <X size={16} aria-hidden />
                    </button>
                </div>

                <ul className="mt-3 flex flex-col gap-2.5">
                    {panel.bullets.map((b, i) => (
                        <motion.li key={b}
                            initial={{ opacity: 0, x: reduced ? 0 : -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: reduced ? 0 : stagger(i, 0.08, 0.05), duration: DUR.enter, ease: EASE_OUT }}
                            className="flex items-start gap-3 text-[17px] leading-snug text-slate-100">
                            <span className="mt-[0.45em] h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ background: panel.color }} />
                            <span>{b}</span>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>
        )}
    </AnimatePresence>
    );
};
