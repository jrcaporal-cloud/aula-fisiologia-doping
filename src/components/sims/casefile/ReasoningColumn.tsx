import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Lock } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { EVIDENCE_COLORS } from './LabPanel';
import { RichText } from './RichText';
import { CARD_BG, type ReasonBlock, type SceneProps } from './types';

interface ReasoningColumnProps {
    readonly hypothesis: ReasonBlock;
    readonly lesson: ReasonBlock & { readonly Extra?: ComponentType<SceneProps> };
    readonly step: number;
    readonly revealed: boolean;
    readonly accent: string;
    readonly onReveal: () => void;
}

const Locked = ({ title, stepNo }: { title: string; stepNo: number }) => (
    <motion.div key={`lock-${title}`} className="flex-auto rounded-2xl border border-dashed border-white/25 px-4 py-3 flex items-center gap-3"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <Lock size={18} className="text-gray-300 shrink-0" />
        <div>
            <div className="font-display text-[17px] font-semibold text-gray-100">{title}</div>
            <div className="text-[14px] text-gray-300">abre no passo {stepNo}</div>
        </div>
    </motion.div>
);

const Masked = ({ title, onReveal }: { title: string; onReveal: () => void }) => (
    <motion.div key={`mask-${title}`} className="flex-auto rounded-2xl border border-dashed px-4 py-4 flex flex-col justify-center gap-2"
        style={{ borderColor: 'rgba(245,158,11,0.6)', background: 'rgba(245,158,11,0.07)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
        <div className="flex items-center gap-2 font-display text-[16px] font-semibold text-amber-200">
            <Lock size={16} /> {title}: resposta oculta
        </div>
        <div className="text-[14px] text-gray-200">A turma raciocina antes de ver a resposta.</div>
        <button type="button" onClick={onReveal}
            className="self-start mt-1 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[14px] font-semibold cursor-pointer border border-amber-400/70 text-amber-100 hover:bg-amber-400/15 transition-colors">
            <Eye size={15} /> Revelar
        </button>
    </motion.div>
);

const Block = ({ block, color, step, numbered, roomy = false, children }: { block: ReasonBlock; color: string; step: number; numbered: boolean; roomy?: boolean; children?: ReactNode }) => (
    <motion.div key={`open-${block.title}`} className="flex-auto min-h-0 rounded-2xl border px-3.5 py-3 flex flex-col justify-center gap-2"
        style={{ ...CARD_BG, borderColor: `${color}88`, backgroundImage: `linear-gradient(160deg, ${color}1c, rgba(8,8,18,0) 60%)` }}
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.4 }}>
        <div className="font-mono text-[14px] uppercase tracking-wider" style={{ color }}>{block.title}</div>
        {block.headline && <div className="font-display text-[20px] font-bold leading-tight text-white">{block.headline}</div>}
        <div className="flex flex-col gap-2">
            {block.items.map((item, i) => {
                const n = numbered && item.evidence ? i : -1;
                return (
                    <motion.div key={i} className="flex gap-2.5" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 + i * 0.12 }}>
                        {n >= 0 && (
                            <span className="shrink-0 mt-[1px] w-[24px] h-[24px] rounded-full flex items-center justify-center font-mono text-[14px] font-bold"
                                style={{ background: EVIDENCE_COLORS[n % EVIDENCE_COLORS.length], color: '#0b0b14' }}>{n + 1}</span>
                        )}
                        <RichText parts={item.parts} step={step} revealed className={roomy ? 'text-[18px] leading-[1.45] text-gray-100' : 'text-[16px] leading-[1.4] text-gray-100'} />
                    </motion.div>
                );
            })}
        </div>
        {children}
    </motion.div>
);

/** Coluna 3 do prontuário: hipótese (passo 2) e conduta/lição (passo 3), com véu opcional. */
export const ReasoningColumn = ({ hypothesis, lesson, step, revealed, accent, onReveal }: ReasoningColumnProps) => {
    const Extra = lesson.Extra;
    const hState = step < 2 ? 'lock' : revealed ? 'open' : 'mask';
    const lState = step < 3 ? 'lock' : revealed ? 'open' : 'mask';
    return (
        <div className="flex flex-col gap-2 min-h-0 h-full">
            <AnimatePresence mode="wait" initial={false}>
                {hState === 'lock' && <Locked key="hl" title={hypothesis.title} stepNo={3} />}
                {hState === 'mask' && <Masked key="hm" title={hypothesis.title} onReveal={onReveal} />}
                {hState === 'open' && <Block key="ho" block={hypothesis} color={accent} step={step} numbered roomy={lState !== 'open'} />}
            </AnimatePresence>
            <AnimatePresence mode="wait" initial={false}>
                {lState === 'lock' && <Locked key="ll" title={lesson.title} stepNo={4} />}
                {lState === 'mask' && <Masked key="lm" title={lesson.title} onReveal={onReveal} />}
                {lState === 'open' && (
                    <Block key="lo" block={lesson} color="#10B981" step={step} numbered={false}>
                        {Extra && <Extra step={step} revealed={revealed} />}
                    </Block>
                )}
            </AnimatePresence>
        </div>
    );
};
