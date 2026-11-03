/**
 * Textos do slide "A Máquina Metabólica: Beta-2 Detalhado" (parsedPresentation.json, id 191).
 * Frases e números copiados dos quatro cartões do slide; nada de fora.
 */

export const C = {
    clen: '#FB7185',
    salb: '#10B981',
    gw: '#A855F7',
    amber: '#F59E0B',
    red: '#E11D48',
    cyan: '#22D3EE',
} as const;

export interface StepInfo {
    readonly label: string;
    readonly title: string;
    readonly caption: string;
    readonly color: string;
}

export const STEPS: readonly StepInfo[] = [
    { label: 'Clembuterol', title: 'Clembuterol: meia-vida longa', caption: 't½ ~35 h · taquifilaxia em 14-21 dias', color: C.clen },
    { label: 'Salbutamol', title: 'Salbutamol: eliminado em horas', caption: 't½ ~4 a 6 h', color: C.salb },
    { label: 'TUE', title: 'Salbutamol inalado: permitido com limite', caption: '1.600 µg/24 h', color: C.salb },
    { label: 'Cardarine', title: 'O falso beta-2: Cardarine (GW1516)', caption: 'agonista PPAR-delta', color: C.gw },
    { label: 'Detecção', title: 'Janelas e detecção analítica', caption: 'Zero Tolerância · MRPL 0,2 ng/mL', color: C.amber },
];

export interface Para {
    readonly lead?: string;
    readonly text: string;
    /** Trechos do próprio texto que recebem ênfase (só apresentação; o texto não muda). */
    readonly marks?: readonly string[];
}

export interface StepText {
    readonly kicker: string;
    readonly title: string;
    readonly color: string;
    readonly paras: readonly Para[];
}

export const TEXTS: readonly StepText[] = [
    {
        kicker: 'Clembuterol (Clen)',
        title: 'Meia-vida: ~35 horas',
        color: C.clen,
        paras: [
            { lead: 'Efeito Anabólico:', text: 'Mais pronunciado em modelos animais, mas em humanos atua fortemente como anticatabólico e um termogênico extremo.' },
            { text: 'Ocorre rápida taquifilaxia (down-regulation dos receptores β2) em 14-21 dias, exigindo o uso de Cetotifeno para "limpar" os receptores.' },
        ],
    },
    {
        kicker: 'Salbutamol / Albuterol',
        title: 'Meia-vida: ~4 a 6 horas',
        color: C.salb,
        paras: [
            { lead: 'Efeito:', text: 'Menos potente que o Clembuterol para queima de gordura, mas muito utilizado (especialmente oral/xarope) por ser eliminado rapidamente, escapando da janela de detecção.' },
        ],
    },
    {
        kicker: 'Salbutamol / Albuterol',
        title: 'Doping (TUE)',
        color: C.salb,
        paras: [
            { text: 'Permitido via inalação para asma (limite de 1.600 µg/24 h).' },
            { text: 'Chris Froome caiu no antidoping por exceder quase 2x esse limite urinário, culpando desidratação severa concentrando a urina.' },
        ],
    },
    {
        kicker: 'O Falso Beta-2: Cardarine (GW1516)',
        title: 'Na verdade, um Agonista PPAR-delta',
        color: C.gw,
        paras: [
            { text: 'Frequentemente vendido ao lado de SARMs e Beta-2, na verdade é um Agonista PPAR-delta.' },
            { lead: 'Mecanismo:', text: 'Reprograma o músculo esquelético para preferir ácidos graxos em vez de glicose. Converte fibras musculares rápidas (Tipo II) em lentas e oxidativas (Tipo I).' },
        ],
    },
    {
        kicker: 'Janelas e Detecção Analítica',
        title: 'Zero Tolerância para Clembuterol',
        color: C.amber,
        paras: [
            { text: 'A WADA possui Zero Tolerância (MRPL de 0,2 ng/mL) para Clembuterol.', marks: ['Zero Tolerância (MRPL de 0,2 ng/mL)'] },
            { text: 'No entanto, devido ao histórico de contaminação alimentar mundial (China, México, onde o Clembuterol é usado clandestinamente em porcos/bois para aumento de carne magra), a WADA introduziu uma diretriz para "Gestão de Resultados" baseada na rastreabilidade isotópica quando se encontram frações de picogramas (limite de notificação < 5 ng/mL em carnes de países de risco).', marks: ['Gestão de Resultados', 'limite de notificação < 5 ng/mL'] },
        ],
    },
];

export const CLEN_CASES = {
    lead: 'Doping:',
    text: 'Historicamente o mais pego.',
    cases: [
        { name: 'Alberto Contador', note: '' },
        { name: 'Canelo Álvarez', note: 'alegação de carne contaminada no México' },
    ],
} as const;

export const GW_RISK = {
    lead: 'Riscos Reais:',
    text: 'Abandonado pela GlaxoSmithKline na fase 2 por induzir tumores cancerígenos sistêmicos rápidos e agressivos em modelos de ratos.',
    tail: 'Mesmo assim, sucesso absoluto de vendas no mercado underground de endurance.',
} as const;

/** Números de farmacocinética e detecção (todos dos cartões). */
export const PK = {
    clenHalfLifeH: 35,
    salbHalfLifeMinH: 4,
    salbHalfLifeMaxH: 6,
    tachyMinDays: 14,
    tachyMaxDays: 21,
    salbInhaledLimit: '1.600 µg/24 h',
    mrplNgMl: 0.2,
    notifyNgMl: 5,
} as const;
