import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import { COLORS } from './content';
import {
    CONTROL_T, DETECT_WINDOW_H, INJ_T, ISO_WINDOW_H, N3_BLOCKS, SC_HALF_T, SC_PEAK, SLEEP, T_MAX,
    exoFn, ghEndo, igf, sampleFn, type Pt, type Route,
} from './model';

/** Gráfico da noite do controle: 22h → 23h do dia seguinte. Camadas aparecem conforme o passo. */

export const CHART = { w: 720, h: 410, l: 50, r: 56, t: 48, base: 330 } as const;
const MONO = 'var(--font-mono)';
const BODY = 'var(--font-body)';
const Y_MAX = 2.25;

const sx = (t: number): number => CHART.l + (t / T_MAX) * (CHART.w - CHART.l - CHART.r);
const sy = (v: number): number => CHART.base - (v / Y_MAX) * (CHART.base - CHART.t);
const syR = (v: number): number => CHART.base - v * (CHART.base - CHART.t);

const toPath = (pts: Pt[], y: (v: number) => number = sy): string =>
    pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${y(p.y).toFixed(1)}`).join('');
const toBand = (top: Pt[], bottom: Pt[]): string =>
    `${toPath(top)}${[...bottom].reverse().map(p => `L${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join('')}Z`;

interface LabelProps { x: number; y: number; text: string; color: string; anchor?: 'start' | 'middle' | 'end'; size?: number; weight?: number }
const Label = ({ x, y, text, color, anchor = 'start', size = 13, weight = 600 }: LabelProps) => (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color}
        style={{ fontFamily: BODY, paintOrder: 'stroke', stroke: '#080812', strokeWidth: 4, strokeLinejoin: 'round' }}>{text}</text>
);

const Fade = ({ delay = 0, children, k }: { delay?: number; children: ReactNode; k: string }) => (
    <motion.g key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, delay }}>{children}</motion.g>
);

const TICKS: readonly number[] = [1, 4, 8, 13, 17, 21, 25];
const TICK_LABEL: Record<number, string> = { 1: '23h', 4: '02h', 8: '06h', 13: '11h', 17: '15h', 21: '19h', 25: '23h' };

const Axes = ({ showRight }: { showRight: boolean }) => (
    <g>
        <line x1={CHART.l} x2={CHART.w - CHART.r} y1={CHART.base} y2={CHART.base} stroke="rgba(255,255,255,0.45)" />
        <line x1={CHART.l} x2={CHART.l} y1={CHART.t} y2={CHART.base} stroke="rgba(255,255,255,0.25)" />
        {Array.from({ length: T_MAX + 1 }, (_, t) => (
            <line key={t} x1={sx(t)} x2={sx(t)} y1={CHART.base} y2={CHART.base + (TICK_LABEL[t] ? 6 : 3)} stroke="rgba(255,255,255,0.5)" />
        ))}
        {TICKS.map(t => (
            <text key={t} x={sx(t)} y={CHART.base + 21} textAnchor="middle" fontSize={12.5} fontFamily={MONO} fill="#E5E7EB">{TICK_LABEL[t]}</text>
        ))}
        <text transform={`translate(16,${(CHART.t + CHART.base) / 2}) rotate(-90)`} textAnchor="middle" fontSize={12.5} fill="#D1D5DB" style={{ fontFamily: BODY }}>
            GH plasmático (u.a.)
        </text>
        <AnimatePresence>
            {showRight && (
                <Fade k="right-axis">
                    <line x1={CHART.w - CHART.r} x2={CHART.w - CHART.r} y1={CHART.t} y2={CHART.base} stroke="rgba(96,165,250,0.55)" />
                    <text transform={`translate(${CHART.w - 18},${(CHART.t + CHART.base) / 2}) rotate(90)`} textAnchor="middle" fontSize={12.5} fill="#93C5FD" style={{ fontFamily: BODY }}>
                        IGF-1 (u.a.)
                    </text>
                </Fade>
            )}
        </AnimatePresence>
    </g>
);

