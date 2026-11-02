import { AnimatePresence, motion } from 'framer-motion';
import { FAMILIES, ROOT_COLOR } from './content';
import { VIEWBOX } from './geometry';
import type { Layout } from './layout';
import { Steroid } from './Steroid';

const EASE = [0.22, 1, 0.36, 1] as const;
const CORNER = 14;

interface RootBandProps {
    readonly layout: Layout;
    readonly width: number;
    readonly step: number;
    readonly still: boolean;
    readonly onRoot: () => void;
}

/** Ramo em L arredondado: do tronco (x0) até o centro da coluna, descendo até o cartão. */
const branch = (x0: number, busY: number, cx: number, bottom: number): string => {
    const sign = cx >= x0 ? 1 : -1;
    const r = Math.min(CORNER, Math.abs(cx - x0));
    return `M${x0} ${busY} H${cx - sign * r} Q${cx} ${busY} ${cx} ${busY + r} V${bottom}`;
};

export const RootBand = ({ layout, width, step, still, onRoot }: RootBandProps) => {
    const { root, busY, trunkTop, bandH, columns } = layout;
    const intro = step === 0;
    const focus = step >= 1 && step <= 3 ? step - 1 : -1;
    const x0 = width / 2;
    const tr = { duration: still ? 0 : 0.6, ease: EASE };

    return (
        <motion.div className="absolute left-0 right-0 top-0" animate={{ height: bandH }} initial={false} transition={tr}>
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" aria-hidden>
                <motion.path
                    fill="none" stroke={ROOT_COLOR} strokeOpacity={0.55} strokeWidth={2}
                    initial={false} animate={{ d: `M${x0} ${trunkTop} V${busY}` }} transition={tr}
                />
                {FAMILIES.map((f, i) => {
                    const col = columns[i];
                    const on = focus === -1 || focus === i;
                    return (
                        <motion.path
                            key={f.id} fill="none" stroke={f.color} strokeLinecap="round"
                            initial={false}
                            animate={{ d: branch(x0, busY, col.cx, bandH), strokeOpacity: intro ? 0.55 : on ? 0.95 : 0.3, strokeWidth: focus === i ? 3 : 2 }}
                            transition={tr}
                        />
                    );
                })}
                <motion.circle r={4} fill={ROOT_COLOR} initial={false} animate={{ cx: x0, cy: busY }} transition={tr} />
            </svg>

            <motion.button
                type="button" onClick={onRoot} aria-label="Testosterona (voltar ao início)"
                className="absolute cursor-pointer rounded-2xl"
                initial={false} animate={{ left: root.x, top: root.y, width: root.w, height: root.h }} transition={tr}
            >
                <svg viewBox={VIEWBOX} className="w-full h-full overflow-visible" aria-hidden>
                    <Steroid color={ROOT_COLOR} showRings={intro} showC19Label={intro} showAtoms={intro} stroke={intro ? 4 : 7} still={still} />
                </svg>
            </motion.button>

            <AnimatePresence initial={false}>
                {intro ? (
                    <motion.div
                        key="intro" className="absolute left-2 top-24 max-w-[260px] pointer-events-none"
                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, transition: { duration: 0.15 } }}
                        transition={{ delay: still ? 0 : 0.6, duration: 0.5 }}
                    >
                        <div className="font-mono text-[12px] uppercase tracking-[0.2em] text-gray-300">Esqueleto de partida</div>
                        <div className="font-display text-[38px] font-semibold leading-tight text-white mt-1">Testosterona</div>
                        <div className="text-[17px] text-gray-200 mt-1">O molde original humano.</div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="small" className="absolute pointer-events-none font-display text-[15px] font-semibold text-gray-100"
                        style={{ left: x0 + root.w / 2 + 10, top: root.y + root.h * 0.32 }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }}
                        transition={{ delay: still ? 0 : 0.45, duration: 0.3 }}
                    >
                        Testosterona
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
