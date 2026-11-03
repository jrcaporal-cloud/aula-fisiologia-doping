import { motion, useReducedMotion } from 'framer-motion';
import { ALERT, COLORS, SUBTITLE_PARTS } from './content';

/** Passo 0: o pote de "suplemento" que vira laudo positivo + 100 amostras suspeitas, 10–15 com SARM. */

const CARD = 'rounded-2xl border border-white/10';
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const COLS = 20;
const ROWS = 5;
const TUBE_W = 16;
const TUBE_H = 44;
const GAP_X = 9;
const GAP_Y = 14;

/** Tubos 0–9: SARM (10%); 10–14: faixa até 15%; o resto: amostras sem SARM. */
const tubeKind = (i: number): 'sure' | 'range' | 'clean' => (i < ALERT.low ? 'sure' : i < ALERT.high ? 'range' : 'clean');

/** Ordem de destaque espalhada pela grade (determinística), para não parecer uma barra. */
const SCATTER: readonly number[] = [7, 23, 41, 58, 66, 12, 84, 35, 95, 49, 3, 71, 28, 90, 54];

const TubeGrid = () => {
    const reduced = useReducedMotion() ?? false;
    const highlight = new Map(SCATTER.map((cell, rank) => [cell, rank]));
    const w = COLS * TUBE_W + (COLS - 1) * GAP_X;
    const h = ROWS * TUBE_H + (ROWS - 1) * GAP_Y;
    return (
        <svg viewBox={`-4 -4 ${w + 8} ${h + 8}`} className="absolute inset-0 w-full h-full block" role="img" aria-label="100 amostras suspeitas: 10 a 15 contêm SARMs">
            <defs>
                <pattern id="sarm-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <rect width="5" height="5" fill="rgba(225,29,72,0.18)" />
                    <line x1="0" y1="0" x2="0" y2="5" stroke="#FB7185" strokeWidth="2.2" />
                </pattern>
            </defs>
            {Array.from({ length: COLS * ROWS }, (_, cell) => {
                const x = (cell % COLS) * (TUBE_W + GAP_X);
                const y = Math.floor(cell / COLS) * (TUBE_H + GAP_Y);
                const rank = highlight.get(cell);
                const kind = rank === undefined ? 'clean' : tubeKind(rank);
                const fill = kind === 'sure' ? COLORS.red : kind === 'range' ? 'url(#sarm-hatch)' : 'rgba(253,230,138,0.22)';
                const delay = reduced ? 0 : 0.5 + (rank ?? 0) * 0.09;
                return (
                    <g key={cell} transform={`translate(${x} ${y})`}>
                        <rect x={0} y={0} width={TUBE_W} height={TUBE_H} rx={TUBE_W / 2} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.42)" strokeWidth={1} />
                        <rect x={-2} y={-3} width={TUBE_W + 4} height={6} rx={2} fill="rgba(255,255,255,0.35)" />
                        {kind === 'clean' ? (
                            <rect x={2} y={TUBE_H * 0.42} width={TUBE_W - 4} height={TUBE_H * 0.52} rx={(TUBE_W - 4) / 2} fill={fill} />
                        ) : (
                            <motion.rect x={2} y={TUBE_H * 0.18} width={TUBE_W - 4} height={TUBE_H * 0.76} rx={(TUBE_W - 4) / 2} fill={fill}
                                stroke={kind === 'sure' ? '#FDA4AF' : 'none'} strokeWidth={0.8}
                                style={{ originY: 1 }} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
                                transition={{ delay, duration: reduced ? 0 : 0.5, ease: 'easeOut' }} />
                        )}
                    </g>
                );
            })}
        </svg>
    );
};

/** Pote → urina → laudo (desenho em pixels reais: viewBox 446×214, sem redução). */
const RAIL = 'M 150 112 C 200 62, 270 62, 322 112';

