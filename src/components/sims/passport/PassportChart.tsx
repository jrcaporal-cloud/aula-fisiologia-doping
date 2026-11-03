import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import {
    MARKERS, MIN_BASELINE, N_SAMPLES, OFF_SUSPECT, fmt, markerValue,
    type Analysis, type MarkerId, type MarkerSpec, type Protocol,
} from './model';
import { useTween } from './useTween';

const VB_W = 800;
const VB_H = 379;
const PL = 64;
const PR = 12;
const PLOT_R = VB_W - PR;
const SLOT_PAD = 40;
const SLOT_W = (PLOT_R - PL - SLOT_PAD * 2) / (N_SAMPLES - 1);
const RED = '#E11D48';
const POP = 'rgba(255,255,255,0.62)';
const MONO = { fontFamily: 'var(--font-mono)' } as const;
/** Tamanho mínimo dos textos do gráfico: o SVG é desenhado em ~1:1 com a largura do slide. */
const FS = 16;

const PANELS: Readonly<Record<MarkerId, { top: number; h: number }>> = {
    hb: { top: 26, h: 104 },
    ret: { top: 164, h: 72 },
    off: { top: 270, h: 84 },
};
const COL_TOP = PANELS.hb.top - 4;
const COL_BOTTOM = PANELS.off.top + PANELS.off.h + 4;

const slotX = (k: number): number => PL + SLOT_PAD + k * SLOT_W;
const NODE_X = [PL, ...Array.from({ length: N_SAMPLES }, (_, k) => slotX(k)), PLOT_R];

const yOf = (m: MarkerSpec, v: number): number => {
    const { top, h } = PANELS[m.id];
    const [d0, d1] = m.domain;
    return top + h - ((v - d0) / (d1 - d0)) * h;
};

/** Curva monotônica (estilo d3.curveMonotoneX): suave, sem ultrapassar os nós. */
const tangents = (xs: readonly number[], ys: readonly number[]): number[] => {
    const n = xs.length;
    const s = xs.slice(1).map((x, i) => (ys[i + 1] - ys[i]) / (x - xs[i]));
    return xs.map((_, i) => {
        if (i === 0) return s[0];
        if (i === n - 1) return s[n - 2];
        const s0 = s[i - 1];
        const s1 = s[i];
        if (s0 * s1 <= 0) return 0;
        const h0 = xs[i] - xs[i - 1];
        const h1 = xs[i + 1] - xs[i];
        const p = (s0 * h1 + s1 * h0) / (h0 + h1);
        return Math.sign(s0) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p));
    });
};

const curve = (xs: readonly number[], ys: readonly number[], reverse: boolean): string => {
    const t = tangents(xs, ys);
    const segs = xs.slice(1).map((x1, i) => {
        const x0 = xs[i];
        const h = (x1 - x0) / 3;
        return { a: [x0, ys[i]], c1: [x0 + h, ys[i] + t[i] * h], c2: [x1 - h, ys[i + 1] - t[i + 1] * h], b: [x1, ys[i + 1]] };
    });
    if (!reverse) return segs.map(g => `C${g.c1[0]},${g.c1[1]} ${g.c2[0]},${g.c2[1]} ${g.b[0]},${g.b[1]}`).join(' ');
    return [...segs].reverse().map(g => `C${g.c2[0]},${g.c2[1]} ${g.c1[0]},${g.c1[1]} ${g.a[0]},${g.a[1]}`).join(' ');
};

const bandPath = (lo: readonly number[], hi: readonly number[]): string =>
    `M${NODE_X[0]},${hi[0]} ${curve(NODE_X, hi, false)} L${NODE_X[NODE_X.length - 1]},${lo[lo.length - 1]} ${curve(NODE_X, lo, true)} Z`;

const edgePath = (ys: readonly number[]): string => `M${NODE_X[0]},${ys[0]} ${curve(NODE_X, ys, false)}`;

export interface PassportChartProps {
    readonly protocol: Protocol;
    readonly analysis: Analysis;
    readonly visibleCount: number;
    readonly verdictOn: boolean;
    readonly dimTunnel: boolean;
    readonly showPhases: boolean;
    readonly hovered: number | null;
    readonly onHover: (k: number | null) => void;
}

