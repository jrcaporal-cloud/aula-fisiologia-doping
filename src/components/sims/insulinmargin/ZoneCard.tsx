import { motion } from 'framer-motion';
import { ZONE_ICONS } from '../insulin/zoneIcons';
import { ZONES, type ZoneId } from './content';

const ORDER: readonly ZoneId[] = ['green', 'yellow', 'red'];

/** Texto do segmento da régua em que a dose está (verbatim da aula); no passo 0, a legenda das três faixas. */
export const ZoneCard = ({ step }: { readonly step: number }) => {
    if (step === 0) {
        return (
            <motion.div key="legend" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex h-full flex-col justify-center gap-1.5 px-5 py-2">
                <div className="font-mono text-[14px] uppercase tracking-[0.12em] text-gray-300">Três faixas da régua</div>
                {ORDER.map(id => {
                    const Icon = ZONE_ICONS[id];
                    return (
                        <div key={id} className="flex items-center gap-3">
                            <Icon size={22} strokeWidth={2.2} className="flex-none" style={{ color: ZONES[id].color }} aria-hidden />
                            <span className="font-display text-[19px] font-semibold uppercase tracking-wide" style={{ color: ZONES[id].color }}>{ZONES[id].title}</span>
                        </div>
                    );
                })}
            </motion.div>
        );
    }
    const zone = ZONES[ORDER[Math.min(step, 3) - 1]];
    const Icon = ZONE_ICONS[zone.id];
    return (
        <motion.div
            key={zone.id}
            className="flex h-full flex-col justify-center border-l-4 px-5 py-2"
            style={{ borderColor: zone.color }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
            <div className="flex items-center gap-2.5 font-display text-[22px] font-semibold uppercase tracking-wide" style={{ color: zone.color }}>
                <Icon size={24} strokeWidth={2.2} className="flex-none" aria-hidden />
                {zone.title}
            </div>
            <p className="mt-1 font-body leading-snug" style={{ fontSize: 17, color: zone.id === 'red' ? '#FECDD3' : '#E5E7EB' }}>{zone.text}</p>
        </motion.div>
    );
};
