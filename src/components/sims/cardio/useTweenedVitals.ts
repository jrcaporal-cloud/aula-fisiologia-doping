import { useEffect, useRef, useState, type RefObject } from 'react';
import { mixVitals, type CardioVitals } from '../../../data/cardioSteps';

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export interface TweenedVitals {
    /** Valor atual para o que é desenhado pelo React (números, cotas, rótulos). */
    display: CardioVitals;
    /** Mesmo valor, para quem desenha por quadro (relógio do coração) sem re-renderizar. */
    ref: RefObject<CardioVitals>;
}

/**
 * Leva os valores até o alvo com uma transição suave sempre que o alvo muda. Parte do valor
 * em que estiver, então trocar de passo no meio de uma transição não dá salto. Com movimento
 * reduzido o valor chega de uma vez.
 */
export const useTweenedVitals = (target: CardioVitals, reduce: boolean, ms = 700): TweenedVitals => {
    const [display, setDisplay] = useState(target);
    const ref = useRef(target);

    useEffect(() => {
        const from = ref.current;
        const duration = reduce ? 0 : ms;
        const start = performance.now();
        let raf = 0;
        const tick = (now: number) => {
            const k = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
            const value = mixVitals(from, target, easeInOut(k));
            ref.current = value;
            setDisplay(value);
            if (k < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, reduce, ms]);

    return { display, ref };
};
