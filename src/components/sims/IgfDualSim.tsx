import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { CollateralScene } from './igfdual/CollateralScene';
import { STEPS, SYNERGY, type SynergyId } from './igfdual/content';
import { SidePanel } from './igfdual/SidePanel';
import { SynergyScene } from './igfdual/SynergyScene';
import { SystemicLocalScene } from './igfdual/SystemicLocalScene';

/**
 * Slide "IGF-1 Local vs Sistêmico — a vantagem dupla do eixo GH-IGF-1 no esporte de elite".
 * Passos: 0 IGF-1 hepático pelo sangue a todas as células · 1 MGF local na fibra sob tensão (+ GH exógeno: 3–5×)
 * · 2 os dois juntos · 3 sinergia do stack (EAA, GH/IGF-1, insulina, EPO) · 4 colateral diabetogênico.
 */

const CARD_BG = { background: 'rgba(8,8,18,0.72)' };
const REVEAL_MS = 750;

const IgfDualSim = () => {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const [boost, setBoost] = useState(false);
    const [revealed, setRevealed] = useState(0);
    const [focus, setFocus] = useState<SynergyId | null>(null);
    const info = STEPS[step];

    // Passo 3: as quatro drogas entram uma a uma; ao sair do passo, volta ao início.
    useEffect(() => {
        if (step !== 3) return undefined;
        const id = window.setInterval(() => setRevealed(r => Math.min(r + 1, SYNERGY.length)), REVEAL_MS);
        return () => {
            window.clearInterval(id);
            setRevealed(0);
            setFocus(null);
        };
    }, [step]);

    const scene = step <= 2 ? 'dual' : step === 3 ? 'synergy' : 'collateral';

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: 488 }}>
            <div className="flex items-center justify-between gap-4 h-[42px] mb-1.5">
                <div className="flex items-center gap-3 min-w-0">
                    <motion.span key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                        className="font-display text-[18px] font-semibold truncate" style={{ color: info.color }}>
                        {info.title}
                    </motion.span>
                </div>
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 p-1 shrink-0" style={CARD_BG} role="tablist" aria-label="Passos">
                    {STEPS.map((s, i) => {
                        const active = i === step;
                        return (
                            <button key={s.label} type="button" role="tab" aria-selected={active} onClick={() => setStep(i)}
                                className="relative px-2.5 py-1.5 rounded-xl text-[15px] font-semibold cursor-pointer transition-colors"
                                style={{ color: active ? '#fff' : '#D1D5DB' }}>
                                {active && (
                                    <motion.span layoutId="igfd-step" className="absolute inset-0 rounded-xl"
                                        style={{ background: `${s.color}22`, border: `1px solid ${s.color}99` }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                                )}
                                <span className="relative flex items-center gap-1.5">
                                    <span className="font-mono text-[14px]" style={{ color: s.color }}>{i + 1}</span>
                                    {s.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 360px', height: 440 }}>
                <div className="rounded-2xl border border-white/10 px-3.5 pt-2 pb-1.5 flex flex-col min-h-0" style={CARD_BG}>
                    <div className="flex items-center justify-between gap-3 min-h-[30px]">
                        <motion.span key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                            className="text-[15px] leading-tight text-gray-100">{info.caption}</motion.span>
                        <div className="flex items-center gap-2 shrink-0">
                            {(step === 1 || step === 2) && (
                                <button type="button" onClick={() => setBoost(b => !b)} aria-pressed={boost}
                                    className="px-2.5 py-1 rounded-lg text-[14px] font-semibold cursor-pointer border transition-colors"
                                    style={boost
                                        ? { background: 'rgba(245,158,11,0.18)', borderColor: 'rgba(245,158,11,0.75)', color: '#FDE68A' }
                                        : { background: 'transparent', borderColor: 'rgba(255,255,255,0.18)', color: '#E5E7EB' }}>
                                    {boost ? 'com GH exógeno' : '+ GH exógeno'}
                                </button>
                            )}
                            <span className="text-[14px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                                esquema ilustrativo
                            </span>
                        </div>
                    </div>
                    <div className="relative flex-1 min-h-0">
                        <AnimatePresence initial={false}>
                            <motion.div key={scene} className="absolute inset-0"
                                initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.45, delay: 0.1 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                                {scene === 'dual' && <SystemicLocalScene step={step} boost={boost} />}
                                {scene === 'synergy' && <SynergyScene revealed={revealed} focus={focus} />}
                                {scene === 'collateral' && <CollateralScene />}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
                <SidePanel step={step} boost={boost} onBoost={() => setBoost(b => !b)} revealed={revealed} focus={focus} onFocus={setFocus} />
            </div>
        </div>
    );
};

export default IgfDualSim;
