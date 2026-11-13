import { motion, useReducedMotion } from 'framer-motion';
import { C, FINDINGS } from './content';
import { Echo } from './Echo';
import { SourceTag } from './SourceTag';
import { DUR, EASE_OUT, stagger } from '../../../lib/motion';

/** Último passo: os cinco achados lado a lado (miniatura do eco + texto da aula). Clicar reabre o achado. */

interface AllFiveProps {
    readonly onOpen: (index: number) => void;
}

export const AllFive = ({ onOpen }: AllFiveProps) => {
    const reduce = useReducedMotion() ?? false;
    return (
        <div className="grid h-full gap-3" style={{ gridTemplateColumns: 'repeat(5, minmax(0,1fr))' }}>
            {FINDINGS.map((f, i) => (
                <motion.div
                    key={f.n}
                    role="button" tabIndex={-1} onClick={() => onOpen(i)}
                    className="relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border px-3 pb-3 pt-3 transition-colors duration-180 ease-(--ease-out) hover:bg-white/[0.03]"
                    style={{ background: C.card, borderColor: `${f.color}55` }}
                    initial={reduce ? false : { opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DUR.enter, delay: reduce ? 0 : stagger(i, 0, 0.08), ease: EASE_OUT }}
                >
                    <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: f.color }} aria-hidden />
                    <div className="flex items-baseline gap-2">
                        <span className="font-display text-[30px] font-bold leading-none" style={{ color: f.color }}>{f.n}</span>
                        <span className="text-[17px] font-bold leading-[1.15] text-white">{f.title}</span>
                    </div>
                    <div className="my-2 h-[96px] shrink-0 rounded-xl border border-white/5 bg-black/20 p-1">
                        <Echo id={f.echo} compact />
                    </div>
                    <p className="font-body text-[17px] leading-[1.36] text-gray-100">{f.text}</p>
                    <div className="mt-auto pt-2">
                        <SourceTag finding={f} full={false} />
                    </div>
                </motion.div>
            ))}
        </div>
    );
};
