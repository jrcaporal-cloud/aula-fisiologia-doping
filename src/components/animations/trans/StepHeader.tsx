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
    readonly title: string;
    readonly chips: readonly StepChip[];
    readonly accent: string;
    readonly layoutId: string;
    readonly onStep: (s: number) => void;
}

export const CARD = 'rounded-2xl border border-white/10';
export const CARD_BG = { background: 'rgba(8,8,18,0.72)' } as const;

/** Faixa de cima: título do passo + atalhos por grupo de passos (o contador de passos fica no rodapé do deck). */
export const StepHeader = ({ step, title, chips, accent, layoutId, onStep }: StepHeaderProps) => (
    <div className="flex items-center justify-between gap-4 h-[36px] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
            <motion.span key={title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                className="font-display text-[20px] font-semibold text-white whitespace-nowrap">
                {title}
            </motion.span>
        </div>
        <div className="shrink-0 flex items-center gap-1 rounded-xl border border-white/10 p-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
            {chips.map(c => {
                const active = c.steps.includes(step);
                return (
                    <button key={c.label} type="button" onClick={() => onStep(c.to)}
                        className="relative px-3 py-1 rounded-lg text-[15px] font-semibold cursor-pointer transition-colors"
                        style={{ color: active ? '#fff' : '#D1D5DB' }}>
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
