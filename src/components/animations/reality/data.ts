/** Conteúdo do slide "O Dado que Muda o Enquadramento" — textos mantidos como na aula. */

export type PanelId = 'wada' | 'real';

export interface PanelData {
    id: PanelId;
    pct: number;
    title: string;
    subtitle: string;
    color: string;
    glow: string;
    question: string;
    bullets: readonly string[];
}

export const COLORS = {
    amber: '#F59E0B',
    amberSoft: '#FCD34D',
    blue: '#60A5FA',
    blueDeep: '#3b82f6',
    red: '#E11D48',
    redSoft: '#FDA4AF',
    neutral: 'rgba(148,163,184,0.30)',
} as const;

export const WADA: PanelData = {
    id: 'wada',
    pct: 2,
    title: 'Detectado pela WADA',
    subtitle: 'Dados Oficiais Abertos',
    color: COLORS.blue,
    glow: 'rgba(59,130,246,0.35)',
    question: 'Como funcionam os testes oficiais?',
    bullets: [
        'Dos ~300.000 testes/ano realizados pela WADA, apenas 1-2% resultam em AAF (Achados Analíticos Adversos).',
        'Isso equivale a cerca de 4.000 atletas pegos por ano em todo o mundo esportivo.',
        'Muitos destes casos positivos são de substâncias sociais/recreativas, não ergogênicas (doping intencional de performance).',
        'O teste é altamente específico (poucos falsos positivos), mas possui baixa sensibilidade real nas janelas off-season.',
    ],
};

export const REAL: PanelData = {
    id: 'real',
    pct: 43,
    title: 'Prevalência Real',
    subtitle: 'Metodologia Científica Anônima',
    color: COLORS.red,
    glow: 'rgba(225,29,72,0.35)',
    question: 'Qual é a verdadeira extensão?',
    bullets: [
        'Pesquisa anônima de Ulrich et al. (2018) em eventos da IAAF usando a técnica do "Randomized Response Model".',
        '43,6% dos atletas de elite admitiram anonimamente uso de substâncias proibidas nos últimos 12 meses.',
        'Em Jogos Pan-Árabes e Pan-Americanos o número variou de 30% a 57% dependendo da modalidade avaliada.',
        'Isso indica que o sistema antidoping atual captura apenas uma fração mínima (aprox. 1 em cada 20) dos usuários crônicos.',
    ],
};

export const PANELS: readonly PanelData[] = [WADA, REAL];

export const STEP_LABELS = ['Palpite da turma', 'O que o antidoping detecta', 'O que os atletas admitem'] as const;

/** Passo em que cada painel é revelado. */
export const REVEAL_STEP: Record<PanelId, number> = { wada: 1, real: 2 };

/** Intervalo entre atletas na onda vermelha (ms). */
export const WAVE_MS = 24;
/** A onda dura ~1 s; o que depende dela (contorno, hachura, abismo, número) acompanha. */
export const WAVE_TOTAL_S = ((REAL.pct - WADA.pct) * WAVE_MS) / 1000;
