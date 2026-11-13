import { useMemo } from 'react';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { useStore } from '../../../store/useStore';
import { setCanvasCursor } from './instancing';

/** Handlers de hover que alimentam o cartão "Detalhes da estrutura" do painel. Cursor direto no canvas. */
export const useHover = (name: string, info: string) => {
    const setHovered = useStore(s => s.setHoveredObject);
    const el = useThree(s => s.gl.domElement);
    return useMemo(() => ({
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            setHovered({ name, info });
            setCanvasCursor(el, 'help');
        },
        onPointerOut: () => {
            setHovered(null);
            setCanvasCursor(el, '');
        },
    }), [name, info, setHovered, el]);
};
