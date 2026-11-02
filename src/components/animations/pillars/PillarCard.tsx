import { motion } from 'framer-motion';
import type { Pillar } from './data';
import { Chain } from './Chain';
import { FiberIllustration, HeartIllustration, MitoIllustration } from './Illustrations';

const ILLUSTRATION = { heart: HeartIllustration, mito: MitoIllustration, fiber: FiberIllustration };

interface PillarCardProps {
    pillar: Pillar;
    index: number;
    /** 'idle' = visão geral; 'focus' = este pilar aberto; 'dim' = outro pilar aberto. */
    mode: 'idle' | 'focus' | 'dim';
    onToggle: () => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;

/** Um pilar: capitel, fuste canelado com a ilustração e base; em foco, abre o mecanismo. */
export const PillarCard = ({ pillar, index, mode, onToggle }: PillarCardProps) => {
    const Illustration = ILLUSTRATION[pillar.kind];
    const focus = mode === 'focus';
    const dim = mode === 'dim';

    return (
        <motion.button
            type="button"
            layout
            onClick={onToggle}
            aria-expanded={focus}
            aria-label={`${pillar.label}: ${focus ? 'fechar' : 'abrir'} mecanismo`}
            className="relative flex flex-col text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 rounded-t-md"
            style={dim ? { flex: '0 0 150px', minWidth: 0 } : { flex: '1 1 0', minWidth: 0 }}
            animate={{ y: 0, opacity: dim ? 0.42 : 1, filter: dim ? 'saturate(0.35)' : 'saturate(1)' }}
            transition={{ layout: { duration: 0.7, ease: EASE }, y: { duration: 0.9, ease: EASE, delay: 0.15 + index * 0.14 }, duration: 0.5 }}
            initial={{ opacity: 0, y: 60 }}
            whileHover={dim ? { opacity: 0.7 } : undefined}
        >
            {/* Capitel */}
            <motion.div
                layout
                className="h-5 mx-[-6px] rounded-t-md"
                style={{ background: `linear-gradient(180deg, ${pillar.color}, ${pillar.color}55)` }}
                animate={{ boxShadow: focus ? `0 -6px 30px ${pillar.color}` : `0 -4px 14px ${pillar.color}66` }}
            />
            <motion.div layout className="h-2 mx-[-2px]" style={{ background: `${pillar.color}33` }} />

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
                        className="h-full flex flex-col gap-3.5 p-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                    >
                        <div className="flex gap-5">
                            <div className="w-[210px] flex-shrink-0">
                                <div className="h-[128px]"><Illustration active color={pillar.color} /></div>
                                <div className="text-[11px] font-mono tracking-[0.25em] text-gray-400 mt-1">EIXO {index + 1}</div>
                                <div className="font-display font-semibold text-[22px] leading-tight" style={{ color: pillar.color }}>{pillar.label}</div>
                                <div className="text-[12px] uppercase tracking-[0.18em] text-gray-300 mt-0.5">{pillar.sub}</div>
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col gap-3">
                                {pillar.facts.length > 0 && (
                                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${pillar.facts.length}, minmax(0, 1fr))` }}>
                                        {pillar.facts.map((f, k) => (
                                            <motion.div
                                                key={f.label}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 + k * 0.15 }}
                                                className={`rounded-xl border px-3 py-2 ${f.tone === 'risk' ? 'border-rose-500/50 bg-rose-500/10' : 'border-white/10 bg-white/[0.03]'}`}
                                            >
                                                <div className={`font-display text-[26px] leading-none font-bold tabular-nums whitespace-nowrap ${f.tone === 'risk' ? 'text-rose-300' : 'text-white'}`}>{f.value}</div>
                                                <div className="text-[12.5px] leading-snug text-gray-300 mt-1">{f.label}</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                                <p className="text-[14.5px] leading-relaxed text-gray-200">{pillar.detail}</p>
                            </div>
                        </div>

                        <div>
                            <div className="text-[11px] font-mono tracking-[0.25em] text-gray-400 mb-2">MECANISMO</div>
                            <div className="flex flex-col gap-2.5">
                                {pillar.chains.map((links, k) => (
                                    <Chain key={k} links={links} color={pillar.color} delay={0.4 + k * 1.4} />
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-mono tracking-[0.2em] text-gray-400 mr-1">AGENTES</span>
                            {pillar.drugs.map(d => (
                                <span key={d} className="text-[13px] px-2.5 py-1 rounded-full border font-medium" style={{ color: pillar.color, borderColor: `${pillar.color}66`, background: `${pillar.color}1a` }}>{d}</span>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <div className={`h-full flex flex-col items-center ${dim ? 'px-2 py-4' : 'p-4 justify-center'}`}>
                        <div className={dim ? 'h-[96px] w-full' : 'h-[210px] w-full max-w-[300px]'}>
                            <Illustration active={false} color={pillar.color} />
                        </div>
                        <div className="mt-3 text-center">
                            <div className="text-[11px] font-mono tracking-[0.25em] text-gray-400">EIXO {index + 1}</div>
                            <div className={`font-display font-semibold leading-tight mt-1 ${dim ? 'text-[17px]' : 'text-2xl'}`} style={{ color: pillar.color }}>{pillar.label}</div>
                            {!dim && <div className="text-[13px] uppercase tracking-[0.18em] text-gray-300 mt-1">{pillar.sub}</div>}
                        </div>
                        {!dim && (
                            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                                {pillar.drugs.map(d => (
                                    <span key={d} className="text-[12px] px-2 py-0.5 rounded-full border text-gray-200" style={{ borderColor: `${pillar.color}55`, background: `${pillar.color}14` }}>{d}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>

            {/* Base */}
            <motion.div layout className="h-2 mx-[-4px]" style={{ background: `${pillar.color}33` }} />
            <motion.div layout className="h-4 mx-[-10px] rounded-b-sm bg-white/[0.07] border border-white/10" />
        </motion.button>
    );
};
