import { AnimatePresence, motion } from 'framer-motion';
import { TE_LIMIT, TE_RESULT, type Genotype } from './content';
import { CUP, GAUGE, GLUC_BOND, GLUC_PATH, MUSCLE, STEROID_OFFSET, STEROID_PATH, gaugeY } from './geometry';

/** Leituras do esquema: músculo (saturação), frasco de coleta, medidor T/E e carimbo do laudo. */

const RED = '#E11D48';
/** Doping detectado (o teste funcionou) = ciano com ✓; falso negativo (o perigoso) = âmbar com ⚠. */
export const DETECTED_COLOR = '#22D3EE';
export const MISSED_COLOR = '#F59E0B';
/** Borda direita (alinhada) das leituras sob o medidor: não corta no limite do viewBox. */
const READ_X = 752;
const EASE = [0.16, 1, 0.3, 1] as const;

export const Glyph = ({ x, y, s, conj }: { x: number; y: number; s: number; conj: boolean }) => (
    <g transform={`translate(${x} ${y}) scale(${s})`} style={{ color: conj ? '#67E8F9' : '#93C5FD' }}>
        <g transform={`translate(${STEROID_OFFSET[0]} ${STEROID_OFFSET[1]})`}>
            <path d={STEROID_PATH} fill="currentColor" fillOpacity={0.3} stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
            {conj && (
                <>
                    <path d={GLUC_BOND} stroke="#FCD34D" strokeWidth={1.6} />
                    <path d={GLUC_PATH} fill="#F59E0B" fillOpacity={0.75} stroke="#FDE68A" strokeWidth={1.3} />
                </>
            )}
        </g>
    </g>
);

const MUSCLE_SLOTS = [[-36, -6], [-14, -14], [10, -12], [32, -4], [-24, 10], [0, 4], [24, 12], [-4, 18], [44, 6]] as const;

/** Legenda das duas formas da molécula. */
export const Legend = () => (
    <g>
        <Glyph x={344} y={22} s={1} conj={false} />
        <text x={364} y={27} className="font-body" fontSize={15} fill="#BFDBFE">testosterona livre</text>
        <Glyph x={506} y={22} s={1} conj />
        <text x={540} y={27} className="font-body" fontSize={15} fill="#A5F3FC">+ ácido glucurônico</text>
        <text x={540} y={44} className="font-body" fontSize={15} fill="#D1D5DB">= solúvel em água</text>
    </g>
);

export const Muscle = ({ saturated }: { saturated: boolean }) => {
    const { x, y } = MUSCLE;
    return (
        <g>
            <path d={`M${x} 107 L ${x} 146`} stroke="#9f1239" strokeWidth={8} strokeLinecap="round" />
            <path d={`M${x - 62} ${y} C ${x - 40} ${y - 36} ${x + 40} ${y - 36} ${x + 62} ${y} C ${x + 40} ${y + 36} ${x - 40} ${y + 36} ${x - 62} ${y} Z`}
                fill="#7f1d1d" stroke="#fca5a5" strokeOpacity={0.45} strokeWidth={1.2} />
            {[-18, -9, 0, 9, 18].map(dy => (
                <path key={dy} d={`M${x - 52} ${y + dy * 0.4} C ${x - 20} ${y + dy * 1.2} ${x + 20} ${y + dy * 1.2} ${x + 52} ${y + dy * 0.4}`}
                    fill="none" stroke="#fca5a5" strokeOpacity={0.28} strokeWidth={1.2} />
            ))}
            <line x1={x - 74} x2={x - 60} y1={y} y2={y} stroke="#e5e7eb" strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />
            <line x1={x + 60} x2={x + 74} y1={y} y2={y} stroke="#e5e7eb" strokeOpacity={0.6} strokeWidth={3} strokeLinecap="round" />
            <AnimatePresence>
                {saturated && MUSCLE_SLOTS.map(([dx, dy], i) => (
                    <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.6 + i * 0.18, duration: 0.4 }}>
                        <Glyph x={x + dx} y={y + dy} s={0.6} conj={false} />
                    </motion.g>
                ))}
            </AnimatePresence>
            <text x={x} y={y + 50} textAnchor="middle" className="font-body" fontSize={16} fontWeight={700} fill="#FECACA">Músculo</text>
            <rect x={x - 50} y={y + 58} width={100} height={7} rx={3.5} fill="rgba(255,255,255,0.1)" />
            <motion.rect x={x - 50} y={y + 58} height={7} rx={3.5} fill="#60A5FA"
                initial={false} animate={{ width: saturated ? 100 : 0 }} transition={{ duration: 2.2, delay: 0.5, ease: 'easeOut' }} />
            <motion.text x={x} y={y + 82} textAnchor="middle" className="font-body" fontSize={15} fontWeight={600} fill="#93C5FD"
                initial={false} animate={{ opacity: saturated ? 1 : 0 }} transition={{ delay: 1.6 }}>
                supersaturado
            </motion.text>
        </g>
    );
};

