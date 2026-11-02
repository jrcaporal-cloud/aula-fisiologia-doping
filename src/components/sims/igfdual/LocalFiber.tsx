import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { COLORS } from './content';

/**
 * Zoom da fibra muscular sob tensão: o dano mecânico libera MGF localmente, que ativa uma célula satélite;
 * ela prolifera e a célula-filha vira um mionúcleo novo exatamente no ponto do dano.
 * Com GH exógeno o ciclo fica mais rápido (a aula: "acelerada em 3–5×"; aqui o ritmo usa 4×, o meio da faixa).
 */

export const FIBER = { x0: 384, x1: 682, y0: 104, y1: 150 } as const;
const MID_Y = (FIBER.y0 + FIBER.y1) / 2;
const DAMAGE_X = 560;
const BASE_PERIOD_MS = 5200;
const BOOST = 4;
const NEW_NUCLEI: readonly (readonly [number, number])[] = [[552, 118], [571, 135], [545, 138], [578, 117], [561, 128], [536, 124]];
const OLD_NUCLEI: readonly number[] = [418, 466, 640];
const SAT = { x: 520, y: FIBER.y0 - 5 } as const;

const DAMAGE_PATH = `M${DAMAGE_X - 6},${FIBER.y0} L${DAMAGE_X + 4},${FIBER.y0 + 12} L${DAMAGE_X - 5},${FIBER.y0 + 22} L${DAMAGE_X + 6},${FIBER.y0 + 33} L${DAMAGE_X - 2},${FIBER.y1}`;

const Arrow = ({ x, dir }: { x: number; dir: 1 | -1 }) => (
    <g stroke="#E5E7EB" strokeWidth={2.2} fill="none" strokeLinecap="round">
        <line x1={x} y1={MID_Y} x2={x + dir * 18} y2={MID_Y} />
        <path d={`M${x + dir * 12},${MID_Y - 6} L${x + dir * 19},${MID_Y} L${x + dir * 12},${MID_Y + 6}`} />
    </g>
);

interface LocalFiberProps {
    readonly active: boolean;
    readonly boost: boolean;
}

export const LocalFiber = ({ active, boost }: LocalFiberProps) => {
    const reduce = useReducedMotion();
    const period = boost ? BASE_PERIOD_MS / BOOST : BASE_PERIOD_MS;
    const [count, setCount] = useState(1);

    useEffect(() => {
        if (!active || reduce) return undefined;
        const id = window.setInterval(() => setCount(c => (c >= NEW_NUCLEI.length ? 1 : c + 1)), period);
        return () => window.clearInterval(id);
    }, [active, period, reduce]);

    const shown = reduce ? 3 : count;
    const cycle = { duration: period / 1000, repeat: Infinity, ease: 'easeInOut' as const };

    return (
        <g>
            {/* fibra */}
            <defs>
                <linearGradient id="igfd-fiber" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#7F1D3A" />
                    <stop offset="100%" stopColor="#3B0D1E" />
                </linearGradient>
                <radialGradient id="igfd-damage">
                    <stop offset="0%" stopColor="#FCA5A5" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#F87171" stopOpacity={0} />
                </radialGradient>
            </defs>
            <motion.g animate={active && !reduce ? { scaleX: [1, 1.025, 1] } : { scaleX: 1 }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} style={{ transformOrigin: `${(FIBER.x0 + FIBER.x1) / 2}px ${MID_Y}px` }}>
                <rect x={FIBER.x0} y={FIBER.y0} width={FIBER.x1 - FIBER.x0} height={FIBER.y1 - FIBER.y0} rx={22} fill="url(#igfd-fiber)" stroke="rgba(251,113,133,0.55)" strokeWidth={1.5} />
                {Array.from({ length: 34 }, (_, i) => FIBER.x0 + 16 + i * 8.4).map(x => (
                    <line key={x} x1={x} x2={x} y1={FIBER.y0 + 5} y2={FIBER.y1 - 5} stroke="rgba(254,205,211,0.10)" strokeWidth={2} />
                ))}
                {OLD_NUCLEI.map(x => <ellipse key={x} cx={x} cy={MID_Y} rx={10} ry={4.5} fill={COLORS.nucleus} opacity={0.75} />)}
            </motion.g>
            <Arrow x={FIBER.x0 - 6} dir={-1} />
            <Arrow x={FIBER.x1 + 6} dir={1} />

            {/* dano mecânico */}
            <circle cx={DAMAGE_X} cy={MID_Y} r={30} fill="url(#igfd-damage)" opacity={0.6} />
            <path d={DAMAGE_PATH} fill="none" stroke="#FECACA" strokeWidth={2.4} strokeLinejoin="round" />

            {/* MGF: produzido e mantido no local */}
            {active && !reduce && Array.from({ length: 7 }, (_, i) => {
                const a = (i / 7) * Math.PI * 2;
                return (
                    <motion.circle key={i} r={3.4} fill={COLORS.mgf}
                        initial={{ cx: DAMAGE_X, cy: MID_Y, opacity: 0 }}
                        animate={{ cx: [DAMAGE_X, DAMAGE_X + Math.cos(a) * 42], cy: [MID_Y, MID_Y + Math.sin(a) * 34], opacity: [0, 1, 0] }}
                        transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.31, ease: 'easeOut' }} />
                );
            })}

            {/* célula satélite: ativa, prolifera, a filha migra e vira mionúcleo */}
            <motion.ellipse cx={SAT.x} cy={SAT.y} rx={11} ry={6} fill="#064E3B" stroke={COLORS.satellite} strokeWidth={1.8}
                animate={active && !reduce ? { fill: ['#064E3B', '#10B981', '#10B981', '#064E3B'] } : {}}
                transition={{ ...cycle, times: [0, 0.2, 0.5, 1] }} />
            <ellipse cx={604} cy={SAT.y} rx={11} ry={6} fill="#064E3B" stroke={COLORS.satellite} strokeWidth={1.4} opacity={0.75} />
            {active && !reduce && (
                <motion.ellipse key={period} rx={9} ry={5} fill={COLORS.mgf} stroke="#ECFDF5" strokeWidth={1}
                    initial={{ cx: SAT.x, cy: SAT.y, opacity: 0 }}
                    animate={{
                        cx: [SAT.x, SAT.x, SAT.x + 14, DAMAGE_X, DAMAGE_X],
                        cy: [SAT.y, SAT.y, SAT.y - 4, FIBER.y0 + 4, MID_Y],
                        opacity: [0, 0, 1, 1, 0],
                    }}
                    transition={{ ...cycle, times: [0, 0.22, 0.4, 0.72, 1] }} />
            )}
            {NEW_NUCLEI.slice(0, shown).map(([x, y]) => (
                <motion.ellipse key={`${x}-${y}`} cx={x} cy={y} rx={8} ry={4} fill="#ECFDF5" stroke={COLORS.mgf} strokeWidth={1.6}
                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
                    style={{ transformOrigin: `${x}px ${y}px` }} />
            ))}
        </g>
    );
};
