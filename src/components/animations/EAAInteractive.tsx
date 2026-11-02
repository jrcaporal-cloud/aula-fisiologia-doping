import { AnimatePresence, motion } from 'framer-motion';
import type { ComponentType } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { EASE, LAYERS } from './eaaBase/content';
import { LayerPanel } from './eaaBase/LayerPanel';
import { Overview } from './eaaBase/Overview';
import { StageRatio } from './eaaBase/StageRatio';
import { StageSatellite } from './eaaBase/StageSatellite';
import { StageSideEffects } from './eaaBase/StageSideEffects';
import { StageSynthetic } from './eaaBase/StageSynthetic';

const STAGES: ComponentType[] = [StageSynthetic, StageRatio, StageSatellite, StageSideEffects];
const STEP_COUNT = LAYERS.length + 1;

/**
 * Slide "A Base do Doping Moderno": a testosterona no centro e quatro camadas
 * (química sintética, razão A/A, células satélite, colaterais) reveladas pelo passador.
 */
export const EAAInteractive = () => {
    const { step, setStep } = useSlideSteps(STEP_COUNT);
    const layer = step > 0 ? LAYERS[step - 1] : null;
    const Stage = layer ? STAGES[layer.id] : null;

    return (
        <div className="not-prose w-full font-body mt-2 select-none">
            {/* Trilha de passos */}
            <div className="flex items-center gap-1.5 mb-3">
                {[{ label: 'Visão geral', color: '#E11D48' }, ...LAYERS.map(l => ({ label: `${l.id + 1} · ${l.short}`, color: l.color }))].map((s, i) => {
                    const on = i === step;
                    return (
                        <button
                            key={s.label}
                            type="button"
                            onClick={() => setStep(i)}
                            className="text-[13px] px-3 py-1 rounded-full border cursor-pointer transition-colors"
                            style={on
                                ? { borderColor: s.color, color: '#fff', background: `${s.color}2e` }
                                : { borderColor: 'rgba(255,255,255,0.12)', color: '#9CA3AF', background: 'rgba(255,255,255,0.02)' }}
                        >{s.label}</button>
                    );
                })}
                <span className="ml-auto font-mono text-[12px] tracking-[0.2em] text-gray-400">PASSO {step + 1}/{STEP_COUNT}</span>
            </div>

            <div className="relative h-[420px]">
                <AnimatePresence initial={false}>
                    {layer && Stage ? (
                        <motion.div
                            key={layer.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.35, ease: EASE }}
                            className="absolute inset-0 grid gap-4"
                            style={{ gridTemplateColumns: '600px 1fr' }}
                        >
                            <div className="rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] overflow-hidden">
                                <Stage />
                            </div>
                            <LayerPanel layer={layer} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.35 }}
                            className="absolute inset-0"
                        >
                            <Overview onPick={id => setStep(id + 1)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
