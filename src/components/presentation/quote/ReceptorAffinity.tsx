import { motion, useReducedMotion } from 'framer-motion';

/**
 * Ilustração da citação "O receptor não tem ética — apenas afinidade": a testosterona
 * endógena e o EAA sintético entram na mesma cavidade do receptor e disparam o mesmo
 * sinal. As duas moléculas têm o mesmo esqueleto de propósito: o corpo não distingue a fonte.
 */
const W = 640;
const H = 178;
const CX = W / 2;
const CY = 82;
const START = 210; // distância da molécula ao centro no repouso

const CYCLE = 9; // s: entra a endógena, sai; entra a sintética, sai
// Momentos (fração do ciclo) em que cada molécula está encaixada.
const DOCK_A: [number, number] = [0.12, 0.36];
const DOCK_B: [number, number] = [0.58, 0.82];

// Mini esqueleto esteroide (3 hexágonos + 1 pentágono), centrado em (0, 0).
const S = 12.5;
const HX = S * Math.sqrt(3);
const deg = (d: number) => (d * Math.PI) / 180;
const poly = (cx: number, cy: number, r: number, angles: number[]) =>
    angles.map(a => `${(cx + r * Math.cos(deg(a))).toFixed(1)},${(cy + r * Math.sin(deg(a))).toFixed(1)}`).join(' ');
const HEX = [-90, -30, 30, 90, 150, 210];
const PENT_R = S / (2 * Math.sin(deg(36)));
const PENT_A = S / (2 * Math.tan(deg(36)));
const OFFSET_X = -1.1 * HX;
const OFFSET_Y = 0.75 * S;
const RINGS = [
    poly(OFFSET_X, OFFSET_Y, S, HEX),
    poly(OFFSET_X + HX, OFFSET_Y, S, HEX),
    poly(OFFSET_X + 1.5 * HX, OFFSET_Y - 1.5 * S, S, HEX),
    poly(OFFSET_X + 2 * HX + PENT_A, OFFSET_Y - 1.5 * S, PENT_R, [216, 288, 0, 72, 144]),
];

const Molecule = ({ color }: { color: string }) => (
    <g fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round">
        {RINGS.map((pts, i) => <polygon key={i} points={pts} />)}
    </g>
);

/** Trajetória horizontal de uma molécula: repouso → cavidade → repouso, no trecho [dock0, dock1]. */
const travel = (from: number, [d0, d1]: [number, number]) => ({
    x: [from, from, 0, 0, from, from],
    times: [0, d0 - 0.09, d0, d1, d1 + 0.09, 1],
});

const LABEL = { fontSize: 14, fontFamily: 'var(--font-body, sans-serif)', fontWeight: 600, letterSpacing: 0.3 } as const;

export const ReceptorAffinity = () => {
    const still = useReducedMotion();
    const a = travel(-START, DOCK_A);
    const b = travel(START, DOCK_B);
    const loop = { duration: CYCLE, repeat: Infinity, ease: 'easeInOut' as const };
    // Brilho do receptor: acende igual nos dois encaixes.
    const glowTimes = [0, DOCK_A[0], DOCK_A[0] + 0.04, DOCK_A[1], DOCK_A[1] + 0.05, DOCK_B[0], DOCK_B[0] + 0.04, DOCK_B[1], DOCK_B[1] + 0.05, 1];
    const glow = [0, 0, 1, 1, 0, 0, 1, 1, 0, 0];

    return (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden className="overflow-visible">
            <defs>
                <radialGradient id="ra-glow">
                    <stop offset="0%" stopColor="#FB7185" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#FB7185" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Sinal: ondas que saem do receptor sempre que algo encaixa */}
            {!still && [0, 1].map(k => (
                <motion.circle
                    key={k} cx={CX} cy={CY} fill="none" stroke="#E11D48" strokeWidth="1.5"
                    initial={{ r: 40, opacity: 0 }}
                    animate={{ r: [40, 40, 92, 40, 40, 92, 92], opacity: [0, 0.7, 0, 0, 0.7, 0, 0] }}
                    transition={{ ...loop, ease: 'easeOut', delay: k * 0.45, times: [0, DOCK_A[0], DOCK_A[0] + 0.12, DOCK_A[0] + 0.121, DOCK_B[0], DOCK_B[0] + 0.12, 1] }}
                />
            ))}
            <motion.ellipse
                cx={CX} cy={CY} rx="90" ry="62" fill="url(#ra-glow)"
                initial={{ opacity: still ? 0.7 : 0 }}
                animate={still ? undefined : { opacity: glow }}
                transition={{ ...loop, times: glowTimes }}
            />

            {/* Receptor: proteína com uma única cavidade */}
            <g>
                <path
                    d={`M${CX - 58} ${CY - 40} Q${CX - 74} ${CY + 10} ${CX - 44} ${CY + 46} Q${CX} ${CY + 66} ${CX + 44} ${CY + 46} Q${CX + 74} ${CY + 10} ${CX + 58} ${CY - 40}
                        L${CX + 34} ${CY - 40} Q${CX + 38} ${CY + 22} ${CX} ${CY + 24} Q${CX - 38} ${CY + 22} ${CX - 34} ${CY - 40} Z`}
                    fill="rgba(225,29,72,0.14)" stroke="#E11D48" strokeWidth="2" strokeLinejoin="round"
                />
                <text x={CX} y={CY + 76} textAnchor="middle" fill="#FDA4AF" {...LABEL} fontFamily="var(--font-mono, monospace)" letterSpacing={3} fontSize={13}>
                    RECEPTOR
                </text>
            </g>

            {/* Repousos (rótulos fixos) */}
            <text x={CX - START} y={CY + 50} textAnchor="middle" fill="#93C5FD" {...LABEL}>testosterona endógena</text>
            <text x={CX + START} y={CY + 50} textAnchor="middle" fill="#FDA4AF" {...LABEL}>EAA sintético</text>

            <g transform={`translate(${CX} ${CY})`}>
                <motion.g
                    initial={{ x: still ? -START : a.x[0] }}
                    animate={still ? undefined : { x: a.x }}
                    transition={{ ...loop, times: a.times }}
                >
                    <Molecule color="#60A5FA" />
                </motion.g>
            </g>
            <g transform={`translate(${CX} ${CY})`}>
                <motion.g
                    initial={{ x: still ? START : b.x[0] }}
                    animate={still ? undefined : { x: b.x }}
                    transition={{ ...loop, times: b.times }}
                >
                    <Molecule color="#FB7185" />
                </motion.g>
            </g>
        </svg>
    );
};
