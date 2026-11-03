import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { REFERENCE_ID, STEROIDS, findSteroid } from './steroidProfiles/data';
import { DetailPanel } from './steroidProfiles/DetailPanel';
import { HalfLifeTimeline } from './steroidProfiles/HalfLifeTimeline';
import { ProfileMap } from './steroidProfiles/ProfileMap';
import { MarkerIcon } from './steroidProfiles/markers';
import { MAP_W } from './steroidProfiles/scales';

/**
 * "Perfis Farmacológicos" (slide id 75): mapa anabólico × androgênico (log-log, Testosterona = 100)
 * + painel do composto selecionado. Passos: 0 referência 1:1 · 1 os 8 compostos · 2 meia-vida comparada.
 */
const STEP_LABELS = ['Referência 1:1', 'Os 8 compostos', 'Meia-vida comparada'];
const STEPS = STEP_LABELS.length;
const TIMELINE_STEP = 2;

const HEIGHT = 524;
const TOP_BAR_H = 34;
const GAP = 12;
const MAIN_H = HEIGHT - TOP_BAR_H - GAP;
const CARD_PAD = 2;
const CARD_BORDER = 1;
/** Altura interna dos cartões (sem moldura nem respiro). */
const MAP_H = MAIN_H - CARD_PAD * 2 - CARD_BORDER * 2;
/** Régua de meia-vida: SVG + respiro interno (py-1.5) dentro do cartão. */
const TIMELINE_H = MAP_H - 12;

export const SteroidProfileVisualizer = () => {
    const { step, setStep } = useSlideSteps(STEPS);
    const [selectedId, setSelectedId] = useState(REFERENCE_ID);
    const reduce = useReducedMotion();

    const showTimeline = step >= TIMELINE_STEP;
    // Composto escondido no passo 0 não vira o selecionado visível: o painel mostra a referência.
    const visibleId = step === 0 ? REFERENCE_ID : selectedId;

    const select = (id: string) => {
        setSelectedId(id);
        if (step === 0 && id !== REFERENCE_ID) setStep(1);
    };

    return (
        <div className="not-prose relative mx-auto flex w-full max-w-[1136px] flex-col font-body text-white" style={{ height: HEIGHT }}>
            <div className="flex items-center justify-between gap-4" style={{ height: TOP_BAR_H }}>
                <div className="flex min-w-0 flex-nowrap gap-1">
                    {STEROIDS.map(s => {
                        const active = s.id === visibleId;
                        const revealed = step >= 1 || s.id === REFERENCE_ID;
                        return (
                            <button key={s.id} type="button" tabIndex={-1}
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => select(s.id)}
                                className={`flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-lg border px-1.5 py-1 text-[14px] font-semibold transition-colors duration-300 ${active ? 'text-white' : revealed ? 'border-white/10 bg-white/[0.04] text-zinc-200 hover:bg-white/10' : 'border-white/10 bg-transparent text-zinc-400 hover:text-zinc-200'}`}
                                style={active ? { background: `${s.color}30`, borderColor: `${s.color}aa` } : undefined}>
                                <MarkerIcon id={s.id} color={s.color} size={13} dim={!revealed} />
                                {s.short}
                            </button>
                        );
                    })}
                </div>
                <div className="shrink-0 text-[14px] font-semibold text-zinc-300">{STEP_LABELS[step]}</div>
            </div>

            <div className="flex" style={{ height: MAIN_H, marginTop: GAP, gap: 16 }}>
                <div className="relative" style={{ width: MAP_W + CARD_PAD * 2 + CARD_BORDER * 2, height: MAIN_H }}>
                    {/* Passo 3: a régua de meia-vida assume a coluna inteira; o mapa já foi lido nos passos 1–2. */}
                    <motion.div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10"
                        style={{ padding: CARD_PAD, background: 'rgba(8,8,18,0.72)', pointerEvents: showTimeline ? 'none' : 'auto' }}
                        initial={false} animate={{ opacity: showTimeline ? 0 : 1 }}
                        transition={{ duration: reduce ? 0 : 0.4 }} aria-hidden={showTimeline}>
                        <ProfileMap height={MAP_H} step={step} selectedId={visibleId} onSelect={select} />
                    </motion.div>
                    {showTimeline && (
                        <motion.div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10"
                            style={{ padding: CARD_PAD, background: 'rgba(8,8,18,0.72)' }}
                            initial={{ opacity: 0, y: reduce ? 0 : 16 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}>
                            <div className="px-3 py-1.5">
                                <HalfLifeTimeline width={MAP_W - 24} height={TIMELINE_H} selectedId={visibleId} onSelect={select} />
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
