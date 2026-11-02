import { motion, useReducedMotion } from 'framer-motion';
import { SarmMolecule } from '../sarms/ReceptorGlyph';
import { EASE, strokeK, type EchoProps } from './echoKit';
import { EchoSvg, Label } from './EchoParts';

/**
 * Eco do slide "SARMs: A Zona Cinzenta Molecular" (pote de suplemento → urina "SARM +"):
 * o pote de vitaminas "naturais" esconde o SARM (só a lupa revela), a amostra acusa e vem o banimento.
 */

const CAPSULES = [
    { x: 80, y: 244, sarm: false }, { x: 120, y: 244, sarm: true }, { x: 160, y: 244, sarm: false },
    { x: 80, y: 292, sarm: false }, { x: 120, y: 292, sarm: false }, { x: 160, y: 292, sarm: true },
] as const;

const LENS = { r: 36, y: 268, from: 66, to: 168 } as const;
const SWEEP_S = 2.8;

const Capsule = ({ x, y, k, revealed }: { x: number; y: number; k: number; revealed: boolean }) => (
    <g transform={`translate(${x} ${y}) rotate(-28)`}>
        <rect x={-16} y={-8} width={32} height={16} rx={8} fill={revealed ? '#0B1220' : '#34D399'} stroke={revealed ? '#22D3EE' : '#A7F3D0'} strokeWidth={1.2 * k} />
        {!revealed && <rect x={0} y={-8} width={16} height={16} rx={8} fill="#F3F4F6" />}
        {!revealed && <rect x={0} y={-8} width={6} height={16} fill="#F3F4F6" />}
    </g>
);

