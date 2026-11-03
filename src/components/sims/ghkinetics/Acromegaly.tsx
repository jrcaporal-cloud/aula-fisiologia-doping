import { motion, useReducedMotion } from 'framer-motion';
import { COLORS } from './content';

/**
 * Silhueta do passo "custo real": perfil da cabeça que se transforma (arcadas supraorbitais, nariz/lábios,
 * mandíbula projetada) + mão e pé alargados. Só os traços citados no slide 35 ("mandíbula projetada,
 * arcadas supraorbitais, mãos e pés alargados"). Contorno tracejado = antes.
 */

type P = readonly [number, number];

const NORMAL: readonly P[] = [
    [62, 228], [60, 196], [50, 160], [40, 118], [46, 76], [70, 40], [108, 22], [146, 28], [166, 50], [172, 74], [174, 88], [168, 98],
    [172, 108], [184, 128], [176, 136], [173, 140], [177, 146], [172, 152], [176, 158], [171, 166], [172, 178], [164, 190], [146, 194],
    [134, 198], [136, 228],
];
const ACRO: readonly P[] = [
    [62, 228], [60, 196], [50, 160], [40, 118], [46, 76], [70, 40], [108, 22], [148, 28], [168, 48], [176, 72], [188, 86], [172, 100],
    [178, 110], [196, 134], [184, 144], [180, 148], [187, 155], [180, 163], [188, 171], [184, 180], [194, 198], [180, 212], [156, 216],
    [138, 212], [136, 228],
];

/** Catmull-Rom → Bézier cúbica; mesmo número de comandos nos dois perfis (o morph funciona). */
const smoothPath = (pts: readonly P[]): string => {
    const at = (i: number): P => pts[Math.min(Math.max(i, 0), pts.length - 1)];
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
        const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
        const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
        const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
        d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
    }
    return `${d} Z`;
};

const HEAD_N = smoothPath(NORMAL);
const HEAD_A = smoothPath(ACRO);

interface HandProps { readonly finger: number; readonly palm: number }
const Hand = ({ finger, palm }: HandProps) => {
    const fx = [0, 1, 2, 3].map(i => -palm / 2 + palm * (i + 0.5) / 4);
    const len = [30, 36, 34, 27];
    return (
        <g>
            <rect x={-palm / 2} y={0} width={palm} height={44} rx={12} />
            {fx.map((x, i) => <rect key={x} x={x - finger / 2} y={-len[i] + 6} width={finger} height={len[i]} rx={finger / 2} />)}
            <rect x={-palm / 2 - finger * 0.9} y={12} width={finger} height={28} rx={finger / 2} transform={`rotate(-28 ${-palm / 2} 30)`} />
        </g>
    );
};

const FOOT_N = 'M0,0 C14,-4 26,-2 30,8 C34,20 34,50 28,64 C22,74 6,74 2,64 C-4,48 -6,20 0,0 Z';

const Callout = ({ x, y, tx, ty, text, delay }: { x: number; y: number; tx: number; ty: number; text: string; delay: number }) => (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.4 }}>
        <circle cx={x} cy={y} r={4} fill={COLORS.warn} />
        <line x1={x} y1={y} x2={tx} y2={ty} stroke="rgba(251,191,36,0.7)" strokeWidth={1.2} />
        <text x={tx + 4} y={ty + 4} fontSize={14} fontWeight={600} fill="#FDE68A"
            style={{ fontFamily: 'var(--font-body)', paintOrder: 'stroke', stroke: '#080812', strokeWidth: 4 }}>{text}</text>
    </motion.g>
);

export const Acromegaly = () => {
    const reduce = useReducedMotion();
    const t = { delay: reduce ? 0 : 0.5, duration: reduce ? 0 : 1.8, ease: [0.45, 0, 0.2, 1] as const };
    return (
        <svg viewBox="0 0 330 236" className="block h-full w-full" role="img" aria-label="Perfil, mão e pé antes (tracejado) e com acromegalia">
            {/* cabeça em perfil */}
            <g transform="translate(-6,4) scale(0.95)">
                <path d={HEAD_N} fill="none" stroke="rgba(229,231,235,0.55)" strokeWidth={1.6} strokeDasharray="4 4" />
                <motion.path initial={{ d: HEAD_N }} animate={{ d: HEAD_A }} transition={t}
                    fill="rgba(251,191,36,0.16)" stroke={COLORS.warn} strokeWidth={2.2} strokeLinejoin="round" />
                <ellipse cx={92} cy={116} rx={9} ry={14} fill="none" stroke="rgba(251,191,36,0.6)" strokeWidth={1.6} />
                <motion.circle r={2.6} fill="#FDE68A" initial={{ cx: 158, cy: 98 }} animate={{ cx: 162, cy: 100 }} transition={t} />
            </g>
            <Callout x={174} y={86} tx={196} ty={64} text="arcadas supraorbitais" delay={reduce ? 0 : 2} />
            <Callout x={178} y={192} tx={196} ty={214} text="mandíbula projetada" delay={reduce ? 0 : 2.3} />

            {/* mão */}
            <g transform="translate(250,108)">
                <g fill="none" stroke="rgba(229,231,235,0.55)" strokeWidth={1.4} strokeDasharray="4 3"><Hand finger={9} palm={40} /></g>
                <motion.g initial={{ scale: 0.86, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={t} style={{ transformOrigin: '0px 20px' }}
                    fill="rgba(251,191,36,0.16)" stroke={COLORS.warn} strokeWidth={1.8}>
                    <Hand finger={12.5} palm={48} />
                </motion.g>
            </g>
            {/* pé */}
            <g transform="translate(300,104)">
                <path d={FOOT_N} fill="none" stroke="rgba(229,231,235,0.55)" strokeWidth={1.4} strokeDasharray="4 3" />
                <motion.path d={FOOT_N} initial={{ scale: 1, opacity: 0 }} animate={{ scale: 1.2, opacity: 1 }} transition={t}
                    style={{ transformOrigin: '15px 0px' }} fill="rgba(251,191,36,0.16)" stroke={COLORS.warn} strokeWidth={1.8} />
            </g>
            <motion.text x={274} y={36} textAnchor="middle" fontSize={14} fontWeight={600} fill="#FDE68A"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduce ? 0 : 2.6 }}
                style={{ fontFamily: 'var(--font-body)' }}>mãos e pés alargados</motion.text>
        </svg>
    );
};

/** Passo 5: a silhueta ocupa o lugar do gráfico (que sai de cena) e as duas frases de fechamento viram legenda. */
export const AcromegalyStage = () => (
    <div className="absolute inset-0 flex flex-col">
        <div className="space-y-0.5 pt-1 font-body text-[17px] font-semibold leading-snug">
            <p className="text-gray-50">noite após noite, o rhGH some do plasma antes das 6h…</p>
            <p style={{ color: '#FCD34D' }}>…mas o uso crônico expande tecido conjuntivo e ósseo</p>
        </div>
        <div className="min-h-0 flex-1"><Acromegaly /></div>
    </div>
);
