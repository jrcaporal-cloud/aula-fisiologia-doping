import { motion, useReducedMotion } from 'framer-motion';
import { COLORS, HPG } from './content';

/** Desenhos da "conta": fígado (ALT/AST, colestase) e eixo HPG (LH/FSH zerados). Esquemas qualitativos. */

interface GlyphProps {
    readonly active: boolean;
}

const LIVER_PATH = 'M 30 104 C 26 70, 70 50, 130 52 C 190 54, 250 46, 268 70 C 282 92, 250 112, 214 130 C 176 150, 120 164, 82 160 C 50 156, 34 134, 30 104 Z';
const DUCTS = [
    'M 70 120 C 100 118, 120 126, 150 136',
    'M 110 82 C 130 96, 140 112, 150 136',
    'M 210 84 C 190 102, 170 118, 150 136',
];
const DUCT_OUT = 'M 150 136 C 152 152, 150 166, 146 186';

/** Bolinhas de bile que andam e param no meio do ducto (colestase). */
const BileDot = ({ path, delay, active, reduced }: { path: string; delay: number; active: boolean; reduced: boolean }) => (
    <motion.circle r={4} fill={COLORS.amber}
        initial={false}
        animate={active && !reduced ? { offsetDistance: ['0%', '62%', '64%'], opacity: [0, 1, 1] } : { offsetDistance: '58%', opacity: active ? 1 : 0.6 }}
        transition={active && !reduced ? { duration: 2.6, times: [0, 0.7, 1], delay, repeat: Infinity, repeatDelay: 0.4 } : { duration: 0.3 }}
        style={{ offsetPath: `path("${path}")` }} />
);

export const LiverGlyph = ({ active }: GlyphProps) => {
    const reduced = useReducedMotion() ?? false;
    return (
        <svg viewBox="0 0 300 200" className="w-full h-full block" role="img" aria-label="Fígado com bile parada e ALT e AST subindo para o sangue">
            <defs>
                <radialGradient id="sarm-liver" cx="35%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#b4533a" />
                    <stop offset="55%" stopColor="#7c2d22" />
                    <stop offset="100%" stopColor="#3f1410" />
                </radialGradient>
            </defs>
            {/* Vaso sanguíneo no alto */}
            <rect x={14} y={8} width={272} height={22} rx={11} fill="rgba(159,18,57,0.55)" stroke="#FB7185" strokeOpacity={0.5} />
            <text x={280} y={24} textAnchor="end" className="font-mono" fontSize={12} fill="#FECDD3">sangue</text>

            <path d={LIVER_PATH} fill="url(#sarm-liver)" stroke="#fca5a5" strokeOpacity={0.45} strokeWidth={1.2} />
            {DUCTS.map(d => <path key={d} d={d} fill="none" stroke="#FCD34D" strokeOpacity={0.55} strokeWidth={3} strokeLinecap="round" />)}
            <path d={DUCT_OUT} fill="none" stroke="#FCD34D" strokeOpacity={0.3} strokeWidth={3} strokeDasharray="3 5" />
            {DUCTS.map((d, i) => <BileDot key={d} path={d} delay={i * 0.5} active={active} reduced={reduced} />)}
            <text x={150} y={196} textAnchor="middle" className="font-mono" fontSize={12} fill="#FDE68A">bile parada (colestase)</text>

            {/* ALT / AST saindo para o sangue */}
            {[{ label: 'ALT', x: 96 }, { label: 'AST', x: 196 }].map((e, i) => (
                <motion.g key={e.label} initial={false}
                    animate={active && !reduced ? { y: [40, -6], opacity: [0, 1] } : { y: active ? -6 : 40, opacity: active ? 1 : 0 }}
                    transition={active && !reduced ? { duration: 1.8, delay: 0.4 + i * 0.5, repeat: Infinity, repeatDelay: 0.6, ease: 'easeOut' } : { duration: 0.3 }}>
                    <rect x={e.x - 24} y={44} width={48} height={22} rx={6} fill="rgba(225,29,72,0.9)" stroke="#FDA4AF" />
                    <text x={e.x} y={60} textAnchor="middle" className="font-mono" fontSize={13} fontWeight={700} fill="#fff">{e.label} ↑</text>
                </motion.g>
            ))}
        </svg>
    );
};

