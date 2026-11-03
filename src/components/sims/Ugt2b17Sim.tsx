import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { GENOTYPES, STEP_COUNT, stepLabel, type Genotype } from './ugt2b17/content';
import { Scene } from './ugt2b17/Scene';
import { SidePanel } from './ugt2b17/SidePanel';

/** Genótipo que cada passo mostra por padrão (o botão continua livre em qualquer passo). */
const STEP_GENOTYPE: Partial<Record<number, Genotype>> = { 3: 'normal', 4: 'del' };

/**
 * "O Polimorfismo UGT2B17": o caminho da testosterona do sangue até o frasco de urina.
 * Passos: 0 sangue · 1 glucuronidação hepática · 2 teste T/E · 3 gene normal + doping · 4 deleção (falso negativo).
 */
const Ugt2b17Sim = () => {
    const { step } = useSlideSteps(STEP_COUNT);
    const [genotype, setGenotype] = useState<Genotype>('normal');
    const [seenStep, setSeenStep] = useState(step);

    // Ao chegar nos passos 3 e 4, o genótipo vai para o cenário do passo.
    if (seenStep !== step) {
        setSeenStep(step);
        const preset = STEP_GENOTYPE[step];
        if (preset) setGenotype(preset);
    }

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: 532 }}>
            <div className="grid gap-3 h-full" style={{ gridTemplateColumns: 'minmax(0,1fr) 304px' }}>
                <div className="rounded-2xl border border-white/10 px-4 pt-3 pb-2 flex flex-col min-h-0" style={{ background: 'rgba(8,8,18,0.72)' }}>
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <motion.span key={`${step}-${step >= 3 ? genotype : ''}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                                className="font-display text-[17px] font-semibold">
                                {stepLabel(step, genotype)}
                            </motion.span>
                        </div>
                        <div className="shrink-0 flex items-center gap-1 rounded-xl border border-white/10 p-1" role="radiogroup" aria-label="Genótipo UGT2B17"
                            style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {GENOTYPES.map(g => {
                                const active = g.id === genotype;
                                return (
                                    <button key={g.id} type="button" role="radio" aria-checked={active} onClick={() => setGenotype(g.id)}
                                        className="relative px-3 py-1.5 rounded-lg text-[14px] font-semibold cursor-pointer transition-colors"
                                        style={{ color: active ? '#fff' : '#D1D5DB' }}>
                                        {active && (
                                            <motion.span layoutId="ug-geno" className="absolute inset-0 rounded-lg"
                                                style={{ background: `${g.color}26`, border: `1px solid ${g.color}99`, boxShadow: `0 0 16px ${g.color}33` }}
                                                transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                                        )}
                                        <span className="relative flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: g.color }} />
                                            {g.short}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 mt-1">
                        <Scene step={step} genotype={genotype} />
                    </div>
                </div>
                <SidePanel step={step} genotype={genotype} onGenotype={setGenotype} />
            </div>
        </div>
    );
};

export default Ugt2b17Sim;
