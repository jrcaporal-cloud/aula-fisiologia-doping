import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertOctagon, Droplets } from 'lucide-react';
import { useEffect, useState } from 'react';
import { C, CLEN_CASES, GW_RISK, PK, type StepText } from './content';

/** Coluna direita: texto do cartão + um painel por passo. */

const CARD = 'rounded-2xl border border-white/10';
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };
const BADGE = 'text-[12px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40';
const BADGE_BG = { background: 'rgba(245,158,11,0.10)' };

export const TextCard = ({ text, grow }: { text: StepText; grow?: boolean }) => (
    <AnimatePresence mode="wait">
        <motion.div key={`${text.kicker}-${text.title}`} className={`${CARD} p-4 ${grow ? 'flex-1 min-h-0' : ''}`} style={CARD_BG}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
            <div className="font-mono text-[12px] uppercase tracking-widest" style={{ color: text.color }}>{text.kicker}</div>
            <div className="font-display text-[20px] font-semibold leading-tight text-white mt-1">{text.title}</div>
            <div className="mt-2 space-y-2">
                {text.paras.map(p => (
                    <p key={p.text} className="text-[14px] text-gray-200" style={{ lineHeight: 1.45 }}>
                        {p.lead && <strong className="text-white font-semibold">{p.lead} </strong>}{p.text}
                    </p>
                ))}
            </div>
        </motion.div>
    </AnimatePresence>
);

export const CasesPanel = () => (
    <div className={`${CARD} p-4`} style={CARD_BG}>
        <p className="text-[14px] text-gray-200"><strong className="text-white">{CLEN_CASES.lead}</strong> {CLEN_CASES.text}</p>
        <div className="font-mono text-[12px] uppercase tracking-widest text-gray-300 mt-3">Casos famosos</div>
        <div className="mt-2 flex flex-col gap-2">
            {CLEN_CASES.cases.map((c, i) => (
                <motion.div key={c.name} className="flex items-start gap-3 rounded-xl px-3 py-2 border"
                    style={{ borderColor: `${C.clen}55`, background: `${C.clen}10` }}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.2, duration: 0.35 }}>
                    <span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: C.clen }} />
                    <div>
                        <div className="font-display text-[16px] font-semibold text-white">{c.name}</div>
                        {c.note && <div className="text-[13px] text-rose-100">{c.note}</div>}
                    </div>
                </motion.div>
            ))}
        </div>
    </div>
);

