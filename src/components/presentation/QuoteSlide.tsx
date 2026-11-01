import { motion } from 'framer-motion';
import type { SlideSchema } from './TitleSlide';

/**
 * Slides sem título (citação de transição e encerramento): o texto do JSON vira
 * a peça central, em tipografia grande, em vez de cair no layout de texto corrido.
 */
export const QuoteSlide = ({ slide }: { slide: SlideSchema }) => (
    <div className="quote-slide w-full min-h-[560px] flex flex-col items-center justify-center text-center px-16 relative z-10">
        <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-[3px] h-16 mb-10 rounded-full origin-top"
            style={{ background: 'linear-gradient(180deg, #e11d48, transparent)' }}
        />
        <motion.div
            initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl"
            dangerouslySetInnerHTML={{ __html: slide.content }}
        />
    </div>
);
