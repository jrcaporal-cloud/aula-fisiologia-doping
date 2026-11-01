import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { BloodScene } from './hematocrit/BloodScene';
import { Hud } from './hematocrit/Hud';
import { createLiveStore } from './hematocrit/liveStore';
import { HCT_EPO_DEMO, HCT_MAX, HCT_MIN, HCT_NORMAL, SLEEP_HR, classify } from './hematocrit/model';

const STEPS = [
    { label: 'Fisiologia normal · hematócrito ~45%', hct: HCT_NORMAL, sleep: false },
    { label: 'rhEPO abusiva · hematócrito >55–60%', hct: HCT_EPO_DEMO, sleep: false },
    { label: `Sono · FC ~${SLEEP_HR} bpm`, hct: HCT_EPO_DEMO, sleep: true },
] as const;

const TWEEN_MS = 2200;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const prefersReducedMotion = () =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * "O Hematócrito que Mata": vaso em corte com hemácias em fluxo laminar.
 * Passo 0 = 45% · passo 1 = rhEPO, hematócrito sobe até 58% · passo 2 = sono com FC ~30 bpm → microtrombo.
 */
export default function HematocritSim() {
    const { step } = useSlideSteps(STEPS.length);
    const [hct, setHct] = useState<number>(HCT_NORMAL);
    const [sleep, setSleep] = useState(false);
    const [alert, setAlert] = useState(false);
    const live = useMemo(() => createLiveStore(), []);
    const hctRef = useRef(hct);
    const tweenRef = useRef(0);

    useEffect(() => {
        hctRef.current = hct;
    }, [hct]);

    const stopTween = useCallback(() => cancelAnimationFrame(tweenRef.current), []);

    // Cada passo leva o hematócrito ao valor da aula com uma transição suave.
    useEffect(() => {
        const plan = STEPS[step];
        const from = hctRef.current;
        const to = plan.sleep ? Math.max(from, plan.hct) : plan.hct;
        const duration = prefersReducedMotion() ? 0 : TWEEN_MS * Math.min(Math.abs(to - from) / 13, 1);
        const start = performance.now();
        const tick = (now: number) => {
            const t = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
            setSleep(plan.sleep);
            setHct(from + (to - from) * easeInOut(t));
            if (t < 1) tweenRef.current = requestAnimationFrame(tick);
        };
        tweenRef.current = requestAnimationFrame(tick);
        return stopTween;
    }, [step, stopTween]);

    const onHct = useCallback((v: number) => {
        stopTween();
        setHct(Math.min(Math.max(v, HCT_MIN), HCT_MAX));
    }, [stopTween]);

    const state = classify(hct, sleep);

    return (
        <div className="relative flex w-full gap-4" style={{ height: 540 }}>
            <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#050510]">
                <BloodScene hct={hct} sleep={sleep} alert={alert} live={live} onAlertChange={setAlert} />

                <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2.5">
                    <div className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[rgba(8,8,18,0.72)] px-3.5 py-2 backdrop-blur-md">
                        <span className="font-mono text-[12px] text-gray-400">{step + 1}/{STEPS.length}</span>
                        <AnimatePresence mode="wait">
                            <motion.span key={step} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="font-body text-[14px] font-bold text-white">
                                {STEPS[step].label}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                    <span className="rounded-md border border-amber-400/50 bg-[rgba(8,8,18,0.72)] px-2.5 py-1 font-mono text-[12px] text-amber-200">modelo ilustrativo</span>
                </div>

                <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-4 rounded-xl border border-white/10 bg-[rgba(8,8,18,0.72)] px-3.5 py-2 font-body text-[13px] text-gray-100 backdrop-blur-md">
                    <span className="flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.14em] text-sky-200">
                        fluxo <ArrowRight size={14} />
                    </span>
                    <Legend color="#e11d48" label="Hemácia" />
                    <AnimatePresence>
                        {alert && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-4">
                                <Legend color="#fde4c4" label="Plaqueta" />
                                <Legend color="#fcd34d" label="Fibrina" line />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <AnimatePresence>
                    {alert && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="pointer-events-none absolute bottom-4 right-4 rounded-xl border border-brand-red/70 bg-[rgba(40,4,14,0.85)] px-4 py-2 shadow-[0_0_30px_-4px_rgba(225,29,72,0.7)]"
                        >
                            <span className="font-display text-[16px] font-semibold uppercase tracking-wide text-rose-100">Microtrombose</span>
                            <span className="ml-2 font-body text-[14px] text-gray-100">→ infarto agudo</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Hud hct={hct} onHct={onHct} sleep={sleep} onToggleSleep={() => setSleep(s => !s)} state={state} alert={alert} live={live} />
        </div>
    );
}

const Legend = ({ color, label, line }: { color: string; label: string; line?: boolean }) => (
    <span className="flex items-center gap-1.5">
        <span className={line ? 'h-0.5 w-4 rounded-full' : 'h-2.5 w-3.5 rounded-full'} style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
        {label}
    </span>
);
