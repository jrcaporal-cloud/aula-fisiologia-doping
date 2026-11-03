import { AnimatePresence, motion } from 'framer-motion';
import type { ComponentType } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { EASE, LAYERS, TABS } from './eaaBase/content';
import { LayerPanel } from './eaaBase/LayerPanel';
import { Overview } from './eaaBase/Overview';
import { StageRatio } from './eaaBase/StageRatio';
import { StageSatellite } from './eaaBase/StageSatellite';
import { StageSideEffects } from './eaaBase/StageSideEffects';
import { StageSynthetic } from './eaaBase/StageSynthetic';

const STAGES: ComponentType[] = [StageSynthetic, StageRatio, StageSatellite, StageSideEffects];
const TAB_COUNT = TABS.length;
/** Passo 0 = visão geral; depois, cada camada gasta um passo por aba (Química → Mecanismo → Risco Real). */
const STEP_COUNT = 1 + LAYERS.length * TAB_COUNT;
const firstStepOf = (layerId: number) => 1 + layerId * TAB_COUNT;

/**
 * Slide "A Base do Doping Moderno": a testosterona no centro e quatro camadas
 * (química sintética, razão A/A, células satélite, colaterais) reveladas pelo passador,
 * cada uma com suas três abas de texto em passos próprios.
 */
export const EAAInteractive = () => {
    const { step, setStep } = useSlideSteps(STEP_COUNT);
    const layerIndex = step > 0 ? Math.floor((step - 1) / TAB_COUNT) : -1;
    const layer = layerIndex >= 0 ? LAYERS[layerIndex] : null;
    const tab = TABS[(step - 1 + TAB_COUNT) % TAB_COUNT].key;
    const Stage = layer ? STAGES[layer.id] : null;
    const crumbs = [{ label: 'Visão geral', color: '#E11D48', at: 0 }, ...LAYERS.map(l => ({ label: `${l.id + 1} · ${l.short}`, color: l.color, at: firstStepOf(l.id) }))];

    return (
        <div className="not-prose w-full font-body mt-2 select-none">
            {/* Trilha das camadas */}
            <div className="flex items-center gap-1.5 mb-3">
                {crumbs.map((c, i) => {
                    const on = i === layerIndex + 1;
                    return (
                        <button
                            key={c.label}
                            type="button"
                            onClick={() => setStep(c.at)}
                            className="text-[15px] px-3.5 py-1 rounded-full border cursor-pointer transition-colors"
                            style={on
                                ? { borderColor: c.color, color: '#fff', background: `${c.color}2e` }
                                : { borderColor: 'rgba(255,255,255,0.2)', color: '#CBD5E1', background: 'rgba(255,255,255,0.02)' }}
                        >{c.label}</button>
                    );
                })}
            </div>

            <div className="relative h-[460px]">
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
                            <LayerPanel layer={layer} tab={tab} onTab={key => setStep(firstStepOf(layer.id) + TABS.findIndex(t => t.key === key))} />
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
