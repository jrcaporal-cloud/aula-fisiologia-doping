import { motion } from 'framer-motion';
import { AthletePhoto } from './AthletePhoto';
import { CASES } from './cases';
import { AXIS_TICKS, caseMarks, slotPct, yearPct } from './layout';

/**
 * Linha do tempo do arquivo: as fichas ficam igualmente espaçadas (legíveis) e uma linha-guia
 * desce de cada uma até o ano real no eixo proporcional. Clique abre o caso.
 */

const SLOT_H = 84;
const AXIS_Y = 112;

interface TimelineProps {
    readonly active: number;
    readonly onSelect: (index: number) => void;
}

export const Timeline = ({ active, onSelect }: TimelineProps) => (
    <div className="relative w-full" style={{ height: AXIS_Y + 30 }}>
        {/* linhas-guia e eixo (em % para acompanhar a largura) */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" viewBox={`0 0 100 ${AXIS_Y + 30}`} preserveAspectRatio="none" aria-hidden>
            <line x1={0} x2={100} y1={AXIS_Y} y2={AXIS_Y} stroke="rgba(255,255,255,0.45)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
            {AXIS_TICKS.map(y => (
                <line key={y} x1={yearPct(y)} x2={yearPct(y)} y1={AXIS_Y} y2={AXIS_Y + 6} stroke="rgba(255,255,255,0.5)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
            {CASES.map((c, i) => {
                const on = i === active;
                const marks = caseMarks[i];
                return (
                    <g key={c.id}>
                        <line x1={slotPct(i)} y1={SLOT_H} x2={yearPct(marks[0])} y2={AXIS_Y}
                            stroke={on ? c.substanceColor : 'rgba(255,255,255,0.28)'} strokeWidth={on ? 2 : 1} vectorEffect="non-scaling-stroke" />
                        {marks.length > 1 && (
                            <line x1={yearPct(marks[0])} x2={yearPct(marks[marks.length - 1])} y1={AXIS_Y} y2={AXIS_Y}
                                stroke={c.substanceColor} strokeOpacity={on ? 1 : 0.55} strokeWidth={on ? 6 : 4} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                        )}
                    </g>
                );
            })}
        </svg>

        {/* marcadores dos anos no eixo */}
        {CASES.map((c, i) => caseMarks[i].map(y => (
            <span key={`${c.id}-${y}`} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2"
                style={{
                    left: `${yearPct(y)}%`, top: AXIS_Y, width: i === active ? 13 : 9, height: i === active ? 13 : 9,
                    background: i === active ? c.substanceColor : '#050510', borderColor: c.substanceColor,
                    boxShadow: i === active ? `0 0 12px ${c.substanceColor}` : undefined,
                }} />
        )))}
        {AXIS_TICKS.map(y => (
            <span key={y} className="pointer-events-none absolute -translate-x-1/2 font-mono text-[13px] text-gray-300" style={{ left: `${yearPct(y)}%`, top: AXIS_Y + 9 }}>
                {y}
            </span>
        ))}

        {/* fichas */}
        <div className="absolute inset-x-0 top-0 flex" style={{ height: SLOT_H }}>
            {CASES.map((c, i) => {
                const on = i === active;
                return (
                    <button key={c.id} type="button" onClick={() => onSelect(i)}
                        className="relative flex min-w-0 flex-1 cursor-pointer flex-col items-center rounded-xl pt-1 transition-colors hover:bg-white/5"
                        aria-pressed={on} aria-label={`${c.name}, ${c.year}`}>
                        {on && (
                            <motion.span layoutId="dossier-slot" className="absolute inset-0 rounded-xl"
                                style={{ background: `${c.substanceColor}1f`, border: `1px solid ${c.substanceColor}88` }}
                                transition={{ type: 'spring', stiffness: 380, damping: 34 }} />
                        )}
                        <span className="relative block h-[38px] w-[38px] overflow-hidden rounded-full border-2"
                            style={{ borderColor: on ? c.substanceColor : 'rgba(255,255,255,0.25)', filter: on ? 'none' : 'grayscale(0.85)' }}>
                            <AthletePhoto src={c.image} name={c.name} className="h-full w-full" initialsSize={14} />
                        </span>
                        <span className={`relative mt-1 max-w-full truncate px-1 text-[14px] leading-tight ${on ? 'font-semibold text-white' : 'text-gray-200'}`}>{c.name}</span>
                        <span className="relative font-mono text-[13px] leading-tight" style={{ color: on ? c.substanceColor : '#D1D5DB' }}>{c.year}</span>
                    </button>
                );
            })}
        </div>
    </div>
);
