/** Canal mutável entre o loop 3D (escreve a cada quadro) e o HUD (lê em rAF), sem re-render. */
export interface LiveSnapshot {
    /** Fluxo relativo ao normal em vigília (1 = 45%). */
    flow: number;
    /** Obstrução do lúmen pelo microtrombo (0–1). */
    occlusion: number;
    /** Intensidade do batimento atual (0–1), só no sono. */
    beat: number;
}

export interface LiveStore {
    write: (next: LiveSnapshot) => void;
    read: () => LiveSnapshot;
}

export const createLiveStore = (): LiveStore => {
    let snapshot: LiveSnapshot = { flow: 1, occlusion: 0, beat: 0 };
    return {
        write: next => { snapshot = next; },
        read: () => snapshot,
    };
};
