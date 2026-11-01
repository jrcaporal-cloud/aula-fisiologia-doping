import { useCallback, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { InsulinScene } from './insulin/Scene';
import { DoseControl, Meters, StepCard } from './insulin/Panels';
import { DOSE_COMA, HYPO_THRESHOLD, STEP_COUNT, STEP_DOSE } from './insulin/model';
import type { Telemetry } from './insulin/engine';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const subscribeReduced = (cb: () => void) => {
    const mq = window.matchMedia(REDUCED_QUERY);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
};
const getReduced = () => window.matchMedia(REDUCED_QUERY).matches;

const INITIAL_TELEMETRY: Telemetry = { glucose: 1, glycogen: 0.18, bound: 0, open: 0 };

/** Ícones da legenda, no mesmo código de cor da cena. */
const LEGEND = [
    { label: 'Glicose', color: '#34d399', shape: 'hex' },
    { label: 'Insulina', color: '#FBBF24', shape: 'gem' },
    { label: 'GLUT4', color: '#60A5FA', shape: 'ring' },
    { label: 'Glicogênio', color: '#6ee7b7', shape: 'dots' },
] as const;

const LegendIcon = ({ shape, color }: { shape: (typeof LEGEND)[number]['shape']; color: string }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        {shape === 'hex' && <polygon points="8,2 13,5 13,11 8,14 3,11 3,5" fill="none" stroke={color} strokeWidth="2.4" />}
        {shape === 'gem' && <polygon points="8,1.5 14,6 11.5,14 4.5,14 2,6" fill={color} />}
        {shape === 'ring' && <circle cx="8" cy="8" r="5.2" fill={`${color}33`} stroke={color} strokeWidth="2" />}
        {shape === 'dots' && (
            <g fill={color}>
                <circle cx="8" cy="8" r="2.4" />
                <circle cx="3.6" cy="6" r="2" />
                <circle cx="12.4" cy="6" r="2" />
                <circle cx="5.5" cy="12.3" r="2" />
                <circle cx="10.5" cy="12.3" r="2" />
            </g>
        )}
    </svg>
);

interface DoseOverride {
    step: number;
    dose: number;
}

/**
 * Corte 3D de membrana de fibra muscular: insulina → receptor IR-α/β → PI3K → Akt →
 * translocação do GLUT4 → glicose entra e vira glicogênio. O controle de dose leva até a
 * faixa ~15+ UI da régua "A Margem que Mata", quando a glicose do sangue despenca.
 */
export default function InsulinGlut4Sim() {
    const { step, setStep } = useSlideSteps(STEP_COUNT);
    const reduced = useSyncExternalStore(subscribeReduced, getReduced, () => false);
    const [override, setOverride] = useState<DoseOverride | null>(null);
    const [telemetry, setTelemetry] = useState<Telemetry>(INITIAL_TELEMETRY);

    // O passador aplica a dose de cada passo; o controle manual vale enquanto o passo não muda.
    const dose = override && override.step === step ? override.dose : STEP_DOSE[step];

    const onDose = useCallback(
        (d: number) => {
            let target = step;
            if (d >= DOSE_COMA) target = 3;
            else if (step === 3) target = 2;
            else if (step === 0 && d > 0) target = 2;
            setOverride({ step: target, dose: d });
            if (target !== step) setStep(target);
        },
        [step, setStep]
    );

    const onTelemetry = useCallback((t: Telemetry) => {
        setTelemetry(prev =>
            Math.abs(prev.glucose - t.glucose) < 0.003 &&
            Math.abs(prev.glycogen - t.glycogen) < 0.003 &&
            prev.bound === t.bound &&
            prev.open === t.open
                ? prev
                : t
        );
    }, []);

    const hypo = telemetry.glucose < HYPO_THRESHOLD;

    return (
        <div className="relative flex w-full flex-col gap-3 font-body text-white" style={{ height: 548 }}>
            <div className="flex min-h-0 flex-1 gap-3">
                <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#050510]">
                    <InsulinScene step={step} dose={dose} reduced={reduced} telemetry={telemetry} onTelemetry={onTelemetry} />

                    <div className="pointer-events-none absolute left-4 top-3 font-mono text-[13px] uppercase tracking-[0.16em] text-rose-200">
                        Sangue · interstício
                    </div>
                    <div className="pointer-events-none absolute bottom-3 left-4 font-mono text-[13px] uppercase tracking-[0.16em] text-sky-200">
                        Citoplasma · fibra muscular
                    </div>
                    <div className="pointer-events-none absolute bottom-3 right-3 flex gap-3 rounded-lg border border-white/10 bg-[rgba(5,5,16,0.78)] px-3 py-1.5">
                        {LEGEND.map(l => (
                            <span key={l.label} className="flex items-center gap-1.5 font-mono text-[13px] text-gray-100">
                                <LegendIcon shape={l.shape} color={l.color} />
                                {l.label}
                            </span>
                        ))}
                    </div>

                    <AnimatePresence>
                        {hypo && (
                            <motion.div
                                key="alert"
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                className="pointer-events-none absolute left-4 top-10 rounded-xl border border-brand-red bg-[rgba(40,4,14,0.9)] px-4 py-2 text-center shadow-[0_0_30px_rgba(225,29,72,0.45)]"
                            >
                                <div className="font-display text-[20px] font-bold uppercase tracking-wide text-rose-100">⚠ Hipoglicemia</div>
                                <div className="font-body text-[14px] text-rose-100">O cérebro desliga por falta de glicose</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex w-[330px] flex-none flex-col gap-3">
                    <StepCard step={step} />
                    <Meters glucose={telemetry.glucose} glycogen={telemetry.glycogen} />
                </div>
            </div>

            <DoseControl dose={dose} onDose={onDose} />

            <AnimatePresence>
                {hypo && (
                    <motion.div
                        key="pulse"
                        aria-hidden
                        className="pointer-events-none absolute -inset-1 rounded-[20px] border-2 border-brand-red"
                        style={{ boxShadow: 'inset 0 0 90px rgba(225,29,72,0.55), 0 0 40px rgba(225,29,72,0.35)' }}
                        initial={{ opacity: 0 }}
                        animate={reduced ? { opacity: 0.8 } : { opacity: [0.3, 1, 0.3] }}
                        exit={{ opacity: 0 }}
                        transition={reduced ? { duration: 0.3 } : { duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
