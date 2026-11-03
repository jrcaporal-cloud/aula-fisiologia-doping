import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EASE, LAYERS, STAGE_H, STAGE_W } from './content';

const GREEN = LAYERS[2].color;
const GREEN_INK = LAYERS[2].ink;
const NUCLEUS = '#A78BFA';
const NUCLEUS_EDGE = '#DDD6FE';
const ANDROGEN = '#FB7185';

const FIBER = { x: 30, y: 152, w: 540, h: 116 };
const FIBER_MID = FIBER.y + FIBER.h / 2;
const OLD_NUCLEI: [number, number][] = [[90, 160], [205, 160], [430, 160], [525, 160], [150, 260], [300, 260], [470, 260]];
const SAT = { x: 300, y: 140 };
const NEW_NUCLEUS = { x: 345, y: 160 };
const PHASES = ['Androgênios', 'proliferação', 'fusão à fibra', 'novos mionúcleos'];
const CHIP_GAP = 22;
const CHIP_W = PHASES.map(p => Math.round(p.length * 7.7 + 24));
const CHIP_X = CHIP_W.map((_, i) => 20 + CHIP_W.slice(0, i).reduce((a, b) => a + b + CHIP_GAP, 0));
/** Instantes (ms) em que cada fase começa. */
const PHASE_AT = [250, 1900, 3300, 4700];

const hexPath = (cx: number, cy: number, r: number) =>
    `M${Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k - Math.PI / 2;
        return `${cx + r * Math.cos(a)} ${cy + r * Math.sin(a)}`;
    }).join(' L')} Z`;

const usePhase = (still: boolean) => {
    const [phase, setPhase] = useState(still ? PHASES.length : 0);
    useEffect(() => {
        if (still) return;
        const timers = PHASE_AT.map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms));
        return () => timers.forEach(window.clearTimeout);
    }, [still]);
    return phase;
};

const Scene = () => {
    const still = !!useReducedMotion();
    const phase = usePhase(still);
    const ease = { duration: still ? 0 : 1, ease: EASE };
    const split = phase >= 2;
    const fused = phase >= 3;
    const grown = phase >= 4;
    return (
        <g>
            {/* Fibra muscular */}
            <motion.g
                animate={{ scaleY: grown ? 1.09 : 1 }}
                transition={{ duration: still ? 0 : 1.4, ease: EASE }}
                style={{ transformOrigin: `300px ${FIBER_MID}px` }}
            >
                <rect x={FIBER.x} y={FIBER.y} width={FIBER.w} height={FIBER.h} rx={52} fill="rgba(16,185,129,0.09)" stroke="rgba(52,211,153,0.5)" strokeWidth={1.5} />
                {Array.from({ length: 40 }, (_, k) => FIBER.x + 40 + k * 12).filter(x => x < FIBER.x + FIBER.w - 36).map(x => (
                    <line key={x} x1={x} x2={x} y1={FIBER.y + 18} y2={FIBER.y + FIBER.h - 18} stroke="rgba(110,231,183,0.16)" strokeWidth={2} />
                ))}
                {OLD_NUCLEI.map(([x, y]) => (
                    <ellipse key={x} cx={x} cy={y} rx={15} ry={6} fill={NUCLEUS} stroke={NUCLEUS_EDGE} strokeWidth={0.8} opacity={0.9} />
                ))}
                {/* Mionúcleo novo (vem da célula satélite) */}
                <motion.ellipse
                    cx={NEW_NUCLEUS.x} cy={NEW_NUCLEUS.y} ry={6} fill={NUCLEUS} stroke="#fff" strokeWidth={1.4}
                    initial={{ rx: 0, opacity: 0 }}
                    animate={{ rx: fused ? 15 : 0, opacity: fused ? 1 : 0 }}
                    transition={{ ...ease, delay: still ? 0 : 0.7 }}
                />
                <text x={FIBER.x + 22} y={FIBER_MID + 5} fill={GREEN_INK} fontSize={15} fontWeight={600} className="font-body">fibra muscular</text>
            </motion.g>

            {grown && (
                <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={ease}>
                    <circle cx={NEW_NUCLEUS.x} cy={NEW_NUCLEUS.y - 3} r={24} fill="none" stroke="#fff" strokeOpacity={0.55} strokeDasharray="3 4" />
                    <text x={NEW_NUCLEUS.x + 30} y={NEW_NUCLEUS.y - 22} fill="#fff" fontSize={15} fontWeight={700} className="font-body">+ mionúcleo</text>
                </motion.g>
            )}

            {/* Androgênios caindo sobre a célula satélite */}
            {[-16, 0, 16].map((dx, i) => (
                <motion.path
                    key={dx}
                    d={hexPath(SAT.x + dx, SAT.y, 7)}
                    fill="none" stroke={ANDROGEN} strokeWidth={2}
                    initial={{ y: still ? 0 : -96, opacity: still ? 0 : 1 }}
                    animate={phase >= 1 ? { y: -8, opacity: split ? 0 : 1 } : { y: -96, opacity: 1 }}
                    transition={{ duration: still ? 0 : 1.1, delay: still ? 0 : i * 0.15, ease: EASE }}
                />
            ))}
            <text x={SAT.x + 34} y={56} fill={ANDROGEN} fontSize={15} fontWeight={600} className="font-body" opacity={phase >= 2 ? 0.7 : 1}>androgênio</text>

            {/* Célula satélite: divide-se; uma filha funde-se à fibra */}
            {[0, 1].map(k => {
                const dx = split ? (k === 0 ? -38 : 45) : 0;
                const toFiber = k === 1 && fused;
                return (
                    <motion.g
                        key={k}
                        initial={false}
                        animate={{ x: dx, y: toFiber ? NEW_NUCLEUS.y - SAT.y : 0, opacity: toFiber ? 0 : 1, scale: toFiber ? 0.6 : 1 }}
                        transition={{ duration: still ? 0 : toFiber ? 0.9 : 0.9, ease: EASE }}
                        style={{ transformOrigin: `${SAT.x}px ${SAT.y}px` }}
                    >
                        <ellipse cx={SAT.x} cy={SAT.y} rx={22} ry={12} fill="rgba(16,185,129,0.28)" stroke={phase >= 1 ? '#fff' : GREEN} strokeWidth={1.6} />
                        <ellipse cx={SAT.x} cy={SAT.y} rx={9} ry={5} fill={NUCLEUS} />
                    </motion.g>
                );
            })}
            <text x={SAT.x - 70} y={122} textAnchor="end" fill="#F3F4F6" fontSize={15} fontWeight={600} className="font-body">célula satélite</text>
            <text x={SAT.x - 70} y={140} textAnchor="end" fill="#E5E7EB" fontSize={15} className="font-body">expressa RA</text>

            {/* Linha do processo */}
            <g>
                {PHASES.map((p, i) => {
                    const on = phase === i + 1 || (still && i === PHASES.length - 1);
                    const done = phase > i + 1;
                    const w = CHIP_W[i];
                    const x = CHIP_X[i];
                    return (
                        <g key={p}>
                            <motion.rect
                                x={x} y={292} width={w} height={30} rx={15}
                                animate={{ fill: on ? 'rgba(16,185,129,0.28)' : 'rgba(255,255,255,0.04)', stroke: on ? GREEN : done ? 'rgba(110,231,183,0.45)' : 'rgba(255,255,255,0.14)' }}
                                transition={{ duration: 0.4 }}
                            />
                            <text x={x + w / 2} y={312} textAnchor="middle" fill={on || done ? '#F3F4F6' : '#CBD5E1'} fontSize={15} fontWeight={on ? 700 : 500} className="font-body">{p}</text>
                            {i < PHASES.length - 1 && <text x={x + w + CHIP_GAP / 2} y={312} textAnchor="middle" fill="#CBD5E1" fontSize={15}>→</text>}
                        </g>
                    );
                })}
            </g>
        </g>
    );
};

