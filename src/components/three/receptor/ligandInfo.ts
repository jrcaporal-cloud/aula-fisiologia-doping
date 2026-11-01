import type { LigandKind } from './molecules';

/*
 * Textos do seletor de ligante — SOMENTE afirmações que já estão na aula:
 * - Trembolona "liga-se ao AR 3x mais forte que a Testosterona basal" (slide 6 "A Base do Doping Moderno"/EAA)
 *   e "sem o carbono na posição 19" (slide de derivados 19-nortestosterona).
 * - SARMs: "AR (Seletivo)" (ComparisonTable) e "ligantes não esteroidais que ativam o AR alterando
 *   diferencialmente a conformação do LBD, recrutando coativadores específicos no músculo esquelético e
 *   antagonizando a transcrição na próstata" (slide "SARMs: A Zona Cinzenta Molecular").
 */
export interface LigandInfo {
    name: string;
    short: string;
    color: string;
    /** Intensidade do brilho do bolsão ocupado (apenas visual; 3× para trembolona segue a aula). */
    glow: number;
    /** Força de ligação relativa citada na aula (null = a aula não dá número). */
    relative: number | null;
    family: string;
    fit: string;
    source: string;
}

export const LIGANDS: Record<LigandKind, LigandInfo> = {
    testosterona: {
        name: 'Testosterona',
        short: 'Testosterona',
        color: '#10B981',
        glow: 0.45,
        relative: 1,
        family: 'Androgênio endógeno · C₁₉H₂₈O₂',
        fit: 'Referência: ocupa o bolsão do LBD, a hélice 12 fecha e as chaperonas se soltam.',
        source: 'Slides 4 e 7 · Receptor Androgênico; Base do Doping Moderno',
    },
    trembolona: {
        name: 'Trembolona',
        short: 'Trembolona',
        color: '#F59E0B',
        glow: 1.0,
        relative: 3,
        family: 'Derivado 19-nor · sem o carbono 19',
        fit: 'Liga-se ao AR 3x mais forte que a testosterona basal.',
        source: 'Slide 7 · A Base do Doping Moderno (EAA)',
    },
    sarm: {
        name: 'SARM (ostarina)',
        short: 'SARM',
        color: '#60A5FA',
        glow: 0.45,
        relative: null,
        family: 'Não esteroidal · AR (seletivo) · estrutura aproximada',
        fit: 'Altera a conformação do LBD (hélice 12 em outra posição): recruta coativadores específicos no músculo esquelético e antagoniza a transcrição na próstata.',
        source: 'Slide 22 · SARMs; Slide 6 · Mapa do Doping de Elite',
    },
};

export const LIGAND_ORDER: LigandKind[] = ['testosterona', 'trembolona', 'sarm'];
