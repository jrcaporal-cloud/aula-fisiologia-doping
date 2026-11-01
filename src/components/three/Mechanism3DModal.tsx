import { Suspense, useCallback, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Info, Pause, Play, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { STEPS } from '../../data/steps';
import { ReceptorScene } from './receptor/ReceptorScene';
import { LIGANDS, LIGAND_ORDER } from './receptor/ligandInfo';
import type { LigandKind } from './receptor/molecules';

/** Tempo de leitura depois que a etapa termina de animar, no modo ▶. */
const DWELL_MS = 3200;
const PANEL_W = 412;

/** Legenda: cada item aparece nas etapas em que a estrutura é protagonista. */
const LEGEND: { color: string; label: string; steps: number[] }[] = [
    { color: '#9FB6D6', label: 'Membrana (cabeças polares)', steps: [0, 1] },
    { color: '#C9A227', label: 'Caudas apolares', steps: [1] },
    { color: '#FB923C', label: 'Receptor androgênico', steps: [0, 2, 3, 4, 5, 6] },
    { color: '#22D3EE', label: 'Hélice 12 (tampa)', steps: [2, 3] },
    { color: '#A78BFA', label: 'HSP90 / HSP70', steps: [0, 2] },
    { color: '#A5B4FC', label: 'Poro nuclear', steps: [0, 4, 7] },
    { color: '#818CF8', label: 'DNA', steps: [0, 5, 6] },
    { color: '#E879F9', label: 'ARE', steps: [5, 6] },
    { color: '#2DD4BF', label: 'Coativador SRC-1', steps: [5, 6] },
    { color: '#94A3B8', label: 'RNA polimerase II', steps: [5, 6] },
    { color: '#F472B6', label: 'mRNA', steps: [6, 7] },
    { color: '#38BDF8', label: 'Ribossomo', steps: [7] },
    { color: '#FDE047', label: 'Proteína nova', steps: [7, 8] },
    { color: '#F87171', label: 'Actina', steps: [0, 8] },
    { color: '#E2E8F0', label: 'Miosina pesada', steps: [0, 8] },
];

const prefersReduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const LigandCard = ({ ligand, onChange }: { ligand: LigandKind; onChange: (l: LigandKind) => void }) => {
    const info = LIGANDS[ligand];
    return (
        <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-semibold text-gray-200 uppercase tracking-wider">Ligante</span>
                <span className="text-[12px] font-mono text-gray-400">bolas e varetas · CPK</span>
            </div>
            <div role="radiogroup" aria-label="Escolher ligante" className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10">
                {LIGAND_ORDER.map(k => {
                    const it = LIGANDS[k];
                    const on = k === ligand;
                    return (
                        <button
                            key={k}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => onChange(k)}
                            className={`flex items-center justify-center gap-1.5 h-9 rounded-lg text-[13px] font-semibold transition-colors ${on ? 'text-white' : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'}`}
                            style={on ? { background: `${it.color}26`, boxShadow: `inset 0 0 0 1px ${it.color}99` } : undefined}
                        >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: it.color }} />
                            {it.short}
                        </button>
                    );
                })}
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={ligand}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 p-3.5 rounded-xl border"
                    style={{ borderColor: `${info.color}55`, background: `${info.color}0f` }}
                >
                    <p className="text-[13px] font-mono" style={{ color: info.color }}>{info.family}</p>
                    <p className="text-[14px] text-gray-200 leading-snug mt-1.5">{info.fit}</p>
                    {info.relative !== null ? (
                        <div className="mt-3 space-y-1.5" aria-label="Força de ligação ao AR relativa à testosterona">
                            {(['testosterona', 'trembolona'] as const).map(k => {
                                const it = LIGANDS[k];
                                const rel = it.relative ?? 0;
                                return (
                                    <div key={k} className="flex items-center gap-2">
                                        <span className={`w-[92px] text-[13px] ${k === ligand ? 'text-white font-semibold' : 'text-gray-400'}`}>{it.short}</span>
                                        <div className="flex-1 h-2.5 rounded-full bg-white/[0.06] overflow-hidden">
                                            <motion.div className="h-full rounded-full" style={{ background: it.color, opacity: k === ligand ? 1 : 0.45 }}
                                                initial={{ width: 0 }} animate={{ width: `${(rel / 3) * 100}%` }} transition={{ duration: 0.6, ease: 'easeOut' }} />
                                        </div>
                                        <span className="w-7 text-right text-[13px] font-mono text-gray-200">{rel}×</span>
                                    </div>
                                );
                            })}
                            <p className="text-[12px] text-gray-400 pt-0.5">Força de ligação ao AR, relativa à testosterona basal</p>
                        </div>
                    ) : (
                        <div className="mt-3 grid grid-cols-2 gap-1.5 text-[13px]">
                            <div className="rounded-lg px-2.5 py-1.5 bg-emerald-400/10 border border-emerald-400/30 text-emerald-200">Músculo: ativa</div>
                            <div className="rounded-lg px-2.5 py-1.5 bg-rose-400/10 border border-rose-400/30 text-rose-200">Próstata: antagoniza</div>
                        </div>
                    )}
                    <p className="text-[12px] text-gray-400 mt-2.5">Fonte: {info.source}</p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export const Mechanism3DModal = ({ onClose }: { onClose: () => void }) => {
    const [step, setStepLocal] = useState(0);
    const [settled, setSettled] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [ligand, setLigand] = useState<LigandKind>('testosterona');
    const [reduced] = useState(prefersReduced);
    const setStoreStep = useStore(s => s.setStep);
    const hovered = useStore(s => s.hoveredObject);
    const setHovered = useStore(s => s.setHoveredObject);
    const last = STEPS.length - 1;
    const data = STEPS[step];
    const lig = LIGANDS[ligand];

    const go = useCallback((target: number) => setStepLocal(Math.min(Math.max(target, 0), last)), [last]);
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
            if (['ArrowRight', 'PageDown', 'ArrowDown'].includes(e.key)) { e.preventDefault(); setPlaying(false); go(step + 1); }
            else if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(e.key)) { e.preventDefault(); setPlaying(false); go(step - 1); }
            else if (e.key === ' ') { e.preventDefault(); togglePlay(); }
            else if (e.key === 'Escape' || e.key === '3') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [step, go, onClose, togglePlay]);

    return (
        <motion.div
            role="dialog"
            aria-label="Mecanismo genômico do androgênio em 3D"
            className="absolute inset-0 z-50 bg-[#03030a] font-body"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
        >
            {/* O canvas termina antes do painel lateral para nada da cena ficar escondido atrás dele. */}
            <div className="absolute top-0 bottom-0 left-0" style={{ right: PANEL_W }}>
                <Canvas
                    dpr={[1, 1.75]}
                    camera={{ position: STEPS[0].cameraPosition, fov: 40, near: 0.1, far: 400 }}
                    gl={{ antialias: false, powerPreference: 'high-performance' }}
                    className="cursor-grab active:cursor-grabbing"
                >
                    <Suspense fallback={null}>
                        <ReceptorScene step={step} settled={settled} ligand={ligand} reduced={reduced} onSettled={onSettled} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Cabeçalho (sobre a cena) */}
            <header className="absolute top-0 left-0 px-8 pt-6 pb-12 pointer-events-none bg-gradient-to-b from-[#03030a]/90 to-transparent" style={{ right: PANEL_W }}>
                <p className="text-[12px] font-mono uppercase tracking-[0.3em] text-cyan-300/90 mb-1">Modelo 3D interativo · via genômica</p>
                <h2 className="font-display text-3xl font-semibold text-white">Androgênio na célula muscular</h2>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="px-2.5 py-1 rounded-full text-[12px] font-mono tracking-wide text-amber-200 bg-amber-400/10 border border-amber-300/30">
                        representação esquemática · escalas fora de proporção
                    </span>
                    <span className="text-[13px] text-gray-400">Arraste para girar · role para aproximar · passe o mouse nas estruturas</span>
                </div>
            </header>

            {/* Painel da etapa */}
            <aside className="absolute right-5 top-5 bottom-5 flex flex-col rounded-2xl bg-[rgba(8,8,18,0.82)] border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden" style={{ width: PANEL_W - 30 }}>
                <div className="flex items-center justify-between px-6 pt-5">
                    <span className="text-[13px] font-mono text-gray-400">Etapa {step} de {last}</span>
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
                            key={step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            <span className="inline-block mt-1 px-3 py-1 text-[12px] font-mono tracking-widest text-cyan-300 bg-cyan-400/10 rounded-full mb-3">
                                {data.badge}
                            </span>
                            <h3 className="font-display text-[26px] font-semibold text-white leading-tight mb-2.5">{data.title}</h3>
                            <p className="text-[15px] text-gray-300 leading-relaxed">{data.description}</p>
                        </motion.div>
                    </AnimatePresence>

                    <LigandCard ligand={ligand} onChange={setLigand} />

                    <div className={`mt-4 p-3.5 rounded-xl border transition-colors duration-300 ${hovered ? 'border-cyan-400/50 bg-cyan-400/5' : 'border-white/10 bg-white/[0.03]'}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <Info size={14} className={hovered ? 'text-cyan-300' : 'text-gray-400'} />
                            <span className="text-[13px] font-semibold text-gray-200 uppercase tracking-wider">
                                {hovered ? hovered.name : 'Detalhes da estrutura'}
                            </span>
                        </div>
                        <p className="text-[13px] text-gray-300 leading-relaxed">
                            {hovered ? hovered.info : 'Passe o mouse sobre uma estrutura 3D para ver sua função.'}
                        </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-white/10">
                        <div className="flex items-center gap-2 text-[13px] text-gray-200">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: lig.color, boxShadow: `0 0 8px ${lig.color}` }} />
                            Ligante: {lig.name}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-[13px] text-gray-400">
                            {[['#5b616d', 'C'], ['#ff2a2a', 'O'], ['#3b5bff', 'N'], ['#8fe05a', 'F']].map(([c, el]) => (
                                <span key={el} className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />{el}</span>
                            ))}
                            <span className="text-gray-500">H omitido</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2.5">
                            {LEGEND.filter(item => item.steps.includes(step)).map(item => (
                                <div key={item.label} className="flex items-center gap-2 text-[13px] text-gray-300">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Linha do tempo das etapas (centrada na área da cena) */}
            <footer className="absolute bottom-6 left-0 flex justify-center pointer-events-none" style={{ right: PANEL_W }}>
                <div className="pointer-events-auto flex items-center gap-2 px-3 py-2.5 rounded-full bg-black/65 border border-white/10 backdrop-blur-xl">
                    <button type="button" aria-label="Etapa anterior" onClick={() => { setPlaying(false); go(step - 1); }} disabled={step === 0}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-25">
                        <ChevronLeft size={18} />
                    </button>
                    {STEPS.map((s, i) => (
                        <div key={s.id} className="flex items-center gap-2">
                            {i > 0 && (
                                <div className="w-4 h-px bg-white/15 relative overflow-hidden">
                                    <div className={`absolute inset-0 bg-cyan-400 transition-transform duration-700 ${i <= step ? 'translate-x-0' : '-translate-x-full'}`} />
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => { setPlaying(false); go(i); }}
                                title={s.short}
                                aria-label={`${s.badge}: ${s.title}`}
                                aria-current={i === step ? 'step' : undefined}
                                className={`w-9 h-9 rounded-full text-[13px] font-semibold transition-all duration-300 ${i === step
                                    ? 'bg-cyan-400/20 text-white border-2 border-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.5)] scale-110'
                                    : i < step
                                        ? 'bg-white/5 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10'
                                        : 'bg-white/5 border border-white/15 text-gray-400 hover:border-white/30 hover:text-gray-100'}`}
                            >
                                {i === 0 ? '●' : i}
                            </button>
                        </div>
                    ))}
                    <button type="button" aria-label="Próxima etapa" onClick={() => { setPlaying(false); go(step + 1); }} disabled={step === last}
                        className="w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-25">
                        <ChevronRight size={18} />
                    </button>
                    <span className="w-px h-6 bg-white/10" />
                    <button type="button" onClick={togglePlay}
                        aria-label={playing ? 'Pausar sequência automática (Espaço)' : 'Reproduzir sequência automática (Espaço)'}
                        className="flex items-center gap-2 pl-3 pr-4 h-9 rounded-full text-[14px] text-gray-200 hover:text-white hover:bg-white/10">
                        {playing ? <Pause size={15} /> : <Play size={15} />}
                        {playing ? 'Pausar' : 'Reproduzir'}
                    </button>
                </div>
            </footer>
            <div className="absolute left-8 bottom-24 pointer-events-none" style={{ right: PANEL_W }}>
                <AnimatePresence>
                    {settled !== step && (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="text-[13px] font-mono text-cyan-200/90">
                            ▸ {STEPS[step].short}…
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
