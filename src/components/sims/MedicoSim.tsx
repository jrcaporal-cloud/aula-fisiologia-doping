import { AnimatePresence, motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { MEDICO_STEPS, type InfoBlock } from './medico/data';

const TONES: Record<NonNullable<InfoBlock['tone']>, string> = {
    red: 'bg-brand-red/20 text-rose-200 border-brand-red/50',
    blue: 'bg-sky-400/15 text-sky-200 border-sky-300/40',
    amber: 'bg-amber-400/15 text-amber-200 border-amber-300/40',
};
const NEUTRAL = 'bg-white/10 text-gray-100 border-white/25';

/** O médico diante do doping: um painel por passo (regra, AUT, consultório, suplementos). */
export default function MedicoSim() {
    const { step } = useSlideSteps(MEDICO_STEPS.length);
    const current = MEDICO_STEPS[step];
    const columns = current.blocks.length === 4 ? 'grid-cols-2' : 'grid-cols-3';

    return (
        <div className="not-prose w-full">
            <div className="flex gap-3 mb-5" role="tablist" aria-label="Etapas">
                {MEDICO_STEPS.map((s, i) => {
                    const Icon = s.icon;
                    const active = i === step;
                    return (
                        <div
                            key={s.tab}
                            role="tab"
                            aria-selected={active}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[16px] transition-colors ${
                                active ? 'bg-brand-crimson/50 border-brand-red text-white' : i < step ? 'border-white/25 text-gray-200' : 'border-white/15 text-gray-300'
                            }`}
                        >
                            <Icon size={18} aria-hidden /> {s.tab}
                        </div>
                    );
                })}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.35 }}
                    className="rounded-3xl border border-white/10 bg-black/45 backdrop-blur-xl p-8 min-h-[452px] flex flex-col"
                >
                    <h3 className="font-display text-[1.9rem] leading-tight font-semibold text-white mb-6">{current.title}</h3>
                    <div className={`grid ${columns} gap-4`}>
                        {current.blocks.map(b => (
                            <div key={b.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 flex flex-col gap-3">
                                <span className={`self-start px-3 py-1 rounded-full border text-[15px] font-semibold uppercase tracking-wider ${b.tone ? TONES[b.tone] : NEUTRAL}`}>
                                    {b.label}
                                </span>
                                <p className="text-[1.2rem] leading-snug text-gray-100">{b.text}</p>
                            </div>
                        ))}
                    </div>
                    <p className="mt-auto pt-5 text-[1.05rem] leading-snug text-gray-300">{current.foot}</p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
