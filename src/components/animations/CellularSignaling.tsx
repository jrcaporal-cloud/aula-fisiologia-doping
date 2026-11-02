import { useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { CellBase } from './receptorAR/CellBase';
import { STEP_COUNT } from './receptorAR/content';
import { GenomicLayer } from './receptorAR/GenomicLayer';
import { NonGenomicLayer } from './receptorAR/NonGenomicLayer';
import { VIEW_H, VIEW_W } from './receptorAR/shapes';
import { SidePanel } from './receptorAR/SidePanel';
import { TimeScale } from './receptorAR/TimeScale';
import {
    GENOMIC_FINAL,
    GENOMIC_TIMES,
    NONGENOMIC_FINAL,
    NONGENOMIC_TIMES,
    useReducedMotion,
    useSequence,
} from './receptorAR/useSequence';

/**
 * Slide "O Receptor Androgênico (AR)": corte de uma fibra muscular com as duas vias do EAA.
 * Passador: 0 = duas vias (repouso) · 1 = via genômica (lenta) · 2 = via não genômica (rápida) · 3 = lado a lado.
 * Clicar numa via no desenho leva ao passo dela.
 */
export const CellularSignaling = () => {
    const { step, setStep } = useSlideSteps(STEP_COUNT);
    const reduced = useReducedMotion();
    const [run, setRun] = useState(0);

    const gSeq = useSequence(step === 1 ? `g-${run}` : null, GENOMIC_TIMES, reduced);
    const nSeq = useSequence(step === 2 ? `n-${run}` : null, NONGENOMIC_TIMES, reduced);
    const gPhase = step === 3 ? GENOMIC_FINAL : gSeq;
    const nPhase = step === 3 ? NONGENOMIC_FINAL : nSeq;

    return (
        <div className="not-prose mt-1 flex w-full flex-col gap-2.5 font-body text-white">
            <div className="grid gap-3" style={{ gridTemplateColumns: `${VIEW_W}px minmax(0, 1fr)` }}>
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#050510]" style={{ height: VIEW_H }}>
                    <svg
                        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                        width={VIEW_W}
                        height={VIEW_H}
                        role="img"
                        aria-label="Corte de uma fibra muscular: via genômica e via não genômica do receptor androgênico"
                        className="block"
                    >
                        <CellBase />
                        <GenomicLayer
                            phase={gPhase}
                            reduced={reduced}
                            dim={step === 2}
                            showRoute={step === 0}
                            onSelect={() => setStep(1)}
                        />
                        <NonGenomicLayer
                            phase={nPhase}
                            reduced={reduced}
                            dim={step === 1}
                            showRoute={step === 0}
                            onSelect={() => setStep(2)}
                        />
                    </svg>
                </div>
                <div style={{ height: VIEW_H }}>
                    <SidePanel
                        step={step}
                        setStep={setStep}
                        gPhase={gPhase}
                        nPhase={nPhase}
                        run={run}
                        reduced={reduced}
                        onReplay={() => setRun(r => r + 1)}
                    />
                </div>
            </div>
            <TimeScale step={step} reduced={reduced} />
        </div>
    );
};
