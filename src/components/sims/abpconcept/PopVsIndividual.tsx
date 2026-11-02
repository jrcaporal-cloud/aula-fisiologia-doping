import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { COLORS } from './content';
import { prefersReducedMotion, useTween } from './useTween';

/**
 * Passo 1: limite populacional fixo × limite individual.
 * Modelo ilustrativo (normal-normal conjugado, sem unidades): a priori é a faixa da população;
 * cada amostra do atleta desloca o centro para ele e estreita a faixa esperada.
 */

const W = 740;
const H = 470;
/** Margem lateral para o desenho ocupar a largura do cartão (proporção ~1,7). */
const PAD_X = 26;
const X0 = 60;
const X1 = 700;
const ROW_A = 196;
const ROW_B = 414;

const POP_MU = 0.5;
const POP_SD = 0.136;
const WITHIN_SD = 0.05;
const BAND_Z = 2.2;
const SAMPLES = [0.36, 0.42, 0.32, 0.4, 0.35, 0.38] as const;
const TEST_VALUE = 0.63;
const SAMPLE_MS = 650;
const FIRST_MS = 700;
const TEST_DELAY_MS = 900;

const sx = (v: number): number => X0 + v * (X1 - X0);

/** Distribuição esperada da próxima amostra depois de `n` amostras do próprio atleta. */
const predictive = (n: number): { mu: number; sd: number } => {
    const prec0 = 1 / POP_SD ** 2;
    const precW = 1 / WITHIN_SD ** 2;
    const sum = SAMPLES.slice(0, n).reduce((a, b) => a + b, 0);
    const postVar = 1 / (prec0 + n * precW);
    const mu = postVar * (prec0 * POP_MU + precW * sum);
    return { mu, sd: n === 0 ? POP_SD : Math.sqrt(postVar + WITHIN_SD ** 2) };
};

const FINAL_SD = predictive(SAMPLES.length).sd;

