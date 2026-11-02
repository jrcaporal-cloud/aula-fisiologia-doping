import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EASE, LAYERS, STAGE_H, STAGE_W } from './content';

const RED = LAYERS[3].color;
const RED_INK = LAYERS[3].ink;
const ON = '#34D399';
const OFF = 'rgba(156,163,175,0.45)';

/** Instantes (ms) das fases: T exógena → GnRH/LH/FSH param → Leydig atrofiam → VE engrossa. */
const PHASE_AT = [400, 1700, 2900, 4100];

const usePhase = (still: boolean) => {
    const [phase, setPhase] = useState(still ? PHASE_AT.length : 0);
    useEffect(() => {
        if (still) return;
        const timers = PHASE_AT.map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms));
        return () => timers.forEach(window.clearTimeout);
    }, [still]);
    return phase;
};

const NODE_X = 30;
const NODE_W = 150;
const NODES = [
    { y: 52, label: 'Hipotálamo' },
    { y: 158, label: 'Hipófise' },
    { y: 264, label: 'Testículos' },
];
const LINKS = [
    { y1: 92, y2: 156, label: 'GnRH' },
    { y1: 198, y2: 262, label: 'LH/FSH' },
];

interface AxisProps { phase: number; still: boolean }

/** Eixo HPG: a T exógena desliga o eixo por feedback negativo. */
const HpgAxis = ({ phase, still }: AxisProps) => {
    const dur = still ? 0 : 0.7;
    const off = phase >= 2;
    const cx = NODE_X + NODE_W / 2;
    return (
        <g>
            <text x={20} y={30} fill="#9CA3AF" fontSize={12} className="font-mono" letterSpacing={1.5}>EIXO HPG</text>
            {LINKS.map(l => (
                <g key={l.label}>
                    <motion.line
                        x1={cx} x2={cx} y1={l.y1} y2={l.y2 - 6} strokeWidth={3} strokeLinecap="round"
                        animate={{ stroke: off ? OFF : ON, strokeDasharray: off ? '4 6' : '0 0' }} transition={{ duration: dur }}
                    />
                    <motion.path d={`M${cx - 7} ${l.y2 - 12} L${cx} ${l.y2 - 3} L${cx + 7} ${l.y2 - 12}`} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                        animate={{ stroke: off ? OFF : ON }} transition={{ duration: dur }} />
                    <motion.text x={cx - 14} y={(l.y1 + l.y2) / 2 + 5} textAnchor="end" fontSize={14} fontWeight={700} className="font-mono"
                        animate={{ fill: off ? '#9CA3AF' : '#A7F3D0' }} transition={{ duration: dur }}>{l.label}</motion.text>
                    {off && (
                        <motion.text x={cx + 12} y={(l.y1 + l.y2) / 2 + 6} fill={RED_INK} fontSize={15} fontWeight={700} className="font-body"
                            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: dur }}>
                            ✕ para
                        </motion.text>
                    )}
                </g>
            ))}
            {NODES.map((n, i) => {
                const atrophy = i === 2 && phase >= 3;
                return (
                    <motion.g key={n.label}
                        animate={{ scale: atrophy ? 0.86 : 1 }} transition={{ duration: still ? 0 : 1, ease: EASE }}
                        style={{ transformOrigin: `${cx}px ${n.y + 20}px` }}>
                        <motion.rect x={NODE_X} y={n.y} width={NODE_W} height={40} rx={12} strokeWidth={1.5}
                            animate={{ fill: atrophy ? 'rgba(225,29,72,0.12)' : 'rgba(255,255,255,0.05)', stroke: atrophy ? RED : 'rgba(255,255,255,0.25)' }}
                            transition={{ duration: dur }} />
                        <text x={cx} y={n.y + 26} textAnchor="middle" fill="#F3F4F6" fontSize={15} fontWeight={600} className="font-body">{n.label}</text>
                    </motion.g>
                );
            })}
            {/* Saída dos testículos */}
            <motion.g animate={{ opacity: phase >= 3 ? 0.35 : 1 }} transition={{ duration: dur }}>
                <line x1={cx} x2={cx} y1={306} y2={330} stroke="#9CA3AF" strokeWidth={2} />
                <text x={cx} y={348} textAnchor="middle" fill="#E5E7EB" fontSize={13} className="font-body">T e espermatozoides</text>
            </motion.g>
            {phase >= 3 && (
                <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: dur }}>
                    <text x={20} y={378} fill={RED_INK} fontSize={14} fontWeight={700} className="font-body">Sem LH, células de Leydig atrofiam</text>
                    <text x={20} y={398} fill="#E5E7EB" fontSize={13} className="font-body">produção endógena nula em semanas</text>
                </motion.g>
            )}

            {/* T exógena e feedback negativo */}
            <motion.g initial={{ opacity: still ? 1 : 0, x: still ? 0 : 20 }} animate={{ opacity: phase >= 1 ? 1 : 0, x: phase >= 1 ? 0 : 20 }} transition={{ duration: dur, ease: EASE }}>
                <rect x={200} y={204} width={86} height={32} rx={16} fill={RED} />
                <text x={243} y={225} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={700} className="font-body">T exógena</text>
            </motion.g>
            <motion.path
                d={`M243 204 C 243 120, 240 72, ${NODE_X + NODE_W + 8} 72`}
                fill="none" stroke={RED} strokeWidth={2.5} strokeLinecap="round"
                initial={{ pathLength: still ? 1 : 0 }} animate={{ pathLength: phase >= 1 ? 1 : 0 }}
                transition={{ duration: still ? 0 : 0.9, delay: still ? 0 : 0.3, ease: 'easeInOut' }}
            />
            <motion.line x1={NODE_X + NODE_W + 8} x2={NODE_X + NODE_W + 8} y1={60} y2={84} stroke={RED} strokeWidth={3.5} strokeLinecap="round"
                initial={{ opacity: still ? 1 : 0 }} animate={{ opacity: phase >= 1 ? 1 : 0 }} transition={{ delay: still ? 0 : 1.1, duration: 0.2 }} />
            <motion.text x={236} y={160} textAnchor="end" fill={RED_INK} fontSize={13} fontWeight={600} className="font-body"
                initial={{ opacity: still ? 1 : 0 }} animate={{ opacity: phase >= 1 ? 1 : 0 }} transition={{ delay: still ? 0 : 1, duration: 0.4 }}>
                <tspan x={236}>feedback</tspan><tspan x={236} dy={17}>negativo</tspan>
            </motion.text>
        </g>
    );
};

