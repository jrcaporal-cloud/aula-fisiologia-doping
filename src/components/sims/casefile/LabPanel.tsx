import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { TONE_COLOR, type LabRow, type Reference } from './types';

/** Cores dos números que ligam cada frase da hipótese às linhas de exame que a sustentam. */
export const EVIDENCE_COLORS = ['#60A5FA', '#F59E0B', '#A855F7', '#22D3EE'] as const;

interface LabPanelProps {
    readonly rows: readonly LabRow[];
    readonly layout: 'grid' | 'list';
    readonly step: number;
    /** id da linha → índices das frases da hipótese que ela sustenta (vazio = sem destaque). */
    readonly evidence: ReadonlyMap<string, readonly number[]>;
}

const pct = (v: number, [a, b]: readonly [number, number]) => Math.min(100, Math.max(0, ((v - a) / (b - a)) * 100));

const isOut = (row: LabRow) =>
    row.reference !== undefined && row.numeric !== undefined && (row.numeric < row.reference.low || row.numeric > row.reference.high);

const Badges = ({ ids }: { ids: readonly number[] }) => (
    <span className="flex items-center gap-1">
        {ids.map(i => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 22, delay: 0.15 + i * 0.12 }}
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center font-mono text-[12px] font-bold"
                style={{ background: EVIDENCE_COLORS[i % EVIDENCE_COLORS.length], color: '#0b0b14' }}>
                {i + 1}
            </motion.span>
        ))}
    </span>
);

const Flag = ({ text, color }: { text: string; color: string }) => (
    <span className="font-mono text-[12px] font-bold uppercase tracking-wider px-1.5 py-[2px] rounded border"
        style={{ color, borderColor: `${color}88`, background: `${color}1a` }}>
        {text}
    </span>
);

const Pending = () => (
    <motion.span className="font-mono text-[13px] text-gray-300 px-2 py-0.5 rounded border border-dashed border-white/25"
        animate={{ opacity: [0.55, 1, 0.55] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
        aguardando
    </motion.span>
);

/** Régua com a faixa de referência do slide e o valor do atleta. */
const Ruler = ({ value, reference, shown, out, delay }: { value: number; reference: Reference; shown: boolean; out: boolean; delay: number }) => {
    const lo = pct(reference.low, reference.domain);
    const hi = pct(reference.high, reference.domain);
    const x = pct(value, reference.domain);
    const markColor = out ? '#E11D48' : '#F3F4F6';
    return (
        <div className="relative h-[40px] mt-1.5">
            <div className="absolute left-0 right-0 top-[8px] h-[8px] rounded-full bg-white/10" />
            <div className="absolute top-[6px] h-[12px] rounded-[4px]"
                style={{ left: `${lo}%`, width: `${hi - lo}%`, background: 'rgba(16,185,129,0.30)', border: '1px solid rgba(52,211,153,0.75)' }} />
            <span className="absolute top-[22px] font-mono text-[12px] text-emerald-300 -translate-x-1/2" style={{ left: `${lo}%` }}>{reference.lowLabel}</span>
            <span className="absolute top-[22px] font-mono text-[12px] text-emerald-300 -translate-x-1/2" style={{ left: `${hi}%` }}>{reference.highLabel}</span>
            {shown && (
                <motion.div className="absolute top-[2px] -ml-[10px] w-[20px] h-[20px] rounded-full border-2"
                    style={{ borderColor: '#0b0b14', background: markColor, boxShadow: out ? '0 0 0 4px rgba(225,29,72,0.28), 0 0 18px rgba(225,29,72,0.8)' : '0 0 10px rgba(255,255,255,0.45)' }}
                    initial={{ left: `${hi}%`, opacity: 0 }} animate={{ left: `${x}%`, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 90, damping: 16, delay }} />
            )}
        </div>
    );
};

const rowBorder = (ids: readonly number[] | undefined, dim: boolean) => {
    if (ids && ids.length > 0) return `${EVIDENCE_COLORS[ids[0] % EVIDENCE_COLORS.length]}cc`;
    return dim ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)';
};

const ListRow = ({ row, i, step, ids, dim }: { row: LabRow; i: number; step: number; ids?: readonly number[]; dim: boolean }) => {
    const shown = step >= 1;
    const out = isOut(row);
    const color = TONE_COLOR[row.tone];
    return (
        <motion.div className="rounded-xl border px-3.5 py-2" animate={{ opacity: dim ? 0.7 : 1, borderColor: rowBorder(ids, dim) }}
            style={{ background: 'rgba(0,0,0,0.32)' }} transition={{ duration: 0.4 }}>
            <div className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-semibold text-white">{row.label}</span>
                <span className="flex items-center gap-2">
                    {shown ? (
                        <motion.span className="flex items-center gap-2" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.12 * i }}>
                            <span className="font-mono text-[20px] font-bold leading-none" style={{ color }}>
                                {row.value}{row.unit && <span className="text-[14px] font-semibold ml-1">{row.unit}</span>}
                            </span>
                            {row.flag && <Flag text={row.flag} color={color} />}
                        </motion.span>
                    ) : <Pending />}
                    {ids && ids.length > 0 && <Badges ids={ids} />}
                </span>
            </div>
            {row.reference && row.numeric !== undefined ? (
                <Ruler value={row.numeric} reference={row.reference} shown={shown} out={out} delay={0.25 + 0.12 * i} />
            ) : (
                <div className="font-mono text-[12px] text-gray-300 mt-1">referência: {shown ? '—' : '…'}</div>
            )}
        </motion.div>
    );
};

