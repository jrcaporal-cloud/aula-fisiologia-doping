/*
 * Foco cruzado do slide: passar o mouse (ou focar com Tab) numa linha do painel hemodinâmico
 * acende a parte do desenho que explica aquele número e apaga as outras.
 */

export type CardioFocus = 'pa' | 'parede' | 'fe' | 'e' | 'hct' | 'lip';

export type CardioPanelId = 'ventricle' | 'pressure' | 'vessel';

/** Qual painel do desenho responde a cada linha do painel hemodinâmico. */
const PANEL_OF: Record<CardioFocus, readonly CardioPanelId[]> = {
    pa: ['pressure', 'vessel'],
    parede: ['ventricle'],
    fe: ['ventricle'],
    e: ['ventricle'],
    hct: ['vessel'],
    lip: ['vessel'],
};

/** Com nada em foco, todo painel fica normal; com algo em foco, só os relacionados acendem. */
export const panelState = (focus: CardioFocus | null, panel: CardioPanelId): 'idle' | 'active' | 'dim' => {
    if (focus === null) return 'idle';
    return PANEL_OF[focus].includes(panel) ? 'active' : 'dim';
};
