/**
 * Perfis farmacológicos do slide "Perfis Farmacológicos" (id 75).
 * Textos e números são os da aula (versão anterior do SteroidProfileVisualizer) — não alterar.
 * `halfLifeHours` só traduz o rótulo de meia-vida em horas para posicionar na régua log.
 * Atenção: src/components/sims/detection/model.ts cita a meia-vida da nandrolona daqui (~15 dias).
 */
export interface HalfLifeRange {
    /** Limite inferior em horas. */
    min: number;
    /** Limite superior em horas (igual ao inferior quando o valor é único). */
    max: number;
}

export interface SteroidData {
    id: string;
    name: string;
    /** Nome curto (antes do parêntese) para chips e rótulos do mapa. */
    short: string;
    family: string;
    /** Potência anabólica — referência Testosterona = 100. */
    anabolic: number;
    /** Potência androgênica — referência Testosterona = 100. */
    androgenic: number;
    halfLifeLabel: string;
    halfLifeHours: HalfLifeRange;
    color: string;
    description: string;
    clinicalUse: string;
    colaterais: string;
}

const DAY = 24;

export const STEROIDS: readonly SteroidData[] = [
    {
        id: 'test',
        name: 'Testosterona (Base)',
        short: 'Testosterona',
        family: 'Molde Humano',
        anabolic: 100,
        androgenic: 100,
        halfLifeLabel: '~1 – 8 dias (P/E/C)',
        halfLifeHours: { min: 1 * DAY, max: 8 * DAY },
        color: '#60A5FA',
        description: 'O hormônio endógeno padrão pelo qual todos os outros são medidos (Razão 1:1).',
        clinicalUse: 'TRT universal e base obrigatória de quase todo ciclo para manter função fisiológica.',
        colaterais: 'Aromatiza (Ginecomastia, retenção hídrica) e converte em DHT (Queda de cabelo, próstata).',
    },
    {
        id: 'dianabol',
        name: 'Dianabol (Metandrostenolona)',
        short: 'Dianabol',
        family: 'Derivado 17α-Test',
        anabolic: 210,
        androgenic: 60,
        halfLifeLabel: '3 a 5 horas',
        halfLifeHours: { min: 3, max: 5 },
        color: '#FB923C',
        description: 'Primeiro EAA criado especificamente para performance atlética (EUA, anos 50).',
        clinicalUse: 'Usado historicamente como "pontapé inicial" de ganho de volume bruto e força agressiva.',
        colaterais: 'Altamente hepatotóxico. Conversão para metilestradiol (extremamente potente = ginecomastia súbita).',
    },
    {
        id: 'nandrolona',
        name: 'Deca-Durabolin (Nandrolona)',
        short: 'Deca-Durabolin',
        family: 'Derivado 19-Nor',
        anabolic: 125,
        androgenic: 37,
        halfLifeLabel: '~15 dias',
        halfLifeHours: { min: 15 * DAY, max: 15 * DAY },
        color: '#10B981',
        description: 'Alta afinidade anabólica com baixa conversão androgênica intrínseca. Muito comum clinicamente.',
        clinicalUse: 'Tratamento de osteoporose crônica e ganho de massa magra gradual em caquexia.',
        colaterais: 'Atividade progestínica severa. Supressão implacável do eixo HPG e "Deca Dick" (disfunção erétil).',
    },
    {
        id: 'trembolona',
        name: 'Trembolona',
        short: 'Trembolona',
        family: 'Derivado 19-Nor',
        anabolic: 500,
        androgenic: 500,
        halfLifeLabel: '2 a 3 dias',
        halfLifeHours: { min: 2 * DAY, max: 3 * DAY },
        color: '#FACC15',
        description: 'O rei dos anabolizantes. Afinidade pelo Receptor Androgênico 3x mais forte que a Testosterona.',
        clinicalUse: 'Uso EXCLUSIVO veterinário (Criação bovina para engorda rápida pré-abate). Nunca aprovado para humanos.',
        colaterais: 'Toxicidade neurológica severa. Insônia crônica, suores noturnos agressivos e estresse cardiovascular massivo.',
    },
    {
        id: 'winstrol',
        name: 'Winstrol (Estanozolol)',
        short: 'Winstrol',
        family: 'Derivado DHT',
        anabolic: 320,
        androgenic: 30,
        halfLifeLabel: '9 a 24 horas',
        halfLifeHours: { min: 9, max: 24 },
        color: '#A855F7',
        description: 'Não aromatiza. Famoso no escândalo de Ben Johnson (1988).',
        clinicalUse: 'Droga clássica de "corte" para visual hiperseco e ganho de força explosiva na pista.',
        colaterais: 'Deleta as articulações (ressecamento sinovial) e devasta o perfil lipídico (queda brutal de HDL).',
    },
    {
        id: 'oxandrolona',
        name: 'Oxandrolona',
        short: 'Oxandrolona',
        family: 'Derivado DHT',
        anabolic: 322,
        androgenic: 24,
        halfLifeLabel: '9 a 10 horas',
        halfLifeHours: { min: 9, max: 10 },
        color: '#F472B6',
        description: 'Criada para mulheres e crianças com déficits de crescimento. Extremamente suave.',
        clinicalUse: 'Tratamento de queimaduras severas, osteoporose e ganho de força com mínimo impacto virilizante.',
        colaterais: 'Toxicidade hepática branda a moderada (17α-alquilado). Inibe o eixo HPG, mas com menor brutalidade que outras drogas orais.',
    },
    {
        id: 'primobolan',
        name: 'Primobolan (Metenolona)',
        short: 'Primobolan',
        family: 'Derivado DHT',
        anabolic: 88,
        androgenic: 44,
        halfLifeLabel: '~10,5 dias (Enantato)',
        halfLifeHours: { min: 10.5 * DAY, max: 10.5 * DAY },
        color: '#22D3EE',
        description: 'Considerado um dos esteroides mais seguros e limpos já produzidos, lendário na era de Arnold.',
        clinicalUse: 'Prevenção de catabolismo em dietas severas. Não aromatiza e tem supressão endógena mais branda.',
        colaterais: 'Alopecia (queda de cabelo) para indivíduos predispostos, por ser derivado do DHT direto.',
    },
    {
        id: 'hemogenin',
        name: 'Hemogenin (Oximetolona)',
        short: 'Hemogenin',
        family: 'Derivado DHT',
        anabolic: 320,
        androgenic: 45,
        halfLifeLabel: '8 a 9 horas',
        halfLifeHours: { min: 8, max: 9 },
        color: '#E11D48',
        description: 'O EAA oral mais brutal para ganho de peso rápido, retenção e força bruta.',
        clinicalUse: 'Tratamento de anemias severas (estimula massivamente a eritropoiese, glóbulos vermelhos).',
        colaterais: 'Hepatotoxicidade altíssima. Retenção hídrica extrema (famoso "face de lua cheia") e picos perigosos de pressão arterial.',
    },
];

export const REFERENCE_ID = 'test';

export const findSteroid = (id: string): SteroidData =>
    STEROIDS.find(s => s.id === id) ?? STEROIDS[0];

/** Razão anabólica : androgênica (ex.: 3,5 : 1), derivada dos dois números da aula. */
export const formatRatio = (s: SteroidData): string => {
    const ratio = s.anabolic / s.androgenic;
    return `${ratio.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} : 1`;
};

/** Média geométrica da faixa de meia-vida — usada só para ordenar a linha do tempo. */
export const halfLifeCenter = (s: SteroidData): number =>
    Math.sqrt(s.halfLifeHours.min * s.halfLifeHours.max);
