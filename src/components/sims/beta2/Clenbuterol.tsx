import { motion, useReducedMotion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Beta2Glyph } from './Beta2Glyph';
import { C, DOWNREG_DAYS, HALF_LIFE_H } from './content';
import { useDayClock } from './useDayClock';

/**
 * Passo 3: clembuterol. Esquerda: receptores β2 saindo da membrana ao longo de 14 dias
 * (down-regulation → taquifilaxia). Direita (HalfLifeChart): decaimento com t½ ≈ 35 h.
 * Ambos são modelos ilustrativos ancorados nos dois números do slide.
 */

const N = 12;
const MEMBRANE_Y = 150;
const ENDO_Y = 262;
const xOf = (i: number) => 52 + i * 54;
/** Dia em que cada receptor é internalizado (9 de 12 até o dia 14; ordem espalhada). */
const LEAVE_DAY: readonly (number | null)[] = [3, null, 8, 1.5, 12, 5, null, 10, 2.5, 13.5, 6.5, null];
const BILAYER = Array.from({ length: 56 }, (_, k) => 12 + k * 12.3);
const DRUG = [{ x: 90, y: 56 }, { x: 210, y: 92 }, { x: 330, y: 44 }, { x: 450, y: 84 }, { x: 560, y: 50 }, { x: 640, y: 96 }, { x: 150, y: 110 }, { x: 390, y: 112 }] as const;

const Membrane = ({ day, reduced }: { day: number; reduced: boolean }) => (
    <svg viewBox="0 0 700 330" className="absolute inset-0 w-full h-full block" role="img"
        aria-label="Receptores beta-2 sendo retirados da membrana ao longo de 14 a 21 dias de clembuterol">
        <text x={14} y={24} className="font-mono" fontSize={17} fill="#D1D5DB">meio extracelular</text>
        <text x={14} y={320} className="font-mono" fontSize={17} fill="#D1D5DB">citoplasma</text>
        {DRUG.map((d, k) => (
            <motion.g key={k} initial={false} animate={reduced ? {} : { y: [0, 8, 0] }} transition={{ duration: 3 + (k % 3), repeat: Infinity, ease: 'easeInOut' }}>
                <rect x={d.x - 5} y={d.y - 5} width={10} height={10} transform={`rotate(45 ${d.x} ${d.y})`} fill={C.rose} />
            </motion.g>
        ))}
        {/* bicamada lipídica */}
        <rect x={0} y={MEMBRANE_Y - 12} width={700} height={30} fill="rgba(251,191,36,0.06)" />
        {BILAYER.map(x => (
            <g key={x}>
                <circle cx={x} cy={MEMBRANE_Y - 9} r={4.6} fill="#FCD34D" fillOpacity={0.55} />
                <circle cx={x} cy={MEMBRANE_Y + 15} r={4.6} fill="#FCD34D" fillOpacity={0.55} />
                <line x1={x} x2={x} y1={MEMBRANE_Y - 4} y2={MEMBRANE_Y + 10} stroke="#FCD34D" strokeOpacity={0.3} />
            </g>
        ))}
        {Array.from({ length: N }, (_, i) => {
            const leave = LEAVE_DAY[i];
            const gone = leave !== null && day >= leave;
            return (
                <motion.g key={i} initial={false} animate={{ y: gone ? ENDO_Y - MEMBRANE_Y : 0, opacity: gone ? 0.6 : 1 }}
                    transition={{ duration: reduced ? 0 : 0.7, ease: 'easeInOut' }}>
                    <motion.circle cx={xOf(i)} cy={MEMBRANE_Y + 2} r={22} fill="rgba(251,113,133,0.08)" stroke="#FDA4AF" strokeDasharray="3 4"
                        initial={false} animate={{ opacity: gone ? 1 : 0 }} transition={{ duration: 0.4 }} />
                    <Beta2Glyph x={xOf(i)} y={MEMBRANE_Y + 2} on={!gone} color={C.rose} scale={1.5} />
                </motion.g>
            );
        })}
    </svg>
);

interface ClenbuterolSceneProps {
    readonly active: boolean;
}

