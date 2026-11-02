import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, Microscope, Pill, TrendingUp, Zap, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { LEVELS, NATURAL_LINKS, type Level, type SectionIcon } from './content';

const ICONS: Record<SectionIcon, LucideIcon> = { pill: Pill, scope: Microscope, warn: AlertTriangle, trend: TrendingUp, zap: Zap };
const EASE = [0.16, 1, 0.3, 1] as const;
const CARD = 'rounded-2xl border border-white/10';
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const NaturalOverview = () => (
    <motion.div key="natural" className={`${CARD} p-4 h-full flex flex-col`} style={CARD_BG}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }}>
        <div className="flex items-baseline justify-between gap-3">
            <span className="font-display text-[18px] font-semibold text-white">Eixo natural</span>
            <span className="text-[12px] font-mono uppercase tracking-widest text-gray-300">sem intervenção</span>
        </div>
        <div className="mt-3 flex flex-col gap-2.5">
            {NATURAL_LINKS.map((link, i) => (
                <motion.div key={link.from} className="flex gap-3 items-start"
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.25, duration: 0.4 }}>
                    <div className="shrink-0 w-[178px] flex items-center gap-1.5 text-[13px] font-semibold pt-0.5" style={{ color: link.color }}>
                        {link.from} <ArrowRight size={13} /> {link.to}
                    </div>
                    <p className="text-[14px] leading-snug text-gray-200">{link.text}</p>
                </motion.div>
            ))}
        </div>
        <p className="mt-auto pt-2 text-[13px] text-gray-300">
            Avance (→) ou clique em <span className="text-white font-semibold">1 · 2 · 3</span> no eixo para ver os pontos de hackeamento.
        </p>
    </motion.div>
);

const LevelDetail = ({ level }: { level: Level }) => {
    const [tab, setTab] = useState(0);
    const section = level.sections[tab];
    return (
        <motion.div key={level.id} className="rounded-2xl border p-4 h-full flex flex-col"
            style={{ borderColor: `${level.color}55`, background: `linear-gradient(160deg, ${level.soft}, rgba(8,8,18,0.86) 65%)` }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }}>
            <div className="flex items-center gap-3">
                <span className="w-8 h-8 shrink-0 rounded-full grid place-items-center font-mono text-[14px] font-bold border"
                    style={{ color: level.color, borderColor: level.color, background: `${level.color}1f` }}>{level.n}</span>
                <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-display text-[19px] font-semibold leading-tight" style={{ color: level.color }}>{level.title}</span>
                        <span className="text-[14px] font-semibold text-white">{level.subtitle}</span>
                    </div>
                    <p className="text-[13.5px] text-gray-200 leading-snug">{level.summary}</p>
                </div>
            </div>
            <div className="mt-3 flex gap-1.5" role="tablist" aria-label={`Seções: ${level.title}`}>
                {level.sections.map((sec, i) => {
                    const Icon = ICONS[sec.icon];
                    const active = i === tab;
                    return (
                        <button key={sec.label} type="button" role="tab" aria-selected={active} onClick={() => setTab(i)}
                            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13.5px] font-semibold cursor-pointer transition-colors"
                            style={{ color: active ? '#fff' : '#D1D5DB' }}>
                            {active && (
                                <motion.span layoutId="gh-tab" className="absolute inset-0 rounded-lg"
                                    style={{ background: `${level.color}24`, border: `1px solid ${level.color}99` }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 34 }} />
                            )}
                            <Icon size={14} className="relative" style={{ color: sec.icon === 'warn' ? '#FDA4AF' : level.color }} />
                            <span className="relative">{sec.label}</span>
                        </button>
                    );
                })}
            </div>
            <AnimatePresence mode="wait">
                <motion.p key={tab} role="tabpanel" className="mt-2.5 text-[14.5px] leading-relaxed text-gray-100"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.22 }}>
                    {section.content}
                </motion.p>
            </AnimatePresence>
        </motion.div>
    );
};

export const LevelPanel = ({ step }: { step: number }) => (
    <AnimatePresence mode="wait">
        {step === 0 ? <NaturalOverview key="n" /> : <LevelDetail key={LEVELS[step - 1].id} level={LEVELS[step - 1]} />}
    </AnimatePresence>
);
