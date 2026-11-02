import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { C, STEPS, TEXTS } from './beta2kinetics/content';
import { DetectionScene } from './beta2kinetics/DetectionScene';
import { CURSOR_PRESET, formatHours, hoursFromU } from './beta2kinetics/scales';
import { CasesPanel, HalfLifeBars, RiskPanel, TextCard, UrinePanel } from './beta2kinetics/SidePanels';
import { Timeline } from './beta2kinetics/Timeline';
import { StepHeader } from './sarms/StepHeader';

/**
 * Slide "A Máquina Metabólica: Beta-2 Detalhado" (parsedPresentation.json, id 191).
 * Farmacocinética e detecção, um agente por passo:
 * 0 Clembuterol (t½ ~35 h, taquifilaxia 14-21 dias) · 1 Salbutamol (t½ ~4 a 6 h) · 2 Salbutamol TUE / Froome
 * · 3 Cardarine, o falso beta-2 · 4 janelas e detecção analítica (MRPL 0,2 ng/mL; < 5 ng/mL).
 */

const CARD = 'rounded-2xl border border-white/10';
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };
const BODY_H = 470;

const Fade = ({ id, children, className }: { id: string; children: ReactNode; className?: string }) => (
    <AnimatePresence mode="wait">
        <motion.div key={id} className={className}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: 'easeOut' }}>
            {children}
        </motion.div>
    </AnimatePresence>
);

const Beta2KineticsSim = () => {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const [cursorU, setCursorU] = useState(CURSOR_PRESET[0]);
    const [seenStep, setSeenStep] = useState(step);

    // Ao trocar de passo, o cursor de tempo vai para o ponto que o passo explica.
    if (seenStep !== step) {
        setSeenStep(step);
        const preset = CURSOR_PRESET[step];
        if (preset !== undefined) setCursorU(preset);
    }

    const scene = step === 4 ? 'detect' : 'timeline';

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: 520 }}>
            <StepHeader steps={STEPS} step={step} onSelect={setStep} id="b2k" />
            <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 384px', gridTemplateRows: 'minmax(0,1fr)', height: BODY_H }}>
                <div className={`${CARD} h-full min-h-0 px-3 pt-2.5 pb-2.5 flex flex-col`} style={CARD_BG}>
                    <Fade id={scene} className="h-full min-h-0 flex flex-col">
                        {scene === 'timeline' ? (
                            <>
                                <div className="flex items-center justify-between px-1">
                                    <span className="font-display text-[16px] font-semibold text-white">Quanto resta após uma dose</span>
                                    <span className="text-[12px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                                        modelo ilustrativo
                                    </span>
                                </div>
                                <div className="flex-1 min-h-0 relative mt-1"><Timeline step={step} cursorU={cursorU} /></div>
                                <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                                    <span className="font-mono text-[12px] uppercase tracking-widest text-gray-300 shrink-0">tempo</span>
                                    <input type="range" min={0} max={1} step={0.002} value={cursorU} onChange={e => setCursorU(Number(e.target.value))}
                                        aria-label="Tempo após a dose (escala logarítmica)" className="flex-1 cursor-pointer" style={{ accentColor: C.clen }} />
                                    <span className="font-mono text-[14px] font-bold text-white shrink-0 text-right" style={{ width: 70 }}>{formatHours(hoursFromU(cursorU))}</span>
                                </div>
                            </>
                        ) : (
                            <DetectionScene />
                        )}
                    </Fade>
                </div>
                <div className="flex flex-col gap-3 min-h-0">
                    <TextCard text={TEXTS[step]} grow={step === 4} />
                    {step < 4 && (
                        <Fade id={`panel-${step}`} className={step === 2 ? 'flex-1 min-h-0 flex flex-col' : 'flex flex-col gap-3'}>
                            {step === 0 && <CasesPanel />}
                            {step === 1 && <HalfLifeBars />}
                            {step === 2 && <UrinePanel />}
                            {step === 3 && <RiskPanel />}
                        </Fade>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Beta2KineticsSim;
