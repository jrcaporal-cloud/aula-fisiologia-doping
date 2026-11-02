import { motion, useReducedMotion } from 'framer-motion';

/**
 * Fechamento ("Conhecimento não é cumplicidade — é proteção"): a molécula de testosterona,
 * que abriu a aula na capa, aparece dentro de um escudo que se desenha traço a traço.
 */
const W = 260;
const H = 200;
const CX = W / 2;

// Escudo: topo reto, laterais que descem e se encontram numa ponta.
const SHIELD = `M${CX} 14 L${CX + 78} 38 L${CX + 72} 112 Q${CX + 62} 160 ${CX} 188 Q${CX - 62} 160 ${CX - 72} 112 L${CX - 78} 38 Z`;

// Mini esqueleto esteroide (mesma geometria da capa, em escala pequena).
const S = 13;
const HX = S * Math.sqrt(3);
const rad = (d: number) => (d * Math.PI) / 180;
const poly = (cx: number, cy: number, r: number, angles: number[]) =>
    angles.map(a => `${(cx + r * Math.cos(rad(a))).toFixed(1)},${(cy + r * Math.sin(rad(a))).toFixed(1)}`).join(' ');
const HEX = [-90, -30, 30, 90, 150, 210];
const PENT_R = S / (2 * Math.sin(rad(36)));
const PENT_A = S / (2 * Math.tan(rad(36)));
const OX = CX - 1.15 * HX;
const OY = 108;
const RINGS = [
    poly(OX, OY, S, HEX),
    poly(OX + HX, OY, S, HEX),
    poly(OX + 1.5 * HX, OY - 1.5 * S, S, HEX),
    poly(OX + 2 * HX + PENT_A, OY - 1.5 * S, PENT_R, [216, 288, 0, 72, 144]),
];

export const ShieldKnowledge = () => {
    const still = useReducedMotion();
    const draw = (delay: number, duration = 1.2) => ({
        initial: still ? false : { pathLength: 0, opacity: 0 },
        animate: { pathLength: 1, opacity: 1 },
        transition: { pathLength: { delay, duration, ease: 'easeInOut' as const }, opacity: { delay, duration: 0.2 } },
    });
    return (
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden className="overflow-visible">
            <defs>
                <linearGradient id="sk-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#E11D48" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#E11D48" stopOpacity="0.02" />
                </linearGradient>
                <filter id="sk-glow" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="4" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <clipPath id="sk-clip"><path d={SHIELD} /></clipPath>
            </defs>

            <motion.path
                d={SHIELD} fill="url(#sk-fill)"
                initial={still ? false : { opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.8 }}
            />
            <motion.path d={SHIELD} fill="none" stroke="#E11D48" strokeWidth="3" strokeLinejoin="round" filter="url(#sk-glow)" {...draw(0.2, 1.4)} />

            <g fill="none" stroke="#FB7185" strokeWidth="2.4" strokeLinejoin="round">
                {RINGS.map((pts, i) => (
                    <motion.polygon key={i} points={pts} {...draw(1.1 + i * 0.25, 0.7)} />
                ))}
            </g>

            {/* Brilho que atravessa o escudo uma vez, quando ele fecha */}
            {!still && (
                <g clipPath="url(#sk-clip)">
                    <motion.rect
                        y="0" width="36" height={H} fill="#fff" opacity="0.12"
                        transform="skewX(-18)"
                        initial={{ x: -60 }} animate={{ x: W + 60 }}
                        transition={{ delay: 2.6, duration: 1.1, ease: 'easeInOut' }}
                    />
                </g>
            )}
        </svg>
    );
};
