import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { GapsView, KnownView } from './trans/GapsKnownViews';
import { GAP_STEP, KNOWN_STEP, SCIENCE_STEPS, STUDIES } from './trans/scienceData';
import { StepHeader, type StepChip } from './trans/StepHeader';
import { StudiesView } from './trans/StudiesView';

const CHIPS: readonly StepChip[] = [
    { label: 'Estudos comparados', to: 0, steps: STUDIES.map((_, i) => i) },
    { label: 'Diferença por modalidade', to: GAP_STEP, steps: [GAP_STEP] },
    { label: 'O que sabemos', to: KNOWN_STEP, steps: [KNOWN_STEP] },
];

/**
 * "O Abismo entre Ciência e Regulação".
 * Passos: 0–3 um estudo por vez (Hilton & Lundberg, Roberts, Harper, Handelsman) ·
 * 4 diferença por modalidade · 5 o que sabemos.
 */
export const TransScienceReview = () => {
    const { step, setStep } = useSlideSteps(SCIENCE_STEPS.length);
    const view = step < GAP_STEP ? 'studies' : step === GAP_STEP ? 'gaps' : 'known';
    return (
        <MotionConfig reducedMotion="user">
            <div className="not-prose w-full font-body text-white select-none flex flex-col gap-3" style={{ height: 510 }}>
                <StepHeader step={step} title={SCIENCE_STEPS[step]} chips={CHIPS} accent="#A855F7" layoutId="ts-chip" onStep={setStep} />
                <div className="flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                        <motion.div key={view} className="h-full"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                            {view === 'studies' && <StudiesView current={step} onPick={setStep} />}
                            {view === 'gaps' && <GapsView />}
                            {view === 'known' && <KnownView />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </MotionConfig>
    );
};
