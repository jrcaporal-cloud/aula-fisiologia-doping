/**
 * Conteúdo do "Mapa do Doping de Elite" (slide 6). Os textos das células são os da tabela original
 * (ComparisonTable), verbatim. Única troca: "Transfusão Auto." → "Transfusão Autóloga", nome que a
 * aula já usa no título do slide 21 ("Transfusão Autóloga Homóloga").
 */

export type SystemId = 'androgenico' | 'oxigenio' | 'metabolico';
export type LaneId = 'detectavel' | 'quase' | 'indetectavel';
export type DrugIcon = 'steroid' | 'target' | 'droplets' | 'bag' | 'growth' | 'syringe';

export interface SystemInfo {
    id: SystemId;
    label: string;
    color: string;
}

export interface LaneInfo {
    id: LaneId;
    label: string;
    /** Resposta da coluna "Indetectável?" que define a faixa. */
    answer: string;
    color: string;
}

export interface Drug {
    id: string;
    name: string;
    action: string;
    effect: string;
    magnitude: string;
    /** Valor verbatim da coluna "Indetectável?". */
    hidden: string;
    system: SystemId;
    lane: LaneId;
    icon: DrugIcon;
    /** Texto "Oculto/Colaterais" do detalhe expansível da tabela original. */
    detail: string;
}

export const SYSTEMS: Record<SystemId, SystemInfo> = {
    androgenico: { id: 'androgenico', label: 'Eixo androgênico', color: '#60A5FA' },
    oxigenio: { id: 'oxigenio', label: 'Transporte de O₂', color: '#F472B6' },
    metabolico: { id: 'metabolico', label: 'Metabólico', color: '#A855F7' },
};

export const SYSTEM_ORDER: SystemId[] = ['androgenico', 'oxigenio', 'metabolico'];

export const LANES: Record<LaneId, LaneInfo> = {
    detectavel: { id: 'detectavel', label: 'Detectável', answer: 'Não', color: '#10B981' },
    quase: { id: 'quase', label: 'Quase', answer: 'Quase', color: '#F59E0B' },
    indetectavel: { id: 'indetectavel', label: 'Indetectável', answer: 'Sim', color: '#E11D48' },
};

export const LANE_ORDER: LaneId[] = ['detectavel', 'quase', 'indetectavel'];

export const UGT_NOTE = '* Exceto em casos de deleção do gene UGT2B17.';

export const DRUGS: Drug[] = [
    {
        id: 'eaa', name: 'EAA (Testo)', action: 'Receptor Androgênico', effect: 'Massa/Força', magnitude: '+10-20% força',
        hidden: 'Não*', system: 'androgenico', lane: 'detectavel', icon: 'steroid',
        detail: 'Supressão do Eixo HPG obrigatória, hipertrofia ventricular esquerda (cardiopatia) irreversível, e dislipidemia severa (redução drástica do HDL bom). O exame antidoping tradicional utiliza a relação T/E para flagrar o composto exógeno.',
    },
    {
        id: 'epo', name: 'rhEPO', action: 'Via JAK/STAT', effect: 'Eritrócitos / VO₂máx', magnitude: '+3-7% VO₂máx',
        hidden: 'Não', system: 'oxigenio', lane: 'detectavel', icon: 'droplets',
        detail: 'Aumenta massivamente o hematócrito (volume de glóbulos vermelhos). Risco letal de hiperviscosidade sanguínea (sangue de lodo), predispondo a tromboses e paradas cardíacas noturnas. Foi o pesadelo do ciclismo nos anos 90.',
    },
    {
        id: 'gh', name: 'GH / IGF-1', action: 'Via mTOR', effect: 'Massa / Lipólise', magnitude: 'Sinergia Alta',
        hidden: 'Quase', system: 'metabolico', lane: 'quase', icon: 'growth',
        detail: "Potencia a síntese colagênica e óssea, reduzindo a gordura corporal. Uso abusivo gera 'Palumboísmo' (crescimento das vísceras/alargamento de extremidades) e resistência insulínica maciça. É dificílimo flagrar o GH recombinante por sua meia-vida em plasma de meros ~20 minutos.",
    },
    {
        id: 'insulina', name: 'Insulina', action: 'Receptor IR', effect: 'Anabolismo Máximo', magnitude: '+5-8kg (Stack)',
        hidden: 'Sim', system: 'metabolico', lane: 'indetectavel', icon: 'syringe',
        detail: "O hormônio mais mortífero do esporte. Como é um peptídeo natural sem limite superior definido pela WADA, é clinicamente impossível punir um atleta por 'uso de Insulina'. Um erro na dosagem causa coma hipoglicêmico cerebral letal.",
    },
    {
        id: 'transfusao', name: 'Transfusão Autóloga', action: 'Expansão Direta', effect: 'VO₂máx / Endurance', magnitude: '+3-5% VO₂máx',
        hidden: 'Sim', system: 'oxigenio', lane: 'indetectavel', icon: 'bag',
        detail: "O próprio sangue reinfundido. O Calcanhar de Aquiles do Passaporte Biológico. O atleta retira sua bolsa de sangue num dia 'alto' em montanha, guarda e a devolve ao corpo um dia antes da prova de endurance. Pode causar sobrecarga de ferro ou choque hemolítico por erro de armazenagem.",
    },
    {
        id: 'sarms', name: 'SARMs', action: 'AR (Seletivo)', effect: 'Massa', magnitude: 'Moderada',
        hidden: 'Não', system: 'androgenico', lane: 'detectavel', icon: 'target',
        detail: 'Prometem ação anabólica limpa bloqueada na próstata (Ostarina, RAD-140), mas a realidade empírica demonstra lesão biliar/hepática profunda (DILI) e supressão severa do eixo testicular, sem oferecer as janelas monstruosas de hipertrofia dos EAAs. Cai muito em doping cruzado na suplementação.',
    },
];

/** Linha de cada fármaco dentro da coluna, por modo. */
export const SYSTEM_ROW: Record<string, number> = { eaa: 0, sarms: 1, epo: 0, transfusao: 1, gh: 0, insulina: 1 };
/** Na faixa "Detectável" o EAA fica embaixo, ao lado da nota do UGT2B17. */
export const LANE_ROW: Record<string, number> = { epo: 0, sarms: 1, eaa: 2, gh: 0, insulina: 0, transfusao: 1 };
