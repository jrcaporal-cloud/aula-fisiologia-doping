import { useLayoutEffect, useRef, type RefObject } from 'react';
import { gearTransform, type GearSpec } from './gearGeometry';

/** Uma volta da engrenagem 1 a cada 18 s: movimento lento, só para mostrar o conjunto "rodando". */
const OMEGA = (2 * Math.PI) / 18;

/**
 * Gira as engrenagens via requestAnimationFrame escrevendo direto no atributo `transform`
 * (sem re-render do React). Parado, mantém o ângulo atual.
 */
export const useGearSpin = (
    gears: readonly GearSpec[],
    running: boolean,
    /** Muda quando engrenagens montam/desmontam: reaplica o ângulo atual nas novas. */
    layoutKey: number,
): RefObject<(SVGGElement | null)[]> => {
    const refs = useRef<(SVGGElement | null)[]>([]);
    const spin = useRef(0);

    useLayoutEffect(() => {
        const apply = () =>
            gears.forEach((g, i) => refs.current[i]?.setAttribute('transform', gearTransform(g, spin.current)));
        apply();
        if (!running) return undefined;
        let raf = 0;
        let last = performance.now();
        const tick = (now: number) => {
            const dt = Math.min((now - last) / 1000, 0.1);
            last = now;
            spin.current += OMEGA * dt;
            apply();
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [gears, running, layoutKey]);

    return refs;
};
