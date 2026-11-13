import { useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { Bridge } from './insulinmargin/Bridge';
import { SCENE_H, deckEndPx } from './insulinmargin/geometry';
import { STEPS } from './insulinmargin/content';
import { Facts } from './insulinmargin/Facts';
import { useBoxWidth } from './insulinmargin/useBoxWidth';
import { ZoneCard } from './insulinmargin/ZoneCard';
import { DUR, EASE_OUT, SPRING_TAB } from '../../lib/motion';
import { SUBSTANCE } from '../../lib/palette';

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

const STEP_COLORS = ['#E5E7EB', SUBSTANCE.insulin, '#F59E0B', SUBSTANCE.risk, '#C084FC'] as const;

/** Terceiro título: corpo claro; a cor do passo fica só na dose à esquerda. */
const StepTitle = ({ title, color }: { title: string; color: string }) => {
    const at = title.indexOf(' · ');
    if (at < 0) return <>{title}</>;
    return (
        <>
            <span style={{ color }}>{title.slice(0, at)}</span>
            {title.slice(at)}
        </>
    );
};

export default function InsulinMarginSim() {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false);
    const info = STEPS[step];
    const accent = STEP_COLORS[step];
    const [sceneRef, sceneW] = useBoxWidth<HTMLDivElement>(1100);
    /** O cartão do segmento para antes da viga: em tela estreita ele cobria a régua colorida. */
    const cardW = Math.max(360, Math.min(532, deckEndPx(sceneW) - 16));

    return (
        <div className="w-full select-none font-body text-white" style={{ height: 512 }}>
            <div className="mb-1 flex h-[42px] items-center justify-between gap-4">
                <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.enter, ease: EASE_OUT }} className="min-w-0 flex-1 text-balance leading-tight">
                    <span className="text-[20px] font-semibold" style={{ color: '#F3F4F6' }}>
                        <StepTitle title={info.title} color={accent} />
                    </span>
                    <span className="text-[15px] text-gray-200"> · {info.caption}</span>
                </motion.div>
                <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] p-1" role="tablist" aria-label="Passos da régua">
                    {STEPS.map((s, i) => {
                        const active = i === step;
                        return (
                            <button
                                key={s.tab} type="button" role="tab" aria-selected={active} onClick={() => setStep(i)}
                                className="relative cursor-pointer rounded-xl px-3 py-1.5 text-[14.5px] font-semibold transition-colors duration-180 ease-(--ease-out) focus-visible:outline-2 focus-visible:outline-offset-2 outline-[var(--act-color,#E11D48)]"
                                style={{ color: active ? '#fff' : '#D1D5DB' }}
                            >
                                {active && (
                                    <motion.span
                                        layoutId="margin-step" className="absolute inset-0 rounded-xl"
                                        style={{ background: `${STEP_COLORS[i]}22`, border: `1px solid ${STEP_COLORS[i]}99` }}
                                        transition={SPRING_TAB}
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

            <div ref={sceneRef} className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)]" style={{ height: SCENE_H }}>
                <Bridge step={step} reduced={reduced} onZone={setStep} width={sceneW} />
                <div className="absolute bottom-3 left-3 overflow-hidden rounded-xl border border-white/10" style={{ width: cardW, height: 142, background: 'rgba(5,5,16,0.88)' }}>
                    <ZoneCard step={step} />
                </div>
            </div>
        </div>
    );
}
