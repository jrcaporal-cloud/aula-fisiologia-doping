/**
 * Textos do slide "TPC e Moduladores Hormonais" (parsedPresentation.json, id 20).
 * Os três cartões entram VERBATIM (só o espaço em "150 mg/dia" foi normalizado).
 * Passo 0 usa o texto do eixo HPG suprimido do slide 7 (animations/eaaBase/content.ts, camada "Colaterais").
 * O efeito do IA sobre o eixo ("para retomar eixo HPG") vem do dossiê de Jon Jones (animations/AthleteDossier.tsx).
 */

export const C = {
    serm: '#A78BFA',
    ia: '#FBBF24',
    hcg: '#34D399',
    red: '#E11D48',
    redInk: '#FDA4AF',
    blue: '#60A5FA',
    cyan: '#22D3EE',
} as const;

export interface StepInfo {
    readonly label: string;
    readonly title: string;
    readonly caption: string;
    readonly color: string;
}

export const STEPS: readonly StepInfo[] = [
    { label: 'Pós-ciclo', title: 'Eixo HPG suprimido', caption: 'hipogonadismo pós-ciclo', color: C.redInk },
    { label: 'SERMs', title: 'SERMs cegam o freio do estradiol', caption: 'receptor de estrogênio no hipotálamo/hipófise', color: C.serm },
    { label: 'IA', title: 'Inibidores de aromatase derrubam o E2', caption: 'CYP19A1 bloqueada', color: C.ia },
    { label: 'hCG e rhFSH', title: 'hCG imita o LH direto no testículo', caption: 'receptores LHR nas células de Leydig', color: C.hcg },
    { label: 'Mapa', title: 'Onde cada classe age', caption: 'três pontos de entrada no eixo', color: '#E5E7EB' },
];

export interface ClassCard {
    readonly tag: string;
    readonly name: string;
    readonly text: string;
    readonly color: string;
}

export const SERM: ClassCard = {
    tag: 'SERMs',
    name: 'Tamoxifeno / Clomifeno (Antagonistas Genômicos)',
    text: 'Agem por competição estérica (domínio AF-2) bloqueando o receptor de estrogênio (ERα e ERβ) no hipotálamo/hipófise. Isso cega os quimiorreceptores ao feedback negativo do Estradiol (E2), forçando pulsações de GnRH (até 150 mg/dia nas primeiras semanas de crash).',
    color: C.serm,
};

export const IA: ClassCard = {
    tag: 'Inibidores de Aromatase (IA)',
    name: 'Anastrozol / Letrozol / Exemestano',
    text: 'Anastrozol (competitivo não esteroidal) e Exemestano (suicida esteroidal irreversível). Bloqueiam ativamente a enzima CYP19A1 (citocromo P450), derrubando severamente a aromatização periférica (E2 cai até 98%). Risco: Osteopenia vascular e disfunção endotelial.',
    color: C.ia,
};

export const HCG: ClassCard = {
    tag: 'hCG e rhFSH',
    name: 'Gonadotrofina Coriônica Humana e FSH Recombinante',
    text: 'Estrutura glicoproteica alfa idêntica ao LH humano. Liga-se aos receptores LHR nas células de Leydig induzindo ativação do cAMP/PKA mitocondrial via proteína StAR (Steroidogenic Acute Regulatory protein), mantendo o volume testicular sob forte supressão (uso intraciclo 250-500 UI 2x/sem).',
    color: C.hcg,
};

/** Passo 0 — slide 7 (eaaBase, camada "Colaterais") + subtítulo deste slide. */
export const SUPPRESSED = {
    tag: 'Hipogonadismo pós-ciclo',
    name: 'O eixo HPG desligado',
    paras: [
        'O eixo HPG (Hipotálamo–Hipófise–Gônadas) é suprimido por feedback negativo: T exógena → hipotálamo detecta T alta → para GnRH → Hipófise para LH/FSH → testículos param de produzir T e espermatozoides.',
        'Sem LH, células de Leydig atrofiam — produção endógena nula em semanas.',
    ],
    source: 'texto do slide 7 (Base dos EAA · colaterais)',
    goal: 'Farmacologia de recuperação para burlar o hipogonadismo pós-ciclo',
} as const;

export const NUMBERS = {
    sermDose: 'até 150 mg/dia',
    sermWhen: 'nas primeiras semanas de crash',
    e2Drop: 98,
    iaRisk: 'Osteopenia vascular e disfunção endotelial',
    hcgDose: '250-500 UI 2x/sem',
    hcgWhen: 'uso intraciclo',
} as const;

export const MAP_ROWS = [
    { tag: 'SERMs', site: 'receptor de estrogênio (ERα e ERβ) no hipotálamo/hipófise', color: C.serm },
    { tag: 'IA', site: 'enzima CYP19A1: aromatização periférica', color: C.ia },
    { tag: 'hCG', site: 'receptores LHR nas células de Leydig', color: C.hcg },
] as const;
