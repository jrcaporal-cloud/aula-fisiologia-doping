import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, ListOrdered, LocateFixed, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { IllustrativeTag } from '../deck/IllustrativeTag';
import { trapTab, useDialogFocus } from '../deck/dialogFocus';
import { CARDIO_STEPS, cardioStepText, type CardioPhase } from '../../data/cardioSteps';
import { ContourToggle, PhaseCard, PhaseSwitch } from './cardio/CardioPanel';
import { CollateralChips } from './cardio/CollateralChips';
import { CARDIO_PHASES } from './cardio/phases';
import { CardioScene } from './cardio/CardioScene';
import { LoadingVeil } from './cardio/LoadingVeil';
import { Monitor } from './cardio/Monitor';
import { makeFlowFrame, type CardioState } from './cardio/flow';
import { LabPanel } from './cardio/lab/LabPanel';
import { useLab, type CardioMode } from './cardio/lab/labStore';
import { emptyCycle, emptyParams } from './cardio/params';
import { makeSeries } from './cardio/series';
import { useSelection } from './cardio/selection';
import { StructureCard } from './cardio/StructureCard';
import { useCardioKeys } from './cardio/useCardioKeys';
import { StepTimeline } from './peptide/StepTimeline';
import type { TimeState } from './receptor/types';

/** Tempo de leitura depois que a etapa termina de animar, no modo ▶. */
const DWELL_MS = 3400;
const ACCENT = '#E11D48';

/** Esmaece a borda de baixo da área rolável: avisa que há mais conteúdo. */
const FADE_BOTTOM = {
    maskImage: 'linear-gradient(to bottom, #000 calc(100% - 28px), transparent)',
    WebkitMaskImage: 'linear-gradient(to bottom, #000 calc(100% - 28px), transparent)',
} as const;

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const MODES: readonly { id: CardioMode; label: string; Icon: typeof ListOrdered }[] = [
    { id: 'roteiro', label: 'Roteiro', Icon: ListOrdered },
    { id: 'lab', label: 'Laboratório', Icon: FlaskConical },
];

/** Roteiro (as 7 etapas, para o passador) × laboratório (o aluno dosa os colaterais). Tecla L. */
const ModeTabs = ({ mode, onChange }: { mode: CardioMode; onChange: (m: CardioMode) => void }) => (
    <div role="tablist" aria-label="Modo do modelo" className="flex-1 min-w-0 grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
        {MODES.map(({ id, label, Icon }) => {
            const on = id === mode;
            return (
                <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => onChange(id)}
                    className={`relative flex items-center justify-center gap-2 h-9 rounded-lg text-[15px] font-semibold whitespace-nowrap transition-colors duration-200 active:scale-[0.98] ${on ? 'text-white' : 'text-gray-400 hover:text-gray-100'}`}
                >
                    {on && (
                        <motion.span
                            layoutId="cardio-mode-pill"
                            className="absolute inset-0 rounded-lg bg-rose-500/20 shadow-[inset_0_0_0_1px_rgba(251,113,133,0.6)]"
                            transition={{ type: 'spring', duration: 0.35, bounce: 0.15 }}
                        />
                    )}
                    <Icon size={16} className="relative" aria-hidden />
                    <span className="relative">{label}</span>
                </button>
            );
        })}
    </div>
);

