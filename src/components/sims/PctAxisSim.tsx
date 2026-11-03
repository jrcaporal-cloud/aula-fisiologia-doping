import { useSlideSteps } from '../../store/useSlideSteps';
import { AxisDiagram } from './pctaxis/AxisDiagram';
import { STEPS } from './pctaxis/content';
import { SidePanel } from './pctaxis/SidePanel';
import { HEADER_H, StepHeader } from './sarms/StepHeader';

/**
 * Slide "TPC e Moduladores Hormonais" (parsedPresentation.json, id 20).
 * Passo 0: eixo HPG suprimido após o ciclo · 1: SERMs no receptor de estrogênio (hipotálamo/hipófise)
 * · 2: IA bloqueia a aromatase (E2 cai até 98%) · 3: hCG no LHR das células de Leydig + rhFSH · 4: mapa.
 */

const CARD_BG = { background: 'rgba(8,8,18,0.72)' };
const ROOT_H = 476;
const BODY_H = ROOT_H - HEADER_H;

const PctAxisSim = () => {
    const { step, setStep } = useSlideSteps(STEPS.length);
    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: ROOT_H }}>
            <StepHeader steps={STEPS} step={step} onSelect={setStep} id="pct" />
            <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 410px', gridTemplateRows: 'minmax(0,1fr)', height: BODY_H }}>
                <div className="rounded-2xl border border-white/10 px-3 pt-2.5 pb-2 flex flex-col min-h-0" style={CARD_BG}>
                    <div className="flex items-center justify-between px-1">
                        <span className="font-display text-[17px] font-semibold text-white">Eixo hipotálamo–hipófise–testículo</span>
                        <span className="text-[14px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                            esquema
                        </span>
                    </div>
                    <div className="flex-1 min-h-0 relative mt-1"><AxisDiagram step={step} /></div>
                </div>
                <SidePanel step={step} />
            </div>
        </div>
    );
};

export default PctAxisSim;