const SupplementFlow = () => {
    const reduced = useReducedMotion() ?? false;
    return (
        <svg viewBox="0 0 446 214" className="absolute inset-0 w-full h-full block" role="img" aria-label="Pote de suplemento com SARM, amostra de urina positiva">
            <defs>
                <linearGradient id="sarm-pot" x1="0" x2="1">
                    <stop offset="0%" stopColor="#1f2937" />
                    <stop offset="50%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#111827" />
                </linearGradient>
                <linearGradient id="sarm-urine" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#FDE68A" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.6} />
                </linearGradient>
            </defs>

            {/* Pote */}
            <g transform="translate(4 6)">
                <rect x={14} y={0} width={108} height={24} rx={6} fill="#4B5563" stroke="#9CA3AF" strokeWidth={1.2} />
                <rect x={0} y={22} width={136} height={142} rx={16} fill="url(#sarm-pot)" stroke="#9CA3AF" strokeWidth={1.2} />
                <rect x={0} y={62} width={136} height={68} fill="rgba(16,185,129,0.18)" stroke="#34D399" strokeWidth={1} />
                <text x={68} y={90} textAnchor="middle" className="font-mono" fontSize={16} fontWeight={700} fill="#D1FAE5">SUPLEMENTO</text>
                <text x={68} y={113} textAnchor="middle" className="font-mono" fontSize={16} fill="#A7F3D0">cápsulas</text>
            </g>
            <text x={2} y={204} className="font-body" fontSize={16} fontWeight={600} fill="#A7F3D0">{SUBTITLE_PARTS.sold}</text>

            {/* Trilho da cápsula */}
            <path d={RAIL} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={1.6} strokeDasharray="5 6" />
            <path d="M 312 98 L 324 114 L 305 118" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.8} />
            <motion.g initial={{ offsetDistance: '0%' }}
                animate={reduced ? { offsetDistance: '55%' } : { offsetDistance: ['0%', '100%'] }}
                transition={{ duration: 2.4, repeat: reduced ? 0 : Infinity, ease: 'easeInOut', repeatDelay: 0.6 }}
                style={{ offsetPath: `path("${RAIL}")`, offsetRotate: '0deg' }}>
                <rect x={-14} y={-7} width={28} height={14} rx={7} fill="#34D399" />
                <rect x={0} y={-7} width={14} height={14} rx={7} fill={COLORS.red} />
                <rect x={-1} y={-7} width={7} height={14} fill={COLORS.red} />
            </motion.g>

            {/* Frasco de urina */}
            <g transform="translate(330 22)">
                <rect x={0} y={0} width={116} height={18} rx={5} fill="#E5E7EB" />
                <path d="M 10 18 L 106 18 L 100 150 Q 99 160 88 160 L 28 160 Q 17 160 16 150 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.5)" strokeWidth={1.2} />
                <path d="M 13 62 L 103 62 L 100 150 Q 99 160 88 160 L 28 160 Q 17 160 16 150 Z" fill="url(#sarm-urine)" />
                <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: reduced ? 0 : 1.2, duration: 0.4 }}
                    style={{ transformOrigin: '58px 100px' }}>
                    <rect x={8} y={84} width={100} height={32} rx={7} fill={COLORS.red} stroke="#FDA4AF" strokeWidth={1.2} />
                    <text x={58} y={106} textAnchor="middle" className="font-mono" fontSize={16} fontWeight={700} fill="#fff">SARM +</text>
                </motion.g>
            </g>
            <text x={444} y={204} textAnchor="end" className="font-body" fontSize={16} fontWeight={600} fill="#FDA4AF">{SUBTITLE_PARTS.caught}</text>
        </svg>
    );
};

export const Opening = () => (
    <div className="grid gap-3 h-full" style={{ gridTemplateColumns: '470px minmax(0,1fr)', gridTemplateRows: 'minmax(0,1fr)' }}>
        <div className="flex flex-col gap-3 min-h-0">
            <div className={`${CARD} px-5 py-3`} style={CARD_BG}>
                <motion.div className="font-display font-bold leading-none whitespace-nowrap" style={{ fontSize: 76, color: COLORS.rose }}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {ALERT.range}
                </motion.div>
                <p className="font-display text-[18px] leading-snug text-white mt-1.5">{ALERT.text}</p>
            </div>
            <div className={`${CARD} p-3 flex flex-col flex-1 min-h-0`} style={CARD_BG}>
                <div className="font-mono text-[14px] uppercase tracking-widest text-gray-200 px-1">Do pote ao laudo</div>
                <div className="flex-1 min-h-0 mt-1 relative"><SupplementFlow /></div>
            </div>
        </div>
        <div className={`${CARD} px-6 py-3 flex flex-col min-h-0`} style={CARD_BG}>
            <div className="font-display text-[18px] font-semibold text-white">100 amostras suspeitas</div>
            <div className="text-[15px] text-gray-200">laboratórios da WADA · em vermelho, as que contêm SARMs</div>
            <div className="flex-1 min-h-0 relative" style={{ margin: '10px 0' }}><TubeGrid /></div>
            <div className="flex items-center gap-5 text-[15px] text-gray-100">
                <span className="flex items-center gap-2"><span className="rounded-sm" style={{ width: 16, height: 16, background: COLORS.red }} /> 10 em 100</span>
                <span className="flex items-center gap-2">
                    <span className="rounded-sm border" style={{ width: 16, height: 16, borderColor: '#FDA4AF', background: 'repeating-linear-gradient(45deg,#FB7185 0 2px,rgba(225,29,72,0.18) 2px 5px)' }} />
                    até 15 em 100
                </span>
                <span className="ml-auto text-[14px] text-gray-200">cada tubo = 1% das amostras suspeitas</span>
            </div>
        </div>
    </div>
);
