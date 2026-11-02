import { motion, useReducedMotion } from 'framer-motion';
import { COLORS } from './content';
import { SCENE } from './SystemicLocalScene';

/**
 * Passo 4: o GH é diabetogênico (neoglicogênese hepática; insulina menos eficaz no adipócito) e, no stack com
 * insulina exógena, a glicemia vira uma gangorra: de um lado resistência insulínica crônica, do outro hipoglicemia
 * noturna severa (cartão "Resistência Insulínica como Colateral").
 */

const BODY = 'var(--font-body)';
const PIVOT = { x: 360, y: 352 } as const;
const HALF = 250;
const TILT = 7;

const Text = ({ x, y, text, color = '#E5E7EB', size = 13, anchor = 'middle', weight = 600 }: {
    x: number; y: number; text: string; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number;
}) => (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color}
        style={{ fontFamily: BODY, paintOrder: 'stroke', stroke: '#080812', strokeWidth: 4, strokeLinejoin: 'round' }}>{text}</text>
);

const LIVER_D = 'M34,92 C32,60 82,44 146,46 C198,48 234,62 230,84 C226,104 188,116 158,134 C128,152 88,156 60,144 C42,136 34,116 34,92 Z';

const LiverVignette = ({ animate }: { animate: boolean }) => (
    <g>
        <rect x={16} y={14} width={330} height={190} rx={16} fill="rgba(8,8,18,0.5)" stroke="rgba(255,255,255,0.1)" />
        <g transform="translate(14,26) scale(0.82)">
            <path d={LIVER_D} fill="rgba(159,18,57,0.55)" stroke={COLORS.liver} strokeWidth={2} />
        </g>
        <Text x={118} y={106} text="Fígado" size={15} color="#FFF1F2" weight={700} />
        <rect x={236} y={60} width={22} height={120} rx={11} fill="rgba(225,29,72,0.2)" stroke="rgba(251,113,133,0.4)" />
        <Text x={247} y={52} text="sangue" size={12.5} color="#FDA4AF" />
        {animate && [0, 1, 2, 3, 4].map(i => (
            <motion.circle key={i} r={4.5} fill={COLORS.glucose}
                initial={{ cx: 186, cy: 108, opacity: 0 }}
                animate={{ cx: [186, 247, 247], cy: [108, 108, 70 + i * 22], opacity: [0, 1, 1] }}
                transition={{ duration: 2.4, delay: i * 0.45, repeat: Infinity, repeatDelay: 0.4 }} />
        ))}
        <Text x={112} y={176} text="neoglicogênese hepática" size={13.5} color="#A5F3FC" />
        <Text x={296} y={124} text="glicose ↑" size={14} color={COLORS.glucose} weight={700} />
    </g>
);

const FatVignette = ({ animate }: { animate: boolean }) => (
    <g>
        <rect x={374} y={14} width={330} height={190} rx={16} fill="rgba(8,8,18,0.5)" stroke="rgba(255,255,255,0.1)" />
        <circle cx={480} cy={110} r={56} fill="#3A2606" stroke="rgba(245,158,11,0.8)" strokeWidth={1.6} />
        <circle cx={484} cy={114} r={40} fill="rgba(253,230,138,0.45)" />
        <Text x={480} y={190} text="Adipócito" size={14} color="#FDE68A" />
        {/* receptor de insulina na membrana */}
        <path d="M536,98 L548,98 M536,122 L548,122" stroke={COLORS.insulin} strokeWidth={3} strokeLinecap="round" />
        <motion.g animate={animate ? { x: [40, 0, 0] } : { x: 0 }} transition={{ duration: 2.6, repeat: Infinity, times: [0, 0.4, 1] }}>
            <polygon points="566,104 576,98 586,104 586,116 576,122 566,116" fill={COLORS.insulin} />
        </motion.g>
        {/* sinal que entra atenuado */}
        <line x1={532} y1={110} x2={502} y2={110} stroke="rgba(34,211,238,0.35)" strokeWidth={4} strokeDasharray="4 5" />
        <Text x={604} y={88} text="insulina" size={13} color="#A5F3FC" anchor="start" />
        <Text x={604} y={150} text="sinalização" size={13.5} color="#FECACA" anchor="start" />
        <Text x={604} y={168} text="atenuada" size={13.5} color="#FECACA" anchor="start" />
    </g>
);

export const CollateralScene = () => {
    const reduce = useReducedMotion();
    const rock = reduce ? { rotate: TILT } : { rotate: [-TILT, TILT, -TILT] };
    const rockT = { duration: 6, repeat: Infinity, ease: 'easeInOut' as const };
    return (
        <svg viewBox={`0 0 ${SCENE.w} ${SCENE.h}`} className="absolute inset-0 w-full h-full block" preserveAspectRatio="xMidYMid meet" role="img"
            aria-label="GH diabetogênico: neoglicogênese hepática e insulina menos eficaz no adipócito; gangorra entre resistência insulínica e hipoglicemia">
            <LiverVignette animate={!reduce} />
            <FatVignette animate={!reduce} />
            <Text x={PIVOT.x} y={238} text="GH + insulina exógena em stack: equilíbrio metabólico de altíssimo risco" size={14.5} color="#FFFFFF" weight={700} />

            <motion.g animate={rock} transition={rockT} style={{ transformOrigin: `${PIVOT.x}px ${PIVOT.y - 6}px` }}>
                <rect x={PIVOT.x - HALF} y={PIVOT.y - 12} width={HALF * 2} height={8} rx={4} fill="rgba(229,231,235,0.85)" />
                <rect x={PIVOT.x - HALF + 10} y={PIVOT.y - 52} width={120} height={40} rx={10} fill="rgba(96,165,250,0.2)" stroke={COLORS.igf} strokeWidth={1.8} />
                <Text x={PIVOT.x - HALF + 70} y={PIVOT.y - 27} text="GH" size={16} color="#FFFFFF" weight={700} />
                <rect x={PIVOT.x + HALF - 170} y={PIVOT.y - 52} width={160} height={40} rx={10} fill="rgba(34,211,238,0.2)" stroke={COLORS.insulin} strokeWidth={1.8} />
                <Text x={PIVOT.x + HALF - 90} y={PIVOT.y - 27} text="insulina exógena" size={15} color="#FFFFFF" weight={700} />
            </motion.g>
            <path d={`M${PIVOT.x},${PIVOT.y - 6} L${PIVOT.x - 22},${PIVOT.y + 30} L${PIVOT.x + 22},${PIVOT.y + 30} Z`} fill="#374151" stroke="rgba(229,231,235,0.5)" />
            <Text x={PIVOT.x} y={PIVOT.y + 50} text="glicemia" size={13} color="#D1D5DB" />

            <motion.g animate={reduce ? { opacity: 1 } : { opacity: [1, 0.45, 1] }} transition={rockT}>
                <Text x={PIVOT.x - HALF + 70} y={PIVOT.y + 50} text="resistência insulínica crônica" size={14} color={COLORS.warn} weight={700} />
            </motion.g>
            <motion.g animate={reduce ? { opacity: 1 } : { opacity: [0.45, 1, 0.45] }} transition={rockT}>
                <Text x={PIVOT.x + HALF - 90} y={PIVOT.y + 50} text="hipoglicemia noturna severa" size={14} color={COLORS.warn} weight={700} />
            </motion.g>
        </svg>
    );
};
