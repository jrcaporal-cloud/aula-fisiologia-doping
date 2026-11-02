import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { CollapsibleHtml } from './CollapsibleHtml';
import { CellularSignaling } from '../animations/CellularSignaling';
import { ComparisonTable } from '../animations/ComparisonTable';
import { TriangleInfographic } from '../animations/TriangleInfographic';
import { RealityCheck } from '../animations/RealityCheck';
import { StackOlimpicoDisplay } from '../animations/StackOlimpicoDisplay';
import { AthleteDossier } from '../animations/AthleteDossier';
import { BloodDopingAnimation } from '../animations/BloodDopingAnimation';
import { EAAInteractive } from '../animations/EAAInteractive';
import { TransBiologyViz } from '../animations/TransBiologyViz';
import { TransCasesTimeline } from '../animations/TransCasesTimeline';
import { TransScienceReview } from '../animations/TransScienceReview';
import { SteroidProfileVisualizer } from '../animations/SteroidProfileVisualizer';

/** Componentes interativos que o JSON dos slides referencia com [[COMP:Nome]]. */
const COMP_MAP: Record<string, ComponentType> = {
    CellularSignaling,
    ComparisonTable,
    TriangleInfographic,
    RealityCheck,
    StackOlimpicoDisplay,
    AthleteDossier,
    BloodDopingAnimation,
    EAAInteractive,
    TransBiologyViz,
    TransCasesTimeline,
    TransScienceReview,
    SteroidProfileVisualizer,
};

/** Simuladores (src/components/sims) entram sozinhos: [[COMP:NomeDoArquivo]], carregados sob demanda. */
const SIM_LOADERS = import.meta.glob<{ default: ComponentType }>('../sims/*.tsx');
const lazySims = new Map<string, LazyExoticComponent<ComponentType>>();

const resolveComponent = (name: string): ComponentType | null => {
    if (COMP_MAP[name]) return COMP_MAP[name];
    const loader = SIM_LOADERS[`../sims/${name}.tsx`];
    if (!loader) return null;
    if (!lazySims.has(name)) lazySims.set(name, lazy(loader));
    return lazySims.get(name) ?? null;
};

const COMP_TOKEN = /\[\[COMP:(\w+)\]\]/;
const EMPTY_DIV = /<div[^>]*>\s*<\/div>/g;

interface RenderOptions {
    /** Recolhe o HTML que vem depois do componente interativo. */
    collapseAfter?: boolean;
}

export const renderSlideContent = (content: string, { collapseAfter = false }: RenderOptions = {}) => {
    const match = content.match(COMP_TOKEN);
    if (!match) return <div dangerouslySetInnerHTML={{ __html: content }} />;

    const Comp = resolveComponent(match[1]);
    const [before, after] = content.split(match[0]).map(part => part.replace(EMPTY_DIV, '').trim());
    return (
        <>
            {before && <div dangerouslySetInnerHTML={{ __html: before }} />}
            {Comp && <Suspense fallback={<div className="h-[480px]" />}><Comp /></Suspense>}
            {after && (collapseAfter && Comp ? <CollapsibleHtml html={after} /> : <div dangerouslySetInnerHTML={{ __html: after }} />)}
        </>
    );
};
