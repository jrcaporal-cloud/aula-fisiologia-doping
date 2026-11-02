import { motion, useReducedMotion } from 'framer-motion';

/**
 * Ilustrações animadas dos três eixos (SVG puro, leve e nítido em qualquer escala).
 * `active` = o pilar está em foco: o mecanismo dopado fica visível (mais hemácias,
 * biogênese mitocondrial, novo mionúcleo).
 */
interface IllustrationProps {
    active: boolean;
    color: string;
}

const VIEW = '0 0 240 170';

/* ───────────── Coração & Sangue ───────────── */

const HEART_PATH = 'M120 132 C 70 102, 46 74, 64 50 C 78 31, 106 34, 120 54 C 134 34, 162 31, 176 50 C 194 74, 170 102, 120 132 Z';
const RBC_LANES = [-6, 0, 6];

export const HeartIllustration = ({ active, color }: IllustrationProps) => {
    const still = useReducedMotion();
    const cells = active ? 14 : 7;
    const travel = active ? 2.4 : 3.4;
    return (
        <svg viewBox={VIEW} className="w-full h-full" aria-hidden>
            <defs>
                <radialGradient id="heart-fill" cx="42%" cy="38%" r="70%">
                    <stop offset="0%" stopColor="#fb7185" />
                    <stop offset="60%" stopColor={color} />
                    <stop offset="100%" stopColor="#881337" />
                </radialGradient>
                <linearGradient id="vessel-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(244,63,94,0.10)" />
                    <stop offset="50%" stopColor="rgba(244,63,94,0.22)" />
                    <stop offset="100%" stopColor="rgba(244,63,94,0.10)" />
                </linearGradient>
                <clipPath id="vessel-clip"><rect x="0" y="140" width="240" height="24" rx="12" /></clipPath>
            </defs>

            {/* Aorta e artéria pulmonar */}
            <path d="M112 54 C 110 30, 128 18, 146 22" fill="none" stroke="#be123c" strokeWidth="9" strokeLinecap="round" />
            <path d="M130 52 C 132 36, 118 28, 104 30" fill="none" stroke="#9f1239" strokeWidth="7" strokeLinecap="round" />

            <motion.g
                style={{ transformOrigin: '120px 84px' }}
                animate={still ? undefined : { scale: [1, 1.07, 0.98, 1] }}
                transition={{ duration: active ? 0.75 : 1.05, repeat: Infinity, ease: 'easeInOut', times: [0, 0.18, 0.4, 1] }}
            >
                <path d={HEART_PATH} fill="url(#heart-fill)" />
                <path d="M120 60 C 118 82, 122 102, 120 124" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
                <path d="M86 56 C 80 66, 80 78, 88 88" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="3" strokeLinecap="round" />
            </motion.g>

            {/* Vaso com hemácias: com EPO o fluxo carrega muito mais células */}
            <rect x="0" y="140" width="240" height="24" rx="12" fill="url(#vessel-fill)" stroke="rgba(244,63,94,0.35)" />
            <g clipPath="url(#vessel-clip)">
                {Array.from({ length: cells }, (_, i) => (
                    <motion.ellipse
                        key={`${cells}-${i}`}
                        cy={152 + RBC_LANES[i % 3]}
                        rx="7.5" ry="4"
                        fill="#e11d48" stroke="#fda4af" strokeWidth="0.8"
                        initial={{ cx: -12 }}
                        animate={still ? { cx: 20 + i * 15 } : { cx: [-12, 252] }}
                        transition={{ duration: travel, repeat: Infinity, ease: 'linear', delay: (i / cells) * travel }}
                    />
                ))}
            </g>

            {/* O₂ saindo para os tecidos */}
            {[0, 1, 2, 3].map(i => (
                <motion.circle
                    key={i} r="2.4" fill="#67e8f9" cx={40 + i * 52}
                    initial={{ cy: 138, opacity: 0 }}
                    animate={still ? { opacity: 0.8 } : { cy: [138, 118], opacity: [0, 0.9, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.45, ease: 'easeOut' }}
                />
            ))}
        </svg>
    );
};

/* ───────────── Mitocôndrias ───────────── */

const CRISTAE = 'M58 86 q8 -26 16 0 q8 26 16 0 q8 -26 16 0 q8 26 16 0 q8 -26 16 0 q8 26 16 0 q8 -26 16 0';

const Mitochondrion = ({ color }: { color: string }) => (
    <g>
        <rect x="40" y="56" width="160" height="60" rx="30" fill="rgba(245,158,11,0.16)" stroke={color} strokeWidth="3" />
        <rect x="48" y="63" width="144" height="46" rx="23" fill="rgba(120,53,15,0.55)" />
        <path d={CRISTAE} fill="none" stroke="#fcd34d" strokeWidth="2.6" strokeLinejoin="round" opacity="0.9" />
    </g>
);

export const MitoIllustration = ({ active, color }: IllustrationProps) => {
    const still = useReducedMotion();
    return (
        <svg viewBox={VIEW} className="w-full h-full" aria-hidden>
            {/* Biogênese: uma segunda mitocôndria surge da primeira quando o eixo está em foco */}
            <motion.g
                style={{ transformOrigin: '120px 86px' }}
                initial={false}
                animate={active ? { x: 0, y: 46, scale: 0.62, opacity: 1 } : { x: 0, y: 0, scale: 0.9, opacity: 0 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: active ? 0.5 : 0 }}
            >
                <Mitochondrion color={color} />
            </motion.g>
            <motion.g
                style={{ transformOrigin: '120px 86px' }}
                initial={false}
                animate={active ? { y: -22, scale: 0.86 } : { y: 0, scale: 1 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            >
                <motion.g
                    style={{ transformOrigin: '120px 86px' }}
                    animate={still ? undefined : { scaleX: [1, 1.025, 1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Mitochondrion color={color} />
                </motion.g>
            </motion.g>

            {/* ATP saindo para a fibra */}
            {Array.from({ length: active ? 8 : 5 }, (_, i) => (
                <g key={`${active}-${i}`} transform={`translate(${70 + (i % 5) * 26} 0)`}>
                    <motion.g
                        initial={{ y: 60, opacity: 0 }}
                        animate={still ? { opacity: 0.85, y: 30 } : { y: [60, 14], opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.33, ease: 'easeOut' }}
                    >
                        <circle r="5" fill="#fbbf24" />
                        <text y="2" textAnchor="middle" fontSize="5" fontWeight="700" fill="#78350f">ATP</text>
                    </motion.g>
                </g>
            ))}
        </svg>
    );
};

/* ───────────── Fibra Muscular ───────────── */

const ACTIN_ROWS = [72, 84, 96, 108];
const MYOSIN_ROWS = [78, 90, 102];

export const FiberIllustration = ({ active, color }: IllustrationProps) => {
    const still = useReducedMotion();
    const contract = still ? undefined : { x: [0, 12, 0] };
    const contractMirror = still ? undefined : { x: [0, -12, 0] };
    const timing = { duration: 1.6, repeat: Infinity, ease: 'easeInOut' as const };
    return (
        <svg viewBox={VIEW} className="w-full h-full" aria-hidden>
            {/* Fibra (célula) com mionúcleos na periferia */}
            <rect x="8" y="50" width="224" height="76" rx="30" fill="rgba(16,185,129,0.08)" stroke="rgba(52,211,153,0.35)" />
            {[46, 194].map(cx => (
                <ellipse key={cx} cx={cx} cy="52" rx="13" ry="5" fill="#a78bfa" stroke="#ddd6fe" strokeWidth="0.8" />
            ))}
            {/* Mionúcleo novo: a célula satélite se funde à fibra */}
            <motion.circle
                r="6" fill="#c4b5fd" stroke="#ede9fe" strokeWidth="1"
                initial={{ cx: 120, cy: 16, opacity: 0 }}
                animate={active ? { cx: 120, cy: 52, opacity: [0, 1, 1] } : { cx: 120, cy: 16, opacity: 0 }}
                transition={{ duration: 1.4, ease: 'easeInOut', delay: active ? 0.6 : 0 }}
            />
            <motion.ellipse
                cx="120" cy="52" ry="5" fill="#a78bfa" stroke="#ddd6fe" strokeWidth="0.8"
                initial={{ rx: 0, opacity: 0 }}
                animate={{ rx: active ? 13 : 0, opacity: active ? 1 : 0 }}
                transition={{ duration: 0.6, delay: active ? 1.9 : 0 }}
            />

            {/* Sarcômero: linhas Z puxando a actina sobre a miosina */}
            <motion.g animate={contract} transition={timing}>
                <rect x="34" y="64" width="5" height="52" rx="2" fill={color} />
                {ACTIN_ROWS.map(y => <rect key={y} x="38" y={y - 1} width="74" height="2.2" rx="1" fill="#6ee7b7" />)}
            </motion.g>
            <motion.g animate={contractMirror} transition={timing}>
                <rect x="201" y="64" width="5" height="52" rx="2" fill={color} />
                {ACTIN_ROWS.map(y => <rect key={y} x="128" y={y - 1} width="74" height="2.2" rx="1" fill="#6ee7b7" />)}
            </motion.g>
            {MYOSIN_ROWS.map(y => (
                <g key={y}>
                    <rect x="76" y={y - 2.5} width="88" height="5" rx="2.5" fill="#e2e8f0" />
                    {Array.from({ length: 9 }, (_, k) => (
                        <rect key={k} x={80 + k * 9.5} y={y - 5.5} width="2" height="11" rx="1" fill="#cbd5e1" opacity="0.8" />
                    ))}
                </g>
            ))}
        </svg>
    );
};
