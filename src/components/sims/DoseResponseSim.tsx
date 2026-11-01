import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { DoseChart } from './dose/DoseChart';
import { CHART_W, sx } from './dose/geometry';
import { SidePanel } from './dose/SidePanel';
import { DOSE_MAX, DOSE_MIN } from './dose/model';

/**
 * "O Paradoxo da Dose" (slide id 8): curva dose-resposta da testosterona.
 * Passos: 0 eixos + fisiológico · 1 TRT · 2 supra · 3 abuso · 4 curva + derivada.
 */
const STEP_LABELS = [
    'Eixos · fisiológico',
    'TRT · 100 mg',
    'Suprafisiológico · 300 mg',
    'Abuso · 600 mg+',
    'Curva · retornos decrescentes',
];
const STEPS = STEP_LABELS.length;
const CURVE_STEP = 4;
const SWEEP_DELAY_MS = 1500;
const SWEEP_MS = 4200;
const RESTING_DOSE = 450;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Ao entrar no passo da curva, o cursor percorre 0 → 600 mg uma vez; arrastar interrompe. */
const useDoseSweep = (active: boolean) => {
    const reduce = useReducedMotion();
    const [dose, setDose] = useState(DOSE_MIN);
    const frame = useRef(0);
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const stop = useCallback(() => {
        cancelAnimationFrame(frame.current);
        clearTimeout(timer.current);
    }, []);

    useEffect(() => {
        if (!active) return undefined;
        if (reduce) {
            frame.current = requestAnimationFrame(() => setDose(RESTING_DOSE));
            return stop;
        }
        frame.current = requestAnimationFrame(() => setDose(DOSE_MIN));
        timer.current = setTimeout(() => {
            const start = performance.now();
            const tick = (now: number) => {
                const t = Math.min((now - start) / SWEEP_MS, 1);
                setDose(DOSE_MIN + (DOSE_MAX - DOSE_MIN) * easeInOut(t));
                if (t < 1) frame.current = requestAnimationFrame(tick);
            };
            frame.current = requestAnimationFrame(tick);
        }, SWEEP_DELAY_MS);
        return stop;
    }, [active, reduce, stop]);

    return { dose, setDose, stop };
};

export default function DoseResponseSim() {
    const { step } = useSlideSteps(STEPS);
    const showCurve = step >= CURVE_STEP;
    const { dose, setDose, stop } = useDoseSweep(showCurve);

    return (
        <div className="relative mx-auto flex w-full max-w-[1110px] flex-col font-body text-white" style={{ height: 520 }}>
            <div className="mb-1 flex items-center justify-between">
                <div className="font-mono text-[13px] uppercase tracking-[0.14em] text-zinc-400">
                    Curva dose-resposta da testosterona · massa magra
                </div>
                <div className="font-mono text-[13px] text-zinc-400">
                    <span className="text-zinc-200">{step + 1}/{STEPS}</span> · {STEP_LABELS[step]}
                </div>
            </div>

            <div className="flex flex-1 gap-5">
                <div className="flex flex-col" style={{ width: CHART_W }}>
                    <DoseChart step={step} dose={dose} onDose={setDose} onDragStart={stop} />
                    <DoseSlider visible={showCurve} dose={dose} onDose={setDose} onDragStart={stop} />
                </div>
                <div className="min-w-0 flex-1 pt-6">
                    <SidePanel step={step} dose={dose} />
                </div>
            </div>
        </div>
    );
}

/* ---------- Slider alinhado ao eixo x (sem foco: setas ficam com o passador) ---------- */

interface DoseSliderProps {
    visible: boolean;
    dose: number;
    onDose: (dose: number) => void;
    onDragStart: () => void;
}

const DoseSlider = ({ visible, dose, onDose, onDragStart }: DoseSliderProps) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const dragging = useRef(false);
    const left = sx(DOSE_MIN);
    const width = sx(DOSE_MAX) - left;
    const frac = (dose - DOSE_MIN) / (DOSE_MAX - DOSE_MIN);

    const toDose = (e: PointerEvent<HTMLDivElement>) => {
        const el = trackRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const f = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
        onDose(Math.round(DOSE_MIN + f * (DOSE_MAX - DOSE_MIN)));
    };

    return (
        <motion.div
            className="relative h-11"
            initial={false}
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{ duration: 0.4, delay: visible ? 1.2 : 0 }}
            style={{ pointerEvents: visible ? 'auto' : 'none' }}
        >
            <div
                ref={trackRef}
                className="absolute top-1/2 h-8 -translate-y-1/2 cursor-ew-resize"
                style={{ left, width, touchAction: 'none' }}
                onPointerDown={e => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); onDragStart(); toDose(e); }}
                onPointerMove={e => { if (dragging.current) toDose(e); }}
                onPointerUp={e => { dragging.current = false; e.currentTarget.releasePointerCapture(e.pointerId); }}
                onPointerCancel={() => { dragging.current = false; }}
            >
                <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-white/10" />
                <div className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
                    style={{ width: `${frac * 100}%`, background: 'linear-gradient(90deg,#A1A1AA,#60A5FA 20%,#F87171 55%,#E11D48)' }} />
                <div className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#050510] bg-white shadow-[0_0_16px_rgba(255,255,255,0.55)]"
                    style={{ left: `${frac * 100}%` }} />
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 font-mono text-[13px] text-zinc-400" style={{ left: left + width + 22 }}>
                arraste ↔
            </div>
        </motion.div>
    );
};
