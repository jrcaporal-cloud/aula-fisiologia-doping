/**
 * Textos do slide "Beta-2 Agonistas: A Zona Cinzenta Clínica" (parsedPresentation.json, id 19).
 * Frases e números copiados do slide. Única exceção, marcada no componente: a frase sobre o
 * GW1516 ter sido abandonado na Fase II vem do slide "Pilares" (slidesData.ts, "O caso GW501516").
 */

export const C = {
    red: '#E11D48',
    rose: '#FB7185',
    blue: '#60A5FA',
    green: '#10B981',
    /** Via inalatória: azul (e não verde) para não competir com âmbar/vermelho em daltonismo. */
    inhaled: '#60A5FA',
    amber: '#F59E0B',
    purple: '#A855F7',
    cyan: '#22D3EE',
} as const;

export interface StepInfo {
    readonly label: string;
    readonly title: string;
    readonly caption: string;
    readonly color: string;
}

export const STEPS: readonly StepInfo[] = [
    { label: 'Receptor', title: 'Dois tecidos, um receptor', caption: 'β2 no brônquio e no músculo esquelético', color: C.cyan },
    { label: 'Inalatório', title: 'Dose inalatória: medicamento para asma', caption: 'limiar WADA 1.600 µg/24 h', color: C.inhaled },
    { label: 'Sistêmico', title: 'Dose sistêmica: a zona cinzenta', caption: 'via oral >8 mg', color: C.amber },
    { label: 'Clembuterol', title: 'Clembuterol: meia-vida longa, taquifilaxia', caption: 'down-regulation em 14-21 dias', color: C.rose },
    { label: 'GW1516', title: 'Cardarine (GW1516): não é beta-2', caption: 'agonista PPARδ → PGC-1α', color: C.purple },
];

export interface Para {
    readonly lead?: string;
    readonly text: string;
}

export interface StepText {
    readonly kicker: string;
    readonly title: string;
    readonly color: string;
    readonly paras: readonly Para[];
}

export const TEXTS: readonly StepText[] = [
    {
        kicker: 'Receptores β2 adrenérgicos',
        title: 'Brônquio E músculo esquelético',
        color: C.cyan,
        paras: [
            { text: 'Receptores beta-2 adrenérgicos existem no músculo liso bronquial E no músculo esquelético.' },
            { text: 'O que decide o efeito é a via e a dose.' },
        ],
    },
    {
        kicker: 'Salbutamol / Formoterol',
        title: 'Via PKA/cAMP → broncodilatação',
        color: C.inhaled,
        paras: [
            { lead: 'Via PKA/cAMP:', text: 'ativação da adenilato ciclase converte ATP em cAMP, ativando PKA que induz broncodilatação.' },
            { lead: 'Limiar WADA:', text: '1.600 µg/24 h (inalatório).' },
        ],
    },
    {
        kicker: 'Doses supraterapêuticas sistêmicas',
        title: 'Hipertrofia e oxidação de gordura',
        color: C.amber,
        paras: [
            { text: 'Doses supraterapêuticas sistêmicas (não inalatórias) ativam hipertrofia e oxidação de gordura.' },
            { lead: 'PKA', text: 'fosforila a lipase hormônio-sensível (HSL) para lipólise.' },
            { lead: 'Acima (via oral >8 mg),', text: 'ativa a via PI3K/Akt para hipertrofia, aumentando a força isométrica pré-competição.' },
        ],
    },
    {
        kicker: 'Clembuterol',
        title: 'Alta afinidade β2 sistêmica',
        color: C.rose,
        paras: [
            { lead: 'Meia-vida:', text: '~35 h.' },
            { lead: 'Down-regulation', text: 'de receptores ocorre em 14-21 dias (taquifilaxia).' },
        ],
    },
    {
        kicker: 'Cardarine (GW1516)',
        title: 'Não é Beta-2, é agonista PPARδ',
        color: C.purple,
        paras: [
            { text: 'Reprograma a expressão genética (PGC-1α) transformando fibras de contração rápida em lentas oxidativas.' },
        ],
    },
];

export const CARCINOGEN = 'Carcinogênico.';
/** Slide "Pilares" (slidesData.ts, bloco "O caso GW501516 (Cardarine)"). */
export const CARCINOGEN_NOTE = 'Abandonada na Fase II após causar câncer multiórgão em ratos em doses prolongadas.';

export const DOSE = {
    inhaledLimit: '1.600 µg/24 h',
    oral: '>8 mg',
} as const;

export const HALF_LIFE_H = 35;
export const DOWNREG_DAYS = 14;
