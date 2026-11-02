import { motion, useReducedMotion } from 'framer-motion';
import { STEROIDS, halfLifeCenter, type SteroidData } from './data';
import { TIME_BANDS, TIME_TICKS, timeFrac } from './scales';

interface HalfLifeTimelineProps {
    width: number;
    height: number;
    selectedId: string;
    onSelect: (id: string) => void;
}

const LABEL_W = 108;
const PAD_R = 14;
const HEADER_H = 24;
const AXIS_H = 22;
const VALUE_FONT = 12;
/** Largura aproximada de um caractere de JetBrains Mono a 12px (0,6 em). */
const MONO_CHAR_W = VALUE_FONT * 0.61;

const ORDERED: readonly SteroidData[] = [...STEROIDS].sort((a, b) => halfLifeCenter(a) - halfLifeCenter(b));

/** Linha do tempo comparativa: meia-vida dos 8 compostos numa régua log (horas → semanas). */
export const HalfLifeTimeline = ({ width, height, selectedId, onSelect }: HalfLifeTimelineProps) => {
    const reduce = useReducedMotion();
    const trackX = LABEL_W;
    const trackW = width - LABEL_W - PAD_R;
    const tx = (h: number) => trackX + timeFrac(h) * trackW;
    const rowsTop = HEADER_H;
    const rowsH = height - HEADER_H - AXIS_H;
    const rowH = rowsH / ORDERED.length;

    return (
        <svg width={width} height={height} className="block select-none" role="img"
            aria-label="Meia-vida dos oito compostos em escala logarítmica, de horas a semanas">
            {/* Faixas Horas / Dias / Semanas */}
            {TIME_BANDS.map((b, i) => (
                <g key={b.label}>
                    <rect x={tx(b.from)} y={rowsTop - 4} width={tx(b.to) - tx(b.from)} height={rowsH + 8}
                        fill={i % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(255,255,255,0.07)'} />
                    <text x={(tx(b.from) + tx(b.to)) / 2} y={14} textAnchor="middle" fontSize={12}
                        className="fill-zinc-300 font-mono uppercase" letterSpacing="0.12em">{b.label}</text>
                </g>
            ))}
            <text x={0} y={14} fontSize={12} className="fill-zinc-400 font-mono">meia-vida · log</text>

            {/* Marcas do eixo */}
            {TIME_TICKS.map(t => (
                <g key={t.h}>
                    <line x1={tx(t.h)} x2={tx(t.h)} y1={rowsTop - 4} y2={rowsTop + rowsH + 4} stroke="rgba(255,255,255,0.09)" />
                    <text x={tx(t.h)} y={height - 6} textAnchor="middle" fontSize={12} className="fill-zinc-400 font-mono">{t.label}</text>
                </g>
            ))}

            {ORDERED.map((s, i) => {
                const cy = rowsTop + rowH * (i + 0.5);
                const x0 = tx(s.halfLifeHours.min);
                const x1 = tx(s.halfLifeHours.max);
                const isPoint = s.halfLifeHours.min === s.halfLifeHours.max;
                const selected = s.id === selectedId;
                const textW = s.halfLifeLabel.length * MONO_CHAR_W;
                const barRight = isPoint ? x1 + 6 : x1;
                const barLeft = isPoint ? x0 - 6 : x0;
                const fitsRight = barRight + 8 + textW <= width - 2;
                return (
                    <motion.g key={s.id}
                        initial={{ opacity: 0, x: reduce ? 0 : -12 }}
                        animate={{ opacity: selected ? 1 : 0.82, x: 0 }}
                        transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.25 + i * 0.07 }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onSelect(s.id)}
                    >
                        <rect x={0} y={cy - rowH / 2} width={width} height={rowH} rx={4}
                            fill={selected ? `${s.color}22` : 'transparent'} />
                        <text x={4} y={cy + 4.5} fontSize={13} fill={s.color}
                            className={selected ? 'font-body font-bold' : 'font-body font-semibold'}>{s.short}</text>
                        {isPoint ? (
                            <rect x={x0 - 5.5} y={cy - 5.5} width={11} height={11} rx={2} fill={s.color}
                                transform={`rotate(45 ${x0} ${cy})`} />
                        ) : (
                            <rect x={x0} y={cy - 4.5} width={Math.max(x1 - x0, 9)} height={9} rx={4.5} fill={s.color} />
                        )}
                        <text x={fitsRight ? barRight + 8 : barLeft - 8} y={cy + 4} fontSize={VALUE_FONT}
                            textAnchor={fitsRight ? 'start' : 'end'}
                            className={selected ? 'fill-white font-mono font-bold' : 'fill-zinc-200 font-mono'}>
                            {s.halfLifeLabel}
                        </text>
                    </motion.g>
                );
            })}
        </svg>
    );
};
