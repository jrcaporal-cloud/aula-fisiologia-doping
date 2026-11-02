import { motion } from 'framer-motion';
import { GENOMIC, GENOMIC_COLOR, NONGENOMIC, NONGENOMIC_COLOR } from './content';

/** Escala ordinal (não proporcional) com as palavras de tempo que estão no texto da aula. */
const TICKS = ['segundos', 'minutos', 'horas', 'dias'] as const;
const TICK_POS = [0, 26, 55, 100] as const;
const tickPos = (i: number) => TICK_POS[i];

interface BarProps {
    from: number;
    to: number;
    color: string;
    label: string;
    lit: boolean;
    reduced: boolean;
    delay: number;
}

const Bar = ({ from, to, color, label, lit, reduced, delay }: BarProps) => (
    <div className="relative h-[22px]">
        <motion.div
            className="absolute top-0 flex h-full items-center overflow-hidden whitespace-nowrap rounded-full px-2.5 font-mono text-[13px] font-semibold text-white"
            style={{ left: `${from}%`, width: `${to - from}%`, background: `${color}`, transformOrigin: 'left center' }}
            initial={false}
            animate={{ opacity: lit ? 1 : 0.4, scaleX: lit ? 1 : 0.98 }}
            transition={{ duration: reduced ? 0 : 0.6, delay: reduced || !lit ? 0 : delay }}
        >
            {label}
        </motion.div>
    </div>
);

interface TimeScaleProps {
    step: number;
    reduced: boolean;
}

export const TimeScale = ({ step, reduced }: TimeScaleProps) => {
    const fastLit = step === 2 || step === 3;
    const slowLit = step === 1 || step === 3;
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] px-4 py-2.5">
            <div className="w-[150px] flex-none">
                <div className="font-display text-[15px] font-semibold leading-tight text-white">Escala de tempo</div>
                <div className="font-mono text-[12px] leading-tight text-gray-400">ordinal, não proporcional</div>
            </div>
            <div className="relative min-w-0 flex-1">
                <div className="flex flex-col gap-1.5 px-1">
                    <Bar
                        from={tickPos(0)}
                        to={tickPos(2)}
                        color={NONGENOMIC_COLOR}
                        label={`Não genômica · ${NONGENOMIC.span}`}
                        lit={fastLit}
                        reduced={reduced}
                        delay={0}
                    />
                    <Bar
                        from={tickPos(2)}
                        to={tickPos(3)}
                        color={GENOMIC_COLOR}
                        label={`Genômica · ${GENOMIC.span} · ${GENOMIC.clock}`}
                        lit={slowLit}
                        reduced={reduced}
                        delay={step === 3 ? 0.35 : 0}
                    />
                </div>
                <div className="relative mt-1 h-[18px] border-t border-white/25">
                    {TICKS.map((t, i) => (
                        <span
                            key={t}
                            className="absolute top-0 font-mono text-[13px] text-gray-300"
                            style={{
                                left: `${tickPos(i)}%`,
                                transform: `translateX(${i === 0 ? '0' : i === TICKS.length - 1 ? '-100%' : '-50%'})`,
                            }}
                        >
                            <span className="absolute -top-[5px] left-1/2 h-[5px] w-px bg-white/40" />
                            {t}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
