import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import {
    DEL_TEXT, DOPING_STEP, GENOTYPES, NORMAL_TEXT, TE_RESULT, stepText,
    type Genotype, type StepText, type TextPart,
} from './content';

/** Painel lateral: texto do passo (o do slide original) + genótipos / laudo / comparação. */

interface SidePanelProps {
    readonly step: number;
    readonly genotype: Genotype;
    readonly onGenotype: (g: Genotype) => void;
}

const CARD = 'rounded-2xl border border-white/10';
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const Paragraph = ({ parts }: { parts: readonly TextPart[] }) => (
    <p className="text-[14px] leading-[1.5] text-gray-200">
        {parts.map((p, i) => (p.strong ? <strong key={i} className="text-white font-semibold">{p.text}</strong> : <span key={i}>{p.text}</span>))}
    </p>
);

const PopulationPill = ({ text, danger }: { text: string; danger: boolean }) => (
    <span className="inline-block rounded-md px-2 py-0.5 text-[13px] font-semibold"
        style={danger
            ? { background: 'rgba(225,29,72,0.22)', color: '#fff', border: '1px solid rgba(225,29,72,0.5)' }
            : { background: 'rgba(255,255,255,0.10)', color: '#F3F4F6', border: '1px solid rgba(255,255,255,0.18)' }}>
        {text}
    </span>
);

const StepCard = ({ text, danger }: { text: StepText; danger: boolean }) => (
    <motion.div key={text.title} className={`${CARD} p-3.5`} style={CARD_BG}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
        <div className="font-display text-[18px] font-semibold leading-tight" style={{ color: text.color }}>{text.title}</div>
        <div className="font-mono text-[12px] uppercase tracking-widest text-gray-300 mt-0.5">{text.subtitle}</div>
        {text.pill && <div className="mt-2"><PopulationPill text={text.pill} danger={danger} /></div>}
        <div className="mt-2 space-y-2">
            {text.paragraphs.map((parts, i) => <Paragraph key={i} parts={parts} />)}
        </div>
    </motion.div>
);

/** Passos 0–2: os dois genótipos, com a população e o destino da testosterona. */
const GenotypeList = ({ genotype, onGenotype }: { genotype: Genotype; onGenotype: (g: Genotype) => void }) => (
    <div className="space-y-2">
        {GENOTYPES.map(g => {
            const active = g.id === genotype;
            const t = g.id === 'normal' ? NORMAL_TEXT : DEL_TEXT;
            return (
                <button key={g.id} type="button" onClick={() => onGenotype(g.id)}
                    className="w-full text-left rounded-xl px-3 py-2.5 border transition-colors cursor-pointer"
                    style={{ borderColor: active ? `${g.color}99` : 'rgba(255,255,255,0.1)', background: active ? `${g.color}14` : 'rgba(255,255,255,0.02)' }}>
                    <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-[15px] font-semibold text-white">{t.title}</span>
                        <span className="font-mono text-[12px] uppercase tracking-wider" style={{ color: g.id === 'del' ? '#FDA4AF' : '#A5F3FC' }}>{t.subtitle}</span>
                    </div>
                    <div className="mt-1.5"><PopulationPill text={t.pill ?? ''} danger={g.id === 'del'} /></div>
                </button>
            );
        })}
    </div>
);

const Verdict = ({ genotype }: { genotype: Genotype }) => {
    const r = TE_RESULT[genotype];
    const detected = genotype === 'normal';
    const color = detected ? '#E11D48' : '#F59E0B';
    return (
        <div className="rounded-xl border p-3" style={{ borderColor: `${color}99`, background: `linear-gradient(160deg, ${color}26, rgba(8,8,18,0.6) 75%)` }}>
            <div className="flex items-center gap-2" style={{ color: detected ? '#FDA4AF' : '#FCD34D' }}>
                {detected ? <ShieldAlert size={18} /> : <AlertTriangle size={18} />}
                <span className="font-display text-[16px] font-bold">{r.verdict}</span>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-[30px] font-bold leading-none" style={{ color: detected ? '#FB7185' : '#6EE7B7' }}>T/E {r.label}</span>
            </div>
            <div className="text-[13px] text-gray-200 mt-1">limite WADA 4:1</div>
        </div>
    );
};

/** Passo 4: gene normal × deleção lado a lado. */
const Comparison = ({ genotype }: { genotype: Genotype }) => (
    <div className="grid grid-cols-2 gap-2">
        {GENOTYPES.map(g => {
            const r = TE_RESULT[g.id];
            const t = g.id === 'normal' ? NORMAL_TEXT : DEL_TEXT;
            const detected = g.id === 'normal';
            const active = g.id === genotype;
            return (
                <div key={g.id} className="rounded-xl border p-2.5 flex flex-col gap-1.5"
                    style={{ borderColor: active ? `${detected ? '#E11D48' : '#F59E0B'}aa` : 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}>
                    <span className="font-display text-[14px] font-semibold text-white leading-tight">{t.title}</span>
                    <span className="font-mono text-[24px] font-bold leading-none" style={{ color: detected ? '#FB7185' : '#6EE7B7' }}>
                        {r.label.split(' ')[0]}
                        {detected && <span className="block text-[14px] mt-0.5">ou mais</span>}
                    </span>
                    <span className="text-[14px] font-bold" style={{ color: detected ? '#FDA4AF' : '#FCD34D' }}>{r.verdict}</span>
                    <span className="text-[13px] text-gray-200">testosterona → <strong className="text-white">{detected ? 'urina' : 'fezes'}</strong></span>
                    <span className="text-[13px] leading-snug" style={{ color: detected ? '#E5E7EB' : '#FECDD3' }}>{t.pill}</span>
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
        <div className="flex flex-col gap-3 h-full min-h-0">
            <AnimatePresence mode="wait">
                <StepCard key={`${step}-${text.title}`} text={text} danger={doping && genotype === 'del'} />
            </AnimatePresence>
            <AnimatePresence mode="wait">
                <motion.div key={bottomKey} className={`${CARD} p-3 flex-1`} style={CARD_BG}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                    <div className="font-mono text-[12px] uppercase tracking-widest text-gray-300 mb-2">
                        {step >= 4 ? 'Mesmo doping, dois genótipos' : doping ? 'Laudo da urina' : 'Genótipo'}
                    </div>
                    {step >= 4 ? <Comparison genotype={genotype} /> : doping ? <Verdict genotype={genotype} /> : <GenotypeList genotype={genotype} onGenotype={onGenotype} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
