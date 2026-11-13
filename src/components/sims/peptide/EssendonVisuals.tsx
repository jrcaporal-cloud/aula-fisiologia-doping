import { motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE_IN_OUT, EASE_OUT, stagger } from '../../../lib/motion';
import { CASE_COLORS } from '../../../lib/palette';

/** Desenhos de cada passo do caso Essendon (cartão da esquerda). Conteúdo: ver essendon.ts. */

const ROWS: readonly (readonly [string, string, string])[] = [
    ['jogador 07', 'injeção', '???'],
    ['jogador 12', 'injeção', '???'],
    ['jogador 23', 'injeção', '???'],
    ['jogador 31', 'injeção', '???'],
];

/** Passo 0: a planilha do programa, com a coluna da substância em branco. */
export const LogSheet = () => {
    const reduce = useReducedMotion();
    return (
    <div className="rounded-xl border border-white/15 bg-white/[0.04] overflow-hidden">
        <div className="grid grid-cols-3 px-4 py-2 text-[14px] font-mono uppercase tracking-wider text-gray-300 border-b border-white/10">
            <span>Quem</span><span>O quê</span><span>Substância</span>
        </div>
        {ROWS.map((r, i) => (
            <motion.div key={r[0]} className="grid grid-cols-3 px-4 py-2 text-[1.05rem] border-b border-white/5"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: stagger(i, 0.15, 0.12), duration: DUR.enter, ease: EASE_OUT }}>
                <span className="text-gray-100">{r[0]}</span>
                <span className="text-gray-200">{r[1]}</span>
                <motion.span className="font-mono text-amber-300" animate={reduce ? { opacity: 1 } : { opacity: [1, 0.35, 1] }} transition={reduce ? { duration: 0 } : { duration: 1.6, repeat: Infinity, delay: i * 0.2, ease: EASE_IN_OUT }}>
                    {r[2]}
                </motion.span>
            </motion.div>
        ))}
    </div>
    );
};

const SANCTIONS: readonly string[] = ['Multa de A$ 2 milhões', 'Fora das finais de 2013', 'Perda de escolhas no draft', 'Técnico suspenso por 12 meses'];

/** Passo 1: as sanções da liga ao clube. */
export const Sanctions = () => (
    <div className="grid grid-cols-2 gap-2.5">
        {SANCTIONS.map((s, i) => (
            <motion.div key={s} className="rounded-xl border border-amber-300/45 bg-amber-400/10 px-4 py-3 text-[1.05rem] font-semibold text-amber-100"
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: DUR.enter, delay: stagger(i, 0.15, 0.12), ease: EASE_OUT }}>
                {s}
            </motion.div>
        ))}
    </div>
);

/** Passo 2: o carimbo da absolvição. */
export const ClearedStamp = () => (
    <div className="flex justify-center py-2">
        <motion.div className="px-8 py-3 rounded-xl border-4 border-sky-300/80 text-sky-200 font-display text-[2.2rem] font-semibold tracking-wider"
            initial={{ opacity: 0, scale: 2.2, rotate: -14 }} animate={{ opacity: 1, scale: 1, rotate: -6 }}
            transition={{ duration: DUR.enter, delay: 0.15, ease: EASE_OUT }}>
            ABSOLVIDOS
            <span className="block text-[1.05rem] font-body font-semibold tracking-normal text-sky-100 text-center">prova insuficiente</span>
        </motion.div>
    </div>
);

const LEVELS: readonly string[] = ['mais provável que não', 'satisfação confortável', 'além de dúvida razoável'];

/** Passo 3: onde fica o padrão de prova do antidoping. */
export const ProofScale = () => (
    <div className="flex flex-col gap-2">
        <span className="text-[14px] font-mono uppercase tracking-wider text-gray-300">Padrão de prova</span>
        <div className="relative h-[14px] rounded-full [container-type:inline-size]" style={{ background: 'linear-gradient(90deg, rgba(56,189,248,0.35), rgba(245,158,11,0.55), rgba(225,29,72,0.7))' }}>
            <motion.span className="absolute inset-y-0 left-0 w-0"
                initial={{ x: '0cqw' }} animate={{ x: '50cqw' }} transition={{ duration: DUR.draw, delay: 0.15, ease: EASE_IN_OUT }}>
                <span className="absolute top-1/2 w-[26px] h-[26px] -mt-[13px] -ml-[13px] rounded-full bg-white border-4" style={{ borderColor: CASE_COLORS.essendon }} />
            </motion.span>
        </div>
        <div className="grid grid-cols-3 text-[15px] leading-tight">
            {LEVELS.map((l, i) => (
                <span key={l} className={`${i === 0 ? 'text-left' : i === 1 ? 'text-center font-semibold text-white' : 'text-right'} ${i === 1 ? '' : 'text-gray-300'}`}>{l}</span>
            ))}
        </div>
        <p className="text-[15px] text-gray-300">O antidoping usa o degrau do meio: mais que o cível, menos que o criminal.</p>
    </div>
);
