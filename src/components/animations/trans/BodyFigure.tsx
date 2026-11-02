import { motion } from 'framer-motion';
import { NUMBERED, C_PERSISTS, C_REVERTS, type BodySpot } from './biologyData';

/** Onde cada item aparece na silhueta (coordenadas do viewBox 0 0 220 400). */
const SPOTS: Record<BodySpot, { x: number; y: number }> = {
    reacao: { x: 110, y: 44 },
    vo2: { x: 93, y: 112 },
    coracao: { x: 124, y: 122 },
    forca: { x: 66, y: 124 },
    hematocrito: { x: 163, y: 176 },
    mionucleos: { x: 95, y: 246 },
    ossea: { x: 128, y: 322 },
    estatura: { x: 18, y: 200 },
};

const BODY = 'rgba(148,163,184,0.20)';
const EDGE = 'rgba(203,213,225,0.38)';

/** Membros: traço grosso arredondado com contorno (contorno embaixo, corpo em cima). */
const LIMBS = [
    'M80 86 L62 146 L48 204',
    'M140 86 L158 146 L172 204',
    'M98 210 L94 290 L92 368',
    'M122 210 L126 290 L128 368',
];

interface BodyFigureProps {
    /** Quais grupos estão revelados: 1 = só "reverte", 2 = ambos. */
    readonly step: number;
    readonly hover: BodySpot | null;
}

/** Silhueta neutra e geométrica com os marcadores dos itens de reversibilidade. */
export const BodyFigure = ({ step, hover }: BodyFigureProps) => (
    <svg viewBox="0 0 220 400" className="w-full h-full" aria-hidden>
        {/* estatura (cota vertical) */}
        <g stroke="rgba(203,213,225,0.35)" strokeWidth={1.5}>
            <line x1={18} y1={20} x2={18} y2={380} strokeDasharray="4 4" />
            <line x1={10} y1={20} x2={26} y2={20} />
            <line x1={10} y1={380} x2={26} y2={380} />
        </g>
        <g strokeLinecap="round" strokeLinejoin="round" fill="none">
            {LIMBS.map(d => <path key={`e${d}`} d={d} stroke={EDGE} strokeWidth={24} />)}
            {LIMBS.map(d => <path key={`b${d}`} d={d} stroke="#0B0B18" strokeWidth={21} />)}
            {LIMBS.map(d => <path key={`f${d}`} d={d} stroke={BODY} strokeWidth={21} />)}
        </g>
        <path d="M78 80 Q110 72 142 80 L136 150 Q132 186 130 214 L90 214 Q88 186 84 150 Z" fill="#0B0B18" />
        <path d="M78 80 Q110 72 142 80 L136 150 Q132 186 130 214 L90 214 Q88 186 84 150 Z" fill={BODY} stroke={EDGE} strokeWidth={1.5} />
        <rect x={102} y={62} width={16} height={18} rx={6} fill={BODY} stroke={EDGE} strokeWidth={1.5} />
        <circle cx={110} cy={42} r={23} fill="#0B0B18" />
        <circle cx={110} cy={42} r={23} fill={BODY} stroke={EDGE} strokeWidth={1.5} />

        {NUMBERED.map(({ r, n }) => {
            const shown = r.reversed ? step >= 1 : step >= 2;
            const { x, y } = SPOTS[r.spot];
            const color = r.reversed ? C_REVERTS : C_PERSISTS;
            const isHover = hover === r.spot;
            const fresh = r.reversed ? step === 1 : step === 2;
            return (
                <g key={r.spot}>
                    {shown && fresh && (
                        <motion.circle cx={x} cy={y} r={10} fill="none" stroke={color} strokeWidth={2}
                            initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 2.4, opacity: 0 }}
                            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
                            style={{ transformOrigin: `${x}px ${y}px` }} />
                    )}
                    <motion.g initial={false}
                        animate={{ scale: shown ? (isHover ? 1.3 : 1) : 0, opacity: shown ? (fresh || isHover ? 1 : 0.6) : 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                        style={{ transformOrigin: `${x}px ${y}px` }}>
                        <circle cx={x} cy={y} r={11} fill={color} stroke="#050510" strokeWidth={2.5} />
                        <text x={x} y={y + 4.5} textAnchor="middle" fontSize={13} fontWeight={800} fill="#050510" fontFamily="var(--font-mono)">{n}</text>
                    </motion.g>
                </g>
            );
        })}
    </svg>
);
