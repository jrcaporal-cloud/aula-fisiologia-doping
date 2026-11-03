import { motion } from 'framer-motion';

/** Cabeçalho dos simuladores de SARMs e beta-2: título do passo + abas (o contador "passo n/N" fica no rodapé do deck). */

export interface HeaderStep {
    readonly label: string;
    readonly title: string;
    readonly caption: string;
    readonly color: string;
}

/** Altura total do cabeçalho (inclui a margem inferior). */
export const HEADER_H = 46;

interface StepHeaderProps {
    readonly steps: readonly HeaderStep[];
    readonly step: number;
    readonly onSelect: (step: number) => void;
    /** Prefixo do layoutId da aba ativa (evita conflito entre simuladores). */
    readonly id: string;
}

const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

export const StepHeader = ({ steps, step, onSelect, id }: StepHeaderProps) => {
    const info = steps[step];
    return (
        <div className="flex items-center justify-between gap-4 h-[38px] mb-2">
            <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0 truncate">
                <span className="font-display text-[16px] font-semibold" style={{ color: info.color }}>{info.title}</span>
                <span className="text-[14px] text-gray-200"> · {info.caption}</span>
            </motion.div>
            <div className="flex items-center gap-1 rounded-2xl border border-white/10 p-[3px] shrink-0" style={CARD_BG} role="tablist" aria-label="Passos do slide">
                {steps.map((s, i) => {
                    const active = i === step;
                    return (
                        <button key={s.label} type="button" role="tab" aria-selected={active} onClick={() => onSelect(i)}
                            className="relative px-3 py-1 rounded-xl text-[14.5px] font-semibold cursor-pointer transition-colors"
                            style={{ color: active ? '#fff' : '#D1D5DB' }}>
                            {active && (
                                <motion.span layoutId={`${id}-step`} className="absolute inset-0 rounded-xl"
                                    style={{ background: `${s.color}22`, border: `1px solid ${s.color}99` }}
                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                            )}
                            <span className="relative flex items-center gap-1.5">
                                <span className="font-mono text-[14px]" style={{ color: s.color }}>{i + 1}</span>
                                {s.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