const BHASIN = [
    { label: 'T suprafisiológica + treino', kg: 6.1, value: '+6,1 kg', color: GREEN, ink: GREEN_INK },
    { label: 'treino limpo', kg: 1.9, value: '+1,9 kg', color: '#CBD5E1', ink: '#E5E7EB' },
];

/** Camada 3 — célula satélite ativada por androgênio vira mionúcleo novo. */
export const StageSatellite = () => {
    const [run, setRun] = useState(0);
    const still = useReducedMotion();
    return (
        <div className="relative w-full h-full">
            <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="w-full h-full" role="img" aria-label="Célula satélite ativada por androgênio prolifera e se funde à fibra, acrescentando um mionúcleo">
                <text x={20} y={28} fill="#CBD5E1" fontSize={15} className="font-mono" letterSpacing={1}>CÉLULA SATÉLITE → MIONÚCLEO</text>
                <Scene key={run} />
                <line x1={20} x2={580} y1={346} y2={346} stroke="rgba(255,255,255,0.1)" />
                <text x={20} y={376} fill="#CBD5E1" fontSize={15} className="font-mono" letterSpacing={-0.3}>BHASIN ET AL., NEJM · 16 SEMANAS · MASSA MAGRA</text>
                {BHASIN.map((r, i) => {
                    const y = 410 + i * 34;
                    return (
                        <g key={r.label}>
                            <text x={20} y={y + 5} fill="#E5E7EB" fontSize={15} className="font-body">{r.label}</text>
                            <motion.rect
                                key={`b${run}`}
                                x={240} y={y - 9} height={18} rx={9} fill={r.color} opacity={0.85}
                                initial={{ width: still ? r.kg * 42 : 0 }} animate={{ width: r.kg * 42 }}
                                transition={{ duration: still ? 0 : 1, delay: still ? 0 : 0.4 + i * 0.2, ease: EASE }}
                            />
                            <text x={240 + r.kg * 42 + 10} y={y + 5} fill={r.ink} fontSize={15} fontWeight={700} className="font-mono">{r.value}</text>
                        </g>
                    );
                })}
            </svg>
            <button
                type="button"
                onClick={() => setRun(r => r + 1)}
                className="absolute top-[2%] right-[2%] flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[15px] text-slate-100 hover:bg-white/10 cursor-pointer"
            >
                <RotateCcw size={14} /> repetir
            </button>
        </div>
    );
};
