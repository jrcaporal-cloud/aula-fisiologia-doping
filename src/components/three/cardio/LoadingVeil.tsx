import { motion } from 'framer-motion';

/*
 * Estado de carga do canvas: a primeira abertura monta cena, materiais e pós-processamento antes do
 * primeiro quadro. Fica escondido por 250 ms (se montar rápido, ninguém vê) e some em fade quando o
 * primeiro quadro é desenhado. O pulso imita um batimento; com movimento reduzido fica parado.
 */

const BEAT = [1, 1.28, 1, 1.16, 1];

export const LoadingVeil = ({ reduced }: { reduced: boolean }) => (
    <motion.div
        role="status"
        aria-live="polite"
        className="absolute inset-0 z-[44] flex flex-col items-center justify-center gap-5 bg-[#04030a] pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
        transition={{ duration: 0.4, delay: 0.25 }}
    >
        <div className="relative w-16 h-16 flex items-center justify-center">
            {!reduced && (
                <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full border-2 border-rose-500/60"
                    animate={{ scale: [1, 1.7], opacity: [0.7, 0] }}
                    transition={{ duration: 1.3, repeat: Infinity, ease: 'easeOut' }}
                />
            )}
            <motion.span
                aria-hidden
                className="w-7 h-7 rounded-full bg-rose-500 shadow-[0_0_28px_rgba(244,63,94,0.7)]"
                animate={reduced ? undefined : { scale: BEAT }}
                transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut', times: [0, 0.18, 0.34, 0.5, 1] }}
            />
        </div>
        <p className="text-[14px] font-mono tracking-wider text-rose-200/90">Montando o circuito…</p>
    </motion.div>
);
