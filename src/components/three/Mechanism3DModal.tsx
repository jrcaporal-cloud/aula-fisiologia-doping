import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Info, Pause, Play, X } from 'lucide-react';
import gsap from 'gsap';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useStore } from '../../store/useStore';
import { STEPS } from '../../data/steps';
import { CellEnvironment } from '../models/CellEnvironment';
import { Testosterone } from '../models/Testosterone';
import { AndrogenReceptor } from '../models/AndrogenReceptor';
import { NucleusAndDNA } from '../models/NucleusAndDNA';
import { TranslationProcess } from '../models/TranslationProcess';

const AUTOPLAY_MS = 6000;
const LEGEND = [
    { color: '#00e676', label: 'Testosterona' },
    { color: '#ffa726', label: 'Receptor (AR)' },
    { color: '#7c4dff', label: 'Núcleo / DNA' },
    { color: '#ff4081', label: 'mRNA' },
    { color: '#fdd835', label: 'Proteínas' },
    { color: '#d84315', label: 'Mitocôndrias' },
];

/** Move câmera, alvo e progresso das animações juntos a cada etapa (os modelos leem progressRef). */
const CameraRig = ({ step, progressRef }: { step: number; progressRef: React.MutableRefObject<{ value: number }> }) => {
    const camera = useThree(state => state.camera);
    const controlsRef = useRef<OrbitControlsImpl>(null);

    useEffect(() => {
        const controls = controlsRef.current;
        if (!controls) return;
        const { cameraPosition: [px, py, pz], cameraTarget: [tx, ty, tz] } = STEPS[step];
        const tl = gsap.timeline();
        tl.to(camera.position, { x: px, y: py, z: pz, duration: 1.6, ease: 'power3.inOut' }, 0);
        tl.to(controls.target, { x: tx, y: ty, z: tz, duration: 1.6, ease: 'power3.inOut', onUpdate: () => controls.update() }, 0);
        tl.to(progressRef.current, { value: step / (STEPS.length - 1), duration: 1.6, ease: 'power2.inOut' }, 0);
        return () => { tl.kill(); };
    }, [step, progressRef, camera]);

    return (
        <OrbitControls
            ref={controlsRef}
            makeDefault
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            maxPolarAngle={Math.PI * 0.85}
            minDistance={4}
            maxDistance={60}
        />
    );
};

const Scene = ({ step }: { step: number }) => {
    const progressRef = useRef({ value: 0 });
    return (
        <>
            <color attach="background" args={['#03030a']} />
            <fog attach="fog" args={['#03030a', 30, 70]} />
            <ambientLight intensity={0.7} color="#4a4a9a" />
            <directionalLight position={[12, 18, 10]} intensity={2.2} color="#a8d8ff" />
            <directionalLight position={[-12, 5, -10]} intensity={0.6} color="#5566cc" />
            <pointLight position={[0, 0, 0]} intensity={1.2} distance={22} color="#c158dc" />
            <CameraRig step={step} progressRef={progressRef} />
            <CellEnvironment />
            <Testosterone progressRef={progressRef} />
            <AndrogenReceptor progressRef={progressRef} />
            <NucleusAndDNA progressRef={progressRef} />
            <TranslationProcess progressRef={progressRef} />
            <EffectComposer multisampling={4}>
                <Bloom mipmapBlur luminanceThreshold={0.7} luminanceSmoothing={0.25} intensity={0.8} radius={0.6} />
                <Vignette offset={0.25} darkness={0.75} />
            </EffectComposer>
        </>
    );
};

