import { motion, useReducedMotion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { DUR, EASE_IN_OUT, EASE_OUT, stagger } from '../../../lib/motion';
import { SUBSTANCE } from '../../../lib/palette';
import { TONE_COLOR, type LabRow, type Reference } from './types';

/** Faixa de referência ("dentro da faixa"): azul permitido, nunca verde (daltonismo). */
const REF_FILL = 'rgba(56,189,248,0.26)';
const REF_BORDER = 'rgba(56,189,248,0.75)';

interface LabPanelProps {
    readonly rows: readonly LabRow[];
    readonly layout: 'grid' | 'list';
    readonly step: number;
    /** id da linha → índices das frases da hipótese que ela sustenta (vazio = sem destaque). */
    readonly evidence: ReadonlyMap<string, readonly number[]>;
    /** Cor do caso: os números de evidência (1, 2, 3…) usam a cor do caso; o número é o que distingue. */
    readonly accent: string;
}

const pct = (v: number, [a, b]: readonly [number, number]) => Math.min(100, Math.max(0, ((v - a) / (b - a)) * 100));

const isOut = (row: LabRow) =>
    row.reference !== undefined && row.numeric !== undefined && (row.numeric < row.reference.low || row.numeric > row.reference.high);

const Badges = ({ ids, accent }: { ids: readonly number[]; accent: string }) => (
    <span className="flex items-center gap-1">
        {ids.map(i => (
            <motion.span key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 22, delay: stagger(i, 0.15, 0.12) }}
                className="w-[24px] h-[24px] rounded-full flex items-center justify-center font-mono text-[14px] font-bold"
                style={{ background: accent, color: '#0b0b14' }}>
                {i + 1}
            </motion.span>
        ))}
    </span>
);

const Flag = ({ text, color }: { text: string; color: string }) => (
    <span className="font-mono text-[14px] font-bold uppercase tracking-wide px-1.5 py-[1px] rounded border"
        style={{ color, borderColor: `${color}88`, background: `${color}1a` }}>
        {text}
    </span>
);

const Pending = () => {
    const reduce = useReducedMotion();
    return (
        <motion.span className="font-mono text-[14px] text-gray-300 px-2 py-0.5 rounded border border-dashed border-white/25"
            animate={reduce ? { opacity: 0.8 } : { opacity: [0.55, 1, 0.55] }}
            transition={reduce ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: EASE_IN_OUT }}>
            aguardando
        </motion.span>
    );
};

/** Régua com a faixa de referência do slide e o valor do atleta. */
const Ruler = ({ value, reference, shown, out, delay }: { value: number; reference: Reference; shown: boolean; out: boolean; delay: number }) => {
    const lo = pct(reference.low, reference.domain);
    const hi = pct(reference.high, reference.domain);
    const x = pct(value, reference.domain);
    const markColor = out ? '#E11D48' : '#F3F4F6';
    return (
        <div className="relative h-[42px] mt-1 [container-type:inline-size]">
            <div className="absolute left-0 right-0 top-[8px] h-[8px] rounded-full bg-white/10" />
            <div className="absolute top-[6px] h-[12px] rounded-[4px]"
                style={{ left: `${lo}%`, width: `${hi - lo}%`, background: REF_FILL, border: `1px solid ${REF_BORDER}` }} />
            <span className="absolute top-[22px] font-mono text-[15px] -translate-x-1/2" style={{ left: `${lo}%`, color: '#7DD3FC' }}>{reference.lowLabel}</span>
            <span className="absolute top-[22px] font-mono text-[15px] -translate-x-1/2" style={{ left: `${hi}%`, color: '#7DD3FC' }}>{reference.highLabel}</span>
            {shown && (
                <motion.div className="absolute left-0 top-[2px] -ml-[10px] w-[20px] h-[20px] rounded-full border-2"
                    style={{ borderColor: '#0b0b14', background: markColor, boxShadow: out ? '0 0 0 4px rgba(225,29,72,0.28)' : 'none' }}
                    initial={{ x: `${hi}cqw`, opacity: 0 }} animate={{ x: `${x}cqw`, opacity: 1 }}
                    transition={{ duration: DUR.morph, delay, ease: EASE_OUT }} />
            )}
        </div>
    );
};

const rowBorder = (ids: readonly number[] | undefined, dim: boolean, accent: string) => {
    if (ids && ids.length > 0) return `${accent}cc`;
    return dim ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)';
};

