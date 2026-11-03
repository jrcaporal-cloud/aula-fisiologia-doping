import { motion } from 'framer-motion';
import { AlertTriangle, Check, ShieldCheck } from 'lucide-react';
import {
    MARKERS, MIN_BASELINE, fmt, markerValue,
    type Analysis, type Protocol, type Sample, type SlotAnalysis,
} from './model';

export interface SidePanelProps {
    readonly protocol: Protocol;
    readonly analysis: Analysis;
    readonly visibleCount: number;
    /** Coleta destacada (mouse) ou a mais recente. */
    readonly focus: number;
    readonly step: number;
    readonly verdictOn: boolean;
}

const RED = '#E11D48';

const Pill = ({ ok, okText, badText }: { ok: boolean; okText: string; badText: string }) => (
    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[14px] font-semibold"
        style={ok
            ? { background: 'rgba(16,185,129,0.14)', color: '#6EE7B7', border: '1px solid rgba(16,185,129,0.35)' }
            : { background: 'rgba(225,29,72,0.16)', color: '#FDA4AF', border: '1px solid rgba(225,29,72,0.5)' }}>
        {ok ? <Check size={14} strokeWidth={3} /> : <AlertTriangle size={14} strokeWidth={2.5} />}
        {ok ? okText : badText}
    </span>
);