export const Mechanism3DModal = ({ onClose }: { onClose: () => void }) => {
    const [step, setStepLocal] = useState(0);
    const [playing, setPlaying] = useState(false);
    const setStoreStep = useStore(s => s.setStep);
    const hovered = useStore(s => s.hoveredObject);
    const setHovered = useStore(s => s.setHoveredObject);
    const last = STEPS.length - 1;
    const data = STEPS[step];

    const go = useCallback((target: number) => setStepLocal(Math.min(Math.max(target, 0), last)), [last]);

    useEffect(() => setStoreStep(step), [step, setStoreStep]);
    useEffect(() => () => { setHovered(null); setStoreStep(0); document.body.style.cursor = ''; }, [setHovered, setStoreStep]);

    // Reprodução automática: avança a cada AUTOPLAY_MS e para sozinha na última etapa.
    useEffect(() => {
        if (!playing) return;
        const t = window.setTimeout(() => {
            if (step >= last) setPlaying(false);
            else go(step + 1);
        }, step >= last ? 0 : AUTOPLAY_MS);
        return () => window.clearTimeout(t);
    }, [playing, step, last, go]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (['ArrowRight', 'PageDown', 'ArrowDown'].includes(e.key)) { e.preventDefault(); go(step + 1); }
            else if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(e.key)) { e.preventDefault(); go(step - 1); }
            else if (e.key === ' ') { e.preventDefault(); setPlaying(p => !p); }
            else if (e.key === 'Escape' || e.key === '3') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [step, go, onClose]);

    return (
        <motion.div
            role="dialog"
            aria-label="Mecanismo genômico da testosterona em 3D"
            className="absolute inset-0 z-50 bg-[#03030a]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
        >
            {/* O canvas termina antes do painel lateral para nada da cena ficar escondido atrás dele. */}
            <div className="absolute top-0 bottom-0 left-0 right-[420px]">
                <Canvas
                    dpr={[1, 1.75]}
                    camera={{ position: STEPS[0].cameraPosition, fov: 45, near: 0.1, far: 200 }}
                    className="cursor-grab active:cursor-grabbing"
                >
                    <Suspense fallback={null}>
                        <Scene step={step} />
                    </Suspense>
                </Canvas>
            </div>

            {/* Cabeçalho */}
            <header className="absolute top-0 left-0 right-0 px-8 pt-6 pb-10 flex items-start justify-between pointer-events-none bg-gradient-to-b from-[#03030a]/90 to-transparent">
                <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-cyan-300/80 mb-1">Modelo 3D interativo</p>
                    <h2 className="font-display text-3xl font-semibold text-white">Testosterona na célula muscular</h2>
                    <p className="text-xs text-gray-500 mt-1 tracking-wide">Arraste para girar · role para aproximar · passe o mouse nas estruturas</p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fechar modelo 3D (Esc)"
                    className="pointer-events-auto w-11 h-11 rounded-full flex items-center justify-center text-gray-300 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10"
                >
                    <X size={20} />
                </button>
            </header>

            {/* Painel da etapa */}
            <aside className="absolute right-8 top-1/2 -translate-y-1/2 w-[380px] rounded-2xl p-6 bg-black/55 border border-white/10 backdrop-blur-xl shadow-2xl">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="inline-block px-3 py-1 text-[10px] font-mono tracking-widest text-cyan-300 bg-cyan-400/10 rounded-full mb-3">
                            {data.badge}
                        </span>
                        <h3 className="font-display text-2xl font-semibold text-white leading-tight mb-3">{data.title}</h3>
                        <p className="text-[15px] text-gray-300 leading-relaxed">{data.description}</p>
                    </motion.div>
                </AnimatePresence>

                <div className={`mt-5 p-4 rounded-xl border transition-colors duration-300 ${hovered ? 'border-cyan-400/50 bg-cyan-400/5' : 'border-white/10 bg-white/[0.03]'}`}>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Info size={14} className={hovered ? 'text-cyan-300' : 'text-gray-500'} />
                        <span className="text-xs font-semibold text-gray-200 uppercase tracking-wider">
                            {hovered ? hovered.name : 'Detalhes da estrutura'}
                        </span>
                    </div>
                    <p className="text-[13px] text-gray-400 leading-relaxed">
                        {hovered ? hovered.info : 'Passe o mouse sobre uma estrutura 3D para ver sua função.'}
                    </p>
                </div>

                <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-2.5">
                    {LEGEND.map(item => (
                        <div key={item.label} className="flex items-center gap-2 text-[12px] text-gray-400">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}` }} />
                            {item.label}
                        </div>
                    ))}
                </div>
            </aside>

            {/* Linha do tempo das etapas */}
            <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-full bg-black/60 border border-white/10 backdrop-blur-xl">
                <button type="button" aria-label="Etapa anterior" onClick={() => go(step - 1)} disabled={step === 0}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-25">
                    <ChevronLeft size={18} />
                </button>
                {STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-3">
                        {i > 0 && (
                            <div className="w-8 h-px bg-white/15 relative overflow-hidden">
                                <div className={`absolute inset-0 bg-cyan-400 transition-transform duration-700 ${i <= step ? 'translate-x-0' : '-translate-x-full'}`} />
                            </div>
                        )}
                        <button
                            type="button"
                            onClick={() => go(i)}
                            title={s.title}
                            aria-label={`${s.badge}: ${s.title}`}
                            aria-current={i === step ? 'step' : undefined}
                            className={`w-10 h-10 rounded-full text-xs font-semibold transition-all duration-300 ${i === step
                                ? 'bg-cyan-400/20 text-white border-2 border-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.5)] scale-110'
                                : i < step
                                    ? 'bg-white/5 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10'
                                    : 'bg-white/5 border border-white/10 text-gray-500 hover:border-white/30 hover:text-gray-200'}`}
                        >
                            {i === 0 ? '●' : i}
                        </button>
                    </div>
                ))}
                <button type="button" aria-label="Próxima etapa" onClick={() => go(step + 1)} disabled={step === last}
                    className="w-9 h-9 flex items-center justify-center rounded-full text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-25">
                    <ChevronRight size={18} />
                </button>
                <span className="w-px h-6 bg-white/10" />
                <button type="button" onClick={() => { if (step === last) go(0); setPlaying(p => !p); }}
                    aria-label={playing ? 'Pausar sequência automática (Espaço)' : 'Reproduzir sequência automática (Espaço)'}
                    className="flex items-center gap-2 pl-3 pr-4 h-9 rounded-full text-sm text-gray-200 hover:text-white hover:bg-white/10">
                    {playing ? <Pause size={15} /> : <Play size={15} />}
                    {playing ? 'Pausar' : 'Reproduzir'}
                </button>
            </footer>
        </motion.div>
    );
};
