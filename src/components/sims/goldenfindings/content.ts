/**
 * Texto do slide "Os 5 Achados de Ouro da Imersão" (parsedPresentation.json, id 25) — verbatim.
 * Cada achado aponta para o simulador da aula onde o assunto foi visto; o número do slide é
 * calculado a partir da ordem atual do deck (ver slideRefs.ts), com um valor de reserva.
 */

export type EchoId = 'dose' | 'stack' | 'transfusion' | 'shelf' | 'ugt';

export interface SourceSlide {
    /** Componente que o slide de origem usa em [[COMP:…]]. */
    readonly comp: string;
    /** Número do slide na ordem atual, caso o componente não seja encontrado no deck. */
    readonly fallback: number;
}

export interface Finding {
    readonly n: number;
    readonly echo: EchoId;
    readonly title: string;
    readonly text: string;
    /** Rótulo curto da aba. */
    readonly tab: string;
    readonly color: string;
    /** Slides de origem: o primeiro é o simulador ecoado pelo desenho. */
    readonly sources: readonly SourceSlide[];
    /** O desenho usa curva contínua de modelo (mesmo selo do slide de origem). */
    readonly illustrative: boolean;
}

export const FINDINGS: readonly Finding[] = [
    {
        n: 1,
        echo: 'dose',
        title: 'A Mágica está no Tempo e Dose',
        text: 'A testosterona exógena traz ganhos dependentes de dose, atingindo limites notáveis no músculo esquelético entre a 3ª e a 10ª semana de saturação via receptor AR.',
        tab: 'Tempo e dose',
        color: '#60A5FA',
        sources: [{ comp: 'DoseResponseSim', fallback: 10 }],
        illustrative: true,
    },
    {
        n: 2,
        echo: 'stack',
        title: 'O Sinergismo Supremo',
        text: 'O “Stack Olímpico” mistura Testosterona (Músculo Bruto) + GH (Agente Abridor de Vias) + Insulina (Condutor e Bloqueador Máximo da Quebra) orquestrando a via mTOR e formando o coquetel indestrutível.',
        tab: 'Sinergismo',
        color: '#10B981',
        sources: [{ comp: 'StackSim', fallback: 15 }],
        illustrative: false,
    },
    {
        n: 3,
        echo: 'transfusion',
        title: 'O Reticulócito Mente',
        text: 'A Transfusão e o Passaporte Biológico correm de braços dados. A injeção de sua própria bolsa de sangue semanas após coletada em treino de altitude engana os sensores indiretos bayesianos na maioria dos casos.',
        tab: 'Reticulócito',
        color: '#E11D48',
        sources: [{ comp: 'TransfusionSim', fallback: 21 }, { comp: 'AbpConceptSim', fallback: 20 }],
        illustrative: true,
    },
    {
        n: 4,
        echo: 'shelf',
        title: 'Cuidado na Prateleira',
        text: 'Moduladores Seletivos de Receptores Androgênicos (SARMs) mascaram-se e contaminam fórmulas proprietárias de vitaminas “naturais”, resultando no banimento diário de inocentes.',
        tab: 'Prateleira',
        color: '#22D3EE',
        sources: [{ comp: 'SarmsSim', fallback: 22 }],
        illustrative: false,
    },
    {
        n: 5,
        echo: 'ugt',
        title: 'O Corpo Esconde seus Segredos',
        text: 'O terrível polimorfismo UGT2B17 na espécie humana cria superexcretores negativos; onde pessoas tomam esteroides sintéticos pesados e simplesmente “não pingam” de volta urina para acusar doping.',
        tab: 'Segredos',
        color: '#F59E0B',
        sources: [{ comp: 'Ugt2b17Sim', fallback: 11 }],
        illustrative: false,
    },
];

/** Passos: um por achado + os cinco juntos. */
export const ALL_STEP = FINDINGS.length;
export const STEP_COUNT = FINDINGS.length + 1;

export const C = {
    bg: '#050510',
    card: 'rgba(8,8,18,0.72)',
    red: '#E11D48',
    crimson: '#9F1239',
    blue: '#60A5FA',
    green: '#10B981',
    amber: '#F59E0B',
    purple: '#A855F7',
    cyan: '#22D3EE',
    ice: '#BAE6FD',
    text: '#E5E7EB',
    soft: '#D1D5DB',
} as const;
