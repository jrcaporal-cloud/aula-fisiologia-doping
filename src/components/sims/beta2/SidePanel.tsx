import { motion, useReducedMotion } from 'framer-motion';
import { Pill, Wind } from 'lucide-react';
import { DUR, EASE_OUT } from '../../../lib/motion';
import { IllustrativeTag } from '../../deck/IllustrativeTag';
import { C, DOSE, type StepText } from './content';

/** Coluna direita: texto do passo (do slide) + seletor de via/dose (passos 0–2). A escala do painel de dose é só esquemática. */

const CARD = 'rounded-2xl border border-white/10';
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

export const TextCard = ({ text, compact }: { text: StepText; compact?: boolean }) => (
    <motion.div key={text.title} className={`${CARD} px-4 py-3`} style={CARD_BG}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.enter, ease: EASE_OUT }}>
        <div className="font-mono text-[14px] uppercase tracking-wider" style={{ color: text.color }}>{text.kicker}</div>
        <div className="font-semibold leading-tight text-white mt-1" style={{ fontSize: compact ? 19 : 21 }}>{text.title}</div>
        <div className="mt-2 space-y-1.5">
            {text.paras.map(p => (
                <p key={p.text} className="text-gray-100" style={{ fontSize: compact ? 15 : 18, lineHeight: 1.38 }}>
                    {p.lead && <strong className="text-white font-semibold">{p.lead} </strong>}{p.text}
                </p>
            ))}
        </div>
    </motion.div>
);

interface LaneProps {
    readonly icon: typeof Pill;
    readonly title: string;
    readonly active: boolean;
    readonly color: string;
    /** Posição do marcador do limiar (0–1) no trilho esquemático. */
    readonly mark: number;
    readonly markLabel: string;
    readonly fill: number;
    readonly verdict: string;
    readonly onClick: () => void;
}

const Lane = ({ icon: Icon, title, active, color, mark, markLabel, fill, verdict, onClick }: LaneProps) => {
    // clip-path não é transform: o MotionConfig não o desliga; com movimento reduzido a barra troca na hora.
    const reduce = useReducedMotion();
    return (
        <button type="button" onClick={onClick} aria-pressed={active}
            className="w-full text-left rounded-xl border px-3 py-1 cursor-pointer transition-colors flex-1 min-h-0 flex flex-col justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--act-color,#E11D48)]"
            style={{ borderColor: active ? `${color}cc` : 'rgba(255,255,255,0.2)', background: active ? `${color}18` : 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-[16px] font-semibold text-white"><Icon size={18} style={{ color }} />{title}</span>
                <span className="text-[14px] font-semibold" style={{ color: active ? color : '#D1D5DB' }}>{active ? verdict : '—'}</span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
                <div className="relative h-3 rounded-full flex-1" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <motion.div className="absolute left-0 top-0 bottom-0 rounded-full" initial={false}
                        animate={{ clipPath: active ? 'inset(0 0% 0 0 round 6px)' : 'inset(0 100% 0 0 round 6px)' }}
                        transition={{ duration: reduce ? 0 : DUR.bar, ease: EASE_OUT }}
                        style={{ width: `${fill * 100}%`, background: `linear-gradient(90deg, ${color}66, ${color})` }} />
                    <div className="absolute -top-1.5 -bottom-1.5 bg-white" style={{ left: `${mark * 100}%`, width: 2 }} />
                </div>
                <span className="shrink-0 flex items-center gap-1.5 font-mono text-[14px] text-white whitespace-nowrap">
                    <span className="inline-block bg-white" style={{ width: 2, height: 14 }} />{markLabel}
                </span>
            </div>
        </button>
    );
};

export const DosePanel = ({ step, onStep }: { step: number; onStep: (s: number) => void }) => (
    <div className={`${CARD} px-3 py-2 flex flex-col gap-1.5 flex-1 min-h-0`} style={CARD_BG}>
        <div className="flex items-center justify-between">
            <span className="font-mono text-[14px] uppercase tracking-wider text-gray-200">Via e dose decidem</span>
            <IllustrativeTag>esquema sem escala</IllustrativeTag>
        </div>
        <Lane icon={Wind} title="Inalatório (asma)" active={step === 1} color={C.inhaled} mark={0.68} markLabel={`limiar WADA ${DOSE.inhaledLimit}`}
            fill={0.45} verdict="abaixo do limiar" onClick={() => onStep(1)} />
        <Lane icon={Pill} title="Oral (sistêmico)" active={step === 2} color={C.amber} mark={0.4} markLabel={DOSE.oral}
            fill={0.86} verdict="supraterapêutico" onClick={() => onStep(2)} />
    </div>
);
