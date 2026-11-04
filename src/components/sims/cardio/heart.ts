import { useEffect, useRef, type RefObject } from 'react';
import type { CardioVitals } from '../../../data/cardioSteps';

/*
 * Relógio do coração do slide. Ventrículo, onda de pressão e fluxo no vaso batem JUNTOS porque
 * leem a mesma fase do ciclo. Um único requestAnimationFrame chama os painéis inscritos, e cada
 * painel escreve direto nos atributos do SVG: nenhum quadro passa pelo estado do React.
 *
 * As formas (contração, pressão, fluxo) são ilustrativas, desenhadas para ler bem na projeção.
 */

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smoothstep = (x: number) => x * x * (3 - 2 * x);
const easeOut = (x: number) => 1 - (1 - x) * (1 - x);

/** Fração do ciclo em que a sístole termina. */
export const SYSTOLE_END = 0.4;

/** Fase de repouso usada quando o movimento está desligado (diástole, parede relaxada). */
const REST_PHASE = 0.72;

/** Frequência em Hz, a mesma do modelo 3D: de 0,85 a 1,05, subindo com a pressão sistólica. */
export const heartHz = (v: CardioVitals): number => 0.85 + clamp01((v.paSist - 118) / 26) * 0.2;

/** Rigidez arterial de 0 a 1, derivada da pressão sistólica (mais pressão, aorta menos complacente). */
export const rigidity = (v: CardioVitals): number => clamp01((v.paSist - 118) / 26);

/** Contração do ventrículo: 0 relaxado, 1 pico da sístole. */
export const contraction = (phase: number): number =>
    phase < SYSTOLE_END ? Math.pow(Math.sin((Math.PI * phase) / SYSTOLE_END), 0.85) : 0;

/** Fluxo na aorta de 0 a 1: pico logo no começo da sístole, quase nada na diástole. */
export const flowWave = (phase: number): number =>
    phase < 0.3 ? Math.pow(Math.sin((Math.PI * phase) / 0.3), 1.2) : 0;

/**
 * Pressão normalizada ao longo do ciclo (0 = diastólica, 1 = sistólica). A subida fica mais
 * brusca com a aorta rígida, e o entalhe dicrótico aparece logo depois do fechamento da valva.
 */
export const pressureShape = (phase: number, rigid: number): number => {
    const up = 0.12 - 0.04 * rigid;
    if (phase < up) return smoothstep(phase / up);
    if (phase < 0.38) return 1 - 0.38 * easeOut((phase - up) / (0.38 - up));
    const decay = 0.62 * Math.pow(1 - (phase - 0.38) / 0.62, 1.5);
    const notch = phase < 0.5 ? -0.05 * Math.sin((2 * Math.PI * (phase - 0.38)) / 0.12) : 0;
    return decay + notch;
};

/** Pressão em mmHg num ponto do ciclo. */
export const pressureAt = (phase: number, v: CardioVitals): number =>
    v.paDiast + (v.paSist - v.paDiast) * pressureShape(phase, rigidity(v));

/** Dados de um quadro. O objeto é reaproveitado a cada quadro: não guarde referência a ele. */
export interface BeatFrame {
    phase: number;
    contraction: number;
    /** Segundos desde o quadro anterior (0 com o movimento desligado). */
    dt: number;
    /** Segundos acumulados em movimento. */
    time: number;
}

export type FrameFn = (frame: BeatFrame) => void;

export interface HeartClock {
    subscribe: (fn: FrameFn) => () => void;
    /** Liga o relógio à fonte dos valores (para a frequência) e ao modo sem movimento. Chamar em efeito. */
    configure: (vitals: RefObject<CardioVitals>, frozen: boolean) => void;
}

/** O loop só roda enquanto houver painel inscrito. */
export const createHeartClock = (): HeartClock => {
    const subscribers = new Set<FrameFn>();
    const frame: BeatFrame = { phase: REST_PHASE, contraction: 0, dt: 0, time: 0 };
    let source: RefObject<CardioVitals> | null = null;
    let frozen = false;
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        if (frozen || source === null) {
            frame.phase = REST_PHASE;
            frame.contraction = 0;
            frame.dt = 0;
        } else {
            frame.phase = (frame.phase + dt * heartHz(source.current)) % 1;
            frame.contraction = contraction(frame.phase);
            frame.dt = dt;
            frame.time += dt;
        }
        subscribers.forEach(fn => fn(frame));
        raf = requestAnimationFrame(tick);
    };

    return {
        configure: (vitals, isFrozen) => {
            source = vitals;
            frozen = isFrozen;
        },
        subscribe: fn => {
            subscribers.add(fn);
            if (subscribers.size === 1) {
                last = 0;
                raf = requestAnimationFrame(tick);
            }
            return () => {
                subscribers.delete(fn);
                if (subscribers.size === 0) cancelAnimationFrame(raf);
            };
        },
    };
};

/** Inscreve um painel no relógio; a função pode mudar a cada render sem reinscrever. */
export const useHeartFrame = (clock: HeartClock, fn: FrameFn): void => {
    const latest = useRef(fn);
    useEffect(() => {
        latest.current = fn;
    });
    useEffect(() => clock.subscribe(frame => latest.current(frame)), [clock]);
};
