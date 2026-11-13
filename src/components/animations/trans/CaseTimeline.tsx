import { motion } from 'framer-motion';
import { CASES } from './casesData';
import { DUR, EASE_OUT, SPRING_TAB } from '../../../lib/motion';

/** Nós igualmente espaçados: 4 casos + o nó das políticas. */
const NODES = [
    ...CASES.map(c => ({ key: c.name, year: String(c.year), name: c.name, sub: c.sport, color: c.color })),
    { key: 'politicas', year: '2021–2023', name: 'Políticas', sub: 'das federações', color: '#E5E7EB' },
];

const xOf = (i: number): number => ((i + 0.5) / NODES.length) * 100;

interface CaseTimelineProps {
    readonly step: number;
    readonly onStep: (s: number) => void;
}

/** Linha do tempo horizontal; o passador acende caso a caso. */
export const CaseTimeline = ({ step, onStep }: CaseTimelineProps) => (
    <div className="relative h-[98px] shrink-0">
        {/* trilho + progresso */}
        <div className="absolute left-[3%] right-[3%] top-[39px] h-[3px] rounded-full bg-white/10" />
        {/* Progresso: trilha inteira (3 %–97 %) encolhida por scaleX, sem animar largura. */}
        <motion.div className="absolute left-[3%] right-[3%] top-[39px] h-[3px] rounded-full"
            style={{ background: 'linear-gradient(90deg, #F59E0B, #60A5FA, #A855F7, #E11D48)', originX: 0 }}
            initial={false} animate={{ scaleX: (xOf(step) - 3) / 94 }} transition={{ duration: DUR.bar, ease: EASE_OUT }} />

        {NODES.map((n, i) => {
            const active = i === step;
            const past = i < step;
            return (
                <button key={n.key} type="button" onClick={() => onStep(i)}
                    className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--act-color,#E11D48)] absolute top-0 -translate-x-1/2 flex flex-col items-center cursor-pointer w-[200px]"
                    style={{ left: `${xOf(i)}%` }}>
                    <span className="font-mono text-[16px] font-semibold h-[24px] transition-colors duration-450 ease-(--ease-out)"
                        style={{ color: active ? n.color : past ? '#E5E7EB' : '#CBD5E1' }}>{n.year}</span>
                    <span className="relative h-[30px] flex items-center justify-center">
                        {active && (
                            <motion.span layoutId="tc-halo" className="absolute w-9 h-9 rounded-full"
                                style={{ background: `${n.color}2E`, border: `1px solid ${n.color}88` }}
                                transition={SPRING_TAB} />
                        )}
                        {/* Tamanho fixo de 18 px; o inativo encolhe por scale (sem animar width/height). */}
                        <motion.span className="relative h-[18px] w-[18px] rounded-full border-2" initial={false}
                            animate={{ scale: active ? 1 : 14 / 18, backgroundColor: active || past ? n.color : '#0B0B18' }}
                            style={{ borderColor: active || past ? n.color : 'rgba(255,255,255,0.35)' }}
                            transition={{ duration: DUR.morph, ease: EASE_OUT }} />
                    </span>
                    <span className="mt-0.5 font-body text-[18px] font-semibold leading-tight transition-colors duration-450 ease-(--ease-out)"
                        style={{ color: active ? '#FFFFFF' : past ? '#E5E7EB' : '#CBD5E1' }}>{n.name}</span>
                    <span className="text-[15px] leading-tight transition-colors duration-450 ease-(--ease-out)" style={{ color: active ? '#F3F4F6' : '#CBD5E1' }}>{n.sub}</span>
                </button>
            );
        })}
    </div>
);
