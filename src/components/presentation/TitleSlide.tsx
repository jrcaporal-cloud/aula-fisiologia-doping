import { motion } from 'framer-motion';
import { Chromatogram } from './title/Chromatogram';
import { SteroidMark } from './title/SteroidMark';
import { DUR, EASE_OUT } from '../../lib/motion';

// We'll define the interface inline to avoid issues
interface SlideCard {
    type: string;
    title: string;
    attributes: string[];
    rawHtml: string;
}

export interface SlideSchema {
    id: number;
    sectionName: string;
    number: string;
    layout: string;
    title: string;
    subtitle: string;
    content: string;
    cards: SlideCard[];
}

export const TitleSlide = ({ slide }: { slide: SlideSchema }) => {
    return (
        <div className="w-full h-[660px] flex flex-col items-center justify-center text-center px-4 relative z-10">
            <div aria-hidden className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
                <div className="absolute w-[760px] h-[760px] rounded-full bg-[radial-gradient(circle,rgba(225,29,72,0.10),transparent_65%)]" />
                <SteroidMark className="w-[780px] max-w-none opacity-[0.24] translate-x-10 -translate-y-[120px]" />
            </div>
            {/* Capa: exceção 2 da regra T (não é disparada pelo passador durante a aula). */}
            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: DUR.morph, ease: EASE_OUT }}
                className="text-brand-red font-display tracking-[0.3em] text-base uppercase mb-6"
            >
                Apresentação Técnica
            </motion.p>
            {/* Branco sólido: o degradê apagava "no Esporte" (achado de integridade da crítica). */}
            <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: DUR.morph, ease: EASE_OUT }}
                className="text-8xl font-display leading-[1.02] font-bold tracking-tight text-white mb-7 max-w-5xl"
            >
                {slide.title}
            </motion.h1>
            {/* Traço de largura fixa que se abre do centro (scaleX): sem animar largura. */}
            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.3, duration: DUR.bar, ease: EASE_OUT }}
                className="h-[2px] w-24 origin-center bg-gradient-to-r from-transparent via-brand-crimson to-transparent mb-7"
            />
            <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: DUR.morph, ease: EASE_OUT }}
                className="text-[1.75rem] leading-snug text-gray-300 font-light max-w-3xl drop-shadow-md"
            >
                {slide.subtitle.replace(/\s+/g, ' ')}
            </motion.p>
            <div className="mt-10">
                <Chromatogram />
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                // Dica do passador: o atraso longo é proposital (exceção da capa).
                transition={{ delay: 1.5, duration: DUR.bar, ease: EASE_OUT }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center gap-3 text-gray-400"
            >
                <kbd className="deck-kbd">→</kbd>
                <span className="text-sm tracking-[0.25em] uppercase">avance com as setas ou o passador</span>
            </motion.div>
        </div>
    );
};
