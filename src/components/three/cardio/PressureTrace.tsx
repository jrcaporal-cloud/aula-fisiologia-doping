import { useEffect, useRef } from 'react';
import type { CardioStateRef } from './flow';
import { drawPressure, setupPressureCanvas } from './drawPressure';

/*
 * Onda de pressão arterial ao vivo (canvas 2D) para o HUD. O quadro é escrito direto no canvas por
 * rAF, sem estado do React; a fase vem do mesmo ciclo que bate o coração 3D.
 */

export const TRACE_W = 124;
export const TRACE_H = 58;

export const PressureTrace = ({ stateRef }: { stateRef: CardioStateRef }) => {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const cv = ref.current;
        if (!cv) return;
        const pc = setupPressureCanvas(cv, TRACE_W, TRACE_H);
        if (!pc) return;
        let raf = 0;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            drawPressure(pc, stateRef.current);
        };
        tick();
        return () => cancelAnimationFrame(raf);
    }, [stateRef]);

    return (
        <canvas
            ref={ref}
            role="img"
            aria-label="Onda de pressão arterial ao vivo, sincronizada com o batimento"
            style={{ width: TRACE_W, height: TRACE_H }}
            className="shrink-0 rounded-md bg-black/25"
        />
    );
};
