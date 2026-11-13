import { MotionConfig, motion, useReducedMotion } from 'framer-motion';
import { useCallback, useRef, useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { ACCENT, FAMILIES, STEP_COUNT, STEP_TITLES } from './families/content';
import { FamilyColumn } from './families/FamilyColumn';
import { BODY_H, GAP, computeLayout } from './families/layout';
import { RootBand } from './families/RootBand';
import { DUR, EASE_OUT } from '../../lib/motion';

interface Point { x: number; y: number }

/** Terceiro título: corpo claro; a cor da família fica só no rótulo "Família N" à esquerda. */
const StepTitle = ({ title, color }: { title: string; color: string }) => {
    const at = title.indexOf(' · ');
    if (at < 0) return <>{title}</>;
    return (
        <>
            <span style={{ color }}>{title.slice(0, at)}</span>
            {title.slice(at)}
        </>
    );
};

/** Largura do contêiner, acompanhando o palco escalado. */
const useWidth = () => {
    const [width, setWidth] = useState(0);
    const nodeRef = useRef<HTMLDivElement | null>(null);
    // offsetWidth ignora o `scale` do palco: medimos em px de desenho (1280).
    const ref = useCallback((node: HTMLDivElement | null) => {
        nodeRef.current = node;
        if (!node) return undefined;
        setWidth(node.offsetWidth);
        const ro = new ResizeObserver(() => setWidth(node.offsetWidth));
        ro.observe(node);
        return () => ro.disconnect();
    }, []);
    /**
     * O FLIP (`layout`) das colunas mede em px de tela; dentro do palco escalado o deslocamento sairia
     * multiplicado pela escala (salto no começo). Converter os pontos para px de desenho corrige.
     */
    const toStage = useCallback((p: Point): Point => {
        const node = nodeRef.current;
        const k = node && node.offsetWidth > 0 ? node.getBoundingClientRect().width / node.offsetWidth : 1;
        return k > 0 ? { x: p.x / k, y: p.y / k } : p;
    }, []);
    return { ref, width, toStage };
};

/**
 * Slide "As Famílias de Esteroides": árvore estrutural a partir da testosterona.
 * Cada família mostra, na própria molécula, a diferença descrita no cartão original
 * (parsedPresentation.json, id 7).
 */
const SteroidFamiliesSim = () => {
    const { step, setStep } = useSlideSteps(STEP_COUNT);
    const still = useReducedMotion() ?? false;
    const { ref, width, toStage } = useWidth();
    const layout = computeLayout(step, width);
    const focus = step >= 1 && step <= 3 ? step - 1 : -1;

    return (
        <div className="w-full font-body text-white select-none pointer-events-auto">
            <div className="flex items-center justify-between gap-4 h-[28px] mb-1">
                <div className="flex items-center gap-3 min-w-0">
                    <motion.span key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.enter, ease: EASE_OUT }}
                        className="text-[20px] font-semibold truncate" style={{ color: '#F3F4F6' }}>
                        <StepTitle title={STEP_TITLES[step]} color={focus >= 0 ? FAMILIES[focus].color : '#E5E7EB'} />
                    </motion.span>
                </div>
                <span className="shrink-0 flex items-center gap-2 text-[15px] text-gray-100">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: ACCENT }} />
                    onde a molécula muda
                </span>
            </div>

            <div ref={ref} className="relative w-full" style={{ height: BODY_H }}>
                {width > 0 && (
                    <MotionConfig transformPagePoint={toStage}>
                        <RootBand layout={layout} width={width} step={step} still={still} onRoot={() => setStep(0)} />
                        {/* A linha troca de topo seca; o deslocamento visual vem do FLIP (`layout`) de cada coluna. */}
                        <div
                            className="absolute left-0 right-0 bottom-0 flex"
                            style={{ gap: GAP, top: layout.bandH }}
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
                        </div>
                    </MotionConfig>
                )}
            </div>
        </div>
    );
};

export default SteroidFamiliesSim;
