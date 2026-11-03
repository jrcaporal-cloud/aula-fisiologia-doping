import { motion } from 'framer-motion';
import type { Pillar } from './data';
import { Chain } from './Chain';
import { FiberIllustration, HeartIllustration, MitoIllustration } from './Illustrations';

const ILLUSTRATION = { heart: HeartIllustration, mito: MitoIllustration, fiber: FiberIllustration };

/**
 * 'idle' = visão geral; 'focus' = este pilar aberto; 'done' = pilar já visto (compacto, aceso);
 * 'dim' = pilar ainda não visto (compacto, levemente atenuado — nunca abaixo de 70%).
 */
export type PillarMode = 'idle' | 'focus' | 'done' | 'dim';

interface PillarCardProps {
    pillar: Pillar;
    index: number;
    mode: PillarMode;
    onToggle: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/** Tamanho (px) da ilustração em cada modo e o rótulo "ATP" que dá ~15 px na tela. */
const ART = {
    idle: { w: 240, h: 170, label: 15 },
    small: { w: 140, h: 99, label: 25 },
} as const;

const COMPACT_W = 192;

/** Um pilar: capitel, fuste canelado com a ilustração e base; em foco, abre o mecanismo. */
export const PillarCard = ({ pillar, index, mode, onToggle }: PillarCardProps) => {
    const Illustration = ILLUSTRATION[pillar.kind];
    const focus = mode === 'focus';
    const compact = mode === 'done' || mode === 'dim';
    const dim = mode === 'dim';

    return (
        <motion.button
            type="button"
            layout
            onClick={onToggle}
            aria-expanded={focus}
            aria-label={`${pillar.label}: ${focus ? 'fechar' : 'abrir'} mecanismo`}
            className="relative flex flex-col text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 rounded-t-md"
            style={compact ? { flex: `0 0 ${COMPACT_W}px`, minWidth: 0 } : { flex: '1 1 0', minWidth: 0 }}
            animate={{ y: 0, opacity: dim ? 0.74 : 1, filter: dim ? 'saturate(0.8)' : 'saturate(1)' }}
            transition={{ layout: { duration: 0.7, ease: EASE }, y: { duration: 0.9, ease: EASE, delay: 0.15 + index * 0.14 }, duration: 0.5 }}
            initial={{ opacity: 0, y: 60 }}
            whileHover={dim ? { opacity: 0.95 } : undefined}
        >
            {/* Capitel */}
            <motion.div
                layout
                className="h-4 mx-[-6px] rounded-t-md"
                style={{ background: `linear-gradient(180deg, ${pillar.color}, ${pillar.color}55)` }}
                animate={{ boxShadow: focus ? `0 -6px 30px ${pillar.color}` : `0 -4px 14px ${pillar.color}66` }}
            />
            <motion.div layout className="h-1.5 mx-[-2px]" style={{ background: `${pillar.color}33` }} />

            {/* Fuste */}
            <motion.div
                layout
                className="relative flex-1 overflow-hidden border-x"
                style={{
                    borderColor: `${pillar.color}40`,
                    background: `repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0 14px, rgba(0,0,0,0.18) 14px 16px), linear-gradient(180deg, ${pillar.soft}, rgba(8,8,18,0.82) 70%)`,
                }}
            >
                {focus ? (
                    <motion.div
                        key="open"
                        className="h-full flex flex-col gap-1.5 px-5 py-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex-shrink-0" style={{ width: ART.small.w, height: ART.small.h }}>
                                <Illustration active color={pillar.color} labelSize={ART.small.label} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="text-[16px] font-mono tracking-[0.14em] text-slate-300">EIXO {index + 1}</div>
                                <div className="font-display font-semibold text-[22px] leading-tight whitespace-nowrap" style={{ color: pillar.color }}>{pillar.label}</div>
                                <div className="text-[16px] uppercase tracking-[0.06em] text-slate-200">{pillar.sub}</div>
                            </div>
                            <div className="flex w-[190px] flex-shrink-0 flex-wrap justify-end gap-1.5">
                                {pillar.drugs.map(d => (
                                    <span key={d} className="text-[16px] px-2.5 py-0.5 rounded-full border font-medium" style={{ color: pillar.color, borderColor: `${pillar.color}66`, background: `${pillar.color}1a` }}>{d}</span>
                                ))}
                            </div>
                        </div>

                        {pillar.facts.length > 0 && (
                            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${pillar.facts.length}, minmax(0, 1fr))` }}>
                                {pillar.facts.map((f, k) => (
                                    <motion.div
                                        key={f.label}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 + k * 0.15 }}
                                        className={`rounded-xl border px-3 py-1 ${f.tone === 'risk' ? 'border-rose-500/60 bg-rose-500/10' : 'border-white/10 bg-white/[0.03]'}`}
                                    >
                                        <div className={`font-display text-[24px] leading-none font-bold tabular-nums whitespace-nowrap ${f.tone === 'risk' ? 'text-rose-300' : 'text-white'}`}>{f.value}</div>
                                        <div className="text-[17px] leading-snug text-slate-100 mt-1">{f.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        <p className="text-[17px] leading-[1.3] text-slate-100">{pillar.detail}</p>

                        <div className="mt-auto">
                            <div className="text-[16px] font-mono tracking-[0.14em] text-slate-300 mb-1">MECANISMO</div>
                            <div className="flex flex-col gap-2">
                                {pillar.chains.map((links, k) => (
                                    <Chain key={k} links={links} color={pillar.color} delay={0.4 + k * 1.4} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : compact ? (
                    <div className="h-full flex flex-col items-center justify-center px-2 py-4 gap-4">
                        <div style={{ width: ART.small.w, height: ART.small.h }}>
                            <Illustration active={false} color={pillar.color} labelSize={ART.small.label} />
                        </div>
                        <div className="text-center">
                            <div className="text-[16px] font-mono tracking-[0.14em] text-slate-300">EIXO {index + 1}</div>
                            <div className="font-display font-semibold leading-tight mt-1 text-[21px]" style={{ color: pillar.color }}>{pillar.label}</div>
                            <div className="text-[16px] uppercase tracking-[0.04em] text-slate-200 mt-1.5 leading-snug">{pillar.sub}</div>
                        </div>
                        <div className="flex flex-wrap justify-center gap-1.5">
                            {pillar.drugs.map(d => (
                                <span key={d} className="text-[16px] px-2.5 py-0.5 rounded-full border text-slate-100" style={{ borderColor: `${pillar.color}77`, background: `${pillar.color}1f` }}>{d}</span>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center p-4 justify-center">
                        <div style={{ width: ART.idle.w, height: ART.idle.h }}>
                            <Illustration active={false} color={pillar.color} labelSize={ART.idle.label} />
                        </div>
                        <div className="mt-3 text-center">
                            <div className="text-[16px] font-mono tracking-[0.14em] text-slate-300">EIXO {index + 1}</div>
                            <div className="font-display font-semibold leading-tight mt-1 text-2xl" style={{ color: pillar.color }}>{pillar.label}</div>
                            <div className="text-[16px] uppercase tracking-[0.06em] text-slate-200 mt-1">{pillar.sub}</div>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                            {pillar.drugs.map(d => (
                                <span key={d} className="text-[16px] px-2.5 py-0.5 rounded-full border text-slate-100" style={{ borderColor: `${pillar.color}77`, background: `${pillar.color}1f` }}>{d}</span>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Base */}
            <motion.div layout className="h-1.5 mx-[-4px]" style={{ background: `${pillar.color}33` }} />
            <motion.div layout className="h-3 mx-[-10px] rounded-b-sm bg-white/[0.07] border border-white/10" />
        </motion.button>
    );
};
