import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CircleCheck } from 'lucide-react';
import {
    DEL_TEXT, DOPING_STEP, GENOTYPES, NORMAL_TEXT, TE_RESULT, stepText,
    type Genotype, type StepText, type TextPart,
} from './content';
import { DETECTED_COLOR, MISSED_COLOR } from './Readouts';

/** Painel lateral: texto do passo (o do slide original) + genótipos / laudo / comparação. */

interface SidePanelProps {
    readonly step: number;
    readonly genotype: Genotype;
    readonly onGenotype: (g: Genotype) => void;
}

const CARD = 'rounded-2xl border border-white/10';
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const Paragraph = ({ parts }: { parts: readonly TextPart[] }) => (
    <p className="text-[15px] leading-[1.45] text-gray-100">
        {parts.map((p, i) => (p.strong ? <strong key={i} className="text-white font-semibold">{p.text}</strong> : <span key={i}>{p.text}</span>))}
    </p>
);

const PopulationPill = ({ text, danger }: { text: string; danger: boolean }) => (
    <span className="inline-block rounded-md px-2 py-0.5 text-[14px] font-semibold"
        style={danger
            ? { background: 'rgba(225,29,72,0.22)', color: '#fff', border: '1px solid rgba(225,29,72,0.5)' }
            : { background: 'rgba(255,255,255,0.10)', color: '#F3F4F6', border: '1px solid rgba(255,255,255,0.18)' }}>
        {text}
    </span>
);

const StepCard = ({ text, danger }: { text: StepText; danger: boolean }) => (
    <motion.div key={text.title} className={`${CARD} p-3`} style={CARD_BG}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
        <div className="font-display text-[19px] font-semibold leading-tight" style={{ color: text.color }}>{text.title}</div>
        <div className="font-mono text-[14px] uppercase tracking-wider text-gray-300 mt-0.5">{text.subtitle}</div>
        {text.pill && <div className="mt-2"><PopulationPill text={text.pill} danger={danger} /></div>}
        <div className="mt-1.5 space-y-1.5">
            {text.paragraphs.map((parts, i) => <Paragraph key={i} parts={parts} />)}
        </div>
    </motion.div>
);

/** Passos 0–2: os dois genótipos, com a população e o destino da testosterona. */
const GenotypeList = ({ genotype, onGenotype }: { genotype: Genotype; onGenotype: (g: Genotype) => void }) => (
    <div className="space-y-1.5">
        {GENOTYPES.map(g => {
            const active = g.id === genotype;
            const t = g.id === 'normal' ? NORMAL_TEXT : DEL_TEXT;
            return (
                <button key={g.id} type="button" onClick={() => onGenotype(g.id)}
                    className="w-full text-left rounded-xl px-3 py-2 border transition-colors cursor-pointer"
                    style={{ borderColor: active ? `${g.color}99` : 'rgba(255,255,255,0.1)', background: active ? `${g.color}14` : 'rgba(255,255,255,0.02)' }}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                        <span className="font-display text-[16px] font-semibold text-white">{t.title}</span>
                        <span className="font-mono text-[14px] uppercase tracking-wide" style={{ color: g.id === 'del' ? '#FDA4AF' : '#A5F3FC' }}>{t.subtitle}</span>
                    </div>
                    <div className="mt-1"><PopulationPill text={t.pill ?? ''} danger={g.id === 'del'} /></div>
                </button>
            );
        })}
    </div>
);

/** Doping detectado = ciano + ✓; falso negativo (o caso perigoso) = âmbar + ⚠. */
const Verdict = ({ genotype }: { genotype: Genotype }) => {
    const r = TE_RESULT[genotype];
    const detected = genotype === 'normal';
    const color = detected ? DETECTED_COLOR : MISSED_COLOR;
    return (
        <div className="rounded-xl border p-3" style={{ borderColor: `${color}aa`, background: `linear-gradient(160deg, ${color}26, rgba(8,8,18,0.6) 75%)` }}>
            <div className="flex items-center gap-2" style={{ color: detected ? '#67E8F9' : '#FCD34D' }}>
                {detected ? <CircleCheck size={20} strokeWidth={2.4} /> : <AlertTriangle size={20} strokeWidth={2.4} />}
                <span className="font-display text-[17px] font-bold">{r.verdict}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-[30px] font-bold leading-none whitespace-nowrap" style={{ color: detected ? '#67E8F9' : '#FCD34D' }}>
                    T/E {r.label.split(' ')[0]}
                    {detected && <span className="ml-2 text-[18px]">ou mais</span>}
                </span>
            </div>
            <div className="text-[15px] text-gray-200 mt-1">limite WADA 4:1</div>
        </div>
    );
};

/** Passo 4: gene normal × deleção, um cartão por linha (valor grande, apoio em 14 px). */
const Comparison = ({ genotype }: { genotype: Genotype }) => (
    <div className="flex flex-col gap-1.5">
        {GENOTYPES.map(g => {
            const r = TE_RESULT[g.id];
            const t = g.id === 'normal' ? NORMAL_TEXT : DEL_TEXT;
            const detected = g.id === 'normal';
            const active = g.id === genotype;
            const ink = detected ? '#67E8F9' : '#FCD34D';
            return (
                <div key={g.id} className="rounded-xl border px-3 py-1.5 flex flex-col gap-0.5"
                    style={{ borderColor: active ? `${detected ? DETECTED_COLOR : MISSED_COLOR}aa` : 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}>
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="font-display text-[16px] font-semibold text-white leading-tight">{t.title}</span>
                        <span className="font-mono text-[28px] font-bold leading-none whitespace-nowrap" style={{ color: ink }}>
                            {r.label.split(' ')[0]}
                            {detected && <span className="ml-1.5 text-[14px]">ou mais</span>}
                        </span>
                    </div>
                    <span className="flex items-center gap-1.5 text-[15px] font-bold leading-tight" style={{ color: ink }}>
                        {detected ? <CircleCheck size={16} strokeWidth={2.6} className="shrink-0" /> : <AlertTriangle size={16} strokeWidth={2.6} className="shrink-0" />}
                        {r.verdict}
                    </span>
                    <span className="text-[14px] leading-snug text-gray-200">testosterona → <strong className="text-white">{detected ? 'urina' : 'fezes'}</strong></span>
                    <span className="text-[14px] leading-snug" style={{ color: '#E5E7EB' }}>{t.pill}</span>
                </div>
            );
        })}
    </div>
);

export const SidePanel = ({ step, genotype, onGenotype }: SidePanelProps) => {
    const text = stepText(step, genotype);
    const doping = step >= DOPING_STEP;
    const bottomKey = step >= 4 ? 'cmp' : doping ? `v-${genotype}` : 'list';
    return (
        <div className="flex flex-col gap-2.5 h-full min-h-0">
            <AnimatePresence mode="wait">
                <StepCard key={`${step}-${text.title}`} text={text} danger={doping && genotype === 'del'} />
            </AnimatePresence>
            <AnimatePresence mode="wait">
                <motion.div key={bottomKey} className={`${CARD} p-2 flex-1`} style={CARD_BG}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                    <div className="font-mono text-[14px] uppercase tracking-wider text-gray-300 mb-1.5">
                        {step >= 4 ? 'Mesmo doping, dois genótipos' : doping ? 'Laudo da urina' : 'Genótipo'}
                    </div>
                    {step >= 4 ? <Comparison genotype={genotype} /> : doping ? <Verdict genotype={genotype} /> : <GenotypeList genotype={genotype} onGenotype={onGenotype} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
