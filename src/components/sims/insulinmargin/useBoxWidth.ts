import { useLayoutEffect, useRef, useState, type RefObject } from 'react';

/**
 * Largura de layout (px, sem a escala do palco) de um elemento. Serve para o SVG usar
 * 1 unidade = 1 px e estender o abismo até a borda real do cartão, sem faixas vazias.
 */
export const useBoxWidth = <T extends HTMLElement>(fallback: number): [RefObject<T | null>, number] => {
    const ref = useRef<T | null>(null);
    const [width, setWidth] = useState(fallback);
    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        const update = () => setWidth(el.clientWidth || fallback);
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, [fallback]);
    return [ref, width];
};
