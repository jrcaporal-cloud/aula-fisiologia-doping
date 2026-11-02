import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { C, DEFENSE, PHASE_TEXT, STEPS } from './content';

/** Painel lateral: o texto do slide original para a fase do passo (verbatim). */

const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const PhaseBody = ({ phase, color }: { phase: number; color: string }) => {
    const [showDetail, setShowDetail] = useState(false);
    const p = PHASE_TEXT[phase];
    return (
        <>
            <div className="font-display text-[19px] font-semibold leading-tight" style={{ color }}>{p.label}</div>
            <div className="font-mono text-[12px] uppercase tracking-wider text-gray-300 mt-0.5">{p.sub}</div>
            <AnimatePresence mode="wait" initial={false}>
                {showDetail ? (
                    <motion.p key="detail" className="mt-3 text-[14px] leading-[1.55] text-gray-200"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                        {p.detail}
                    </motion.p>
                ) : (
                    <motion.ul key="items" className="mt-3 space-y-2"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                        {p.items.map((it, i) => (
                            <motion.li key={it} className="flex gap-2.5 text-[13.5px] leading-[1.45] text-gray-200"
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1, duration: 0.3 }}>
                                <span className="mt-[6px] w-2 h-2 shrink-0 rounded-[2px]" style={{ background: color }} />
                                <span>{it}</span>
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
            <button type="button" onClick={() => setShowDetail(v => !v)} aria-pressed={showDetail}
                className="mt-3 self-start flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12.5px] font-semibold cursor-pointer border transition-colors"
                style={showDetail
                    ? { background: `${color}22`, borderColor: `${color}AA`, color: '#fff' }
                    : { background: 'transparent', borderColor: 'rgba(255,255,255,0.18)', color: '#E5E7EB' }}>
                <BookOpen size={13} /> {showDetail ? 'Voltar às etapas' : 'Contexto técnico'}
            </button>
        </>
    );
};

const DefenseBody = () => (
    <>
        <div className="flex items-center gap-2 text-amber-300">
            <ShieldCheck size={19} />
            <div className="font-display text-[19px] font-semibold leading-tight">Defesa: o Passaporte Biológico</div>
        </div>
        <p className="mt-3 text-[14.5px] leading-[1.6] text-gray-200">
            {DEFENSE.before}<strong className="text-white font-semibold">{DEFENSE.strong}</strong>{DEFENSE.after}
        </p>
    </>
);

const HeelBody = () => (
    <>
        <div className="font-display text-[19px] font-semibold leading-tight" style={{ color: C.amber }}>O Calcanhar de Aquiles</div>
        <div className="font-mono text-[12px] uppercase tracking-wider text-gray-300 mt-0.5">Fase 3 · contexto técnico</div>
        <p className="mt-3 text-[14.5px] leading-[1.6] text-gray-200">{PHASE_TEXT[2].detail}</p>
    </>
);

export const SidePanel = ({ step }: { step: number }) => {
    const color = STEPS[step].color;
    return (
        <div className="relative rounded-2xl border border-white/10 overflow-hidden" style={CARD_BG}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: color }} />
            <AnimatePresence mode="wait">
                <motion.div key={step} className="p-4 pl-5 flex flex-col"
                    initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                    {step <= 2 && <PhaseBody phase={step} color={color} />}
                    {step === 3 && <DefenseBody />}
                    {step === 4 && <HeelBody />}
                </motion.div>
            </AnimatePresence>
            <div className="absolute" style={{ left: 20, bottom: 14 }}>
                <span className="text-[12px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                    curvas: modelo ilustrativo
                </span>
            </div>
        </div>
    );
};
