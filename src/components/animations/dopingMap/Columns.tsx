import { AnimatePresence, motion } from 'framer-motion';
import { LANES, LANE_ORDER, SYSTEMS, SYSTEM_ORDER } from './data';
import { columnRect, HEADER_HEIGHT, type MapMode } from './geometry';
import { EASE } from './DrugCard';
import { SystemShape } from './Marker';

interface ColumnsProps {
    width: number;
    mode: MapMode;
    reduced: boolean;
}

/** As três colunas do mapa: primeiro por sistema fisiológico, depois por faixa de detectabilidade. */
export const Columns = ({ width, mode, reduced }: ColumnsProps) => {
    const inLane = mode === 'lane';
    const fade = { duration: reduced ? 0 : 0.5, ease: EASE };

    return (
        <>
            {[0, 1, 2].map(col => {
                const r = columnRect(width, col);
                const color = inLane ? LANES[LANE_ORDER[col]].color : SYSTEMS[SYSTEM_ORDER[col]].color;
                return (
                    <motion.div
                        key={col}
                        className="absolute rounded-2xl border"
                        style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 1,
                            borderColor: `${color}${inLane ? '55' : '26'}`,
                            background: `linear-gradient(180deg, ${color}${inLane ? '1c' : '10'} 0%, rgba(8,8,18,0.35) 38%, rgba(8,8,18,0.2) 100%)`,
                        }}
                        transition={{ duration: reduced ? 0 : 0.8, ease: EASE, delay: inLane ? 0.2 : 0 }}
                    />
                );
            })}

            {/* Eixo contínuo de detectabilidade, por cima das três faixas */}
            <AnimatePresence>
                {inLane && (
                    <motion.div
                        key="axis"
                        className="absolute left-0 right-0 pointer-events-none"
                        style={{ top: HEADER_HEIGHT - 6, transformOrigin: 'left center' }}
                        initial={{ opacity: 0, scaleX: 0 }}
                        animate={{ opacity: 1, scaleX: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: reduced ? 0 : 0.9, ease: EASE, delay: reduced ? 0 : 0.15 }}
                    >
                        <div
                            className="h-[3px] rounded-full mx-4"
                            style={{ background: `linear-gradient(90deg, ${LANES.detectavel.color}, ${LANES.quase.color} 50%, ${LANES.indetectavel.color})` }}
                        />
                        <div
                            className="absolute right-2 -top-[5px] w-0 h-0"
                            style={{ borderTop: '6.5px solid transparent', borderBottom: '6.5px solid transparent', borderLeft: `11px solid ${LANES.indetectavel.color}` }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {[0, 1, 2].map(col => {
                const r = columnRect(width, col);
                const system = SYSTEMS[SYSTEM_ORDER[col]];
                const lane = LANES[LANE_ORDER[col]];
                return (
                    <div key={`h${col}`} className="absolute" style={{ left: r.x, top: 0, width: r.w, height: HEADER_HEIGHT }}>
                        <motion.div
                            className="absolute left-5 right-5 top-4 flex items-baseline justify-between gap-3"
                            initial={false}
                            animate={{ opacity: inLane ? 1 : 0, y: inLane ? 0 : -8 }}
                            transition={{ ...fade, delay: inLane && !reduced ? 0.35 : 0 }}
                            aria-hidden={!inLane}
                        >
                            <span className="font-display font-semibold text-[22px] leading-none" style={{ color: lane.color }}>{lane.label}</span>
                            <span className="font-mono text-[13px] text-gray-300">
                                Indetectável? <b style={{ color: lane.color }}>{lane.answer}</b>
                            </span>
                        </motion.div>
                        <motion.div
                            className="absolute left-5 right-5 top-4 flex items-center gap-2.5"
                            initial={false}
                            animate={{ opacity: inLane ? 0 : 1, y: inLane ? 8 : 0 }}
                            transition={{ ...fade, delay: !inLane && !reduced ? 0.25 : 0 }}
                            aria-hidden={inLane}
                        >
                            <span className="relative w-[22px] h-[22px] flex-shrink-0">
                                <SystemShape system={system.id} color={system.color} size={22} filled={0.35} />
                            </span>
                            <span className="font-display font-semibold text-[20px] leading-none" style={{ color: system.color }}>{system.label}</span>
                        </motion.div>
                    </div>
                );
            })}
        </>
    );
};
