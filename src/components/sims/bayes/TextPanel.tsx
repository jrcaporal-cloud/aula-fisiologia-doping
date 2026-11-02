import { AnimatePresence, motion } from 'framer-motion';
import { BULLETS, HEADING, PARAGRAPH, STEPS } from './content';

/** Texto do slide (verbatim): o parágrafo de abertura no passo 0; depois, o item do passo em destaque. */

const BULLET_COLORS = { priori: '#CBD5E1', atualizacao: '#60A5FA', corredor: '#22D3EE' } as const;

export const TextPanel = ({ step }: { step: number }) => {
    const active = STEPS[step].bullet;
    return (
        <div className="relative rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col p-4 pl-5" style={{ background: 'rgba(8,8,18,0.72)' }}>
            <div className="font-display text-[18px] font-semibold leading-tight" style={{ color: '#93C5FD' }}>{HEADING}</div>

            <AnimatePresence initial={false}>
                {active === null && (
                    <motion.p key="intro" className="mt-2.5 text-[14.5px] leading-[1.55] text-gray-200 overflow-hidden"
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35 }}>
                        {PARAGRAPH.map((p, i) => (p.strong
                            ? <strong key={i} className="font-semibold text-white">{p.text}</strong>
                            : <span key={i}>{p.text}</span>))}
                    </motion.p>
                )}
            </AnimatePresence>

            <ul className="mt-3 flex flex-col gap-2">
                {BULLETS.map((b, i) => {
                    const on = b.id === active;
                    const color = BULLET_COLORS[b.id];
                    return (
                        <li key={b.id} className="rounded-xl border px-3 py-2 transition-colors duration-500"
                            style={{ borderColor: on ? `${color}88` : 'rgba(255,255,255,0.08)', background: on ? `${color}14` : 'transparent' }}>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[12px] w-5 h-5 grid place-items-center rounded-md" style={{ color, border: `1px solid ${color}77` }}>{i + 1}</span>
                                <strong className="text-[15px] font-semibold" style={{ color: on ? '#fff' : '#D1D5DB' }}>{b.label.replace(':', '')}</strong>
                            </div>
                            <AnimatePresence initial={false}>
                                {on && (
                                    <motion.p key="t" className="text-[14px] leading-[1.5] text-gray-100 overflow-hidden"
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.35 }}>
                                        {b.text}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-auto pt-3 border-t border-white/10">
                <div className="font-mono text-[13px] text-gray-100 leading-relaxed">
                    <span style={{ color: '#93C5FD' }}>posteriori</span> ∝ <span style={{ color: '#FCD34D' }}>exame novo</span> × <span style={{ color: '#CBD5E1' }}>priori</span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-[12px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                        modelo ilustrativo
                    </span>
                    <span className="text-[12.5px] text-gray-300">escala de T/E ilustrativa</span>
                </div>
            </div>
        </div>
    );
};
