/**
 * Texto do slide "Passaporte Biológico (ABP)" — verbatim de parsedPresentation.json (id 16);
 * os cartões 1 e 2 vêm do HTML original em slidesData.ts ("Distorção do Sistema").
 */

export interface TextPart {
    readonly text: string;
    readonly strong?: boolean;
}

export interface Bullet {
    readonly label: string;
    readonly text: string;
}

export interface StepInfo {
    readonly tab: string;
    readonly title: string;
    readonly caption: string;
    readonly color: string;
    readonly card: string;
    readonly paragraph: readonly TextPart[];
    readonly bullets: readonly Bullet[];
}

export const STEPS: readonly StepInfo[] = [
    {
        tab: 'Agulha × palheiro',
        title: 'Distorção do sistema',
        caption: 'O ABP não procura a molécula: olha a forma do sistema.',
        color: '#22D3EE',
        card: '1. Distorção do Sistema',
        paragraph: [
            { text: 'Não flagra a molécula intrusa diretamente; analisa a ' },
            { text: 'distorção do sistema fisiológico', strong: true },
            { text: '. Em vez de procurar a “agulha no palheiro”, o ABP verifica se o “palheiro” mudou de forma.' },
        ],
        bullets: [],
    },
    {
        tab: 'População × indivíduo',
        title: 'O atleta contra ele mesmo',
        caption: 'Normal para a população pode ser anormal para este atleta.',
        color: '#F59E0B',
        card: '2. O Atleta contra Ele Mesmo',
        paragraph: [
            { text: 'A maior revolução do antidoping: limites populacionais fixos foram abandonados. O atleta é comparado ' },
            { text: 'exclusivamente com seu próprio histórico genético e fisiológico', strong: true },
            { text: ', utilizando inferência bayesiana para calcular a probabilidade de um desvio natural.' },
        ],
        bullets: [],
    },
    {
        tab: 'Hematológico',
        title: 'Módulo hematológico',
        caption: 'Hb alta com %Ret baixa: a assinatura do doping sanguíneo.',
        color: '#E11D48',
        card: '3. Módulo Hematológico',
        paragraph: [
            { text: 'Introduzido em 2009. Analisa biomarcadores do transporte de oxigênio para caçar manipulação sanguínea, reinfusões e abuso de EPO.' },
        ],
        bullets: [
            { label: 'Hemoglobina (Hb) / Hematócrito:', text: 'Quantidade absoluta de carreadores de O₂.' },
            { label: 'Reticulócitos (%Ret):', text: 'Células vermelhas “bebês” na medula. Seu afundamento súbito denuncia injeção de sangue maduro (Transfusão).' },
            { label: 'OFF-Score:', text: 'Um índice matemático que mescla Hb alta com %Ret baixa, a assinatura inconfundível do doping sanguíneo.' },
        ],
    },
    {
        tab: 'Esteroide',
        title: 'Módulo esteroide',
        caption: 'Um “mapa” da testosterona natural na urina ao longo do tempo.',
        color: '#60A5FA',
        card: '4. Módulo Esteroide',
        paragraph: [
            { text: 'Introduzido em 2014. Cria um “mapa” da produção natural de testosterona e seus precursores na urina ao longo do tempo.' },
        ],
        bullets: [
            { label: 'Relação T/E (Testosterona/Epitestosterona):', text: 'O corpo produz em razão de 1:1. Doses sintéticas elevam T, mas não E. Limite de alarme da WADA é >4:1.' },
            { label: 'Androsterona / Etiocolanolona:', text: 'Metabólitos terminais intracelulares.' },
            { label: 'Deleção UGT2B17:', text: 'Analisado contextualmente. Populações têm deleção genética que apaga grande parte das marcas de excreção.' },
        ],
    },
];

export const STEP_COUNT = STEPS.length;

export const COLORS = {
    cyan: '#22D3EE',
    amber: '#F59E0B',
    red: '#E11D48',
    blue: '#60A5FA',
    /** "Dentro da faixa": ciano (não verde), para não depender de distinguir verde de vermelho. */
    ok: '#22D3EE',
    hay: '#E8B04B',
} as const;
