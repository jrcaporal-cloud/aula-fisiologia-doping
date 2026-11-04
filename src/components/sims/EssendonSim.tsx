import { AnimatePresence, motion } from 'framer-motion';
import { User } from 'lucide-react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { ESSENDON_STEPS, LESSONS, PLAYER_COUNT, PLAYER_STATES, type PlayersState } from './peptide/essendon';
import { ClearedStamp, LogSheet, ProofScale, Sanctions } from './peptide/EssendonVisuals';
import { PANEL_BG } from './peptide/ui';

/**
 * Slide "O caso Essendon". Passos 0–3: linha do tempo (programa, investigação, absolvição, CAS);
 * passo 4: lições para o consultório. À direita, os 34 jogadores mudam de estado a cada passo.
 */

const VISUALS = [<LogSheet key="log" />, <Sanctions key="sanctions" />, <ClearedStamp key="stamp" />, <ProofScale key="proof" />];

const NODES = [...ESSENDON_STEPS.map(s => ({ date: s.date, tab: s.tab })), { date: 'hoje', tab: 'As lições' }];

const Timeline = ({ step, onSelect }: { step: number; onSelect: (i: number) => void }) => (
    <div className="relative grid grid-cols-5 gap-2" role="tablist" aria-label="Linha do tempo">
        <div className="absolute left-[10%] right-[10%] top-[15px] h-[2px] bg-white/15" />
        <motion.div className="absolute left-[10%] top-[15px] h-[2px] bg-brand-red"
            animate={{ width: `${(step / (NODES.length - 1)) * 80}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
        {NODES.map((n, i) => {
            const active = i === step;
            const done = i < step;
            return (
                <button key={n.tab} type="button" role="tab" aria-selected={active} onClick={() => onSelect(i)}
                    className="relative flex flex-col items-center gap-1.5 cursor-pointer">
                    <span className="w-[32px] h-[32px] rounded-full border-2 flex items-center justify-center font-mono text-[14px] transition-colors"
                        style={{
                            borderColor: active || done ? '#E11D48' : 'rgba(255,255,255,0.3)',
                            background: active ? '#9F1239' : done ? 'rgba(159,18,57,0.45)' : '#0b0b14',
                            color: '#fff',
                        }}>
                        {i + 1}
                    </span>
                    <span className={`font-mono text-[14px] ${active ? 'text-rose-200' : 'text-gray-300'}`}>{n.date}</span>
                    <span className={`text-[15px] font-semibold leading-tight ${active ? 'text-white' : 'text-gray-300'}`}>{n.tab}</span>
                </button>
            );
        })}
    </div>
);

const Players = ({ state }: { state: PlayersState }) => {
    const look = PLAYER_STATES[state];
    return (
        <div className="rounded-2xl border border-white/10 p-5 flex flex-col gap-3" style={PANEL_BG}>
            <div className="flex items-baseline gap-2">
                <span className="font-display text-[2.6rem] leading-none font-semibold text-white">{PLAYER_COUNT}</span>
                <span className="text-[1.05rem] text-gray-200">jogadores</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: PLAYER_COUNT }, (_, i) => (
                    <motion.span key={i} className="aspect-square rounded-lg border flex items-center justify-center"
                        animate={{ backgroundColor: look.fill, borderColor: look.stroke }}
                        transition={{ duration: 0.4, delay: i * 0.015 }}>
                        <User size={18} color={look.text} aria-hidden />
                    </motion.span>
                ))}
            </div>
            <motion.p key={state} className="text-[1.1rem] font-semibold" style={{ color: look.text }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                {look.label}
            </motion.p>
        </div>
    );
};

const Lessons = () => (
    <div className="h-full flex flex-col gap-3">
        <h3 className="font-display text-[1.6rem] font-semibold leading-tight text-white">O que o caso ensina ao médico</h3>
        <ol className="flex flex-col gap-4">
            {LESSONS.map((l, i) => (
                <motion.li key={l} className="flex gap-3 text-[1.25rem] leading-snug text-gray-100"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: i * 0.15 }}>
                    <span className="font-mono text-[17px] text-rose-300 pt-1">{i + 1}</span>
                    <span>{l}</span>
                </motion.li>
            ))}
        </ol>
    </div>
);

const EssendonSim = () => {
    const { step, setStep } = useSlideSteps(NODES.length);
    const event = ESSENDON_STEPS[Math.min(step, ESSENDON_STEPS.length - 1)];
    const isLessons = step === ESSENDON_STEPS.length;

    return (
        <div className="not-prose w-full font-body text-white select-none flex flex-col gap-4" style={{ height: 488 }}>
            <Timeline step={step} onSelect={setStep} />
            <div className="grid gap-3 flex-1 min-h-0" style={{ gridTemplateColumns: 'minmax(0,1fr) 340px' }}>
                <div className="rounded-2xl border border-white/10 p-6 min-h-0" style={PANEL_BG}>
                    <AnimatePresence mode="wait">
                        <motion.div key={step} className="h-full flex flex-col gap-3"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                            {isLessons ? <Lessons /> : (
                                <>
                                    <h3 className="font-display text-[1.6rem] font-semibold leading-tight text-white">{event.title}</h3>
                                    <p className="text-[1.25rem] leading-snug text-gray-100">{event.text}</p>
                                    <div className="mt-auto">{VISUALS[step]}</div>
                                </>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
                <Players state={event.players} />
            </div>
        </div>
    );
};

export default EssendonSim;
