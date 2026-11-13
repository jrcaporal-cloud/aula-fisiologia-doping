/**
 * Paleta semântica única da aula. Regra de ouro:
 * - a cor do ATO só aparece na casca (régua do título, ponto da seção, barra de progresso, cartão ativo da visão geral, foco);
 * - a cor de uma SUBSTÂNCIA nunca muda de slide;
 * - cada PERSONAGEM/CASO tem uma cor só, em todos os slides em que aparece;
 * - vermelho (#E11D48) = risco, dano, morte (e a capa/Ato I); cinza neutro = ressalva metodológica.
 * Exceção mantida: semáforo/alerta do mundo real continua amarelo/âmbar.
 */

/** Cor de cada ato (chave = sectionName do JSON, depois de limpar espaços). */
export const ACT_COLORS: Readonly<Record<string, string>> = {
    'Ato I · Abertura': '#E11D48',
    'Ato II · Músculo e hormônios': '#60A5FA',
    'Ato II · Peptídeos': '#A78BFA',
    'Ato III · Sangue e metabolismo': '#FB7185',
    'Ato IV · Detecção': '#22D3EE',
    'Ato V · Clínica e ética': '#F59E0B',
};

export const DEFAULT_ACT_COLOR = '#E11D48';

export const actColor = (section: string): string => ACT_COLORS[section] ?? DEFAULT_ACT_COLOR;

/** Substâncias e conceitos (dentro das cenas). */
export const SUBSTANCE = {
    /** EAA / testosterona / derivados. */
    eaa: '#60A5FA',
    /** SARMs (modulador seletivo do AR). */
    sarm: '#93C5FD',
    /** GH / IGF-1. */
    gh: '#34D399',
    insulin: '#22D3EE',
    /** EPO, transfusão, sangue. */
    blood: '#FB7185',
    /** Beta-2 agonistas e PPARδ (GW1516). */
    beta2: '#A855F7',
    /** Peptídeos (secretagogos, BPC-157, TB-500…). */
    peptide: '#C4B5FD',
    /** Permitido / dentro da faixa / evidência sólida (nunca verde: daltonismo). */
    allowed: '#38BDF8',
    /** Risco, dano, morte — exclusivo. */
    risk: '#E11D48',
} as const;

/** Personagens/casos: a mesma cor no prontuário, no selo, nas abas e nos ecos. */
export const CASE_COLORS = {
    powerlifter: '#60A5FA',
    cyclist: '#FB7185',
    fighter: '#FBBF24',
    longevity: '#C4B5FD',
    essendon: '#A78BFA',
} as const;

/** Ressalva metodológica ("modelo ilustrativo", "esquema", "sem escala"): neutra, nunca cor de substância. */
export const CAUTION = {
    text: '#D1D5DB',
    border: 'rgba(255,255,255,0.22)',
    bg: 'rgba(255,255,255,0.04)',
} as const;

/** Texto secundário legível (no lugar de opacity/gray-500/600 sobre o fundo escuro). */
export const MUTED_TEXT = '#9CA3AF';

/** Fundo atrás de rótulo que precisa ficar sobre arte (traço, curva, borda). */
export const LABEL_BACKDROP = 'rgba(5,5,16,0.82)';
