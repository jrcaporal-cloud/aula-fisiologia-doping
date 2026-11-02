import { motion, useReducedMotion } from 'framer-motion';
import { COLORS } from './content';
import { FIBER, LocalFiber } from './LocalFiber';

/**
 * Passos 0–2: o fígado manda IGF-1 pelo sangue para todas as células-alvo (sistêmico) e, no zoom, a fibra sob
 * tensão produz MGF no próprio local do dano (local). No passo 2 os dois chegam à mesma fibra.
 */

export const SCENE = { w: 720, h: 440 } as const;
const BODY = 'var(--font-body)';
const VESSEL_Y = 268;
const LIVER_OUT = { x: 120, y: 150 } as const;
const TRUNK = `M${LIVER_OUT.x},${LIVER_OUT.y} L${LIVER_OUT.x},${VESSEL_Y - 26} Q${LIVER_OUT.x},${VESSEL_Y} ${LIVER_OUT.x + 26},${VESSEL_Y}`;

interface Target { readonly x: number; readonly name: string; readonly effect: string }
const TARGETS: readonly Target[] = [
    { x: 236, name: 'Músculo', effect: 'síntese proteica' },
    { x: 430, name: 'Adipócito', effect: 'lipólise · AGL' },
    { x: 616, name: 'Outras células-alvo', effect: 'síntese proteica' },
];
const TARGET_TOP = 336;
const FIBER_BRANCH_X = 654;

const branchPath = (x: number): string => `${TRUNK} L${x},${VESSEL_Y} L${x},${TARGET_TOP}`;
const FIBER_PATH = `${TRUNK} L${FIBER_BRANCH_X},${VESSEL_Y} L${FIBER_BRANCH_X},${FIBER.y1 + 2}`;
const LIVER_D = 'M34,92 C32,60 82,44 146,46 C198,48 234,62 230,84 C226,104 188,116 158,134 C128,152 88,156 60,144 C42,136 34,116 34,92 Z';

const Text = ({ x, y, text, color = '#E5E7EB', size = 13, anchor = 'middle', weight = 600 }: {
    x: number; y: number; text: string; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number;
}) => (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color}
        style={{ fontFamily: BODY, paintOrder: 'stroke', stroke: '#080812', strokeWidth: 4, strokeLinejoin: 'round' }}>{text}</text>
);

/** Receptor IGF-1R estilizado (forma de Y) na membrana do alvo. */
const Receptor = ({ x, y }: { x: number; y: number }) => (
    <path d={`M${x},${y + 8} L${x},${y} M${x},${y} L${x - 5},${y - 7} M${x},${y} L${x + 5},${y - 7}`} stroke={COLORS.igf} strokeWidth={2.4} strokeLinecap="round" fill="none" />
);

const MuscleIcon = ({ x }: { x: number }) => (
    <g>
        <rect x={x - 54} y={TARGET_TOP + 8} width={108} height={40} rx={20} fill="#4C1027" stroke="rgba(251,113,133,0.6)" />
        {Array.from({ length: 11 }, (_, i) => x - 42 + i * 8.4).map(lx => (
            <line key={lx} x1={lx} x2={lx} y1={TARGET_TOP + 13} y2={TARGET_TOP + 43} stroke="rgba(254,205,211,0.12)" strokeWidth={2} />
        ))}
        <ellipse cx={x - 22} cy={TARGET_TOP + 28} rx={8} ry={4} fill={COLORS.nucleus} opacity={0.7} />
        <ellipse cx={x + 24} cy={TARGET_TOP + 28} rx={8} ry={4} fill={COLORS.nucleus} opacity={0.7} />
    </g>
);

const FatIcon = ({ x }: { x: number }) => (
    <g>
        <circle cx={x} cy={TARGET_TOP + 28} r={24} fill="#3A2606" stroke="rgba(245,158,11,0.7)" />
        <circle cx={x + 2} cy={TARGET_TOP + 29} r={16} fill="rgba(253,230,138,0.55)" />
        <ellipse cx={x - 16} cy={TARGET_TOP + 16} rx={4} ry={2.5} fill={COLORS.nucleus} />
    </g>
);

const CellsIcon = ({ x }: { x: number }) => (
    <g fill="#0F213D" stroke="rgba(96,165,250,0.6)">
        {[[-26, 30], [0, 22], [26, 32]].map(([dx, dy]) => (
            <g key={dx}>
                <circle cx={x + dx} cy={TARGET_TOP + dy} r={13} />
                <circle cx={x + dx} cy={TARGET_TOP + dy} r={4} fill={COLORS.nucleus} stroke="none" />
            </g>
        ))}
    </g>
);

const Particles = ({ paths, color, dur, radius = 4 }: { paths: readonly string[]; color: string; dur: number; radius?: number }) => (
    <g>
        {paths.flatMap((p, pi) => [0, 1, 2].map(k => (
            <circle key={`${pi}-${k}`} r={radius} fill={color} opacity={0.95}>
                <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`-${(k * dur) / 3 + pi * 0.37}s`} path={p} keyPoints="0;1" keyTimes="0;1" calcMode="linear" />
            </circle>
        )))}
    </g>
);

interface SceneProps {
    readonly step: number;
    readonly boost: boolean;
}

