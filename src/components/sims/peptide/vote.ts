/**
 * Slide "Proibido ou permitido?" (antes do mapa). Fontes: Lista Proibida WADA 2026 (S0, S2.2, S2.2.1 — só homens —,
 * S4.4) e Programa de Monitoramento 2026; Código Mundial Antidopagem (AUT).
 */

export type Verdict = 'proibido' | 'permitido' | 'aut';

export interface VoteCard {
    name: string;
    context: string;
    verdict: Verdict;
    answer: string;
}

export const VOTE_CARDS: readonly VoteCard[] = [
    { name: 'hCG', context: 'numa atleta mulher', verdict: 'permitido', answer: 'A proibição do hCG (S2.2.1) vale só para homens.' },
    { name: 'Semaglutida', context: 'para perder peso', verdict: 'permitido', answer: 'Não está na lista. Está no Programa de Monitoramento desde 2024.' },
    { name: 'BPC-157', context: '"para o tendão"', verdict: 'proibido', answer: 'S0: não é aprovado para uso humano. Proibido dentro e fora de competição.' },
    { name: 'Insulina', context: 'num atleta com diabetes tipo 1', verdict: 'aut', answer: 'S4.4, proibida sempre. Com Autorização de Uso Terapêutico, o tratamento segue.' },
    { name: 'Ipamorelina', context: '"para dormir melhor"', verdict: 'proibido', answer: 'S2.2: secretagogo de GH. Proibido dentro e fora de competição.' },
    { name: 'Colágeno hidrolisado', context: 'peptídeos de colágeno em pó', verdict: 'permitido', answer: 'É alimento. O risco é o suplemento contaminado, não o colágeno.' },
];

export const VERDICT_STYLE: Record<Verdict, { label: string; color: string; bg: string; border: string }> = {
    proibido: { label: 'Proibido', color: '#FDA4AF', bg: 'rgba(225,29,72,0.18)', border: 'rgba(225,29,72,0.75)' },
    permitido: { label: 'Permitido', color: '#BAE6FD', bg: 'rgba(56,189,248,0.14)', border: 'rgba(56,189,248,0.7)' },
    aut: { label: 'Proibido, mas com AUT', color: '#FDE68A', bg: 'rgba(245,158,11,0.14)', border: 'rgba(245,158,11,0.7)' },
};
