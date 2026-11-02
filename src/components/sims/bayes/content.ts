/**
 * Texto do slide "Como Funciona o Algoritmo Bayesiano?" — verbatim de parsedPresentation.json (id 23).
 */

export interface TextPart {
    readonly text: string;
    readonly strong?: boolean;
}

export interface Bullet {
    readonly id: 'priori' | 'atualizacao' | 'corredor';
    readonly label: string;
    readonly text: string;
}

export const HEADING = 'Cálculo Dinâmico (Teorema de Bayes)';

export const PARAGRAPH: readonly TextPart[] = [
    { text: 'O modelo bayesiano no antidoping não usa um ' },
    { text: '“limite universal estático”', strong: true },
    { text: ' fixo (como “T/E máximo de 4,0 para humanos”). Em vez disso, ele usa a teoria da probabilidade condicional para atualizar constantemente o perfil do atleta.' },
];

export const BULLETS: readonly Bullet[] = [
    { id: 'priori', label: 'Priori:', text: 'O modelo começa com a média populacional base daquele esporte/raça.' },
    { id: 'atualizacao', label: 'Atualização:', text: 'A cada novo exame de sangue/urina coletado, o algoritmo recalibra o centro genético daquele atleta exato.' },
    {
        id: 'corredor', label: 'Corredor Adaptativo:',
        text: 'Após 3 exames, o software desenha um “túnel” de limites mínimo/máximo exclusivos para este indivíduo. Se a Hemoglobina subir fora desse túnel privativo — mesmo sendo um valor normal para outra pessoa — o sistema dispara um alerta de “Achado Atípico (ATF)”.',
    },
];

export interface StepInfo {
    readonly title: string;
    readonly caption: string;
    readonly color: string;
    /** Quantos exames já entraram no modelo. */
    readonly exams: number;
    /** Item do texto em destaque (null = parágrafo de abertura). */
    readonly bullet: Bullet['id'] | null;
}

export const STEPS: readonly StepInfo[] = [
    { title: 'Limite universal estático', caption: 'Uma régua fixa para todos: T/E máximo de 4,0.', color: '#E5E7EB', exams: 0, bullet: null },
    { title: 'Priori', caption: 'Antes do 1º exame, vale a média populacional.', color: '#CBD5E1', exams: 0, bullet: 'priori' },
    { title: 'Atualização · exame 1', caption: 'O centro migra para o atleta e o corredor estreita.', color: '#60A5FA', exams: 1, bullet: 'atualizacao' },
    { title: 'Atualização · exame 2', caption: 'Cada exame recalibra o centro de novo.', color: '#60A5FA', exams: 2, bullet: 'atualizacao' },
    { title: 'Corredor adaptativo', caption: 'Após 3 exames, o túnel é do próprio atleta.', color: '#22D3EE', exams: 3, bullet: 'corredor' },
    { title: 'Achado Atípico (ATF)', caption: 'Fora do túnel privativo, mesmo abaixo de 4,0.', color: '#FDA4AF', exams: 4, bullet: 'corredor' },
];

export const STEP_COUNT = STEPS.length;
