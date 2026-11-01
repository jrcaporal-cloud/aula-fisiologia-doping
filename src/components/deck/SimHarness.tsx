import { lazy, Suspense, useEffect, type ComponentType } from 'react';
import { FitStage } from './FitStage';
import { useSlideStepStore } from '../../store/useSlideSteps';

type SimModule = { default: ComponentType };
const SIMS = import.meta.glob<SimModule>('../sims/*.tsx');

// A bancada mostra um único simulador por carregamento de página (vem da URL).
const requested = new URLSearchParams(window.location.search).get('sim') ?? '';
const requestedLoader = SIMS[`../sims/${requested}.tsx`];
const Sim = requestedLoader ? lazy(requestedLoader) : null;

/**
 * Bancada de teste: `?sim=NomeDoArquivo` renderiza só aquele simulador,
 * no mesmo palco escalado da aula, com ←/→ percorrendo os passos.
 */
export const SimHarness = ({ name }: { name: string }) => {
    const step = useSlideStepStore(s => s.step);
    const count = useSlideStepStore(s => s.count);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const { step: current, count: total, setStep } = useSlideStepStore.getState();
            if (['ArrowRight', 'PageDown', ' '].includes(e.key) && current < total - 1) setStep(current + 1);
            if (['ArrowLeft', 'PageUp'].includes(e.key) && current > 0) setStep(current - 1);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    if (!Sim) {
        return (
            <div className="p-10 text-white font-mono text-sm">
                Simulador “{name}” não encontrado. Disponíveis: {Object.keys(SIMS).map(k => k.replace('../sims/', '').replace('.tsx', '')).join(', ')}
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-10">
            <FitStage>
                <div className="px-8 py-4">
                    <Suspense fallback={null}><Sim /></Suspense>
                </div>
            </FitStage>
            <div data-testid="sim-step" className="absolute bottom-4 right-4 font-mono text-xs text-gray-400">
                passo {step + 1}/{count}
            </div>
        </div>
    );
};
