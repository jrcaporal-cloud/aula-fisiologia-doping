import { motion, useReducedMotion } from 'framer-motion';

/**
 * Metáfora da capa: o traço de um cromatograma em que o pico existe, mas para
 * logo abaixo do limite de detecção ("a fisiologia sabe, o antidoping não prova").
 * Sem números: é ilustração, não dado.
 */
const W = 720;
const H = 96;
const BASE = 82;
const LOD = 22; // y da linha do limite de detecção
const PEAK_X = 455;
const PEAK_TOP = 32; // pico para pouco abaixo do limite

// Ruído determinístico (mesmo traço a cada render).
const noise = (x: number) => Math.sin(x * 0.21) * 1.6 + Math.sin(x * 0.53 + 1.3) * 1.1 + Math.sin(x * 1.37 + 0.4) * 0.7;
const gauss = (x: number, mu: number, sigma: number) => Math.exp(-((x - mu) ** 2) / (2 * sigma ** 2));

const tracePath = (() => {
    const pts: string[] = [];
    for (let x = 0; x <= W; x += 3) {
        const y = BASE + noise(x) - (BASE - PEAK_TOP) * gauss(x, PEAK_X, 15) - 9 * gauss(x, 210, 9) - 5 * gauss(x, 600, 7);
        pts.push(`${x} ${y.toFixed(1)}`);
    }
    return `M${pts.join(' L')}`;
})();

const DRAW_DELAY = 1.4;
const DRAW_TIME = 2.6;

export const Chromatogram = () => {
    const still = useReducedMotion();
    return (
        <svg viewBox={`0 -4 ${W} ${H + 8}`} width={W} height={H + 8} aria-hidden className="overflow-visible">
            <defs>
                <linearGradient id="chroma-fade" x1="0" x2="1">
                    <stop offset="0%" stopColor="#E5E7EB" stopOpacity="0" />
                    <stop offset="12%" stopColor="#E5E7EB" stopOpacity="0.75" />
                    <stop offset="88%" stopColor="#E5E7EB" stopOpacity="0.75" />
                    <stop offset="100%" stopColor="#E5E7EB" stopOpacity="0" />
                </linearGradient>
                <radialGradient id="chroma-peak-glow">
                    <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.45" />
                    <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Limite de detecção */}
            <motion.line
                x1="0" x2={W} y1={LOD} y2={LOD}
                stroke="#E11D48" strokeWidth="1.5" strokeDasharray="7 7"
                initial={still ? false : { opacity: 0 }} animate={{ opacity: 0.85 }}
                transition={{ delay: DRAW_DELAY - 0.3, duration: 0.8 }}
            />
            <motion.text
                x={W} y={LOD - 8} textAnchor="end" fill="#FB7185" fontSize="13" letterSpacing="2.5"
                fontFamily="var(--font-mono, monospace)"
                initial={still ? false : { opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: DRAW_DELAY, duration: 0.8 }}
            >
                LIMITE DE DETECÇÃO
            </motion.text>

            {/* Brilho no pico, que pulsa sem nunca cruzar a linha */}
            <motion.ellipse
                cx={PEAK_X} cy={PEAK_TOP + 6} rx="46" ry="26" fill="url(#chroma-peak-glow)"
                initial={{ opacity: 0 }}
                animate={still ? { opacity: 0.8 } : { opacity: [0, 0.9, 0.5, 0.9] }}
                transition={{ delay: DRAW_DELAY + DRAW_TIME * 0.62, duration: 3, repeat: still ? 0 : Infinity, repeatType: 'mirror' }}
            />

            <motion.path
                d={tracePath} fill="none" stroke="url(#chroma-fade)" strokeWidth="2" strokeLinejoin="round"
                initial={still ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ delay: DRAW_DELAY, duration: DRAW_TIME, ease: 'easeInOut' }}
            />
        </svg>
    );
};
