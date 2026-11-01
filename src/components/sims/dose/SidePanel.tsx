import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';
import { MAX_SLOPE, SEGMENT_YIELDS, STAGES, fmt, gainAt, segmentIndexAt, slopeAt, stageAtDose, type Stage } from './model';

const EASE = [0.22, 1, 0.36, 1] as const;
const CARD = 'rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)]';

interface SidePanelProps {
    step: number;
    dose: number;
}

export const SidePanel = ({ step, dose }: SidePanelProps) => {
    const reduce = useReducedMotion();
    return (
        <div className="relative h-full w-full">
            <AnimatePresence initial={false}>
                <motion.div
                    key={step >= 4 ? 'curve' : `stage-${step}`}
                    initial={reduce ? false : { opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduce ? undefined : { opacity: 0, x: -12, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-0 flex flex-col gap-3"
                >
                    {step >= 4 ? <CurveReadout dose={dose} /> : <StageReadout stage={STAGES[step]} step={step} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

/* ---------- passos 0–3: o ponto que acabou de entrar ---------- */

const StageReadout = ({ stage, step }: { stage: Stage; step: number }) => (
    <>
        <div className={`${CARD} p-5`} style={{ boxShadow: `inset 0 0 0 1px ${stage.color}33, 0 0 40px -18px ${stage.color}` }}>
            <div className="flex items-center justify-between">
                <span className="rounded-full px-3 py-1 font-mono text-[13px] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: stage.color, background: `${stage.color}1f` }}>
                    {stage.name}
                </span>
                <span className="font-mono text-[15px] text-zinc-300">{stage.doseText}</span>
            </div>
            <div className="mt-4 font-display text-[56px] font-semibold leading-none" style={{ color: stage.color }}>
                {stage.id === 'fisio' ? '~0 kg' : <AnimatedNumber value={stage.gain} prefix="+" suffix={stage.id === 'abuso' ? ' kg+' : ' kg'} delay={0.25} />}
            </div>
            <div className="mt-1 font-body text-[14px] text-zinc-400">de massa magra</div>
            <p className="mt-4 font-body text-[16px] leading-snug text-zinc-100">{stage.note}</p>
            {stage.risk && (
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#E11D48]/50 bg-[#E11D48]/15 px-3 py-2 font-body text-[15px] font-semibold text-[#FDA4AF]">
                    <AlertTriangle size={18} strokeWidth={2.4} />
                    {stage.risk}
                </div>
            )}
        </div>

        <div className={`${CARD} px-5 py-4`}>
            <div className="mb-2 font-mono text-[12px] uppercase tracking-[0.14em] text-zinc-400">Pontos da aula</div>
            <ul className="flex flex-col gap-1.5">
                {STAGES.map((s, i) => (
                    <li key={s.id} className="flex items-center gap-3 font-body text-[15px] transition-opacity duration-500"
                        style={{ opacity: i <= step ? 1 : 0.28 }}>
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                        <span className="flex-1 text-zinc-100">{s.name}</span>
                        <span className="w-[68px] font-mono text-[13px] text-zinc-400">{s.doseText}</span>
                        <span className="w-[72px] text-right font-mono text-[14px] font-semibold" style={{ color: s.color }}>
                            {i <= step ? s.gainText : '—'}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    </>
);

/* ---------- passo 4: cursor na curva + derivada ---------- */

const CurveReadout = ({ dose }: { dose: number }) => {
    const stage = stageAtDose(dose);
    const perHundred = slopeAt(dose) * 100;
    const activeSeg = segmentIndexAt(dose);
    const maxYield = Math.max(...SEGMENT_YIELDS.map(s => s.perHundred));

    return (
        <>
            <div className={`${CARD} p-5`}>
                <div className="flex items-baseline justify-between">
                    <span className="font-mono text-[12px] uppercase tracking-[0.14em] text-zinc-400">Dose</span>
                    <span className="font-mono text-[13px] font-semibold uppercase tracking-[0.1em]" style={{ color: stage.color }}>{stage.name}</span>
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-display text-[34px] font-semibold leading-none text-white">{Math.round(dose)} mg</span>
                    <span className="font-display text-[26px] font-semibold leading-none text-zinc-200">+{fmt(gainAt(dose))} kg</span>
                </div>

                {stage.risk && (
                    <div className="mt-3 flex items-center gap-2 font-body text-[14px] font-semibold text-[#FDA4AF]">
                        <AlertTriangle size={16} strokeWidth={2.4} />
                        {stage.risk}
                    </div>
                )}

                <div className="mt-5 font-mono text-[12px] uppercase tracking-[0.14em] text-zinc-400">kg por 100 mg adicionais</div>
                <div className="mt-1 font-display text-[60px] font-semibold leading-none tabular-nums" style={{ color: stage.color }}>
                    {fmt(perHundred, 2)}
                </div>
                <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                    <div className="absolute inset-y-0 left-0 rounded-full"
                        style={{ width: `${(perHundred / (MAX_SLOPE * 100)) * 100}%`, background: stage.color, transition: 'background 0.4s' }} />
                </div>
                <div className="mt-2 font-body text-[13px] text-zinc-400">
                    Inclinação da tangente · <span className="text-amber-400">modelo ilustrativo</span>
                </div>
            </div>

            <div className={`${CARD} px-5 py-4`}>
                <div className="font-mono text-[12px] uppercase tracking-[0.14em] text-zinc-400">Ganho médio por 100 mg</div>
                <div className="mb-3 font-body text-[13px] text-zinc-400">calculado entre os pontos da aula</div>
                <ul className="flex flex-col gap-2.5">
                    {SEGMENT_YIELDS.map((seg, i) => {
                        const on = i === activeSeg;
                        return (
                            <li key={seg.to.id} className="transition-opacity duration-300" style={{ opacity: on ? 1 : 0.55 }}>
                                <div className="flex items-baseline justify-between font-mono text-[13px]">
                                    <span className="text-zinc-200">{seg.from.dose} → {seg.to.dose} mg</span>
                                    <span className="text-[15px] font-bold" style={{ color: seg.to.color }}>{fmt(seg.perHundred, 2)} kg</span>
                                </div>
                                <div className="mt-1 h-2 rounded-full bg-white/10">
                                    <div className="h-full rounded-full"
                                        style={{ width: `${(seg.perHundred / maxYield) * 100}%`, background: seg.to.color, boxShadow: on ? `0 0 12px ${seg.to.color}` : 'none' }} />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </>
    );
};
