import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { REFERENCE_ID, STEROIDS, findSteroid } from './steroidProfiles/data';
import { DetailPanel } from './steroidProfiles/DetailPanel';
import { HalfLifeTimeline } from './steroidProfiles/HalfLifeTimeline';
import { ProfileMap } from './steroidProfiles/ProfileMap';
import { MAP_W, useTween } from './steroidProfiles/scales';

/**
 * "Perfis Farmacológicos" (slide id 75): mapa anabólico × androgênico (log-log, Testosterona = 100)
 * + painel do composto selecionado. Passos: 0 referência 1:1 · 1 os 8 compostos · 2 meia-vida comparada.
 */
const STEP_LABELS = ['Referência 1:1', 'Os 8 compostos', 'Meia-vida comparada'];
const STEPS = STEP_LABELS.length;
const TIMELINE_STEP = 2;

const HEIGHT = 520;
const TOP_BAR_H = 34;
const GAP = 12;
const MAIN_H = HEIGHT - TOP_BAR_H - GAP;
const MAP_H_COMPACT = 268;
const CARD_PAD = 2;
const CARD_BORDER = 1;

export const SteroidProfileVisualizer = () => {
    const { step, setStep } = useSlideSteps(STEPS);
    const [selectedId, setSelectedId] = useState(REFERENCE_ID);
    const reduce = useReducedMotion();

    const showTimeline = step >= TIMELINE_STEP;
    const mapCardH = useTween(showTimeline ? MAP_H_COMPACT : MAIN_H, 750);
    const mapH = mapCardH - CARD_PAD * 2 - CARD_BORDER * 2;
    const timelineH = MAIN_H - MAP_H_COMPACT - GAP - CARD_PAD * 2 - CARD_BORDER * 2;
    // Composto escondido no passo 0 não vira o selecionado visível: o painel mostra a referência.
    const visibleId = step === 0 ? REFERENCE_ID : selectedId;

    const select = (id: string) => {
        setSelectedId(id);
        if (step === 0 && id !== REFERENCE_ID) setStep(1);
    };

    return (
        <div className="not-prose relative mx-auto flex w-full max-w-[1088px] flex-col font-body text-white" style={{ height: HEIGHT }}>
            <div className="flex items-center justify-between gap-4" style={{ height: TOP_BAR_H }}>
                <div className="flex min-w-0 flex-nowrap gap-1">
                    {STEROIDS.map(s => {
                        const active = s.id === visibleId;
                        const revealed = step >= 1 || s.id === REFERENCE_ID;
                        return (
                            <button key={s.id} type="button" tabIndex={-1}
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => select(s.id)}
                                className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg border px-2 py-1 text-[13px] font-semibold transition-colors duration-300 ${active ? 'text-white' : revealed ? 'border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10' : 'border-white/5 bg-transparent text-zinc-500 hover:text-zinc-300'}`}
                                style={active ? { background: `${s.color}30`, borderColor: `${s.color}aa` } : undefined}>
                                <span className="h-2 w-2 rounded-full" style={{ background: s.color, opacity: revealed ? 1 : 0.45 }} />
                                {s.short}
                            </button>
                        );
                    })}
                </div>
                <div className="shrink-0 font-mono text-[13px] text-zinc-400">
                    <span className="text-zinc-200">{step + 1}/{STEPS}</span> · {STEP_LABELS[step]}
                </div>
            </div>

            <div className="flex" style={{ height: MAIN_H, marginTop: GAP, gap: 16 }}>
                <div className="flex flex-col" style={{ width: MAP_W + CARD_PAD * 2 + CARD_BORDER * 2, gap: GAP }}>
                    <div className="overflow-hidden rounded-2xl border border-white/10"
                        style={{ height: mapCardH, padding: CARD_PAD, background: 'rgba(8,8,18,0.72)' }}>
                        <ProfileMap height={mapH} step={step} selectedId={visibleId} onSelect={select} />
                    </div>
                    {showTimeline && (
                        <motion.div className="overflow-hidden rounded-2xl border border-white/10"
                            style={{ padding: CARD_PAD, background: 'rgba(8,8,18,0.72)' }}
                            initial={{ opacity: 0, y: reduce ? 0 : 24 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: reduce ? 0 : 0.6, delay: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}>
                            <div className="px-3 py-1.5">
                                <HalfLifeTimeline width={MAP_W - 24} height={timelineH - 12} selectedId={visibleId} onSelect={select} />
                            </div>
                        </motion.div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <DetailPanel steroid={findSteroid(visibleId)} />
                </div>
            </div>
        </div>
    );
};
