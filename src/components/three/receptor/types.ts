/** Tempo da aula compartilhado pela cena: `t` é contínuo (0 … última etapa) e animado pelo gsap. */
export interface TimeState { t: number }
export type TimeRef = { readonly current: TimeState };