const HEART = { cx: 470, cy: 196 };
const MM = 4; // px por mm
const WALLS = { control: 9.8, user: 13.2 };

/** Corte do VE: hipertrofia concêntrica (parede engrossa, cavidade encolhe). */
const Heart = ({ thick, onToggle, still }: { thick: boolean; onToggle: (v: boolean) => void; still: boolean }) => {
    const wall = (thick ? WALLS.user : WALLS.control) * MM;
    const R = thick ? 90 : 82;
    const r = R - wall;
    const { cx, cy } = HEART;
    const rv = (outer: number) => {
        const a1 = (125 * Math.PI) / 180, a2 = (235 * Math.PI) / 180;
        const p1 = [cx + (outer + 1) * Math.cos(a1), cy - (outer + 1) * Math.sin(a1)];
        const p2 = [cx + (outer + 1) * Math.cos(a2), cy - (outer + 1) * Math.sin(a2)];
        return `M${p1[0]} ${p1[1]} C ${cx - outer - 70} ${cy - outer * 0.9}, ${cx - outer - 70} ${cy + outer * 0.9}, ${p2[0]} ${p2[1]} Z`;
    };
    const t = { duration: still ? 0 : 1.4, ease: EASE };
    const label = thick ? '13,2 mm' : '9,8 mm';
    return (
        <g>
            <text x={318} y={30} fill="#9CA3AF" fontSize={12} className="font-mono" letterSpacing={1.5}>VENTRÍCULO ESQUERDO</text>
            <motion.path animate={{ d: rv(R) }} initial={false} transition={t} fill="rgba(159,18,57,0.35)" stroke="rgba(253,164,175,0.5)" strokeWidth={1.2} />
            <motion.circle cx={cx} cy={cy} initial={false} animate={{ r: R }} transition={t} fill="#9F1239" stroke="#FDA4AF" strokeWidth={1.5} />
            <motion.circle cx={cx} cy={cy} initial={false} animate={{ r }} transition={t} fill="#1A0710" stroke="rgba(253,164,175,0.6)" strokeWidth={1} />
            {/* Medida do septo interventricular */}
            <motion.g initial={false} animate={{ x: -R }} transition={t}>
                <line x1={cx} x2={cx} y1={cy - 8} y2={cy + 8} stroke="#fff" strokeWidth={2} />
            </motion.g>
            <motion.g initial={false} animate={{ x: -r }} transition={t}>
                <line x1={cx} x2={cx} y1={cy - 8} y2={cy + 8} stroke="#fff" strokeWidth={2} />
            </motion.g>
            <motion.line y1={cy} y2={cy} stroke="#fff" strokeWidth={2} initial={false} animate={{ x1: cx - R, x2: cx - r }} transition={t} />
            <text x={cx + 4} y={cy - 4} textAnchor="middle" fill="#FECDD3" fontSize={13} className="font-body">cavidade</text>
            <text x={cx - 128} y={cy + 4} textAnchor="middle" fill="#FECDD3" fontSize={13} className="font-body">VD</text>
            <text x={cx - 96} y={cy + 128} textAnchor="start" fill="#E5E7EB" fontSize={13} className="font-body">septo interventricular</text>
            <text x={cx - 96} y={cy + 150} fill={thick ? RED_INK : '#F3F4F6'} fontSize={22} fontWeight={700} className="font-mono">{label}</text>

            {/* Alternar controles × fisiculturistas */}
            {(['control', 'user'] as const).map((k, i) => {
                const active = (k === 'user') === thick;
                const x = 330 + i * 130;
                return (
                    <g key={k} onClick={() => onToggle(k === 'user')} style={{ cursor: 'pointer' }}>
                        <rect x={x} y={370} width={122} height={32} rx={16}
                            fill={active ? (k === 'user' ? 'rgba(225,29,72,0.25)' : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.03)'}
                            stroke={active ? (k === 'user' ? RED : 'rgba(255,255,255,0.6)') : 'rgba(255,255,255,0.15)'} />
                        <text x={x + 61} y={391} textAnchor="middle" fill={active ? '#fff' : '#9CA3AF'} fontSize={13} fontWeight={600} className="font-body">
                            {k === 'user' ? 'fisiculturistas' : 'controles'}
                        </text>
                    </g>
                );
            })}
        </g>
    );
};

/** Camada 4 — eixo HPG suprimido + hipertrofia ventricular concêntrica. */
export const StageSideEffects = () => {
    const still = !!useReducedMotion();
    const phase = usePhase(still);
    const [manual, setManual] = useState<boolean | null>(null);
    const thick = manual ?? phase >= 4;
    return (
        <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="w-full h-full" role="img" aria-label="Eixo HPG suprimido pela T exógena e hipertrofia ventricular concêntrica">
            <HpgAxis phase={phase} still={still} />
            <line x1={302} x2={302} y1={20} y2={404} stroke="rgba(255,255,255,0.1)" />
            <Heart thick={thick} onToggle={setManual} still={still} />
        </svg>
    );
};
