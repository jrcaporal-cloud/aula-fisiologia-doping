/** Conteúdo do slide "O Abismo entre Ciência e Regulação" — verbatim do componente original. */

export interface Study {
    readonly name: string;
    readonly n: string;
    /** % de vantagem residual após TRT (0 = sem diferença). */
    readonly adv: number;
    readonly years: string;
    readonly color: string;
    readonly finding: string;
    readonly limit: string;
}

export const STUDIES: readonly Study[] = [
    { name: 'Hilton & Lundberg 2021', n: 'Meta-análise', adv: 12, years: '2-3', color: '#E11D48', finding: 'Vantagem residual de 10-14% em força muscular após 2-3 anos de TRT feminizante.', limit: 'Maioria dos estudos com amostras pequenas (N<30). Atletas recreacionais, não de elite.' },
    { name: 'Roberts et al. 2021', n: 'N=29 trans', adv: 0, years: '4+', color: '#10B981', finding: 'Após 4 anos de TRT, nenhuma diferença estatisticamente significativa em tempos de corrida vs. cis femininas.', limit: 'Militares da Força Aérea dos EUA — não atletas de elite. N muito pequeno.' },
    { name: 'Harper et al. 2021', n: 'N≈50', adv: 6, years: '2', color: '#F59E0B', finding: 'Após 2 anos de TRT, tempo de corrida reduziu ~12%. Força de preensão: -17%. Vantagem residual ainda presente.', limit: 'Militares britânicos. Sem controle pelo nível atlético pré-transição.' },
    { name: 'Handelsman 2017', n: 'Revisão', adv: 10, years: '1', color: '#A855F7', finding: 'Gap de força entre sexos: 10-12% em velocidade, 20-30% em força. Maior parte da diferença persiste após 12 meses de TRT.', limit: 'Baseado em dados fisiológicos gerais, não em estudos longitudinais de atletas trans.' },
];

export const GAPS: readonly { sport: string; gap: number }[] = [
    { sport: 'Corrida 100m', gap: 10 },
    { sport: 'Natação 100m', gap: 7 },
    { sport: 'Levantamento de peso', gap: 25 },
    { sport: 'Salto em distância', gap: 14 },
    { sport: 'Ciclismo (FTP)', gap: 10 },
    { sport: 'Arremesso de peso', gap: 30 },
];

export const GAPS_CAPTION = 'Gap médio de performance entre atletas masculinos e femininos de elite (antes de qualquer TRT)';
export const GAPS_NOTE = 'A TRT feminizante reduz uma parte desse gap — mas quanto, por quanto tempo, e a que ponto é "suficiente" para competição igualitária? Essa é a pergunta central sem resposta definitiva na literatura.';

export const KNOWN: readonly { item: string; confident: boolean }[] = [
    { item: 'T elevada durante puberdade cria vantagens estruturais', confident: true },
    { item: 'TRT feminizante por 2+ anos reduz força muscular significativamente', confident: true },
    { item: 'Vantagem residual de força de 10-14% persiste após 2-3 anos (Hilton 2021)', confident: true },
    { item: 'Gap desaparece completamente após 4 anos (Roberts 2021)', confident: false },
    { item: 'Trans femininas têm desempenho superior a cis femininas em elite', confident: false },
    { item: 'Períodos maiores de TRT eliminam totalmente a vantagem', confident: false },
    { item: 'Efeitos da TRT em atletas de elite são equivalentes aos de recreacionais', confident: false },
];

export const KNOWN_CAPTION = 'O que a literatura científica atual consegue ou não afirmar com confiança';
export const SOCIETIES = {
    title: 'Posição das Sociedades Médicas',
    who: 'Endocrine Society, WPATH e Pediatric Endocrine Society',
    text: ' recomendam inclusão de atletas trans com monitoramento caso a caso — reconhecendo que a ciência ainda não permite regras universais baseadas estritamente em evidência. O debate permanece mais ético e político do que puramente científico.',
} as const;

export const GAP_STEP = STUDIES.length;
export const KNOWN_STEP = STUDIES.length + 1;

export const SCIENCE_STEPS = [
    ...STUDIES.map(s => `Estudos comparados · ${s.name}`),
    'Diferença por modalidade',
    'O que sabemos',
] as const;

export const yearsLabel = (y: string): string => `${y} ${y === '1' ? 'ano' : 'anos'} de TRT`;
