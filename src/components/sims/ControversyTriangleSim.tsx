import { AnimatePresence, motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { NEXT_SLIDES, STEPS, STEP_COUNT, VERTICES } from './controversy/content';
import { Triangle } from './controversy/Triangle';
import { VertexPanel } from './controversy/VertexPanel';

/**
 * Slide "O Triângulo das Controvérsias": 0 visão geral · 1–3 um vértice por vez (texto verbatim)
 * · 4 o triângulo inteiro com os três embates. Clicar num vértice leva ao passo dele.
 */

const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const ControversyTriangleSim = () => {
    const { step, setStep } = useSlideSteps(STEP_COUNT);
    const info = STEPS[step];
    const active = step >= 1 && step <= 3 ? step - 1 : null;
    const all = step === STEP_COUNT - 1;

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: 512 }}>
            <div className="flex items-center justify-between gap-4 h-[38px] mb-2">
                <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0 truncate">
                    <span className="font-display text-[17px] font-semibold" style={{ color: info.color }}>{info.title}</span>
                    <span className="text-[15px] text-gray-200"> · {info.caption}</span>
                </motion.div>
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 p-1 shrink-0" style={CARD_BG} role="tablist" aria-label="Vértices do triângulo">
                    {['Visão geral', ...VERTICES.map(v => v.num), 'Síntese'].map((label, i) => {
                        const on = i === step;
                        const color = i >= 1 && i <= 3 ? VERTICES[i - 1].color : '#E5E7EB';
                        const soft = i >= 1 && i <= 3 ? VERTICES[i - 1].soft : undefined;
                        return (
                            <button key={label} type="button" role="tab" aria-selected={on} onClick={() => setStep(i)}
                                className="relative px-3 py-1.5 rounded-xl text-[14.5px] font-semibold cursor-pointer transition-colors"
                                style={{ color: on ? '#fff' : '#D1D5DB' }}>
                                {on && (
                                    <motion.span layoutId="ct-step" className="absolute inset-0 rounded-xl"
                                        style={{ background: `${color}22`, border: `1px solid ${color}99` }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                                )}
                                <span className="relative" style={soft ? { color: on ? '#fff' : soft } : undefined}>{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: '400px minmax(0,1fr)', height: 466 }}>
                <div className="relative rounded-2xl border border-white/10 overflow-hidden p-2 flex flex-col justify-center" style={CARD_BG}>
                    {/* Com o aviso dos próximos slides, o triângulo sobe (sem reduzir a escala do texto). */}
                    <motion.div animate={{ y: active === 0 ? -56 : 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
                        <Triangle active={active} all={all} onSelect={i => setStep(i + 1)} />
                    </motion.div>
                    <AnimatePresence>
                        {active === 0 && (
                            <motion.div key="next" className="absolute left-3 right-3 bottom-3 rounded-xl border px-3 py-1.5"
                                style={{ borderColor: 'rgba(196,181,253,0.45)', background: 'rgba(168,85,247,0.10)' }}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.35, delay: 0.3 }}>
                                <div className="font-mono text-[14px] uppercase tracking-[0.08em]" style={{ color: '#DDD6FE' }}>Aprofundado nos próximos slides</div>
                                <ol className="mt-0.5 text-[15px] leading-[1.35] text-gray-100">
                                    {NEXT_SLIDES.map((t, i) => <li key={t}><span className="font-mono text-violet-300">{i + 1}.</span> {t}</li>)}
                                </ol>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                <VertexPanel step={step} onSelect={setStep} />
            </div>
        </div>
    );
};

export default ControversyTriangleSim;
