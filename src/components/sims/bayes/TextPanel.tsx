import { motion } from 'framer-motion';
import { DUR, EASE_OUT } from '../../../lib/motion';
import { IllustrativeTag } from '../../deck/IllustrativeTag';
import { BULLETS, HEADING, PARAGRAPH, STEPS } from './content';

/** Texto do slide (verbatim): o parágrafo de abertura no passo 0; depois, o item do passo em destaque. */

const BULLET_COLORS = { priori: '#CBD5E1', atualizacao: '#60A5FA', corredor: '#22D3EE' } as const;

export const TextPanel = ({ step }: { step: number }) => {
    const active = STEPS[step].bullet;
    return (
        <div className="relative rounded-2xl border border-white/10 overflow-hidden h-full flex flex-col p-3.5 pl-4" style={{ background: 'rgba(8,8,18,0.72)' }}>
            <div className="text-[17px] font-semibold leading-tight" style={{ color: '#93C5FD' }}>{HEADING}</div>

            {active === null && (
                <motion.p key="intro" className="mt-2.5 text-[15px] leading-[1.5] text-gray-100"
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: DUR.enter, ease: EASE_OUT }}>
                    {PARAGRAPH.map((p, i) => (p.strong
                        ? <strong key={i} className="font-semibold text-white">{p.text}</strong>
                        : <span key={i}>{p.text}</span>))}
                </motion.p>
            )}

            <ul className="mt-2.5 flex flex-col gap-1.5">
                {BULLETS.map((b, i) => {
                    const on = b.id === active;
                    const color = BULLET_COLORS[b.id];
                    return (
                        <li key={b.id} className="rounded-xl border px-3 py-1.5 transition-colors duration-450 ease-(--ease-out)"
                            style={{ borderColor: on ? `${color}88` : 'rgba(255,255,255,0.08)', background: on ? `${color}14` : 'transparent' }}>
                            <div className="flex items-center gap-2">
                                <span className="font-mono text-[14px] w-6 h-6 grid place-items-center rounded-md" style={{ color, border: `1px solid ${color}77` }}>{i + 1}</span>
                                <strong className="text-[16px] font-semibold" style={{ color: on ? '#fff' : '#D1D5DB' }}>{b.label.replace(':', '')}</strong>
                            </div>
                            {on && (
                                <motion.p key="t" className="mt-1 text-[14.5px] leading-[1.4] text-gray-100"
                                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: DUR.enter, ease: EASE_OUT }}>
                                    {b.text}
                                </motion.p>
                            )}
                        </li>
                    );
                })}
            </ul>

            <div className="mt-auto pt-2 border-t border-white/10">
                <div className="font-mono text-[14.5px] text-gray-100 leading-relaxed">
                    <span style={{ color: '#93C5FD' }}>posteriori</span> ∝ <span style={{ color: '#FCD34D' }}>exame novo</span> × <span style={{ color: '#CBD5E1' }}>priori</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <IllustrativeTag>modelo ilustrativo</IllustrativeTag>
                    <span className="text-[14px] text-gray-200">escala de T/E ilustrativa</span>
                </div>
            </div>
        </div>
    );
};
