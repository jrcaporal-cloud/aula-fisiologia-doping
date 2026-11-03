import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Lock, RotateCcw } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { BodyFigure } from './trans/BodyFigure';
import {
    BIO_STEPS, C_PERSISTS, C_REVERTS, PERSISTS, REVERTS, T_GROUPS, fmt, numberOf,
    type BodySpot, type ReversibilityItem,
} from './trans/biologyData';
import { CARD, CARD_BG, StepHeader, type StepChip } from './trans/StepHeader';
import { TestosteroneChart } from './trans/TestosteroneChart';

const CHIPS: readonly StepChip[] = [
    { label: 'Testosterona', to: 0, steps: [0] },
    { label: 'Reverte', to: 1, steps: [1] },
    { label: 'Não reverte', to: 2, steps: [2] },
];

interface ColumnProps {
    readonly items: readonly ReversibilityItem[];
    readonly shown: boolean;
    readonly fresh: boolean;
    readonly reverts: boolean;
    readonly onHover: (s: BodySpot | null) => void;
    readonly footer?: ReactNode;
}

/** Uma coluna ("Reverte" ou "Não reverte"); antes do passo dela, só os contornos vazios. */
const Column = ({ items, shown, fresh, reverts, onHover, footer }: ColumnProps) => {
    const color = reverts ? C_REVERTS : C_PERSISTS;
    const Icon = reverts ? RotateCcw : Lock;
    return (
        <div className="flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-2 transition-opacity duration-500" style={{ opacity: shown ? 1 : 0.6 }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}22`, color }}>
                    <Icon size={18} strokeWidth={2.4} />
                </span>
                <span className="font-display text-[20px] font-semibold" style={{ color }}>{reverts ? 'Reverte' : 'Não reverte'}</span>
                <span className="font-mono text-[15px] text-gray-300 ml-1">{items.length} itens</span>
            </div>
            <div className="flex flex-col gap-1.5">
                {items.map((it, i) => (
                    <div key={it.item} className="relative h-[60px]">
                        <div className="absolute inset-0 rounded-xl border border-dashed border-white/10" />
                        <AnimatePresence>
                            {shown && (
                                <motion.div
                                    initial={{ opacity: 0, x: reverts ? -16 : 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                                    transition={{ duration: 0.45, delay: fresh ? 0.15 + i * 0.12 : 0, ease: [0.16, 1, 0.3, 1] }}
                                    onMouseEnter={() => onHover(it.spot)} onMouseLeave={() => onHover(null)}
                                    className="absolute inset-0 rounded-xl border px-3.5 flex items-center gap-3"
                                    style={{ borderColor: `${color}55`, background: `${color}12` }}>
                                    <span className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-mono text-[15px] font-extrabold"
                                        style={{ background: color, color: '#050510', boxShadow: `0 0 12px ${color}66` }}>{numberOf(it)}</span>
                                    <div className="min-w-0">
                                        <div className="text-[17px] font-semibold text-white leading-tight">{it.item}</div>
                                        <div className="text-[15px] text-gray-300 leading-tight mt-0.5">{it.note}</div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
            {footer}
        </div>
    );
};

/** Lembrete do passo 0: a queda da testosterona média com 2 anos de TRT (mesmos números do gráfico). */
const TRecap = () => {
    const before = T_GROUPS[1];
    const after = T_GROUPS[2];
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="mt-auto rounded-xl border border-white/10 px-3.5 py-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="font-mono text-[14px] uppercase tracking-wider text-gray-300">Testosterona média (nmol/L)</div>
            {[before, after].map(g => (
                <div key={g.label} className="flex items-center gap-3 mt-2">
                    <span className="text-[15px] text-gray-100 w-[200px] shrink-0">{g.label}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div className="h-full rounded-full" style={{ background: g.color }}
                            initial={{ width: 0 }} animate={{ width: `${(g.mean / 30) * 100}%` }} transition={{ duration: 0.9, delay: 0.7 }} />
                    </div>
                    <span className="font-mono text-[15px] font-semibold w-10 text-right" style={{ color: g.color }}>{fmt(g.mean)}</span>
                </div>
            ))}
        </motion.div>
    );
};

/** Passos 1–2: o que a TRT feminizante reverte × não reverte, ligados a uma silhueta. */
const ReversibilityBoard = ({ step }: { step: number }) => {
    const [hover, setHover] = useState<BodySpot | null>(null);
    return (
        <div className={`${CARD} h-full px-5 pt-3.5 pb-3.5 grid gap-4`} style={{ ...CARD_BG, gridTemplateColumns: 'minmax(0,1fr) 230px minmax(0,1fr)' }}>
            <Column items={REVERTS} shown={step >= 1} fresh={step === 1} reverts onHover={setHover} footer={<TRecap />} />
            <div className="flex flex-col items-center min-h-0">
                <div className="font-mono text-[14px] uppercase tracking-wider text-gray-300 text-center leading-snug">TRT feminizante</div>
                <div className="flex-1 min-h-0 w-full mt-1">
                    <BodyFigure step={step} hover={hover} />
                </div>
            </div>
            <Column items={PERSISTS} shown={step >= 2} fresh={step === 2} reverts={false} onHover={setHover} />
        </div>
    );
};

/**
 * "O Dimorfismo Sexual como Variável Atlética".
 * Passos: 0 testosterona por grupo · 1 o que a TRT reverte · 2 o que não reverte.
 */
export const TransBiologyViz = () => {
    const { step, setStep } = useSlideSteps(BIO_STEPS.length);
    return (
        <MotionConfig reducedMotion="user">
            <div className="not-prose w-full font-body text-white select-none flex flex-col gap-2" style={{ height: 470 }}>
                <StepHeader step={step} title={BIO_STEPS[step]} chips={CHIPS} accent="#C084FC" layoutId="tb-chip" onStep={setStep} />
                <div className="flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                        <motion.div key={step === 0 ? 'chart' : 'board'} className="h-full"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                            {step === 0 ? <TestosteroneChart /> : <ReversibilityBoard step={step} />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </MotionConfig>
    );
};