const SleepStrip = () => (
    <g>
        <rect x={sx(SLEEP[0])} y={CHART.t} width={sx(SLEEP[1]) - sx(SLEEP[0])} height={CHART.base - CHART.t} fill="rgba(129,140,248,0.06)" />
        <rect x={sx(SLEEP[0])} y={16} width={sx(SLEEP[1]) - sx(SLEEP[0])} height={18} rx={4} fill="rgba(129,140,248,0.16)" stroke="rgba(129,140,248,0.4)" />
        {N3_BLOCKS.map(([a, b]) => (
            <rect key={a} x={sx(a)} y={16} width={sx(b) - sx(a)} height={18} rx={3} fill="rgba(129,140,248,0.62)" />
        ))}
        <text x={sx(SLEEP[1]) + 6} y={29} fontSize={12.5} fontWeight={600} fill="#C7D2FE" style={{ fontFamily: BODY }}>sono · blocos escuros = N3</text>
    </g>
);

interface TimelineChartProps {
    readonly step: number;
    readonly route: Route;
    readonly collectT: number;
}

export const TimelineChart = ({ step, route, collectT }: TimelineChartProps) => {
    const reduce = useReducedMotion();
    const exo = exoFn(route);
    const endoPts = sampleFn(ghEndo, 0, T_MAX, 500);
    const zero = endoPts.map(p => ({ x: p.x, y: 0 }));
    const totalPts = sampleFn(t => ghEndo(t) + exo(t), 0, T_MAX, 500);
    const igfPts = sampleFn(igf, 0, T_MAX, 200);
    const showExo = step >= 1;
    const dur = (s: number): number => (reduce ? 0 : s);

    const control = step === 2 || step === 4;
    const isoStep = step === 3;
    const exoAtCollect = exo(collectT);

    return (
        <svg viewBox={`0 0 ${CHART.w} ${CHART.h}`} className="absolute inset-0 w-full h-full block" preserveAspectRatio="xMidYMid meet" role="img"
            aria-label="Linha do tempo de uma noite: pulsos de GH, injeção às 23h, controle às 6h e IGF-1 (modelo ilustrativo)">
            <motion.g animate={{ opacity: step === 5 ? 0.32 : 1 }} transition={{ duration: 0.6 }}>
                <SleepStrip />

                {/* janela do teste de isoformas (< 12 h após o uso) */}
                <AnimatePresence>
                    {isoStep && (
                        <Fade k="iso-win">
                            <rect x={sx(INJ_T)} y={CHART.t} width={sx(INJ_T + ISO_WINDOW_H) - sx(INJ_T)} height={CHART.base - CHART.t} fill="rgba(168,85,247,0.12)" />
                            <line x1={sx(INJ_T + ISO_WINDOW_H)} x2={sx(INJ_T + ISO_WINDOW_H)} y1={CHART.t} y2={CHART.base} stroke={COLORS.iso} strokeWidth={1.6} strokeDasharray="5 4" />
                            <Label x={sx(INJ_T + ISO_WINDOW_H) - 8} y={CHART.t + 18} text="teste de isoformas: amostra < 12 h após o uso" color="#E9D5FF" anchor="end" />
                        </Fade>
                    )}
                </AnimatePresence>

                <Axes showRight={step >= 4} />

                {/* GH endógeno (verde) */}
                <motion.path d={toBand(endoPts, zero)} fill={COLORS.endo} initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ duration: dur(0.8), delay: dur(0.6) }} />
                <motion.path d={toPath(endoPts)} fill="none" stroke={COLORS.endo} strokeWidth={step >= 1 ? 1.6 : 2.6} strokeLinejoin="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur(2), ease: 'easeInOut' }} />

                {/* rhGH empilhado sobre o endógeno + total medido */}
                <AnimatePresence>
                    {showExo && (
                        <motion.g key={`exo-${route}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                            <motion.path d={toPath(totalPts)} fill="none" stroke={COLORS.total} strokeWidth={2.4} strokeLinejoin="round"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur(1.6), ease: 'easeInOut' }} />
                            <motion.path d={toBand(totalPts, endoPts)} fill={COLORS.exo}
                                initial={{ opacity: 0 }} animate={{ opacity: 0.55 }} transition={{ duration: dur(0.8), delay: dur(step === 1 ? 1.8 : 0.3) }} />
                        </motion.g>
                    )}
                </AnimatePresence>

                {/* seringa às 23h */}
                <AnimatePresence>
                    {showExo && (
                        <Fade k="inj">
                            <line x1={sx(INJ_T)} x2={sx(INJ_T)} y1={CHART.t + 4} y2={CHART.base + 26} stroke={COLORS.exo} strokeWidth={1.4} strokeDasharray="3 4" />
                            <circle cx={sx(INJ_T)} cy={CHART.base + 30} r={4} fill={COLORS.exo} />
                            <Label x={sx(INJ_T) + 8} y={CHART.base + 35} text={`injeção de rhGH ${route === 'sc' ? 'SC' : 'IV'} às 23h`} color="#FCD34D" />
                        </Fade>
                    )}
                </AnimatePresence>

                {/* rótulos do passo */}
                <AnimatePresence>
                    {step === 0 && (
                        <Fade k="l0" delay={dur(1.4)}>
                            <Label x={sx(2.0) + 12} y={sy(1.0) + 4} text="pulso de alta amplitude · sono profundo (N3)" color="#6EE7B7" />
                            <Label x={sx(16)} y={sy(0.42)} text="durante o dia: pulsos pequenos" color="#A7F3D0" anchor="middle" />
                        </Fade>
                    )}
                    {step === 1 && (
                        <Fade k="l1" delay={dur(1.2)}>
                            <Label x={sx(5.2)} y={sy(1.55)} text="o laboratório mede só o total (linha branca)" color="#F3F4F6" />
                            <Label x={sx(5.2)} y={sy(1.55) + 18} text="exógeno (âmbar) e endógeno: mesma molécula" color="#FCD34D" />
                        </Fade>
                    )}
                    {step === 2 && route === 'sc' && (
                        <Fade k="l2sc" delay={dur(0.6)}>
                            <line x1={sx(SC_PEAK.t)} x2={sx(SC_HALF_T)} y1={sy(2.08)} y2={sy(2.08)} stroke="#FCD34D" strokeWidth={1.6} />
                            <line x1={sx(SC_PEAK.t)} x2={sx(SC_PEAK.t)} y1={sy(2.08) - 6} y2={sy(2.08) + 6} stroke="#FCD34D" strokeWidth={1.6} />
                            <line x1={sx(SC_HALF_T)} x2={sx(SC_HALF_T)} y1={sy(2.08) - 6} y2={sy(2.08) + 6} stroke="#FCD34D" strokeWidth={1.6} />
                            <line x1={sx(SC_HALF_T)} x2={sx(SC_HALF_T)} y1={sy(2.08) + 6} y2={sy(ghEndo(SC_HALF_T) + SC_PEAK.y / 2)} stroke="rgba(252,211,77,0.6)" strokeDasharray="2 3" />
                            <circle cx={sx(SC_HALF_T)} cy={sy(ghEndo(SC_HALF_T) + SC_PEAK.y / 2)} r={4} fill="#FCD34D" />
                            <Label x={sx(SC_HALF_T) + 8} y={sy(2.08) + 5} text="rhGH cai à metade: t½ SC ~3–4 h" color="#FCD34D" />
                        </Fade>
                    )}
                    {step === 2 && route === 'iv' && (
                        <Fade k="l2iv" delay={dur(0.6)}>
                            <line x1={sx(INJ_T) + 2} y1={sy(0.9)} x2={sx(INJ_T) + 14} y2={sy(1.42)} stroke="rgba(252,211,77,0.7)" />
                            <Label x={sx(INJ_T) + 18} y={sy(1.45)} text="IV: pico agudo, t½ ~15–20 min" color="#FCD34D" />
                        </Fade>
                    )}
                    {step === 3 && (
                        <Fade k="l3" delay={dur(0.4)}>
                            <Label x={sx(19)} y={CHART.t + 18} text="fora da janela (> 12 h)" color="#D1D5DB" anchor="middle" />
                        </Fade>
                    )}
                </AnimatePresence>

                {/* IGF-1 (eixo direito) */}
                <AnimatePresence>
                    {step >= 4 && (
                        <motion.g key="igf" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <motion.path d={toPath(igfPts, syR)} fill="none" stroke={COLORS.igf} strokeWidth={3.2} strokeLinecap="round"
                                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: dur(2.2), ease: 'easeInOut' }} />
                            <Fade k="igf-l" delay={dur(1.6)}>
                                <Label x={sx(17)} y={syR(igf(17)) - 14} text="IGF-1: sobe devagar e cai devagar (t½ ~15 h)" color="#93C5FD" anchor="middle" />
                            </Fade>
                        </motion.g>
                    )}
                </AnimatePresence>

                {/* controle matinal 06h */}
                <AnimatePresence>
                    {control && (
                        <Fade k="ctrl" delay={dur(0.2)}>
                            <rect x={sx(CONTROL_T) - 1.5} y={sy(1.9)} width={3} height={CHART.base - sy(1.9)} fill={COLORS.control} />
                            <circle cx={sx(CONTROL_T)} cy={sy(exo(CONTROL_T))} r={5} fill="#080812" stroke={COLORS.control} strokeWidth={2} />
                            <Label x={sx(CONTROL_T) + 8} y={CHART.base - 58} text="controle 6h" color="#FDA4AF" size={14} />
                            <Label x={sx(CONTROL_T) + 8} y={CHART.base - 38} text="rhGH: já eliminado" color="#F3F4F6" />
                            {step === 4 && (
                                <>
                                    <circle cx={sx(CONTROL_T)} cy={syR(igf(CONTROL_T))} r={5.5} fill={COLORS.igf} stroke="#080812" strokeWidth={2} />
                                    <Label x={sx(CONTROL_T) + 10} y={syR(igf(CONTROL_T)) - 14} text="IGF-1 ainda elevado" color="#93C5FD" size={14} />
                                </>
                            )}
                        </Fade>
                    )}
                </AnimatePresence>

                {/* coleta móvel (passo 3) */}
                {isoStep && (
                    <g>
                        <line x1={sx(collectT)} x2={sx(collectT)} y1={CHART.t + 26} y2={CHART.base} stroke={COLORS.iso20} strokeWidth={2.4} />
                        <circle cx={sx(collectT)} cy={sy(ghEndo(collectT) + exoAtCollect)} r={5} fill="#080812" stroke={COLORS.iso20} strokeWidth={2} />
                        <path d={`M${sx(collectT) - 7},${CHART.base + 58} L${sx(collectT) + 7},${CHART.base + 58} L${sx(collectT)},${CHART.base + 49} Z`} fill={COLORS.iso20} />
                    </g>
                )}

                {/* janela urinária/sanguínea < 24 h (passo 2) */}
                <AnimatePresence>
                    {step === 2 && (
                        <Fade k="w24" delay={dur(1)}>
                            <line x1={sx(INJ_T)} x2={sx(INJ_T + DETECT_WINDOW_H) - 26} y1={CHART.base + 56} y2={CHART.base + 56} stroke="#FDA4AF" strokeWidth={1.6} />
                            <line x1={sx(INJ_T)} x2={sx(INJ_T)} y1={CHART.base + 50} y2={CHART.base + 62} stroke="#FDA4AF" strokeWidth={1.6} />
                            <path d={`M${sx(INJ_T + DETECT_WINDOW_H) - 26},${CHART.base + 51} l9,5 l-9,5 Z`} fill="#FDA4AF" />
                            <Label x={sx(13)} y={CHART.base + 75} text="janela de detecção urinária/sanguínea: fecha em menos de 24 h" color="#FDA4AF" anchor="middle" />
                        </Fade>
                    )}
                </AnimatePresence>
            </motion.g>
            <AnimatePresence>
                {step === 5 && (
                    <Fade k="l5" delay={dur(0.4)}>
                        <Label x={sx(13.5)} y={sy(1.25)} text="noite após noite, o rhGH some do plasma antes das 6h…" color="#F3F4F6" anchor="middle" size={16} />
                        <Label x={sx(13.5)} y={sy(1.25) + 24} text="…mas o uso crônico expande tecido conjuntivo e ósseo" color="#FCD34D" anchor="middle" size={16} />
                    </Fade>
                )}
            </AnimatePresence>
        </svg>
    );
};
