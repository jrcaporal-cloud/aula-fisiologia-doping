import { motion } from 'framer-motion';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { DUR, EASE_OUT, stagger } from '../../../lib/motion';
import { IllustrativeTag } from '../../deck/IllustrativeTag';
import { C, DEFENSE, PHASE_TEXT, STEPS } from './content';

/** Painel lateral: o texto do slide original para a fase do passo (verbatim). */

const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const PhaseBody = ({ phase, color }: { phase: number; color: string }) => {
    const [showDetail, setShowDetail] = useState(false);
    const p = PHASE_TEXT[phase];
    return (
        <>
            <div className="text-[21px] font-semibold leading-tight" style={{ color }}>{p.label}</div>
            <div className="font-mono text-[14px] uppercase tracking-wide text-gray-300 mt-0.5">{p.sub}</div>
            {showDetail ? (
                <motion.p key="detail" className="mt-2.5 text-[16px] leading-[1.45] text-gray-100"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR.text, ease: EASE_OUT }}>
                    {p.detail}
                </motion.p>
            ) : (
                <motion.ul key="items" className="mt-2 space-y-1.5"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: DUR.text, ease: EASE_OUT }}>
                    {p.items.map((it, i) => (
                        <motion.li key={it} className="flex gap-2.5 text-[14.5px] leading-[1.36] text-gray-100"
                            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stagger(i, 0.1, 0.1), duration: DUR.enter, ease: EASE_OUT }}>
                            <span className="mt-[6px] w-2 h-2 shrink-0 rounded-[2px]" style={{ background: color }} />
                            <span>{it}</span>
                        </motion.li>
                    ))}
                </motion.ul>
            )}
            <button type="button" onClick={() => setShowDetail(v => !v)} aria-pressed={showDetail}
                className="mt-2 self-start flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[14px] font-semibold cursor-pointer border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--act-color,#E11D48)]"
                style={showDetail
                    ? { background: `${color}22`, borderColor: `${color}AA`, color: '#fff' }
                    : { background: 'transparent', borderColor: 'rgba(255,255,255,0.18)', color: '#E5E7EB' }}>
                <BookOpen size={15} /> {showDetail ? 'Voltar às etapas' : 'Contexto técnico'}
            </button>
        </>
    );
};

const DefenseBody = () => (
    <>
        <div className="flex items-center gap-2 text-amber-300">
            <ShieldCheck size={22} />
            <div className="text-[22px] font-semibold leading-tight">Defesa: o Passaporte Biológico</div>
        </div>
        <p className="mt-4 text-[18px] leading-[1.5] text-gray-100">
            {DEFENSE.before}<strong className="text-white font-semibold">{DEFENSE.strong}</strong>{DEFENSE.after}
        </p>
    </>
);

const HeelBody = () => (
    <>
        <div className="text-[22px] font-semibold leading-tight" style={{ color: C.amber }}>O Calcanhar de Aquiles</div>
        <div className="font-mono text-[14px] uppercase tracking-wide text-gray-300 mt-0.5">Fase 3 · contexto técnico</div>
        <p className="mt-4 text-[18px] leading-[1.5] text-gray-100">{PHASE_TEXT[2].detail}</p>
    </>
);

export const SidePanel = ({ step }: { step: number }) => {
    const color = STEPS[step].color;
    return (
        <div className="relative rounded-2xl border border-white/10 overflow-hidden" style={CARD_BG}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: color }} />
            <motion.div key={step} className="p-4 pl-5 pb-12 flex flex-col"
                initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: DUR.enter, ease: EASE_OUT }}>
                {step <= 2 && <PhaseBody phase={step} color={color} />}
                {step === 3 && <DefenseBody />}
                {step === 4 && <HeelBody />}
            </motion.div>
            <div className="absolute" style={{ left: 20, bottom: 14 }}>
                <IllustrativeTag>curvas: modelo ilustrativo</IllustrativeTag>
            </div>
        </div>
    );
};
