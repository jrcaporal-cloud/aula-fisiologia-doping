import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { PEPTIDE_STEPS, peptideStepText, type PeptideLigand } from '../../data/peptideSteps';
import { PeptideScene } from './peptide/PeptideScene';
import { PEPTIDE_LIGANDS } from './peptide/ligands';
import { HoverBox, Legend, LigandCard } from './peptide/PeptidePanel';
import { StepTimeline } from './peptide/StepTimeline';
import { AmplifierHud } from './peptide/AmplifierHud';
import type { TimeState } from './receptor/types';

/** Tempo de leitura depois que a etapa termina de animar, no modo ▶. */
const DWELL_MS = 3400;
const PANEL_W = 412;
const ACCENT = '#E11D48';

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Modelo 3D da via de membrana de um secretagogo de GH (slides 103 e 104). */
export const PeptideMechanism3DModal = ({ onClose }: { onClose: () => void }) => {
    const [step, setStepLocal] = useState(0);
    const [settled, setSettled] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [ligand, setLigand] = useState<PeptideLigand>('ghrp');
    const [reduced] = useState(prefersReduced);
    const timeRef = useRef<TimeState>({ t: 0 });
    const setStoreStep = useStore(s => s.setStep);
    const hovered = useStore(s => s.hoveredObject);
    const setHovered = useStore(s => s.setHoveredObject);
    const last = PEPTIDE_STEPS.length - 1;
    const data = PEPTIDE_STEPS[step];
    const lig = PEPTIDE_LIGANDS[ligand];

    const go = useCallback((target: number) => setStepLocal(Math.min(Math.max(target, 0), last)), [last]);
    const goManual = useCallback((target: number) => { setPlaying(false); go(target); }, [go]);
    const onSettled = useCallback((s: number) => setSettled(s), []);

    useEffect(() => setStoreStep(step), [step, setStoreStep]);
    useEffect(() => () => { setHovered(null); setStoreStep(0); document.body.style.cursor = ''; }, [setHovered, setStoreStep]);

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
            if (!p && step === last) go(0);
            return !p;
        });
    }, [step, last, go]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (['ArrowRight', 'PageDown', 'ArrowDown'].includes(e.key)) { e.preventDefault(); goManual(step + 1); }
            else if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(e.key)) { e.preventDefault(); goManual(step - 1); }
            else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
            else if (e.key === 'Escape' || e.key === '3') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [step, goManual, onClose, togglePlay]);

    return (
        <motion.div
            role="dialog"
            aria-label="Via de membrana de um peptídeo em 3D"
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
                    camera={{ position: PEPTIDE_STEPS[0].cameraPosition, fov: 40, near: 0.1, far: 400 }}
                    gl={{ antialias: false, powerPreference: 'high-performance' }}
                    className="cursor-grab active:cursor-grabbing"
                >
                    <Suspense fallback={null}>
                        <PeptideScene step={step} settled={settled} ligand={ligand} reduced={reduced} onSettled={onSettled} timeRef={timeRef} />
                    </Suspense>
                </Canvas>
                <AmplifierHud ligand={ligand} timeRef={timeRef} />
            </div>

            <header className="absolute z-[45] top-0 left-0 px-8 pt-6 pb-10 pointer-events-none bg-gradient-to-b from-[#04030a]/90 to-transparent" style={{ right: PANEL_W }}>
                <p className="text-[14px] font-mono uppercase tracking-[0.28em] text-rose-300/90 mb-1">Modelo 3D interativo · via de membrana</p>
                <h2 className="font-display text-3xl font-semibold text-white">Peptídeo na célula da hipófise</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="px-2.5 py-1 rounded-full text-[14px] font-mono tracking-wide text-amber-200 bg-amber-400/10 border border-amber-300/30">
                        representação esquemática · escalas fora de proporção
                    </span>
                    <span className="text-[14px] text-gray-400">Arraste para girar · role para aproximar · passe o mouse nas estruturas</span>
                </div>
            </header>

            <aside className="absolute right-5 top-5 bottom-5 flex flex-col rounded-2xl bg-[rgba(10,8,18,0.84)] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden" style={{ width: PANEL_W - 30 }}>
                <div className="flex items-center justify-between px-6 pt-5">
                    <span className="text-[14px] font-mono text-gray-400">Etapa {step} de {last}</span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar modelo 3D (Esc)"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${step}-${step === 4 ? ligand : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="inline-block mt-1 px-3 py-1 text-[14px] font-mono tracking-widest text-rose-200 bg-rose-500/15 border border-rose-400/25 rounded-full mb-3">
                                {data.badge}
                            </span>
                            <h3 className="font-display text-[26px] font-semibold text-white leading-tight mb-2.5">{data.title}</h3>
                            <p className="text-[16px] text-gray-200 leading-relaxed">{peptideStepText(step, ligand)}</p>
                        </motion.div>
                    </AnimatePresence>

                    <LigandCard ligand={ligand} onChange={setLigand} />
                    <HoverBox hovered={hovered} color={lig.color} />
                    <Legend ligand={ligand} step={step} />
                </div>
            </aside>

            <footer className="absolute bottom-6 left-0 flex justify-center pointer-events-none" style={{ right: PANEL_W }}>
                <StepTimeline steps={PEPTIDE_STEPS} step={step} playing={playing} accent={ACCENT} onGo={goManual} onTogglePlay={togglePlay} />
            </footer>
            <div className="absolute left-8 bottom-24 pointer-events-none" style={{ right: PANEL_W }}>
                <AnimatePresence>
                    {settled !== step && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-[14px] font-mono text-rose-200/90">
                            ▸ {PEPTIDE_STEPS[step].short}…
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