const GridTile = ({ row, i, step, ids, dim }: { row: LabRow; i: number; step: number; ids?: readonly number[]; dim: boolean }) => {
    const shown = step >= 1;
    const color = TONE_COLOR[row.tone];
    return (
        <motion.div className="rounded-xl border px-4 py-3.5 flex flex-col gap-2 relative overflow-hidden"
            animate={{ opacity: dim ? 0.7 : 1, borderColor: rowBorder(ids, dim) }} transition={{ duration: 0.4 }}
            style={{ background: 'rgba(0,0,0,0.32)' }}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: shown ? color : 'rgba(255,255,255,0.15)' }} />
            <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[13px] uppercase tracking-wider text-gray-200">{row.label}</span>
                {ids && ids.length > 0 && <Badges ids={ids} />}
            </div>
            <div className="flex-1 min-h-[46px] flex items-center gap-2 flex-wrap">
                {shown ? (
                    <motion.span className="flex items-baseline gap-2" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.45, delay: 0.14 * i }}>
                        <span className="font-mono text-[40px] font-bold leading-none" style={{ color, textShadow: `0 0 18px ${color}55` }}>{row.value}</span>
                        {row.unit && <span className="font-mono text-[17px] font-semibold" style={{ color }}>{row.unit}</span>}
                    </motion.span>
                ) : <Pending />}
            </div>
            <div className="h-[22px]">{row.flag && shown && <Flag text={row.flag} color={color} />}</div>
        </motion.div>
    );
};

/** Painel de exames do caso: régua com referência (quando o slide dá) ou bloco de valor. */
export const LabPanel = ({ rows, layout, step, evidence }: LabPanelProps) => {
    const highlighting = evidence.size > 0;
    const noRef = rows.filter(r => !r.reference).length;
    return (
        <div className="flex flex-col h-full min-h-0">
            <div className={layout === 'grid' ? 'grid grid-cols-2 grid-rows-2 gap-2.5 flex-1 min-h-0' : 'flex flex-col gap-2'}>
                {rows.map((row, i) => {
                    const ids = evidence.get(row.id);
                    const dim = highlighting && !ids;
                    return layout === 'grid'
                        ? <GridTile key={row.id} row={row} i={i} step={step} ids={ids} dim={dim} />
                        : <ListRow key={row.id} row={row} i={i} step={step} ids={ids} dim={dim} />;
                })}
            </div>
            <div className="mt-auto pt-2 flex items-center gap-3 flex-wrap text-[13px] text-gray-300">
                <span className="flex items-center gap-1.5"><FlaskConical size={14} /> valores e marcações do slide</span>
                {layout === 'list' && (
                    <span className="flex items-center gap-1.5">
                        <span className="w-4 h-2.5 rounded-[3px]" style={{ background: 'rgba(16,185,129,0.30)', border: '1px solid rgba(52,211,153,0.75)' }} />
                        faixa de referência
                    </span>
                )}
                {layout === 'list' && (
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ background: '#E11D48', boxShadow: '0 0 8px rgba(225,29,72,0.8)' }} />
                        fora da faixa
                    </span>
                )}
                {layout === 'grid' && noRef > 0 && <span>· o caso não traz faixas de referência</span>}
            </div>
        </div>
    );
};
