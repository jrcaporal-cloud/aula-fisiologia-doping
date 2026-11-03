import { motion } from 'framer-motion';
import { GENOMIC, NONGENOMIC, NONGENOMIC_COLOR } from './content';

/** Azul da barra: mais fundo que o da via no desenho, para o texto branco passar de 4,5:1. */
const GENOMIC_BAR = '#2563EB';

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
    <div className="relative h-[26px]">
        <motion.div
            className="absolute top-0 h-full overflow-hidden rounded-full"
            style={{ left: `${from}%`, width: `${to - from}%`, transformOrigin: 'left center' }}
            initial={false}
            animate={{ scaleX: lit ? 1 : 0.98 }}
            transition={{ duration: reduced ? 0 : 0.6, delay: reduced || !lit ? 0 : delay }}
        >
            <motion.div
                className="absolute inset-0"
                style={{ background: color }}
                initial={false}
                animate={{ opacity: lit ? 1 : 0.62 }}
                transition={{ duration: reduced ? 0 : 0.6, delay: reduced || !lit ? 0 : delay }}
            />
            <span className="relative flex h-full items-center whitespace-nowrap px-3 font-mono text-[16px] font-semibold text-white">
                {label}
            </span>
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
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] px-4 py-2">
            <div className="w-[170px] flex-none">
                <div className="font-display text-[16px] font-semibold leading-tight text-white">Escala de tempo</div>
                <div className="font-mono text-[15.5px] leading-tight text-slate-300">ordinal, não proporcional</div>
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
                        color={GENOMIC_BAR}
                        label={`Genômica · ${GENOMIC.span} · ${GENOMIC.clock}`}
                        lit={slowLit}
                        reduced={reduced}
                        delay={step === 3 ? 0.35 : 0}
                    />
                </div>
                <div className="relative mt-1 h-[22px] border-t border-white/25">
                    {TICKS.map((t, i) => (
                        <span
                            key={t}
                            className="absolute top-0 font-mono text-[16px] text-slate-200"
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
