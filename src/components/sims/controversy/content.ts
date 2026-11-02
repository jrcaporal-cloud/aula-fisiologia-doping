/**
 * Texto do slide "O Triângulo das Controvérsias" — verbatim de parsedPresentation.json (id 24, três cartões).
 * Cada cartão foi apenas dividido em premissa → contraponto → embate, sem trocar palavras.
 */

export interface TextPart {
    readonly text: string;
    readonly em?: boolean;
}

export type VertexId = 'trans' | 'dili' | 'wada';

export interface Vertex {
    readonly id: VertexId;
    readonly num: string;
    readonly title: string;
    readonly color: string;
    readonly soft: string;
    readonly label: string;
    readonly premise: readonly TextPart[];
    readonly counter: readonly TextPart[];
    readonly embate: string;
    /** Trecho do próprio embate usado na síntese final. */
    readonly embateShort: string;
}

export const VERTICES: readonly Vertex[] = [
    {
        id: 'trans', num: '01', title: 'Atletas Trans & Testosterona', color: '#A855F7', soft: '#C4B5FD',
        label: 'O Paradoxo Mionuclear',
        premise: [{ text: 'O limite atual da WADA (2,5 nmol/L) visa suprimir o fenótipo masculino.' }],
        counter: [
            { text: 'Contudo, a fisiologia demonstra que a exposição à testosterona endógena durante a puberdade induz ' },
            { text: 'adição permanente de mionúcleos', em: true },
            { text: ' nas fibras musculares estriadas, além de conferir arquitetura pélvica estreita, maior densidade óssea e hipertrofia ventricular esquerda irreversível.' },
        ],
        embate: 'Onde a vantagem biológica herdada se sobrepõe à supressão farmacológica atual? A “memória muscular” androgênica anula a justiça da categoria feminina, ou a bioética exige a inclusão independentemente dos resquícios histológicos?',
        embateShort: 'Onde a vantagem biológica herdada se sobrepõe à supressão farmacológica atual?',
    },
    {
        id: 'dili', num: '02', title: 'Contaminação Cruzada (DILI)', color: '#F59E0B', soft: '#FCD34D',
        label: 'A Falha do Sistema',
        premise: [
            { text: 'O princípio da ' },
            { text: 'Strict Liability', em: true },
            { text: ' (Responsabilidade Objetiva) determina que o atleta é 100% culpado pelo que há em seu sangue.' },
        ],
        counter: [
            { text: 'Porém, a cromatografia de massa moderna detecta em nível de picogramas (10⁻¹² g). Isso flagra resíduos de SARMs (Ostarina/LGD-4033) e Diuréticos decantados em tanques não lavados de fábricas de suplementos asiáticas.' },
        ],
        embate: 'Com a sensibilidade dos espectrômetros ultrapassando a precisão do controle de qualidade da indústria nutracêutica global, suspensões de 4 anos estão arruinando carreiras por “doping acidental” sem benefício de performance provado.',
        embateShort: '… suspensões de 4 anos estão arruinando carreiras por “doping acidental” sem benefício de performance provado.',
    },
    {
        id: 'wada', num: '03', title: 'O Teatro da WADA', color: '#E11D48', soft: '#FDA4AF',
        label: 'A Ilusão do Jogo Limpo',
        premise: [{ text: 'O sistema gasta milhões em logística, mas sofre de “cegueira seletiva”.' }],
        counter: [
            { text: 'A insulina ultrarrápida sai do soro em 2 horas; peptídeos secretores (IGF-1 LR3, CJC-1295) atuam sob as enzimas em minutos; e a transfusão autóloga noturna burla o ABP misturando o próprio sangue do atleta.' },
        ],
        embate: 'O teste antidoping na superelite serve primariamente para proteger a saúde real dos atletas ou é um “imposto de relações públicas” mantido pelos Comitês Olímpicos para não afugentar os patrocinadores (“sponsors”) bilionários corporativos?',
        embateShort: 'O teste antidoping na superelite serve primariamente para proteger a saúde real dos atletas ou é um “imposto de relações públicas” …?',
    },
];

/** Slides seguintes da aula que aprofundam o vértice 01 (títulos de parsedPresentation.json, ids 32–34). */
export const NEXT_SLIDES: readonly string[] = [
    'O Dimorfismo Sexual como Variável Atlética',
    'Casos que Mudaram as Regras do Esporte',
    'O Abismo entre Ciência e Regulação',
];

export interface StepInfo {
    readonly title: string;
    readonly caption: string;
    readonly color: string;
}

export const STEPS: readonly StepInfo[] = [
    { title: 'Três controvérsias', caption: 'Cada vértice: uma premissa, um contraponto e um embate.', color: '#E5E7EB' },
    ...VERTICES.map(v => ({ title: `${v.num} · ${v.title}`, caption: v.label, color: v.soft })),
    { title: 'O triângulo inteiro', caption: 'Os três embates, lado a lado.', color: '#E5E7EB' },
];

export const STEP_COUNT = STEPS.length;
