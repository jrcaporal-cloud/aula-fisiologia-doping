import { AnimatePresence, motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { C, STEPS, TEXTS } from './beta2kinetics/content';
import { DetectionScene } from './beta2kinetics/DetectionScene';
import { CURSOR_PRESET, formatHours, hoursFromU } from './beta2kinetics/scales';
import { CasesPanel, HalfLifeBars, RiskPanel, TextCard, UrinePanel } from './beta2kinetics/SidePanels';
import { Timeline } from './beta2kinetics/Timeline';
import { HEADER_H, StepHeader } from './sarms/StepHeader';

/**
 * Slide "A Máquina Metabólica: Beta-2 Detalhado" (parsedPresentation.json, id 191).
 * Farmacocinética e detecção, um agente por passo:
 * 0 Clembuterol (t½ ~35 h, taquifilaxia 14-21 dias) · 1 Salbutamol (t½ ~4 a 6 h) · 2 Salbutamol TUE / Froome
 * · 3 Cardarine, o falso beta-2 · 4 janelas e detecção analítica (MRPL 0,2 ng/mL; < 5 ng/mL).
 */

const CARD = 'rounded-2xl border border-white/10';
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };
const ROOT_H = 476;
const BODY_H = ROOT_H - HEADER_H;

/** Tamanho do texto do cartão: maior onde há folga (passo 1 tem pouco texto). */
const TEXT_SIZE: Readonly<Record<number, number>> = { 0: 15.5, 1: 18, 2: 15.5, 4: 17 };

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
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: ROOT_H }}>
            <StepHeader steps={STEPS} step={step} onSelect={setStep} id="b2k" />
            <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 424px', gridTemplateRows: 'minmax(0,1fr)', height: BODY_H }}>
                <div className={`${CARD} h-full min-h-0 px-3 pt-2.5 pb-2.5 flex flex-col`} style={CARD_BG}>
                    <Fade id={scene} className="h-full min-h-0 flex flex-col">
                        {scene === 'timeline' ? (
                            <>
                                <div className="flex items-center justify-between px-1">
                                    <span className="font-display text-[17px] font-semibold text-white">Quanto resta após uma dose</span>
                                    <span className="text-[14px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                                        modelo ilustrativo
                                    </span>
                                </div>
                                <div className="flex-1 min-h-0 relative mt-1"><Timeline step={step} cursorU={cursorU} /></div>
                                <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                                    <span className="font-mono text-[14px] uppercase tracking-wider text-gray-200 shrink-0">tempo</span>
                                    <input type="range" min={0} max={1} step={0.002} value={cursorU} onChange={e => setCursorU(Number(e.target.value))}
                                        aria-label="Tempo após a dose (escala logarítmica)" className="flex-1 cursor-pointer" style={{ accentColor: C.clen }} />
                                    <span className="font-mono text-[16px] font-bold text-white shrink-0 text-right" style={{ width: 90 }}>{formatHours(hoursFromU(cursorU))}</span>
                                </div>
                            </>
                        ) : (
                            <DetectionScene />
                        )}
                    </Fade>
                </div>
                <div className="flex flex-col gap-3 min-h-0">
                    <TextCard text={TEXTS[step]} grow={step === 4} size={TEXT_SIZE[step]} />
                    {step < 4 && (
                        <Fade id={`panel-${step}`} className="flex-1 min-h-0 flex flex-col">
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
