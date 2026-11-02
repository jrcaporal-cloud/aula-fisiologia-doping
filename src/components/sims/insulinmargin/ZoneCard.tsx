import { motion } from 'framer-motion';
import { ZONES, type ZoneId } from './content';

const ORDER: readonly ZoneId[] = ['green', 'yellow', 'red'];

/** Texto do segmento da régua em que a dose está (verbatim da aula); no passo 0, a legenda das três faixas. */
export const ZoneCard = ({ step }: { readonly step: number }) => {
    if (step === 0) {
        return (
            <motion.div key="legend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col justify-center gap-2 px-5 py-3">
                <div className="font-mono text-[13px] uppercase tracking-[0.14em] text-gray-300">Três faixas da régua</div>
                {ORDER.map(id => (
                    <div key={id} className="flex items-center gap-3">
                        <span className="h-3 w-8 flex-none rounded-full" style={{ background: ZONES[id].color }} />
                        <span className="font-display text-[18px] font-semibold uppercase tracking-wide" style={{ color: ZONES[id].color }}>{ZONES[id].title}</span>
                    </div>
                ))}
            </motion.div>
        );
    }
    const zone = ZONES[ORDER[Math.min(step, 3) - 1]];
    return (
        <motion.div
            key={zone.id}
            className="flex h-full flex-col justify-center border-l-4 px-5 py-3"
            style={{ borderColor: zone.color }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="font-display text-[21px] font-semibold uppercase tracking-wide" style={{ color: zone.color }}>{zone.title}</div>
            <p className="mt-1 font-body leading-snug" style={{ fontSize: 15.5, color: zone.id === 'red' ? '#FECDD3' : '#E5E7EB' }}>{zone.text}</p>
        </motion.div>
    );
};