const bellPath = (mu: number, sd: number, base: number, peak: number): string => {
    const pts: string[] = [];
    for (let i = 0; i <= 160; i++) {
        const v = i / 160;
        const y = base - peak * Math.exp(-0.5 * ((v - mu) / sd) ** 2);
        pts.push(`${i === 0 ? 'M' : 'L'}${sx(v).toFixed(1)} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
};

interface RowProps {
    readonly mu: number;
    readonly sd: number;
    readonly base: number;
    readonly peak: number;
    readonly color: string;
    readonly fillOpacity: number;
}

const BandRow = ({ mu, sd, base, peak, color, fillOpacity }: RowProps) => {
    const lo = Math.max(0, mu - BAND_Z * sd);
    const hi = Math.min(1, mu + BAND_Z * sd);
    const curve = bellPath(mu, sd, base, peak);
    return (
        <g>
            <rect x={sx(lo)} y={base - peak - 18} width={sx(hi) - sx(lo)} height={peak + 18} fill={color} fillOpacity={fillOpacity} />
            <line x1={sx(lo)} x2={sx(lo)} y1={base - peak - 18} y2={base} stroke={color} strokeWidth={2} strokeDasharray="6 5" />
            <line x1={sx(hi)} x2={sx(hi)} y1={base - peak - 18} y2={base} stroke={color} strokeWidth={2} strokeDasharray="6 5" />
            <path d={`${curve} L${sx(1)} ${base} L${sx(0)} ${base} Z`} fill={color} fillOpacity={0.16} />
            <path d={curve} fill="none" stroke={color} strokeWidth={2.4} />
            <line x1={X0} x2={X1} y1={base} y2={base} stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
        </g>
    );
};

const RowLabel = ({ y, kicker, text, color }: { y: number; kicker: string; text: string; color: string }) => (
    <g>
        <text x={X0} y={y} className="font-mono" fontSize={13} letterSpacing="0.12em" fill={color}>{kicker}</text>
        <text x={X0} y={y + 21} className="font-body" fontSize={15} fill="#E5E7EB">{text}</text>
    </g>
);

const Chip = ({ x, y, text, color, bg }: { x: number; y: number; text: string; color: string; bg: string }) => (
    <g transform={`translate(${x} ${y})`}>
        <rect x={0} y={-17} width={text.length * 7.6 + 22} height={26} rx={7} fill={bg} stroke={color} strokeOpacity={0.8} />
        <text x={11} y={1} className="font-body" fontSize={14} fontWeight={600} fill="#fff">{text}</text>
    </g>
);

export const PopVsIndividual = () => {
    const reduced = prefersReducedMotion();
    const [n, setN] = useState(reduced ? SAMPLES.length : 0);
    const [showTest, setShowTest] = useState(reduced);

    // As amostras do atleta chegam uma a uma; depois aparece o valor em teste.
    useEffect(() => {
        if (n < SAMPLES.length) {
            const id = window.setTimeout(() => setN(v => v + 1), n === 0 ? FIRST_MS : SAMPLE_MS);
            return () => window.clearTimeout(id);
        }
        const id = window.setTimeout(() => setShowTest(true), TEST_DELAY_MS);
        return () => window.clearTimeout(id);
    }, [n]);

    const target = predictive(n);
    const mu = useTween(target.mu, 650);
    const sd = useTween(target.sd, 650);
    const peakB = 66 + 38 * Math.min(1, Math.max(0, (POP_SD - sd) / (POP_SD - FINAL_SD)));
    const tx = sx(TEST_VALUE);

    return (
        <svg viewBox={`${-PAD_X} 0 ${W + 2 * PAD_X} ${H}`} className="w-full h-full" role="img"
            aria-label="O mesmo valor fica dentro do limite populacional e fora do limite individual do atleta">
            <RowLabel y={40} kicker="LIMITE POPULACIONAL FIXO" text="uma faixa larga, igual para todos" color="#E5E7EB" />
            <BandRow mu={POP_MU} sd={POP_SD} base={ROW_A} peak={66} color="#CBD5E1" fillOpacity={0.07} />

            <RowLabel y={258} kicker="LIMITE INDIVIDUAL · ESTE ATLETA" text="estreita a cada amostra do próprio histórico" color={COLORS.amber} />
            <text x={X1} y={258} textAnchor="end" className="font-mono" fontSize={13} fill={COLORS.amber}>amostras do atleta: {n}</text>
            <BandRow mu={mu} sd={sd} base={ROW_B} peak={peakB} color={COLORS.amber} fillOpacity={0.1} />

            {/* amostras do atleta */}
            <AnimatePresence>
                {SAMPLES.slice(0, n).map((v, i) => (
                    <motion.circle key={i} cx={sx(v)} r={7} fill={COLORS.amber} stroke="#050510" strokeWidth={2}
                        initial={{ cy: ROW_B - 120, opacity: 0 }} animate={{ cy: ROW_B, opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} />
                ))}
            </AnimatePresence>

            {/* o mesmo valor visto pelas duas réguas */}
            <AnimatePresence>
                {showTest && (
                    <motion.g key="test" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                        <line x1={tx} x2={tx} y1={ROW_A - 110} y2={ROW_B} stroke="#fff" strokeWidth={1.6} strokeDasharray="3 5" />
                        <rect x={tx - 8} y={ROW_A - 8} width={16} height={16} transform={`rotate(45 ${tx} ${ROW_A})`} fill="#fff" />
                        <rect x={tx - 8} y={ROW_B - 8} width={16} height={16} transform={`rotate(45 ${tx} ${ROW_B})`} fill={COLORS.red} stroke="#fff" strokeWidth={1.5} />
                        <text x={tx} y={ROW_A - 118} textAnchor="middle" className="font-mono" fontSize={13} fill="#fff">nova amostra</text>
                        <Chip x={tx + 16} y={ROW_A - 34} text="normal para a população" color={COLORS.green} bg="#0B2A22" />
                        <Chip x={tx + 16} y={ROW_B - 34} text="anormal para ESTE atleta" color={COLORS.red} bg="#3A0F1E" />
                    </motion.g>
                )}
            </AnimatePresence>

            <text x={X1} y={ROW_B + 32} textAnchor="end" className="font-body" fontSize={13} fill="#D1D5DB">valor do marcador (escala ilustrativa) →</text>
        </svg>
    );
};
