import { motion, useReducedMotion } from 'framer-motion';
import { PEPTIDE_COLORS, SvgText } from './ui';

/** Passo 2: o esteroide atravessa a membrana até o núcleo; o peptídeo para no receptor da superfície. */

const VIEW = { w: 700, h: 420 } as const;
const MEMBRANE_Y = 150;
const NUCLEUS_Y = 336;
const LEFT_X = 172;
const RIGHT_X = 528;
const LOOP = { duration: 4.2, repeat: Infinity, repeatDelay: 0.8, ease: 'easeInOut' } as const;

const Membrane = () => (
    <g>
        <rect x={20} y={MEMBRANE_Y - 9} width={VIEW.w - 40} height={18} rx={9} fill="rgba(251,113,133,0.10)" />
        <line x1={20} x2={VIEW.w - 20} y1={MEMBRANE_Y - 9} y2={MEMBRANE_Y - 9} stroke={PEPTIDE_COLORS.membrane} strokeWidth={2} />
        <line x1={20} x2={VIEW.w - 20} y1={MEMBRANE_Y + 9} y2={MEMBRANE_Y + 9} stroke={PEPTIDE_COLORS.membrane} strokeWidth={2} />
        <SvgText x={VIEW.w - 24} y={MEMBRANE_Y - 18} text="membrana" anchor="end" size={15} color="#FDA4AF" weight={500} />
    </g>
);

const Nucleus = ({ x, label }: { x: number; label: string }) => (
    <g>
        <ellipse cx={x} cy={NUCLEUS_Y} rx={118} ry={44} fill={PEPTIDE_COLORS.nucleus} stroke="rgba(167,139,250,0.55)" strokeDasharray="6 5" />
        <SvgText x={x} y={NUCLEUS_Y + 64} text={label} anchor="middle" size={15} color="#DDD6FE" />
    </g>
);

const Hexagon = () => (
    <polygon points="0,-15 13,-7.5 13,7.5 0,15 -13,7.5 -13,-7.5" fill={PEPTIDE_COLORS.steroid} stroke="#FECDD3" strokeWidth={1.5} />
);

const Chain = () => (
    <g>
        <line x1={-28} x2={28} y1={0} y2={0} stroke="rgba(255,255,255,0.4)" strokeWidth={2} />
        {[-28, -14, 0, 14, 28].map(dx => <circle key={dx} cx={dx} cy={0} r={6.5} fill={PEPTIDE_COLORS.peptide} />)}
    </g>
);

export const SignalScene = () => {
    const reduce = useReducedMotion();
    const loop = reduce ? { duration: 0 } : LOOP;
    return (
        <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="w-full h-full" role="img" aria-label="Esteroide entra na célula, peptídeo liga receptor de membrana">
            <line x1={VIEW.w / 2} x2={VIEW.w / 2} y1={14} y2={VIEW.h - 10} stroke="rgba(255,255,255,0.12)" />
            <SvgText x={LEFT_X} y={28} text="Esteroide · lipossolúvel" anchor="middle" size={17} color="#FDA4AF" weight={700} />
            <SvgText x={RIGHT_X} y={28} text="Peptídeo · hidrossolúvel" anchor="middle" size={17} color="#7DD3FC" weight={700} />

            <Membrane />
            <Nucleus x={LEFT_X} label="receptor androgênico no núcleo" />
            <Nucleus x={RIGHT_X} label="o sinal chega por cascata" />

            {/* Brilho de chegada: núcleo (esteroide) e receptor (peptídeo), no mesmo ritmo do laço. */}
            <motion.ellipse cx={LEFT_X} cy={NUCLEUS_Y} rx={118} ry={44} fill="none" stroke={PEPTIDE_COLORS.steroid} strokeWidth={3}
                initial={{ opacity: 0 }} animate={reduce ? { opacity: 0.6 } : { opacity: [0, 0, 0, 0.9, 0] }}
                transition={{ ...loop, times: [0, 0.6, 0.78, 0.85, 1] }} />
            <motion.rect x={RIGHT_X - 17} y={MEMBRANE_Y - 28} width={34} height={56} rx={9} fill="none" stroke={PEPTIDE_COLORS.receptor} strokeWidth={3}
                initial={{ opacity: 0 }} animate={reduce ? { opacity: 0.8 } : { opacity: [0, 0, 1, 1, 0] }}
                transition={{ ...loop, times: [0, 0.35, 0.42, 0.8, 1] }} />
            <motion.ellipse cx={RIGHT_X} cy={NUCLEUS_Y} rx={118} ry={44} fill="none" stroke={PEPTIDE_COLORS.receptor} strokeWidth={3}
                initial={{ opacity: 0 }} animate={reduce ? { opacity: 0.6 } : { opacity: [0, 0, 0, 0.9, 0] }}
                transition={{ ...loop, times: [0, 0.55, 0.62, 0.72, 1] }} />

            {/* Esteroide: atravessa a membrana e entra no núcleo. */}
            <motion.g initial={{ x: LEFT_X, y: 72 }} animate={{ x: LEFT_X, y: reduce ? NUCLEUS_Y : [72, 72, 230, NUCLEUS_Y, NUCLEUS_Y] }}
                transition={{ ...loop, times: [0, 0.1, 0.5, 0.8, 1] }}>
                <Hexagon />
            </motion.g>
            <SvgText x={LEFT_X + 30} y={MEMBRANE_Y + 40} text="atravessa" size={15} color="#FECDD3" weight={500} />

            {/* Peptídeo: encosta no receptor e para. */}
            <rect x={RIGHT_X - 11} y={MEMBRANE_Y - 22} width={22} height={44} rx={6} fill="rgba(167,139,250,0.35)" stroke={PEPTIDE_COLORS.receptor} strokeWidth={2} />
            <SvgText x={RIGHT_X + 22} y={MEMBRANE_Y + 40} text="receptor de membrana" size={15} color="#DDD6FE" weight={500} />
            <motion.g initial={{ x: RIGHT_X, y: 70 }} animate={{ x: RIGHT_X, y: reduce ? 112 : [70, 70, 112, 112, 112] }}
                transition={{ ...loop, times: [0, 0.1, 0.4, 0.8, 1] }}>
                <Chain />
            </motion.g>
            {[0, 1, 2].map(k => (
                <motion.circle key={k} cx={RIGHT_X} r={5} fill={PEPTIDE_COLORS.receptor}
                    initial={{ cy: MEMBRANE_Y + 26, opacity: 0 }}
                    animate={reduce ? { cy: 250, opacity: 1 } : { cy: [MEMBRANE_Y + 26, MEMBRANE_Y + 26, NUCLEUS_Y - 30], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, delay: 1.8 + k * 0.5, times: [0, 0.1, 1] }} />
            ))}
            <SvgText x={RIGHT_X - 24} y={250} text="2º mensageiro" anchor="end" size={15} color="#C4B5FD" weight={500} />
        </svg>
    );
};
