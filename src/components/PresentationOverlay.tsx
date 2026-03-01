import React, { useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import parsedPresentation from '../data/parsedPresentation.json';
import { TitleSlide, type SlideSchema } from './presentation/TitleSlide';
import { BentoSlide } from './presentation/BentoSlide';
import { ProseSlide } from './presentation/ProseSlide';

export const PresentationOverlay: React.FC = () => {
    const setSlide = useStore(state => state.setSlide);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0', 10);
                        setSlide(index);
                    }
                });
            },
            { threshold: 0.5 }
        );

        const slides = containerRef.current?.querySelectorAll('.slide-container');
        slides?.forEach((slide) => observer.observe(slide));

        return () => observer.disconnect();
    }, [setSlide]);

    const renderSlideContent = (slide: SlideSchema) => {
        if (slide.id === 0) return <TitleSlide slide={slide} />;
        if (slide.layout === 'bento' || (slide.cards && slide.cards.length > 0)) {
            return <BentoSlide slide={slide} />;
        }
        return <ProseSlide slide={slide} />;
    };

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 z-10 overflow-y-auto overflow-x-hidden w-full h-full font-body selection:bg-brand-crimson selection:text-white"
            style={{ scrollSnapType: 'y mandatory', scrollBehavior: 'smooth' }}
        >
            {(parsedPresentation as unknown as SlideSchema[]).map((slide, i) => (
                <section
                    key={i}
                    data-index={i}
                    className="slide-container w-full min-h-screen relative flex items-center justify-center"
                    style={{ scrollSnapAlign: 'start' }}
                >
                    {renderSlideContent(slide)}
                </section>
            ))}
            {/* Extra padding at the bottom so the last slide sits nicely */}
            <div className="h-[20vh] w-full snap-start" />
        </div>
    );
};
