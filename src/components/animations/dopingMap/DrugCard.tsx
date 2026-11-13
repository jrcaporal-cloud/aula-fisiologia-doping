import { AnimatePresence, motion } from 'framer-motion';
import { DUR, EASE_IN_OUT, EASE_OUT, stagger } from '../../../lib/motion';
import { CountText } from './CountText';
import { LANES, verdictLabel, type Drug } from './data';
import { LaneIcon } from './LaneBadge';
import type { MapMode, Rect } from './geometry';
import { Marker } from './Marker';

export { EASE_OUT as EASE } from '../../../lib/motion';

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
    const lane = LANES[drug.lane];
    const color = drug.color;
    const inLane = mode === 'lane';
    const moveDelay = reduced ? 0 : (inLane ? stagger(index, 0, 0.06) : stagger(5 - index, 0, 0.05));

    return (
        <motion.button
            type="button"
            onClick={onSelect}
            aria-label={`${drug.name}: ver colaterais`}
            className="absolute left-0 top-0 text-left rounded-2xl cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
            // Tamanho no style (salta junto com o miolo); só x/y viajam — nada de animar largura/altura.
            style={{ width: rect.w, height: rect.h }}
            initial={{ opacity: 0, x: rect.x, y: rect.y + 24 }}
            animate={{ opacity: dimmed ? 0.6 : 1, x: rect.x, y: rect.y }}
            transition={{
                duration: reduced ? 0 : DUR.bar,
                ease: EASE_IN_OUT,
                delay: moveDelay,
                opacity: { duration: reduced ? 0 : DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : stagger(index, 0.1) },
            }}
            whileHover={reduced ? undefined : { scale: 1.015 }}
        >
            <div
                className="absolute inset-0 rounded-2xl border"
                style={{
                    borderColor: `${color}59`,
                    background: `linear-gradient(140deg, ${color}26 0%, rgba(8,8,18,0.9) 52%)`,
                    boxShadow: showMagnitude ? `0 0 0 1px ${color}55, 0 10px 30px -18px rgba(0,0,0,0.9)` : '0 10px 30px -18px rgba(0,0,0,0.9)',
                    transition: 'box-shadow 600ms var(--ease-out)',
                }}
            />

            <div className={`relative h-full flex flex-col ${inLane ? 'px-3.5 pt-4 pb-2.5 gap-1.5' : 'px-4 pt-4 pb-4 justify-between'}`}>
                <div className="flex items-center gap-3 min-w-0">
                    <Marker system={drug.system} icon={drug.icon} color={color} size={inLane ? 34 : 42} />
                    <span className={`font-body font-semibold text-white leading-tight ${inLane ? 'text-[17px]' : 'text-[21px]'}`}>
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
                                exit={{ opacity: 0, scale: 0.6, transition: { duration: DUR.exit } }}
                                transition={{ duration: reduced ? 0 : DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : stagger(index, 0.6, 0.06) }}
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
                        style={{ background: '#0b0b18', border: `1.5px solid ${color}` }}
                        initial={{ opacity: 0, scale: 0.4, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.6, transition: { duration: DUR.exit } }}
                        transition={{ duration: reduced ? 0 : DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : stagger(index) }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        <CountText text={drug.magnitude} active={showMagnitude} delay={stagger(index, 0.1)} reduced={reduced} />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
};
