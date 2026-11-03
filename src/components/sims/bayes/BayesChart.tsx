import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { DensityStrip } from './DensityStrip';
import {
    BOTTOM, FS, NODE_X, PL, PLOT_R, SLOT_W, TOP, VB_H, VB_W, bandPath, edgePath, slotX, vOf, yOf,
} from './layout';
import {
    FIXED_LIMIT, MIN_BASELINE, MONTHS, N_EXAMS, POP_CENTER, PRIOR, clampValue, likelihoodOf, toInterval,
    type Analysis,
} from './model';
import { useTween } from './useTween';

const RED = '#E11D48';
const BLUE = '#60A5FA';
const FIXED_Y = yOf(FIXED_LIMIT);
const NODES = NODE_X.length;

export interface BayesChartProps {
    readonly values: readonly number[];
    readonly analysis: Analysis;
    readonly visibleCount: number;
    /** Passo 0: só a régua fixa (os exames aparecem em cinza, todos "normais"). */
    readonly fixedOnly: boolean;
    readonly showLikelihood: boolean;
    readonly onChange: (k: number, value: number) => void;
}

const corridorTarget = (analysis: Analysis): number[] => {
    const ivs = [toInterval(PRIOR), ...analysis.slots.map(s => s.interval), toInterval(analysis.current)];
    return [...ivs.map(iv => yOf(iv.lo)), ...ivs.map(iv => yOf(iv.hi)), analysis.current.m, analysis.current.s];
};

const useDrag = (onChange: (k: number, v: number) => void) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [dragging, setDragging] = useState<number | null>(null);

    useEffect(() => {
        if (dragging === null) return undefined;
        const move = (e: PointerEvent) => {
            const svg = svgRef.current;
            const ctm = svg?.getScreenCTM();
            if (!svg || !ctm) return;
            const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
            onChange(dragging, clampValue(vOf(p.y)));
        };
        const up = () => setDragging(null);
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', up);
        return () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
        };
    }, [dragging, onChange]);

    return { svgRef, dragging, setDragging };
};

