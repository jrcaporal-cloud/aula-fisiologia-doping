import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { COLORS } from './content';

/** Peças do painel lateral: barras de isoformas, cadeia hepática do IGF-1 e faixa do passaporte (ABP). */

const BODY = { fontFamily: 'var(--font-body)' } as const;

interface BarProps { readonly label: string; readonly share20: number; readonly delay: number; readonly note: string }

/** Barra empilhada 22 kDa / 20 kDa. Proporções ilustrativas (a aula não dá números). */
const IsoBar = ({ label, share20, delay, note }: BarProps) => (
    <div>
        <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-[15px] font-semibold text-white">{label}</span>
            <span className="text-[14px] text-gray-200">{note}</span>
        </div>
        <div className="h-[18px] rounded-md overflow-hidden flex border border-white/10 bg-white/5">
            <motion.div className="h-full" style={{ background: COLORS.iso }} initial={{ width: 0 }} animate={{ width: `${100 - share20}%` }} transition={{ delay, duration: 0.8 }} />
            <motion.div className="h-full" style={{ background: COLORS.iso20 }} initial={{ width: 0 }} animate={{ width: `${share20}%` }} transition={{ delay: delay + 0.6, duration: 0.6 }} />
        </div>
    </div>
);

export const Isoforms = () => (
    <div className="space-y-2">
        <div className="flex items-center gap-3 text-[14px] font-mono">
            <span className="flex items-center gap-1.5 text-gray-100"><span className="w-3 h-3 rounded-sm" style={{ background: COLORS.iso }} />22 kDa</span>
            <span className="flex items-center gap-1.5 text-gray-100"><span className="w-3 h-3 rounded-sm" style={{ background: COLORS.iso20 }} />20 kDa</span>
        </div>
        <IsoBar label="GH endógeno (hipófise)" note="22 + 20 kDa" share20={22} delay={0.2} />
        <IsoBar label="rhGH (191 aa)" note="só 22 kDa" share20={0} delay={0.6} />
        <IsoBar label="Plasma após a injeção" note="proporção muda" share20={8} delay={1.1} />
        <div className="text-[14px] text-amber-200">proporções ilustrativas (a aula não dá valores)</div>
    </div>
);

const Pill = ({ text, color }: { text: string; color: string }) => (
    <span className="px-1.5 py-1 rounded-md font-mono text-[14px] font-semibold border whitespace-nowrap"
        style={{ color, borderColor: `${color}88`, background: `${color}1a` }}>{text}</span>
);

export const HepaticChain = () => (
    <div>
        <div className="flex items-center gap-1">
            <Pill text="GH" color={COLORS.endo} /><ArrowRight size={14} className="text-gray-300 shrink-0" />
            <Pill text="GHR" color="#E5E7EB" /><ArrowRight size={14} className="text-gray-300 shrink-0" />
            <Pill text="JAK2/STAT5" color="#E5E7EB" /><ArrowRight size={14} className="text-gray-300 shrink-0" />
            <Pill text="IGF-1" color={COLORS.igf} />
        </div>
        <div className="mt-1 text-[14px] text-gray-200">receptor GHR nos hepatócitos</div>
    </div>
);

/** Série de amostras do passaporte: faixa de referência ±3 DP; as últimas acima de +3 DP são sinalizadas. */
const SAMPLES: readonly number[] = [0.1, -0.6, 0.4, -0.2, 0.7, -0.4, 0.2, 1.4, 2.2, 3.5, 3.9, 3.7];
export const AbpStrip = () => {
    const W = 318, H = 138, L = 56, R = 8, T = 10, B = 50;
    const y = (sd: number): number => T + ((4.6 - sd) / 9.2) * (H - T - B);
    const x = (i: number): number => L + (i / (SAMPLES.length - 1)) * (W - L - R);
    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label="Passaporte biológico: IGF-1 crônico acima de +3 DP é sinalizado (ilustrativo)">
            <rect x={L} y={y(3)} width={W - L - R} height={y(-3) - y(3)} fill="rgba(96,165,250,0.10)" />
            <line x1={L} x2={W - R} y1={y(3)} y2={y(3)} stroke={COLORS.control} strokeDasharray="5 4" strokeWidth={1.4} />
            <line x1={L} x2={W - R} y1={y(0)} y2={y(0)} stroke="rgba(255,255,255,0.25)" />
            <line x1={L} x2={W - R} y1={y(-3)} y2={y(-3)} stroke="rgba(255,255,255,0.3)" strokeDasharray="5 4" />
            <text x={L - 6} y={y(3) + 4} textAnchor="end" fontSize={16} fontFamily="var(--font-mono)" fill="#FDA4AF">+3 DP</text>
            <text x={L - 6} y={y(0) + 4} textAnchor="end" fontSize={16} fontFamily="var(--font-mono)" fill="#E5E7EB">ref.</text>
            <text x={L - 6} y={y(-3) + 4} textAnchor="end" fontSize={16} fontFamily="var(--font-mono)" fill="#E5E7EB">−3 DP</text>
            <polyline points={SAMPLES.map((s, i) => `${x(i)},${y(s)}`).join(' ')} fill="none" stroke="rgba(147,197,253,0.5)" strokeWidth={1.4} />
            {SAMPLES.map((s, i) => {
                const flagged = s > 3;
                return (
                    <motion.circle key={i} cx={x(i)} cy={y(s)} r={flagged ? 5.5 : 4} fill={flagged ? COLORS.control : COLORS.igf}
                        stroke={flagged ? '#FECDD3' : 'none'} strokeWidth={1.5}
                        initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.12, duration: 0.3 }} />
                );
            })}
            <text x={L} y={H - 28} fontSize={16} fill="#E5E7EB" style={BODY}>amostras no tempo →</text>
            <text x={W - R} y={H - 7} textAnchor="end" fontSize={16} fontWeight={700} fill="#FDA4AF" style={BODY}>sinalizado no ABP</text>
        </svg>
    );
};
