/**
 * Textos do slide "A Farmacocinética do GH Exógeno" (parsedPresentation.json, id 35), sem mudança de conteúdo.
 * Uma frase vem do slide 12 (ghaxis/content.ts, seção "Farmacocinética" da Hipófise):
 * "O hGH endógeno e exógeno são molecularmente idênticos".
 */

export const COLORS = {
    endo: '#34D399',
    exo: '#F59E0B',
    total: '#F3F4F6',
    igf: '#60A5FA',
    control: '#E11D48',
    iso: '#A855F7',
    iso20: '#22D3EE',
    warn: '#FBBF24',
    sleep: '#818CF8',
} as const;

export interface StepInfo {
    readonly label: string;
    readonly title: string;
    readonly caption: string;
    readonly color: string;
}

export const STEPS: readonly StepInfo[] = [
    { label: 'Pulsos', title: 'Pulsatilidade fisiológica', caption: 'GH endógeno em pulsos de alta amplitude no sono profundo (N3).', color: COLORS.endo },
    { label: 'Injeção', title: 'O disfarce natural', caption: 'Injetado às 23h, o exógeno mimetiza o padrão natural.', color: COLORS.exo },
    { label: 'Controle 6h', title: 'Meia-vida crítica', caption: 'IV ~15–20 min · SC ~3–4 h: fora do plasma antes das 6h.', color: COLORS.control },
    { label: 'Isoformas', title: 'Teste 20 kDa × 22 kDa', caption: 'Requer amostra < 12 h após o uso: detecção aleatória.', color: COLORS.iso },
    { label: 'IGF-1', title: 'IGF-1 como proxy', caption: 'Meia-vida ~15 h (ligado à IGFBP-3): marcador mais estável.', color: COLORS.igf },
    { label: 'Custo', title: 'Acromegalia subclínica', caption: 'O custo real do uso crônico em doses suprafisiológicas.', color: COLORS.warn },
];

export const TEXT = {
    pulses: 'GH endógeno é secretado em pulsos de alta amplitude durante sono profundo (fase N3).',
    mimic: 'O exógeno, injetado no mesmo período, mimetiza perfeitamente o padrão natural.',
    rhgh: 'GH recombinante: 191 aminoácidos, 22 kDa',
    identical: 'O hGH endógeno e exógeno são molecularmente idênticos.',
    eliminated: 'Uma injeção às 23h antes de dormir é completamente eliminada do plasma antes do controle matinal às 6h.',
    window24: 'A janela de detecção urinária/sanguínea fecha em menos de 24h.',
    isoTest: 'O teste diferencial atual (GH2000/GH-2004) compara isoformas de 20 kDa vs 22 kDa — mas requer amostra <12h após uso, tornando detecção aleatória.',
    hepatic: 'O GH se liga ao receptor GHR nos hepatócitos → JAK2/STAT5 → síntese e secreção de IGF-1.',
    igfHalf: 'IGF-1 tem meia-vida de ~15 horas (ligado à IGFBP-3), tornando-o um marcador mais estável.',
    abp: 'Atletas com IGF-1 crônico >3 DP da referência são sinalizados no ABP.',
    acroIntro: 'Uso crônico de hGH em doses suprafisiológicas causa expansão progressiva do tecido conjuntivo e ósseo.',
    organs: 'Órgãos internos (coração, fígado, intestino) também sofrem hiperplasia.',
    cardio: 'Cardiomegalia causa morte prematura documentada em ex-fisiculturistas profissionais.',
} as const;
