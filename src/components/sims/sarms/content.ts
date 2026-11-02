/**
 * Textos do slide "SARMs: A Zona Cinzenta Molecular" (parsedPresentation.json, id 18).
 * Frases e números copiados do slide; nada foi acrescentado. Onde o texto foi encurtado
 * para caber no esquema, o sentido é o mesmo do cartão original.
 */

export interface StepInfo {
    readonly label: string;
    readonly title: string;
    readonly caption: string;
    readonly color: string;
}

export const COLORS = {
    red: '#E11D48',
    rose: '#FB7185',
    blue: '#60A5FA',
    green: '#10B981',
    amber: '#F59E0B',
    cyan: '#22D3EE',
    purple: '#A855F7',
} as const;

export const STEPS: readonly StepInfo[] = [
    { label: 'Alerta', title: 'Vendido como suplemento, detectado como doping', caption: 'amostras suspeitas da WADA', color: COLORS.rose },
    { label: 'Seletividade', title: 'O mesmo receptor androgênico, dois tecidos', caption: 'músculo ativa · próstata antagoniza', color: COLORS.cyan },
    { label: 'A conta', title: 'A falsa promessa de segurança', caption: 'fígado e eixo HPG pagam a conta', color: COLORS.red },
    { label: 'Compostos', title: 'Compostos em destaque', caption: 'Ostarina · LGD-4033 · RAD-140', color: COLORS.blue },
];

export const ALERT = {
    range: '10–15%',
    text: 'das amostras suspeitas em laboratórios da WADA contêm SARMs.',
    low: 10,
    high: 15,
} as const;

export const SUBTITLE_PARTS = { sold: 'vendidos como suplemento', caught: 'detectados como doping' } as const;

export const MOA =
    'Ligantes não esteroidais que ativam o receptor androgênico (AR) alterando diferencialmente a conformação do domínio de ligação (LBD).';

export const MUSCLE = {
    tissue: 'Músculo esquelético',
    verb: 'Ativa',
    lines: ['Recruta coativadores específicos', 'no músculo esquelético'],
} as const;

export const PROSTATE = {
    tissue: 'Próstata',
    verb: 'Antagoniza',
    lines: ['Antagoniza a transcrição', 'na próstata'],
    note: '5α-redutase: interação limitada → previne a hiperplasia prostática benigna',
} as const;

export const LIVER = {
    title: 'Hepatotoxicidade (DILI)',
    lines: ['Elevação severa de ALT/AST', 'dano colestático mitocondrial'],
} as const;

export const HPG = {
    title: 'Eixo HPG',
    verb: 'Supressão profunda',
    lines: ['do eixo HPG: LH/FSH zerados', 'em doses >5 mg/dia'],
    dose: '>5 mg/dia',
} as const;

export const VASCULAR = 'Fronteiras moleculares: falha em proteger contra toxicidade vascular.';

export type SideEffectTag = 'lipidico' | 'hpg' | 'figado';

export interface Compound {
    readonly n: 1 | 2 | 3;
    readonly name: string;
    readonly code: string;
    readonly color: string;
    /** Nível de ação no texto do slide: Moderada = 1, Alta = 2, Muito Alta = 3. */
    readonly level: 1 | 2 | 3;
    readonly action: string;
    readonly actionNote: string;
    readonly clinical: string;
    readonly sideEffect: string;
    readonly tag: SideEffectTag;
}

export const COMPOUNDS: readonly Compound[] = [
    {
        n: 1,
        name: 'Ostarina',
        code: 'MK-2866',
        color: '#93C5FD',
        level: 1,
        action: 'Moderada',
        actionNote: 'Efeito focado em preservação de massa e osso.',
        clinical: 'Caquexia e sarcopenia (Nunca aprovado humanamente).',
        sideEffect: 'Derruba o perfil lipídico (HDL desaba) drasticamente nas primeiras semanas.',
        tag: 'lipidico',
    },
    {
        n: 2,
        name: 'LGD-4033',
        code: 'Ligandrol',
        color: '#60A5FA',
        level: 2,
        action: 'Alta',
        actionNote: 'Forte anabolismo comparável a doses leves de EAA.',
        clinical: 'Distrofia muscular e osteoporose severa.',
        sideEffect: 'Supressão total da produção endógena de testosterona (Crash HPG) em testes de apenas 5 mg.',
        tag: 'hpg',
    },
    {
        n: 3,
        name: 'RAD-140',
        code: 'Testolone',
        color: '#3B82F6',
        level: 3,
        action: 'Muito Alta',
        actionNote: 'Potência neurotrópica e androgênica forte.',
        clinical: 'TRT experimental e Câncer de Mama Receptor+.',
        sideEffect: 'Hepatotoxicidade massiva severa (DILI de origem biliar colestática).',
        tag: 'figado',
    },
];

export const TAG_LABEL: Record<SideEffectTag, string> = {
    lipidico: 'perfil lipídico',
    hpg: 'eixo HPG',
    figado: 'fígado',
};
