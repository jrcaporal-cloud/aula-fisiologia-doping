import { AnimatePresence, motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { BASICS_STEPS } from './peptide/basics';
import { RouteScene } from './peptide/RouteScene';
import { SignalScene } from './peptide/SignalScene';
import { SizeScene } from './peptide/SizeScene';
import { PANEL_BG, Source, StepTabs } from './peptide/ui';
import { VialScene } from './peptide/VialScene';

/**
 * Slide "Peptídeos: o sinal que bate na porta" (abre o módulo de peptídeos do Ato II).
 * Passos: 0 tamanho em aminoácidos · 1 receptor de membrana × receptor nuclear · 2 por que é injetável · 3 o rótulo "pesquisa".
 */

const SCENES = [SizeScene, SignalScene, RouteScene, VialScene] as const;

const PeptideBasicsSim = () => {
    const { step, setStep } = useSlideSteps(BASICS_STEPS.length);
    const info = BASICS_STEPS[step];
    const Scene = SCENES[step];

    return (
        <div className="not-prose w-full font-body text-white select-none flex flex-col gap-2" style={{ height: 488 }}>
            <StepTabs labels={BASICS_STEPS.map(s => s.tab)} step={step} onSelect={setStep} layoutId="pep-basics-tab" />
            <div className="grid gap-3 flex-1 min-h-0" style={{ gridTemplateColumns: 'minmax(0,1fr) 380px' }}>
                <div className="relative rounded-2xl border border-white/10 min-h-0 overflow-hidden" style={PANEL_BG}>
                    <AnimatePresence mode="wait">
                        <motion.div key={step} className="absolute inset-0 p-3"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                            <Scene />
                        </motion.div>
                    </AnimatePresence>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div key={step} className="rounded-2xl border border-white/10 p-6 flex flex-col gap-4 min-h-0" style={PANEL_BG}
                        initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.3 }}>
                        <h3 className="font-display text-[1.6rem] leading-tight font-semibold text-white">{info.title}</h3>
                        {info.paragraphs.map(p => (
                            <p key={p} className="text-[1.08rem] leading-snug text-gray-100">{p}</p>
                        ))}
                        <div className="mt-auto pt-2 border-t border-white/10">
                            <Source>{info.source}</Source>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PeptideBasicsSim;
