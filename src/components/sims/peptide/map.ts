import { Activity, Bandage, Eye, Mars, Sprout, type LucideIcon } from 'lucide-react';

/**
 * Slide "O mapa dos peptídeos": cinco famílias, cada uma com classe da WADA, evidência e uso médico legítimo.
 * Fontes: Lista Proibida WADA 2026 (S0, S2, S4.4) e Programa de Monitoramento 2026; Nass et al., Ann Intern Med 2008
 * (ibutamoren); FDA, "Certain bulk drug substances… significant safety risks" (atualizado em 04/2026); revisão de BPC-157,
 * Pharmaceutics 2026; Vecchiato et al. 2024 (hCG e câncer de testículo em controles antidoping).
 */

export type FamilyTone = 'red' | 'amber' | 'violet' | 'sky' | 'slate';

export interface PeptideFamily {
    id: string;
    name: string;
    /** Selo curto do cartão; o completo aparece no detalhe. */
    tag: string;
    icon: LucideIcon;
    tone: FamilyTone;
    wada: string;
    examples: string;
    action: string;
    evidence: string;
    medical: string;
}

export const FAMILIES: readonly PeptideFamily[] = [
    {
        id: 'secretagogos',
        name: 'Secretagogos de GH',
        tag: 'S2.2 · sempre',
        icon: Activity,
        tone: 'amber',
        wada: 'S2.2 · proibidos sempre',
        examples: 'Análogos de GHRH (sermorelina, tesamorelina, CJC-1295) e miméticos da grelina (GHRP-2, GHRP-6, hexarelina, ipamorelina). O ibutamoren (MK-677) é oral, não é peptídeo e está na mesma classe.',
        action: 'Estimulam a hipófise a liberar o próprio GH, em pulsos; o fígado responde com IGF-1.',
        evidence: 'Sobem GH e IGF-1. Em idosos saudáveis, o ibutamoren aumentou a massa magra (+1,1 kg em 1 ano) sem mudar força nem função. Em atletas, não há ensaio.',
        medical: 'Tesamorelina (lipodistrofia no HIV) e macimorelina (teste diagnóstico de deficiência de GH no adulto).',
    },
    {
        id: 'fatores',
        name: 'Fatores de crescimento',
        tag: 'S2.3 · sempre',
        icon: Sprout,
        tone: 'violet',
        wada: 'S2.3 · proibidos sempre',
        examples: 'IGF-1 e análogos, MGF, timosina β4 e o fragmento TB-500, VEGF, FGF, HGF, PDGF.',
        action: 'Agem no próprio tecido: síntese proteica, ativação de células satélite, formação de vasos. A classe cobre qualquer fator que mexa em músculo, tendão, ligamento ou vascularização.',
        evidence: 'TB-500: a FDA não identificou dados de exposição em humanos. A promessa de "recuperação" vem de modelos animais.',
        medical: 'Mecasermina (IGF-1 recombinante) na deficiência primária grave de IGF-1, em crianças.',
    },
    {
        id: 'bpc',
        name: 'BPC-157',
        tag: 'S0 · sempre',
        icon: Bandage,
        tone: 'red',
        wada: 'S0 · não aprovado · proibido sempre',
        examples: 'Cadeia de 15 aminoácidos derivada de uma proteína do suco gástrico. Vendido para tendão, músculo e intestino.',
        action: 'Em animais: angiogênese e cicatrização de tendão, músculo e mucosa. O mecanismo em humanos não foi estabelecido.',
        evidence: 'Mais de 30 anos de estudos em animais. Em humanos, menos de 30 pessoas em 3 estudos-piloto sem grupo controle. Nenhum ensaio de fase II concluído.',
        medical: 'Nenhum. Não há formulação aprovada para uso humano, e no Brasil não é regularizado (Anvisa, 2026).',
    },
    {
        id: 'gonadal',
        name: 'Eixo gonadal',
        tag: 'S2.2.1 · homens',
        icon: Mars,
        tone: 'sky',
        wada: 'S2.2.1 · proibidos em homens',
        examples: 'hCG, LH e análogos de GnRH (buserelina, gosserelina, leuprorrelina, triptorelina).',
        action: 'Estimulam o testículo a produzir testosterona. Por isso a proibição vale só para homens.',
        evidence: 'O alvo é o eixo suprimido pelos esteroides (slide da TPC), não um ganho próprio. E o hCG tem uma pérola clínica: veja o próximo passo.',
        medical: 'hCG na infertilidade e no hipogonadismo hipogonadotrófico; análogos de GnRH no câncer de próstata e na endometriose.',
    },
    {
        id: 'glp1',
        name: 'GLP-1',
        tag: 'permitido',
        icon: Eye,
        tone: 'slate',
        wada: 'Não proibido · em monitoramento',
        examples: 'Semaglutida e outros agonistas de GLP-1; tirzepatida (GIP/GLP-1).',
        action: 'Saciedade, esvaziamento gástrico mais lento e secreção de insulina dependente de glicose.',
        evidence: 'Sem evidência de efeito ergogênico direto. A WADA acompanha o uso: semaglutida no Programa de Monitoramento desde 2024, tirzepatida desde 2026. A preocupação é "fazer peso" e perder massa magra.',
        medical: 'Diabetes tipo 2 e obesidade. É o peptídeo que mais chega ao consultório.',
    },
];

/** Peptídeos que a aula já mostrou em outros slides. */
export const ALREADY_SEEN: readonly { name: string; wada: string; where: string }[] = [
    { name: 'GH', wada: 'S2.2', where: 'eixo GH-IGF-1' },
    { name: 'Insulina', wada: 'S4.4', where: 'Ato III' },
    { name: 'EPO', wada: 'S2.1', where: 'Ato III' },
];

export const TONE_STYLES: Record<FamilyTone, { border: string; text: string; bg: string; badge: string }> = {
    red: { border: 'rgba(225,29,72,0.75)', text: '#FDA4AF', bg: 'rgba(225,29,72,0.14)', badge: 'bg-brand-red/20 text-rose-200 border-brand-red/50' },
    amber: { border: 'rgba(245,158,11,0.75)', text: '#FDE68A', bg: 'rgba(245,158,11,0.12)', badge: 'bg-amber-400/15 text-amber-200 border-amber-300/40' },
    violet: { border: 'rgba(167,139,250,0.75)', text: '#DDD6FE', bg: 'rgba(167,139,250,0.13)', badge: 'bg-violet-400/15 text-violet-200 border-violet-300/40' },
    sky: { border: 'rgba(56,189,248,0.75)', text: '#BAE6FD', bg: 'rgba(56,189,248,0.12)', badge: 'bg-sky-400/15 text-sky-200 border-sky-300/40' },
    slate: { border: 'rgba(203,213,225,0.6)', text: '#E2E8F0', bg: 'rgba(203,213,225,0.08)', badge: 'bg-white/10 text-gray-100 border-white/25' },
};
