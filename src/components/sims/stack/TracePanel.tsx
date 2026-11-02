import { motion } from 'framer-motion';
import { PIECES } from './content';

const BODY = 'var(--font-body), sans-serif';
const MONO = 'var(--font-mono), monospace';
const DISPLAY = 'var(--font-display), sans-serif';

const W = 720;
const H = 350;
const X0 = 178;
const X1 = 696;
const MIN = 1;
const HOUR = 60;
const DAY = 1440;
/** Fim do eixo: ~5 meses (em minutos), para caber o rótulo de 3 meses. */
const AXIS_MAX = 150 * DAY;

/** Tempo após a dose (min) → x, em escala logarítmica. */
const tx = (min: number): number => X0 + (Math.log10(min) / Math.log10(AXIS_MAX)) * (X1 - X0);

const TICKS: readonly { min: number; label: string }[] = [
    { min: MIN, label: '1 min' },
    { min: HOUR, label: '1 h' },
    { min: DAY, label: '1 dia' },
    { min: 7 * DAY, label: '1 sem' },
    { min: 90 * DAY, label: '3 meses' },
];

interface Lane {
    readonly half: readonly [number, number];
    /** Fim sólido da janela de detecção e fim do esmaecimento (faixa). */
    readonly detect: readonly [number, number];
    readonly detectLabel: string;
}

/** Âncoras da aula: T½ e janela de detecção do StackOlimpicoDisplay; insulina "indetectável em horas" (cartão). */
const LANES: readonly Lane[] = [
    { half: [7 * DAY, 10 * DAY], detect: [90 * DAY, 90 * DAY], detectLabel: 'detecção: 3 meses' },
    { half: [15, 20], detect: [DAY, 2 * DAY], detectLabel: 'detecção: 24–48 h' },
    { half: [4, 6], detect: [6, 3 * HOUR], detectLabel: '' },
];

const LANE_Y = [78, 170, 262];
const BAR_H = 16;
const AXIS_Y = 318;

/** Linha do tempo comparando meia-vida e janela de detecção das três peças. */
export const TracePanel = ({ reduced }: { readonly reduced: boolean }) => (
    <div className="flex h-full flex-col px-6 pb-3 pt-5">
        <div className="flex items-start justify-between gap-4">
            <div>
                <div className="font-mono text-[13px] uppercase tracking-[0.16em] text-gray-300">Perfil de rastro</div>
                <div className="mt-1 font-display text-[24px] font-semibold leading-tight text-white">Quanto tempo cada peça deixa rastro</div>
            </div>
            <div className="flex flex-col items-end gap-1 pt-1 font-mono text-[12.5px] text-gray-200">
                <span className="flex items-center gap-2">
                    <span className="inline-block h-3 w-7 rounded-sm" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.9), rgba(255,255,255,0.25))' }} /> janela de detecção
                </span>
                <span className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M7 1 L13 7 L7 13 L1 7 Z" fill="#fff" /></svg> meia-vida (T½)
                </span>
                <span className="text-gray-300">eixo: tempo após a dose (log)</span>
            </div>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 min-h-0 w-full flex-1" role="img" aria-label="Linha do tempo das janelas de detecção">
            <defs>
                {PIECES.map((p, i) => (
                    <linearGradient key={p.id} id={`trace-${p.id}`} x1={X0} x2={tx(LANES[i].detect[1])} y1={0} y2={0} gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor={p.color} stopOpacity={0.95} />
                        <stop offset={`${((tx(LANES[i].detect[0]) - X0) / Math.max(tx(LANES[i].detect[1]) - X0, 1)) * 100}%`} stopColor={p.color} stopOpacity={i === 2 ? 0.55 : 0.8} />
                        <stop offset="100%" stopColor={p.color} stopOpacity={i === 0 ? 0.8 : 0} />
                    </linearGradient>
                ))}
            </defs>

            {TICKS.map(t => (
                <g key={t.label}>
                    <line x1={tx(t.min)} x2={tx(t.min)} y1={30} y2={AXIS_Y} stroke="rgba(255,255,255,0.13)" strokeDasharray="3 5" />
                    <text x={tx(t.min)} y={AXIS_Y + 22} textAnchor="middle" fontFamily={MONO} fontSize={13} fill="#D1D5DB">{t.label}</text>
                </g>
            ))}
            <line x1={X0} x2={X1} y1={AXIS_Y} y2={AXIS_Y} stroke="rgba(255,255,255,0.4)" />

            {PIECES.map((p, i) => {
                const lane = LANES[i];
                const y = LANE_Y[i];
                const end = tx(lane.detect[1]);
                const hx0 = tx(lane.half[0]);
                const hx1 = tx(lane.half[1]);
                const hm = (hx0 + hx1) / 2;
                const delay = reduced ? 0 : 0.2 + i * 0.35;
                return (
                    <g key={p.id}>
                        <text x={4} y={y - 2} fontFamily={DISPLAY} fontSize={20} fontWeight={700} fill={p.color}>{p.name}</text>
                        <text x={4} y={y + 19} fontFamily={MONO} fontSize={13} fill={p.soft}>{p.role}</text>

                        <rect x={X0} y={y - BAR_H / 2} width={X1 - X0} height={BAR_H} rx={BAR_H / 2} fill="rgba(255,255,255,0.04)" />
                        <motion.rect
                            x={X0} y={y - BAR_H / 2} width={end - X0} height={BAR_H} rx={BAR_H / 2}
                            fill={`url(#trace-${p.id})`}
                            style={{ originX: 0 }}
                            initial={reduced ? false : { scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                        />
                        {/* Meia-vida: faixa + losango */}
                        <rect x={hx0 - 1} y={y - BAR_H / 2 - 6} width={Math.max(hx1 - hx0, 2) + 2} height={BAR_H + 12} rx={3} fill="#fff" opacity={0.22} />
                        <path d={`M${hm} ${y - 9} L${hm + 9} ${y} L${hm} ${y + 9} L${hm - 9} ${y} Z`} fill="#fff" stroke={p.color} strokeWidth={2} />
                        <text x={hm} y={y - 20} textAnchor="middle" fontFamily={MONO} fontSize={13} fontWeight={600} fill="#fff">T½ {p.half}</text>

                        {lane.detectLabel && (
                            <motion.text
                                x={Math.min(end, X1)} y={y + 30} textAnchor="end" fontFamily={MONO} fontSize={13} fontWeight={600} fill={p.soft}
                                initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.7 }}
                            >
                                {lane.detectLabel}
                            </motion.text>
                        )}
                        {i === 2 && (
                            <motion.g initial={reduced ? false : { opacity: 0, scale: 1.25 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: delay + 0.8, duration: 0.5 }} style={{ originX: '575px', originY: `${y}px` }}>
                                <rect x={470} y={y - 22} width={210} height={44} rx={8} fill="rgba(225,29,72,0.14)" stroke="#E11D48" strokeWidth={2.5} />
                                <text x={575} y={y + 7} textAnchor="middle" fontFamily={DISPLAY} fontSize={21} fontWeight={700} letterSpacing="0.08em" fill="#FECDD3">INDETECTÁVEL</text>
                                <text x={tx(lane.detect[1])} y={y + 32} textAnchor="middle" fontFamily={BODY} fontSize={14} fill="#FDA4AF">em horas após a injeção</text>
                            </motion.g>
                        )}
                    </g>
                );
            })}
        </svg>
    </div>
);
