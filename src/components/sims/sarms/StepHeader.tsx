import { motion } from 'framer-motion';

/** Cabeçalho dos simuladores de SARMs e beta-2: rótulo do passo + título + abas clicáveis. */

export interface HeaderStep {
    readonly label: string;
    readonly title: string;
    readonly caption: string;
    readonly color: string;
}

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
        <div className="flex items-center justify-between gap-4 h-[40px] mb-2.5">
            <div className="flex items-center gap-3 min-w-0">
                <span className="shrink-0 font-mono text-[12px] tracking-widest uppercase px-2 py-1 rounded-md border border-white/15 text-gray-200">
                    Passo {step + 1}/{steps.length}
                </span>
                <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0 truncate">
                    <span className="font-display text-[16px] font-semibold" style={{ color: info.color }}>{info.title}</span>
                    <span className="text-[14px] text-gray-200"> · {info.caption}</span>
                </motion.div>
            </div>
            <div className="flex items-center gap-1 rounded-2xl border border-white/10 p-1 shrink-0" style={CARD_BG} role="tablist" aria-label="Passos do slide">
                {steps.map((s, i) => {
                    const active = i === step;
                    return (
                        <button key={s.label} type="button" role="tab" aria-selected={active} onClick={() => onSelect(i)}
                            className="relative px-3 py-1.5 rounded-xl text-[13.5px] font-semibold cursor-pointer transition-colors"
                            style={{ color: active ? '#fff' : '#D1D5DB' }}>
                            {active && (
                                <motion.span layoutId={`${id}-step`} className="absolute inset-0 rounded-xl"
                                    style={{ background: `${s.color}22`, border: `1px solid ${s.color}99` }}
                                    transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                            )}
                            <span className="relative flex items-center gap-1.5">
                                <span className="font-mono text-[12px]" style={{ color: s.color }}>{i + 1}</span>
                                {s.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