const NODES = [
    { id: 'hipotalamo', label: 'Hipotálamo', y: 34 },
    { id: 'hipofise', label: 'Hipófise', y: 98 },
    { id: 'testiculos', label: 'Testículos', y: 166 },
] as const;
const NODE_X = 70;

export const HpgGlyph = ({ active }: GlyphProps) => {
    const reduced = useReducedMotion() ?? false;
    const drain = { duration: reduced ? 0 : 1.6, delay: reduced ? 0 : 0.5, ease: 'easeInOut' as const };
    return (
        <svg viewBox="0 0 300 200" className="w-full h-full block" role="img" aria-label="Eixo hipotálamo-hipófise-testículos com LH e FSH zerados">
            {NODES.map((n, i) => (
                <g key={n.id}>
                    <motion.rect x={NODE_X - 58} y={n.y - 17} width={116} height={34} rx={17}
                        initial={false}
                        animate={{ fill: active ? 'rgba(148,163,184,0.10)' : 'rgba(96,165,250,0.18)', stroke: active ? 'rgba(148,163,184,0.5)' : '#60A5FA' }}
                        transition={{ ...drain, delay: drain.delay + i * 0.2 }} strokeWidth={1.4} />
                    <text x={NODE_X} y={n.y + 5} textAnchor="middle" className="font-body" fontSize={14} fontWeight={600} fill="#E5E7EB">{n.label}</text>
                </g>
            ))}
            {/* Setas descendentes */}
            <line x1={NODE_X} x2={NODE_X} y1={52} y2={78} stroke="#93C5FD" strokeWidth={2} />
            <path d={`M ${NODE_X - 5} 74 L ${NODE_X} 80 L ${NODE_X + 5} 74`} fill="none" stroke="#93C5FD" strokeWidth={2} />
            <motion.line x1={NODE_X} x2={NODE_X} y1={116} y2={146} strokeWidth={3} initial={false}
                animate={{ stroke: active ? 'rgba(148,163,184,0.35)' : '#60A5FA' }} transition={drain} strokeDasharray={active ? '3 5' : undefined} />
            <path d={`M ${NODE_X - 5} 142 L ${NODE_X} 148 L ${NODE_X + 5} 142`} fill="none" stroke="#93C5FD" strokeOpacity={active ? 0.35 : 1} strokeWidth={2} />
            <text x={NODE_X + 12} y={137} className="font-mono" fontSize={12} fontWeight={700} fill={active ? '#94A3B8' : '#BFDBFE'}>LH/FSH</text>

            {/* Pulsos de LH/FSH que se apagam */}
            {!reduced && [0, 1, 2].map(k => (
                <motion.circle key={k} cx={NODE_X} r={4} fill="#93C5FD" initial={false}
                    animate={active ? { opacity: 0 } : { cy: [118, 146], opacity: [0, 1, 0] }}
                    transition={active ? { duration: 0.4 } : { duration: 1.4, delay: k * 0.45, repeat: Infinity }} />
            ))}

            {/* Medidor LH/FSH */}
            <g transform="translate(176 36)">
                <text x={0} y={0} className="font-mono" fontSize={12} fill="#E5E7EB">LH/FSH</text>
                <rect x={0} y={10} width={30} height={124} rx={6} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.3)" />
                <motion.rect x={3} width={24} rx={4} fill="#60A5FA" initial={false}
                    animate={active ? { y: 131, height: 0 } : { y: 13, height: 118 }} transition={drain} />
                <motion.text x={42} y={132} className="font-mono" fontSize={34} fontWeight={700} fill={COLORS.rose}
                    initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: reduced ? 0 : 2, duration: 0.4 }}>0</motion.text>
                <motion.text x={0} y={156} className="font-mono" fontSize={12} fill="#FDA4AF"
                    initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: reduced ? 0 : 2, duration: 0.4 }}>{HPG.dose}</motion.text>
            </g>
        </svg>
    );
};
