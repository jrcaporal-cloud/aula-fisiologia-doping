import { motion, useReducedMotion } from 'framer-motion';
import { COLORS } from './content';

/**
 * Receptor androgênico esquemático sobre o DNA: DBD + LBD com bolsão do ligante e hélice 12.
 * `mode="agonist"` (músculo): o SARM fecha a hélice 12 e o coativador encaixa → transcrição.
 * `mode="antagonist"` (próstata): a hélice 12 fica noutra conformação, o coativador não encaixa.
 * Desenho esquemático (não é estrutura cristalográfica).
 */

interface ReceptorGlyphProps {
    readonly mode: 'agonist' | 'antagonist';
    /** false = estado de repouso (sem ligante). */
    readonly active: boolean;
}

const DNA_Y = 172;
const DNA_X0 = 14;
const DNA_X1 = 286;

const sinePath = (phase: number) => {
    const pts: string[] = [];
    for (let x = DNA_X0; x <= DNA_X1; x += 6) {
        const y = DNA_Y + Math.sin((x / 26) + phase) * 7;
        pts.push(`${x === DNA_X0 ? 'M' : 'L'} ${x} ${y.toFixed(1)}`);
    }
    return pts.join(' ');
};

const STRAND_A = sinePath(0);
const STRAND_B = sinePath(Math.PI);
const RUNGS = Array.from({ length: 21 }, (_, i) => DNA_X0 + 6 + i * 13);

/** SARM: dois anéis aromáticos ligados (esquema de ligante não esteroidal). */
const Hexagon = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => {
    const d = Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k + Math.PI / 6;
        return `${k === 0 ? 'M' : 'L'} ${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return <path d={`${d} Z`} fill="rgba(34,211,238,0.25)" stroke={COLORS.cyan} strokeWidth={2} />;
};

export const SarmMolecule = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x} ${y})`}>
        <Hexagon cx={-9} cy={0} r={8} />
        <line x1={-1} y1={0} x2={3} y2={0} stroke={COLORS.cyan} strokeWidth={2} />
        <Hexagon cx={11} cy={0} r={8} />
    </g>
);

