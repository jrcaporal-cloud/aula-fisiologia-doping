/**
 * Versões da aula por tempo disponível. A aula completa dura cerca de 2h30 com discussão.
 * Abrir com `?tempo=90` ou `?tempo=60` esconde os slides de aprofundamento (ids do JSON);
 * nada é apagado — sem o parâmetro a aula vem completa.
 */
export type Tempo = 'completa' | '90' | '60';

/** 90 min: tira aprofundamentos, o bloco trans fica só no slide dos casos e o dossiê/achados saem. */
const SKIP_90 = new Set<number>([2, 75, 35, 36, 13, 191, 22, 32, 34, 7, 17, 20, 9, 25]);

/** 60 min: mantém só a espinha da aula (com um caso clínico) e o fechamento. */
const KEEP_60 = new Set<number>([0, 1, 100, 5, 3, 4, 6, 8, 10, 12, 14, 15, 16, 17, 18, 26, 101, 102, 30]);

export const readTempo = (search: string): Tempo => {
    const value = new URLSearchParams(search).get('tempo');
    return value === '90' || value === '60' ? value : 'completa';
};

export const keepsSlide = (tempo: Tempo, slideId: number): boolean => {
    if (tempo === '90') return !SKIP_90.has(slideId);
    if (tempo === '60') return KEEP_60.has(slideId);
    return true;
};
