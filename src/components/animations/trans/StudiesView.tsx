import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { STUDIES, yearsLabel } from './scienceData';
import { CARD, CARD_BG } from './StepHeader';

const MAX = 15;
const TICKS = [0, 5, 10, 15];
const COLS = '250px minmax(0,1fr) 150px';
const EASE = [0.16, 1, 0.3, 1] as const;

interface StudiesViewProps {
    /** Estudo em destaque (0–3); os anteriores ficam no gráfico. */
    readonly current: number;
    readonly onPick: (i: number) => void;
}

/** Passos 0–3: cada estudo entra com a barra de vantagem residual; à direita, achado e limitação. */
export const StudiesView = ({ current, onPick }: StudiesViewProps) => {
    const s = STUDIES[current];
    return (
        <div className="h-full grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 380px' }}>
            <div className={`${CARD} px-5 pt-4 pb-3 flex flex-col`} style={CARD_BG}>
                <div className="font-mono text-[13px] uppercase tracking-widest text-gray-300">Vantagem residual após TRT (%)</div>
                <div className="relative flex-1 mt-2 flex flex-col">
                    <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: COLS }}>
                        <div />
                        <div className="relative">
                            {TICKS.map(t => <div key={t} className="absolute top-0 bottom-6 w-px bg-white/[0.08]" style={{ left: `${(t / MAX) * 100}%` }} />)}
                        </div>
                        <div />
                    </div>
                    <div className="relative flex-1 flex flex-col justify-around">
                        {STUDIES.map((st, i) => {
                            const shown = i <= current;
                            const active = i === current;
                            return (
                                <button key={st.name} type="button" onClick={() => onPick(i)} disabled={!shown}
                                    className="grid items-center text-left rounded-xl transition-opacity duration-500 cursor-pointer disabled:cursor-default"
                                    style={{ gridTemplateColumns: COLS, opacity: shown ? (active ? 1 : 0.62) : 0.18 }}>
                                    <div className="pr-3">
                                        <div className="text-[17px] font-semibold leading-tight" style={{ color: active ? st.color : '#F3F4F6' }}>{st.name}</div>
                                        <div className="text-[14px] text-gray-300 leading-tight mt-0.5">{st.n} · {yearsLabel(st.years)}</div>
                                    </div>
                                    <div className="relative h-[30px]">
                                        <div className="absolute inset-x-0 top-[5px] h-5 rounded-md bg-white/[0.05]" />
                                        {shown && st.adv > 0 && (
                                            <motion.div className="absolute left-0 top-[5px] h-5 rounded-md"
                                                style={{ background: st.color, boxShadow: active ? `0 0 18px ${st.color}66` : 'none' }}
                                                initial={{ width: 0 }} animate={{ width: `${(st.adv / MAX) * 100}%` }}
                                                transition={{ duration: 0.9, ease: EASE, delay: 0.15 }} />
                                        )}
                                        {shown && st.adv === 0 && (
                                            <motion.div className="absolute left-0 top-[3px] h-6 w-1 rounded-full" style={{ background: st.color }}
                                                initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.15 }} />
                                        )}
                                    </div>
                                    <div className="text-right font-mono text-[16px] font-bold whitespace-nowrap" style={{ color: shown ? st.color : '#6B7280' }}>
                                        {shown ? (st.adv === 0 ? 'Sem diferença' : `+${st.adv}%`) : '—'}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="grid h-6 items-end" style={{ gridTemplateColumns: COLS }}>
                        <div />
                        <div className="relative h-full">
                            {TICKS.map(t => (
                                <span key={t} className="absolute bottom-0 -translate-x-1/2 font-mono text-[13px] text-gray-300" style={{ left: `${(t / MAX) * 100}%` }}>{t}%</span>
                            ))}
                        </div>
                        <div />
                    </div>
                </div>
            </div>

            <div className={`${CARD} relative overflow-hidden px-5 pt-4 pb-4`} style={CARD_BG}>
                <AnimatePresence mode="wait">
                    <motion.div key={s.name} className="h-full flex flex-col"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: s.color }} />
                        <div className="font-display text-[22px] font-semibold leading-tight" style={{ color: s.color }}>{s.name}</div>
                        <div className="text-[14px] text-gray-300 mt-0.5">{s.n} · {yearsLabel(s.years)}</div>
                        <div className="flex flex-col mt-3">
                            <span className="font-display text-[34px] font-semibold leading-none whitespace-nowrap" style={{ color: s.color }}>{s.adv === 0 ? 'Sem diferença' : `+${s.adv}%`}</span>
                            <span className="text-[14px] text-gray-300 mt-1">vantagem residual</span>
                        </div>
                        <div className="font-mono text-[13px] uppercase tracking-widest text-gray-300 mt-4">Achado principal</div>
                        <p className="text-[16px] leading-[1.45] text-gray-100 mt-1">{s.finding}</p>
                        <div className="mt-auto rounded-xl border px-3.5 py-3" style={{ borderColor: 'rgba(245,158,11,0.35)', background: 'rgba(120,53,0,0.16)' }}>
                            <div className="flex items-center gap-2 text-amber-300">
                                <AlertTriangle size={16} />
                                <span className="font-mono text-[13px] uppercase tracking-widest font-semibold">Limitação crítica</span>
                            </div>
                            <p className="text-[15px] leading-[1.45] text-gray-100 mt-1">{s.limit}</p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};
