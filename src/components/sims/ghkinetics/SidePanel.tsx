import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Clock3, HeartPulse, Syringe } from 'lucide-react';
import type { ReactNode } from 'react';
import { COLORS, STEPS, TEXT } from './content';
import { INJ_T, ISO_WINDOW_H, clockLabel } from './model';
import { AbpStrip, HepaticChain, Isoforms } from './Widgets';

/** Painel lateral: o texto do cartão original de cada passo + a peça visual que o acompanha. */

const EASE = [0.16, 1, 0.3, 1] as const;

/** `size` maior onde o painel tem folga (passos 0, 2 e 5). */
const P = ({ children, strong = false, size = 15 }: { children: ReactNode; strong?: boolean; size?: number }) => (
    <p className={`leading-[1.45] ${strong ? 'text-white font-semibold' : 'text-gray-100'}`} style={{ fontSize: size }}>{children}</p>
);

const Legend = ({ color, text, line = false, size = 14 }: { color: string; text: string; line?: boolean; size?: number }) => (
    <div className="flex items-center gap-2 leading-tight text-gray-100" style={{ fontSize: size }}>
        {line
            ? <span className="w-5 h-[3px] rounded-full" style={{ background: color }} />
            : <span className="w-3.5 h-3.5 rounded-sm shrink-0" style={{ background: `${color}99`, border: `1px solid ${color}` }} />}
        {text}
    </div>
);

const Stat = ({ value, label, color }: { value: string; label: string; color: string }) => (
    <div className="rounded-xl border px-3 py-2" style={{ borderColor: `${color}66`, background: `${color}14` }}>
        <div className="font-mono text-[22px] font-bold leading-none" style={{ color }}>{value}</div>
        <div className="text-[14px] text-gray-200 mt-1">{label}</div>
    </div>
);

const CollectReadout = ({ collectT }: { collectT: number }) => {
    const after = collectT - INJ_T;
    const inside = after < ISO_WINDOW_H;
    const color = inside ? COLORS.iso : '#9CA3AF';
    return (
        <div className="rounded-xl border px-3 py-2 flex items-center gap-2.5" style={{ borderColor: `${color}88`, background: `${color}18` }}>
            <Clock3 size={18} style={{ color: inside ? '#E9D5FF' : '#D1D5DB' }} className="shrink-0" />
            <div className="min-w-0">
                <div className="text-[15px] font-semibold text-white leading-snug">
                    Coleta às {clockLabel(collectT)} · {after.toFixed(after % 1 ? 1 : 0).replace('.', ',')} h após o uso
                </div>
                <div className="text-[14px] leading-snug" style={{ color: inside ? '#E9D5FF' : '#D1D5DB' }}>
                    {inside ? 'dentro da janela do teste (< 12 h após o uso)' : 'fora da janela do teste (< 12 h após o uso)'}
                </div>
            </div>
        </div>
    );
};

const bodyFor = (step: number, collectT: number): ReactNode => {
    switch (step) {
        case 0:
            return (
                <div className="flex flex-col gap-6 pt-3">
                    <P size={22}>{TEXT.pulses}</P>
                    <div className="space-y-3.5">
                        <Legend size={18} color={COLORS.endo} text="GH endógeno (pulsos)" />
                        <Legend size={18} color={COLORS.sleep} text="sono · blocos escuros = fase N3 (posição ilustrativa)" />
                    </div>
                </div>
            );
        case 1:
            return (
                <>
                    <P strong size={17}>{TEXT.mimic}</P>
                    <div className="rounded-xl border border-amber-400/40 px-3 py-2 flex items-center gap-2.5" style={{ background: 'rgba(245,158,11,0.10)' }}>
                        <Syringe size={18} className="text-amber-300 shrink-0" />
                        <span className="text-[16px] text-amber-100">{TEXT.rhgh}</span>
                    </div>
                    <P size={16}>{TEXT.identical} <span className="text-gray-200 text-[14px]">(eixo GH-IGF-1)</span></P>
                    <div className="space-y-1.5">
                        <Legend color={COLORS.total} text="total no plasma (o que se mede)" line />
                        <Legend color={COLORS.exo} text="parcela exógena (rhGH)" />
                        <Legend color={COLORS.endo} text="parcela endógena" />
                    </div>
                </>
            );
        case 2:
            return (
                <>
                    <div className="grid grid-cols-2 gap-2">
                        <Stat value="~15–20 min" label="meia-vida IV" color={COLORS.exo} />
                        <Stat value="~3–4 h" label="meia-vida SC" color={COLORS.exo} />
                    </div>
                    <P strong size={17}>{TEXT.eliminated}</P>
                    <P size={17}>{TEXT.window24}</P>
                </>
            );
        case 3:
            return (
                <>
                    <P>{TEXT.isoTest}</P>
                    <Isoforms />
                    <CollectReadout collectT={collectT} />
                </>
            );
        case 4:
            return (
                <>
                    <HepaticChain />
                    <P strong size={16.5}>{TEXT.igfHalf}</P>
                    <AbpStrip />
                    <P size={16}>{TEXT.abp}</P>
                </>
            );
        default:
            return (
                <div className="flex flex-1 flex-col justify-center gap-3.5 pb-3">
                    <P size={19}>{TEXT.acroIntro}</P>
                    <div className="text-[19px] font-semibold text-amber-200">palumbismo</div>
                    <P size={19}>{TEXT.organs}</P>
                    <div className="rounded-xl border border-rose-500/50 px-3 py-2.5 flex items-start gap-2.5" style={{ background: 'rgba(225,29,72,0.14)' }}>
                        <HeartPulse size={20} className="text-rose-300 shrink-0 mt-0.5" />
                        <span className="text-[18px] text-rose-100 leading-snug">{TEXT.cardio}</span>
                    </div>
                </div>
            );
    }
};

export const SidePanel = ({ step, collectT }: { step: number; collectT: number }) => {
    const info = STEPS[step];
    return (
        <div className="relative h-full rounded-2xl border overflow-hidden"
            style={{ borderColor: `${info.color}55`, background: `linear-gradient(165deg, ${info.color}1c, rgba(8,8,18,0.86) 55%)` }}>
            <AnimatePresence initial={false}>
                <motion.div key={step} className="absolute inset-0 p-3.5 flex flex-col gap-2"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.12, ease: EASE } }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                    <div className="flex items-center gap-2">
                        {step === 5 && <AlertTriangle size={18} style={{ color: info.color }} />}
                        <span className="font-display text-[20px] font-semibold leading-tight" style={{ color: info.color }}>{info.title}</span>
                    </div>
                    {bodyFor(step, collectT)}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
