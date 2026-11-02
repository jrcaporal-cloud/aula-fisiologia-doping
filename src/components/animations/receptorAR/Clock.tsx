import { motion } from 'framer-motion';

interface ClockProps {
    color: string;
    /** Voltas do ponteiro ao longo da sequência (ilustra quanto tempo passa). */
    turns: number;
    duration: number;
    /** Troque para reiniciar o giro; `null` mostra o ponteiro já parado no fim. */
    runKey: string | null;
    reduced: boolean;
    size?: number;
}

const TICKS = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);

/** Relógio de mostrador: o ponteiro gira mais voltas na via lenta do que na rápida. */
export const Clock = ({ color, turns, duration, runKey, reduced, size = 44 }: ClockProps) => {
    const r = size / 2;
    const animateNow = runKey !== null && !reduced;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden className="flex-none">
            <circle cx={r} cy={r} r={r - 1.5} fill={`${color}1f`} stroke={color} strokeWidth={2} />
            {TICKS.map(a => (
                <line
                    key={a}
                    x1={r + Math.sin(a) * (r - 4)}
                    y1={r - Math.cos(a) * (r - 4)}
                    x2={r + Math.sin(a) * (r - 7)}
                    y2={r - Math.cos(a) * (r - 7)}
                    stroke={color}
                    strokeWidth={1.4}
                    strokeOpacity={0.8}
                />
            ))}
            <motion.g
                key={runKey ?? 'final'}
                initial={animateNow ? { rotate: 0 } : false}
                animate={{ rotate: turns * 360 }}
                transition={animateNow ? { duration, ease: [0.3, 0, 0.25, 1] } : { duration: 0 }}
            >
                {/* círculo invisível: faz o centro de rotação coincidir com o centro do mostrador */}
                <circle cx={r} cy={r} r={r - 1.5} fill="transparent" />
                <line x1={r} y1={r} x2={r} y2={5} stroke="#F8FAFC" strokeWidth={2.4} strokeLinecap="round" />
            </motion.g>
            <circle cx={r} cy={r} r={2.6} fill="#F8FAFC" />
        </svg>
    );
};
