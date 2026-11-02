import { motion } from 'framer-motion';
import { CASES } from './casesData';

const EASE = [0.16, 1, 0.3, 1] as const;

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
    <div className="relative h-[112px] shrink-0">
        {/* trilho + progresso */}
        <div className="absolute left-[3%] right-[3%] top-[44px] h-[3px] rounded-full bg-white/10" />
        <motion.div className="absolute left-[3%] top-[44px] h-[3px] rounded-full"
            style={{ background: 'linear-gradient(90deg, #F59E0B, #60A5FA, #A855F7, #E11D48)' }}
            initial={false} animate={{ width: `${xOf(step) - 3}%` }} transition={{ duration: 0.8, ease: EASE }} />

        {NODES.map((n, i) => {
            const active = i === step;
            const past = i < step;
            return (
                <button key={n.key} type="button" onClick={() => onStep(i)}
                    className="absolute top-0 -translate-x-1/2 flex flex-col items-center cursor-pointer w-[200px]"
                    style={{ left: `${xOf(i)}%` }}>
                    <span className="font-mono text-[15px] font-semibold h-[26px] transition-colors duration-500"
                        style={{ color: active ? n.color : past ? '#D1D5DB' : '#9CA3AF' }}>{n.year}</span>
                    <span className="relative h-[36px] flex items-center justify-center">
                        {active && (
                            <motion.span layoutId="tc-halo" className="absolute w-9 h-9 rounded-full"
                                style={{ background: `${n.color}2E`, border: `1px solid ${n.color}88`, boxShadow: `0 0 22px ${n.color}66` }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                        )}
                        <motion.span className="relative rounded-full border-2" initial={false}
                            animate={{ width: active ? 18 : 14, height: active ? 18 : 14, backgroundColor: active || past ? n.color : '#0B0B18' }}
                            style={{ borderColor: active || past ? n.color : 'rgba(255,255,255,0.35)' }}
                            transition={{ duration: 0.4 }} />
                    </span>
                    <span className="mt-1 font-display text-[17px] font-semibold leading-tight transition-colors duration-500"
                        style={{ color: active ? '#FFFFFF' : past ? '#D1D5DB' : '#9CA3AF' }}>{n.name}</span>
                    <span className="text-[13px] leading-tight transition-colors duration-500" style={{ color: active ? '#E5E7EB' : '#9CA3AF' }}>{n.sub}</span>
                </button>
            );
        })}
    </div>
);
