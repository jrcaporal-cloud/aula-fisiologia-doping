import { motion } from 'framer-motion';
import { Syringe as SyringeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { AxisDiagram } from './ghaxis/AxisDiagram';
import { LEVELS, STEPS } from './ghaxis/content';
import { LevelPanel } from './ghaxis/LevelPanel';
import { MiniChart } from './ghaxis/MiniChart';

/**
 * Slide "Eixo GH-IGF-1 — os pontos de hackeamento fisiológico".
 * Passo 0: eixo natural pulsando · 1: hipotálamo/GHRP · 2: hipófise/rhGH (23h → 6h)
 * · 3: IGF-1 exógeno em bypass (com insulina → hipoglicemia).
 */

const CARD_BG = { background: 'rgba(8,8,18,0.72)' };
const INSULIN_DELAY_MS = 2600;

const CHART_TITLES = [
    'GH pulsátil × IGF-1 estável',
    'GH após o secretagogo (GHRP)',
    'GH plasmático após injeção SC às 23h',
    'IGF-1 exógeno: livre × ligado à IGFBP-3',
] as const;


const GhAxisSim = () => {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const [synergy, setSynergy] = useState(false);
    const [autoInsulin, setAutoInsulin] = useState(false);
    const [insulinChoice, setInsulinChoice] = useState<boolean | null>(null);

    // No passo 3, a insulina entra sozinha depois do bypass; ao sair do passo, tudo volta ao padrão.
    useEffect(() => {
        if (step !== 3) return undefined;
        const id = window.setTimeout(() => setAutoInsulin(true), INSULIN_DELAY_MS);
        return () => {
            window.clearTimeout(id);
            setAutoInsulin(false);
            setInsulinChoice(null);
        };
    }, [step]);

    const insulin = step === 3 && (insulinChoice ?? autoInsulin);
    const info = STEPS[step];
    const accent = step === 0 ? '#fff' : LEVELS[step - 1].color;

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: 540 }}>
            {/* Cabeçalho do passo + atalhos */}
            <div className="flex items-center justify-between gap-4 h-[40px] mb-2.5">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 font-mono text-[12px] tracking-widest uppercase px-2 py-1 rounded-md border border-white/15 text-gray-200">
                        Passo {step + 1}/{STEPS.length}
                    </span>
                    <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0 truncate">
                        <span className="font-display text-[16px] font-semibold" style={{ color: accent }}>{info.title}</span>
                        <span className="text-[14px] text-gray-200"> · {info.caption}</span>
                    </motion.div>
                </div>
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 p-1 shrink-0" style={CARD_BG} role="tablist" aria-label="Nível do eixo">
                    {STEPS.map((s, i) => {
                        const active = i === step;
                        const color = i === 0 ? '#E5E7EB' : LEVELS[i - 1].color;
                        return (
                            <button key={s.label} type="button" role="tab" aria-selected={active} onClick={() => setStep(i)}
                                className="relative px-3 py-1.5 rounded-xl text-[13.5px] font-semibold cursor-pointer transition-colors"
                                style={{ color: active ? '#fff' : '#D1D5DB' }}>
                                {active && (
                                    <motion.span layoutId="gh-step" className="absolute inset-0 rounded-xl"
                                        style={{ background: `${color}22`, border: `1px solid ${color}99` }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                                )}
                                <span className="relative flex items-center gap-1.5">
                                    {i > 0 && <span className="font-mono text-[12px]" style={{ color }}>{i}</span>}
                                    {s.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: '430px minmax(0,1fr)', height: 488 }}>
                {/* Eixo desenhado */}
                <div className="relative rounded-2xl border border-white/10 overflow-hidden" style={CARD_BG}>
                    <AxisDiagram step={step} insulin={insulin} onSelect={setStep} />
                    {step === 3 && (
                        <button type="button" onClick={() => setInsulinChoice(!insulin)} aria-pressed={insulin}
                            className="absolute right-3 bottom-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-semibold cursor-pointer border transition-colors"
                            style={insulin
                                ? { background: 'rgba(34,211,238,0.16)', borderColor: 'rgba(34,211,238,0.7)', color: '#CFFAFE' }
                                : { background: 'rgba(8,8,18,0.8)', borderColor: 'rgba(255,255,255,0.18)', color: '#E5E7EB' }}>
                            <SyringeIcon size={14} /> {insulin ? 'com insulina' : '+ insulina'}
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-3 min-w-0">
                    <div className="flex-1 min-h-0"><LevelPanel step={step} /></div>

                    {/* Mini-gráfico do passo */}
                    <div className="rounded-2xl border border-white/10 px-3.5 pt-2.5 pb-1.5 shrink-0" style={CARD_BG}>
                        <div className="flex items-center justify-between gap-3 mb-0.5">
                            <span className="font-display text-[14.5px] font-semibold text-white truncate">{CHART_TITLES[step]}</span>
                            <div className="flex items-center gap-2 shrink-0">
                                {step === 1 && (
                                    <button type="button" onClick={() => setSynergy(v => !v)} aria-pressed={synergy}
                                        className="px-2.5 py-1 rounded-lg text-[12.5px] font-semibold cursor-pointer border transition-colors"
                                        style={synergy
                                            ? { background: 'rgba(245,158,11,0.16)', borderColor: 'rgba(245,158,11,0.7)', color: '#FDE68A' }
                                            : { background: 'transparent', borderColor: 'rgba(255,255,255,0.18)', color: '#E5E7EB' }}>
                                        + GHRH (CJC-1295)
                                    </button>
                                )}
                                <span className="text-[12px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                                    modelo ilustrativo
                                </span>
                            </div>
                        </div>
                        <MiniChart step={step} synergy={synergy} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GhAxisSim;