const NODES = NODE_X.length;

export const PassportChart = ({
    protocol, analysis, visibleCount, verdictOn, dimTunnel, showPhases, hovered, onHover,
}: PassportChartProps) => {
    const reduce = useReducedMotion() ?? false;

    // Alvo do corredor em coordenadas de tela: [marcador][lo|hi][nó], achatado para o tween.
    const target = useMemo(() => MARKERS.flatMap(m => {
        const ivs = [analysis.slots[0].intervals[m.id], ...analysis.slots.map(s => s.intervals[m.id]), analysis.current[m.id]];
        return [...ivs.map(iv => yOf(m, iv.lo)), ...ivs.map(iv => yOf(m, iv.hi))];
    }), [analysis]);
    const band = useTween(target);

    const newest = visibleCount - 1;
    const firstFlag = verdictOn ? analysis.firstFlag : null;
    const tunnelReady = visibleCount >= MIN_BASELINE;

    return (
        <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="w-full h-auto block select-none" role="img"
            aria-label="Gráfico longitudinal de hemoglobina, reticulócitos e OFF-score com corredor individual">
            <defs>
                <filter id="pp-glow" x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                {MARKERS.map(m => (
                    <clipPath key={m.id} id={`pp-clip-${m.id}`}>
                        <rect x={PL} y={PANELS[m.id].top} width={PLOT_R - PL} height={PANELS[m.id].h} />
                    </clipPath>
                ))}
                {MARKERS.map(m => {
                    // O corredor "vira túnel" (mais denso) a partir da 3ª coleta.
                    const off = tunnelReady ? (slotX(MIN_BASELINE) - SLOT_W / 2 - PL) / (PLOT_R - PL) : 1;
                    return (
                        <linearGradient key={m.id} id={`pp-band-${m.id}`} gradientUnits="userSpaceOnUse" x1={PL} x2={PLOT_R} y1={0} y2={0}>
                            <stop offset={0} stopColor={m.color} stopOpacity={0.09} />
                            <stop offset={off} stopColor={m.color} stopOpacity={0.09} />
                            <stop offset={Math.min(1, off + 0.04)} stopColor={m.color} stopOpacity={0.24} />
                            <stop offset={1} stopColor={m.color} stopOpacity={0.24} />
                        </linearGradient>
                    );
                })}
            </defs>

            {/* Fases da manipulação */}
            {showPhases && protocol.phases.map(ph => {
                const x0 = slotX(ph.from) - SLOT_W / 2 + 3;
                const x1 = slotX(ph.to) + SLOT_W / 2 - 3;
                return (
                    <motion.g key={`${protocol.id}-${ph.label}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                        <rect x={x0} y={COL_TOP} width={x1 - x0} height={COL_BOTTOM - COL_TOP} rx={8} fill={ph.color} fillOpacity={0.07} stroke={ph.color} strokeOpacity={0.3} strokeDasharray="3 4" />
                        <text x={(x0 + x1) / 2} y={PANELS.hb.top - 12} textAnchor="middle" fontSize={FS} fontWeight={700} fill={ph.color}>{ph.label}</text>
                    </motion.g>
                );
            })}

            {/* Coluna vermelha da coleta com ATF */}
            {verdictOn && analysis.slots.map((s, k) => s.flagged && (
                <motion.rect key={`atf-col-${protocol.id}-${k}`} x={slotX(k) - 17} y={COL_TOP} width={34} height={COL_BOTTOM - COL_TOP} rx={17}
                    fill={RED} initial={{ opacity: 0 }} animate={{ opacity: 0.13 }} transition={{ duration: 0.5 }} />
            ))}

            {/* Varredura da coleta que acabou de chegar */}
            {newest >= 0 && !reduce && (
                <motion.rect key={`scan-${protocol.id}-${newest}`} x={slotX(newest) - 22} y={COL_TOP} width={44} height={COL_BOTTOM - COL_TOP} rx={22}
                    fill="#ffffff" initial={{ opacity: 0.16 }} animate={{ opacity: 0 }} transition={{ duration: 1.1, ease: 'easeOut' }} />
            )}

            {MARKERS.map((m, mi) => {
                const { top, h } = PANELS[m.id];
                const base = mi * NODES * 2;
                const lo = band.slice(base, base + NODES);
                const hi = band.slice(base + NODES, base + NODES * 2);
                const pts = protocol.samples.slice(0, visibleCount).map((s, k) => ({ k, x: slotX(k), y: yOf(m, markerValue(s, m.id)), v: markerValue(s, m.id) }));
                                const n = analysis.currentN;
                const bandLabel = n === 0 ? 'priori populacional' : n < MIN_BASELINE ? `corredor em formação (${n}/${MIN_BASELINE})` : 'túnel individual';

                return (
                    <g key={m.id}>
                        {/* Título do painel */}
                        <text x={PL} y={top - 12} fontSize={FS} fontWeight={700} fill="#F3F4F6" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.02em' }}>
                            {m.name}
                            <tspan dx={8} fontSize={FS} fontWeight={500} fill="rgba(229,231,235,0.85)" style={MONO}>{m.unit}</tspan>
                        </text>

                        {/* Grade e eixo */}
                        <rect x={PL} y={top} width={PLOT_R - PL} height={h} fill="rgba(255,255,255,0.015)" rx={4} />
                        {m.ticks.map(t => (
                            <g key={t}>
                                <line x1={PL} x2={PLOT_R} y1={yOf(m, t)} y2={yOf(m, t)} stroke="rgba(255,255,255,0.06)" />
                                <text x={PL - 8} y={yOf(m, t) + 5} textAnchor="end" fontSize={FS} fill="rgba(229,231,235,0.85)" style={MONO}>
                                    {fmt(t, m.id === 'ret' ? 1 : 0)}
                                </text>
                            </g>
                        ))}

                        {/* Corredor individual (bayesiano) */}
                        <g clipPath={`url(#pp-clip-${m.id})`} style={{ opacity: dimTunnel ? 0.6 : 1, transition: 'opacity 0.6s ease' }}>
                            <path d={bandPath(lo, hi)} fill={`url(#pp-band-${m.id})`} />
                            <path d={edgePath(hi)} fill="none" stroke={m.color} strokeOpacity={0.75} strokeWidth={1.6} />
                            <path d={edgePath(lo)} fill="none" stroke={m.color} strokeOpacity={0.75} strokeWidth={1.6} />
                        </g>
                        {m.id === 'hb' && (
                            <text x={PL + 240} y={top - 12} fontSize={FS} fontWeight={700} fill={m.color}
                                style={{ opacity: dimTunnel ? 0.75 : 1, transition: 'opacity 0.6s ease' }}>
                                {bandLabel}
                            </text>
                        )}
                        {/* Limites populacionais fixos */}
                        <g style={{ opacity: dimTunnel ? 1 : 0.85, transition: 'opacity 0.6s ease' }}>
                            {[m.popLow, m.popHigh].map(v => v !== undefined && (
                                <line key={v} x1={PL} x2={PLOT_R} y1={yOf(m, v)} y2={yOf(m, v)} stroke={POP} strokeWidth={dimTunnel ? 2.2 : 1.5} strokeDasharray="7 5" />
                            ))}
                        </g>
                        {m.id === 'hb' && (
                            <text x={PL + 8} y={yOf(m, 16) - 8} fontSize={FS} fontWeight={600} fill="rgba(255,255,255,0.9)">
                                limite populacional fixo · 12,0–16,0 g/dL
                            </text>
                        )}
                        {/* Limites de ret/OFF ficam na linha do título (fora da área plotada) */}
                        {m.id === 'ret' && (
                            <text x={PLOT_R} y={top - 12} textAnchor="end" fontSize={FS} fill="rgba(255,255,255,0.92)">limite fixo · 0,5–1,5%</text>
                        )}
                        {m.id === 'off' && (
                            <>
                                <line x1={PL} x2={PLOT_R} y1={yOf(m, OFF_SUSPECT)} y2={yOf(m, OFF_SUSPECT)} stroke="#F59E0B" strokeOpacity={0.7} strokeWidth={1.3} strokeDasharray="2 4" />
                                <text x={PLOT_R} y={top - 12} textAnchor="end" fontSize={FS} fill="rgba(255,255,255,0.92)">
                                    limite fixo · 130 (&gt; 99,9%)
                                    <tspan dx={18} fill="#FBBF24" fontWeight={700}>&gt; 85 suspeito</tspan>
                                </text>
                            </>
                        )}

                        {/* Linha do atleta */}
                        {pts.slice(1).map((p, i) => (
                            <motion.line key={`seg-${m.id}-${p.k}-${p.v}-${pts[i].v}`} x1={pts[i].x} y1={pts[i].y} x2={p.x} y2={p.y}
                                stroke={m.color} strokeOpacity={0.55} strokeWidth={2}
                                initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, ease: 'easeOut' }} />
                        ))}

                        {/* Pontos (coletas) */}
                        {pts.map(p => {
                            const slot = analysis.slots[p.k];
                            const out = verdictOn && slot.flagged && slot.tunnelOut[m.id];
                            const isHover = hovered === p.k;
                            return (
                                <g key={`pt-${m.id}-${p.k}-${p.v}`} onMouseEnter={() => onHover(p.k)} onMouseLeave={() => onHover(null)} style={{ cursor: 'pointer' }}>
                                    {out && !reduce && (
                                        <motion.circle cx={p.x} cy={p.y} fill="none" stroke={RED} strokeWidth={2}
                                            initial={{ r: 7, opacity: 0.8 }} animate={{ r: 20, opacity: 0 }}
                                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />
                                    )}
                                    <motion.circle cx={p.x} r={isHover ? 8 : out ? 7 : 5.5}
                                        fill={out ? RED : m.color} stroke="#050510" strokeWidth={2}
                                        filter={out ? 'url(#pp-glow)' : undefined}
                                        initial={reduce ? false : { cy: p.y - 46, opacity: 0 }}
                                        animate={{ cy: p.y, opacity: 1 }}
                                        transition={{ type: 'spring', stiffness: 260, damping: 18 }} />
                                    <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
                                </g>
                            );
                        })}
                    </g>
                );
            })}

            {/* Contraste: limite fixo × túnel individual, na 1ª coleta com ATF */}
            {firstFlag !== null && (() => {
                const hb = MARKERS[0];
                const s = protocol.samples[firstFlag];
                const px = slotX(firstFlag);
                const py = yOf(hb, s.hb);
                const popY = yOf(hb, 16);
                const bw = 300;
                const bh = 28;
                const bx = px - 28 - bw;
                const by = popY + 9;
                return (
                    <motion.g key={`callout-${protocol.id}-${firstFlag}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}>
                        <line x1={bx + bw} y1={by + bh / 2} x2={px - 9} y2={py} stroke={RED} strokeWidth={1.6} />
                        <rect x={bx} y={by} width={bw} height={bh} rx={8} fill="#1a0610" stroke={RED} strokeWidth={1.5} />
                        <text x={bx + 10} y={by + 20} fontSize={FS} fontWeight={800} fill="#FDA4AF" style={{ fontFamily: 'var(--font-display)' }}>⚠ ATF · fora do túnel (&gt; 99,9%)</text>
                        <text x={PLOT_R - 6} y={popY - 8} textAnchor="end" fontSize={FS} fontWeight={700} fill="#E5E7EB">
                            {fmt(s.hb, 1)} &lt; 16,0 → limite fixo não detecta
                        </text>
                    </motion.g>
                );
            })()}

            {/* Eixo do tempo */}
            {Array.from({ length: N_SAMPLES }, (_, k) => {
                const flagged = verdictOn && analysis.slots[k].flagged;
                const vis = k < visibleCount;
                return (
                    <text key={k} x={slotX(k)} y={VB_H - 5} textAnchor="middle" fontSize={FS} fontWeight={flagged ? 800 : 600}
                        fill={flagged ? '#FB7185' : vis ? '#E5E7EB' : 'rgba(229,231,235,0.6)'} style={MONO}>
                        Ex.{k + 1}
                    </text>
                );
            })}
            <text x={2} y={VB_H - 5} fontSize={FS} fill="rgba(229,231,235,0.85)">coletas →</text>
        </svg>
    );
};