export const ReceptorGlyph = ({ mode, active }: ReceptorGlyphProps) => {
    const reduced = useReducedMotion() ?? false;
    const agonist = mode === 'agonist';
    const t = (delay: number, duration = 0.7) => ({ delay: reduced ? 0 : delay, duration: reduced ? 0 : duration, ease: 'easeOut' as const });
    // Hélice 12: fecha sobre o bolsão (agonista) ou fica aberta noutra conformação (antagonista).
    const h12Angle = !active ? -48 : agonist ? 8 : -62;

    return (
        <svg viewBox="0 0 300 200" className="w-full h-full block" role="img"
            aria-label={agonist ? 'Receptor androgênico com SARM recrutando coativador no músculo' : 'Receptor androgênico com SARM sem coativador na próstata'}>
            <defs>
                <radialGradient id={`ar-lbd-${mode}`} cx="40%" cy="35%" r="75%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.95} />
                </radialGradient>
            </defs>

            {/* DNA */}
            <g opacity={0.9}>
                {RUNGS.map(x => <line key={x} x1={x} x2={x} y1={DNA_Y - 6} y2={DNA_Y + 6} stroke="rgba(167,139,250,0.45)" strokeWidth={1.4} />)}
                <path d={STRAND_A} fill="none" stroke="#A78BFA" strokeWidth={2.2} />
                <path d={STRAND_B} fill="none" stroke="#C4B5FD" strokeWidth={2.2} strokeOpacity={0.7} />
            </g>
            <text x={DNA_X0} y={196} className="font-mono" fontSize={12} fill="#C4B5FD">DNA</text>

            {/* DBD */}
            <rect x={100} y={140} width={56} height={26} rx={9} fill="#6d28d9" stroke="#C4B5FD" strokeWidth={1.2} />
            <text x={128} y={157} textAnchor="middle" className="font-mono" fontSize={12} fontWeight={700} fill="#EDE9FE">DBD</text>
            <rect x={122} y={128} width={12} height={14} fill="#4c1d95" />

            {/* LBD */}
            <ellipse cx={128} cy={96} rx={68} ry={40} fill={`url(#ar-lbd-${mode})`} stroke="#93C5FD" strokeWidth={1.4} />
            <circle cx={118} cy={92} r={17} fill="#0b1640" stroke="#60A5FA" strokeDasharray="3 3" strokeWidth={1.2} />
            <text x={78} y={124} className="font-mono" fontSize={12} fontWeight={700} fill="#DBEAFE">LBD</text>

            {/* Hélice 12 (pivô na borda superior direita do LBD) */}
            <g transform="translate(172 64)">
                <motion.g initial={false} animate={{ rotate: h12Angle }} transition={t(0.7, 0.8)} style={{ originX: 0, originY: 0.5 }}>
                    <rect x={0} y={-7} width={50} height={14} rx={7} fill={agonist ? COLORS.cyan : '#94A3B8'} fillOpacity={0.85} stroke="#E0F2FE" strokeWidth={1} />
                </motion.g>
            </g>
            <text x={active && !agonist ? 210 : 202} y={active && !agonist ? 30 : 96} className="font-mono" fontSize={12} fill="#BAE6FD">H12</text>

            {/* Ligante */}
            <motion.g initial={false} animate={{ y: active ? 0 : -86, opacity: active ? 1 : 0 }} transition={t(0.1, 0.7)}>
                <SarmMolecule x={118} y={92} />
            </motion.g>

            {/* Coativador */}
            {agonist ? (
                <motion.g initial={false} animate={{ x: active ? 0 : 60, opacity: active ? 1 : 0 }} transition={t(1.4, 0.6)}>
                    <path d="M 196 50 q 18 -26 44 -10 q 22 14 4 34 q -18 16 -40 2 q -14 -10 -8 -26 Z" fill="rgba(16,185,129,0.85)" stroke="#A7F3D0" strokeWidth={1.2} />
                    <text x={222} y={60} textAnchor="middle" className="font-mono" fontSize={12} fontWeight={700} fill="#ECFDF5">coat.</text>
                </motion.g>
            ) : (
                <motion.g initial={false} animate={{ opacity: active ? 1 : 0, x: active ? 0 : -20 }} transition={t(1.4, 0.6)}>
                    <path d="M 226 66 q 18 -26 44 -10 q 22 14 4 34 q -18 16 -40 2 q -14 -10 -8 -26 Z" fill="none" stroke="#6EE7B7" strokeWidth={1.4} strokeDasharray="4 4" />
                    <text x={252} y={76} textAnchor="middle" className="font-mono" fontSize={12} fill="#A7F3D0">coat.</text>
                    <path d="M 210 92 l 14 14 M 224 92 l -14 14" stroke={COLORS.red} strokeWidth={3} strokeLinecap="round" />
                </motion.g>
            )}

            {/* Saída transcricional */}
            {agonist ? (
                <motion.path d={`M 166 ${DNA_Y - 2} C 210 ${DNA_Y - 30}, 250 ${DNA_Y - 30}, 292 ${DNA_Y - 14}`} fill="none" stroke={COLORS.green} strokeWidth={3}
                    strokeDasharray="8 7" initial={false}
                    animate={active ? { opacity: 1, strokeDashoffset: reduced ? 0 : [0, -60] } : { opacity: 0 }}
                    transition={active && !reduced ? { opacity: { delay: 2, duration: 0.4 }, strokeDashoffset: { duration: 1.6, repeat: Infinity, ease: 'linear' } } : { duration: 0.3 }} />
            ) : (
                <motion.g initial={false} animate={{ opacity: active ? 1 : 0 }} transition={t(2, 0.4)}>
                    <path d={`M 166 ${DNA_Y - 2} C 190 ${DNA_Y - 22}, 210 ${DNA_Y - 24}, 228 ${DNA_Y - 20}`} fill="none" stroke="#94A3B8" strokeWidth={3} strokeDasharray="8 7" />
                    <line x1={236} x2={236} y1={DNA_Y - 34} y2={DNA_Y - 6} stroke={COLORS.red} strokeWidth={4} strokeLinecap="round" />
                </motion.g>
            )}
        </svg>
    );
};