export const ShelfEcho = ({ compact }: EchoProps) => {
    const reduce = useReducedMotion() ?? false;
    const k = strokeK(compact);
    const d = (s: number) => (reduce ? 0 : s);
    const lensAnim = reduce ? { cx: 128 } : { cx: [LENS.from, LENS.to] };
    const lensT = reduce ? { duration: 0 } : { duration: SWEEP_S, delay: 0.4, repeat: Infinity, repeatType: 'mirror' as const, ease: 'easeInOut' as const };

    return (
        <EchoSvg label="Pote de vitaminas naturais com SARM escondido nas cápsulas, amostra de urina positiva e banimento">
            <defs>
                <linearGradient id="gf-pot" x1="0" x2="1">
                    <stop offset="0%" stopColor="#1f2937" />
                    <stop offset="50%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#111827" />
                </linearGradient>
                <linearGradient id="gf-urine" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FDE68A" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.6} />
                </linearGradient>
                <clipPath id="gf-lens-clip">
                    <motion.circle cy={LENS.y} r={LENS.r - 3} initial={{ cx: LENS.from }} animate={lensAnim} transition={lensT} />
                </clipPath>
            </defs>

            {/* pote */}
            <rect x={52} y={70} width={136} height={28} rx={7} fill="#4B5563" stroke="#9CA3AF" strokeWidth={1.2 * k} />
            <rect x={40} y={96} width={160} height={236} rx={18} fill="url(#gf-pot)" stroke="#9CA3AF" strokeWidth={1.2 * k} />
            <rect x={40} y={122} width={160} height={84} fill="rgba(16,185,129,0.18)" stroke="#34D399" strokeWidth={k} />
            <Label compact={compact} x={120} y={152} anchor="middle" size={20} weight={800} fill="#D1FAE5">VITAMINAS</Label>
            <Label compact={compact} x={120} y={174} anchor="middle" size={15} weight={600} fill="#A7F3D0">“naturais”</Label>
            <Label compact={compact} x={120} y={194} anchor="middle" size={12} mono fill="#A7F3D0">fórmula proprietária</Label>
            <rect x={54} y={216} width={132} height={104} rx={10} fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.15)" />

            {CAPSULES.map(c => <Capsule key={`${c.x}-${c.y}`} x={c.x} y={c.y} k={k} revealed={false} />)}

            {/* o que a lupa revela */}
            <g clipPath="url(#gf-lens-clip)">
                <rect x={54} y={216} width={132} height={104} fill="#04121a" />
                {CAPSULES.map(c => (
                    <g key={`r-${c.x}-${c.y}`}>
                        <Capsule x={c.x} y={c.y} k={k} revealed />
                        {c.sarm && <g transform={`translate(${c.x} ${c.y}) scale(0.8)`}><SarmMolecule x={0} y={0} /></g>}
                    </g>
                ))}
            </g>
            <motion.g initial={{ x: LENS.from }} animate={reduce ? { x: 128 } : { x: [LENS.from, LENS.to] }} transition={lensT}>
                <circle cx={0} cy={LENS.y} r={LENS.r} fill="none" stroke="#E5E7EB" strokeWidth={3.5 * k} />
                <line x1={LENS.r * 0.72} y1={LENS.y + LENS.r * 0.72} x2={LENS.r * 0.72 + 30} y2={LENS.y + LENS.r * 0.72 + 30}
                    stroke="#E5E7EB" strokeWidth={7 * k} strokeLinecap="round" />
            </motion.g>
            <Label compact={compact} x={120} y={372} anchor="middle" size={15} weight={600} fill="#A5F3FC" delay={1.2}>
                SARM mascarado
            </Label>

            {/* cápsula → urina */}
            <motion.path d="M214 214 C 240 176, 270 176, 296 210" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={1.8 * k} strokeDasharray="5 6"
                initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: d(0.6), delay: d(1.2) }} />
            <path d="M289 200 L297 212 L284 214" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.8 * k} />

            <g transform="translate(306 132)">
                <rect x={-4} y={0} width={96} height={18} rx={5} fill="#E5E7EB" />
                <path d="M4 18 L84 18 L79 162 Q78 172 68 172 L20 172 Q10 172 9 162 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.5)" strokeWidth={1.2 * k} />
                <path d="M7 70 L81 70 L79 162 Q78 172 68 172 L20 172 Q10 172 9 162 Z" fill="url(#gf-urine)" />
                <motion.g initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: d(0.4), delay: d(1.8), ease: EASE }} style={{ transformOrigin: '44px 112px' }}>
                    <rect x={4} y={97} width={80} height={30} rx={6} fill="#E11D48" stroke="#FDA4AF" strokeWidth={1.2 * k} />
                    {!compact && <text x={44} y={118} textAnchor="middle" className="font-mono" fontSize={15} fontWeight={700} fill="#fff">SARM +</text>}
                </motion.g>
            </g>
            <Label compact={compact} x={350} y={330} anchor="middle" size={14} mono fill="#FDE68A" delay={1.6}>amostra</Label>

            {/* urina → banimento */}
            <motion.path d="M406 222 L446 222" stroke="rgba(255,255,255,0.5)" strokeWidth={1.8 * k} strokeDasharray="5 6"
                initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: d(0.4), delay: d(2.2) }} />
            <path d="M440 215 L448 222 L440 229" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={1.8 * k} />
            <motion.g
                initial={reduce ? false : { opacity: 0, scale: 1.7 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: d(0.35), delay: d(2.6), ease: [0.5, 0, 0.75, 0] }}
                style={{ transformOrigin: '522px 222px' }}
            >
                <g transform="rotate(-9 522 222)">
                    <rect x={458} y={192} width={128} height={60} rx={8} fill="rgba(225,29,72,0.1)" stroke="#E11D48" strokeWidth={3 * k} />
                    <rect x={464} y={198} width={116} height={48} rx={5} fill="none" stroke="#E11D48" strokeWidth={1.2 * k} />
                    {!compact && <text x={522} y={229} textAnchor="middle" className="font-display" fontSize={17} fontWeight={800} letterSpacing="0.06em" fill="#FB7185">BANIMENTO</text>}
                </g>
            </motion.g>
        </EchoSvg>
    );
};
