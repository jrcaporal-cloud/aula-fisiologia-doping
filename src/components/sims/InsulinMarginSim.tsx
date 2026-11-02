import { useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { Bridge, SCENE_H } from './insulinmargin/Bridge';
import { STEPS } from './insulinmargin/content';
import { Facts } from './insulinmargin/Facts';
import { useBoxWidth } from './insulinmargin/useBoxWidth';
import { ZoneCard } from './insulinmargin/ZoneCard';

/**
 * Slide "A Margem que Mata" (Anabolismo vs Hipoglicemia): a régua de dose vira uma ponte estreita.
 * Passo 0: a régua inteira · 1: ~10 UI (máximo anabolismo) · 2: ~12 UI (receptores saturados)
 * · 3: ~15+ UI, a dose cai no abismo (margem de 2 a 4 unidades extras) · 4: indetectável e sem antídoto.
 */

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const subscribeReduced = (cb: () => void) => {
    const mq = window.matchMedia(REDUCED_QUERY);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
};
const getReduced = () => window.matchMedia(REDUCED_QUERY).matches;

const STEP_COLORS = ['#E5E7EB', '#10B981', '#F59E0B', '#E11D48', '#C084FC'] as const;

export default function InsulinMarginSim() {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false);
    const info = STEPS[step];
    const accent = STEP_COLORS[step];
    const [sceneRef, sceneW] = useBoxWidth<HTMLDivElement>(1100);

    return (
        <div className="w-full select-none font-body text-white" style={{ height: 520 }}>
            <div className="mb-2.5 flex h-[40px] items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 rounded-md border border-white/15 px-2 py-1 font-mono text-[12px] uppercase tracking-widest text-gray-200">
                        Passo {step + 1}/{STEPS.length}
                    </span>
                    <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0 truncate">
                        <span className="font-display text-[16px] font-semibold" style={{ color: accent }}>{info.title}</span>
                        <span className="text-[14px] text-gray-200"> · {info.caption}</span>
                    </motion.div>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] p-1" role="tablist" aria-label="Passos da régua">
                    {STEPS.map((s, i) => {
                        const active = i === step;
                        return (
                            <button
                                key={s.tab} type="button" role="tab" aria-selected={active} onClick={() => setStep(i)}
                                className="relative cursor-pointer rounded-xl px-3 py-1.5 text-[13.5px] font-semibold transition-colors"
                                style={{ color: active ? '#fff' : '#D1D5DB' }}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="margin-step" className="absolute inset-0 rounded-xl"
                                        style={{ background: `${STEP_COLORS[i]}22`, border: `1px solid ${STEP_COLORS[i]}99` }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                    />
                                )}
                                <span className="relative">{s.tab}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div style={{ height: 84 }}>
                <Facts step={step} />
            </div>

            <div ref={sceneRef} className="relative mt-2.5 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)]" style={{ height: SCENE_H }}>
                <Bridge step={step} reduced={reduced} onZone={setStep} width={sceneW} />
                <div className="absolute bottom-3 left-3 overflow-hidden rounded-xl border border-white/10" style={{ width: 500, height: 136, background: 'rgba(5,5,16,0.85)' }}>
                    <ZoneCard step={step} />
                </div>
            </div>
        </div>
    );
}
