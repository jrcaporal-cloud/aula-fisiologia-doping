import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { STEPS, STEP_COUNT } from './transfusion/content';
import type { Scenario } from './transfusion/model';
import { SidePanel } from './transfusion/SidePanel';
import { TimelineChart } from './transfusion/TimelineChart';

/**
 * Slide "Transfusão Autóloga Homóloga — O Calcanhar de Aquiles do ABP".
 * Passos: 0 altitude e coleta · 1 armazenamento a –80 °C · 2 reinfusão 12–24h antes
 * · 3 defesa do ABP (com 3 amostras basais + coleta oportuna) · 4 calcanhar de Aquiles (sem elas).
 */

const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

/** Cenário que cada passo mostra por padrão (o botão continua livre). */
const STEP_SCENARIO: Partial<Record<number, Scenario>> = { 3: 'completo', 4: 'falho' };

const SCENARIOS: readonly { id: Scenario; label: string; color: string }[] = [
    { id: 'completo', label: '3 basais + coleta oportuna', color: '#38BDF8' },
    { id: 'falho', label: 'histórico insuficiente', color: '#F59E0B' },
];

const TransfusionSim = () => {
    const { step, setStep } = useSlideSteps(STEP_COUNT);
    const [scenario, setScenario] = useState<Scenario>('completo');
    const [seenStep, setSeenStep] = useState(step);

    if (seenStep !== step) {
        setSeenStep(step);
        const preset = STEP_SCENARIO[step];
        if (preset) setScenario(preset);
    }

    const info = STEPS[step];
    const accent = step >= 3 ? (scenario === 'completo' ? '#38BDF8' : '#F59E0B') : info.color;

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: 516 }}>
            <div className="flex items-center justify-between gap-4 h-[46px] mb-2">
                <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0 flex-1 text-balance leading-tight">
                    <span className="font-display text-[17px] font-semibold" style={{ color: accent }}>{info.title}</span>
                    <span className="text-[15px] text-gray-200"> · {info.caption}</span>
                </motion.div>
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 p-1 shrink-0" style={CARD_BG} role="tablist" aria-label="Fases da transfusão">
                    {STEPS.map((s, i) => {
                        const active = i === step;
                        return (
                            <button key={s.tab} type="button" role="tab" aria-selected={active} onClick={() => setStep(i)}
                                className="relative px-2.5 py-1.5 rounded-xl text-[14.5px] font-semibold cursor-pointer transition-colors"
                                style={{ color: active ? '#fff' : '#D1D5DB' }}>
                                {active && (
                                    <motion.span layoutId="tf-step" className="absolute inset-0 rounded-xl"
                                        style={{ background: `${s.color}22`, border: `1px solid ${s.color}99` }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                                )}
                                <span className="relative flex items-center gap-1.5">
                                    <span className="font-mono text-[14px]" style={{ color: s.color }}>{i + 1}</span>
                                    {s.tab}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 360px', height: 462 }}>
                <div className="relative rounded-2xl border border-white/10 overflow-hidden px-2 py-1.5" style={CARD_BG}>
                    <TimelineChart step={step} scenario={scenario} />
                    {step >= 3 && (
                        <div className="absolute flex items-center gap-1 rounded-xl border border-white/10 p-1" role="radiogroup" aria-label="Coletas do ABP"
                            style={{ right: 12, top: 10, background: 'rgba(8,8,18,0.9)' }}>
                            <span className="px-2 text-[14px] font-mono uppercase tracking-wider text-gray-200">ABP</span>
                            {SCENARIOS.map(sc => {
                                const active = sc.id === scenario;
                                return (
                                    <button key={sc.id} type="button" role="radio" aria-checked={active} onClick={() => setScenario(sc.id)}
                                        className="relative px-2.5 py-1 rounded-lg text-[14.5px] font-semibold cursor-pointer transition-colors"
                                        style={{ color: active ? '#fff' : '#D1D5DB' }}>
                                        {active && (
                                            <motion.span layoutId="tf-scn" className="absolute inset-0 rounded-lg"
                                                style={{ background: `${sc.color}26`, border: `1px solid ${sc.color}99` }}
                                                transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                                        )}
                                        <span className="relative">{sc.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
                <SidePanel step={step} />
            </div>
        </div>
    );
};

export default TransfusionSim;
