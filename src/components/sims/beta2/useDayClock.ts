import { useEffect, useRef, useState } from 'react';

/**
 * Relógio de dias para a taquifilaxia: ao montar, corre de 0 até `maxDay` em `durationMs`
 * (instantâneo com movimento reduzido). `scrub` para o relógio e fixa o dia; `replay` recomeça.
 */
export const useDayClock = (maxDay: number, durationMs: number, reduced: boolean) => {
    const [day, setDay] = useState(reduced ? maxDay : 0);
    const [playing, setPlaying] = useState(!reduced);
    const startRef = useRef<number | null>(null);

    useEffect(() => {
        if (!playing) return undefined;
        let raf = 0;
        startRef.current = null;
        const tick = (t: number) => {
            if (startRef.current === null) startRef.current = t;
            const p = Math.min((t - startRef.current) / durationMs, 1);
            setDay(p * maxDay);
            if (p < 1) raf = requestAnimationFrame(tick);
            else setPlaying(false);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [playing, durationMs, maxDay]);

    const scrub = (d: number) => {
        setPlaying(false);
        setDay(d);
    };
    const replay = () => {
        setDay(0);
        setPlaying(true);
    };
    return { day, playing, scrub, replay };
};
