import { AnimatePresence, useReducedMotion } from 'framer-motion';
import { DOPING_STEP, type Genotype } from './content';
import { VIEW_H, VIEW_W } from './geometry';
import { Molecules } from './Molecules';
import { Bladder, Fade, Intestine, Kidneys, Liver, OrganDefs, Syringe, Vessel } from './Organs';
import { Cup, Legend, Muscle, Stamp, TeGauge } from './Readouts';

interface SceneProps {
    readonly step: number;
    readonly genotype: Genotype;
}

/** Esquema anatômico: o caminho da testosterona do sangue até o frasco (ou até as fezes). */
export const Scene = ({ step, genotype }: SceneProps) => {
    const reduced = useReducedMotion() ?? false;
    const del = genotype === 'del';
    const doping = step >= DOPING_STEP;
    const testOn = step >= 2;

    return (
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-full block" role="img"
            aria-label="Esquema: testosterona no sangue, glucuronidação no fígado pela UGT2B17, rins, bexiga e frasco de coleta com a razão T/E">
            <OrganDefs />
            <Fade on={step >= 1 && del} dim={0.16}><Intestine highlight={del && step >= 1} /></Fade>
            <Fade on={step >= 1}><Liver deleted={del} /></Fade>
            <Fade on={testOn} dim={0.18}><Kidneys /></Fade>
            <Fade on={testOn} dim={0.18}><Bladder urine={testOn} /></Fade>
            <Fade on={doping} dim={0.2}><Muscle saturated={doping} /></Fade>
            <Fade on={testOn} dim={0.18}><Cup urine={testOn} positive={doping && !del} /></Fade>
            <Fade on={step >= 1} dim={0}><Legend /></Fade>
            <Vessel />
            <Syringe on={doping} />
            <Molecules step={step} genotype={genotype} reduced={reduced} />
            <TeGauge on={testOn} genotype={genotype} reading={doping} ghost={step >= 4} />
            <AnimatePresence mode="wait">
                {doping && <Stamp key={genotype} genotype={genotype} />}
            </AnimatePresence>
        </svg>
    );
};
