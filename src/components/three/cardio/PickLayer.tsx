import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { cellsFirst } from './pickHelpers';
import { pinOrRelease } from './pickGesture';
import { useSelection } from './selection';
import { DRAG_PX } from './useStructure';

/*
 * Camada de seleção por clique, dentro do Canvas. Observa o ponteiro no próprio canvas e decide:
 * subiu sem arrastar → fixa a estrutura armada na descida (ou solta, se foi no vazio); arrastou →
 * foi a câmera, não fixa nada. Também instala a ordem de acerto que deixa a hemácia ser apontada.
 */
export const PickLayer = () => {
    const el = useThree(s => s.gl.domElement);
    const setEvents = useThree(s => s.setEvents);

    useEffect(() => { setEvents({ filter: cellsFirst }); }, [setEvents]);

    useEffect(() => {
        let from: { x: number; y: number } | null = null;
        let dragged = false;
        const onDown = (e: PointerEvent) => {
            if (e.button !== 0) return;
            from = { x: e.clientX, y: e.clientY };
            dragged = false;
            pinOrRelease(true, false); // descarta uma armação antiga; o R3F arma a nova logo depois
        };
        const onMove = (e: PointerEvent) => {
            if (from && Math.hypot(e.clientX - from.x, e.clientY - from.y) > DRAG_PX) dragged = true;
        };
        const onUp = (e: PointerEvent) => {
            if (e.button !== 0 || !from) return;
            from = null;
            pinOrRelease(false, dragged);
        };
        const onCancel = () => { from = null; pinOrRelease(true, false); };
        el.addEventListener('pointerdown', onDown);
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointercancel', onCancel);
        return () => {
            el.removeEventListener('pointerdown', onDown);
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerup', onUp);
            el.removeEventListener('pointercancel', onCancel);
        };
    }, [el]);

    return null;
};

/**
 * Cursor do canvas escrito direto no elemento, sem estado do React: a mão vira dedo sobre uma
 * estrutura (ou com algo fixado), "agarrando" enquanto o botão está apertado, e mão aberta no resto.
 */
const setCursor = (el: HTMLElement, cursor: string): void => { el.style.cursor = cursor; };

export const CursorLayer = () => {
    const el = useThree(s => s.gl.domElement);

    useEffect(() => {
        let pressed = false;
        const paint = () => {
            const s = useSelection.getState();
            setCursor(el, pressed ? 'grabbing' : s.pin || s.hoverId !== null ? 'pointer' : 'grab');
        };
        const onDown = (e: PointerEvent) => { if (e.button === 0) { pressed = true; paint(); } };
        const onUp = () => { pressed = false; paint(); };
        paint();
        const unsub = useSelection.subscribe(paint);
        el.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        return () => {
            unsub();
            el.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            setCursor(el, '');
        };
    }, [el]);

    return null;
};
