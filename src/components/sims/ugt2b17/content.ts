/**
 * Textos do slide "O Polimorfismo UGT2B17" (parsedPresentation.json, id 9).
 * Todas as afirmações e números vêm do slide original; nada foi acrescentado.
 */

export type Genotype = 'normal' | 'del';

export interface TextPart {
    readonly text: string;
    /** Trecho que o slide original destacava em negrito. */
    readonly strong?: boolean;
}

export interface StepText {
    readonly title: string;
    readonly subtitle: string;
    readonly color: string;
    readonly paragraphs: readonly (readonly TextPart[])[];
    readonly pill?: string;
}

/** Rótulo curto de cada passo (cabeçalho da cena). */
const STEP_LABELS = [
    'Testosterona livre na corrente sanguínea',
    'Glucuronidação hepática pela UGT2B17',
    'O teste clássico WADA (razão T/E)',
] as const;

export const STEP_COUNT = 5;

export const stepLabel = (step: number, genotype: Genotype): string => {
    if (step < STEP_LABELS.length) return STEP_LABELS[step];
    if (step === 3) return genotype === 'normal' ? 'Gene normal + doping: excreção urinária' : 'Deleção UGT2B17 + doping: falso negativo';
    return 'Mesmo doping: gene normal × deleção UGT2B17';
};
/** A partir deste passo o atleta está usando testosterona exógena (Cipionato). */
export const DOPING_STEP = 3;

const FREE_T: StepText = {
    title: 'Testosterona Livre',
    subtitle: 'Corrente Sanguínea',
    color: '#60A5FA',
    paragraphs: [[
        { text: 'A testosterona endógena ou exógena circula livremente ou ligada a proteínas. Para ser filtrada pelos rins e eventualmente detectada nos testes antidoping urinários, ela precisará passar pelo processo de hidrossolubilidade.' },
    ]],
};

const ENZYME: StepText = {
    title: 'Enzima UGT2B17',
    subtitle: 'Glucuronidação Hepática (Fígado)',
    color: '#34D399',
    paragraphs: [
        [
            { text: 'A enzima UGT2B17 é responsável por anexar uma molécula de ácido glucurônico à testosterona, tornando-a ' },
            { text: 'solúvel em água', strong: true },
            { text: ': a Testosterona-Glucuronídica.' },
        ],
        [{ text: 'Somente neste estado os rins conseguem retirá-la do sangue eficientemente.' }],
    ],
};

const WADA: StepText = {
    title: 'O Teste Clássico WADA (Razão T/E)',
    subtitle: 'Urina · Testo / Epitesto',
    color: '#FCD34D',
    paragraphs: [
        [{ text: 'A WADA avalia doping medindo a proporção de Testo para Epitesto na urina (limite de 4:1).' }],
        [
            { text: 'Atenção:', strong: true },
            { text: ' O teste urina-dependente só funciona se a enzima UGT2B17 enviar a testosterona para a bexiga!' },
        ],
    ],
};

export const NORMAL_TEXT: StepText = {
    title: 'Gene Normal',
    subtitle: 'Excreção Urinária',
    color: '#E5E7EB',
    pill: '100% Africanos | 90% Caucasianos',
    paragraphs: [[
        { text: 'O corpo solubiliza e joga na urina. O teste T/E acusa rapidamente níveis supracomuns, desmascarando o doping (Razão explode para 15:1 ou mais).' },
    ]],
};

export const DEL_TEXT: StepText = {
    title: 'Deleção UGT2B17',
    subtitle: 'Falso Negativo',
    color: '#FDA4AF',
    pill: '66% dos coreanos (del/del)',
    paragraphs: [
        [
            { text: 'Sem o gene, a enzima primária falha. A testosterona exógena ' },
            { text: 'não entra na urina', strong: true },
            { text: ', escapando pelas fezes.' },
        ],
        [{ text: 'Músculos supersaturados com Cipionato, mas a urina apresenta exame limpo (T/E de 0,5:1).' }],
    ],
};

/** Texto do painel lateral: nos passos de desfecho, segue o genótipo escolhido. */
export const stepText = (step: number, genotype: Genotype): StepText => {
    if (step === 0) return FREE_T;
    if (step === 1) return ENZYME;
    if (step === 2) return WADA;
    return genotype === 'normal' ? NORMAL_TEXT : DEL_TEXT;
};

/** Razão T/E urinária com doping, conforme o slide. */
export const TE_LIMIT = 4;
export const TE_RESULT: Record<Genotype, { value: number; label: string; verdict: string }> = {
    normal: { value: 15, label: '15:1 ou mais', verdict: 'Doping detectado' },
    del: { value: 0.5, label: '0,5:1', verdict: 'Falso negativo' },
};

export const GENOTYPES: readonly { id: Genotype; label: string; short: string; color: string }[] = [
    { id: 'normal', label: 'Gene normal', short: 'Gene normal', color: '#22D3EE' },
    { id: 'del', label: 'Deleção UGT2B17 (del/del)', short: 'Deleção (del/del)', color: '#E11D48' },
];
