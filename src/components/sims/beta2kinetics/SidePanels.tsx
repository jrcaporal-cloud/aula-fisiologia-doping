import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertOctagon, Droplets } from 'lucide-react';
import { useEffect, useState } from 'react';
import { C, CLEN_CASES, GW_RISK, PK, type StepText } from './content';

/** Coluna direita: texto do cartão + um painel por passo. */

const CARD = 'rounded-2xl border border-white/10';
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const escapeRegExp = (value: string): string => value.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&');

/** Destaca (negrito) trechos do próprio texto; o conteúdo não muda. */
const Emphasized = ({ text, marks }: { text: string; marks?: readonly string[] }) => {
    if (!marks || marks.length === 0) return <>{text}</>;
    const pattern = new RegExp(`(${marks.map(escapeRegExp).join('|')})`);
    return (
        <>
            {text.split(pattern).map((part, i) => (marks.includes(part)
                ? <strong key={i} className="text-white font-semibold">{part}</strong>
                : <span key={i}>{part}</span>))}
        </>
    );
};

interface TextCardProps {
    readonly text: StepText;
    readonly grow?: boolean;
    /** Tamanho do corpo em px (maior quando o passo tem pouco texto). */
    readonly size?: number;
}

export const TextCard = ({ text, grow, size = 16 }: TextCardProps) => (
    <AnimatePresence mode="wait">
        <motion.div key={`${text.kicker}-${text.title}`} className={`${CARD} px-4 py-3 ${grow ? 'flex-1 min-h-0' : ''}`} style={CARD_BG}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
            <div className="font-mono text-[14px] uppercase tracking-wider" style={{ color: text.color }}>{text.kicker}</div>
            <div className="font-display text-[20px] font-semibold leading-tight text-white mt-1">{text.title}</div>
            <div className="mt-2 space-y-2">
                {text.paras.map(p => (
                    <p key={p.text} className="text-gray-100" style={{ fontSize: size, lineHeight: 1.4 }}>
                        {p.lead && <strong className="text-white font-semibold">{p.lead} </strong>}<Emphasized text={p.text} marks={p.marks} />
                    </p>
                ))}
            </div>
        </motion.div>
    </AnimatePresence>
);

