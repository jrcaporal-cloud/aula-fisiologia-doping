import { AnimatePresence, motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { AllFive } from './goldenfindings/AllFive';
import { ALL_STEP, FINDINGS, STEP_COUNT } from './goldenfindings/content';
import { FocusView } from './goldenfindings/FocusView';
import { slideRef, slidesPhrase } from './goldenfindings/slideRefs';
import { StepHeader, type HeaderStep } from './sarms/StepHeader';

/**
 * "Os 5 Achados de Ouro da Imersão" (parsedPresentation.json, id 25): a recapitulação da aula.
 * Passos 1–5: um achado por vez, com um desenho que ecoa o simulador onde o assunto foi visto
 * (dose → slide 10, stack → 15, transfusão → 21, SARMs → 22, UGT2B17 → 11) e o texto verbatim.
 * Passo 6: os cinco juntos.
 */

const HEADER_STEPS: readonly HeaderStep[] = [
    ...FINDINGS.map(f => ({
        label: f.tab,
        title: f.title,
        caption: slidesPhrase(f.sources.map(slideRef)),
        color: f.color,
    })),
    { label: 'Os cinco', title: 'Os cinco achados', caption: 'a aula em cinco ideias', color: '#E5E7EB' },
];

const GoldenFindingsSim = () => {
    const { step, setStep } = useSlideSteps(STEP_COUNT);
    const all = step === ALL_STEP;

    return (
        <div className="not-prose w-full select-none font-body text-white pointer-events-auto" style={{ height: 520 }}>
            <StepHeader steps={HEADER_STEPS} step={step} onSelect={setStep} id="golden" />
            <div className="relative" style={{ height: 470 }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={all ? 'all' : step}
                        className="absolute inset-0"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        {all ? <AllFive onOpen={setStep} /> : <FocusView finding={FINDINGS[step]} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default GoldenFindingsSim;
