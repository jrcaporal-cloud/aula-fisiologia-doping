import { motion } from 'framer-motion';
import { DUR, EASE_OUT } from '../../lib/motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { Compounds } from './sarms/Compounds';
import { STEPS } from './sarms/content';
import { Ledger } from './sarms/Ledger';
import { Opening } from './sarms/Opening';
import { HEADER_H, StepHeader } from './sarms/StepHeader';

/**
 * Slide "SARMs: A Zona Cinzenta Molecular" (parsedPresentation.json, id 18).
 * Passo 0: alerta 10–15% + "vendido como suplemento" · 1: seletividade músculo × próstata
 * · 2: a conta (fígado + eixo HPG) · 3: as três fichas de compostos.
 */

const ROOT_H = 490;
const BODY_H = ROOT_H - HEADER_H;

/** Passos 1 e 2 compartilham a mesma cena (a promessa recua quando a conta aparece). */
const sceneKey = (step: number) => (step === 0 ? 'opening' : step === 3 ? 'compounds' : 'ledger');

const SarmsSim = () => {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const key = sceneKey(step);

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: ROOT_H }}>
            <StepHeader steps={STEPS} step={step} onSelect={setStep} id="sarms" />
            <div className="relative" style={{ height: BODY_H }}>
                <motion.div key={key} className="absolute inset-0"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DUR.enter, ease: EASE_OUT }}>
                    {key === 'opening' && <Opening />}
                    {key === 'ledger' && <Ledger step={step} />}
                    {key === 'compounds' && <Compounds />}
                </motion.div>
            </div>
        </div>
    );
};

export default SarmsSim;
