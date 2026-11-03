import {
    GAIN_MAX, longConc, nandConc, nandMetab, STRAT_THRESH, structuralGain, suspConc, suspConcD, THRESH,
} from './model';
import { intervals, laneBox, linY, logY, mergeIntervals, sampleLog, sampleStrat, type Sample } from './geometry';
import type { LaneSpec } from './LaneView';
import { VB } from './scales';

export const COLORS = {
    short: '#22D3EE', // ação curta (suspensão aquosa)
    long: '#A855F7', // éster longo (decanoato / enantato / cipionato)
    gain: '#F59E0B',
    prova: '#60A5FA',
} as const;

const LANES_H = VB.lanesBottom - VB.lanesTop;
const GAP = 10;

// Amostras calculadas uma vez (o modelo é fixo).
let cache: Record<string, Sample[]> | null = null;
const samples = () => {
    if (!cache) {
        cache = {
            susp: sampleLog(suspConc),
            nand: sampleLog(nandConc),
            metab: sampleLog(nandMetab),
            long: sampleStrat(longConc),
            suspD: sampleStrat(suspConcD),
            gain: sampleStrat(d => structuralGain(d) * GAIN_MAX),
        };
    }
    return cache;
};

const LOG_LO = -4.25;
const LOG_HI = 0.12;

/** Passos 0–1: dose única. `mix` 0 → só a suspensão; 1 → suspensão + decanoato. */
export const buildLogLanes = (mix: number): LaneSpec[] => {
    const s = samples();
    const half = (LANES_H - GAP) / 2;
    const h1 = LANES_H * (1 - mix) + half * mix;
    const b1 = laneBox(VB.lanesTop, h1, true);
    const y1 = logY(b1, LOG_LO, LOG_HI);
    const susp: LaneSpec = {
        box: b1,
        title: 'Testosterona suspensão (aquosa)',
        badge: 'USO PRÉ-PROVA',
        color: COLORS.short,
        y: y1,
        main: s.susp,
        effectThr: THRESH.suspEffect,
        detectThr: THRESH.suspDetect,
        effect: { intervals: intervals(s.susp, v => v >= THRESH.suspEffect), label: 'ação: horas · meia-vida ~10 h' },
        detect: { intervals: intervals(s.susp, v => v >= THRESH.suspDetect), label: 'excreção urinária: 1–3 dias' },
        thresholdLabels: true,
        reveal: { duration: 1.4, delay: 0.15 },
    };
    if (mix < 0.02) return [susp];
    const b2 = laneBox(VB.lanesTop + h1 + GAP, half, true);
    const y2 = logY(b2, LOG_LO, LOG_HI);
    const nand: LaneSpec = {
        box: b2,
        title: 'Nandrolona (decanoato)',
        badge: 'USO BASE (OFF-SEASON)',
        color: COLORS.long,
        y: y2,
        main: s.nand,
        secondary: s.metab,
        effectThr: THRESH.nandEffect,
        detectThr: THRESH.nandDetect,
        effect: { intervals: intervals(s.nand, v => v >= THRESH.nandEffect), label: 'efeito clínico: 4–6 semanas' },
        detect: { intervals: intervals(s.metab, v => v >= THRESH.nandDetect), label: 'rastreio do metabólito 19-Nor: até 18 meses' },
        reveal: { duration: 1.9, delay: 0.25 },
    };
    return [susp, nand];
};

const STRAT_LO = -4.4;
const STRAT_HI = 0.55;

/** Passo 2: estratégia off-season → clearance window → prova. */
export const buildStratLanes = (): LaneSpec[] => {
    const s = samples();
    const gainH = 64;
    const h = (LANES_H - gainH - 2 * GAP) / 2;
    const bLong = laneBox(VB.lanesTop, h, true);
    const bShort = laneBox(VB.lanesTop + h + GAP, h, true);
    const bGain = laneBox(VB.lanesTop + 2 * (h + GAP), gainH, false);
    const yLong = logY(bLong, STRAT_LO, STRAT_HI);
    const yShort = logY(bShort, STRAT_LO, STRAT_HI);
    return [
        {
            box: bLong,
            title: 'Éster longo (enantato · cipionato)',
            badge: 'FASE DE CONSTRUÇÃO',
            color: COLORS.long,
            y: yLong,
            main: s.long,
            effectThr: STRAT_THRESH.longEffect,
            detectThr: STRAT_THRESH.longDetect,
            effect: { intervals: mergeIntervals(intervals(s.long, v => v >= STRAT_THRESH.longEffect)), label: 'efeito anabólico' },
            detect: { intervals: mergeIntervals(intervals(s.long, v => v >= STRAT_THRESH.longDetect)), label: '~3 meses após a última dose' },
            reveal: { duration: 1.6, delay: 0.2 },
        },
        {
            box: bShort,
            title: 'Ação curta "in/out" (suspensão)',
            badge: 'CLEARANCE WINDOW',
            color: COLORS.short,
            y: yShort,
            main: s.suspD,
            effectThr: STRAT_THRESH.suspEffect,
            detectThr: STRAT_THRESH.suspDetect,
            effect: { intervals: mergeIntervals(intervals(s.suspD, v => v >= STRAT_THRESH.suspEffect), 0.02), label: 'saturação' },
            detect: { intervals: mergeIntervals(intervals(s.suspD, v => v >= STRAT_THRESH.suspDetect)), label: 'horas a dias' },
            reveal: { duration: 1.6, delay: 0.45 },
        },
        {
            box: bGain,
            title: 'Ganho estrutural (mionúcleos · massa)',
            badge: 'PERMANECE',
            color: COLORS.gain,
            y: linY(bGain, GAIN_MAX * 1.12),
            main: s.gain,
            area: true,
            reveal: { duration: 1.6, delay: 0.7 },
        },
    ];
};