export const BayesChart = ({ values, analysis, visibleCount, fixedOnly, showLikelihood, onChange }: BayesChartProps) => {
    const reduce = useReducedMotion() ?? false;
    const { svgRef, dragging, setDragging } = useDrag(onChange);

    // Alvo do corredor (lo | hi por nó) + parâmetros da posteriori, interpolados juntos.
    const target = useMemo(() => corridorTarget(analysis), [analysis]);
    const tw = useTween(target, dragging === null ? 900 : 90);
    const lo = tw.slice(0, NODES);
    const hi = tw.slice(NODES, NODES * 2);
    const posterior = { m: tw[NODES * 2], s: tw[NODES * 2 + 1] };

    const n = analysis.currentN;
    const tunnel = n >= MIN_BASELINE;
    const newest = visibleCount - 1;
    const flag = analysis.firstFlag;
    const ghost = !fixedOnly && visibleCount < N_EXAMS ? visibleCount : null;
    const bandLabel = n === 0 ? 'priori populacional' : !tunnel ? `corredor em formação · ${n}/${MIN_BASELINE} exames` : 'túnel individual';
    const tunnelStart = (slotX(MIN_BASELINE - 1) + SLOT_W * 0.5 - PL) / (PLOT_R - PL);
    const lastHi = hi[hi.length - 1];
    const lastLo = lo[lo.length - 1];

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-full block select-none touch-none" role="img"
            aria-label="Corredor bayesiano do atleta: priori populacional, atualização a cada exame e alerta fora do túnel">
            <defs>
                <clipPath id="bayes-clip"><rect x={PL} y={TOP} width={PLOT_R - PL} height={BOTTOM - TOP} /></clipPath>
                <linearGradient id="bayes-band" gradientUnits="userSpaceOnUse" x1={PL} x2={PLOT_R} y1={0} y2={0}>
                    <stop offset={0} stopColor={BLUE} stopOpacity={0.12} />
                    <stop offset={tunnel ? tunnelStart : 1} stopColor={BLUE} stopOpacity={0.12} />
                    <stop offset={tunnel ? Math.min(1, tunnelStart + 0.12) : 1} stopColor={BLUE} stopOpacity={0.3} />
                    <stop offset={1} stopColor={BLUE} stopOpacity={tunnel ? 0.3 : 0.12} />
                </linearGradient>
                <filter id="bayes-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>

            {/* Área e eixos */}
            <rect x={PL} y={TOP} width={PLOT_R - PL} height={BOTTOM - TOP} rx={6} fill="rgba(255,255,255,0.015)" />
            <line x1={PL} x2={PL} y1={TOP} y2={BOTTOM} stroke="rgba(255,255,255,0.35)" />
            <line x1={PL} x2={PLOT_R} y1={BOTTOM} y2={BOTTOM} stroke="rgba(255,255,255,0.35)" />
            <line x1={PL} x2={PLOT_R} y1={yOf(POP_CENTER)} y2={yOf(POP_CENTER)} stroke="rgba(255,255,255,0.10)" />
            <text x={PL - 8} y={yOf(POP_CENTER) + 5} textAnchor="end" fontSize={FS} fill="#E5E7EB" style={{ fontFamily: 'var(--font-mono)' }}>1:1</text>
            <text x={PL - 8} y={FIXED_Y + 5} textAnchor="end" fontSize={FS} fontWeight={700} fill="#FCA5A5" style={{ fontFamily: 'var(--font-mono)' }}>4,0</text>
            <text transform={`translate(${PL - 56} ${(TOP + BOTTOM) / 2}) rotate(-90)`} textAnchor="middle" fontSize={FS} letterSpacing="0.1em" fill="#E5E7EB" style={{ fontFamily: 'var(--font-mono)' }}>
                RAZÃO T/E
            </text>

            {/* Passo 0: tudo abaixo da régua fixa é "normal" para todos */}
            <motion.rect x={PL} y={FIXED_Y} width={PLOT_R - PL} height={BOTTOM - FIXED_Y} fill="#10B981"
                animate={{ opacity: fixedOnly ? 0.07 : 0 }} transition={{ duration: 0.6 }} />
            {fixedOnly && (
                <motion.text x={PLOT_R - 12} y={BOTTOM - 14} textAnchor="end" fontSize={FS} fontWeight={600} fill="#6EE7B7"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    abaixo de 4,0 = “normal” para qualquer atleta
                </motion.text>
            )}

            {/* Corredor bayesiano */}
            {!fixedOnly && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                    <g clipPath="url(#bayes-clip)">
                        <path d={bandPath(lo, hi)} fill="url(#bayes-band)" />
                        <path d={edgePath(hi)} fill="none" stroke={BLUE} strokeWidth={1.8} strokeDasharray={tunnel ? undefined : '6 5'} />
                        <path d={edgePath(lo)} fill="none" stroke={BLUE} strokeWidth={1.8} strokeDasharray={tunnel ? undefined : '6 5'} />
                    </g>
                    <text x={PLOT_R - 8} y={flag !== null ? lastLo + 22 : Math.max(FIXED_Y + 28, Math.min(lastHi - 9, FIXED_Y + 32))} textAnchor="end" fontSize={FS} fontWeight={700} fill={BLUE}>
                        {bandLabel}
                    </text>
                </motion.g>
            )}

            {/* Régua fixa */}
            <line x1={PL} x2={PLOT_R} y1={FIXED_Y} y2={FIXED_Y} stroke="#F87171" strokeWidth={fixedOnly ? 2.6 : 1.8} strokeDasharray="8 6" />
            <text x={PL + 10} y={FIXED_Y - 9} fontSize={FS} fontWeight={700} fill="#FCA5A5">Limite universal estático · T/E 4,0</text>

            {/* Coluna da coleta com ATF */}
            {flag !== null && (
                <motion.rect key={`atf-${flag}`} x={slotX(flag) - 18} y={TOP} width={36} height={BOTTOM - TOP} rx={18} fill={RED}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.14 }} transition={{ duration: 0.5 }} />
            )}

            {/* Linha do atleta */}
            {!fixedOnly && values.slice(0, visibleCount).map((v, k) => k > 0 && (
                <motion.line key={`seg-${k}`} x1={slotX(k - 1)} y1={yOf(values[k - 1])} x2={slotX(k)} y2={yOf(v)}
                    stroke={BLUE} strokeOpacity={0.5} strokeWidth={2}
                    initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45 }} />
            ))}

            {/* Exames */}
            {values.map((v, k) => {
                const shown = fixedOnly || k < visibleCount;
                const isGhost = k === ghost;
                if (!shown && !isGhost) return null;
                const x = slotX(k);
                const y = yOf(v);
                const slot = analysis.slots[k];
                const flagged = !fixedOnly && slot.flagged;
                const fill = fixedOnly ? '#9CA3AF' : flagged ? RED : k === newest ? '#F59E0B' : BLUE;
                const grab = (e: React.PointerEvent) => { e.preventDefault(); setDragging(k); };
                if (isGhost) {
                    // Perto da borda direita, o rótulo alinha pelo fim para não invadir a faixa de Bayes.
                    const ghostAnchor = x > PLOT_R - 110 ? { x: x + 14, anchor: 'end' as const } : { x, anchor: 'middle' as const };
                    return (
                        <g key={`ghost-${k}`} onPointerDown={grab} style={{ cursor: 'ns-resize' }}>
                            <title>arraste na vertical para simular o próximo exame</title>
                            <circle cx={x} cy={y} r={9} fill="rgba(8,8,18,0.9)" stroke="#E5E7EB" strokeWidth={2} strokeDasharray="3 3" />
                            <text x={ghostAnchor.x} y={y - 18} textAnchor={ghostAnchor.anchor} fontSize={FS} fontWeight={600} fill="#E5E7EB">próximo exame</text>
                            <circle cx={x} cy={y} r={20} fill="transparent" />
                        </g>
                    );
                }
                return (
                    <g key={`ex-${k}`} onPointerDown={fixedOnly ? undefined : grab} style={{ cursor: fixedOnly ? 'default' : 'ns-resize' }}>
                        {flagged && !reduce && (
                            <motion.circle cx={x} cy={y} fill="none" stroke={RED} strokeWidth={2}
                                initial={{ r: 8, opacity: 0.85 }} animate={{ r: 24, opacity: 0 }}
                                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />
                        )}
                        <motion.circle cx={x} r={flagged ? 8 : 7} fill={fill} stroke="#050510" strokeWidth={2}
                            filter={flagged ? 'url(#bayes-glow)' : undefined}
                            initial={reduce ? false : { cy: y - 60, opacity: 0 }} animate={{ cy: y, opacity: 1 }}
                            transition={dragging === k ? { duration: 0 } : { type: 'spring', stiffness: 240, damping: 18 }} />
                        <circle cx={x} cy={y} r={18} fill="transparent" />
                    </g>
                );
            })}

            {/* Passo 0: a régua fixa aprova todos os exames */}
            {fixedOnly && (
                <motion.text x={slotX(3) + 14} y={yOf(values[3]) - 18} textAnchor="end" fontSize={FS} fontWeight={600} fill="#E5E7EB"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    todos “normais”
                </motion.text>
            )}

            {/* Alerta ATF */}
            {flag !== null && (() => {
                const px = slotX(flag);
                const py = yOf(values[flag]);
                const bw = 268;
                const bh = 116;
                const bx = px - 28 - bw;
                const by = Math.max(TOP, Math.min(FIXED_Y + 12, py - bh / 2));
                return (
                    <motion.g key={`callout-${flag}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>
                        <line x1={bx + bw} y1={by + bh / 2} x2={px - 10} y2={py} stroke={RED} strokeWidth={1.6} />
                        <rect x={bx} y={by} width={bw} height={bh} rx={10} fill="#1a0610" stroke={RED} strokeWidth={1.5} />
                        <text x={bx + 12} y={by + 26} fontSize={FS} fontWeight={800} fill="#FDA4AF" style={{ fontFamily: 'var(--font-display)' }}>⚠ Achado Atípico (ATF)</text>
                        <text x={bx + 12} y={by + 52} fontSize={FS} fill="#FFE4E6">fora do túnel privativo</text>
                        <text x={bx + 12} y={by + 77} fontSize={FS} fill="#FFE4E6">abaixo de 4,0: normal</text>
                        <text x={bx + 12} y={by + 102} fontSize={FS} fill="#FFE4E6">para outra pessoa</text>
                    </motion.g>
                );
            })()}

            {/* Eixo do tempo */}
            <text x={PL} y={BOTTOM + 24} textAnchor="middle" fontSize={FS} fontWeight={600} fill={fixedOnly ? 'rgba(229,231,235,0.75)' : '#E5E7EB'} style={{ fontFamily: 'var(--font-mono)' }}>priori</text>
            {MONTHS.map((m, k) => {
                const isFlag = flag === k;
                const vis = fixedOnly || k < visibleCount;
                return (
                    <text key={m} x={slotX(k)} y={BOTTOM + 24} textAnchor="middle" fontSize={FS} fontWeight={isFlag ? 800 : 600}
                        fill={isFlag ? '#FB7185' : vis ? '#F3F4F6' : 'rgba(229,231,235,0.75)'} style={{ fontFamily: 'var(--font-mono)' }}>
                        <tspan x={slotX(k)}>Ex.{k + 1}</tspan>
                        <tspan x={slotX(k)} dy={22}>{m}</tspan>
                    </text>
                );
            })}
            <text x={PLOT_R} y={BOTTOM + 72} textAnchor="end" fontSize={FS} letterSpacing="0.02em" fill="#E5E7EB" style={{ fontFamily: 'var(--font-mono)' }}>TEMPO (MESES) →</text>

            <DensityStrip visible={!fixedOnly} showPosterior={!fixedOnly && n > 0} posterior={posterior}
                likelihood={showLikelihood && newest >= 0 ? likelihoodOf(values[newest]) : null}
                likelihoodKey={`lk-${newest}`} flagged={flag === newest} />
        </svg>
    );
};
