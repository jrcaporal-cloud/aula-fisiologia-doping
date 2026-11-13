import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, type LucideIcon } from 'lucide-react';
import { COLORS } from './lanes';
import { DUR, EASE_OUT } from '../../../lib/motion';

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
    residual: { bg: 'rgba(148,163,184,0.16)', fg: '#E2E8F0' },
    'sem uso': { bg: 'rgba(148,163,184,0.10)', fg: '#CBD5E1' },
};

const TEST_STYLE: Record<TestState, { bg: string; fg: string; border: string; Icon: LucideIcon }> = {
    detectável: { bg: 'rgba(225,29,72,0.18)', fg: '#FDA4AF', border: 'rgba(225,29,72,0.6)', Icon: AlertTriangle },
    limpo: { bg: 'rgba(56,189,248,0.16)', fg: '#7DD3FC', border: 'rgba(56,189,248,0.6)', Icon: CheckCircle2 },
};

interface PillProps {
    text: string;
    bg: string;
    fg: string;
    border?: string;
    dot?: string;
    Icon?: LucideIcon;
    compact?: boolean;
}

/** Selo de estado. Um selo por vez (mode="popLayout"): o novo entra enquanto o velho sai por cima, sem esperar. */
const Pill = ({ text, bg, fg, border, dot, Icon, compact }: PillProps) => (
    <span className={`relative inline-flex h-8 items-center justify-end ${compact ? '' : 'min-w-[8rem]'}`}>
        <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
                key={text}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: DUR.exit, ease: EASE_OUT }}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[14px] font-semibold uppercase tracking-wide"
                style={{ background: bg, color: fg, border: `1px solid ${border ?? 'transparent'}` }}
            >
                {dot && <span className="h-2 w-2 rounded-full" style={{ background: dot }} />}
                {Icon && <Icon size={15} strokeWidth={2.4} aria-hidden />}
                {text}
            </motion.span>
        </AnimatePresence>
    </span>
);

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
    <div className="flex items-center justify-between">
        <span className="font-body text-[15px] text-slate-200">{label}</span>
        {children}
    </div>
);

export const StatusPanel = ({ caption, time, items, gain }: StatusPanelProps) => (
    <div className="relative flex h-full flex-col gap-2.5">
        <div className="rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] px-4 py-3">
            <div className="font-mono text-[14px] uppercase tracking-[0.12em] text-slate-200">Dia do teste</div>
            <div className="mt-0.5 text-[28px] font-semibold leading-tight text-white tabular-nums">{time}</div>
            <div className="font-body text-[15px] text-slate-200">{caption}</div>
        </div>
        <AnimatePresence initial={false} mode="popLayout">
            {items.map(item => (
                <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, transition: { duration: DUR.exit } }}
                    transition={{ duration: DUR.enter, ease: EASE_OUT }}
                    className="relative overflow-hidden rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] py-2.5 pl-5 pr-3"
                >
                    <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: item.color }} />
                    <div className="mb-1 text-[16.5px] font-semibold leading-tight text-white">{item.name}</div>
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
                    exit={{ opacity: 0, transition: { duration: DUR.exit } }}
                    transition={{ duration: DUR.enter, ease: EASE_OUT }}
                    className="relative overflow-hidden rounded-2xl border border-white/20 bg-[rgba(8,8,18,0.72)] py-2.5 pl-5 pr-3"
                >
                    <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: COLORS.gain }} />
                    <div className="mb-1.5 flex items-center justify-between">
                        <span className="whitespace-nowrap text-[16.5px] font-semibold text-white">Ganho estrutural</span>
                        <Pill text={gain.value < 0.02 ? 'ainda não' : gain.building ? 'construindo' : 'retido'}
                            bg="rgba(255,255,255,0.12)" fg="#F3F4F6" border="rgba(255,255,255,0.4)" compact />
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                        {/* Largura cheia + recorte (sem Layout por quadro); o gradiente ocupa só a parte cheia, como antes. */}
                        <motion.div className="h-full w-full rounded-full bg-no-repeat"
                            style={{ backgroundImage: `linear-gradient(90deg, rgba(229,231,235,0.45), ${COLORS.gain})` }}
                            animate={{
                                clipPath: `inset(0 ${100 - Math.round(gain.value * 100)}% 0 0 round 5px)`,
                                backgroundSize: `${Math.round(gain.value * 100)}% 100%`,
                            }}
                            transition={{ duration: DUR.exit, ease: 'linear' }} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);
