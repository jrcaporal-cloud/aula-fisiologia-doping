import { motion, useReducedMotion } from 'framer-motion';
import { EASE, LAYERS, STAGE_H, STAGE_W } from './content';

const PURPLE = LAYERS[1].color;
const PURPLE_INK = LAYERS[1].ink;
const AMBER = '#F59E0B';

const BAR_X = 160;
const UNIT = 128;
/** Posição das três pistas de T dentro do tecido (relativa ao topo do tecido). */
const LANE_OFFSETS = [80, 114, 148] as const;
const TISSUE_Y = 204;
const TISSUE_H = 192;
const LANES = LANE_OFFSETS.map(o => TISSUE_Y + o);

interface TissueProps {
    x: number;
    title: string;
    sub: string;
    converts: boolean;
    delay: number;
}

/** Um tecido: a testosterona atravessa; onde há 5α-redutase, sai DHT. */
const Tissue = ({ x, title, sub, converts, delay }: TissueProps) => {
    const still = useReducedMotion();
    const w = 270;
    const mid = x + w / 2;
    return (
        <g>
            <rect x={x} y={TISSUE_Y} width={w} height={TISSUE_H} rx={14} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" />
            <text x={x + 14} y={TISSUE_Y + 26} fill="#F3F4F6" fontSize={16} fontWeight={700} className="font-body">{title}</text>
            <text x={x + 14} y={TISSUE_Y + 47} fill={converts ? '#FCD34D' : '#E5E7EB'} fontSize={15} className="font-body">{sub}</text>
            {/* enzima 5α-redutase */}
            {(converts ? LANES.map(y => [mid, y]) : [[x + w - 34, TISSUE_Y + 24]]).map(([ex, y]) => (
                <g key={y}>
                    <rect x={ex - 22} y={y - 13} width={44} height={26} rx={7} fill="rgba(245,158,11,0.18)" stroke={AMBER} strokeWidth={1.2} />
                    <text x={ex} y={y + 5} textAnchor="middle" fill="#FCD34D" fontSize={15} fontWeight={700} className="font-mono">5αR</text>
                </g>
            ))}
            {LANES.map((y, i) => {
                const times = [0, 0.46, 0.54, 1];
                const trans = { duration: 4.2, repeat: Infinity, ease: 'linear' as const, delay: delay + i * 1.3 };
                return (
                    <motion.g
                        key={y}
                        initial={{ x: still ? (converts ? x + w - 34 : x + 40) : x + 18 }}
                        animate={still ? undefined : { x: [x + 18, x + w - 18] }}
                        transition={trans}
                    >
                        <motion.g
                            initial={{ opacity: still && converts ? 0 : 1 }}
                            animate={still || !converts ? undefined : { opacity: [1, 1, 0, 0] }}
                            transition={{ ...trans, times }}
                        >
                            <circle cx={0} cy={y} r={14} fill={PURPLE} opacity={0.95} />
                            <text x={0} y={y + 5} textAnchor="middle" fill="#fff" fontSize={15} fontWeight={700} className="font-mono">T</text>
                        </motion.g>
                        {converts && (
                            <motion.g
                                initial={{ opacity: still ? 1 : 0 }}
                                animate={still ? undefined : { opacity: [0, 0, 1, 1] }}
                                transition={{ ...trans, times }}
                            >
                                <circle cx={0} cy={y} r={21} fill={AMBER} />
                                <text x={0} y={y + 5} textAnchor="middle" fill="#1F1300" fontSize={15} fontWeight={800} className="font-mono">DHT</text>
                            </motion.g>
                        )}
                    </motion.g>
                );
            })}
            {converts && (
                <text x={x + w - 14} y={TISSUE_Y + TISSUE_H - 10} textAnchor="end" fill="#FCD34D" fontSize={15} fontWeight={600} className="font-body">DHT: 3× mais androgênica</text>
            )}
        </g>
    );
};

/** Camada 2 — afinidade pelo AR (Trembolona 3×) e seletividade tecidual pela 5α-redutase. */
export const StageRatio = () => {
    const still = useReducedMotion();
    const t = (delay: number, duration = 0.6) => (still ? { duration: 0 } : { delay, duration, ease: EASE });
    const rows = [
        { y: 70, label: 'Testosterona', units: 1, value: '1×', note: 'referência', color: '#CBD5E1' },
        { y: 116, label: 'Trembolona', units: 3, value: '3×', note: '', color: PURPLE },
    ];
    return (
        <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="w-full h-full" role="img" aria-label="Trembolona liga-se ao AR 3 vezes mais forte que a testosterona; 5α-redutase converte T em DHT">
            <text x={20} y={28} fill="#CBD5E1" fontSize={15} className="font-mono" letterSpacing={1}>AFINIDADE PELO RECEPTOR ANDROGÊNICO (AR)</text>
            {rows.map((r, i) => (
                <g key={r.label}>
                    <text x={20} y={r.y + 5} fill="#F3F4F6" fontSize={16} fontWeight={600} className="font-body">{r.label}</text>
                    {Array.from({ length: r.units }, (_, k) => (
                        <motion.rect
                            key={k}
                            x={BAR_X + k * UNIT + 2} y={r.y - 13} width={UNIT - 4} height={26} rx={7}
                            fill={r.color} opacity={0.88}
                            initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                            style={{ transformOrigin: `${BAR_X + k * UNIT}px ${r.y}px` }}
                            transition={t(0.3 + i * 0.5 + k * 0.35, 0.45)}
                        />
                    ))}
                    <motion.text
                        x={BAR_X + r.units * UNIT + 10} y={r.y + 6} fill={i ? PURPLE_INK : '#E5E7EB'} fontSize={20} fontWeight={700} className="font-mono"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(0.8 + i * 1.1)}
                    >{r.value}</motion.text>
                    {r.note && (
                        <motion.text x={BAR_X + r.units * UNIT + 46} y={r.y + 5} fill="#E5E7EB" fontSize={15} className="font-body"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(0.9)}>{r.note}</motion.text>
                    )}
                </g>
            ))}
            <motion.text x={20} y={152} fill="#E5E7EB" fontSize={15} className="font-body"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(2.2)}>
                Trembolona liga-se ao AR 3x mais forte que a Testosterona basal
            </motion.text>

            <line x1={20} x2={580} y1={170} y2={170} stroke="rgba(255,255,255,0.1)" />
            <text x={20} y={192} fill="#CBD5E1" fontSize={15} className="font-mono" letterSpacing={0}>SELETIVIDADE TECIDUAL · 5α-REDUTASE (T → DHT)</text>

            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(2.4)}>
                <Tissue x={20} title="Músculo" sub="baixa 5α-redutase" converts={false} delay={2.6} />
                <Tissue x={310} title="Próstata e couro cabeludo" sub="alta 5α-redutase" converts delay={2.6} />
                <text x={20} y={422} fill="#E5E7EB" fontSize={15} className="font-body">
                    <tspan fill="#F3F4F6" fontWeight={600}>Resistem à 5α-redução</tspan> (ex.: Trembolona, Nandrolona):
                </text>
                <text x={20} y={442} fill="#E5E7EB" fontSize={15} className="font-body">efeitos androgênicos periféricos reduzidos.</text>
            </motion.g>
        </svg>
    );
};
