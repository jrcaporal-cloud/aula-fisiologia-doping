import { motion, useReducedMotion } from 'framer-motion';
import { useCallback, useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { ACCENT, FAMILIES, STEP_COUNT, STEP_TITLES } from './families/content';
import { FamilyColumn } from './families/FamilyColumn';
import { BODY_H, GAP, computeLayout } from './families/layout';
import { RootBand } from './families/RootBand';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Largura do contêiner, acompanhando o palco escalado. */
const useWidth = () => {
    const [width, setWidth] = useState(0);
    // offsetWidth ignora o `scale` do palco: medimos em px de desenho (1280).
    const ref = useCallback((node: HTMLDivElement | null) => {
        if (!node) return undefined;
        setWidth(node.offsetWidth);
        const ro = new ResizeObserver(() => setWidth(node.offsetWidth));
        ro.observe(node);
        return () => ro.disconnect();
    }, []);
    return { ref, width };
};

/**
 * Slide "As Famílias de Esteroides": árvore estrutural a partir da testosterona.
 * Cada família mostra, na própria molécula, a diferença descrita no cartão original
 * (parsedPresentation.json, id 7).
 */
const SteroidFamiliesSim = () => {
    const { step, setStep } = useSlideSteps(STEP_COUNT);
    const still = useReducedMotion() ?? false;
    const { ref, width } = useWidth();
    const layout = computeLayout(step, width);
    const focus = step >= 1 && step <= 3 ? step - 1 : -1;

    return (
        <div className="w-full font-body text-white select-none pointer-events-auto">
            <div className="flex items-center justify-between gap-4 h-[28px] mb-1">
                <div className="flex items-center gap-3 min-w-0">
                    <motion.span key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                        className="font-display text-[17px] font-semibold truncate"
                        style={{ color: focus >= 0 ? FAMILIES[focus].color : '#fff' }}>
                        {STEP_TITLES[step]}
                    </motion.span>
                </div>
                <span className="shrink-0 flex items-center gap-2 text-[15px] text-gray-100">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
                    onde a molécula muda
                </span>
            </div>

            <div ref={ref} className="relative w-full" style={{ height: BODY_H }}>
                {width > 0 && (
                    <>
                        <RootBand layout={layout} width={width} step={step} still={still} onRoot={() => setStep(0)} />
                        <motion.div
                            className="absolute left-0 right-0 bottom-0 flex"
                            style={{ gap: GAP }}
                            initial={false}
                            animate={{ top: layout.bandH }}
                            transition={{ duration: still ? 0 : 0.6, ease: EASE }}
                        >
                            {FAMILIES.map((f, i) => (
                                <FamilyColumn
                                    key={f.id}
                                    family={f}
                                    mode={layout.columns[i].mode}
                                    width={layout.columns[i].w}
                                    focused={focus === i}
                                    still={still}
                                    onSelect={() => setStep(i + 1)}
                                />
                            ))}
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SteroidFamiliesSim;
