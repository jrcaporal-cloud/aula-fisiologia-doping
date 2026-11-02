import { motion } from 'framer-motion';

/** Pulsos hormonais descendo uma seta (GnRH, LH, FSH). Intensidade 0 = nenhum pulso. */

interface PulsesProps {
    readonly x1: number;
    readonly y1: number;
    readonly x2: number;
    readonly y2: number;
    readonly level: number;
    readonly color: string;
    readonly reduced: boolean;
}

const PULSES = [0, 1, 2] as const;

export const Pulses = ({ x1, y1, x2, y2, level, color, reduced }: PulsesProps) => {
    if (level <= 0) return null;
    const n = level >= 0.9 ? 3 : 2;
    if (reduced) {
        return (
            <g>
                {PULSES.slice(0, n).map(k => (
                    <circle key={k} cx={x1 + ((k + 1) / (n + 1)) * (x2 - x1)} cy={y1 + ((k + 1) / (n + 1)) * (y2 - y1)} r={5} fill={color} />
                ))}
            </g>
        );
    }
    const dur = 1.6;
    return (
        <g>
            {PULSES.slice(0, n).map(k => (
                <motion.circle key={k} r={5.5} fill={color} stroke="#fff" strokeWidth={1}
                    initial={{ cx: x1, cy: y1, opacity: 0 }}
                    animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: dur, repeat: Infinity, delay: (k * dur) / n, ease: 'easeIn', repeatDelay: 0.2 }} />
            ))}
        </g>
    );
};

interface RailParticlesProps {
    readonly paths: readonly string[];
    /** 0–1: quanto E2 circula. */
    readonly amount: number;
    /** SERM ocupando o receptor: a partícula chega e volta (não encaixa). */
    readonly blocked: boolean;
    readonly reduced: boolean;
}

export const RailParticles = ({ paths, amount, blocked, reduced }: RailParticlesProps) => {
    if (amount < 0.1 || reduced) return null;
    const perPath = amount >= 0.9 ? 3 : 1;
    const dur = 3.2;
    return (
        <g>
            {paths.flatMap((d, p) => Array.from({ length: perPath }, (_, k) => (
                <motion.g key={`${p}-${k}-${blocked}`} style={{ offsetPath: `path("${d}")`, offsetRotate: '0deg' }}
                    initial={{ offsetDistance: '0%', opacity: 0 }}
                    animate={blocked
                        ? { offsetDistance: ['0%', '100%', '93%'], opacity: [0, 1, 1, 0] }
                        : { offsetDistance: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                    transition={{ duration: dur, repeat: Infinity, delay: (k * dur) / perPath + p * 0.5, ease: 'linear' }}>
                    <circle cx={0} cy={0} r={6} fill={'#E11D48'} stroke="#FECDD3" strokeWidth={1.2} />
                </motion.g>
            )))}
        </g>
    );
};
