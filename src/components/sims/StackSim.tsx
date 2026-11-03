import { useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Layers } from 'lucide-react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { PIECES, STEPS } from './stack/content';
import { GearAssembly } from './stack/GearAssembly';
import { OriginNote } from './stack/OriginNote';
import { PiecePanel } from './stack/PiecePanel';
import { ResultPanel } from './stack/ResultPanel';
import { TracePanel } from './stack/TracePanel';

/**
 * Slide "O STACK OLÍMPICO": as três peças (EAA, hGH/IGF-1, insulina) encaixam como engrenagens.
 * Passos 0–2: cada peça encaixa (texto do cartão + meia-vida/janela) · 3: perfil de rastro
 * comparado (a insulina não aparece) · 4: resultado (+5 → +8 kg) e o preço (janela de erro = minutos).
 */

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const subscribeReduced = (cb: () => void) => {
    const mq = window.matchMedia(REDUCED_QUERY);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
};
const getReduced = () => window.matchMedia(REDUCED_QUERY).matches;

const CARD = 'relative rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] overflow-hidden';

const stepColor = (i: number): string => (i < 3 ? PIECES[i].color : i === 3 ? '#22D3EE' : '#E11D48');

export default function StackSim() {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false);
    const [origin, setOrigin] = useState(false);
    const info = STEPS[step];
    const accent = stepColor(step);

    return (
        <div className="w-full select-none font-body text-white" style={{ height: 512 }}>
            <div className="mb-2 flex h-[46px] items-center justify-between gap-4">
                <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0 flex-1 text-balance leading-tight">
                    <span className="font-display text-[17px] font-semibold" style={{ color: accent }}>{info.title}</span>
                    <span className="text-[15px] text-gray-200"> · {info.caption}</span>
                </motion.div>
                <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] p-1" role="tablist" aria-label="Passos do stack">
                    {STEPS.map((s, i) => {
                        const active = i === step;
                        const color = stepColor(i);
                        return (
                            <button
                                key={s.tab} type="button" role="tab" aria-selected={active} onClick={() => setStep(i)}
                                className="relative cursor-pointer rounded-xl px-3 py-1.5 text-[14.5px] font-semibold transition-colors"
                                style={{ color: active ? '#fff' : '#D1D5DB' }}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="stack-step" className="absolute inset-0 rounded-xl"
                                        style={{ background: `${color}22`, border: `1px solid ${color}99` }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                    />
                                )}
                                <span className="relative">{s.tab}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: '440px minmax(0,1fr)', height: 458 }}>
                <div className={CARD}>
                    <GearAssembly step={step} reduced={reduced} onSelect={setStep} />
                    <button
                        type="button" onClick={() => setOrigin(true)}
                        className="absolute bottom-3 right-3 flex cursor-pointer items-center gap-1.5 rounded-xl border border-white/15 bg-[rgba(8,8,18,0.85)] px-3 py-1.5 text-[14px] font-semibold text-gray-100 transition-colors hover:border-white/40"
                    >
                        <Layers size={14} aria-hidden /> Por que “stack”?
                    </button>
                    <AnimatePresence>{origin && <OriginNote onClose={() => setOrigin(false)} />}</AnimatePresence>
                </div>

                <div className={CARD} style={{ borderColor: `${accent}55` }}>
                    <motion.div
                        key={step}
                        className="h-full"
                        initial={reduced ? false : { opacity: 0, x: 18 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {step < 3 && <PiecePanel piece={PIECES[step]} index={step} />}
                        {step === 3 && <TracePanel reduced={reduced} />}
                        {step === 4 && <ResultPanel reduced={reduced} />}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
