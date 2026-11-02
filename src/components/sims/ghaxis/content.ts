/**
 * Textos do slide "Eixo GH-IGF-1". Os três níveis e as nove seções vêm, sem mudança de
 * conteúdo, do componente antigo `animations/HPGAxis.tsx`. O "eixo natural" (passo 0)
 * usa afirmações dos slides 35 ("A Farmacocinética do GH Exógeno") e 36 ("IGF-1 Local vs
 * Sistêmico") de `data/parsedPresentation.json`.
 */

export type LevelId = 'hipotalamo' | 'hipofise' | 'figado';
export type SectionIcon = 'pill' | 'scope' | 'warn' | 'trend' | 'zap';

export interface Section {
    readonly label: string;
    readonly icon: SectionIcon;
    readonly content: string;
}

export interface Level {
    readonly id: LevelId;
    readonly n: 1 | 2 | 3;
    readonly title: string;
    readonly subtitle: string;
    readonly summary: string;
    readonly color: string;
    readonly soft: string;
    readonly sections: readonly [Section, Section, Section];
}

export const COLORS = {
    hipotalamo: '#60A5FA',
    hipofise: '#34D399',
    figado: '#F87171',
    igf: '#FB7185',
    exo: '#F59E0B',
    glucose: '#22D3EE',
    red: '#E11D48',
} as const;

export const LEVELS: readonly [Level, Level, Level] = [
    {
        id: 'hipotalamo',
        n: 1,
        title: 'Hipotálamo',
        subtitle: 'Peptídeos Secretagogos (GHRP)',
        summary: 'Estimulam a liberação pulsátil de GH da hipófise, simulando o sinal natural do organismo.',
        color: COLORS.hipotalamo,
        soft: 'rgba(96,165,250,0.14)',
        sections: [
            {
                label: 'Mecanismo',
                icon: 'pill',
                content: 'GHRP-2, GHRP-6 e Ipamorelina são peptídeos sintéticos que agonizam o receptor de Grelina (GHS-R1a) no hipotálamo e hipófise. Induzem pico de GH em 15–30 min. Janela de ação: ~60–90 min. Costumam ser combinados com GHRH (CJC-1295) para sinergismo de 4–10× no pico de GH.',
            },
            {
                label: 'Detecção',
                icon: 'scope',
                content: 'GHRP são indetectáveis pelos testes padrão de GH (isoeletrofocalização). A janela urinária é de 4–8h. O Passaporte Biológico pode sinalizar pelo pico de IGF-1 persistentemente elevado, mas a evidência é indireta.',
            },
            {
                label: 'Colaterais',
                icon: 'warn',
                content: 'Retenção hídrica, aumento do apetite (efeito grelina), elevação de prolactina e cortisol. Com uso crônico: acromegalia subclínica (mãos, pés, mandíbula). Resistência insulínica progressiva.',
            },
        ],
    },
    {
        id: 'hipofise',
        n: 2,
        title: 'Hipófise',
        subtitle: 'GH Recombinante (somatropina)',
        summary: 'Substitui ou supre o pulso endógeno de GH com molécula de 191 aminoácidos idêntica à humana.',
        color: COLORS.hipofise,
        soft: 'rgba(52,211,153,0.13)',
        sections: [
            {
                label: 'Farmacocinética',
                icon: 'pill',
                content: 'Meia-vida plasmática IV: ~15–20 min. SC: ~3–4h. Injeção às 23h → eliminado antes do controle matinal às 6h. O hGH endógeno e exógeno são molecularmente idênticos — o teste diferencial compara isoformas 20 kDa vs 22 kDa, detectável em janela <12h após uso.',
            },
            {
                label: 'Efeitos Anabólicos',
                icon: 'trend',
                content: 'Estimula IGF-1 hepático → ativa PI3K/Akt/mTOR → síntese proteica. Promove lipólise (mobilização de ácidos graxos livres). Mantém nitrogênio muscular positivo. Aumenta densidade mineral óssea e espessura dos tendões.',
            },
            {
                label: 'Risco: Acromegalia',
                icon: 'warn',
                content: 'Uso crônico em doses suprafisiológicas → hipertrofia progressiva de tecidos: mandíbula, arcadas supraorbitais, mãos, pés — Palumboísmo. Órgãos internos (coração, fígado, intestino) também hipertrofiam. Cardiomegalia documentada como causa de morte prematura em fisiculturistas.',
            },
        ],
    },
    {
        id: 'figado',
        n: 3,
        title: 'Fígado',
        subtitle: 'IGF-1 Exógeno (Mecasermina)',
        summary: 'Bypass completo do eixo GH. Ativa diretamente receptores IGF-1R sem passar pela hipófise.',
        color: COLORS.figado,
        soft: 'rgba(248,113,113,0.13)',
        sections: [
            {
                label: 'Mecanismo Direto',
                icon: 'pill',
                content: 'IGF-1 liga-se ao IGF-1R → autofosforilação → IRS-1 → PI3K/Akt/mTOR e RAS/MAPK. Resultado: síntese proteica máxima + inibição de apoptose celular. Meia-vida livre: ~10 min. Ligado a IGFBP-3: ~15 horas — biologicamente ativo por horas após injeção.',
            },
            {
                label: 'Combinação com Insulina',
                icon: 'zap',
                content: 'IGF-1 + Insulina = stack hipoglicêmico extremo. Ambos reduzem glicemia: IGF-1 via IGF-1R (similar à insulina), Insulina via GLUT4. A supressão combinada da glicose pode causar hipoglicemia fatal. Atletas monitoram glicemia capilar e mantêm dextrose disponível.',
            },
            {
                label: 'Colaterais Críticos',
                icon: 'warn',
                content: 'Hipoglicemia severa (principal causa de morte). Hipertrofia de órgãos internos. Possível proliferação de células pré-malignas (IGF-1 é mitogênico — estudos associam uso elevado a câncer de próstata e cólon). Edema e síndrome do túnel do carpo.',
            },
        ],
    },
];

