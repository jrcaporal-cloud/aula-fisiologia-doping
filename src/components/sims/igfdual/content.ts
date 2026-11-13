/**
 * Textos do slide "IGF-1 Local vs Sistêmico" (parsedPresentation.json, id 36), sem mudança de conteúdo.
 * Exceções citadas: a sigla EAA = "Esteroides Androgênicos Anabolizantes" vem do slide "A Base do Doping Moderno".
 * No cartão original há a palavra "hiporidade" (erro de digitação); aqui o trecho fica só "síntese proteica muscular".
 */
import { SUBSTANCE } from '../../../lib/palette';

/**
 * Cada substância na cor que ela tem na aula inteira (`src/lib/palette.ts`):
 * EAA azul, GH/IGF-1 verde (o sistêmico no tom claro, o MGF local num verde-azulado vizinho),
 * insulina ciano, EPO rosa. Vermelho só para risco (o colateral); o fígado, órgão, fica no
 * vermelho-tecido mais claro — o mesmo do eixo GH (s13).
 */
export const COLORS = {
    igf: '#6EE7B7',
    mgf: '#2DD4BF',
    liver: '#F87171',
    liverSoft: '#9F1239',
    fat: '#F59E0B',
    satellite: '#A7F3D0',
    nucleus: '#C4B5FD',
    eaa: SUBSTANCE.eaa,
    ghigf: SUBSTANCE.gh,
    insulin: SUBSTANCE.insulin,
    epo: SUBSTANCE.blood,
    glucose: SUBSTANCE.insulin,
    warn: SUBSTANCE.risk,
} as const;

export interface StepInfo {
    readonly label: string;
    readonly title: string;
    readonly caption: string;
    readonly color: string;
}

export const STEPS: readonly StepInfo[] = [
    { label: 'Sistêmico', title: 'IGF-1 hepático (sistêmico)', caption: 'O fígado produz ~70% do IGF-1 circulante: o sangue leva a todas as células-alvo.', color: COLORS.igf },
    { label: 'Local (MGF)', title: 'Mechano Growth Factor (MGF — IGF-1Ec)', caption: 'O músculo sob tensão produz MGF ali mesmo, onde houve dano mecânico.', color: COLORS.mgf },
    { label: 'Vantagem dupla', title: 'A vantagem dupla', caption: 'Sistêmico em todo o organismo + local exatamente na fibra estimulada.', color: '#E5E7EB' },
    { label: 'Sinergia', title: 'Sinergia total com EAA + insulina', caption: 'Cada droga do stack atua num ponto diferente da mesma fibra.', color: COLORS.eaa },
    { label: 'Colateral', title: 'Resistência insulínica como colateral', caption: 'O GH é diabetogênico: com insulina exógena, um equilíbrio de altíssimo risco.', color: COLORS.warn },
];

export const TEXT = {
    liver: 'O fígado produz ~70% do IGF-1 circulante.',
    cascade: 'Esse IGF-1 sistêmico liga-se ao receptor IGF-1R → ativa cascata PI3K→Akt→mTORC1, maximizando síntese proteica em todas as células-alvo simultaneamente.',
    systemicResult: 'Resultado: síntese proteica muscular, lipólise acelerada e mobilização de AGL em todo o organismo.',
    mgf: 'O músculo sob tensão mecânica produz o variante de splicing MGF (Mechano Growth Factor) — derivado local do gene IGF-1.',
    satellite: 'O MGF ativa e prolifera células satélite específicas da fibra estimulada, produzindo novos mionúcleos exatamente onde houve dano mecânico.',
    ghBoost: 'Combinado com GH exógeno, a hiperplasia localizada é acelerada em 3–5×.',
    diabetogenic: 'O GH, paradoxalmente, é diabetogênico: estimula neoglicogênese hepática e atenua sinalização de insulina em adipócitos.',
    stackRisk: 'Atletas usando GH + Insulina exógena em stack navegam um equilíbrio metabólico de altíssimo risco.',
    documented: 'Hipoglicemia noturna severa e resistência insulínica crônica são complicações documentadas em fisiculturistas profissionais da era 1990–2010.',
} as const;

export type SynergyId = 'eaa' | 'ghigf' | 'insulin' | 'epo';

export interface SynergyItem {
    readonly id: SynergyId;
    readonly name: string;
    readonly color: string;
    readonly role: string;
    readonly target: string;
}

/** Os quatro papéis do cartão "Sinergia Total com EAA + Insulina", verbatim. */
export const SYNERGY: readonly SynergyItem[] = [
    { id: 'eaa', name: 'EAA', color: COLORS.eaa, role: 'fornece o arcabouço androgênico (RA) para transcrição gênica pró-anabólica', target: 'núcleo · RA' },
    { id: 'ghigf', name: 'GH/IGF-1', color: COLORS.ghigf, role: 'multiplica a sinalização via mTOR e produz hiperplasia celular', target: 'mTOR' },
    { id: 'insulin', name: 'Insulina', color: COLORS.insulin, role: 'blinda o catabolismo (inibe Ubiquitina-Proteassoma) e satura GLUT4', target: 'proteassoma · GLUT4' },
    { id: 'epo', name: 'EPO', color: COLORS.epo, role: 'amplia o transporte de O₂ para suportar volumes de treino absurdos', target: 'hemácias · O₂' },
];
