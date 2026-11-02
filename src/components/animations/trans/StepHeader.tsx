import { motion } from 'framer-motion';

/** Grupo de passos clicável no topo do slide (o passador continua mandando). */
export interface StepChip {
    readonly label: string;
    /** Passo para onde o clique leva. */
    readonly to: number;
    /** Passos em que o chip fica aceso. */
    readonly steps: readonly number[];
}

interface StepHeaderProps {
    readonly step: number;
    readonly count: number;
    readonly title: string;
    readonly chips: readonly StepChip[];
    readonly accent: string;
    readonly layoutId: string;
    readonly onStep: (s: number) => void;
}

export const CARD = 'rounded-2xl border border-white/10';
export const CARD_BG = { background: 'rgba(8,8,18,0.72)' } as const;

/** Faixa de cima: "Passo x/N" + título do passo + atalhos por grupo de passos. */
export const StepHeader = ({ step, count, title, chips, accent, layoutId, onStep }: StepHeaderProps) => (
    <div className="flex items-center justify-between gap-4 h-[40px] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
            <span className="shrink-0 font-mono text-[13px] tracking-widest uppercase px-2 py-1 rounded-md border border-white/15 text-gray-200">
                Passo {step + 1}/{count}
            </span>
            <motion.span key={title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                className="font-display text-[19px] font-semibold text-white truncate">
                {title}
            </motion.span>
        </div>
        <div className="shrink-0 flex items-center gap-1 rounded-xl border border-white/10 p-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {chips.map(c => {
                const active = c.steps.includes(step);
                return (
                    <button key={c.label} type="button" onClick={() => onStep(c.to)}
                        className="relative px-3 py-1.5 rounded-lg text-[14px] font-semibold cursor-pointer transition-colors"
                        style={{ color: active ? '#fff' : '#C4C9D2' }}>
                        {active && (
                            <motion.span layoutId={layoutId} className="absolute inset-0 rounded-lg"
                                style={{ background: `${accent}26`, border: `1px solid ${accent}99` }}
                                transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                        )}
                        <span className="relative">{c.label}</span>
                    </button>
                );
            })}
        </div>
    </div>
);