const CUP_SLOTS = [[-12, 18], [10, 22], [-2, 32], [14, 36], [-14, 38]] as const;

export const Cup = ({ urine, positive }: { urine: boolean; positive: boolean }) => {
    const { x, y } = CUP;
    const body = `M${x - 26} ${y - 34} L ${x + 26} ${y - 34} L ${x + 21} ${y + 44} L ${x - 21} ${y + 44} Z`;
    return (
        <g>
            <defs><clipPath id="ug-cup-clip"><path d={body} /></clipPath></defs>
            <text x={x - 20} y={y - 54} textAnchor="start" className="font-body" fontSize={16} fontWeight={700} fill="#FDE68A">Frasco de coleta</text>
            <rect x={x - 30} y={y - 44} width={60} height={9} rx={2.5} fill="#E5E7EB" fillOpacity={0.85} />
            <path d={body} fill="rgba(255,255,255,0.06)" stroke="#E5E7EB" strokeOpacity={0.7} strokeWidth={1.4} />
            <g clipPath="url(#ug-cup-clip)">
                <motion.rect x={x - 30} y={0} width={60} height={80} fill="url(#ug-urine)"
                    initial={false} animate={{ y: urine ? y - 4 : y + 46 }} transition={{ duration: 1.4, ease: 'easeOut' }} />
            </g>
            <AnimatePresence>
                {positive && CUP_SLOTS.map(([dx, dy], i) => (
                    <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1 + i * 0.2 }}>
                        <Glyph x={x + dx} y={y + dy - 12} s={0.5} conj />
                    </motion.g>
                ))}
            </AnimatePresence>
        </g>
    );
};

interface GaugeProps {
    readonly on: boolean;
    readonly genotype: Genotype;
    /** Mostra a leitura (só com doping). */
    readonly reading: boolean;
    /** Contorno do outro genótipo para comparação. */
    readonly ghost: boolean;
}

