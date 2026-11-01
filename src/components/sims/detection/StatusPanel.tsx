import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export type EffectState = 'ativo' | 'residual' | 'sem uso';
export type TestState = 'detectável' | 'limpo';

export interface StatusItem {
    id: string;
    name: string;
    color: string;
    effect: EffectState;
    test: TestState;
}

export interface GainStatus {
    value: number; // 0–1
    building: boolean;
}

interface StatusPanelProps {
    caption: string;
    time: string;
    items: StatusItem[];
    gain: GainStatus | null;
}

const EFFECT_STYLE: Record<EffectState, { bg: string; fg: string }> = {
    ativo: { bg: 'rgba(255,255,255,0.12)', fg: '#FFFFFF' },
    residual: { bg: 'rgba(148,163,184,0.16)', fg: '#CBD5E1' },
    'sem uso': { bg: 'rgba(148,163,184,0.08)', fg: '#94A3B8' },
};

const TEST_STYLE: Record<TestState, { bg: string; fg: string; border: string }> = {
    detectável: { bg: 'rgba(225,29,72,0.18)', fg: '#FDA4AF', border: 'rgba(225,29,72,0.6)' },
    limpo: { bg: 'rgba(16,185,129,0.16)', fg: '#6EE7B7', border: 'rgba(16,185,129,0.55)' },
};

const Pill = ({ text, bg, fg, border, dot }: { text: string; bg: string; fg: string; border?: string; dot?: string }) => (
    <span className="relative inline-flex h-7 min-w-[6.5rem] items-center justify-end overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={text}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[13px] font-semibold uppercase tracking-wide"
                style={{ background: bg, color: fg, border: `1px solid ${border ?? 'transparent'}` }}
            >
                {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot, boxShadow: `0 0 8px ${dot}` }} />}
                {text}
            </motion.span>
        </AnimatePresence>
    </span>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="flex items-center justify-between">
        <span className="font-body text-[13px] text-slate-300">{label}</span>
        {children}
    </div>
);

export const StatusPanel = ({ caption, time, items, gain }: StatusPanelProps) => (
    <div className="flex h-full flex-col gap-2.5">
        <div className="rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] px-4 py-3">
            <div className="font-mono text-[12px] uppercase tracking-[0.18em] text-slate-400">Dia do teste</div>
            <div className="mt-0.5 font-display text-[26px] font-semibold leading-tight text-white tabular-nums">{time}</div>
            <div className="font-body text-[13px] text-slate-400">{caption}</div>
        </div>
        <AnimatePresence initial={false}>
            {items.map(item => (
                <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] py-2.5 pl-5 pr-3"
                >
                    <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: item.color }} />
                    <div className="mb-1 font-display text-[15px] font-semibold leading-tight text-white">{item.name}</div>
                    <Row label="Efeito">
                        <Pill text={item.effect} {...EFFECT_STYLE[item.effect]} dot={item.effect === 'ativo' ? item.color : undefined} />
                    </Row>
                    <Row label="Teste">
                        <Pill text={item.test} {...TEST_STYLE[item.test]} />
                    </Row>
                </motion.div>
            ))}
            {gain && (
                <motion.div
                    key="gain"
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 24 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-[rgba(8,8,18,0.72)] py-2.5 pl-5 pr-3"
                >
                    <span className="absolute inset-y-0 left-0 w-1.5 bg-[#F59E0B]" />
                    <div className="mb-1.5 flex items-center justify-between">
                        <span className="whitespace-nowrap font-display text-[15px] font-semibold text-white">Ganho estrutural</span>
                        <Pill text={gain.value < 0.02 ? 'ainda não' : gain.building ? 'construindo' : 'retido'}
                            bg="rgba(245,158,11,0.16)" fg="#FCD34D" border="rgba(245,158,11,0.5)" />
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-300"
                            animate={{ width: `${Math.round(gain.value * 100)}%` }} transition={{ duration: 0.15, ease: 'linear' }} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);
