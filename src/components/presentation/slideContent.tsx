import type { ComponentType } from 'react';
import { CellularSignaling } from '../animations/CellularSignaling';
import { HPGAxis } from '../animations/HPGAxis';
import { InsulinAnimation } from '../animations/InsulinAnimation';
import { ComparisonTable } from '../animations/ComparisonTable';
import { TriangleInfographic } from '../animations/TriangleInfographic';
import { RealityCheck } from '../animations/RealityCheck';
import { PhysiologicalProfile } from '../animations/PhysiologicalProfile';
import { HematocritAnimation } from '../animations/HematocritAnimation';
import { StackOlimpicoDisplay } from '../animations/StackOlimpicoDisplay';
import { AthleteDossier } from '../animations/AthleteDossier';
import { ABPAnimation } from '../animations/ABPAnimation';
import { BloodDopingAnimation } from '../animations/BloodDopingAnimation';
import { EAAInteractive } from '../animations/EAAInteractive';
import { TransBiologyViz } from '../animations/TransBiologyViz';
import { TransCasesTimeline } from '../animations/TransCasesTimeline';
import { TransScienceReview } from '../animations/TransScienceReview';
import { SteroidProfileVisualizer } from '../animations/SteroidProfileVisualizer';

/** Componentes interativos que o JSON dos slides referencia com [[COMP:Nome]]. */
const COMP_MAP: Record<string, ComponentType> = {
    CellularSignaling,
    HPGAxis,
    InsulinAnimation,
    ComparisonTable,
    TriangleInfographic,
    RealityCheck,
    PhysiologicalProfile,
    HematocritAnimation,
    StackOlimpicoDisplay,
    AthleteDossier,
    ABPAnimation,
    BloodDopingAnimation,
    EAAInteractive,
    TransBiologyViz,
    TransCasesTimeline,
    TransScienceReview,
    SteroidProfileVisualizer,
};

const COMP_TOKEN = /\[\[COMP:(\w+)\]\]/;
const EMPTY_DIV = /<div[^>]*>\s*<\/div>/g;

export const renderSlideContent = (content: string) => {
    const match = content.match(COMP_TOKEN);
    if (!match) return <div dangerouslySetInnerHTML={{ __html: content }} />;

    const Comp = COMP_MAP[match[1]];
    const rest = content.replace(match[0], '').replace(EMPTY_DIV, '').trim();
    return (
        <>
            {rest && <div dangerouslySetInnerHTML={{ __html: rest }} />}
            {Comp && <Comp />}
        </>
    );
};
