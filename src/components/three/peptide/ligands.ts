import type { PeptideLigand } from '../../../data/peptideSteps';

/*
 * Seletor de ligante do modelo da via de membrana. Textos = só o roteiro da aula
 * (fisiologia endócrina da adeno-hipófise; Lista Proibida WADA 2026, S2.2).
 */

export interface PeptideLigandInfo {
    name: string;
    family: string;
    text: string;
    color: string;
    receptor: string;
    gProtein: string;
    enzyme: string;
    messenger: string;
    messengerColor: string;
}

export const PEPTIDE_SOURCE = 'Fisiologia endócrina da adeno-hipófise; Lista Proibida WADA 2026, S2.2.';

export const PEPTIDE_LIGANDS: Record<PeptideLigand, PeptideLigandInfo> = {
    ghrp: {
        name: 'GHRP / grelina',
        family: 'Miméticos da grelina · receptor GHS-R1a',
        text: 'Receptor de grelina, acoplado à Gq. O mensageiro é o cálcio liberado do retículo pelo IP3.',
        color: '#22D3EE',
        receptor: 'Receptor de grelina (GHS-R1a)',
        gProtein: 'Gq',
        enzyme: 'Fosfolipase C',
        messenger: 'IP3',
        messengerColor: '#E879F9',
    },
    ghrh: {
        name: 'Análogo de GHRH',
        family: 'Análogos de GHRH · receptor de GHRH',
        text: 'Receptor de GHRH, acoplado à Gs. O mensageiro é o AMPc, que ativa a PKA.',
        color: '#FBBF24',
        receptor: 'Receptor de GHRH',
        gProtein: 'Gs',
        enzyme: 'Adenilato ciclase',
        messenger: 'AMPc',
        messengerColor: '#FB923C',
    },
};

export const PEPTIDE_LIGAND_ORDER: PeptideLigand[] = ['ghrp', 'ghrh'];

/** Cores fixas das estruturas que não dependem do ligante. */
export const PC = {
    heads: '#9FB6D6',
    tails: '#C9A227',
    beta: '#A78BFA',
    gamma: '#C4B5FD',
    gdp: '#334155',
    gtp: '#F8FAFC',
    calcium: '#F8FAFC',
    er: '#818CF8',
    pka: '#A78BFA',
    granule: '#FDA4AF',
    gh: '#E11D48',
    arrestin: '#94A3B8',
    channel: '#7DD3FC',
    crimson: '#E11D48',
    slate: '#CBD5E1',
} as const;
