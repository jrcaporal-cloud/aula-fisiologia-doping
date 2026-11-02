import { AnimatePresence, motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { STEPS } from './content';

/** Painel lateral: o cartão do slide original correspondente ao passo, com o texto verbatim. */

interface TextPanelProps {
    readonly step: number;
    /** Presente quando o passo tem animação que pode ser repetida. */
    readonly onReplay?: () => void;
}

export const TextPanel = ({ step, onReplay }: TextPanelProps) => {
    const info = STEPS[step];
    return (
        <div className="relative rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(8,8,18,0.72)' }}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: info.color }} />
            <AnimatePresence mode="wait">
                <motion.div key={step} className="p-4 pl-5 h-full flex flex-col"
                    initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
                    <div className="font-display text-[20px] font-semibold leading-tight text-white">{info.card}</div>
                    <p className="mt-2.5 text-[14.5px] leading-[1.55] text-gray-200">
                        {info.paragraph.map((p, i) => (p.strong
                            ? <strong key={i} className="font-semibold" style={{ color: '#fff' }}>{p.text}</strong>
                            : <span key={i}>{p.text}</span>))}
                    </p>
                    {info.bullets.length > 0 && (
                        <ul className="mt-3 space-y-2.5">
                            {info.bullets.map((b, i) => (
                                <motion.li key={b.label} className="flex gap-2.5 text-[14px] leading-[1.5] text-gray-200"
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.12, duration: 0.3 }}>
                                    <span className="mt-[7px] w-2 h-2 shrink-0 rounded-[2px]" style={{ background: info.color }} />
                                    <span><strong className="text-white font-semibold">{b.label}</strong> {b.text}</span>
                                </motion.li>
                            ))}
                        </ul>
                    )}
                    {step === 1 && (
                        <p className="mt-4 text-[13px] leading-[1.5] text-gray-300 border-t border-white/10 pt-3">
                            A série completa, coleta a coleta, aparece adiante no simulador do Passaporte Biológico.
                        </p>
                    )}
                </motion.div>
            </AnimatePresence>
            <div className="absolute flex items-center justify-between gap-2" style={{ left: 20, right: 16, bottom: 14 }}>
                <span className="text-[12px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                    modelo ilustrativo
                </span>
                {onReplay && (
                    <button type="button" onClick={onReplay}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12.5px] font-semibold cursor-pointer border border-white/15 text-gray-200 hover:bg-white/5 transition-colors">
                        <RotateCcw size={13} /> Repetir
                    </button>
                )}
            </div>
        </div>
    );
};
