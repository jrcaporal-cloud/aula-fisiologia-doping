import { create } from 'zustand';
import type { StructureId, Vec3 } from './structures';

/*
 * Seleção no modelo: o que está sob o ponteiro (`hoverId`) e o que o clique fixou (`pin`). Só muda a
 * cada entrada/saída de estrutura ou clique — nunca por quadro —, então pode viver como estado do React.
 * `point` é o ponto do mundo clicado: a hemácia anda, e o close-up mira onde o clique caiu.
 */

export interface Pin { id: StructureId; point: Vec3 | null }

interface SelectionState {
    hoverId: StructureId | null;
    pin: Pin | null;
    setHover: (id: StructureId | null) => void;
    pinStructure: (id: StructureId, point: Vec3 | null) => void;
    release: () => void;
    reset: () => void;
}

export const useSelection = create<SelectionState>(set => ({
    hoverId: null,
    pin: null,
    setHover: id => set(s => (s.hoverId === id ? s : { hoverId: id })),
    pinStructure: (id, point) => set({ pin: { id, point } }),
    release: () => set(s => (s.pin ? { pin: null } : s)),
    reset: () => set({ hoverId: null, pin: null }),
}));

/*
 * O clique é decidido no ponteiro para baixo: a estrutura sob o ponteiro fica "armada" e só é fixada
 * se o ponteiro subir sem ter arrastado (ver PickLayer). Hemácia anda rápido e sairia de baixo do
 * ponteiro antes do `click`; armar na descida resolve isso e já descarta o arrasto da câmera.
 */
let armed: Pin | null = null;

export const armPin = (id: StructureId, point: Vec3 | null): void => { armed = { id, point }; };

export const takeArmed = (): Pin | null => {
    const a = armed;
    armed = null;
    return a;
};
