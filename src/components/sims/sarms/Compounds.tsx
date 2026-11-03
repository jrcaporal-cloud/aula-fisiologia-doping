import { motion } from 'framer-motion';
import { Activity, Droplets, FlaskConical } from 'lucide-react';
import { ALERT, COLORS, COMPOUNDS, TAG_LABEL, type Compound, type SideEffectTag } from './content';

/** Passo 3: as três fichas comparáveis (Ação, Aparência Clínica, Colateral Subestimado — texto do slide). */

const TAG_ICON: Record<SideEffectTag, typeof Activity> = {
    lipidico: Droplets,
    hpg: Activity,
    figado: FlaskConical,
};

const LEVEL_LABELS = ['Moderada', 'Alta', 'Muito Alta'] as const;

const ActionMeter = ({ level, color }: { level: 1 | 2 | 3; color: string }) => (
    <div className="flex items-center gap-1" aria-label={`Ação: ${LEVEL_LABELS[level - 1]}`}>
        {[1, 2, 3].map(k => (
            <span key={k} className="h-3 w-10 rounded-full" style={{ background: k <= level ? color : 'rgba(255,255,255,0.12)' }} />
        ))}
    </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
        <div className="font-mono text-[14px] uppercase tracking-wider text-gray-200 mb-1">{label}</div>
        {children}
    </div>
);

const Card = ({ c, index }: { c: Compound; index: number }) => {
    const Icon = TAG_ICON[c.tag];
    return (
        <motion.div className="rounded-2xl border px-4 py-3 flex flex-col gap-2 min-h-0"
            style={{ background: 'rgba(8,8,18,0.72)', borderColor: `${c.color}55`, borderLeft: `3px solid ${c.color}` }}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 * index, duration: 0.45, ease: 'easeOut' }}>
            <div className="flex items-baseline justify-between gap-2">
                <span className="font-display font-bold leading-none" style={{ color: c.color, fontSize: 28 }}>
                    <span className="font-mono text-[15px] text-gray-200" style={{ marginRight: 8 }}>{c.n}.</span>{c.name}
                </span>
                <span className="font-mono text-[14px] px-2 py-0.5 rounded-md border border-white/20 text-gray-100">{c.code}</span>
            </div>
            <Field label="Ação">
                <div className="flex items-center gap-3">
                    <ActionMeter level={c.level} color={c.color} />
                    <span className="font-display text-[18px] font-semibold text-white">{c.action}</span>
                </div>
                <p className="text-[16px] leading-snug text-gray-100 mt-1 min-h-[44px]">{c.actionNote}</p>
            </Field>
            <Field label="Aparência Clínica">
                <p className="text-[16px] leading-snug text-gray-100">{c.clinical}</p>
            </Field>
            <div className="mt-auto rounded-xl border px-3 py-2" style={{ borderColor: 'rgba(248,113,113,0.5)', background: 'rgba(225,29,72,0.10)' }}>
                <div className="font-mono text-[14px] uppercase tracking-wide text-rose-200 whitespace-nowrap mb-1">Colateral Subestimado</div>
                <span className="inline-flex items-center gap-1 whitespace-nowrap text-[14px] font-semibold text-rose-100 px-1.5 py-0.5 rounded-md mb-1" style={{ background: 'rgba(225,29,72,0.28)' }}>
                    <Icon size={15} /> {TAG_LABEL[c.tag]}
                </span>
                <p className="leading-snug min-h-[66px]" style={{ color: '#FECACA', fontSize: 16 }}>{c.sideEffect}</p>
            </div>
        </motion.div>
    );
};

export const Compounds = () => (
    <div className="flex flex-col gap-3 h-full">
        <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
            {COMPOUNDS.map((c, i) => <Card key={c.code} c={c} index={i} />)}
        </div>
        <motion.div className="shrink-0 flex items-center justify-center gap-3 rounded-xl border px-4 py-1.5"
            style={{ borderColor: 'rgba(225,29,72,0.45)', background: 'rgba(225,29,72,0.08)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }}>
            <span className="font-display text-[22px] font-bold" style={{ color: COLORS.rose }}>{ALERT.range}</span>
            <span className="font-display text-[16px] text-white">{ALERT.text}</span>
        </motion.div>
    </div>
);
