import { useEffect, useState, useSyncExternalStore } from 'react';

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
const subscribeReduced = (cb: () => void) => {
    const mq = window.matchMedia(REDUCED_QUERY);
    mq.addEventListener('change', cb);
    return () => mq.removeEventListener('change', cb);
};
const getReduced = () => window.matchMedia(REDUCED_QUERY).matches;

export const useReducedMotion = (): boolean => useSyncExternalStore(subscribeReduced, getReduced, () => false);

/** Início (ms) de cada fase da via genômica: entrada → ligação/HSP → dímero → núcleo/ARE → SRC-1 → mRNA → proteínas. */
export const GENOMIC_TIMES = [0, 1100, 2200, 3100, 4200, 4900, 5900] as const;
/** Início (ms) de cada fase da via não genômica: acoplamento → cascatas → bloqueio do cortisol → Ca²⁺. */
export const NONGENOMIC_TIMES = [0, 700, 1600, 2500] as const;

export const GENOMIC_FINAL = GENOMIC_TIMES.length - 1;
export const NONGENOMIC_FINAL = NONGENOMIC_TIMES.length - 1;

/** Duração total aproximada de cada sequência (para o ponteiro do relógio). */
export const GENOMIC_TOTAL_S = 6.9;
export const NONGENOMIC_TOTAL_S = 3.3;

/**
 * Toca uma sequência de fases enquanto `runId` não for nulo; troque o `runId` para reiniciar.
 * Retorna -1 (repouso) sem `runId` e a fase final direto com `prefers-reduced-motion`.
 */
export const useSequence = (runId: string | null, times: readonly number[], reduced: boolean): number => {
    const [state, setState] = useState({ id: '', phase: 0 });

    useEffect(() => {
        if (!runId || reduced) return;
        const timers = times.map((t, phase) => window.setTimeout(() => setState({ id: runId, phase }), t));
        return () => timers.forEach(id => window.clearTimeout(id));
    }, [runId, times, reduced]);

    if (!runId) return -1;
    if (reduced) return times.length - 1;
    return state.id === runId ? state.phase : 0;
};