export const CasesPanel = () => (
    <div className={`${CARD} px-4 py-3 flex-1 min-h-0 flex flex-col`} style={CARD_BG}>
        <p className="text-[16px] text-gray-100"><strong className="text-white">{CLEN_CASES.lead}</strong> {CLEN_CASES.text}</p>
        <div className="font-mono text-[14px] uppercase tracking-wider text-gray-200 mt-2">Casos famosos</div>
        <div className="mt-1.5 flex flex-col gap-1.5 flex-1 justify-center">
            {CLEN_CASES.cases.map((c, i) => (
                <motion.div key={c.name} className="flex items-start gap-3 rounded-xl px-3 py-1.5 border"
                    style={{ borderColor: `${C.clen}77`, background: `${C.clen}12` }}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.2, duration: 0.35 }}>
                    <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0" style={{ background: C.clen }} />
                    <div>
                        <div className="font-display text-[17px] font-semibold text-white leading-tight">{c.name}</div>
                        {c.note && <div className="text-[14.5px] text-rose-100 leading-snug">{c.note}</div>}
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
        { name: 'Clembuterol', color: C.clen, ink: '#FFE4E6', from: PK.clenHalfLifeH, to: PK.clenHalfLifeH, label: `~${PK.clenHalfLifeH} h` },
        { name: 'Salbutamol', color: C.salb, ink: '#A7F3D0', from: PK.salbHalfLifeMinH, to: PK.salbHalfLifeMaxH, label: `~${PK.salbHalfLifeMinH} a ${PK.salbHalfLifeMaxH} h` },
    ];
    return (
        <div className={`${CARD} px-4 py-3 flex-1 min-h-0 flex flex-col`} style={CARD_BG}>
            <div className="flex items-center justify-between">
                <span className="font-display text-[17px] font-semibold text-white">Meia-vida, lado a lado</span>
                <span className="font-mono text-[14px] text-gray-200">escala linear</span>
            </div>
            <div className="mt-3 flex flex-col gap-4 flex-1 justify-center">
                {rows.map((r, i) => (
                    <div key={r.name}>
                        <div className="flex items-baseline justify-between">
                            <span className="text-[16px] font-semibold" style={{ color: r.ink }}>{r.name}</span>
                            <span className="font-mono text-[16px] font-bold" style={{ color: r.ink }}>{r.label}</span>
                        </div>
                        <div className="relative mt-1.5 h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            <motion.div className="absolute top-0 bottom-0 left-0 rounded-full" style={{ background: r.color }}
                                initial={{ width: 0 }} animate={{ width: pct(r.from) }} transition={{ duration: 0.9, delay: 0.3 + i * 0.25, ease: 'easeOut' }} />
                            {r.to > r.from && (
                                <motion.div className="absolute top-0 bottom-0 rounded-r-full" style={{ left: pct(r.from), background: `${r.color}88` }}
                                    initial={{ width: 0 }} animate={{ width: `${((r.to - r.from) / H_MAX) * 100}%` }} transition={{ duration: 0.4, delay: 1.2 }} />
                            )}
                        </div>
                    </div>
                ))}
                <div className="relative h-5 font-mono text-[14px] text-gray-200">
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
const CUP = { x: 24, w: 112, top: 28, bottom: 128, full: 84, low: 42 } as const;

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
                <span className="font-display text-[17px] font-semibold text-white">Limite urinário</span>
                <button type="button" onClick={() => setDry(v => !v)} aria-pressed={dry}
                    className="shrink-0 whitespace-nowrap flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[14px] font-semibold border cursor-pointer transition-colors"
                    style={dry ? { borderColor: '#F59E0Baa', background: 'rgba(245,158,11,0.16)', color: '#FDE68A' } : { borderColor: 'rgba(255,255,255,0.3)', color: '#F3F4F6' }}>
                    <Droplets size={15} /> {dry ? 'desidratação' : 'hidratação normal'}
                </button>
            </div>
            <div className="flex-1 min-h-0 relative mt-1">
                <svg viewBox="0 0 400 152" className="absolute inset-0 w-full h-full block" role="img"
                    aria-label="Copo de urina com a mesma quantidade de salbutamol em menos água; ao lado, a amostra de Froome perto de 2 vezes o limite">
                    {/* copo */}
                    <path d={`M ${CUP.x} ${CUP.top} L ${CUP.x + 6} ${CUP.bottom} Q ${CUP.x + 8} ${CUP.bottom + 8} ${CUP.x + 16} ${CUP.bottom + 8} L ${CUP.x + CUP.w - 16} ${CUP.bottom + 8} Q ${CUP.x + CUP.w - 8} ${CUP.bottom + 8} ${CUP.x + CUP.w - 6} ${CUP.bottom} L ${CUP.x + CUP.w} ${CUP.top}`}
                        fill="none" stroke="#E5E7EB" strokeOpacity={0.8} strokeWidth={2} />
                    <motion.rect x={CUP.x + 7} width={CUP.w - 14} rx={6} fill="#FCD34D"
                        initial={false} animate={{ y: top, height: level + 4, fillOpacity: dry ? 0.5 : 0.22 }} transition={t} />
                    {DOTS.map((d, k) => (
                        <motion.circle key={k} r={4.5} fill={C.salb} stroke="#fff" strokeWidth={0.8} cx={CUP.x + 18 + d.fx * (CUP.w - 36)}
                            initial={false} animate={{ cy: top + 10 + d.fy * (level - 16) }} transition={t} />
                    ))}
                    <text x={CUP.x + CUP.w / 2} y={17} textAnchor="middle" className="font-body" fontSize={18} fill="#F9FAFB">mesma quantidade</text>

                    {/* régua: limite × amostra de Froome */}
                    <g transform="translate(178 0)">
                        <text x={0} y={17} className="font-mono" fontSize={17.5} fill="#F3F4F6">CONCENTRAÇÃO NA URINA</text>
                        <rect x={10} y={30} width={16} height={116} rx={8} fill="rgba(255,255,255,0.1)" />
                        <motion.rect x={10} width={16} rx={8} fill={C.red}
                            initial={{ y: 146, height: 0 }} animate={{ y: 146 - 106, height: 106 }} transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : 0.4, ease: 'easeOut' }} />
                        <line x1={2} x2={36} y1={92} y2={92} stroke="#fff" strokeWidth={2.6} />
                        <text x={44} y={92} className="font-body" fontSize={19} fontWeight={700} fill="#fff">limite</text>
                        <text x={44} y={113} className="font-mono" fontSize={19} fill="#E5E7EB">1×</text>
                        <text x={44} y={46} className="font-body" fontSize={19} fontWeight={700} fill="#FDA4AF">Froome</text>
                        <text x={44} y={65} className="font-body" fontSize={19} fill="#FFE4E6">quase 2x</text>
                    </g>
                </svg>
            </div>
            <p className="text-[15px] text-gray-100 leading-snug mt-1 text-center">menos água concentra a urina: a alegação de Froome</p>
        </div>
    );
};

export const RiskPanel = () => (
    <motion.div className="rounded-2xl border px-4 py-3 flex-1 min-h-0 flex flex-col justify-center" style={{ borderColor: 'rgba(225,29,72,0.65)', background: 'linear-gradient(160deg, rgba(225,29,72,0.2), rgba(8,8,18,0.72) 75%)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
        <div className="flex items-center gap-2 text-rose-200">
            <AlertOctagon size={20} />
            <span className="font-display text-[19px] font-bold">{GW_RISK.lead}</span>
        </div>
        <p className="text-[16px] mt-1.5" style={{ color: '#FFF1F2', lineHeight: 1.4 }}>{GW_RISK.text}</p>
        <p className="text-[16px] mt-1.5 text-gray-100" style={{ lineHeight: 1.4 }}><em>{GW_RISK.tail}</em></p>
    </motion.div>
);
