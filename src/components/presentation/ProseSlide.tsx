import type { SlideSchema } from './TitleSlide';
import { renderSlideContent } from './slideContent';
import { SlideHeader } from './SlideHeader';

/** Slides cujo texto longo fica recolhido sob o simulador (que já mostra a mesma ideia). */
const COLLAPSED_TEXT_SLIDES = new Set<number>([15, 103, 104, 105, 106, 107, 108, 109]);

export const ProseSlide = ({ slide }: { slide: SlideSchema }) => {
    return (
        <div className="w-full flex flex-col justify-center py-4 px-8 relative z-10 max-w-[1200px] mx-auto">

            <SlideHeader title={slide.title} subtitle={slide.subtitle} />

            {/* Conteúdo / componente (sem entrada própria: o slide inteiro já esmaece na troca) */}
            {slide.content && (
                <div className="prose prose-invert prose-p:text-gray-200 prose-headings:font-display prose-headings:text-white max-w-none prose-xl w-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] custom-presentation-content pointer-events-auto">
                    {renderSlideContent(slide.content, { collapseAfter: COLLAPSED_TEXT_SLIDES.has(slide.id) })}
                </div>
            )}
        </div>
    );
};
