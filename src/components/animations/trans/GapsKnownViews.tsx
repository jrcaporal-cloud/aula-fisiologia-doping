import { motion } from 'framer-motion';
import { CheckCircle2, HelpCircle, Info, Microscope } from 'lucide-react';
import { GAPS, GAPS_CAPTION, GAPS_NOTE, KNOWN, KNOWN_CAPTION, SOCIETIES } from './scienceData';
import { CARD, CARD_BG } from './StepHeader';

const MAX = 35;
const TICKS = [0, 10, 20, 30];
const COLS = '230px minmax(0,1fr) 70px';
const EASE = [0.16, 1, 0.3, 1] as const;

/** Passo 4: diferença de desempenho entre sexos por modalidade (antes de qualquer TRT). */
export const GapsView = () => (
    <div className={`${CARD} h-full px-5 pt-4 pb-4 flex flex-col`} style={CARD_BG}>
        <div className="text-[16px] text-gray-100">{GAPS_CAPTION}</div>
        <div className="relative flex-1 mt-2 flex flex-col">
            <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: COLS }}>
                <div />
                <div className="relative">
                    {TICKS.map(t => <div key={t} className="absolute top-0 bottom-6 w-px bg-white/[0.08]" style={{ left: `${(t / MAX) * 100}%` }} />)}
                </div>
                <div />
            </div>
            <div className="relative flex-1 flex flex-col justify-around">
                {GAPS.map((g, i) => (
                    <div key={g.sport} className="grid items-center" style={{ gridTemplateColumns: COLS }}>
                        <span className="text-[16px] font-medium text-gray-100">{g.sport}</span>
                        <div className="relative h-4 rounded-full bg-white/[0.05] overflow-hidden">
                            <motion.div className="absolute inset-y-0 left-0 rounded-full"
                                style={{ background: 'linear-gradient(90deg, #60A5FA, #A855F7)' }}
                                initial={{ width: 0 }} animate={{ width: `${(g.gap / MAX) * 100}%` }}
                                transition={{ duration: 0.9, delay: 0.15 + i * 0.1, ease: EASE }} />
                        </div>
                        <span className="text-right font-mono text-[17px] font-bold text-white">~{g.gap}%</span>
                    </div>
                ))}
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
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="mt-3 rounded-xl border px-4 py-2.5 flex gap-3" style={{ borderColor: 'rgba(96,165,250,0.35)', background: 'rgba(30,58,138,0.18)' }}>
            <Info size={18} className="text-blue-300 shrink-0 mt-0.5" />
            <p className="text-[15px] leading-[1.45] text-gray-100">{GAPS_NOTE}</p>
        </motion.div>
    </div>
);

const KnownColumn = ({ confident }: { confident: boolean }) => {
    const items = KNOWN.filter(k => k.confident === confident);
    const color = confident ? '#10B981' : '#F59E0B';
    const Icon = confident ? CheckCircle2 : HelpCircle;
    const offset = confident ? 0 : 0.35;
    return (
        <div className="flex flex-col gap-1.5 min-h-0">
            <div className="flex items-center gap-2">
                <Icon size={20} style={{ color }} />
                <span className="font-display text-[19px] font-semibold" style={{ color }}>{confident ? 'Evidência sólida' : 'Inconclusivo'}</span>
            </div>
            {items.map((k, i) => (
                <motion.div key={k.item} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: offset + i * 0.1 }}
                    className="rounded-xl border px-3.5 py-1.5 min-h-[46px] flex items-center"
                    style={{ borderColor: `${color}44`, background: `${color}10` }}>
                    <span className="text-[15px] leading-snug text-gray-100">{k.item}</span>
                </motion.div>
            ))}
        </div>
    );
};

/** Passo 5: o que a literatura consegue (ou não) afirmar + posição das sociedades médicas. */
export const KnownView = () => (
    <div className={`${CARD} h-full px-5 pt-3.5 pb-4 flex flex-col`} style={CARD_BG}>
        <div className="text-[16px] text-gray-100">{KNOWN_CAPTION}</div>
        <div className="grid grid-cols-2 gap-5 mt-2.5">
            <KnownColumn confident />
            <KnownColumn confident={false} />
        </div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="mt-auto rounded-xl border border-white/10 px-4 py-2.5 flex gap-3 shrink-0" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <Microscope size={18} className="text-gray-200 shrink-0 mt-0.5" />
            <div>
                <div className="text-[15px] font-bold text-white">{SOCIETIES.title}</div>
                <p className="text-[15px] leading-[1.45] text-gray-200 mt-0.5"><strong className="text-white">{SOCIETIES.who}</strong>{SOCIETIES.text}</p>
            </div>
        </motion.div>
    </div>
);