/** Modelo 3D da dinâmica circulatória sob EAA (slide "O Coração sob Esteroides"). */
export const CardioMechanism3DModal = ({ onClose }: { onClose: () => void }) => {
    const [step, setStepLocal] = useState(0);
    const [settled, setSettled] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [phase, setPhase] = useState<CardioPhase>('uso');
    const [ready, setReady] = useState(false);
    const [recenterKey, setRecenterKey] = useState(0);
    const [reduced] = useState(prefersReduced);
    const mode = useLab(s => s.mode);
    const contour = useLab(s => s.contour);
    const setContour = useLab(s => s.setContour);
    const dialogRef = useRef<HTMLDivElement>(null);
    useDialogFocus(dialogRef);
    const timeRef = useRef<TimeState>({ t: 0 });
    const stateRef = useRef<CardioState>({ p: emptyParams(), cy: emptyCycle(), f: makeFlowFrame(), dt: 0 });
    const series = useMemo(() => makeSeries(), []);
    /** Etapa atual, atualizada na hora: várias teclas no mesmo quadro somam em vez de repetir o alvo. */
    const stepRef = useRef(0);
    const scroller = useRef<HTMLDivElement>(null);
    const setStoreStep = useStore(s => s.setStep);
    const setHovered = useStore(s => s.setHoveredObject);
    const pin = useSelection(s => s.pin);
    const release = useSelection(s => s.release);
    const last = CARDIO_STEPS.length - 1;
    const data = CARDIO_STEPS[step];
    const lab = mode === 'lab';

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
    const setMode = useCallback((m: CardioMode) => {
        release();
        setPlaying(false);
        useLab.getState().setMode(m);
    }, [release]);

    useEffect(() => setStoreStep(step), [step, setStoreStep]);
    useEffect(() => { scroller.current?.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); }, [step, mode, reduced]);
    useEffect(() => {
        useSelection.getState().reset();
        useLab.getState().reset();
        return () => {
            useSelection.getState().reset();
            useLab.getState().reset();
            setHovered(null);
            setStoreStep(0);
        };
    }, [setHovered, setStoreStep]);

    // ▶: espera a etapa terminar de animar, dá tempo de leitura e avança; para na última.
    useEffect(() => {
        if (!playing || settled !== step || lab) return;
        const t = window.setTimeout(() => {
            if (step >= last) setPlaying(false);
            else go(step + 1);
        }, step >= last ? 0 : DWELL_MS);
        return () => window.clearTimeout(t);
    }, [playing, settled, step, last, go, lab]);

    const togglePlay = useCallback(() => {
        if (!playing && stepRef.current === last) go(0);
        setPlaying(!playing);
    }, [playing, last, go]);

    useCardioKeys({
        next: () => (lab ? useLab.getState().stepPreset(1, reduced) : goManual(stepRef.current + 1)),
        prev: () => (lab ? useLab.getState().stepPreset(-1, reduced) : goManual(stepRef.current - 1)),
        togglePlay: () => (lab ? useLab.getState().togglePause() : togglePlay()),
        togglePhase: () => {
            if (!lab) { setPhase(p => (p === 'uso' ? 'apos' : 'uso')); return; }
            const s = useLab.getState();
            s.applyPreset((s.target ?? s.preset) === 'uso' ? 'apos' : 'uso', reduced);
        },
        toggleMode: () => setMode(lab ? 'roteiro' : 'lab'),
        // Esc: primeiro solta a estrutura fixada; sem nada fixado, fecha
        escape: () => { if (useSelection.getState().pin) release(); else onClose(); },
        close: onClose,
    });

    return (
        <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Dinâmica circulatória sob esteroides em 3D"
            tabIndex={-1}
            onKeyDown={trapTab}
            // Painel mais estreito abaixo de 1180 px (projetor 4:3): a cena ganha espaço.
            className="absolute inset-0 z-50 bg-[#060409] font-body outline-none [--panel-w:384px] min-[1180px]:[--panel-w:420px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* O canvas termina antes do painel lateral para nada da cena ficar escondido atrás dele. */}
            <div className="absolute top-0 bottom-0 left-0" style={{ right: 'var(--panel-w)' }}>
                <Canvas
                    dpr={[1, 1.75]}
                    camera={{ position: CARDIO_STEPS[0].cameraPosition, fov: 38, near: 0.1, far: 400 }}
                    gl={{ antialias: false, powerPreference: 'high-performance' }}
                    resize={{ offsetSize: true }}
                >
                    <Suspense fallback={null}>
                        <CardioScene
                            step={step}
                            settled={settled}
                            phase={phase}
                            mode={mode}
                            reduced={reduced}
                            pin={pin}
                            recenterKey={recenterKey}
                            onSettled={onSettled}
                            onReady={onReady}
                            stateRef={stateRef}
                            timeRef={timeRef}
                            series={series}
                        />
                    </Suspense>
                </Canvas>
                <Monitor stateRef={stateRef} series={series} bottom={lab ? 16 : 84} compact={!lab} />
                <button
                    type="button"
                    onClick={recenter}
                    aria-label={lab ? 'Recentrar a câmera no circuito' : 'Recentrar a câmera na pose da etapa'}
                    className="absolute z-[46] top-6 right-6 flex items-center gap-2 pl-3.5 pr-4 h-10 rounded-full text-[14px] font-semibold text-gray-100 hover:text-white bg-black/75 hover:bg-white/15 border border-white/15 active:scale-[0.97] transition-[background-color,transform] duration-150"
                >
                    <LocateFixed size={16} aria-hidden />
                    Recentrar
                </button>
                <AnimatePresence>{!ready && <LoadingVeil reduced={reduced} />}</AnimatePresence>
            </div>

            <header className="absolute z-[45] top-0 left-0 px-8 pt-6 pb-10 pointer-events-none bg-gradient-to-b from-[#060409]/90 to-transparent" style={{ right: 'var(--panel-w)' }}>
                <p className="text-[14px] font-mono uppercase tracking-[0.16em] min-[1180px]:tracking-[0.24em] text-rose-300 mb-1">
                    {lab ? 'Laboratório · dose os colaterais' : 'Modelo 3D · corte coronal do circuito'}
                </p>
                <h2 className="font-display text-3xl font-semibold text-white">O circuito sob esteroides</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    <IllustrativeTag>{lab ? 'cenários = ficha do slide · entre eles, modelo didático' : 'peça em corte · escalas fora de proporção'}</IllustrativeTag>
                    <span className="text-[14px] text-gray-400 hidden min-[1180px]:inline">Arraste para girar · clique numa estrutura</span>
                </div>
            </header>

            <aside className="absolute right-5 top-5 bottom-5 flex flex-col rounded-2xl bg-[rgba(12,9,16,0.9)] border border-white/10 shadow-2xl overflow-hidden" style={{ width: 'calc(var(--panel-w) - 30px)' }}>
                <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                    <ModeTabs mode={mode} onChange={setMode} />
                    <kbd title="A tecla L alterna roteiro e laboratório" className="shrink-0 w-8 h-8 hidden min-[1180px]:flex items-center justify-center rounded-md border border-white/20 bg-white/10 text-[14px] font-mono text-gray-100">L</kbd>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar modelo 3D (Esc)"
                        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 active:scale-[0.95] transition-transform duration-150"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div ref={scroller} className="flex-1 overflow-y-auto px-5 pb-8 border-t border-white/10 pt-3" style={FADE_BOTTOM}>
                    {lab ? (
                        <motion.div key="lab" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}>
                            <LabPanel reduced={reduced} />
                        </motion.div>
                    ) : (
                        <>
                            <PhaseSwitch phase={phase} onChange={setPhase} />
                            {/* sem AnimatePresence: trocar de etapa depressa deixaria o texto antigo preso na saída */}
                            <motion.div
                                key={`${step}-${step === last ? phase : ''}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                            >
                                <div className="flex items-center justify-between mt-4 mb-3">
                                    <span className="inline-block px-3 py-1 text-[14px] font-mono tracking-widest text-rose-200 bg-rose-500/15 border border-rose-400/25 rounded-full">
                                        {data.badge}
                                    </span>
                                    <span className="text-[14px] font-mono text-gray-400" aria-label={`Etapa ${step} de ${last}`}>{step}/{last}</span>
                                </div>
                                <h3 className="font-display text-[24px] font-semibold text-white leading-tight mb-2.5">{data.title}</h3>
                                <p className="text-[16px] text-gray-200 leading-relaxed">{cardioStepText(step, phase)}</p>
                            </motion.div>
                            <CollateralChips step={step} phase={phase} reduced={reduced} />
                            <ContourToggle on={contour} onChange={setContour} />
                            <PhaseCard phase={phase} step={step} />
                        </>
                    )}
                </div>
                {/* fixo no rodapé do painel: o cartão da estrutura nunca sai da tela */}
                <div className="shrink-0 px-5 pb-4 pt-2.5 border-t border-white/10">
                    <StructureCard color={CARDIO_PHASES[phase].color} />
                </div>
            </aside>

            {!lab && (
                <footer className="absolute bottom-5 left-0 px-4 flex justify-center pointer-events-none" style={{ right: 'var(--panel-w)' }}>
                    <StepTimeline steps={CARDIO_STEPS} step={step} playing={playing} accent={ACCENT} onGo={goManual} onTogglePlay={togglePlay} />
                </footer>
            )}
            {!lab && (
                <div className="absolute left-8 top-[140px] pointer-events-none" style={{ right: 'var(--panel-w)' }}>
                    <AnimatePresence>
                        {settled !== step && (
                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-[14px] font-mono text-rose-200/90">
                                ▸ {CARDIO_STEPS[step].short}…
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};
