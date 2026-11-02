import { motion, useReducedMotion } from 'framer-motion';
import { Beef, FlaskConical, Microscope, ScanSearch } from 'lucide-react';
import { useState } from 'react';
import { C, PK } from './content';

/**
 * Passo 5: detecção do clembuterol. Em cima, o caminho da contaminação alimentar até a
 * Gestão de Resultados; embaixo, uma régua log de concentração (ng/mL e pg/mL) com o
 * MRPL de 0,2 ng/mL e o limite de notificação de 5 ng/mL do cartão.
 */

const W = 700;
const H = 248;
const RL = 70;
const RR = 632;
const RY = 146;
const LOG_MIN = -3; // 0,001 ng/mL = 1 pg/mL
const LOG_MAX = 1.3; // ~20 ng/mL
const xOf = (ng: number) => RL + ((Math.log10(ng) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * (RR - RL);
const ngFromU = (u: number) => 10 ** (LOG_MIN + u * (LOG_MAX - LOG_MIN));

const fmt = (v: number, digits: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: 0 });
const fmtNg = (ng: number) => fmt(ng, ng < 0.01 ? 4 : ng < 0.1 ? 3 : ng < 1 ? 2 : 1);
const fmtPg = (ng: number) => fmt(ng * 1000, ng * 1000 < 10 ? 1 : 0);

const NG_TICKS = [0.001, 0.01, 0.1, 1, 10] as const;

const FLOW = [
    { icon: Beef, title: 'Porcos / bois', lines: ['China, México', 'aumento de carne magra'], color: C.red },
    { icon: FlaskConical, title: 'Contaminação', lines: ['alimentar', '(histórico mundial)'], color: C.amber },
    { icon: Microscope, title: 'Amostra', lines: ['frações de', 'picogramas'], color: C.clen },
    { icon: ScanSearch, title: 'Gestão de Resultados', lines: ['rastreabilidade', 'isotópica'], color: C.cyan },
] as const;

const FlowRow = () => (
    <div className="grid gap-3 items-stretch" style={{ gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }}>
        {FLOW.map((f, i) => {
            const Icon = f.icon;
            return (
                <motion.div key={f.title} className="relative rounded-xl border px-3 py-2.5"
                    style={{ borderColor: `${f.color}77`, background: `${f.color}12` }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.25, duration: 0.35 }}>
                    <div className="flex items-center gap-2">
                        <Icon size={18} style={{ color: f.color }} />
                        <span className="font-display text-[15px] font-semibold text-white leading-tight">{f.title}</span>
                    </div>
                    {f.lines.map(l => <div key={l} className="text-[13px] text-gray-200 leading-snug mt-0.5">{l}</div>)}
                    {i < FLOW.length - 1 && (
                        <span className="absolute top-1/2 -translate-y-1/2 font-mono text-[16px] text-gray-300" style={{ right: -13 }}>›</span>
                    )}
                </motion.div>
            );
        })}
    </div>
);

