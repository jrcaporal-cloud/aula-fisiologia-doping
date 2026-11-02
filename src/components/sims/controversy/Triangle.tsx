import { motion, useReducedMotion } from 'framer-motion';
import { Drama, FlaskConical, Dna, type LucideIcon } from 'lucide-react';
import { VERTICES, type VertexId } from './content';

/** O triângulo: três vértices (controvérsias); o passo acende um por vez e, no fim, o conjunto. */

const W = 440;
const H = 470;
const R = 42;
const POS: readonly { x: number; y: number }[] = [
    { x: 220, y: 118 },
    { x: 104, y: 352 },
    { x: 336, y: 352 },
];
const CENTER = { x: 220, y: (POS[0].y + POS[1].y + POS[2].y) / 3 };
const ICONS: Readonly<Record<VertexId, LucideIcon>> = { trans: Dna, dili: FlaskConical, wada: Drama };
const TITLE_LINES: Readonly<Record<VertexId, readonly string[]>> = {
    trans: ['Atletas Trans &', 'Testosterona'],
    dili: ['Contaminação', 'Cruzada (DILI)'],
    wada: ['O Teatro', 'da WADA'],
};
const EDGES = [[0, 1], [1, 2], [2, 0]] as const;

/** Aresta entre dois vértices, recortada na borda dos círculos. */
const trimmed = (a: number, b: number) => {
    const dx = POS[b].x - POS[a].x;
    const dy = POS[b].y - POS[a].y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    const gap = R + 4;
    return { x1: POS[a].x + ux * gap, y1: POS[a].y + uy * gap, x2: POS[b].x - ux * gap, y2: POS[b].y - uy * gap };
};

/** Quebra o rótulo do centro em duas linhas equilibradas. */
const splitLabel = (label: string): readonly string[] => {
    const words = label.split(' ');
    const half = Math.ceil(words.length / 2);
    return [words.slice(0, half).join(' '), words.slice(half).join(' ')];
};

export interface TriangleProps {
    /** Vértice em foco (0–2) ou null. */
    readonly active: number | null;
    readonly all: boolean;
    readonly onSelect: (i: number) => void;
}

