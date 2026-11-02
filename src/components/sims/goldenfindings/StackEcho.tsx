import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { buildGears, gearPath } from '../stack/gearGeometry';
import { useGearSpin } from '../stack/useGearSpin';
import { EASE, strokeK, type EchoProps } from './echoKit';
import { EchoSvg, Label } from './EchoParts';

/**
 * Eco do slide "O STACK OLÍMPICO": as mesmas três engrenagens (geometria do StackSim) com os
 * nomes e papéis do achado, girando juntas e alimentando a via mTOR.
 */

const GEARS = buildGears({ teeth: [16, 12, 8], c1: [150, 252], a12: (-40 * Math.PI) / 180, a23: (10 * Math.PI) / 180 });
const PATHS = GEARS.map(g => gearPath(g.teeth, g.r));

interface GearText {
    readonly name: string;
    readonly nameSize: number;
    readonly color: string;
    readonly role: readonly string[];
    readonly roleAt: { readonly x: number; readonly y: number; readonly anchor: 'start' | 'middle' | 'end' };
}

const TEXT: readonly GearText[] = [
    { name: 'Testosterona', nameSize: 17, color: '#60A5FA', role: ['Músculo Bruto'], roleAt: { x: GEARS[0].cx, y: GEARS[0].cy + GEARS[0].r + 36, anchor: 'middle' } },
    { name: 'GH', nameSize: 28, color: '#10B981', role: ['Agente Abridor de Vias'], roleAt: { x: GEARS[1].cx, y: GEARS[1].cy - GEARS[1].r - 24, anchor: 'middle' } },
    { name: 'Insulina', nameSize: 14, color: '#E11D48', role: ['Condutor e Bloqueador', 'Máximo da Quebra'], roleAt: { x: 592, y: 62, anchor: 'end' } },
];

const MTOR = { x: 520, y: 312, r: 40 } as const;
const G3 = GEARS[2];
const FLOW = `M${G3.cx + 34} ${G3.cy + 44} C ${G3.cx + 60} ${G3.cy + 90}, ${MTOR.x - 50} ${MTOR.y - 70}, ${MTOR.x - 24} ${MTOR.y - 32}`;
const SPIN_DELAY_MS = 1300;

export const StackEcho = ({ compact }: EchoProps) => {
    const reduce = useReducedMotion() ?? false;
    const k = strokeK(compact);
    const [spinning, setSpinning] = useState(false);
    const refs = useGearSpin(GEARS, spinning && !reduce, 0);
    const d = (s: number) => (reduce ? 0 : s);

    useEffect(() => {
        const id = setTimeout(() => setSpinning(true), reduce ? 0 : SPIN_DELAY_MS);
        return () => clearTimeout(id);
    }, [reduce]);

    return (
        <EchoSvg label="Três engrenagens — testosterona, GH e insulina — girando juntas e ativando a via mTOR">
            <defs>
                {TEXT.map((t, i) => (
                    <radialGradient key={t.name} id={`gf-gear-${i}`} cx="40%" cy="35%" r="75%">
                        <stop offset="0%" stopColor={t.color} stopOpacity={0.55} />
                        <stop offset="100%" stopColor={t.color} stopOpacity={0.16} />
                    </radialGradient>
                ))}
                <radialGradient id="gf-mtor" cx="40%" cy="35%" r="70%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="100%" stopColor="#B45309" />
                </radialGradient>
            </defs>

            {GEARS.map((g, i) => {
                const t = TEXT[i];
                return (
                    <motion.g
                        key={t.name}
                        initial={reduce ? false : { opacity: 0, x: 40, y: -30 }} animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: d(0.8), delay: d(i * 0.35), ease: EASE }}
                    >
                        <g ref={el => { refs.current[i] = el; }}>
                            <path d={PATHS[i]} fill={`url(#gf-gear-${i})`} stroke={t.color} strokeWidth={2.4 * k} strokeLinejoin="round" />
                            <circle r={g.r * 0.6} fill="none" stroke={t.color} strokeOpacity={0.4} strokeWidth={1.5 * k} />
                            <circle r={g.r * 0.12} fill="#050510" stroke={t.color} strokeWidth={1.5 * k} />
                        </g>
                        {!compact && (
                            <text x={g.cx} y={g.cy + t.nameSize * 0.36} textAnchor="middle" className="font-display"
                                fontSize={t.nameSize} fontWeight={700} fill="#fff" style={{ pointerEvents: 'none' }}>
                                {t.name}
                            </text>
                        )}
                        {t.role.map((line, j) => (
                            <Label key={line} compact={compact} x={t.roleAt.x} y={t.roleAt.y + j * 20} anchor={t.roleAt.anchor}
                                size={15} weight={600} fill={t.color === '#E11D48' ? '#FDA4AF' : t.color === '#10B981' ? '#A7F3D0' : '#BFDBFE'} delay={0.5 + i * 0.35}>
                                {line}
                            </Label>
                        ))}
                    </motion.g>
                );
            })}

            {/* fluxo para a via mTOR */}
            <motion.path
                d={FLOW} fill="none" stroke="#FCD34D" strokeOpacity={0.6} strokeWidth={2.5 * k} strokeDasharray={compact ? undefined : '6 6'}
                initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: d(0.6), delay: d(1.3) }}
            />
            {!reduce && spinning && [0, 1, 2].map(j => (
                <motion.circle key={j} r={4.5 * k} fill="#FCD34D"
                    style={{ offsetPath: `path("${FLOW}")` }}
                    initial={{ offsetDistance: '0%', opacity: 0 }}
                    animate={{ offsetDistance: ['0%', '100%'], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.6, delay: j * 0.53, repeat: Infinity, ease: 'easeIn' }} />
            ))}
            <motion.g
                initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: d(0.5), delay: d(1.7), ease: EASE }}
                style={{ transformOrigin: `${MTOR.x}px ${MTOR.y}px` }}
            >
                <motion.circle cx={MTOR.x} cy={MTOR.y} r={MTOR.r + 10} fill="none" stroke="#FCD34D" strokeWidth={2 * k}
                    animate={reduce ? { opacity: 0.5 } : { opacity: [0.15, 0.7, 0.15] }}
                    transition={reduce ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
                <circle cx={MTOR.x} cy={MTOR.y} r={MTOR.r} fill="url(#gf-mtor)" stroke="#FDE68A" strokeWidth={1.5 * k} />
                {!compact && <text x={MTOR.x} y={MTOR.y + 7} textAnchor="middle" className="font-display" fontSize={20} fontWeight={700} fill="#1C1917">mTOR</text>}
            </motion.g>
            <Label compact={compact} x={MTOR.x} y={MTOR.y + MTOR.r + 30} anchor="middle" size={15} weight={600} fill="#FDE68A" delay={1.9}>
                via mTOR
            </Label>
        </EchoSvg>
    );
};
