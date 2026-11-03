import { motion, useReducedMotion } from 'framer-motion';
import { STEROIDS, halfLifeCenter, type SteroidData } from './data';
import { Shape } from './markers';
import { shapeOf } from './markerShapes';
import { TIME_BANDS, TIME_TICKS, timeFrac } from './scales';

interface HalfLifeTimelineProps {
    width: number;
    height: number;
    selectedId: string;
    onSelect: (id: string) => void;
}

const LABEL_W = 160;
const PAD_R = 8;
const HEADER_H = 30;
const AXIS_H = 30;
/** Texto da régua (o SVG é desenhado em px de projeto). */
const FONT = 16;
const NAME_FONT = 17;
/** Marcas do eixo: as de 1 sem e 2 sem ficam a ~42 px uma da outra. */
const TICK_FONT = 15;
/** Marcas coladas (1 sem e 2 sem): afastadas ~8 px para os rótulos não se tocarem. */
const TICK_NUDGE: Readonly<Record<number, number>> = { 168: -8, 336: 8 };
const BAR_H = 12;
/** Largura aproximada de um caractere de JetBrains Mono a 16px (0,61 em). */
const MONO_CHAR_W = FONT * 0.61;

const ORDERED: readonly SteroidData[] = [...STEROIDS].sort((a, b) => halfLifeCenter(a) - halfLifeCenter(b));

/**
 * Linha do tempo comparativa: meia-vida dos 8 compostos numa régua log (horas → semanas).
 * Cada linha tem a barra em cima e o valor logo abaixo, alinhado à barra (nunca sobre ela).
 */
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
                    <text x={(tx(b.from) + tx(b.to)) / 2} y={20} textAnchor="middle" fontSize={FONT}
                        className="fill-zinc-200 font-mono uppercase" letterSpacing="0.08em">{b.label}</text>
                </g>
            ))}
            <text x={4} y={20} fontSize={FONT} className="fill-zinc-300 font-mono">meia-vida · log</text>

            {/* Marcas do eixo */}
            {TIME_TICKS.map(t => (
                <g key={t.h}>
                    <line x1={tx(t.h)} x2={tx(t.h)} y1={rowsTop - 4} y2={rowsTop + rowsH + 4} stroke="rgba(255,255,255,0.09)" />
                    <text x={tx(t.h) + (TICK_NUDGE[t.h] ?? 0)} y={height - 7} textAnchor="middle" fontSize={TICK_FONT} className="fill-zinc-300 font-body font-medium">{t.label}</text>
                </g>
            ))}

            {ORDERED.map((s, i) => {
                const cy = rowsTop + rowH * (i + 0.5);
                const barY = cy - 9;
                const x0 = tx(s.halfLifeHours.min);
                const x1 = tx(s.halfLifeHours.max);
                const isPoint = s.halfLifeHours.min === s.halfLifeHours.max;
                const selected = s.id === selectedId;
                const textW = s.halfLifeLabel.length * MONO_CHAR_W;
                const barRight = isPoint ? x1 + 8 : x1;
                const barLeft = isPoint ? x0 - 8 : x0;
                // Valor sob a barra: começa na ponta esquerda; se não couber, termina na ponta direita.
                const fitsFromLeft = barLeft + textW <= width - 2;
                return (
                    <motion.g key={s.id}
                        initial={{ opacity: 0, x: reduce ? 0 : -12 }}
                        animate={{ opacity: selected ? 1 : 0.92, x: 0 }}
                        transition={{ duration: reduce ? 0 : 0.45, delay: reduce ? 0 : 0.25 + i * 0.07 }}
                        style={{ cursor: 'pointer' }}
                        onClick={() => onSelect(s.id)}
                    >
                        <rect x={0} y={cy - rowH / 2 + 2} width={width} height={rowH - 4} rx={6}
                            fill={selected ? `${s.color}22` : 'transparent'} />
                        <g transform={`translate(12 ${cy})`}><Shape shape={shapeOf(s.id)} r={6} fill={s.color} /></g>
                        <text x={26} y={cy + 6} fontSize={NAME_FONT} fill={s.color}
                            className={selected ? 'font-body font-bold' : 'font-body font-semibold'}>{s.short}</text>
                        {isPoint ? (
                            <rect x={x0 - 7} y={barY + BAR_H / 2 - 7} width={14} height={14} rx={2} fill={s.color}
                                transform={`rotate(45 ${x0} ${barY + BAR_H / 2})`} />
                        ) : (
                            <rect x={x0} y={barY} width={Math.max(x1 - x0, BAR_H)} height={BAR_H} rx={BAR_H / 2} fill={s.color} />
                        )}
                        <text x={fitsFromLeft ? barLeft : Math.min(barRight, width - 2)} y={cy + 20} fontSize={FONT}
                            textAnchor={fitsFromLeft ? 'start' : 'end'}
                            className={selected ? 'fill-white font-mono font-bold' : 'fill-zinc-100 font-mono'}>
                            {s.halfLifeLabel}
                        </text>
                    </motion.g>
                );
            })}
        </svg>
    );
};
