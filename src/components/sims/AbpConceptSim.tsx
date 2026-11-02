import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { STEPS, STEP_COUNT } from './abpconcept/content';
import { InstrumentPanels } from './abpconcept/InstrumentPanels';
import { NeedleHaystack } from './abpconcept/NeedleHaystack';
import { PopVsIndividual } from './abpconcept/PopVsIndividual';
import { TextPanel } from './abpconcept/TextPanel';

/**
 * Slide "Passaporte Biológico (ABP) — Análise Forense Longitudinal": o conceito.
 * Passos: 0 agulha × palheiro · 1 população × indivíduo · 2 módulo hematológico · 3 módulo esteroide.
 * (A série longitudinal detalhada fica no PassportSim, mais adiante na aula.)
 */

const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const AbpConceptSim = () => {
    const { step, setStep } = useSlideSteps(STEP_COUNT);
    const [deletion, setDeletion] = useState(false);
    const [replay, setReplay] = useState(0);
    const info = STEPS[step];
    const visualKey = step <= 1 ? `v${step}-${replay}` : 'panels';

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: 540 }}>
            {/* Cabeçalho do passo + atalhos */}
            <div className="flex items-center justify-between gap-4 h-[40px] mb-2.5">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 font-mono text-[12px] tracking-widest uppercase px-2 py-1 rounded-md border border-white/15 text-gray-200">
                        Passo {step + 1}/{STEP_COUNT}
                    </span>
                    <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0 truncate">
                        <span className="font-display text-[16px] font-semibold" style={{ color: info.color }}>{info.title}</span>
                        <span className="text-[14px] text-gray-200"> · {info.caption}</span>
                    </motion.div>
                </div>
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 p-1 shrink-0" style={CARD_BG} role="tablist" aria-label="Partes do passaporte">
                    {STEPS.map((s, i) => {
                        const active = i === step;
                        return (
                            <button key={s.tab} type="button" role="tab" aria-selected={active} onClick={() => setStep(i)}
                                className="relative px-3 py-1.5 rounded-xl text-[13.5px] font-semibold cursor-pointer transition-colors"
                                style={{ color: active ? '#fff' : '#D1D5DB' }}>
                                {active && (
                                    <motion.span layoutId="abp-step" className="absolute inset-0 rounded-xl"
                                        style={{ background: `${s.color}22`, border: `1px solid ${s.color}99` }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                                )}
                                <span className="relative flex items-center gap-1.5">
                                    <span className="font-mono text-[12px]" style={{ color: s.color }}>{i + 1}</span>
                                    {s.tab}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 336px', height: 488 }}>
                <div className="relative rounded-2xl border border-white/10 overflow-hidden px-2 py-1.5" style={CARD_BG}>
                    <AnimatePresence mode="wait">
                        <motion.div key={visualKey} className="w-full h-full"
                            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                            {step === 0 && <NeedleHaystack />}
                            {step === 1 && <PopVsIndividual />}
                            {step >= 2 && <InstrumentPanels step={step} deletion={deletion} onSelect={setStep} onToggleDeletion={() => setDeletion(v => !v)} />}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <TextPanel step={step} onReplay={step <= 1 ? () => setReplay(r => r + 1) : undefined} />
            </div>
        </div>
    );
};

export default AbpConceptSim;