/** Elos do eixo natural (passo 0) — slides 35 e 36. */
export const NATURAL_LINKS = [
    {
        from: 'Hipotálamo',
        to: 'Hipófise',
        color: COLORS.hipotalamo,
        text: 'O sinal hipotalâmico comanda a liberação pulsátil de GH — pulsos de alta amplitude no sono profundo (fase N3).',
    },
    {
        from: 'Hipófise',
        to: 'Fígado',
        color: COLORS.hipofise,
        text: 'O GH se liga ao receptor GHR nos hepatócitos → JAK2/STAT5 → síntese e secreção de IGF-1. O fígado produz ~70% do IGF-1 circulante.',
    },
    {
        from: 'Fígado',
        to: 'Músculo',
        color: COLORS.igf,
        text: 'IGF-1 → IGF-1R → PI3K → Akt → mTORC1: síntese proteica nas células-alvo. Ligado à IGFBP-3, meia-vida de ~15 h — marcador mais estável.',
    },
] as const;

export interface StepInfo {
    readonly label: string;
    readonly title: string;
    readonly caption: string;
}

export const STEPS: readonly StepInfo[] = [
    { label: 'Eixo natural', title: 'Eixo natural', caption: 'Sinal hipotalâmico → pulso de GH → IGF-1 hepático → músculo.' },
    { label: 'Hipotálamo', title: 'Ponto 1 · GHRP', caption: 'O secretagogo amplifica o sinal no topo: pico de GH em 15–30 min.' },
    { label: 'Hipófise', title: 'Ponto 2 · rhGH', caption: 'O GH injetado substitui o pulso: às 23h, fora do plasma antes das 6h.' },
    { label: 'Fígado', title: 'Ponto 3 · IGF-1 exógeno', caption: 'Bypass do eixo direto ao IGF-1R; com insulina, hipoglicemia.' },
];
