import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { COLORS } from './content';
import { useTween } from './useTween';

/**
 * Passo 0: o mesmo palheiro visto de dois jeitos.
 * À esquerda, a lupa procura a "agulha"; à direita, o ABP compara a forma do palheiro
 * com a forma habitual do atleta. Geometria puramente ilustrativa.
 */

const W = 740;
const H = 470;
/** Margem lateral para o desenho ocupar a largura do cartão (proporção ~1,7). */
const PAD_X = 8;
const BASE_Y = 388;
const HALF_W = 136;
const DOME_H = 196;
const LEFT_CX = 188;
const RIGHT_CX = 552;
const N_STRANDS = 58;

/** Gerador determinístico para o palheiro ficar igual a cada render. */
const seeded = (seed: number) => {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
};

/** Altura do palheiro no ponto u ∈ [−1, 1]; `d` deforma a silhueta (0 = forma habitual). */
const domeHeight = (u: number, d: number): number => {
    const base = DOME_H * Math.pow(Math.max(0, 1 - u * u), 0.7);
    const bump = 0.36 * Math.exp(-(((u - 0.32) / 0.3) ** 2)) - 0.26 * Math.exp(-(((u + 0.5) / 0.32) ** 2));
    return base * (1 + d * bump);
};

const outlinePoints = (cx: number, d: number): [number, number][] =>
    Array.from({ length: 61 }, (_, i) => {
        const u = -1 + (2 * i) / 60;
        return [cx + u * HALF_W, BASE_Y - domeHeight(u, d)];
    });

const toPath = (pts: readonly [number, number][]): string =>
    pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');

interface Strand {
    readonly u0: number;
    readonly u1: number;
    readonly reach: number;
    readonly bow: number;
    readonly width: number;
    readonly alpha: number;
}

const makeStrands = (seed: number): Strand[] => {
    const rand = seeded(seed);
    return Array.from({ length: N_STRANDS }, (_, i) => {
        const u0 = -0.96 + (1.92 * i) / (N_STRANDS - 1) + (rand() - 0.5) * 0.05;
        return {
            u0,
            u1: u0 * 0.72 + (rand() - 0.5) * 0.28,
            reach: 0.58 + rand() * 0.42,
            bow: (rand() - 0.5) * 26,
            width: 1.4 + rand() * 1.3,
            alpha: 0.35 + rand() * 0.5,
        };
    });
};

const strandPath = (s: Strand, cx: number, d: number): string => {
    const x0 = cx + s.u0 * HALF_W;
    const x1 = cx + s.u1 * HALF_W;
    const y1 = BASE_Y - domeHeight(s.u1, d) * s.reach;
    const mx = (x0 + x1) / 2 + s.bow;
    const my = (BASE_Y + y1) / 2;
    return `M${x0.toFixed(1)} ${BASE_Y} Q${mx.toFixed(1)} ${my.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};

interface HaystackProps {
    readonly cx: number;
    readonly d: number;
    readonly strands: readonly Strand[];
    readonly id: string;
}

const Haystack = ({ cx, d, strands, id }: HaystackProps) => {
    const outline = outlinePoints(cx, d);
    const body = `${toPath(outline)} Z`;
    return (
        <g>
            <defs>
                <linearGradient id={`hay-${id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.hay} stopOpacity="0.30" />
                    <stop offset="100%" stopColor={COLORS.hay} stopOpacity="0.08" />
                </linearGradient>
            </defs>
            <path d={body} fill={`url(#hay-${id})`} />
            {strands.map((s, i) => (
                <path key={i} d={strandPath(s, cx, d)} fill="none" stroke={COLORS.hay} strokeOpacity={s.alpha}
                    strokeWidth={s.width} strokeLinecap="round" />
            ))}
            <line x1={cx - HALF_W - 18} x2={cx + HALF_W + 18} y1={BASE_Y} y2={BASE_Y} stroke="rgba(255,255,255,0.35)" strokeWidth={1.5} />
        </g>
    );
};

/** Área entre a forma atual e a habitual (onde o palheiro "cresceu" ou "afundou"). */
const distortionArea = (cx: number, d: number): string => {
    const now = outlinePoints(cx, d);
    const usual = outlinePoints(cx, 0);
    return `${toPath(now)} ${usual.slice().reverse().map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')} Z`;
};

const PanelHeader = ({ x, kicker, title, sub, color }: { x: number; kicker: string; title: string; sub: string; color: string }) => (
    <g>
        <text x={x} y={30} textAnchor="middle" className="font-mono" fontSize={17.5} letterSpacing="0.06em" fill={color}>{kicker}</text>
        <text x={x} y={62} textAnchor="middle" className="font-display" fontSize={24} fontWeight={600} fill="#fff">{title}</text>
        <text x={x} y={88} textAnchor="middle" className="font-body" fontSize={18} fill="#E2E8F0">{sub}</text>
    </g>
);

const LENS_PATH_X = [-70, 40, 95, -10, -95, 20, -70];
const LENS_PATH_Y = [-120, -150, -70, -40, -80, -110, -120];

