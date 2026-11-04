import { motion, useReducedMotion } from 'framer-motion';
import { Ban, CircleCheck, FileCheck2, Hand } from 'lucide-react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { VERDICT_STYLE, VOTE_CARDS, type Verdict, type VoteCard } from './peptide/vote';

/**
 * Slide "Proibido ou permitido?". Passo 0: seis cartas viradas para baixo e a turma vota (mão levantada).
 * Passos 1–6: uma carta vira por vez e mostra o veredito da Lista Proibida.
 */

const ICONS: Record<Verdict, typeof Ban> = { proibido: Ban, permitido: CircleCheck, aut: FileCheck2 };
const FACE = 'absolute inset-0 rounded-2xl border p-5 flex flex-col [backface-visibility:hidden]';

const Card = ({ card, index, flipped, current }: { card: VoteCard; index: number; flipped: boolean; current: boolean }) => {
    const reduce = useReducedMotion();
    const look = VERDICT_STYLE[card.verdict];
    const Icon = ICONS[card.verdict];
    return (
        <motion.div className="relative [perspective:1200px]"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: index * 0.07 }}>
            <motion.div className="relative w-full h-full [transform-style:preserve-3d]"
                animate={{ rotateY: flipped ? 180 : 0, scale: current ? 1.03 : 1 }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 16 }}>
                <div className={`${FACE} border-white/15 justify-between`}
                    style={{ background: 'linear-gradient(160deg, rgba(30,30,48,0.95), rgba(8,8,18,0.95))' }}>
                    <span className="font-mono text-[14px] text-gray-300">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                        <p className="font-display text-[1.9rem] leading-tight font-semibold text-white">{card.name}</p>
                        <p className="text-[1.1rem] text-gray-200 mt-1">{card.context}</p>
                    </div>
                    <span className="self-end font-display text-[2.2rem] leading-none text-rose-300/80">?</span>
                </div>
                <div className={`${FACE} justify-between [transform:rotateY(180deg)]`}
                    style={{ background: look.bg, borderColor: look.border, boxShadow: current ? `0 0 28px ${look.border}` : 'none' }}>
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-[1.25rem] font-semibold text-white leading-tight">{card.name}</span>
                        <span className="text-[14px] text-gray-200 text-right">{card.context}</span>
                    </div>
                    <span className="flex items-center gap-2 font-display text-[1.6rem] font-semibold leading-tight" style={{ color: look.color }}>
                        <Icon size={28} aria-hidden /> {look.label}
                    </span>
                    <p className="text-[1.02rem] leading-snug text-gray-100">{card.answer}</p>
                </div>
            </motion.div>
        </motion.div>
    );
};

const PeptideVoteSim = () => {
    const { step } = useSlideSteps(VOTE_CARDS.length + 1);
    const revealed = VOTE_CARDS.filter((_, i) => i < step);
    const score = revealed.filter(c => c.verdict !== 'permitido').length;

    return (
        <div className="not-prose w-full font-body text-white select-none flex flex-col gap-3" style={{ height: 492 }}>
            <div className="flex items-center justify-between h-[34px]">
                <motion.p key={step === 0 ? 'vote' : 'reveal'} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-[1.15rem] text-gray-100">
                    {step === 0
                        ? <><Hand size={20} className="text-rose-300" aria-hidden /> Mão levantada: quem acha que é <strong className="text-rose-200">proibido?</strong></>
                        : <>Viradas {step} de {VOTE_CARDS.length} · <span className="text-rose-200">{score} na lista</span> · <span className="text-sky-200">{step - score} fora dela</span></>}
                </motion.p>
                <span className="text-[14px] font-mono uppercase tracking-wider text-gray-300">Lista Proibida WADA 2026</span>
            </div>
            <div className="grid grid-cols-3 grid-rows-2 gap-3 flex-1 min-h-0">
                {VOTE_CARDS.map((card, i) => (
                    <Card key={card.name} card={card} index={i} flipped={i < step} current={i === step - 1} />
                ))}
            </div>
        </div>
    );
};

export default PeptideVoteSim;
