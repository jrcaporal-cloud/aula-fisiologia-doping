/**
 * Conteúdo do slide "O STACK OLÍMPICO" (id 11 do parsedPresentation.json).
 *
 * Fontes (texto verbatim da aula, só ortografia ajustada):
 *  - Cartões EAA / hGH-IGF-1 / INSULINA (`cards[].rawHtml` do id 11; mesmo texto em slidesData.ts).
 *  - Componente antigo `animations/StackOlimpicoDisplay.tsx`: papel de cada peça, resumo de uma linha,
 *    meia-vida, janela de detecção, resultado (+5 → +8 kg, 8–12 semanas) e alerta de risco.
 *  - Tooltip "A Origem do Termo" do título original (slidesData.ts).
 */

/** Trecho de texto com destaque opcional (negrito branco ou itálico). */
export interface Span {
    readonly t: string;
    readonly b?: boolean;
    readonly i?: boolean;
}

export type PieceId = 'eaa' | 'gh' | 'ins';

export interface Piece {
    readonly id: PieceId;
    readonly name: string;
    /** Nome em duas linhas para o centro da engrenagem. */
    readonly gearLines: readonly string[];
    readonly role: string;
    readonly cardTitle: string;
    readonly badge: string;
    readonly summary: string;
    readonly paragraphs: readonly (readonly Span[])[];
    readonly half: string;
    readonly detect: string;
    readonly color: string;
    readonly soft: string;
}

export const PIECES: readonly Piece[] = [
    {
        id: 'eaa',
        name: 'EAA',
        gearLines: ['EAA'],
        role: 'Base androgênica',
        cardTitle: 'A Base de Retenção',
        badge: 'Ação lenta / genômica',
        summary: 'Mionucleação permanente. O "chassi" do stack — suporta todas as adaptações estruturais.',
        paragraphs: [
            [
                { t: 'Aumenta drasticamente o número de mionúcleos via doação de células satélite sob estresse mecânico. O núcleo adicional é ' },
                { t: 'eterno', b: true },
                { t: ' (permanece após o fim do uso), criando o conceito de ' },
                { t: '"memória muscular dopada"', b: true },
                { t: '.' },
            ],
            [
                { t: 'Atua no Receptor Androgênico bloqueando sinalização catabólica via ' },
                { t: 'down-regulation', i: true },
                { t: ' da miostatina e superexpressão de folistatina. No empilhamento olímpico, atua como o "chassi" do carro: suporta todas as outras modificações.' },
            ],
        ],
        half: '7–10 dias',
        detect: '3 meses',
        color: '#60A5FA',
        soft: '#BFDBFE',
    },
    {
        id: 'gh',
        name: 'hGH / IGF-1',
        gearLines: ['hGH', 'IGF-1'],
        role: 'Multiplicador celular',
        cardTitle: 'A Chaveta Celular / Parácrina',
        badge: 'Sinergia pura',
        summary: 'Hiperplasia via GHR → síntese hepática/local de IGF-1. Lipólise extrema + pele "granítica".',
        paragraphs: [
            [
                { t: 'Induz ' },
                { t: 'hiperplasia celular', b: true },
                { t: ' (divisão de novas fibras musculares, não apenas crescimento das existentes) via GHR e síntese hepática/local de IGF-1 em cascata. Um processo que o corpo adulto naturalmente limita severamente.' },
            ],
            [
                { t: 'Ao mesmo tempo, ativa uma lipólise brutal via inibição total da ' },
                { t: 'LPL (Lipoproteína Lipase)', i: true },
                { t: ', secando o tecido adiposo subcutâneo e criando a pele hiperfina "granítica" moderna pré-competição.' },
            ],
        ],
        half: '15–20 min',
        detect: '24–48 h',
        color: '#10B981',
        soft: '#A7F3D0',
    },
    {
        id: 'ins',
        name: 'Insulina',
        gearLines: ['INSULINA'],
        role: 'Gatilho mestre',
        cardTitle: 'O Gatilho Mestre Indetectável',
        badge: 'O risco final',
        summary: 'Satura GLUT4 → células musculares viram "esponjas". Blinda mTORC1 via Ubiquitina-Proteassoma.',
        paragraphs: [
            [
                { t: 'Satura os receptores IR (Tirosina Quinase), arrastando brutalmente os transportadores GLUT4 para a membrana celular em poucos minutos. Transforma células musculares em esponjas gigantes de glicogênio e aminoácidos intratreino.' },
            ],
            [
                { t: 'Blinda a cascata mTORC1 através da ' },
                { t: 'inibição completa da degradação proteica', b: true },
                { t: ' (via Ubiquitina-Proteassoma). Todo EAA/GH construído é retido 100%. Meia-vida no sangue indetectável em horas após a injeção pós-treino.' },
            ],
        ],
        half: '4–6 min',
        detect: 'Indetectável',
        color: '#E11D48',
        soft: '#FECDD3',
    },
];

export interface StepInfo {
    readonly tab: string;
    readonly title: string;
    readonly caption: string;
}

export const STEPS: readonly StepInfo[] = [
    { tab: 'EAA', title: 'Peça 1 · EAA', caption: 'o "chassi" do carro: suporta todas as outras modificações' },
    { tab: 'hGH / IGF-1', title: 'Peça 2 · hGH / IGF-1', caption: 'a chaveta celular / parácrina encaixa no chassi' },
    { tab: 'Insulina', title: 'Peça 3 · Insulina', caption: 'o gatilho mestre põe o stack para girar' },
    { tab: 'Rastro', title: 'Perfil de rastro', caption: 'meia-vida e janela de detecção de cada peça' },
    { tab: 'Resultado', title: 'Resultado prático', caption: 'o ganho e o preço do stack' },
];

export const RESULT = {
    kicker: 'Resultado documentado',
    from: '+5',
    to: '+8 kg',
    line: 'de massa funcional limpa em um bloco isolado de 8–12 semanas de preparação na elite',
    riskTitle: 'Risco sistêmico crítico',
    riskText:
        'Hiperglicemia reativa aguda pela INSULINA: risco de hipoglicemia severa intratreino levando a coma e indução fatal celular.',
    errorWindow: 'Janela de erro = minutos',
} as const;

export const ORIGIN: { readonly title: string; readonly paragraphs: readonly (readonly Span[])[] } = {
    title: 'A origem do termo',
    paragraphs: [
        [
            { t: 'O termo ' },
            { t: '"Stack"', b: true },
            { t: ' vem da palavra em inglês empilhar. Na década de 90, médicos esportivos no bloco de leste perceberam que não adiantava dar doses maciças de um único hormônio (monociclo) para os atletas.' },
        ],
        [
            { t: 'O corpo regula receptores para baixo (' },
            { t: 'down-regulation', i: true },
            { t: ') e surgem colaterais severos. A solução? Empilhar drogas que agem em ' },
            { t: 'sistemas e receptores completamente diferentes', b: true },
            { t: ' simultaneamente.' },
        ],
        [
            { t: 'Resultado prático:', b: true },
            { t: ' nasceu o Stack Olímpico — a sinergia blindada entre as 3 classes hormonais mais anabólicas conhecidas (EAA, hGH e Insulina), forçando hipertrofia absurda sem saturar um único eixo.' },
        ],
    ],
};
