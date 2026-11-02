import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { CaseTimeline } from './trans/CaseTimeline';
import {
    CASES, CASE_STEP_TITLES, FRAGMENTATION, POLICIES, RESULT_COLOR, RESULT_LABEL,
    type SportCase,
} from './trans/casesData';
import { CARD, CARD_BG, StepHeader, type StepChip } from './trans/StepHeader';

const POLICY_STEP = CASES.length;

const CHIPS: readonly StepChip[] = [
    { label: 'Casos emblemáticos', to: 0, steps: CASES.map((_, i) => i) },
    { label: 'Políticas das federações', to: POLICY_STEP, steps: [POLICY_STEP] },
];

const Block = ({ label, text, color = '#D1D5DB', delay }: { label: string; text: string; color?: string; delay: number }) => (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}>
        <div className="font-mono text-[13px] uppercase tracking-widest font-semibold" style={{ color }}>{label}</div>
        <p className="text-[16px] leading-[1.45] text-gray-100 mt-1">{text}</p>
    </motion.div>
);

const Pill = ({ text, color }: { text: string; color: string }) => (
    <span className="rounded-full border px-3 py-1 text-[14px] font-semibold whitespace-nowrap" style={{ borderColor: `${color}66`, color, background: `${color}14` }}>
        {text}
    </span>
);

/** Passos 0–3: um caso por vez. */
const CaseCard = ({ c }: { c: SportCase }) => (
    <div className={`${CARD} h-full relative overflow-hidden px-6 pt-3.5 pb-3.5 flex flex-col`} style={CARD_BG}>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: c.color }} />
        <div className="flex items-start justify-between gap-4">
            <div>
                <div className="font-display text-[28px] font-semibold leading-none" style={{ color: c.color }}>{c.name}</div>
                <div className="text-[15px] text-gray-200 mt-1.5">{c.country} · {c.sport} · {c.year}</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Pill text={c.regulation} color="#CBD5E1" />
                <Pill text={RESULT_LABEL[c.result]} color={RESULT_COLOR[c.result]} />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 mt-3.5">
            <div className="flex flex-col gap-3.5">
                <Block label="O caso" text={c.case} delay={0.1} />
                <Block label="Impacto regulatório" text={c.impact} delay={0.3} />
            </div>
            <div className="flex flex-col gap-3">
                <Block label="Desfecho" text={c.outcome} delay={0.2} />
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
                    className="rounded-xl border px-3.5 py-2.5" style={{ borderColor: 'rgba(245,158,11,0.35)', background: 'rgba(120,53,0,0.18)' }}>
                    <div className="font-mono text-[13px] uppercase tracking-widest font-semibold text-amber-300">O elemento surpreendente</div>
                    <p className="text-[16px] leading-[1.42] text-gray-100 mt-1">{c.twist}</p>
                </motion.div>
            </div>
        </div>
    </div>
);

/** Passo 4: as políticas, em ordem cronológica, e o problema da fragmentação. */
const PoliciesPanel = () => (
    <div className="h-full flex flex-col gap-3">
        <div className="grid grid-cols-4 gap-3 flex-1 min-h-0">
            {POLICIES.map((p, i) => (
                <motion.div key={p.org} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 + i * 0.12 }}
                    className="rounded-2xl border px-4 pt-3.5 pb-3 flex flex-col" style={{ borderColor: `${p.color}55`, background: `${p.color}0D` }}>
                    <div className="font-mono text-[15px] font-semibold text-gray-200">{p.year}</div>
                    <div className="font-display text-[21px] font-semibold leading-tight mt-0.5" style={{ color: p.color }}>{p.org}</div>
                    <div className="mt-1.5"><span className="rounded-md px-2 py-0.5 text-[13px] font-semibold capitalize" style={{ background: `${p.color}22`, color: p.color }}>{p.stance}</span></div>
                    <p className="text-[15px] leading-[1.45] text-gray-100 mt-2.5">{p.rule}</p>
                </motion.div>
            ))}
        </div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.65 }}
            className="rounded-2xl border px-4 py-3 flex gap-3 shrink-0" style={{ borderColor: 'rgba(225,29,72,0.35)', background: 'rgba(127,29,29,0.18)' }}>
            <AlertTriangle size={20} className="text-rose-300 shrink-0 mt-0.5" />
            <div>
                <div className="text-[15px] font-bold text-rose-200">{FRAGMENTATION.title}</div>
                <p className="text-[15px] leading-[1.45] text-gray-100 mt-0.5">{FRAGMENTATION.text}</p>
            </div>
        </motion.div>
    </div>
);

/**
 * "Casos que Mudaram as Regras do Esporte".
 * Passos: 0 Semenya · 1 Chand · 2 Hubbard · 3 Thomas · 4 políticas das federações.
 */
export const TransCasesTimeline = () => {
    const { step, count, setStep } = useSlideSteps(CASE_STEP_TITLES.length);
    return (
        <MotionConfig reducedMotion="user">
            <div className="not-prose w-full font-body text-white select-none flex flex-col gap-2" style={{ height: 486 }}>
                <StepHeader step={step} count={count} title={CASE_STEP_TITLES[step]} chips={CHIPS} accent="#A855F7" layoutId="tc-chip" onStep={setStep} />
                <CaseTimeline step={step} onStep={setStep} />
                <div className="flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} className="h-full"
                            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
                            {step < POLICY_STEP ? <CaseCard c={CASES[step]} /> : <PoliciesPanel />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </MotionConfig>
    );
};
