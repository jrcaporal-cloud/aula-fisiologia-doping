import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const NODES = [
    {
        id: 0,
        label: 'Coração & Sangue',
        sub: 'Capacidade O₂',
        icon: '🫀',
        drugs: ['EPO', 'Transfusões', 'AICAR'],
        color: '#e11d48',
        glow: 'rgba(225,29,72,0.4)',
        bg: 'rgba(127,29,29,0.25)',
        border: 'rgba(225,29,72,0.4)',
        detail: 'A EPO estimula eritropoiese na medula óssea, elevando o VO₂máx em até 5–7%. Com Hct >55%, o sangue se torna viscoso — risco de trombose fatal durante bradicardia do sono. Janela de detecção da rhEPO: apenas 24–72h.',
    },
    {
        id: 1,
        label: 'Mitocôndrias',
        sub: 'Eficiência de Substrato',
        icon: '⚡',
        drugs: ['Beta-2 Agonistas', 'AICAR', 'GW501516'],
        color: '#f59e0b',
        glow: 'rgba(245,158,11,0.4)',
        bg: 'rgba(120,53,0,0.25)',
        border: 'rgba(245,158,11,0.4)',
        detail: 'AICAR ativa AMPK simulando "baixa energia celular". Induz expressão de PGC-1α — regulador-mestre da biogênese mitocondrial. Mais mitocôndrias = maior capacidade oxidativa por kg de músculo.',
    },
    {
        id: 2,
        label: 'Fibra Muscular',
        sub: 'Output Neuromotor',
        icon: '💪',
        drugs: ['EAA', 'hGH', 'Insulina', 'IGF-1'],
        color: '#34d399',
        glow: 'rgba(52,211,153,0.4)',
        bg: 'rgba(6,78,59,0.25)',
        border: 'rgba(52,211,153,0.4)',
        detail: 'EAA age via Receptores Androgênicos → proliferação de células satélite → mionúcleos extras permanentes. hGH induz IGF-1 local ativando PI3K/Akt/mTOR para síntese proteica máxima.',
    },
];

// SVG dimensions — generous so labels stay inside
const W = 560;
const H = 380;

// Explicit vertex positions
const VERTS = [
    { x: 280, y: 90 },   // top — Coração
    { x: 90, y: 310 },  // bottom-left — Mitocôndrias
    { x: 470, y: 310 },  // bottom-right — Fibra Muscular
];

// Explicit label anchor positions (inside the SVG viewBox)
const LABEL_POS = [
    { x: 280, y: 34, anchor: 'middle' as const },   // above top node
    { x: 90, y: 358, anchor: 'middle' as const },  // below bottom-left node
    { x: 470, y: 358, anchor: 'middle' as const },  // below bottom-right node
];

const CENTER = { x: 280, y: 237 };
const NODE_R = 36;

