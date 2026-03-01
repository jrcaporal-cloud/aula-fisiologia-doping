import { motion } from 'framer-motion';

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
        <div className="w-full h-full flex flex-col items-center justify-center text-center px-4 relative z-10 min-h-screen snap-start">
            <div className="absolute top-1/2 left-1/2 -transform-x-1/2 -translate-y-1/2 -z-10 w-full pointer-events-none">
                <h1 className="text-[15vw] font-display font-bold leading-none text-white opacity-[0.02] whitespace-nowrap blur-sm select-none">
                    DOPING
                </h1>
            </div>
            <motion.p
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-brand-crimson font-display tracking-[0.3em] text-sm md:text-base uppercase mb-6 drop-shadow-[0_0_10px_rgba(225,29,72,0.8)]"
            >
                Apresentação Técnica
            </motion.p>
            <motion.h1
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500 mb-8 max-w-5xl drop-shadow-2xl"
            >
                {slide.title}
            </motion.h1>
            <motion.div
                initial={{ opacity: 0, width: 0 }}
                whileInView={{ opacity: 1, width: '6rem' }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-[2px] bg-gradient-to-r from-transparent via-brand-crimson to-transparent mb-8"
            />
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-xl md:text-2xl text-gray-300 font-light max-w-3xl whitespace-pre-line drop-shadow-md"
            >
                {slide.subtitle}
            </motion.p>
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
            >
                <span className="text-xs tracking-widest uppercase text-gray-400">Scroll Down</span>
                <div className="w-px h-12 bg-gradient-to-b from-brand-crimson to-transparent animate-pulse" />
            </motion.div>
        </div>
    );
};
