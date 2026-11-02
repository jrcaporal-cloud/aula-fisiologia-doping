import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { Dumbbell, Mars, Scale, Stethoscope, Timer, TriangleAlert } from 'lucide-react';
import { formatRatio, type SteroidData } from './data';
import { TIME_BANDS, timeFrac } from './scales';

interface DetailPanelProps {
    steroid: SteroidData;
}

/** Painel do composto selecionado: identidade, números, uso, toxicidade e meia-vida. */
export const DetailPanel = ({ steroid: s }: DetailPanelProps) => {
    const reduce = useReducedMotion();
    return (
        <div className="relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border border-white/10 p-5"
            style={{ background: 'rgba(8,8,18,0.72)' }}>
            <motion.div className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full blur-[70px]"
                animate={{ backgroundColor: s.color, opacity: 0.22 }} transition={{ duration: reduce ? 0 : 0.6 }} />
            <AnimatePresence mode="wait" initial={false}>
                <motion.div key={s.id} className="relative flex flex-col gap-3"
                    initial={{ opacity: 0, y: reduce ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduce ? 0 : -6 }}
                    transition={{ duration: reduce ? 0 : 0.18 }}>
                    <header>
                        <div className="font-mono text-[12px] uppercase tracking-[0.16em]" style={{ color: s.color }}>{s.family}</div>
                        <h3 className="mt-0.5 font-display text-[26px] font-semibold leading-tight text-white">{s.name}</h3>
                        <p className="mt-1 text-[14px] leading-snug text-zinc-200">{s.description}</p>
                    </header>

                    <div className="grid grid-cols-3 gap-2">
                        <Stat icon={Dumbbell} label="Anabólica" value={String(s.anabolic)} color={s.color} />
                        <Stat icon={Mars} label="Androgênica" value={String(s.androgenic)} color="#E4E4E7" />
                        <Stat icon={Scale} label="Razão" value={formatRatio(s)} color="#E4E4E7" />
                    </div>

                    <InfoBox icon={Stethoscope} title="Perfil de uso" text={s.clinicalUse} tone="blue" />
                    <InfoBox icon={TriangleAlert} title="Assinatura tóxica" text={s.colaterais} tone="red" />
                </motion.div>
            </AnimatePresence>
            <HalfLifeRuler s={s} />
        </div>
    );
};

interface StatProps { icon: LucideIcon; label: string; value: string; color: string }

const Stat = ({ icon: Icon, label, value, color }: StatProps) => (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-1.5">
        <div className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wider text-zinc-400">
            <Icon size={14} strokeWidth={2.2} />{label}
        </div>
        <div className="font-mono text-[20px] font-bold leading-tight" style={{ color }}>{value}</div>
    </div>
);

const TONES = {
    blue: { box: 'border-blue-400/20 bg-blue-400/[0.06]', title: 'text-blue-300' },
    red: { box: 'border-rose-500/25 bg-rose-500/[0.07]', title: 'text-rose-300' },
} as const;

interface InfoBoxProps { icon: LucideIcon; title: string; text: string; tone: keyof typeof TONES }

const InfoBox = ({ icon: Icon, title, text, tone }: InfoBoxProps) => (
    <div className={`rounded-xl border px-3.5 py-2 ${TONES[tone].box}`}>
        <div className={`flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider ${TONES[tone].title}`}>
            <Icon size={14} strokeWidth={2.2} />{title}
        </div>
        <p className="mt-0.5 text-[14px] leading-snug text-zinc-200">{text}</p>
    </div>
);

const bandWidth = (from: number, to: number): number => (timeFrac(to) - timeFrac(from)) * 100;

/** Régua log Horas → Semanas; o texto fica no cabeçalho, nunca dentro do marcador (sem transbordo). */
const HalfLifeRuler = ({ s }: { s: SteroidData }) => {
    const reduce = useReducedMotion();
    const left = timeFrac(s.halfLifeHours.min) * 100;
    const right = timeFrac(s.halfLifeHours.max) * 100;
    const isPoint = s.halfLifeHours.min === s.halfLifeHours.max;
    return (
        <div className="relative mt-auto">
            <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-zinc-300">
                    <Timer size={14} strokeWidth={2.2} />Meia-vida
                </span>
                <span className="font-mono text-[14px] font-bold" style={{ color: s.color }}>{s.halfLifeLabel}</span>
            </div>
            <div className="relative h-4 overflow-hidden rounded-full border border-white/10">
                <div className="absolute inset-0 flex">
                    {TIME_BANDS.map((b, i) => (
                        <div key={b.label} className={i % 2 ? 'bg-white/[0.10]' : 'bg-white/[0.04]'}
                            style={{ width: `${bandWidth(b.from, b.to)}%` }} />
                    ))}
                </div>
                <motion.div className="absolute top-1/2 h-2.5 -translate-y-1/2 rounded-full"
                    style={{ backgroundColor: s.color, boxShadow: `0 0 10px ${s.color}`, minWidth: 10 }}
                    initial={false}
                    animate={{ left: `calc(${left}% - ${isPoint ? 5 : 0}px)`, width: isPoint ? 10 : `${right - left}%` }}
                    transition={{ duration: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }} />
            </div>
            <div className="mt-1 flex font-mono text-[12px] uppercase tracking-wider text-zinc-400">
                {TIME_BANDS.map(b => (
                    <div key={b.label} className="text-center" style={{ width: `${bandWidth(b.from, b.to)}%` }}>{b.label}</div>
                ))}
            </div>
        </div>
    );
};
