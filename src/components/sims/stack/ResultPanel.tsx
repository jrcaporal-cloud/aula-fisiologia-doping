import { motion } from 'framer-motion';
import { AlertTriangle, Timer } from 'lucide-react';
import { PIECES, RESULT } from './content';

const EASE = [0.16, 1, 0.3, 1] as const;

/** Último passo: o ganho documentado e o preço (a insulina, com janela de erro de minutos). */
export const ResultPanel = ({ reduced }: { readonly reduced: boolean }) => (
    <div className="flex h-full flex-col gap-4 px-7 py-5">
        <div>
            <div className="font-mono text-[13px] uppercase tracking-[0.16em] text-gray-300">{RESULT.kicker}</div>
            <div className="mt-1 flex items-baseline gap-3">
                <motion.span
                    className="font-display font-bold leading-none text-white" style={{ fontSize: 76 }}
                    initial={reduced ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.1 }}
                >
                    {RESULT.from}
                </motion.span>
                <span className="font-display text-gray-300" style={{ fontSize: 44 }}>→</span>
                <motion.span
                    className="font-display font-bold leading-none text-brand-red"
                    style={{ fontSize: 76, textShadow: '0 0 28px rgba(225,29,72,0.45)' }}
                    initial={reduced ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.3 }}
                >
                    {RESULT.to}
                </motion.span>
            </div>
            <p className="mt-2 max-w-[560px] font-body text-[17px] leading-snug text-gray-100">{RESULT.line}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 font-mono text-[13px]">
                {PIECES.map((p, i) => (
                    <span key={p.id} className="flex items-center gap-2">
                        {i > 0 && <span className="text-gray-400">+</span>}
                        <span className="rounded-md border px-2 py-0.5" style={{ color: p.soft, borderColor: `${p.color}66`, background: `${p.color}1a` }}>{p.name}</span>
                    </span>
                ))}
            </div>
        </div>

        <motion.div
            className="mt-auto rounded-2xl border-2 border-brand-red/70 px-5 py-4"
            style={{ background: 'rgba(60,6,20,0.55)' }}
            initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
        >
            <div className="flex items-center gap-2.5">
                <AlertTriangle size={22} className="text-rose-300" aria-hidden />
                <span className="font-display text-[19px] font-semibold uppercase tracking-wide text-rose-200">{RESULT.riskTitle}</span>
            </div>
            <p className="mt-2 font-body text-[16px] leading-snug text-rose-50">{RESULT.riskText}</p>
            <div className="mt-3 flex items-center gap-3 border-t border-rose-400/25 pt-3">
                <Timer size={26} className="text-brand-red" aria-hidden />
                <span className="font-display text-[30px] font-bold leading-none text-white">{RESULT.errorWindow}</span>
            </div>
        </motion.div>
    </div>
);