const ListRow = ({ row, i, step, ids, dim, accent }: { row: LabRow; i: number; step: number; ids?: readonly number[]; dim: boolean; accent: string }) => {
    const shown = step >= 1;
    const out = isOut(row);
    const color = TONE_COLOR[row.tone];
    return (
        <motion.div className="rounded-xl border px-3.5 py-1.5" animate={{ opacity: dim ? 0.8 : 1, borderColor: rowBorder(ids, dim, accent) }}
            style={{ background: 'rgba(0,0,0,0.32)' }} transition={{ duration: DUR.morph, ease: EASE_OUT }}>
            <div className="flex items-center justify-between gap-3">
                <span className="text-[15px] font-semibold text-white">{row.label}</span>
                <span className="flex items-center gap-2">
                    {shown ? (
                        <motion.span className="flex items-center gap-2" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: DUR.enter, delay: stagger(i, 0, 0.12), ease: EASE_OUT }}>
                            <span className="font-mono text-[20px] font-bold leading-none" style={{ color }}>
                                {row.value}{row.unit && <span className="text-[14px] font-semibold ml-1">{row.unit}</span>}
                            </span>
                            {row.flag && <Flag text={row.flag} color={color} />}
                        </motion.span>
                    ) : <Pending />}
                    {ids && ids.length > 0 && <Badges ids={ids} accent={accent} />}
                </span>
            </div>
            {row.reference && row.numeric !== undefined ? (
                <Ruler value={row.numeric} reference={row.reference} shown={shown} out={out} delay={stagger(i, 0.25, 0.12)} />
            ) : (
                <div className="font-mono text-[15px] text-gray-300 mt-0.5">referência: {shown ? '—' : '…'}</div>
            )}
        </motion.div>
    );
};

const GridTile = ({ row, i, step, ids, dim, accent }: { row: LabRow; i: number; step: number; ids?: readonly number[]; dim: boolean; accent: string }) => {
    const shown = step >= 1;
    const color = TONE_COLOR[row.tone];
    return (
        <motion.div className="rounded-xl border px-4 py-3 flex flex-col gap-1.5 relative overflow-hidden"
            animate={{ opacity: dim ? 0.8 : 1, borderColor: rowBorder(ids, dim, accent) }} transition={{ duration: DUR.morph, ease: EASE_OUT }}
            style={{ background: 'rgba(0,0,0,0.32)' }}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: shown ? color : 'rgba(255,255,255,0.15)' }} />
            <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[14px] uppercase tracking-wide text-gray-200">{row.label}</span>
                {ids && ids.length > 0 && <Badges ids={ids} accent={accent} />}
            </div>
            <div className="flex-1 min-h-[46px] flex items-center">
                {shown ? (
                    <motion.span className="flex flex-col items-start gap-1 whitespace-nowrap" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: DUR.morph, delay: stagger(i, 0, 0.14), ease: EASE_OUT }}>
                        <span className="font-mono text-[38px] font-bold leading-none" style={{ color }}>{row.value}</span>
                        {row.unit && <span className="font-mono text-[18px] font-semibold leading-none" style={{ color }}>{row.unit}</span>}
                    </motion.span>
                ) : <Pending />}
            </div>
            <div className="h-[24px]">{row.flag && shown && <Flag text={row.flag} color={color} />}</div>
        </motion.div>
    );
};

/** Painel de exames do caso: régua com referência (quando o slide dá) ou bloco de valor. */
export const LabPanel = ({ rows, layout, step, evidence, accent }: LabPanelProps) => {
    // Só a hipótese (passo 3) separa as linhas que sustentam a frase; na lição nada fica apagado.
    const highlighting = evidence.size > 0 && step === 2;
    const noRef = rows.filter(r => !r.reference).length;
    return (
        <div className="flex flex-col h-full min-h-0">
            <div className={layout === 'grid' ? 'grid grid-cols-2 grid-rows-2 gap-2.5 flex-1 min-h-0' : 'flex flex-col gap-2'}>
                {rows.map((row, i) => {
                    const ids = evidence.get(row.id);
                    const dim = highlighting && !ids;
                    return layout === 'grid'
                        ? <GridTile key={row.id} row={row} i={i} step={step} ids={ids} dim={dim} accent={accent} />
                        : <ListRow key={row.id} row={row} i={i} step={step} ids={ids} dim={dim} accent={accent} />;
                })}
            </div>
            <div className="mt-auto pt-1.5 flex items-center gap-x-3.5 gap-y-0.5 flex-wrap text-[15px] text-gray-200">
                <span className="flex items-center gap-1.5"><FlaskConical size={15} /> valores do slide</span>
                {layout === 'list' && (
                    <span className="flex items-center gap-1.5">
                        <span className="w-3.5 h-2.5 rounded-[3px]" style={{ background: REF_FILL, border: `1px solid ${REF_BORDER}` }} />
                        faixa de referência
                    </span>
                )}
                {layout === 'list' && (
                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full" style={{ background: SUBSTANCE.risk }} />
                        fora da faixa
                    </span>
                )}
                {layout === 'grid' && noRef > 0 && <span>o caso não traz faixas de referência</span>}
            </div>
        </div>
    );
};
