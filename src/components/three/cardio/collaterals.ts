import { CARDIO_VITALS, type CardioVitals } from '../../../data/cardioSteps';

/*
 * Os colaterais que se somam ao longo das etapas e o que cada um faz depois de parar. O destino
 * (regride × persiste) não é escrito à mão: sai da própria ficha, comparando a ficha "em uso" com a
 * "depois de parar" na última etapa (todos os colaterais já instalados). A fração que volta é
 * medida em relação ao ponto de partida (o treinado, etapa 1): se pelo menos metade do desvio
 * desaparece, o colateral regride; se não, persiste. Nenhum número é mostrado ao público.
 */

export type CollateralStatus = 'regride' | 'persiste';

export interface Collateral {
    id: string;
    label: string;
    /** Etapa em que o colateral entra na soma. */
    step: number;
    status: CollateralStatus;
}

interface Def {
    id: string;
    label: string;
    step: number;
    read: (v: CardioVitals) => number;
    /** +1: valor maior é pior (parede, pressão…); −1: valor menor é pior (E′). */
    worse: 1 | -1;
}

const DEFS: readonly Def[] = [
    { id: 'hipertrofia', label: 'Hipertrofia', step: 2, read: v => v.paredeMm, worse: 1 },
    { id: 'relaxamento', label: 'Relaxamento', step: 3, read: v => v.eLinha, worse: -1 },
    { id: 'pressao', label: 'Pressão', step: 4, read: v => v.paSist, worse: 1 },
    { id: 'viscosidade', label: 'Viscosidade', step: 5, read: v => v.viscosidade, worse: 1 },
    { id: 'placa', label: 'Placa', step: 6, read: v => v.placa, worse: 1 },
];

/** Fração do desvio (em relação ao ponto de partida) que desaparece ao parar, de 0 a 1. */
export const regressedFraction = (def: Pick<Def, 'read' | 'worse'>, base: CardioVitals, uso: CardioVitals, apos: CardioVitals): number => {
    const excess = (def.read(uso) - def.read(base)) * def.worse;
    if (excess <= 0) return 0;
    const gone = (def.read(uso) - def.read(apos)) * def.worse;
    return Math.min(Math.max(gone / excess, 0), 1);
};

/** Limiar entre "regride" e "persiste". */
const HALF = 0.5;

const buildCollaterals = (): readonly Collateral[] => {
    const last = CARDIO_VITALS.uso.length - 1;
    const base = CARDIO_VITALS.uso[1];
    return DEFS.map(d => ({
        id: d.id,
        label: d.label,
        step: d.step,
        status: regressedFraction(d, base, CARDIO_VITALS.uso[last], CARDIO_VITALS.apos[last]) >= HALF ? 'regride' : 'persiste',
    }));
};

export const COLLATERALS: readonly Collateral[] = buildCollaterals();

/** Quantos colaterais já estão na soma na etapa `step`. */
export const installedAt = (step: number): number => COLLATERALS.filter(c => step >= c.step).length;
