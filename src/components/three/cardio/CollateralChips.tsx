import { motion } from 'framer-motion';
import { ArrowDown, Lock } from 'lucide-react';
import type { CardioPhase } from '../../../data/cardioSteps';
import { COLLATERALS, installedAt, type Collateral } from './collaterals';
import { CC } from './colors';
import { CARDIO_PHASES } from './phases';

/*
 * "T é uma soma": uma fileira de chips que acendem conforme as etapas avançam. Em "Depois de parar",
 * o que regride troca de cor (ciano, seta para baixo) e o que persiste fica aceso com um cadeado.
 */

const CYAN = CARDIO_PHASES.apos.color;

interface Look { bg: string; border: string; text: string }

const lookOf = (lit: boolean, phase: CardioPhase, c: Collateral): Look => {
    if (!lit) return { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.12)', text: '#9CA3AF' };
    if (phase === 'apos' && c.status === 'regride') return { bg: `${CYAN}24`, border: `${CYAN}b3`, text: '#CFFAFE' };
    return { bg: `${CC.crimson}29`, border: `${CC.crimson}b3`, text: '#FFE4E6' };
};

const summary = (c: Collateral, lit: boolean, phase: CardioPhase): string => {
    if (!lit) return `${c.label}: ainda não entrou na soma`;
    if (phase === 'uso') return `${c.label}: na soma`;
    return `${c.label}: ${c.status === 'regride' ? 'regride depois de parar' : 'persiste depois de parar'}`;
};

interface ChipProps { c: Collateral; index: number; step: number; phase: CardioPhase; still: boolean }

const Chip = ({ c, index, step, phase, still }: ChipProps) => {
    const lit = step >= c.step;
    const look = lookOf(lit, phase, c);
    const mark = lit && phase === 'apos' ? c.status : null;
    return (
        <motion.li
            aria-label={summary(c, lit, phase)}
            className="relative inline-flex items-center gap-1.5 px-2.5 h-8 rounded-full border text-[14px] font-semibold"
            initial={false}
            animate={{
                scale: lit ? (still ? 1 : [0.88, 1.09, 1]) : 0.96,
                opacity: lit ? 1 : 0.55,
                backgroundColor: look.bg,
                borderColor: look.border,
                color: look.text,
            }}
            transition={still ? { duration: 0 } : { duration: 0.5, delay: lit ? index * 0.05 : 0, ease: 'easeOut' }}
        >
            {lit && !still && (
                // anel que nasce e some quando o chip entra na soma
                <motion.span
                    aria-hidden
                    className="absolute inset-0 rounded-full border-2 pointer-events-none"
                    style={{ borderColor: CC.crimson }}
                    initial={{ opacity: 0.8, scale: 1 }}
                    animate={{ opacity: 0, scale: 1.45 }}
                    transition={{ duration: 0.75, delay: index * 0.05 }}
                />
            )}
            {mark === 'regride' && <ArrowDown size={14} strokeWidth={2.6} aria-hidden />}
            {mark === 'persiste' && <Lock size={13} strokeWidth={2.4} aria-hidden />}
            {c.label}
        </motion.li>
    );
};

interface CollateralChipsProps { step: number; phase: CardioPhase; reduced: boolean }

export const CollateralChips = ({ step, phase, reduced: still }: CollateralChipsProps) => {
    const n = installedAt(step);
    return (
        <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-semibold text-gray-200 uppercase tracking-wider">Soma dos colaterais</span>
                <span className="text-[14px] font-mono text-gray-400">{n} de {COLLATERALS.length}</span>
            </div>
            <ul aria-label="Colaterais somados nesta etapa" className="flex flex-wrap gap-1.5">
                {COLLATERALS.map((c, i) => <Chip key={c.id} c={c} index={i} step={step} phase={phase} still={still} />)}
            </ul>
            {phase === 'apos' && n > 0 && (
                <p className="mt-2 flex items-center gap-3 text-[14px] text-gray-400">
                    <span className="inline-flex items-center gap-1" style={{ color: CYAN }}><ArrowDown size={14} strokeWidth={2.6} aria-hidden /> regride</span>
                    <span className="inline-flex items-center gap-1 text-rose-200"><Lock size={13} strokeWidth={2.4} aria-hidden /> persiste</span>
                </p>
            )}
        </div>
    );
};
