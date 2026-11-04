import { motion, useReducedMotion } from 'framer-motion';
import { PEPTIDE_COLORS, SvgText } from './ui';

/** Passo 3: pela boca, as proteases desmontam a cadeia; injetado, chega inteiro e some do sangue em pouco tempo. */

const VIEW = { w: 700, h: 420 } as const;
const BEADS = 7;
const SPACING = 15;
const ORAL_Y = 140;
const SHOT_Y = 330;
const STOMACH = { x: 430, y: ORAL_Y } as const;
const STOMACH_D = `M${STOMACH.x - 92},${STOMACH.y - 18} C${STOMACH.x - 96},${STOMACH.y - 66} ${STOMACH.x + 10},${STOMACH.y - 74} ${STOMACH.x + 60},${STOMACH.y - 46}
 C${STOMACH.x + 110},${STOMACH.y - 18} ${STOMACH.x + 104},${STOMACH.y + 52} ${STOMACH.x + 40},${STOMACH.y + 58}
 C${STOMACH.x - 20},${STOMACH.y + 64} ${STOMACH.x - 40},${STOMACH.y + 20} ${STOMACH.x - 92},${STOMACH.y - 18} Z`;
const SCATTER: readonly (readonly [number, number])[] = [[-40, -30], [-18, 26], [6, -38], [24, 30], [44, -20], [62, 22], [78, -6]];
const CYCLE = 4.6;

export const RouteScene = () => {
    const reduce = useReducedMotion();
    const repeat = reduce ? 0 : Infinity;
    const startX = 70;
    const inX = STOMACH.x - 60;
    return (
        <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="w-full h-full" role="img" aria-label="Via oral destrói o peptídeo; via injetável chega inteira">
            <SvgText x={20} y={44} text="Pela boca" size={18} color="#F3F4F6" weight={700} />
            <path d={STOMACH_D} fill="rgba(245,158,11,0.10)" stroke="rgba(245,158,11,0.6)" strokeWidth={2} />
            <SvgText x={STOMACH.x + 6} y={ORAL_Y + 84} text="proteases cortam as ligações" anchor="middle" size={15} color="#FDE68A" weight={500} />

            {Array.from({ length: BEADS }, (_, i) => {
                const [dx, dy] = SCATTER[i];
                return (
                    <motion.circle key={i} r={6.5} fill={PEPTIDE_COLORS.peptide}
                        initial={{ cx: startX + i * SPACING, cy: ORAL_Y, opacity: 1 }}
                        animate={reduce
                            ? { cx: inX + i * SPACING + dx, cy: ORAL_Y + dy, opacity: 0.35 }
                            : { cx: [startX + i * SPACING, inX + i * SPACING, inX + i * SPACING + dx, inX + i * SPACING + dx], cy: [ORAL_Y, ORAL_Y, ORAL_Y + dy, ORAL_Y + dy], opacity: [1, 1, 0.6, 0.25] }}
                        transition={{ duration: CYCLE, repeat, times: [0, 0.35, 0.6, 1], ease: 'easeInOut' }} />
                );
            })}
            <motion.line y1={ORAL_Y} y2={ORAL_Y} stroke="rgba(255,255,255,0.4)" strokeWidth={2}
                initial={{ x1: startX, x2: startX + (BEADS - 1) * SPACING, opacity: 1 }}
                animate={reduce ? { opacity: 0 } : { x1: [startX, inX, inX, inX], x2: [startX + (BEADS - 1) * SPACING, inX + (BEADS - 1) * SPACING, inX + (BEADS - 1) * SPACING, inX + (BEADS - 1) * SPACING], opacity: [1, 1, 0, 0] }}
                transition={{ duration: CYCLE, repeat, times: [0, 0.35, 0.45, 1], ease: 'easeInOut' }} />

            {Array.from({ length: BEADS - 1 }, (_, i) => (
                <motion.text key={i} x={inX + i * SPACING + SPACING / 2} y={ORAL_Y + 6} textAnchor="middle" fontSize={18} fontWeight={800} fill="#FB7185"
                    initial={{ opacity: 0 }} animate={reduce ? { opacity: 0 } : { opacity: [0, 0, 1, 0, 0] }}
                    transition={{ duration: CYCLE, repeat, times: [0, 0.34, 0.4, 0.55, 1] }}>×</motion.text>
            ))}
            <line x1={20} x2={VIEW.w - 20} y1={246} y2={246} stroke="rgba(255,255,255,0.12)" />

            <SvgText x={20} y={286} text="Injetado" size={18} color="#F3F4F6" weight={700} />
            <rect x={150} y={SHOT_Y - 22} width={VIEW.w - 170} height={44} rx={22} fill="rgba(225,29,72,0.12)" stroke="rgba(225,29,72,0.55)" strokeWidth={2} />
            <SvgText x={VIEW.w - 30} y={SHOT_Y - 32} text="sangue" anchor="end" size={15} color="#FDA4AF" weight={500} />
            <motion.g initial={{ x: 120, opacity: 1 }}
                animate={reduce ? { x: 420, opacity: 0.6 } : { x: [120, 420, 560], opacity: [1, 1, 0] }}
                transition={{ duration: CYCLE, repeat, times: [0, 0.55, 1], ease: 'easeInOut' }}>
                <line x1={0} x2={(BEADS - 1) * SPACING} y1={SHOT_Y} y2={SHOT_Y} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
                {Array.from({ length: BEADS }, (_, i) => <circle key={i} cx={i * SPACING} cy={SHOT_Y} r={6.5} fill={PEPTIDE_COLORS.peptide} />)}
            </motion.g>
            <SvgText x={160} y={SHOT_Y + 52} text="chega inteiro, mas some do sangue em minutos a horas" size={15} color="#E5E7EB" weight={500} />
        </svg>
    );
};