export const TriangleInfographic = () => {
    const [active, setActive] = useState<number | null>(null);
    const activeNode = active !== null ? NODES[active] : null;

    return (
        <div className="w-full mt-2 font-body">
            <div className="flex flex-col xl:flex-row gap-6 items-start">

                {/* ═══ SVG column ═══ */}
                <div className="flex-shrink-0 w-full max-w-[420px]">
                    <svg
                        viewBox={`0 0 ${W} ${H}`}
                        className="w-full"
                        style={{ overflow: 'hidden' }}
                    >
                        <defs>
                            {NODES.map(n => (
                                <radialGradient key={n.id} id={`rg-${n.id}`} cx="50%" cy="50%" r="50%">
                                    <stop offset="0%" stopColor={n.color} stopOpacity="0.3" />
                                    <stop offset="100%" stopColor={n.color} stopOpacity="0" />
                                </radialGradient>
                            ))}
                            <filter id="nf" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur stdDeviation="7" result="b" />
                                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                        </defs>

                        {/* Triangle edges */}
                        {[0, 1, 2].map(i => {
                            const from = VERTS[i], to = VERTS[(i + 1) % 3];
                            const lit = active === i || active === (i + 1) % 3;
                            return (
                                <motion.line key={i}
                                    x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                                    stroke={lit ? NODES[i].color : 'rgba(255,255,255,0.1)'}
                                    strokeWidth={lit ? 1.5 : 1}
                                    strokeDasharray="5 4"
                                    animate={{ opacity: lit ? 0.9 : 0.25 }}
                                    transition={{ duration: 0.3 }}
                                />
                            );
                        })}

                        {/* Spokes center → node */}
                        {NODES.map((n, i) => (
                            <motion.line key={`sp${i}`}
                                x1={CENTER.x} y1={CENTER.y}
                                x2={VERTS[i].x} y2={VERTS[i].y}
                                stroke={n.color}
                                strokeWidth={active === i ? 2 : 1}
                                strokeDasharray="4 5"
                                animate={{ opacity: active === i ? 1 : 0.2 }}
                                transition={{ duration: 0.3 }}
                            />
                        ))}

                        {/* Animated particles */}
                        {NODES.map((n, i) => (
                            <motion.circle key={`pt${i}`} r={4} fill={n.color}
                                initial={{ cx: CENTER.x, cy: CENTER.y }}
                                opacity={active === null || active === i ? 0.85 : 0.1}
                                animate={{
                                    cx: [CENTER.x, VERTS[i].x, CENTER.x],
                                    cy: [CENTER.y, VERTS[i].y, CENTER.y],
                                }}
                                transition={{ duration: 2.6 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 1.2 }}
                            />
                        ))}

                        {/* Center hub */}
                        <motion.circle cx={CENTER.x} cy={CENTER.y} r={32}
                            fill="rgba(0,0,0,0.8)"
                            stroke="rgba(255,255,255,0.12)" strokeWidth={1.5}
                            initial={{ r: 32 }}
                            animate={{ r: [32, 35, 32] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <text x={CENTER.x} y={CENTER.y - 5} textAnchor="middle" fill="white" fontSize="8" fontWeight="700" letterSpacing="0.8">PERFORMANCE</text>
                        <text x={CENTER.x} y={CENTER.y + 8} textAnchor="middle" fill="white" fontSize="8" fontWeight="700" letterSpacing="0.8">TOTAL</text>

                        {/* Nodes */}
                        {NODES.map((n, i) => {
                            const v = VERTS[i];
                            const lp = LABEL_POS[i];
                            const isAct = active === i;
                            return (
                                <g key={`node${i}`} style={{ cursor: 'pointer' }}
                                    onClick={() => setActive(isAct ? null : i)}>

                                    {/* Glow */}
                                    {isAct && (
                                        <circle cx={v.x} cy={v.y} r={55}
                                            fill={`url(#rg-${n.id})`} />
                                    )}

                                    {/* Circle */}
                                    <motion.circle
                                        cx={v.x} cy={v.y}
                                        r={isAct ? NODE_R + 5 : NODE_R}
                                        fill="rgba(6,6,15,0.92)"
                                        stroke={n.color}
                                        strokeWidth={isAct ? 2.5 : 1.5}
                                        animate={{ strokeOpacity: isAct ? 1 : 0.45 }}
                                        filter={isAct ? 'url(#nf)' : undefined}
                                        transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                                    />

                                    {/* Icon */}
                                    <text x={v.x} y={v.y + 8} textAnchor="middle" fontSize="22">{n.icon}</text>

                                    {/* Name label */}
                                    <text
                                        x={lp.x} y={lp.y}
                                        textAnchor={lp.anchor}
                                        fill={isAct ? n.color : 'rgba(255,255,255,0.85)'}
                                        fontSize="10.5"
                                        fontWeight="700"
                                        style={{ transition: 'fill 0.2s' }}
                                    >{n.label}</text>

                                    {/* Sub label */}
                                    <text
                                        x={lp.x} y={lp.y + 13}
                                        textAnchor={lp.anchor}
                                        fill="rgba(255,255,255,0.38)"
                                        fontSize="8.5"
                                    >{n.sub}</text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* ═══ Right column: detail + buttons ═══ */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                    <AnimatePresence mode="wait">
                        {activeNode ? (
                            <motion.div
                                key={activeNode.id}
                                initial={{ opacity: 0, x: 16, filter: 'blur(5px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: -16, filter: 'blur(5px)' }}
                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                className="rounded-2xl border p-5 space-y-4 flex-1"
                                style={{ background: activeNode.bg, borderColor: activeNode.border, boxShadow: `0 0 28px ${activeNode.glow}` }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{activeNode.icon}</span>
                                    <div>
                                        <div className="font-display font-bold text-lg leading-tight" style={{ color: activeNode.color }}>{activeNode.label}</div>
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider">{activeNode.sub}</div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-300 leading-relaxed">{activeNode.detail}</p>
                                <div>
                                    <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Agentes utilizados</div>
                                    <div className="flex flex-wrap gap-2">
                                        {activeNode.drugs.map(d => (
                                            <span key={d} className="text-xs px-2.5 py-1 rounded-full border font-medium"
                                                style={{ color: activeNode.color, borderColor: activeNode.border, background: `${activeNode.glow.replace('0.4', '0.12')}` }}>
                                                {d}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-2xl border border-white/8 flex flex-col items-center justify-center text-center p-8"
                                style={{ background: 'rgba(255,255,255,0.02)', minHeight: '200px' }}
                            >
                                <div className="text-4xl mb-3">🎯</div>
                                <p className="text-gray-400 text-sm">Clique em um dos <strong className="text-white">3 nós</strong> do diagrama para explorar cada eixo</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Quick-select buttons */}
                    <div className="grid grid-cols-3 gap-2">
                        {NODES.map((n, i) => (
                            <motion.button
                                key={n.id}
                                onClick={() => setActive(active === i ? null : i)}
                                className="rounded-xl border p-3 text-left cursor-pointer"
                                style={{
                                    borderColor: active === i ? n.border : 'rgba(255,255,255,0.07)',
                                    background: active === i ? n.bg : 'rgba(255,255,255,0.02)',
                                }}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.96 }}
                                transition={{ type: 'spring', stiffness: 280, damping: 20 }}
                            >
                                <div className="text-lg mb-1">{n.icon}</div>
                                <div className="text-[11px] font-semibold leading-tight" style={{ color: active === i ? n.color : '#9ca3af' }}>{n.label}</div>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