export const Triangle = ({ active, all, onSelect }: TriangleProps) => {
    const reduce = useReducedMotion() ?? false;
    const lit = (i: number): boolean => all || active === i;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full block" role="img" aria-label="Triângulo com as três controvérsias nos vértices">
            <defs>
                {EDGES.map(([a, b]) => (
                    <linearGradient key={`${a}${b}`} id={`ct-edge-${a}${b}`} gradientUnits="userSpaceOnUse" x1={POS[a].x} y1={POS[a].y} x2={POS[b].x} y2={POS[b].y}>
                        <stop offset={0} stopColor={VERTICES[a].color} />
                        <stop offset={1} stopColor={VERTICES[b].color} />
                    </linearGradient>
                ))}
                <radialGradient id="ct-core">
                    <stop offset={0} stopColor="#ffffff" stopOpacity={0.10} />
                    <stop offset={1} stopColor="#ffffff" stopOpacity={0} />
                </radialGradient>
                <filter id="ct-glow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="7" />
                </filter>
            </defs>

            {/* Arestas */}
            <motion.path d={`M${POS[0].x},${POS[0].y} L${POS[1].x},${POS[1].y} L${POS[2].x},${POS[2].y} Z`}
                fill="url(#ct-core)" animate={{ opacity: all ? 1 : 0.4 }} transition={{ duration: 0.6 }} />
            {EDGES.map(([a, b], i) => {
                const on = all || active === a || active === b;
                return (
                    <motion.line key={`${a}${b}`} {...trimmed(a, b)}
                        stroke={`url(#ct-edge-${a}${b})`} strokeLinecap="round"
                        initial={reduce ? false : { pathLength: 0 }}
                        animate={{ pathLength: 1, opacity: all ? 0.95 : on ? 0.6 : 0.22, strokeWidth: all ? 4 : on ? 3 : 2 }}
                        transition={{ pathLength: { duration: 0.9, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }, opacity: { duration: 0.5 }, strokeWidth: { duration: 0.5 } }} />
                );
            })}

            {/* Centro */}
            <motion.g key={all ? 'all' : `c-${active ?? 'none'}`} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }} style={{ transformOrigin: `${CENTER.x}px ${CENTER.y}px` }}>
                {all ? (
                    <text x={CENTER.x} y={CENTER.y + 8} textAnchor="middle" fontSize={22} fontWeight={700} fill="#fff" style={{ fontFamily: 'var(--font-display)' }}>▶ O Embate</text>
                ) : active !== null ? (
                    <text textAnchor="middle" fontSize={16} fontWeight={700} fill={VERTICES[active].soft} style={{ fontFamily: 'var(--font-display)' }}>
                        {splitLabel(VERTICES[active].label).map((line, li) => (
                            <tspan key={line} x={CENTER.x} y={CENTER.y - 4 + li * 20}>{line}</tspan>
                        ))}
                    </text>
                ) : (
                    <text x={CENTER.x} y={CENTER.y + 4} textAnchor="middle" fontSize={13} fill="#D1D5DB">clique em um vértice</text>
                )}
            </motion.g>

            {/* Vértices */}
            {VERTICES.map((v, i) => {
                const on = lit(i);
                const { x, y } = POS[i];
                const Icon = ICONS[v.id];
                const top = i === 0;
                const lines = TITLE_LINES[v.id];
                const ty = top ? y - R - 38 : y + R + 24;
                return (
                    <motion.g key={v.id} onClick={() => onSelect(i)} style={{ cursor: 'pointer' }}
                        initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.35 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}>
                        <motion.circle cx={x} cy={y} r={R + 10} fill={v.color} filter="url(#ct-glow)"
                            animate={{ opacity: on ? 0.45 : 0 }} transition={{ duration: 0.5 }} />
                        {on && active === i && !reduce && (
                            <motion.circle cx={x} cy={y} fill="none" stroke={v.color} strokeWidth={2}
                                initial={{ r: R, opacity: 0.8 }} animate={{ r: R + 22, opacity: 0 }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }} />
                        )}
                        <motion.circle cx={x} cy={y} r={R} strokeWidth={2.5}
                            animate={{ fill: on ? `${v.color}33` : 'rgba(8,8,18,0.95)', stroke: on ? v.color : 'rgba(255,255,255,0.28)' }}
                            transition={{ duration: 0.5 }} />
                        <foreignObject x={x - 13} y={y - 26} width={26} height={26} style={{ pointerEvents: 'none' }}>
                            <Icon size={26} color={on ? '#fff' : '#9CA3AF'} strokeWidth={1.8} />
                        </foreignObject>
                        <text x={x} y={y + 22} textAnchor="middle" fontSize={16} fontWeight={800} fill={on ? v.soft : '#D1D5DB'} style={{ fontFamily: 'var(--font-display)' }}>{v.num}</text>
                        {lines.map((line, li) => (
                            <text key={line} x={x} y={ty + li * 19} textAnchor="middle" fontSize={15} fontWeight={600}
                                fill={on ? '#fff' : '#D1D5DB'} style={{ fontFamily: 'var(--font-display)' }}>{line}</text>
                        ))}
                    </motion.g>
                );
            })}

            {/* Vértice 01 continua nos próximos slides */}
            <motion.g animate={{ opacity: active === 0 || all ? 1 : 0.7 }} transition={{ duration: 0.4 }}>
                <rect x={POS[0].x + R + 14} y={POS[0].y - 13} width={118} height={26} rx={13} fill="rgba(168,85,247,0.14)" stroke="rgba(196,181,253,0.6)" />
                <text x={POS[0].x + R + 73} y={POS[0].y + 4.5} textAnchor="middle" fontSize={12.5} fontWeight={600} fill="#DDD6FE">próximos slides →</text>
            </motion.g>
        </svg>
    );
};
