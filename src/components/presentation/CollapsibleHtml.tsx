import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/** Texto que vem depois de um simulador, recolhido atrás de um botão (o simulador já explica). */
export const CollapsibleHtml = ({ html }: { html: string }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="mt-6 flex flex-col items-center not-prose">
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-gray-200 bg-white/[0.05] border border-white/15 hover:border-brand-red/60 hover:text-white hover:bg-brand-red/10 transition-colors"
            >
                {open ? 'Ocultar explicação' : 'Mostrar explicação'}
                <ChevronDown size={16} className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        key="text"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        className="w-full prose prose-invert max-w-none mt-4"
                        dangerouslySetInnerHTML={{ __html: html }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
