import { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { armPin, useSelection } from './selection';
import type { StructureId } from './structures';

/** Quanto o ponteiro precisa andar entre descer e subir para o gesto contar como arrasto da câmera. */
export const DRAG_PX = 4;

/**
 * Handlers de hover e de clique de uma estrutura, mais `lit` (destaque quando está sob o ponteiro ou
 * fixada). O hover só vale enquanto nada está fixado: com algo fixado, o cartão não troca.
 */
export const useStructure = (id: StructureId) => {
    const lit = useSelection(s => (s.pin ? s.pin.id === id : s.hoverId === id));
    const bind = useMemo(() => ({
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            useSelection.getState().setHover(id);
        },
        onPointerOut: () => {
            const s = useSelection.getState();
            if (s.hoverId === id) s.setHover(null);
        },
        onPointerDown: (e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            armPin(id, [e.point.x, e.point.y, e.point.z]);
        },
    }), [id]);
    return { bind, lit };
};
