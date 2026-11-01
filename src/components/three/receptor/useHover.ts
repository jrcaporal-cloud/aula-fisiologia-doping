import { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { useStore } from '../../../store/useStore';

/** Handlers de hover que alimentam o cartão "Detalhes da estrutura" do painel. */
export const useHover = (name: string, info: string) => {
    const setHovered = useStore(s => s.setHoveredObject);
    return useMemo(() => ({
        onPointerOver: (e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            setHovered({ name, info });
            document.body.style.cursor = 'help';
        },
        onPointerOut: () => {
            setHovered(null);
            document.body.style.cursor = '';
        },
    }), [name, info, setHovered]);
};
