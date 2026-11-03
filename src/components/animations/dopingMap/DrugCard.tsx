import { AnimatePresence, motion } from 'framer-motion';
import { CountText } from './CountText';
import { LANES, SYSTEMS, verdictLabel, type Drug } from './data';
import { LaneIcon } from './LaneBadge';
import type { MapMode, Rect } from './geometry';
import { Marker } from './Marker';

export const EASE = [0.16, 1, 0.3, 1] as const;

interface DrugCardProps {
    drug: Drug;
    rect: Rect;
    mode: MapMode;
    index: number;
    showMagnitude: boolean;
    reduced: boolean;
    dimmed: boolean;
    onSelect: () => void;
}

const Field = ({ tag, value, large }: { tag: string; value: string; large: boolean }) => (
    <div className="flex items-baseline gap-2 min-w-0">
        <span className="font-mono text-[16px] tracking-[0.04em] text-slate-200 w-[70px] flex-shrink-0">{tag}</span>
        <span className={`text-slate-50 ${large ? 'text-[18px]' : 'text-[16px]'}`}>{value}</span>
    </div>
);

/** Um fármaco como marcador do mapa: o "o quê" (efeito), o "como" (via) e o selo de magnitude. */
export const DrugCard = ({ drug, rect, mode, index, showMagnitude, reduced, dimmed, onSelect }: DrugCardProps) => {
    const system = SYSTEMS[drug.system];
    const lane = LANES[drug.lane];
    const color = system.color;
    const inLane = mode === 'lane';
    const moveDelay = reduced ? 0 : (inLane ? 0.08 * index : 0.05 * (5 - index));

    return (
        <motion.button
            type="button"
            onClick={onSelect}
            aria-label={`${drug.name}: ver colaterais`}
            className="absolute left-0 top-0 text-left rounded-2xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
            initial={{ opacity: 0, x: rect.x, y: rect.y + 24, width: rect.w, height: rect.h }}
            animate={{ opacity: dimmed ? 0.6 : 1, x: rect.x, y: rect.y, width: rect.w, height: rect.h }}
            transition={{
                duration: reduced ? 0 : 0.95,
                ease: EASE,
                delay: moveDelay,
                opacity: { duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.1 + index * 0.08 },
            }}
            whileHover={reduced ? undefined : { scale: 1.015 }}
        >
            <div
                className="absolute inset-0 rounded-2xl border backdrop-blur-md"
                style={{
                    borderColor: `${color}59`,
                    background: `linear-gradient(140deg, ${color}26 0%, rgba(8,8,18,0.9) 52%)`,
                    boxShadow: showMagnitude ? `0 0 0 1px ${color}22, 0 10px 34px -12px ${color}88` : '0 10px 30px -18px rgba(0,0,0,0.9)',
                    transition: 'box-shadow 0.6s ease',
                }}
            />

            <div className={`relative h-full flex flex-col ${inLane ? 'px-3.5 pt-4 pb-2.5 gap-1.5' : 'px-4 pt-4 pb-4 justify-between'}`}>
                <div className="flex items-center gap-3 min-w-0">
                    <Marker system={drug.system} icon={drug.icon} color={color} size={inLane ? 34 : 42} />
                    <span className={`font-display font-semibold text-white leading-tight ${inLane ? 'text-[17px]' : 'text-[21px]'}`}>
                        {drug.name}
                    </span>
                    <AnimatePresence>
                        {inLane && (
                            <motion.span
                                key="verdict"
                                role="img"
                                aria-label={verdictLabel(drug)}
                                className="ml-auto flex-shrink-0 flex items-center gap-0.5 rounded-full px-1.5 py-1"
                                style={{ background: `${lane.color}1f`, border: `1px solid ${lane.color}77` }}
                                initial={{ opacity: 0, scale: 0.6 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.6 }}
                                transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.9 + 0.08 * index }}
                            >
                                <LaneIcon lane={drug.lane} color={lane.color} size={22} />
                                {drug.hidden.endsWith('*') && <b className="pr-1 text-[18px] leading-none text-white">*</b>}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>
                <div className={`flex flex-col ${inLane ? 'gap-1 mt-0.5' : 'gap-2'}`}>
                    <Field tag="VIA" value={drug.action} large={!inLane} />
                    <Field tag="EFEITO" value={drug.effect} large={!inLane} />
                </div>
            </div>

            <AnimatePresence>
                {showMagnitude && (
                    <motion.span
                        key="mag"
                        className="absolute -top-[14px] right-3 flex items-center gap-1.5 rounded-full px-3 py-[3px] font-mono text-[15px] font-semibold text-white whitespace-nowrap"
                        style={{ background: '#0b0b18', border: `1.5px solid ${color}`, boxShadow: `0 0 18px -4px ${color}` }}
                        initial={{ opacity: 0, scale: 0.4, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.6 }}
                        transition={{ duration: reduced ? 0 : 0.45, ease: EASE, delay: reduced ? 0 : 0.12 * index }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        <CountText text={drug.magnitude} active={showMagnitude} delay={0.12 * index + 0.15} reduced={reduced} />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
};
