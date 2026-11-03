import { motion, useReducedMotion } from 'framer-motion';
import { useMemo, useRef, type PointerEvent } from 'react';
import { AnimatedNumber } from './AnimatedNumber';
import { CHART_H, CHART_W, M, PH, PW, doseFromX, sx, sy } from './geometry';
import { DOSE_MAX, DOSE_MIN, STAGES, fmt, gainAt, slopeAt, stageAtDose } from './model';

const EASE = [0.22, 1, 0.36, 1] as const;
const X_TICKS = [0, 100, 200, 300, 400, 500, 600, 700];
const Y_TICKS = [0, 1, 2, 3, 4, 5, 6, 7];
const TRIANGLE_RUN = 100;

/** Rótulo do valor de cada ponto: posição relativa ao marcador. */
const LABEL_OFFSET: Record<string, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = {
    fisio: { dx: 8, dy: -30, anchor: 'middle' },
    trt: { dx: -16, dy: -16, anchor: 'end' },
    supra: { dx: -16, dy: -16, anchor: 'end' },
    abuso: { dx: -18, dy: -14, anchor: 'end' },
};

interface DoseChartProps {
    step: number;
    dose: number;
    onDose: (dose: number) => void;
    onDragStart: () => void;
}

export const DoseChart = ({ step, dose, onDose, onDragStart }: DoseChartProps) => {
    const reduce = useReducedMotion();
    const svgRef = useRef<SVGSVGElement>(null);
    const dragging = useRef(false);
    const showCurve = step >= 4;

    const curvePath = useMemo(() => {
        const pts: string[] = [];
        for (let d = DOSE_MIN; d <= DOSE_MAX; d += 5) pts.push(`${sx(d).toFixed(1)},${sy(gainAt(d)).toFixed(1)}`);
        return `M${pts.join('L')}`;
    }, []);
    const areaPath = `${curvePath}L${sx(DOSE_MAX)},${sy(0)}L${sx(DOSE_MIN)},${sy(0)}Z`;

    const pointerToDose = (e: PointerEvent<SVGRectElement>) => {
        const svg = svgRef.current;
        if (!svg) return;
        const rect = svg.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * CHART_W;
        onDose(Math.round(Math.min(Math.max(doseFromX(x), DOSE_MIN), DOSE_MAX)));
    };

    /* cursor e tangente */
    const cx = sx(dose);
    const cy = sy(gainAt(dose));
    const slope = slopeAt(dose);
    const cursorStage = stageAtDose(dose);
    const runEndX = sx(dose + TRIANGLE_RUN);
    const riseEndY = sy(gainAt(dose) + slope * TRIANGLE_RUN);
    /* etiqueta "+100 mg → +x kg": à direita do triângulo; perto do fim, à esquerda, sob a curva */
    const pillLeft = dose > 430;
    const pillX = pillLeft ? cx - 124 : runEndX + 122;
    const pillY = pillLeft ? cy + 44 : (cy + riseEndY) / 2 + 8;
    const tanSpan = 95;
    const tan = {
        x1: sx(dose - tanSpan), y1: sy(gainAt(dose) - slope * tanSpan),
        x2: sx(dose + tanSpan + 30), y2: sy(gainAt(dose) + slope * (tanSpan + 30)),
    };

    return (
        <svg ref={svgRef} width={CHART_W} height={CHART_H} viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="block overflow-visible select-none">
            <defs>
                <linearGradient id="dose-curve-grad" gradientUnits="userSpaceOnUse" x1={sx(0)} x2={sx(600)} y1="0" y2="0">
                    <stop offset="0%" stopColor="#A1A1AA" />
                    <stop offset="22%" stopColor="#60A5FA" />
                    <stop offset="55%" stopColor="#F87171" />
                    <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
                <linearGradient id="dose-legend-grad" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
                <linearGradient id="dose-area-grad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#E11D48" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#E11D48" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="dose-tan-grad" gradientUnits="userSpaceOnUse" x1={tan.x1} y1={tan.y1} x2={tan.x2} y2={tan.y2}>
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                    <stop offset="25%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="75%" stopColor="#FFFFFF" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
                <filter id="dose-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="5" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <clipPath id="dose-plot-clip">
                    <rect x={M.left} y={M.top - 4} width={PW} height={PH + 4} />
                </clipPath>
            </defs>

            {/* Faixas de fundo */}
            {STAGES.map((s, i) => {
                const on = step >= i;
                const x0 = sx(s.band[0]);
                const w = sx(s.band[1]) - x0;
                const current = (step === i) || (showCurve && cursorStage.id === s.id);
                return (
                    <g key={s.id}>
                        <motion.rect
                            x={x0} y={M.top} width={w} height={PH} fill={s.color}
                            initial={false}
                            animate={{ opacity: on ? (current ? 0.13 : 0.06) : 0.015 }}
                            transition={{ duration: 0.6 }}
                        />
                        <motion.rect
                            x={x0 + 1} y={M.top - 6} width={w - 2} height={3} rx={1.5} fill={s.color}
                            initial={false} animate={{ opacity: on ? 0.95 : 0.15 }} transition={{ duration: 0.6 }}
                        />
                        <motion.text
                            x={x0 + w / 2} y={M.top - 16} textAnchor="middle"
                            className="font-mono" fontSize={15} fontWeight={600} letterSpacing="0.04em" fill={s.color}
                            initial={false} animate={{ opacity: on ? 1 : 0.3 }} transition={{ duration: 0.6 }}
                        >
                            {s.bandLabel.toUpperCase()}
                        </motion.text>
                    </g>
                );
            })}

            {/* Grade e eixos */}
            {Y_TICKS.map(t => (
                <g key={`y${t}`}>
                    {t > 0 && <line x1={M.left} x2={M.left + PW} y1={sy(t)} y2={sy(t)} stroke="#FFFFFF" strokeOpacity={0.08} strokeDasharray="3 5" />}
                    <text x={M.left - 12} y={sy(t) + 5} textAnchor="end" className="font-mono" fontSize={15} fill="#E4E4E7">{t}</text>
                </g>
            ))}
            {X_TICKS.map(t => (
                <g key={`x${t}`}>
                    <line x1={sx(t)} x2={sx(t)} y1={sy(0)} y2={sy(0) + 6} stroke="#FFFFFF" strokeOpacity={0.5} />
                    <text x={sx(t)} y={sy(0) + 25} textAnchor="middle" className="font-mono" fontSize={15} fill="#E4E4E7">{t}</text>
                </g>
            ))}
            <line x1={M.left} x2={M.left + PW} y1={sy(0)} y2={sy(0)} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={1.5} />
            <line x1={M.left} x2={M.left} y1={M.top} y2={sy(0)} stroke="#FFFFFF" strokeOpacity={0.6} strokeWidth={1.5} />
            <text x={M.left + PW / 2} y={CHART_H - 8} textAnchor="middle" className="font-body" fontSize={15} fill="#E4E4E7">
                Dose de testosterona exógena (mg)
            </text>
            <text transform={`translate(12 ${M.top + PH / 2}) rotate(-90)`} textAnchor="middle" className="font-body" fontSize={15} fill="#E4E4E7">
                Ganho de massa magra (kg)
            </text>

            {/* Curva (modelo ilustrativo) */}
            <g clipPath="url(#dose-plot-clip)">
                <motion.path
                    d={areaPath} fill="url(#dose-area-grad)"
                    initial={false} animate={{ opacity: showCurve ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 1.2, delay: showCurve && !reduce ? 0.6 : 0 }}
                />
                <motion.path
                    d={curvePath} fill="none" stroke="url(#dose-curve-grad)" strokeWidth={4} strokeLinecap="round"
                    initial={false}
                    animate={{ pathLength: showCurve ? 1 : 0, opacity: showCurve ? 1 : 0 }}
                    transition={{ duration: reduce ? 0 : 1.4, ease: EASE }}
                />
            </g>

            {/* Pontos da aula */}
            {STAGES.map((s, i) => {
                const on = step >= i;
                const px = sx(s.dose);
                const py = sy(s.gain);
                const lab = LABEL_OFFSET[s.id];
                const dur = reduce ? 0 : 0.9;
                return (
                    <motion.g key={s.id} initial={false} animate={{ opacity: on ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.35 }}>
                        {/* haste crescendo do eixo até o ponto */}
                        <motion.line
                            x1={px} x2={px} y1={sy(0)} stroke={s.color} strokeWidth={2} strokeDasharray="4 5" strokeOpacity={0.75}
                            initial={false} animate={{ y2: on ? py : sy(0) }} transition={{ duration: dur, ease: EASE }}
                        />
                        <motion.g
                            initial={false}
                            animate={{ y: on ? 0 : sy(0) - py, scale: on ? 1 : 0.2 }}
                            transition={{ duration: dur, ease: EASE }}
                        >
                            <circle cx={px} cy={py} r={18} fill={s.color} opacity={0.16} />
                            <circle cx={px} cy={py} r={10} fill="#050510" stroke={s.color} strokeWidth={3.5} filter={step === i ? 'url(#dose-glow)' : undefined} />
                            <circle cx={px} cy={py} r={4} fill={s.color} />
                        </motion.g>
                        <motion.text
                            x={px + lab.dx} y={py + lab.dy} textAnchor={lab.anchor}
                            className="font-display" fontSize={24} fontWeight={600} fill={s.color}
                            initial={false} animate={{ opacity: on ? 1 : 0, y: on ? 0 : 10 }}
                            transition={{ duration: reduce ? 0 : 0.5, delay: on && !reduce ? 0.55 : 0 }}
                        >
                            {s.id === 'fisio' ? '~0 kg' : (
                                <AnimatedNumber
                                    value={on ? s.gain : 0} prefix="+" suffix={s.id === 'abuso' ? ' kg+' : ' kg'}
                                    delay={on && !reduce ? 0.25 : 0} duration={1.1}
                                />
                            )}
                        </motion.text>
                    </motion.g>
                );
            })}

            {/* Cursor, tangente e triângulo Δ */}
            <motion.g initial={false} animate={{ opacity: showCurve ? 1 : 0 }} transition={{ duration: 0.5, delay: showCurve && !reduce ? 1.1 : 0 }}
                style={{ pointerEvents: 'none' }}>
                <line x1={cx} x2={cx} y1={cy} y2={sy(0)} stroke="#FFFFFF" strokeOpacity={0.35} strokeDasharray="2 4" />
                <line x1={M.left} x2={cx} y1={cy} y2={cy} stroke="#FFFFFF" strokeOpacity={0.35} strokeDasharray="2 4" />

                <g clipPath="url(#dose-plot-clip)">
                <polygon
                    points={`${cx},${cy} ${runEndX},${cy} ${runEndX},${riseEndY}`}
                    fill={cursorStage.color} fillOpacity={0.2} stroke={cursorStage.color} strokeOpacity={0.9} strokeWidth={1.5}
                />
                <line x1={tan.x1} y1={tan.y1} x2={tan.x2} y2={tan.y2} stroke="url(#dose-tan-grad)" strokeWidth={2.5} strokeLinecap="round" />
                </g>

                {/* etiqueta do triângulo */}
                <g transform={`translate(${pillX} ${pillY})`}>
                    <rect x={-110} y={-16} width={220} height={30} rx={15} fill="#050510" fillOpacity={0.92} stroke={cursorStage.color} strokeOpacity={0.7} />
                    <text textAnchor="middle" y={5} className="font-mono" fontSize={15} fill="#F4F4F5">
                        +100 mg → <tspan fill={cursorStage.color} fontWeight={700}>+{fmt(slope * 100, 2)} kg</tspan>
                    </text>
                </g>

                <circle cx={cx} cy={cy} r={16} fill="#FFFFFF" opacity={0.12} />
                <circle cx={cx} cy={cy} r={8} fill="#FFFFFF" stroke="#050510" strokeWidth={2.5} filter="url(#dose-glow)" />

                {/* etiquetas nos eixos */}
                <g transform={`translate(${cx} ${sy(0) + 24})`}>
                    <rect x={-40} y={-17} width={80} height={28} rx={6} fill="#FFFFFF" />
                    <text textAnchor="middle" y={3} className="font-mono" fontSize={15} fontWeight={700} fill="#050510">{Math.round(dose)} mg</text>
                </g>
                <g transform={`translate(${M.left - 6} ${cy})`}>
                    <rect x={-50} y={-14} width={48} height={28} rx={6} fill="#FFFFFF" />
                    <text textAnchor="middle" x={-26} y={5.5} className="font-mono" fontSize={15} fontWeight={700} fill="#050510">{fmt(gainAt(dose))}</text>
                </g>
            </motion.g>

            {/* Legenda */}
            <motion.g initial={false} animate={{ opacity: showCurve ? 1 : 0 }} transition={{ duration: 0.5, delay: showCurve && !reduce ? 0.9 : 0 }}>
                <g transform={`translate(${M.left + 20} ${M.top + 22})`}>
                    <circle cx={6} cy={0} r={6} fill="#050510" stroke="#E4E4E7" strokeWidth={2.5} />
                    <text x={20} y={5} className="font-body" fontSize={15} fill="#E4E4E7">Pontos: dados da aula</text>
                    <rect x={0} y={24} width={14} height={4} rx={2} fill="url(#dose-legend-grad)" />
                    <text x={20} y={31} className="font-body" fontSize={15} fill="#E4E4E7">Curva:</text>
                    <rect x={68} y={14} width={170} height={25} rx={12} fill="#F59E0B" fillOpacity={0.16} stroke="#F59E0B" strokeOpacity={0.7} />
                    <text x={153} y={31} textAnchor="middle" className="font-mono" fontSize={15} fontWeight={600} fill="#FBBF24">modelo ilustrativo</text>
                </g>
            </motion.g>

            {/* Área de arrasto: clicar/arrastar no gráfico move a dose */}
            {showCurve && (
                <rect
                    x={M.left} y={M.top} width={PW} height={PH} fill="transparent" style={{ cursor: 'ew-resize', touchAction: 'none' }}
                    onPointerDown={e => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); onDragStart(); pointerToDose(e); }}
                    onPointerMove={e => { if (dragging.current) pointerToDose(e); }}
                    onPointerUp={e => { dragging.current = false; e.currentTarget.releasePointerCapture(e.pointerId); }}
                    onPointerCancel={() => { dragging.current = false; }}
                />
            )}
        </svg>
    );
};
