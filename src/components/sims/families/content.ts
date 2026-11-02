/**
 * Textos do slide "As Famílias de Esteroides" (parsedPresentation.json, id 7).
 * Tudo é transcrição literal dos três cartões originais; nada foi acrescentado.
 */
export type FamilyId = 'testo' | 'dht' | 'nor';

export interface Family {
    readonly id: FamilyId;
    readonly n: 1 | 2 | 3;
    readonly title: string;
    readonly color: string;
    /** Parágrafo de abertura do cartão, literal. */
    readonly lead: string;
    /** Trecho que o cartão original destacava em negrito. */
    readonly leadStrong?: string;
    /** Fragmento literal que resume a assinatura estrutural. */
    readonly tag: string;
    readonly principais: readonly string[];
    /** Complemento literal que aparece depois de "Trembolona". */
    readonly principaisNota?: string;
    readonly foco: string;
    /** Primeira frase do Foco Clínico, literal. */
    readonly focoCurto: string;
}

export const FAMILIES: readonly Family[] = [
    {
        id: 'testo',
        n: 1,
        title: 'Derivados da Testosterona',
        color: '#60A5FA',
        lead: 'O molde original humano. Sofrem aromatização ampla (conversão enzimática em estradiol) e redução via 5α-redutase (conversão orgânica em DHT).',
        tag: 'Sofrem aromatização ampla',
        principais: ['Cipionato', 'Enantato', 'Propionato', 'Dianabol (Metandrostenolona)', 'Equipoise (Boldenona)'],
        foco: 'Base mandatória para TRT ou ciclos (bulk). Risco altíssimo de retenção hídrica aguda subcutânea, pressão alta e ginecomastia (por conversão em E2).',
        focoCurto: 'Base mandatória para TRT ou ciclos (bulk).',
    },
    {
        id: 'dht',
        n: 2,
        title: 'Derivados do DHT',
        color: '#A855F7',
        lead: 'Testosterona já reduzida ao seu metabólito mais potente. Moléculas quimicamente rígidas que não sofrem aromatização e nunca viram estrogênio.',
        leadStrong: 'não sofrem aromatização',
        tag: 'Não sofrem aromatização',
        principais: ['Winstrol (Estanozolol)', 'Oxandrolona', 'Hemogenin (Oximetolona)', 'Masteron', 'Primobolan'],
        foco: 'Conhecidas como “drogas de corte/finalização”. Causam visual muscular hiperseco. Severamente deletérias para queda de cabelo e lipídios (abismo no HDL bom).',
        focoCurto: 'Conhecidas como “drogas de corte/finalização”.',
    },
    {
        id: 'nor',
        n: 3,
        title: 'Derivados 19-Nortestosterona',
        color: '#10B981',
        lead: 'Sem o carbono na posição 19. Essas moléculas ligam-se ao Receptor Androgênico massivamente, somado à mortal atividade Progestínica periférica.',
        leadStrong: 'atividade Progestínica',
        tag: 'Sem o carbono na posição 19',
        principais: ['Deca-Durabolin (Nandrolona)', 'Trembolona'],
        principaisNota: 'o rei absoluto dos EAAs sintéticos de criação bovina',
        foco: 'Hipertrofia monstruosa e força bruta. Efeito rebote cruel: toxicidade neurológica agressiva, supressão implacável e permanente da libido por picos irreversíveis de prolactina no córtex.',
        focoCurto: 'Hipertrofia monstruosa e força bruta.',
    },
];

export const STEP_COUNT = 5;

/** Cor que marca, em todas as cenas, o ponto onde a molécula muda. */
export const ACCENT = '#F59E0B';
export const ROSE = '#FB7185';
export const ROOT_COLOR = '#E5E7EB';

export const STEP_TITLES: readonly string[] = [
    'Testosterona: o esqueleto de partida',
    `Família 1 · ${FAMILIES[0].title}`,
    `Família 2 · ${FAMILIES[1].title}`,
    `Família 3 · ${FAMILIES[2].title}`,
    'Comparação · as três famílias lado a lado',
];