const Readout = ({ sample, k, slot, verdictOn }: { sample: Sample | null; k: number; slot: SlotAnalysis | null; verdictOn: boolean }) => (
    <div className="grid grid-cols-3 gap-2">
        {MARKERS.map(m => {
            const out = sample !== null && slot !== null && verdictOn && slot.flagged && slot.tunnelOut[m.id];
            return (
                <div key={m.id} className="rounded-xl px-2.5 py-1.5 border"
                    style={{ borderColor: out ? 'rgba(225,29,72,0.55)' : 'rgba(255,255,255,0.09)', background: out ? 'rgba(225,29,72,0.10)' : 'rgba(255,255,255,0.03)' }}>
                    <div className="text-[14px] font-mono uppercase tracking-wider" style={{ color: m.color }}>
                        {m.id === 'hb' ? 'Hb' : m.id === 'ret' ? '%Ret' : 'OFF'}
                    </div>
                    <motion.div key={`${k}-${m.id}-${sample ? markerValue(sample, m.id) : 'x'}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="font-mono text-[22px] leading-tight font-bold" style={{ color: out ? '#FDA4AF' : '#F9FAFB' }}>
                        {sample ? fmt(markerValue(sample, m.id), m.decimals) : '—'}
                    </motion.div>
                </div>
            );
        })}
    </div>
);

const Verdicts = ({ slot, step, verdictOn }: { slot: SlotAnalysis | null; step: number; verdictOn: boolean }) => {
    const fixedOut = slot !== null && (slot.fixedOut.hb || slot.fixedOut.ret || slot.fixedOut.off);
    const tunnelLine = (() => {
        if (slot === null) return <span className="text-[14px] text-gray-300">—</span>;
        if (slot.baselineN < MIN_BASELINE) {
            return <span className="text-[14px] text-gray-200">em formação (mín. {MIN_BASELINE})</span>;
        }
        if (!verdictOn && step === 2) {
            return (
                <motion.span className="text-[14px] font-semibold text-gray-200" animate={{ opacity: [0.45, 1, 0.45] }} transition={{ duration: 1.6, repeat: Infinity }}>
                    em análise…
                </motion.span>
            );
        }
        return <Pill ok={!slot.flagged} okText="dentro do túnel" badText="ATF" />;
    })();

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] text-gray-200">Limite fixo populacional</span>
                {slot === null ? <span className="text-[14px] text-gray-300">—</span> : <Pill ok={!fixedOut} okText="dentro" badText="fora" />}
            </div>
            <div className="flex items-center justify-between gap-2">
                <span className="text-[14px] text-gray-200">Túnel individual</span>
                {tunnelLine}
            </div>
        </div>
    );
};

const Comparison = ({ sample, slot }: { sample: Sample; slot: SlotAnalysis }) => (
    <table className="w-full text-[14px] border-separate" style={{ borderSpacing: '0 3px' }}>
        <thead>
            <tr className="text-[14px] text-gray-300">
                <th className="text-left font-medium" />
                <th className="text-left font-medium">Limite fixo</th>
                <th className="text-left font-medium">Túnel</th>
            </tr>
        </thead>
        <tbody>
            {MARKERS.map(m => (
                <tr key={m.id}>
                    <td className="font-mono font-bold pr-1" style={{ color: m.color }}>
                        {m.id === 'hb' ? 'Hb' : m.id === 'ret' ? '%Ret' : 'OFF'} {fmt(markerValue(sample, m.id), m.decimals)}
                    </td>
                    <td className={slot.fixedOut[m.id] ? 'text-rose-300 font-semibold' : 'text-gray-200'}>
                        {slot.fixedOut[m.id] ? '⚠ fora' : '✓ não detecta'}
                    </td>
                    <td className={slot.tunnelOut[m.id] ? 'text-rose-300 font-bold' : 'text-gray-200'}>
                        {slot.tunnelOut[m.id] ? '⚠ fora' : '✓ dentro'}
                    </td>
                </tr>
            ))}
        </tbody>
    </table>
);

export const SidePanel = ({ protocol, analysis, visibleCount, focus, step, verdictOn }: SidePanelProps) => {
    const hasSample = visibleCount > 0 && focus >= 0;
    const slot = hasSample ? analysis.slots[focus] : null;
    const sample = hasSample ? protocol.samples[focus] : null;
    const flag = verdictOn ? analysis.firstFlag : null;
    const finished = step >= 3 && visibleCount >= protocol.samples.length;

    return (
        <div className="flex flex-col gap-3">
            <div className="rounded-2xl border border-white/10 p-3" style={{ background: 'rgba(8,8,18,0.72)' }}>
                <div className="flex items-baseline justify-between mb-2">
                    <span className="font-display text-[16px] font-semibold text-white">
                        {hasSample ? `Coleta Ex.${focus + 1}` : 'Sem coletas'}
                    </span>
                    <span className="text-[14px] font-mono text-gray-200">base: {analysis.currentN} {analysis.currentN === 1 ? 'exame' : 'exames'}</span>
                </div>
                <Readout sample={sample} k={focus} slot={slot} verdictOn={verdictOn} />
                <div className="mt-2.5"><Verdicts slot={slot} step={step} verdictOn={verdictOn} /></div>
            </div>

            {flag !== null ? (
                <motion.div key={`atf-${protocol.id}`} className="rounded-2xl border p-3"
                    style={{ borderColor: 'rgba(225,29,72,0.6)', background: 'linear-gradient(160deg, rgba(225,29,72,0.20), rgba(8,8,18,0.85) 70%)', boxShadow: '0 0 40px rgba(225,29,72,0.18)' }}
                    initial={{ opacity: 0, y: 14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
                    <div className="flex items-center justify-between gap-2" style={{ color: '#FDA4AF' }}>
                        <span className="flex items-center gap-2">
                            <AlertTriangle size={20} strokeWidth={2.5} />
                            <span className="font-display text-[16px] font-bold">Achado Atípico (ATF)</span>
                        </span>
                        <span className="font-mono text-[14px] font-bold">Ex.{flag + 1}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2.5">
                        <span className="font-mono text-[32px] font-bold leading-none" style={{ color: RED, textShadow: '0 0 18px rgba(225,29,72,0.55)' }}>&gt;99,9%</span>
                        <span className="text-[14px] text-rose-100 leading-tight">de improbabilidade de desvio natural</span>
                    </div>
                    <div className="mt-1.5"><Comparison sample={protocol.samples[flag]} slot={analysis.slots[flag]} /></div>
                    <p className="text-[14px] text-gray-100 leading-snug mt-1">
                        Valor normal para outra pessoa, anormal <strong className="text-white">para este atleta</strong>.
                    </p>
                </motion.div>
            ) : finished ? (
                <motion.div key="clean-final" className="rounded-2xl border p-3"
                    style={{ borderColor: 'rgba(16,185,129,0.45)', background: 'linear-gradient(160deg, rgba(16,185,129,0.14), rgba(8,8,18,0.85) 70%)' }}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <div className="flex items-center gap-2 text-emerald-300">
                        <ShieldCheck size={20} />
                        <span className="font-display text-[16px] font-bold">Sem achado atípico</span>
                    </div>
                    <p className="text-[15px] text-gray-100 leading-snug mt-2">
                        Todas as coletas ficaram dentro do túnel individual. O atleta é seu próprio controle.
                    </p>
                    <p className="text-[14px] text-gray-200 leading-snug mt-2">Troque o protocolo acima para ver a manipulação.</p>
                </motion.div>
            ) : (
                <motion.div key={`desc-${protocol.id}`} className="rounded-2xl border border-white/10 p-3" style={{ background: 'rgba(8,8,18,0.72)' }}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: protocol.color, boxShadow: `0 0 10px ${protocol.color}` }} />
                        <span className="font-display text-[16px] font-semibold text-white">{protocol.label}</span>
                    </div>
                    <p className="text-[15px] text-gray-100 leading-snug mt-2">{protocol.description}</p>
                    {protocol.id === 'transfusao' && (
                        <p className="text-[14px] text-amber-200 leading-snug mt-2">
                            Calcanhar de Aquiles do ABP: exige no mínimo 3 amostras basais e coleta oportuna.
                        </p>
                    )}
                </motion.div>
            )}
        </div>
    );
};
