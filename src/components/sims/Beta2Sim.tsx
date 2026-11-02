import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { Cascade } from './beta2/Cascade';
import { ClenbuterolScene, HalfLifeChart } from './beta2/Clenbuterol';
import { STEPS, TEXTS } from './beta2/content';
import { CarcinogenBox, Gw1516Scene } from './beta2/Gw1516';
import { DosePanel, TextCard } from './beta2/SidePanel';
import { TissueScene } from './beta2/TissueScene';
import { StepHeader } from './sarms/StepHeader';

/**
 * Slide "Beta-2 Agonistas: A Zona Cinzenta Clínica" (parsedPresentation.json, id 19).
 * Passo 0: dois tecidos, um receptor · 1: dose inalatória (asma) · 2: dose sistêmica (zona cinzenta)
 * · 3: clembuterol e taquifilaxia · 4: GW1516 à parte (PPARδ, não β2).
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

const Beta2Sim = () => {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const scene = step <= 2 ? 'tissue' : step === 3 ? 'clen' : 'gw';

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: 520 }}>
            <StepHeader steps={STEPS} step={step} onSelect={setStep} id="beta2" />
            <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 400px', gridTemplateRows: 'minmax(0,1fr)', height: BODY_H }}>
                <Fade id={scene} className="h-full min-h-0">
                    {scene === 'tissue' && (
                        <div className="flex flex-col gap-3 h-full">
                            <div className={`${CARD} flex-1 min-h-0 relative p-2`} style={CARD_BG}>
                                <div className="absolute" style={{ inset: 8 }}><TissueScene step={step} /></div>
                            </div>
                            <div className={`${CARD} shrink-0 px-3 pt-2 pb-1`} style={{ ...CARD_BG, height: 178 }}>
                                <div className="font-mono text-[12px] uppercase tracking-widest text-gray-300">Via PKA/cAMP</div>
                                <div className="relative" style={{ height: 146 }}><Cascade step={step} /></div>
                            </div>
                        </div>
                    )}
                    {scene === 'clen' && (
                        <div className={`${CARD} h-full p-3`} style={CARD_BG}><ClenbuterolScene active /></div>
                    )}
                    {scene === 'gw' && (
                        <div className={`${CARD} h-full p-3`} style={CARD_BG}><Gw1516Scene /></div>
                    )}
                </Fade>
                <div className="flex flex-col gap-3 min-h-0">
                    <TextCard text={TEXTS[step]} />
                    <Fade id={scene} className="flex flex-col gap-3">
                        {scene === 'tissue' && <DosePanel step={step} onStep={setStep} />}
                        {scene === 'clen' && <HalfLifeChart />}
                        {scene === 'gw' && <CarcinogenBox />}
                    </Fade>
                </div>
            </div>
        </div>
    );
};

export default Beta2Sim;