export const SystemicLocalScene = ({ step, boost }: SceneProps) => {
    const reduce = useReducedMotion();
    const systemicOn = step !== 1;
    const localOn = step >= 1;
    const both = step === 2;
    const flowPaths = [...TARGETS.map(t => branchPath(t.x)), `${TRUNK} L${SCENE.w + 10},${VESSEL_Y}`];

    return (
        <svg viewBox={`0 0 ${SCENE.w} ${SCENE.h}`} className="absolute inset-0 w-full h-full block" preserveAspectRatio="xMidYMid meet" role="img"
            aria-label="Fígado enviando IGF-1 pelo sangue a todas as células e fibra muscular produzindo MGF no local do dano">
            {/* ── Sistêmico ── */}
            <motion.g animate={{ opacity: systemicOn ? 1 : 0.28 }} transition={{ duration: 0.6 }}>
                <path d={LIVER_D} fill="rgba(159,18,57,0.55)" stroke={COLORS.liver} strokeWidth={2} />
                <Text x={132} y={92} text="Fígado" size={17} color="#FFF1F2" weight={700} />
                <Text x={132} y={112} text="IGF-1 hepático" size={13} color="#FECDD3" />
                <g>
                    <circle cx={292} cy={84} r={30} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={10} />
                    <motion.circle cx={292} cy={84} r={30} fill="none" stroke={COLORS.igf} strokeWidth={10} strokeLinecap="butt"
                        transform="rotate(-90 292 84)" initial={{ pathLength: 0 }} animate={{ pathLength: 0.7 }} transition={{ duration: reduce ? 0 : 1.2, delay: 0.3 }} />
                    <Text x={292} y={90} text="~70%" size={15} color="#FFFFFF" weight={700} />
                    <Text x={292} y={136} text="do IGF-1 circulante" size={12.5} color="#BFDBFE" />
                </g>

                {/* vaso */}
                <path d={`${TRUNK} L${SCENE.w + 10},${VESSEL_Y}`} fill="none" stroke="rgba(225,29,72,0.22)" strokeWidth={24} strokeLinecap="round" />
                <path d={`${TRUNK} L${SCENE.w + 10},${VESSEL_Y}`} fill="none" stroke="rgba(251,113,133,0.35)" strokeWidth={1.2} />
                {TARGETS.map(t => (
                    <path key={t.x} d={`M${t.x},${VESSEL_Y} L${t.x},${TARGET_TOP}`} stroke="rgba(225,29,72,0.22)" strokeWidth={10} strokeLinecap="round" />
                ))}
                <Text x={150} y={VESSEL_Y - 20} text="sangue → todo o organismo" anchor="start" color="#FDA4AF" size={13} />

                {TARGETS.map((t, i) => (
                    <g key={t.name}>
                        {i === 0 && <MuscleIcon x={t.x} />}
                        {i === 1 && <FatIcon x={t.x} />}
                        {i === 2 && <CellsIcon x={t.x} />}
                        <Receptor x={t.x} y={TARGET_TOP} />
                        <Text x={t.x} y={TARGET_TOP + 74} text={t.name} size={14} color="#FFFFFF" />
                        <Text x={t.x} y={TARGET_TOP + 93} text={t.effect} size={13} color="#93C5FD" />
                    </g>
                ))}
                <Text x={TARGETS[0].x - 66} y={TARGET_TOP + 4} text="IGF-1R" size={12.5} color="#93C5FD" anchor="end" />
                {systemicOn && !reduce && <Particles paths={flowPaths} color={COLORS.igf} dur={4.2} />}
            </motion.g>

            {/* ── Local (zoom) ── */}
            <motion.g animate={{ opacity: localOn ? 1 : 0.22 }} transition={{ duration: 0.6 }}>
                <rect x={356} y={16} width={352} height={206} rx={16} fill="rgba(6,78,59,0.14)" stroke="rgba(52,211,153,0.45)" strokeWidth={1.4} />
                <Text x={372} y={40} text="Zoom · fibra sob tensão mecânica" anchor="start" size={13.5} color="#A7F3D0" />
                <LocalFiber active={localOn} boost={boost} />
                <Text x={FIBER.x0 + 2} y={FIBER.y1 + 26} text="células satélite → novos mionúcleos" anchor="start" size={13} color="#D1FAE5" />
                <Text x={530} y={FIBER.y1 + 46} text="exatamente onde houve dano" anchor="middle" size={13} color="#FECACA" />
                <Text x={612} y={78} text="MGF (IGF-1Ec)" anchor="middle" size={13.5} color="#6EE7B7" weight={700} />
                {localOn && boost && (
                    <Text x={698} y={214} text="+ GH exógeno: 3–5×" anchor="end" size={13.5} color="#FCD34D" weight={700} />
                )}
            </motion.g>

            {/* lupa: o músculo do corpo é a fibra do zoom */}
            <motion.g animate={{ opacity: localOn ? 1 : 0 }} transition={{ duration: 0.5 }}>
                <path d={`M${TARGETS[0].x + 40},${TARGET_TOP + 6} L366,214`} stroke="rgba(167,243,208,0.45)" strokeDasharray="4 4" fill="none" />
                <rect x={TARGETS[0].x - 60} y={TARGET_TOP + 2} width={120} height={52} rx={24} fill="none" stroke="rgba(167,243,208,0.6)" strokeDasharray="4 4" />
            </motion.g>

            {/* passo 2: o IGF-1 do sangue também chega à fibra do zoom */}
            {both && (
                <g>
                    <path d={`M${FIBER_BRANCH_X},${VESSEL_Y} L${FIBER_BRANCH_X},${FIBER.y1 + 4}`} stroke="rgba(96,165,250,0.35)" strokeWidth={6} strokeLinecap="round" />
                    {!reduce && <Particles paths={[FIBER_PATH]} color={COLORS.igf} dur={3.4} />}
                </g>
            )}
        </svg>
    );
};