export const NeedleHaystack = () => {
    const reduced = useReducedMotion() ?? false;
    const strands = useMemo(() => makeStrands(7), []);
    const d = useTween(1, 2400, 1100, 0);

    const needleX = LEFT_CX - 46;
    const needleY = BASE_Y - 84;
    const labelY = BASE_Y - domeHeight(0.32, 1) - 6;

    return (
        <svg viewBox={`${-PAD_X} 0 ${W + 2 * PAD_X} ${H}`} className="w-full h-full" role="img"
            aria-label="Detecção convencional procura a agulha; o passaporte biológico verifica se o palheiro mudou de forma">
            <PanelHeader x={LEFT_CX} kicker="DETECÇÃO CONVENCIONAL" title="Procurar a “agulha”" sub="a molécula intrusa, no meio do palheiro" color="#E5E7EB" />
            <PanelHeader x={RIGHT_CX} kicker="PASSAPORTE BIOLÓGICO" title="O “palheiro” mudou de forma?" sub="comparado à forma habitual do próprio atleta" color={COLORS.cyan} />

            {/* divisória */}
            <line x1={370} x2={370} y1={112} y2={410} stroke="rgba(255,255,255,0.14)" strokeDasharray="4 6" />
            <circle cx={370} cy={262} r={17} fill="#0B0B18" stroke="rgba(255,255,255,0.25)" />
            <text x={370} y={268} textAnchor="middle" className="font-mono" fontSize={18} fill="#E5E7EB">×</text>

            {/* Esquerda: a lupa varre o palheiro atrás da agulha */}
            <Haystack cx={LEFT_CX} d={0} strands={strands} id="l" />
            <line x1={needleX - 7} y1={needleY + 5} x2={needleX + 7} y2={needleY - 5} stroke={COLORS.red} strokeWidth={2.4} strokeLinecap="round" />
            <motion.g
                initial={{ x: LEFT_CX + LENS_PATH_X[0], y: BASE_Y + LENS_PATH_Y[0] }}
                animate={reduced ? undefined : { x: LENS_PATH_X.map(v => LEFT_CX + v), y: LENS_PATH_Y.map(v => BASE_Y + v) }}
                transition={{ duration: 11, ease: 'easeInOut', repeat: Infinity }}
            >
                <circle r={34} fill="rgba(255,255,255,0.07)" stroke="#F3F4F6" strokeWidth={2.5} />
                <circle r={27} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth={1} />
                <line x1={24} y1={24} x2={50} y2={50} stroke="#F3F4F6" strokeWidth={6} strokeLinecap="round" />
            </motion.g>
            <text x={LEFT_CX} y={426} textAnchor="middle" className="font-body" fontSize={18} fill="#F1F5F9">procura a molécula, ponto a ponto</text>

            {/* Direita: forma habitual × forma atual */}
            <path d={distortionArea(RIGHT_CX, d)} fill={COLORS.red} fillOpacity={0.28 * d} />
            <Haystack cx={RIGHT_CX} d={d} strands={strands} id="r" />
            <path d={toPath(outlinePoints(RIGHT_CX, 0))} fill="none" stroke="#fff" strokeOpacity={0.85} strokeWidth={2} strokeDasharray="6 6" />
            <path d={toPath(outlinePoints(RIGHT_CX, d))} fill="none" stroke={COLORS.hay} strokeWidth={2.2} />
            <g opacity={Math.max(0, (d - 0.55) / 0.45)}>
                <line x1={RIGHT_CX + 0.32 * HALF_W + 8} y1={labelY + 10} x2={RIGHT_CX + 0.32 * HALF_W + 40} y2={labelY + 22} stroke="#FDA4AF" strokeWidth={1.5} />
                <text x={RIGHT_CX + 0.32 * HALF_W + 44} y={labelY + 24} className="font-body" fontSize={18} fontWeight={600} fill="#FDA4AF">distorção</text>
                <text x={RIGHT_CX + 0.32 * HALF_W + 44} y={labelY + 45} className="font-body" fontSize={18} fontWeight={600} fill="#FDA4AF">do sistema</text>
            </g>
            <text x={RIGHT_CX} y={426} textAnchor="middle" className="font-body" fontSize={18} fill="#F1F5F9">analisa a distorção do sistema fisiológico</text>

            {/* legenda */}
            <g transform={`translate(${W - 8 - 392} 456)`} className="font-body" fontSize={17.5}>
                <line x1={0} x2={22} y1={-5} y2={-5} stroke="#fff" strokeWidth={2} strokeDasharray="5 4" />
                <text x={28} y={0} fill="#F1F5F9">forma habitual</text>
                <line x1={150} x2={172} y1={-5} y2={-5} stroke={COLORS.hay} strokeWidth={2.4} />
                <text x={178} y={0} fill="#F1F5F9">forma atual</text>
                <rect x={278} y={-14} width={16} height={13} rx={2} fill={COLORS.red} fillOpacity={0.55} />
                <text x={300} y={0} fill="#F1F5F9">distorção</text>
            </g>
            <g transform={`translate(${LEFT_CX - 130} 456)`} className="font-body" fontSize={17.5}>
                <line x1={0} y1={0} x2={14} y2={-10} stroke={COLORS.red} strokeWidth={2.4} strokeLinecap="round" />
                <text x={22} y={0} fill="#F1F5F9">a “agulha” (molécula intrusa)</text>
            </g>
        </svg>
    );
};
