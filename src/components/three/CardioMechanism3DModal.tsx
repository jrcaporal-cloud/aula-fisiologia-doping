import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { LocateFixed, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { CARDIO_STEPS, cardioStepText, type CardioPhase } from '../../data/cardioSteps';
import { CardioHud } from './cardio/CardioHud';
import { Legend, OverlayToggle, PhaseCard, PhaseSwitch } from './cardio/CardioPanel';
import { CollateralChips } from './cardio/CollateralChips';
import { CARDIO_PHASES } from './cardio/phases';
import { CardioScene } from './cardio/CardioScene';
import { LoadingVeil } from './cardio/LoadingVeil';
import { makeFlowFrame, type CardioState } from './cardio/flow';
import { emptyCycle, emptyParams } from './cardio/params';
import { useSelection } from './cardio/selection';
import { StructureCard } from './cardio/StructureCard';
import type { StructureId } from './cardio/structures';
import { useCardioKeys } from './cardio/useCardioKeys';
import { StepTimeline } from './peptide/StepTimeline';
import type { TimeState } from './receptor/types';

/** Tempo de leitura depois que a etapa termina de animar, no modo ▶. */
const DWELL_MS = 3400;
const PANEL_W = 412;
const ACCENT = '#E11D48';

/** Esmaece a borda de baixo da área rolável: avisa que há mais conteúdo (cartões cortados ao meio ficam à vista). */
const FADE_BOTTOM = {
    maskImage: 'linear-gradient(to bottom, #000 calc(100% - 30px), transparent)',
    WebkitMaskImage: 'linear-gradient(to bottom, #000 calc(100% - 30px), transparent)',
} as const;

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Modelo 3D da dinâmica circulatória sob EAA (slide "O Coração sob Esteroides"). */
export const CardioMechanism3DModal = ({ onClose }: { onClose: () => void }) => {
    const [step, setStepLocal] = useState(0);
    const [settled, setSettled] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [phase, setPhase] = useState<CardioPhase>('uso');
    const [overlay, setOverlay] = useState(false);
    const [ready, setReady] = useState(false);
    const [recenterKey, setRecenterKey] = useState(0);
    const [reduced] = useState(prefersReduced);
    const timeRef = useRef<TimeState>({ t: 0 });
    const stateRef = useRef<CardioState>({ p: emptyParams(), cy: emptyCycle(), f: makeFlowFrame() });
    /** Etapa atual, atualizada na hora: várias teclas no mesmo quadro somam em vez de repetir o alvo. */
    const stepRef = useRef(0);
    const scroller = useRef<HTMLDivElement>(null);
    const setStoreStep = useStore(s => s.setStep);
    const setHovered = useStore(s => s.setHoveredObject);
    const pin = useSelection(s => s.pin);
    const hovering = useSelection(s => s.hoverId !== null);
    const release = useSelection(s => s.release);
    const last = CARDIO_STEPS.length - 1;
    const data = CARDIO_STEPS[step];

    // trocar de etapa solta a fixação e invalida o "assentou" até a câmera chegar à etapa nova
    const go = useCallback((target: number) => {
        const next = Math.min(Math.max(target, 0), last);
        if (next === stepRef.current) return;
        stepRef.current = next;
        release();
        setSettled(-1);
        setStepLocal(next);
    }, [last, release]);
    const goManual = useCallback((target: number) => { setPlaying(false); go(target); }, [go]);
    const onSettled = useCallback((s: number) => setSettled(s), []);
    const onReady = useCallback(() => setReady(true), []);
    const recenter = useCallback(() => { release(); setRecenterKey(k => k + 1); }, [release]);
    const pinFromLegend = useCallback((id: StructureId) => useSelection.getState().pinStructure(id, null), []);

    useEffect(() => setStoreStep(step), [step, setStoreStep]);
    // a etapa nova começa pelo topo do texto, não de onde a rolagem ficou
    useEffect(() => { scroller.current?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }, [step, reduced]);
    useEffect(() => {
        useSelection.getState().reset();
        return () => { useSelection.getState().reset(); setHovered(null); setStoreStep(0); };
    }, [setHovered, setStoreStep]);

    // ▶: espera a etapa terminar de animar, dá tempo de leitura e avança; para na última.
    useEffect(() => {
        if (!playing || settled !== step) return;
        const t = window.setTimeout(() => {
            if (step >= last) setPlaying(false);
            else go(step + 1);
        }, step >= last ? 0 : DWELL_MS);
        return () => window.clearTimeout(t);
    }, [playing, settled, step, last, go]);

    const togglePlay = useCallback(() => {
        setPlaying(p => {
            if (!p && stepRef.current === last) go(0);
            return !p;
        });
    }, [last, go]);

    useCardioKeys({
        next: () => goManual(stepRef.current + 1),
        prev: () => goManual(stepRef.current - 1),
        togglePlay,
        togglePhase: () => setPhase(p => (p === 'uso' ? 'apos' : 'uso')),
        // Esc: primeiro solta a estrutura fixada; sem nada fixado, fecha
        escape: () => { if (useSelection.getState().pin) release(); else onClose(); },
        close: onClose,
    });

    return (
        <motion.div
            role="dialog"
            aria-label="Dinâmica circulatória sob esteroides em 3D"
            className="absolute inset-0 z-50 bg-[#04030a] font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
        >
            {/* O canvas termina antes do painel lateral para nada da cena ficar escondido atrás dele. */}
            <div className="absolute top-0 bottom-0 left-0" style={{ right: PANEL_W }}>
                <Canvas
                    dpr={[1, 1.75]}
                    camera={{ position: CARDIO_STEPS[0].cameraPosition, fov: 40, near: 0.1, far: 400 }}
                    gl={{ antialias: false, powerPreference: 'high-performance' }}
                    resize={{ offsetSize: true }}
                    className={`${pin || hovering ? 'cursor-pointer' : 'cursor-grab'} active:cursor-grabbing`}
                >
                    <Suspense fallback={null}>
                        <CardioScene
                            step={step}
                            settled={settled}
                            phase={phase}
                            reduced={reduced}
                            pin={pin}
                            recenterKey={recenterKey}
                            overlay={overlay}
                            onSettled={onSettled}
                            onReady={onReady}
                            stateRef={stateRef}
                            timeRef={timeRef}
                        />
                    </Suspense>
                </Canvas>
                <CardioHud stateRef={stateRef} />
                <button
                    type="button"
                    onClick={recenter}
                    aria-label="Recentrar a câmera na pose da etapa"
                    className="absolute z-[46] top-6 right-6 flex items-center gap-2 pl-3.5 pr-4 h-10 rounded-full text-[14px] font-semibold text-gray-100 hover:text-white bg-black/60 hover:bg-white/15 border border-white/15 backdrop-blur-xl"
                >
                    <LocateFixed size={16} aria-hidden />
                    Recentrar
                </button>
                <AnimatePresence>{!ready && <LoadingVeil reduced={reduced} />}</AnimatePresence>
            </div>

            <header className="absolute z-[45] top-0 left-0 px-8 pt-6 pb-10 pointer-events-none bg-gradient-to-b from-[#04030a]/90 to-transparent" style={{ right: PANEL_W }}>
                <p className="text-[14px] font-mono uppercase tracking-[0.28em] text-rose-300/90 mb-1">Modelo 3D interativo · dinâmica circulatória</p>
                <h2 className="font-display text-3xl font-semibold text-white">O circuito sob esteroides</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="px-2.5 py-1 rounded-full text-[14px] font-mono tracking-wide text-amber-200 bg-amber-400/10 border border-amber-300/30">
                        representação esquemática · escalas fora de proporção
                    </span>
                    <span className="text-[14px] text-gray-400">Arraste para girar · role para aproximar · clique numa estrutura para fixar</span>
                </div>
            </header>

            <aside className="absolute right-5 top-5 bottom-5 flex flex-col rounded-2xl bg-[rgba(10,8,18,0.84)] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden" style={{ width: PANEL_W - 30 }}>
                <div className="flex items-center gap-2 px-6 pt-5 pb-3">
                    <PhaseSwitch phase={phase} onChange={setPhase} />
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar modelo 3D (Esc)"
                        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div ref={scroller} className="flex-1 overflow-y-auto px-6 pb-8 border-t border-white/10 pt-3" style={FADE_BOTTOM}>
                    {/* sem AnimatePresence: trocar de etapa depressa deixaria o texto antigo preso na saída */}
                    <motion.div
                        key={`${step}-${step === last ? phase : ''}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="flex items-center justify-between mt-1 mb-3">
                            <span className="inline-block px-3 py-1 text-[14px] font-mono tracking-widest text-rose-200 bg-rose-500/15 border border-rose-400/25 rounded-full">
                                {data.badge}
                            </span>
                            <span className="text-[14px] font-mono text-gray-400" aria-label={`Etapa ${step} de ${last}`}>{step}/{last}</span>
                        </div>
                        <h3 className="font-display text-[26px] font-semibold text-white leading-tight mb-2.5">{data.title}</h3>
                        <p className="text-[16px] text-gray-200 leading-relaxed">{cardioStepText(step, phase)}</p>
                    </motion.div>

                    <CollateralChips step={step} phase={phase} reduced={reduced} />
                    <OverlayToggle on={overlay} onChange={setOverlay} />
                    <PhaseCard phase={phase} step={step} />
                    <Legend step={step} overlay={overlay} pinnedId={pin?.id ?? null} onPin={pinFromLegend} />
                </div>
                {/* fixo no rodapé do painel: com o texto longo da etapa 7, o cartão da estrutura sairia da tela */}
                <div className="shrink-0 px-6 pb-4 pt-2.5 border-t border-white/10">
                    <StructureCard color={CARDIO_PHASES[phase].color} />
                </div>
            </aside>

            <footer className="absolute bottom-6 left-0 flex justify-center pointer-events-none" style={{ right: PANEL_W }}>
                <StepTimeline steps={CARDIO_STEPS} step={step} playing={playing} accent={ACCENT} onGo={goManual} onTogglePlay={togglePlay} />
            </footer>
            <div className="absolute left-8 top-[146px] pointer-events-none" style={{ right: PANEL_W }}>
                <AnimatePresence>
                    {settled !== step && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-[14px] font-mono text-rose-200/90">
                            ▸ {CARDIO_STEPS[step].short}…
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
