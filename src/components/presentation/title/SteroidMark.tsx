import { motion, useReducedMotion } from 'framer-motion';

/**
 * Esqueleto da testosterona (anéis A, B, C hexagonais + D pentagonal), em traço,
 * desenhado ligação por ligação. Geometria calculada: nítido em qualquer escala.
 */
type Point = readonly [number, number];

const S = 96; // comprimento da ligação
const H = S * Math.sqrt(3); // distância entre centros de hexágonos vizinhos
const rad = (deg: number) => (deg * Math.PI) / 180;
const vertex = ([cx, cy]: Point, r: number, deg: number): Point => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))];

const A: Point = [0, 0];
const B: Point = [H, 0];
const C: Point = [1.5 * H, -1.5 * S];
// Pentágono D: compartilha a aresta vertical direita do anel C.
const D_APOTHEM = S / (2 * Math.tan(rad(36)));
const D_RADIUS = S / (2 * Math.sin(rad(36)));
const D: Point = [C[0] + (H / 2) + D_APOTHEM, C[1]];

// Hexágono "ponta para cima": vértices a -90, -30, 30, 90, 150, 210 graus.
const HEX = [-90, -30, 30, 90, 150, 210];
const hex = (c: Point) => HEX.map(d => vertex(c, S, d));
const pent = (c: Point) => [216, 288, 0, 72, 144].map(d => vertex(c, D_RADIUS, d));

const ringPath = (pts: Point[]) => `M${pts.map(p => p.join(' ')).join(' L')} Z`;
const line = (a: Point, b: Point) => `M${a.join(' ')} L${b.join(' ')}`;

const ringA = hex(A);
const ringC = hex(C);
const ringD = pent(D);

// Substituintes da testosterona: 3-ceto, dupla 4-5, metilas em C10 e C13, 17β-OH.
const C3 = ringA[4];
const C4 = ringA[3];
const C5 = ringA[2];
const C10 = ringA[1];
const C13 = ringC[1];
const C17 = ringD[1];
const towards = (from: Point, deg: number, len: number) => vertex(from, len, deg);
const shrink = (a: Point, b: Point, k: number): [Point, Point] => {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    return [[mx + (a[0] - mx) * k, my + (a[1] - my) * k], [mx + (b[0] - mx) * k, my + (b[1] - my) * k]];
};
// Segunda linha da dupla C4=C5, deslocada para dentro do anel A.
const inward = (p: Point): Point => [p[0] + (A[0] - p[0]) * 0.2, p[1] + (A[1] - p[1]) * 0.2];
const [d1, d2] = shrink(inward(C4), inward(C5), 0.7);
const KETONE = towards(C3, 150, S * 0.85);
const [k1, k2] = [towards(C3, 150 - 90, 7), towards(KETONE, 150 - 90, 7)];
const OH = towards(C17, -54, S * 0.8);

const PATHS = [
    ringPath(ringA),
    ringPath(hex(B)),
    ringPath(ringC),
    ringPath(ringD),
    line(d1, d2),
    line(C3, KETONE),
    line(k1, k2),
    line(C10, towards(C10, -90, S * 0.75)),
    line(C13, towards(C13, -90, S * 0.75)),
    line(C17, OH),
];

const ALL = [...ringA, ...ringC, ...ringD, ...hex(B), KETONE, OH];
const xs = ALL.map(p => p[0]);
const ys = ALL.map(p => p[1]);
const PAD = 60;
const VIEW = [Math.min(...xs) - PAD, Math.min(...ys) - S - PAD, Math.max(...xs) - Math.min(...xs) + 2 * PAD, Math.max(...ys) - Math.min(...ys) + S + 2 * PAD];

const LABEL_FONT = 30;

export const SteroidMark = ({ className = '' }: { className?: string }) => {
    const still = useReducedMotion();
    return (
        <motion.svg
            viewBox={VIEW.join(' ')}
            className={className}
            aria-hidden
            animate={still ? undefined : { rotate: [-2, 2, -2] }}
            transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
        >
            <defs>
                <filter id="steroid-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <linearGradient id="steroid-stroke" gradientUnits="userSpaceOnUse" x1={VIEW[0]} y1={VIEW[1] + VIEW[3]} x2={VIEW[0] + VIEW[2]} y2={VIEW[1]}>
                    <stop offset="0%" stopColor="#9F1239" />
                    <stop offset="55%" stopColor="#E11D48" />
                    <stop offset="100%" stopColor="#FB7185" />
                </linearGradient>
            </defs>
            <g filter="url(#steroid-glow)" fill="none" stroke="url(#steroid-stroke)" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round">
                {PATHS.map((d, i) => (
                    <motion.path
                        key={i}
                        d={d}
                        initial={still ? false : { pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ pathLength: { delay: 0.3 + i * 0.22, duration: 1.1, ease: 'easeInOut' }, opacity: { delay: 0.3 + i * 0.22, duration: 0.2 } }}
                    />
                ))}
            </g>
            <motion.g
                fill="#FB7185" fontSize={LABEL_FONT} fontFamily="var(--font-body, sans-serif)" fontWeight="600"
                initial={still ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.8, duration: 0.8 }}
            >
                <text x={KETONE[0] - 14} y={KETONE[1] + 22} textAnchor="end">O</text>
                <text x={OH[0] + 10} y={OH[1] - 4}>OH</text>
            </motion.g>
        </motion.svg>
    );
};