/** Os dois t½ lado a lado em escala linear (horas). */
const H_MAX = 40;
export const HalfLifeBars = () => {
    const pct = (h: number) => `${(h / H_MAX) * 100}%`;
    const rows = [
        { name: 'Clembuterol', color: C.clen, ink: '#FECDD3', from: PK.clenHalfLifeH, to: PK.clenHalfLifeH, label: `~${PK.clenHalfLifeH} h` },
        { name: 'Salbutamol', color: C.salb, ink: '#A7F3D0', from: PK.salbHalfLifeMinH, to: PK.salbHalfLifeMaxH, label: `~${PK.salbHalfLifeMinH} a ${PK.salbHalfLifeMaxH} h` },
    ];
    return (
        <div className={`${CARD} p-4`} style={CARD_BG}>
            <div className="flex items-center justify-between">
                <span className="font-display text-[15px] font-semibold text-white">Meia-vida, lado a lado</span>
                <span className="font-mono text-[12px] text-gray-300">escala linear</span>
            </div>
            <div className="mt-3 flex flex-col gap-3">
                {rows.map((r, i) => (
                    <div key={r.name}>
                        <div className="flex items-baseline justify-between">
                            <span className="text-[14px] font-semibold" style={{ color: r.color }}>{r.name}</span>
                            <span className="font-mono text-[14px] font-bold" style={{ color: r.ink }}>{r.label}</span>
                        </div>
                        <div className="relative mt-1 h-3.5 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
                            <motion.div className="absolute top-0 bottom-0 left-0 rounded-full" style={{ background: r.color }}
                                initial={{ width: 0 }} animate={{ width: pct(r.from) }} transition={{ duration: 0.9, delay: 0.3 + i * 0.25, ease: 'easeOut' }} />
                            {r.to > r.from && (
                                <motion.div className="absolute top-0 bottom-0 rounded-r-full" style={{ left: pct(r.from), background: `${r.color}66` }}
                                    initial={{ width: 0 }} animate={{ width: `${((r.to - r.from) / H_MAX) * 100}%` }} transition={{ duration: 0.4, delay: 1.2 }} />
                            )}
                        </div>
                    </div>
                ))}
                <div className="relative h-4 font-mono text-[12px] text-gray-300">
                    {[0, 10, 20, 30, 40].map(h => (
                        <span key={h} className={`absolute whitespace-nowrap ${h === 0 ? '' : h === H_MAX ? '-translate-x-full' : '-translate-x-1/2'}`} style={{ left: pct(h) }}>{h} h</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

/** Copo de urina: mesma quantidade de droga, menos água → urina mais concentrada (a alegação da defesa). */
const jitter = (k: number, salt: number) => (Math.sin(k * 12.9898 + salt * 78.233) * 43758.5453) % 1 * 0.3;
const DOTS = Array.from({ length: 16 }, (_, k) => ({ fx: (k % 4 + 0.5 + jitter(k, 1)) / 4, fy: (Math.floor(k / 4) + 0.5 + jitter(k, 2)) / 4 }));
const CUP = { x: 22, w: 118, bottom: 150, full: 112, low: 56 } as const;

export const UrinePanel = () => {
    const reduced = useReducedMotion() ?? false;
    const [dry, setDry] = useState(false);
    useEffect(() => {
        if (reduced) return undefined;
        const id = window.setTimeout(() => setDry(true), 1800);
        return () => window.clearTimeout(id);
    }, [reduced]);
    const level = dry ? CUP.low : CUP.full;
    const top = CUP.bottom - level;
    const t = { duration: reduced ? 0 : 1.1, ease: 'easeInOut' as const };
    return (
        <div className={`${CARD} px-4 pt-3 pb-3 flex-1 min-h-0 flex flex-col`} style={CARD_BG}>
            <div className="flex items-center justify-between gap-2">
                <span className="font-display text-[15px] font-semibold text-white">Limite urinário</span>
                <span className={BADGE} style={BADGE_BG}>esquema</span>
            </div>
            <div className="flex-1 min-h-0 relative mt-1">
                <svg viewBox="0 0 352 176" className="absolute inset-0 w-full h-full block" role="img"
                    aria-label="Copo de urina com a mesma quantidade de salbutamol em menos água; ao lado, a amostra de Froome perto de 2 vezes o limite">
                    {/* copo */}
                    <path d={`M ${CUP.x} 30 L ${CUP.x + 6} ${CUP.bottom} Q ${CUP.x + 8} ${CUP.bottom + 8} ${CUP.x + 16} ${CUP.bottom + 8} L ${CUP.x + CUP.w - 16} ${CUP.bottom + 8} Q ${CUP.x + CUP.w - 8} ${CUP.bottom + 8} ${CUP.x + CUP.w - 6} ${CUP.bottom} L ${CUP.x + CUP.w} 30`}
                        fill="none" stroke="#E5E7EB" strokeOpacity={0.7} strokeWidth={2} />
                    <motion.rect x={CUP.x + 7} width={CUP.w - 14} rx={6} fill="#FCD34D"
                        initial={false} animate={{ y: top, height: level + 4, fillOpacity: dry ? 0.5 : 0.22 }} transition={t} />
                    {DOTS.map((d, k) => (
                        <motion.circle key={k} r={4} fill={C.salb} stroke="#fff" strokeWidth={0.8} cx={CUP.x + 18 + d.fx * (CUP.w - 36)}
                            initial={false} animate={{ cy: top + 10 + d.fy * (level - 16) }} transition={t} />
                    ))}
                    <text x={CUP.x + CUP.w / 2} y={18} textAnchor="middle" className="font-body" fontSize={13} fill="#F3F4F6">mesma quantidade</text>

                    {/* régua: limite × amostra de Froome */}
                    <g transform="translate(196 0)">
                        <text x={0} y={18} className="font-mono" fontSize={12} fill="#E5E7EB">CONCENTRAÇÃO NA URINA</text>
                        <rect x={10} y={30} width={14} height={128} rx={7} fill="rgba(255,255,255,0.07)" />
                        <motion.rect x={10} width={14} rx={7} fill={C.red}
                            initial={{ y: 158, height: 0 }} animate={{ y: 158 - 118, height: 118 }} transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : 0.4, ease: 'easeOut' }} />
                        <line x1={2} x2={34} y1={98} y2={98} stroke="#fff" strokeWidth={2.4} />
                        <text x={40} y={95} className="font-body" fontSize={14} fontWeight={700} fill="#fff">limite</text>
                        <text x={40} y={111} className="font-mono" fontSize={13} fill="#D1D5DB">1×</text>
                        <text x={40} y={44} className="font-body" fontSize={14} fontWeight={700} fill="#FDA4AF">Froome</text>
                        <text x={40} y={60} className="font-body" fontSize={13} fill="#FECDD3">quase 2x</text>
                    </g>
                </svg>
            </div>
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setDry(v => !v)} aria-pressed={dry}
                    className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold border cursor-pointer transition-colors"
                    style={dry ? { borderColor: '#F59E0Baa', background: 'rgba(245,158,11,0.14)', color: '#FDE68A' } : { borderColor: 'rgba(255,255,255,0.2)', color: '#E5E7EB' }}>
                    <Droplets size={14} /> {dry ? 'desidratação' : 'hidratação normal'}
                </button>
                <span className="text-[13px] text-gray-200 leading-snug">menos água concentra a urina: a alegação de Froome</span>
            </div>
        </div>
    );
};

export const RiskPanel = () => (
    <motion.div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(225,29,72,0.6)', background: 'linear-gradient(160deg, rgba(225,29,72,0.2), rgba(8,8,18,0.72) 75%)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
        <div className="flex items-center gap-2 text-rose-200">
            <AlertOctagon size={18} />
            <span className="font-display text-[17px] font-bold">{GW_RISK.lead}</span>
        </div>
        <p className="text-[14px] mt-1.5" style={{ color: '#FFF1F2', lineHeight: 1.45 }}>{GW_RISK.text}</p>
        <p className="text-[14px] mt-1.5 text-gray-200" style={{ lineHeight: 1.45 }}><em>{GW_RISK.tail}</em></p>
    </motion.div>
);
