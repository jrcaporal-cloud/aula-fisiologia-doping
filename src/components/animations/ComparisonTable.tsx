import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MousePointerClick } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { Columns } from './dopingMap/Columns';
import { DRUGS, SYSTEMS, SYSTEM_ORDER } from './dopingMap/data';
import { DetailPanel } from './dopingMap/DetailPanel';
import { DrugCard } from './dopingMap/DrugCard';
import { cardRect, MAP_HEIGHT } from './dopingMap/geometry';
import { SystemShape } from './dopingMap/Marker';
import { UgtCallout } from './dopingMap/UgtCallout';

const STEPS = ['O quê e como', 'Magnitude', 'Quem o antidoping pega'] as const;

/**
 * Slide 6 — O Mapa do Doping de Elite.
 * Passo 0: os seis fármacos por sistema, com via de ação e efeito.
 * Passo 1: selos de magnitude.
 * Passo 2: os marcadores migram para as faixas de detectabilidade (+ nota do UGT2B17).
 */
export const ComparisonTable = () => {
    const { step } = useSlideSteps(STEPS.length);
    const reduced = useReducedMotion() ?? false;
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);
    const [selected, setSelected] = useState<string | null>(null);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return undefined;
        setWidth(el.clientWidth);
        const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const mode = step >= 2 ? 'lane' : 'system';
    const selectedDrug = DRUGS.find(d => d.id === selected) ?? null;

    return (
        <div ref={ref} className="relative w-full max-w-[1040px] mx-auto font-body select-none" style={{ height: MAP_HEIGHT }}>
            {width > 0 && (
                <>
                    <Columns width={width} mode={mode} reduced={reduced} />
                    {DRUGS.map((drug, i) => (
                        <DrugCard
                            key={drug.id}
                            drug={drug}
                            rect={cardRect(width, mode, drug)}
                            mode={mode}
                            index={i}
                            showMagnitude={step >= 1}
                            reduced={reduced}
                            dimmed={selected !== null && selected !== drug.id}
                            onSelect={() => setSelected(cur => (cur === drug.id ? null : drug.id))}
                        />
                    ))}
                    <AnimatePresence>{mode === 'lane' && <UgtCallout key="ugt" width={width} reduced={reduced} />}</AnimatePresence>
                </>
            )}

            <div className="absolute left-0 right-0 bottom-0 flex items-center justify-between gap-6 px-1 text-[13px]">
                <div className="flex items-center gap-2 font-mono text-gray-300">
                    <span className="tracking-[0.18em] text-gray-400">PASSO {step + 1}/{STEPS.length}</span>
                    <span className="text-gray-500">·</span>
                    <motion.span
                        key={step}
                        className="text-white"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: reduced ? 0 : 0.3 }}
                    >
                        {STEPS[step]}
                    </motion.span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                    <MousePointerClick size={15} />
                    Clique num fármaco para ver os colaterais
                </div>
                <div className="flex items-center gap-4">
                    {SYSTEM_ORDER.map(id => (
                        <span key={id} className="flex items-center gap-1.5 text-gray-300">
                            <span className="relative w-[14px] h-[14px]">
                                <SystemShape system={id} color={SYSTEMS[id].color} size={14} filled={0.5} />
                            </span>
                            {SYSTEMS[id].label}
                        </span>
                    ))}
                </div>
            </div>

            <AnimatePresence>
                {selectedDrug && <DetailPanel key={selectedDrug.id} drug={selectedDrug} reduced={reduced} onClose={() => setSelected(null)} />}
            </AnimatePresence>
        </div>
    );
};
