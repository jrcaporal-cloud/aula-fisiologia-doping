import { AnimatePresence, motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { DETECTION_FACTS, EVIDENCE_ROWS, EVIDENCE_STEPS, LEVELS, MOLECULE_RISKS, VIAL_RISKS, type RiskCard } from './peptide/evidence';
import { PANEL_BG, StepTabs } from './peptide/ui';

/**
 * Slide "Promessa × evidência × risco". Passos: 0 escada de evidência por peptídeo · 1 riscos do frasco · 2 riscos da molécula
 * · 3 como o laboratório encontra peptídeos (conceitual).
 */

const NAME_COL = 250;
const BAR_COLOR = '#38BDF8';

const Ladder = () => (
    <div className="h-full flex flex-col">
        <div className="grid items-end pb-2 border-b border-white/15" style={{ gridTemplateColumns: `${NAME_COL}px repeat(${LEVELS.length}, minmax(0,1fr))` }}>
            <span className="text-[14px] uppercase tracking-wider text-gray-300">Promessa</span>
            {LEVELS.map(l => <span key={l} className="text-[15px] font-semibold text-gray-100 text-center leading-tight px-1">{l}</span>)}
        </div>
        <div className="flex-1 flex flex-col justify-around">
            {EVIDENCE_ROWS.map((row, r) => (
                <div key={row.name} className="grid items-center" style={{ gridTemplateColumns: `${NAME_COL}px minmax(0,1fr)` }}>
                    <div className="pr-3">
                        <p className="font-display text-[1.2rem] font-semibold text-white leading-tight">{row.name}</p>
                        <p className="text-[15px] text-gray-300 leading-tight">{row.promise}</p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <div className="relative h-[18px] rounded-full bg-white/[0.05]">
                            {LEVELS.slice(1).map((l, i) => (
                                <span key={l} className="absolute top-0 bottom-0 w-px bg-white/10" style={{ left: `${((i + 1) / LEVELS.length) * 100}%` }} />
                            ))}
                            <motion.div className="absolute left-0 top-0 bottom-0 rounded-full"
                                style={{ background: `linear-gradient(90deg, rgba(56,189,248,0.25), ${BAR_COLOR})` }}
                                initial={{ width: 0 }} animate={{ width: `${((row.level + 0.5) / LEVELS.length) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.2 + r * 0.25, ease: 'easeOut' }} />
                        </div>
                        <motion.p className="text-[15px] leading-snug text-gray-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.7 + r * 0.25 }}>
                            {row.finding}
                        </motion.p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const RiskGrid = ({ cards, tone = 'rose' }: { cards: readonly RiskCard[]; tone?: 'rose' | 'sky' }) => (
    <div className={`h-full grid gap-3 ${cards.length === 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {cards.map((c, i) => {
            const Icon = c.icon;
            return (
                <motion.div key={c.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-5 flex flex-col gap-3"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: i * 0.12 }}>
                    <span className={`flex items-center gap-2 font-display text-[1.35rem] font-semibold ${tone === 'sky' ? 'text-sky-200' : 'text-rose-200'}`}>
                        <Icon size={22} aria-hidden /> {c.title}
                    </span>
                    <p className={`${cards.length === 4 ? 'text-[1.15rem]' : 'text-[1.3rem]'} leading-snug text-gray-100`}>{c.text}</p>
                </motion.div>
            );
        })}
    </div>
);

const PeptideEvidenceSim = () => {
    const { step, setStep } = useSlideSteps(EVIDENCE_STEPS.length);
    const info = EVIDENCE_STEPS[step];

    return (
        <div className="not-prose w-full font-body text-white select-none flex flex-col gap-2" style={{ height: 492 }}>
            <StepTabs labels={EVIDENCE_STEPS.map(s => s.tab)} step={step} onSelect={setStep} layoutId="pep-evidence-tab" />
            <div className="flex-1 min-h-0 rounded-2xl border border-white/10 p-5 flex flex-col gap-3" style={PANEL_BG}>
                <div className="flex-1 min-h-0">
                    <AnimatePresence mode="wait">
                        <motion.div key={step} className="h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                            {step === 0 && <Ladder />}
                            {step === 1 && <RiskGrid cards={VIAL_RISKS} />}
                            {step === 2 && <RiskGrid cards={MOLECULE_RISKS} />}
                            {step === 3 && <RiskGrid cards={DETECTION_FACTS} tone="sky" />}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <p className="pt-3 border-t border-white/10 text-[1.08rem] leading-snug text-white font-medium">{info.foot}</p>
            </div>
        </div>
    );
};

export default PeptideEvidenceSim;