export const ClenbuterolScene = ({ active }: ClenbuterolSceneProps) => {
    const reduced = useReducedMotion() ?? false;
    const { day, scrub, replay } = useDayClock(DOWNREG_DAYS, 6000, reduced || !active);
    const inMembrane = LEAVE_DAY.filter(d => d === null || day < d).length;
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-1">
                <span className="font-display text-[16px] font-semibold text-white">Receptores β2 na membrana do músculo</span>
                <span className="text-[14px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                    modelo ilustrativo
                </span>
            </div>
            <div className="flex-1 min-h-0 relative mt-1"><Membrane day={day} reduced={reduced} /></div>
            <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                <span className="font-display text-[24px] font-bold w-[150px] shrink-0" style={{ color: C.rose }}>
                    dia {Math.floor(day)}<span className="text-[15px] text-gray-200 font-body font-normal"> de {DOWNREG_DAYS}</span>
                </span>
                <input type="range" min={0} max={DOWNREG_DAYS} step={0.1} value={day} onChange={e => scrub(Number(e.target.value))}
                    aria-label="Dia de uso contínuo de clembuterol" className="flex-1 cursor-pointer" style={{ accentColor: C.rose }} />
                <button type="button" onClick={replay} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[14px] font-semibold border border-white/25 text-gray-100 cursor-pointer hover:bg-white/5">
                    <RotateCcw size={14} /> repetir
                </button>
                <span className="text-[14px] text-gray-100 shrink-0 text-right leading-tight" style={{ width: 210 }}>
                    {day >= DOWNREG_DAYS ? 'taquifilaxia: o β2 sumiu da membrana' : inMembrane === N ? 'receptores na membrana' : 'receptores saindo da membrana'}
                </span>
            </div>
        </div>
    );
};

/** Decaimento com meia-vida de ~35 h (dose única), de 0 a 7 dias. */
const W = 360;
const HT = 188;
const PAD = { l: 46, r: 12, t: 14, b: 50 } as const;
const T_MAX = 168;
const px = (t: number) => PAD.l + (t / T_MAX) * (W - PAD.l - PAD.r);
const py = (pct: number) => PAD.t + (1 - pct / 100) * (HT - PAD.t - PAD.b);
const conc = (t: number) => 100 * 0.5 ** (t / HALF_LIFE_H);
const CURVE = Array.from({ length: 85 }, (_, k) => {
    const t = (k / 84) * T_MAX;
    return `${k === 0 ? 'M' : 'L'} ${px(t).toFixed(1)} ${py(conc(t)).toFixed(1)}`;
}).join(' ');
const X_TICKS = [0, 35, 70, 105, 140] as const;

export const HalfLifeChart = () => (
    <div className="rounded-2xl border border-white/10 px-3 pt-2.5 pb-2 flex-1 min-h-0 flex flex-col" style={{ background: 'rgba(8,8,18,0.72)' }}>
        <div className="flex items-center justify-between gap-2">
            <span className="font-display text-[16px] font-semibold text-white">Meia-vida ~{HALF_LIFE_H} h</span>
            <span className="text-[14px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                modelo ilustrativo
            </span>
        </div>
        <svg viewBox={`0 0 ${W} ${HT}`} className="w-full flex-1 min-h-0 block" role="img" aria-label="Concentração de clembuterol caindo pela metade a cada 35 horas">
            {[0, 50, 100].map(p => (
                <g key={p}>
                    <line x1={PAD.l} x2={W - PAD.r} y1={py(p)} y2={py(p)} stroke="rgba(255,255,255,0.1)" />
                    <text x={PAD.l - 6} y={py(p) + 4} textAnchor="end" className="font-mono" fontSize={14} fill="#E5E7EB">{p}%</text>
                </g>
            ))}
            {X_TICKS.map(t => (
                <text key={t} x={px(t)} y={HT - 28} textAnchor="middle" className="font-mono" fontSize={14} fill="#E5E7EB">{t}</text>
            ))}
            <text x={W - PAD.r} y={HT - 6} textAnchor="end" className="font-body" fontSize={14} fill="#E5E7EB">horas após a dose</text>
            <motion.path d={CURVE} fill="none" stroke={C.rose} strokeWidth={2.6} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeOut' }} />
            {[35, 70].map(t => (
                <g key={t}>
                    <line x1={px(t)} x2={px(t)} y1={py(0)} y2={py(conc(t))} stroke="#FDA4AF" strokeDasharray="3 4" />
                    <circle cx={px(t)} cy={py(conc(t))} r={4.5} fill={C.rose} stroke="#fff" />
                    <text x={px(t) + 8} y={py(conc(t)) - 6} className="font-mono" fontSize={14} fontWeight={700} fill="#FECDD3">{Math.round(conc(t))}%</text>
                </g>
            ))}
        </svg>
    </div>
);
