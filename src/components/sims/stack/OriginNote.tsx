import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { ORIGIN } from './content';
import { RichText } from './RichText';

/** Nota "A origem do termo" (antes era tooltip do título): por que empilhar. */
export const OriginNote = ({ onClose }: { readonly onClose: () => void }) => (
    <motion.div
        className="absolute inset-0 z-10 flex flex-col rounded-2xl border border-white/15 px-6 py-5"
        style={{ background: 'rgba(8,8,18,0.96)' }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
    >
        <div className="flex items-center justify-between">
            <div className="font-display text-[22px] font-semibold text-brand-red">{ORIGIN.title}</div>
            <button type="button" onClick={onClose} aria-label="Fechar" className="cursor-pointer rounded-lg border border-white/15 p-1.5 text-gray-200 hover:bg-white/10">
                <X size={16} />
            </button>
        </div>
        <div className="mt-3 space-y-3">
            {ORIGIN.paragraphs.map((p, i) => (
                <RichText key={i} spans={p} className="font-body text-gray-100" style={{ fontSize: 15.5, lineHeight: 1.5 }} />
            ))}
        </div>
    </motion.div>
);
