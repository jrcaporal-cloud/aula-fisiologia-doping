import { motion } from 'framer-motion';
import type { SlideSchema } from './TitleSlide';
import { renderSlideContent } from './slideContent';

export const ProseSlide = ({ slide }: { slide: SlideSchema }) => {
    return (
        <div className="w-full flex flex-col justify-center py-4 px-8 relative z-10 max-w-6xl mx-auto">

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
                    className="prose prose-invert prose-p:text-gray-200 prose-headings:font-display prose-headings:text-white max-w-none prose-xl w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] custom-presentation-content pointer-events-auto"
                >
                    {renderSlideContent(slide.content)}
                </motion.div>
            )}
        </div>
    );
};