export const TeGauge = ({ on, genotype, reading, ghost }: GaugeProps) => {
    const { x, w, top, bottom } = GAUGE;
    const cx = x + w / 2;
    const result = TE_RESULT[genotype];
    const other = TE_RESULT[genotype === 'normal' ? 'del' : 'normal'];
    const value = reading ? result.value : 0;
    const over = value > TE_LIMIT;
    const limitY = gaugeY(TE_LIMIT);
    return (
        <g opacity={on ? 1 : 0.8}>
            <text x={cx} y={top - 14} textAnchor="middle" className="font-body" fontSize={16} fontWeight={700} fill="#F9FAFB">Razão T/E</text>
            <rect x={x} y={top} width={w} height={bottom - top} rx={w / 2} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.3)" />
            {[0, 10, 20].map(v => (
                <g key={v}>
                    <line x1={x + w} x2={x + w + 5} y1={gaugeY(v)} y2={gaugeY(v)} stroke="rgba(255,255,255,0.6)" />
                    <text x={x + w + 8} y={gaugeY(v) + 4} className="font-mono" fontSize={17} fill="#E5E7EB">{v}</text>
                </g>
            ))}
            {ghost && (
                <motion.rect x={x + 2} width={w - 4} rx={(w - 4) / 2} fill="none" stroke="#E5E7EB" strokeOpacity={0.7} strokeDasharray="4 3"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} y={gaugeY(other.value)} height={bottom - 2 - gaugeY(other.value)} />
            )}
            <motion.rect x={x + 3} width={w - 6} rx={(w - 6) / 2} fill={over ? DETECTED_COLOR : MISSED_COLOR}
                initial={false}
                animate={{ y: gaugeY(value), height: Math.max(0, bottom - 3 - gaugeY(value)) }}
                transition={{ duration: 1.6, delay: reading ? 0.9 : 0, ease: EASE }}
                style={{ filter: `drop-shadow(0 0 6px ${over ? DETECTED_COLOR : MISSED_COLOR})` }} />
            {reading && over && (
                <motion.path d={`M${cx - 6} ${gaugeY(value) - 8} L ${cx} ${gaugeY(value) - 15} L ${cx + 6} ${gaugeY(value) - 8}`}
                    fill="none" stroke={DETECTED_COLOR} strokeWidth={2.4} strokeLinecap="round"
                    initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.4, 1] }} transition={{ delay: 2.4, duration: 1.4, repeat: Infinity, repeatType: 'reverse' }} />
            )}
            <line x1={x - 10} x2={x + w + 4} y1={limitY} y2={limitY} stroke={RED} strokeWidth={2} strokeDasharray="5 3" />
            <text x={x - 14} y={limitY + 18} textAnchor="end" className="font-mono" fontSize={16} fontWeight={700} fill="#FDA4AF"
                stroke="#050510" strokeWidth={3} paintOrder="stroke">limite 4:1</text>
            {on && !reading && (
                <text x={READ_X} y={bottom + 24} textAnchor="end" className="font-body" fontSize={16} fill="#E5E7EB">aguardando leitura</text>
            )}
            <AnimatePresence mode="wait">
                {reading && (
                    <motion.text key={genotype} x={READ_X} y={bottom + 24} textAnchor="end" className="font-mono" fontSize={16} fontWeight={700}
                        fill={over ? '#67E8F9' : '#FCD34D'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        transition={{ delay: 2.2, duration: 0.4 }}>
                        {result.label}
                    </motion.text>
                )}
            </AnimatePresence>
        </g>
    );
};

/** Ícones do carimbo: ✓ (detectado) e ⚠ (falso negativo), desenhados em (0,0). */
const StampIcon = ({ detected, color }: { detected: boolean; color: string }) => (
    detected ? (
        <g>
            <circle r={12} fill="none" stroke={color} strokeWidth={2.2} />
            <path d="M-6 0.5 L-1.5 5 L6.5 -4.5" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </g>
    ) : (
        <g>
            <path d="M0 -13 L13 10 L-13 10 Z" fill="none" stroke={color} strokeWidth={2.2} strokeLinejoin="round" />
            <path d="M0 -5 L0 3" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
            <circle cy={7} r={1.5} fill={color} />
        </g>
    )
);

/** Selo do laudo: fica na área livre entre o músculo e o medidor, sem cobrir ureteres, bexiga nem a coluna T/E. */
const STAMP_BOX = { x: 516, y: 264, w: 170, h: 66 } as const;

export const Stamp = ({ genotype }: { genotype: Genotype }) => {
    const detected = genotype === 'normal';
    const color = detected ? DETECTED_COLOR : MISSED_COLOR;
    const lines = detected ? ['T/E 15:1 ou mais'] : ['exame limpo', 'T/E 0,5:1'];
    const { x, y, w, h } = STAMP_BOX;
    return (
        <motion.g key={genotype} initial={{ opacity: 0, scale: 1.3 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            transition={{ delay: 2.3, duration: 0.45, ease: EASE }} style={{ transformOrigin: `${x + w / 2}px ${y + h / 2}px` }}>
            <rect x={x} y={y} width={w} height={h} rx={8} fill="#050510" stroke={color} strokeWidth={2.2} />
            <g transform={`translate(${x + 20} ${y + 21})`}><StampIcon detected={detected} color={color} /></g>
            <text x={x + 34} y={y + 27} className="font-display" fontSize={detected ? 16 : 14.5} fontWeight={700} fill={color} letterSpacing={detected ? 0.3 : 0}>
                {detected ? 'DETECTADO' : 'FALSO NEGATIVO'}
            </text>
            {lines.map((t, k) => (
                <text key={t} x={x + 12} y={y + 47 + k * 16} className="font-body" fontSize={15} fill="#F9FAFB">{t}</text>
            ))}
        </motion.g>
    );
};
