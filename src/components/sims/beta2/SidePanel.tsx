import { AnimatePresence, motion } from 'framer-motion';
import { Pill, Wind } from 'lucide-react';
import { C, DOSE, type StepText } from './content';

/** Coluna direita: texto do passo (do slide) + seletor de via/dose (passos 0–2). */

const CARD = 'rounded-2xl border border-white/10';
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

export const TextCard = ({ text }: { text: StepText }) => (
    <AnimatePresence mode="wait">
        <motion.div key={text.title} className={`${CARD} p-4`} style={CARD_BG}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
            <div className="font-mono text-[12px] uppercase tracking-widest" style={{ color: text.color }}>{text.kicker}</div>
            <div className="font-display text-[20px] font-semibold leading-tight text-white mt-1">{text.title}</div>
            <div className="mt-2 space-y-1.5">
                {text.paras.map(p => (
                    <p key={p.text} className="text-[14px] text-gray-200" style={{ lineHeight: 1.45 }}>
                        {p.lead && <strong className="text-white font-semibold">{p.lead} </strong>}{p.text}
                    </p>
                ))}
            </div>
        </motion.div>
    </AnimatePresence>
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

const Lane = ({ icon: Icon, title, active, color, mark, markLabel, fill, verdict, onClick }: LaneProps) => (
    <button type="button" onClick={onClick} aria-pressed={active}
        className="w-full text-left rounded-xl border px-3 pb-2 cursor-pointer transition-colors"
        style={{ paddingTop: 6, borderColor: active ? `${color}aa` : 'rgba(255,255,255,0.12)', background: active ? `${color}14` : 'rgba(255,255,255,0.02)' }}>
        <div className="flex items-center justify-between gap-2">
            <span className="flex items-center gap-2 font-display text-[15px] font-semibold text-white"><Icon size={16} style={{ color }} />{title}</span>
            <span className="text-[13px] font-semibold" style={{ color: active ? color : '#9CA3AF' }}>{active ? verdict : '—'}</span>
        </div>
        <div className="relative mt-5 h-3 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <motion.div className="absolute left-0 top-0 bottom-0 rounded-full" initial={false}
                animate={{ width: active ? `${fill * 100}%` : '0%' }} transition={{ duration: 0.9, ease: 'easeOut' }}
                style={{ background: `linear-gradient(90deg, ${color}66, ${color})` }} />
            <div className="absolute -top-1.5 -bottom-1.5 bg-white" style={{ left: `${mark * 100}%`, width: 2 }} />
            <span className="absolute font-mono text-[12px] text-white whitespace-nowrap -translate-x-1/2" style={{ left: `${mark * 100}%`, top: -21 }}>{markLabel}</span>
        </div>
    </button>
);

export const DosePanel = ({ step, onStep }: { step: number; onStep: (s: number) => void }) => (
    <div className={`${CARD} p-3 flex flex-col gap-2`} style={CARD_BG}>
        <div className="flex items-center justify-between">
            <span className="font-mono text-[12px] uppercase tracking-widest text-gray-300">Via e dose decidem</span>
            <span className="font-mono text-[12px] text-gray-400">esquema sem escala</span>
        </div>
        <Lane icon={Wind} title="Inalatório (asma)" active={step === 1} color={C.green} mark={0.68} markLabel={`limiar WADA ${DOSE.inhaledLimit}`}
            fill={0.45} verdict="abaixo do limiar" onClick={() => onStep(1)} />
        <Lane icon={Pill} title="Oral (sistêmico)" active={step === 2} color={C.amber} mark={0.4} markLabel={DOSE.oral}
            fill={0.86} verdict="supraterapêutico" onClick={() => onStep(2)} />
    </div>
);
