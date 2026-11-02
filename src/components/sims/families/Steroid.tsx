import { motion } from 'framer-motion';
import {
    AROMATIC_R, C17_O_BOND, C18_BOND, C19_BOND, C19_END, C3_O_BOND, C3_O_SECOND,
    DOUBLE_45, H5_END, H5_HASHES, O17, O3, RING_CENTERS, RING_PATHS,
} from './geometry';

/** Estado do anel A: 4-eno-3-ona (testosterona), saturado 5α (DHT) ou aromático (estradiol). */
export type RingAState = 'enone' | 'saturated' | 'aromatic';
/** Metila C19 em C10: presente, ausente, ou "fantasma" (some diante do aluno). */
export type C19State = 'on' | 'off' | 'ghost';

export interface SteroidProps {
    readonly color: string;
    readonly ringA?: RingAState;
    readonly c19?: C19State;
    /** Cor das ligações que caracterizam a família (sem ela, tudo na cor base). */
    readonly accent?: string;
    readonly showRings?: boolean;
    readonly showC19Label?: boolean;
    readonly showAtoms?: boolean;
    readonly stroke?: number;
    readonly font?: number;
    /** Segundos até começar a desenhar. */
    readonly delay?: number;
    /** Segundos até a metila C19 sumir (só com c19="ghost"). */
    readonly ghostDelay?: number;
    readonly still?: boolean;
}

const BODY_FONT = 'var(--font-body), sans-serif';
const MONO_FONT = 'var(--font-mono), monospace';

interface DrawProps {
    readonly d: string;
    readonly at: number;
    readonly still: boolean;
    readonly color?: string;
    readonly width?: number;
    readonly dash?: string;
    readonly opacity?: number;
}

const Draw = ({ d, at, still, color, width, dash, opacity = 1 }: DrawProps) => (
    <motion.path
        d={d}
        stroke={color}
        strokeWidth={width}
        strokeDasharray={dash}
        initial={still ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity }}
        transition={{ pathLength: { delay: at, duration: 0.7, ease: 'easeInOut' }, opacity: { delay: at, duration: 0.2 } }}
    />
);

const fadeIn = (still: boolean, at: number, to = 1) => ({
    initial: still ? false : { opacity: 0 },
    animate: { opacity: to },
    transition: { delay: at, duration: 0.45 },
});

/** Esqueleto esteroide parametrizável, desenhado ligação por ligação (coordenadas locais). */
export const Steroid = ({
    color, ringA = 'enone', c19 = 'on', accent, showRings = false, showC19Label = false, showAtoms = true,
    stroke = 4.5, font = 22, delay = 0, ghostDelay = 1.2, still = false,
}: SteroidProps) => {
    const sig = accent ?? color;
    const t = (i: number) => delay + i * 0.12;
    const atomAt = delay + 0.9;
    const aromatic = ringA === 'aromatic';

    return (
        <g fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round">
            <Draw d={RING_PATHS.A} at={t(0)} still={still} />
            <Draw d={RING_PATHS.B} at={t(1)} still={still} />
            <Draw d={RING_PATHS.C} at={t(2)} still={still} />
            <Draw d={RING_PATHS.D} at={t(3)} still={still} />
            <Draw d={C18_BOND} at={t(4)} still={still} />
            <Draw d={C17_O_BOND} at={t(4)} still={still} />

            {/* C3: cetona (C=O) ou hidroxila fenólica (C–OH). */}
            <Draw d={C3_O_BOND} at={t(5)} still={still} color={aromatic ? sig : color} />
            {!aromatic && <Draw d={C3_O_SECOND} at={t(5)} still={still} color={ringA === 'enone' ? sig : color} />}

            {ringA === 'enone' && <Draw d={DOUBLE_45} at={t(6)} still={still} color={sig} />}
            {aromatic && (
                <motion.circle
                    cx={RING_CENTERS.A[0]} cy={RING_CENTERS.A[1]} r={AROMATIC_R} stroke={sig}
                    initial={still ? false : { pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ pathLength: { delay: t(6), duration: 0.9, ease: 'easeInOut' }, opacity: { delay: t(6), duration: 0.2 } }}
                />
            )}
            {ringA === 'saturated' && (
                <g stroke={sig} strokeWidth={stroke * 0.7}>
                    {H5_HASHES.map((d, i) => <Draw key={d} d={d} at={t(6) + i * 0.05} still={still} />)}
                </g>
            )}

            {c19 === 'on' && <Draw d={C19_BOND} at={t(5)} still={still} />}
            {c19 === 'ghost' && (
                <>
                    <motion.path
                        d={C19_BOND}
                        initial={still ? { opacity: 0 } : { opacity: 1 }}
                        animate={{ opacity: 0 }}
                        transition={{ delay: ghostDelay, duration: 0.9, ease: 'easeInOut' }}
                    />
                    <motion.path d={C19_BOND} stroke={sig} strokeDasharray="3 7" {...fadeIn(still, ghostDelay + 0.5, 0.9)} />
                </>
            )}

            {/* Rótulos */}
            <g stroke="none" fontFamily={BODY_FONT} fontWeight={600} fontSize={font}>
                {showAtoms && (
                    <motion.g {...fadeIn(still, atomAt)}>
                        <text x={O3[0] - 6} y={O3[1] + font * 0.55} textAnchor="end" fill={aromatic ? sig : color}>{aromatic ? 'HO' : 'O'}</text>
                        <text x={O17[0] + 5} y={O17[1] - 2} fill={color}>OH</text>
                        {ringA === 'saturated' && (
                            <text x={H5_END[0]} y={H5_END[1] + font * 0.95} textAnchor="middle" fill={sig}>H</text>
                        )}
                    </motion.g>
                )}
                {showRings && (
                    <motion.g {...fadeIn(still, atomAt + 0.2)} fill="#CBD5E1" fontFamily={MONO_FONT} fontWeight={500} fontSize={font * 0.82} textAnchor="middle">
                        {(Object.keys(RING_CENTERS) as (keyof typeof RING_CENTERS)[]).map(k => (
                            <text key={k} x={RING_CENTERS[k][0]} y={RING_CENTERS[k][1] + font * 0.3}>{k}</text>
                        ))}
                    </motion.g>
                )}
                {(showC19Label || c19 === 'ghost') && c19 !== 'off' && (
                    <motion.g {...fadeIn(still, c19 === 'ghost' ? ghostDelay + 0.5 : atomAt + 0.3)} fontFamily={MONO_FONT} fontSize={font * 0.8}>
                        <text x={C19_END[0] - 7} y={C19_END[1] + font * 0.3} textAnchor="end" fill={c19 === 'ghost' ? sig : '#CBD5E1'}>C19</text>
                        {c19 === 'ghost' && (
                            <motion.line
                                x1={C19_END[0] - 4} x2={C19_END[0] - 10 - font * 1.6} y1={C19_END[1]} y2={C19_END[1]}
                                stroke={sig} strokeWidth={2.2}
                                initial={still ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
                                transition={{ delay: ghostDelay + 0.9, duration: 0.4 }}
                            />
                        )}
                    </motion.g>
                )}
            </g>
        </g>
    );
};