export const DetectionScene = () => {
    const reduced = useReducedMotion() ?? false;
    const [u, setU] = useState(0.35);
    const ng = ngFromU(u);
    const x = xOf(ng);
    const xMrpl = xOf(PK.mrplNgMl);
    const xNotify = xOf(PK.notifyNgMl);
    const vsMrpl = ng < PK.mrplNgMl ? 'abaixo' : 'acima';
    const vsNotify = ng < PK.notifyNgMl ? 'abaixo' : 'acima';
    return (
        <div className="flex flex-col h-full gap-2">
            <div className="flex items-center justify-between px-1">
                <span className="font-display text-[16px] font-semibold text-white">Clembuterol na urina: da carne ao laudo</span>
                <span className="font-mono text-[12px] text-gray-300">régua em escala log</span>
            </div>
            <FlowRow />
            <div className="flex-1 min-h-0 relative">
                <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 w-full h-full block" role="img"
                    aria-label="Régua de concentração de 1 picograma a 20 nanogramas por mililitro, com o MRPL de 0,2 ng/mL e o limite de notificação de 5 ng/mL">
                    {/* faixa < 5 ng/mL */}
                    <motion.rect x={RL} y={RY - 52} height={64} rx={8} fill="rgba(245,158,11,0.12)" stroke="rgba(245,158,11,0.45)"
                        initial={{ width: 0 }} animate={{ width: xNotify - RL }} transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 0.6, ease: 'easeOut' }} />
                    <text x={RL + 10} y={RY - 34} className="font-body" fontSize={13.5} fontWeight={700} fill="#FDE68A">limite de notificação &lt; 5 ng/mL</text>
                    <text x={RL + 10} y={RY - 17} className="font-body" fontSize={13} fill="#FEF3C7">em carnes de países de risco</text>

                    {/* régua */}
                    <line x1={RL} x2={RR} y1={RY} y2={RY} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                    {NG_TICKS.map(t => (
                        <g key={t}>
                            <line x1={xOf(t)} x2={xOf(t)} y1={RY - 6} y2={RY + 6} stroke="#E5E7EB" strokeWidth={1.5} />
                            <text x={xOf(t)} y={RY + 26} textAnchor="middle" className="font-mono" fontSize={13} fill="#F3F4F6">{fmt(t, 3)}</text>
                            <text x={xOf(t)} y={RY + 46} textAnchor="middle" className="font-mono" fontSize={12} fill="#C4B5FD">{fmt(t * 1000, 0)}</text>
                        </g>
                    ))}
                    <text x={RR + 8} y={RY + 26} className="font-mono" fontSize={12} fill="#F3F4F6">ng/mL</text>
                    <text x={RR + 8} y={RY + 46} className="font-mono" fontSize={12} fill="#C4B5FD">pg/mL</text>
                    {/* chave dos picogramas */}
                    <path d={`M ${xOf(0.001)} ${RY + 58} L ${xOf(0.001)} ${RY + 64} L ${xOf(0.999)} ${RY + 64} L ${xOf(0.999)} ${RY + 58}`} fill="none" stroke="#C4B5FD" strokeWidth={1.4} />
                    <text x={(xOf(0.001) + xOf(0.999)) / 2} y={RY + 84} textAnchor="middle" className="font-body" fontSize={13} fill="#DDD6FE">frações de picogramas (1 pg = 0,001 ng)</text>

                    {/* MRPL */}
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 1.2, duration: 0.4 }}>
                        <line x1={xMrpl} x2={xMrpl} y1={RY - 112} y2={RY + 10} stroke={C.red} strokeWidth={3} />
                        <rect x={xMrpl - 104} y={RY - 132} width={208} height={22} rx={6} fill={C.red} />
                        <text x={xMrpl} y={RY - 116} textAnchor="middle" className="font-mono" fontSize={13} fontWeight={700} fill="#fff">MRPL 0,2 ng/mL</text>
                        <text x={xMrpl + 8} y={RY - 92} className="font-body" fontSize={13.5} fontWeight={700} fill="#FDA4AF">Zero Tolerância</text>
                    </motion.g>
                    {/* 5 ng/mL */}
                    <line x1={xNotify} x2={xNotify} y1={RY - 60} y2={RY + 10} stroke={C.amber} strokeWidth={3} />
                    <text x={xNotify + 8} y={RY - 64} className="font-mono" fontSize={13} fontWeight={700} fill="#FDE68A">5 ng/mL</text>

                    {/* amostra (cursor) */}
                    <g pointerEvents="none">
                        <path d={`M ${x - 9} ${RY - 22} L ${x + 9} ${RY - 22} L ${x} ${RY - 6} Z`} fill="#F9FAFB" />
                        <circle cx={x} cy={RY} r={6} fill="#F9FAFB" stroke={C.clen} strokeWidth={2} />
                    </g>
                </svg>
            </div>
            <div className="flex items-center gap-4 pt-2 border-t border-white/10">
                <span className="font-mono text-[12px] uppercase tracking-widest text-gray-300 shrink-0">amostra</span>
                <input type="range" min={0} max={1} step={0.002} value={u} onChange={e => setU(Number(e.target.value))}
                    aria-label="Concentração de clembuterol na amostra" className="flex-1 cursor-pointer" style={{ accentColor: C.clen }} />
                <span className="text-[14px] text-white shrink-0 text-right" style={{ width: 330 }}>
                    <strong className="font-mono">{fmtNg(ng)} ng/mL</strong>
                    <span className="text-gray-300"> = {fmtPg(ng)} pg/mL</span>
                    <span className="block text-[13px] text-gray-200">{vsMrpl} do MRPL de 0,2 · {vsNotify} de 5 ng/mL</span>
                </span>
            </div>
        </div>
    );
};
