import React from 'react';
import { motion } from 'framer-motion';
import type { SlideSchema } from './TitleSlide';
import { HPGAxis } from '../animations/HPGAxis';
import { InsulinAnimation } from '../animations/InsulinAnimation';
import { ComparisonTable } from '../animations/ComparisonTable';
import { TriangleInfographic } from '../animations/TriangleInfographic';
import { RealityCheck } from '../animations/RealityCheck';
import { CellularSignaling } from '../animations/CellularSignaling';
import { PhysiologicalProfile } from '../animations/PhysiologicalProfile';
import { AthleteDossier } from '../animations/AthleteDossier';
import { ABPAnimation } from '../animations/ABPAnimation';
import { BloodDopingAnimation } from '../animations/BloodDopingAnimation';
import { EAAInteractive } from '../animations/EAAInteractive';
import { TransBiologyViz } from '../animations/TransBiologyViz';
import { TransCasesTimeline } from '../animations/TransCasesTimeline';
import { TransScienceReview } from '../animations/TransScienceReview';

const COMP_MAP: Record<string, React.FC> = {
    HPGAxis,
    InsulinAnimation,
    ComparisonTable,
    TriangleInfographic,
    RealityCheck,
    CellularSignaling,
    PhysiologicalProfile,
    AthleteDossier,
    ABPAnimation,
    BloodDopingAnimation,
    EAAInteractive,
    TransBiologyViz,
    TransCasesTimeline,
    TransScienceReview,
};

const renderContent = (content: string) => {
    const match = content.match(/\[\[COMP:(\w+)\]\]/);
    if (match) {
        const Comp = COMP_MAP[match[1]];
        const rest = content.replace(match[0], '').replace(/<div[^>]*>\s*<\/div>/g, '').trim();
        return (
            <>
                {rest && <div dangerouslySetInnerHTML={{ __html: rest }} />}
                {Comp && <Comp />}
            </>
        );
    }
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
};

export const ProseSlide = ({ slide }: { slide: SlideSchema }) => {
    return (
        <div className="w-full min-h-screen flex flex-col justify-center snap-start py-12 px-8 relative z-10 max-w-5xl mx-auto">

            {/* Header com borda esquerda */}
            <div className="mb-8 border-l-4 border-brand-crimson pl-8 pointer-events-none">
                <motion.h2
                    initial={{ opacity: 0, x: -30, filter: 'blur(8px)' }}
                    whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="text-4xl md:text-6xl lg:text-7xl font-display font-semibold mb-4 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                >
                    {slide.title}
                </motion.h2>
                {slide.subtitle && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-xl md:text-2xl text-brand-red font-light max-w-4xl drop-shadow-md"
                    >
                        {slide.subtitle}
                    </motion.p>
                )}
            </div>

            {/* Conteúdo / componente */}
            {slide.content && (
                <motion.div
                    initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    viewport={{ once: false, amount: 0.2 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                    className="prose prose-invert prose-p:text-gray-200 prose-headings:font-display prose-headings:text-white max-w-4xl prose-xl w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] custom-presentation-content pointer-events-auto"
                >
                    {renderContent(slide.content)}
                </motion.div>
            )}
        </div>
    );
};
