import type { CardioPhase } from '../../../data/cardioSteps';
import { CC } from './colors';

/* Seletor de estado do painel: o mesmo paciente em uso e depois de parar. */

export interface PhaseInfo { name: string; color: string; text: string }

export const CARDIO_PHASES: Record<CardioPhase, PhaseInfo> = {
    uso: {
        name: 'Em uso',
        color: CC.crimson,
        text: 'Os colaterais somados: parede espessa, pós-carga alta, sangue viscoso e placa em crescimento no mesmo paciente.',
    },
    apos: {
        name: 'Depois de parar',
        color: '#22D3EE',
        text: 'Pressão, hematócrito e lipídios cedem; parede, função e placa cedem menos. O circuito transita — não volta ao ponto de partida.',
    },
};
