import { motion, useReducedMotion } from 'framer-motion';
import { C, PK } from './content';
import { CardarineLane } from './CardarineLane';
import {
    AXIS_Y, BAND, LANES, PLOT, REGIONS, TICKS, VB, bandPath, curvePath, formatHours, formatPct, hoursFromU,
    laneBox, remaining, xFromHours, xFromU, yFromPct, type LaneBox,
} from './scales';

/**
 * Linha do tempo em escala log (1 h → 6 semanas), uma faixa por agente.
 * Curvas = modelo ilustrativo de eliminação ancorado nos t½ do slide.
 */

const BOXES = [laneBox(0), laneBox(1), laneBox(2)] as const;
const CLEN_PATH = curvePath(BOXES[0], PK.clenHalfLifeH);
const SALB_BAND = bandPath(BOXES[1], PK.salbHalfLifeMinH, PK.salbHalfLifeMaxH);
const SALB_MIN = curvePath(BOXES[1], PK.salbHalfLifeMinH);
const SALB_MAX = curvePath(BOXES[1], PK.salbHalfLifeMaxH);

interface LaneFrameProps {
    readonly box: LaneBox;
    readonly color: string;
    readonly active: boolean;
    readonly name: string;
    readonly sub: string;
    readonly tag: string;
    readonly dim?: boolean;
}

const LaneFrame = ({ box, color, active, name, sub, tag, dim }: LaneFrameProps) => (
    <g opacity={dim ? 0.7 : 1}>
        <motion.rect x={2} y={box.top} width={VB.w - 4} height={box.bottom - box.top} rx={12}
            initial={false}
            animate={{ fill: active ? `${color}12` : 'rgba(255,255,255,0.025)', stroke: active ? `${color}aa` : 'rgba(255,255,255,0.10)' }}
            transition={{ duration: 0.4 }} strokeWidth={1.2} />
        <text x={14} y={box.top + 24} className="font-display" fontSize={18} fontWeight={700} fill={color}>{name}</text>
        <text x={14} y={box.top + 46} className="font-body" fontSize={17} fill="#F3F4F6">{sub}</text>
        <text x={14} y={box.top + 70} className="font-mono" fontSize={17} fontWeight={700} fill="#F9FAFB">{tag}</text>
        {/* eixo de % */}
        <line x1={PLOT.l} x2={PLOT.r} y1={box.y0} y2={box.y0} stroke="rgba(255,255,255,0.22)" />
        <line x1={PLOT.l} x2={PLOT.r} y1={yFromPct(box, 50)} y2={yFromPct(box, 50)} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 5" />
        <text x={PLOT.l - 6} y={box.y100 + 5} textAnchor="end" className="font-mono" fontSize={17} fill="#F3F4F6">100%</text>
        <text x={PLOT.l - 6} y={yFromPct(box, 50) + 5} textAnchor="end" className="font-mono" fontSize={17} fill="#F3F4F6">50%</text>
    </g>
);

interface HalfMarkProps {
    readonly box: LaneBox;
    readonly h0: number;
    readonly h1: number;
    readonly color: string;
    readonly ink: string;
    readonly label: string;
    readonly show: boolean;
    readonly delay: number;
}

/** Marca do t½: onde a curva cruza 50%. */
const HalfMark = ({ box, h0, h1, color, ink, label, show, delay }: HalfMarkProps) => {
    const y = yFromPct(box, 50);
    const x0 = xFromHours(h0);
    const x1 = xFromHours(h1);
    return (
        <motion.g initial={false} animate={{ opacity: show ? 1 : 0 }} transition={{ duration: 0.4, delay: show ? delay : 0 }}>
            <line x1={x0} x2={x0} y1={y} y2={box.y0} stroke={ink} strokeDasharray="3 4" />
            {x1 > x0 + 1 && <line x1={x1} x2={x1} y1={y} y2={box.y0} stroke={ink} strokeDasharray="3 4" />}
            {x1 > x0 + 1 && <rect x={x0} y={box.y0 - 5} width={x1 - x0} height={5} fill={color} opacity={0.7} />}
            <circle cx={x0} cy={y} r={4.5} fill={color} stroke="#fff" />
            {x1 > x0 + 1 && <circle cx={x1} cy={y} r={4.5} fill={color} stroke="#fff" />}
            <text x={x0 - 9} y={y + 22} textAnchor="end" className="font-mono" fontSize={17} fontWeight={700} fill={ink}>{label}</text>
        </motion.g>
    );
};

interface CursorProps {
    readonly u: number;
    readonly step: number;
}

const Cursor = ({ u, step }: CursorProps) => {
    const h = hoursFromU(u);
    const x = xFromU(u);
    const clen = remaining(h, PK.clenHalfLifeH);
    const sMax = remaining(h, PK.salbHalfLifeMaxH);
    const sMin = remaining(h, PK.salbHalfLifeMinH);
    const sLabel = formatPct(sMin) === formatPct(sMax) ? formatPct(sMax) : `${formatPct(sMin)}–${formatPct(sMax)}`;
    const flip = x > PLOT.r - 130;
    const anchor = flip ? 'end' : 'start';
    const dx = flip ? -9 : 9;
    return (
        <g pointerEvents="none">
            <line x1={x} x2={x} y1={LANES.top - 2} y2={BOXES[1].bottom} stroke="#F9FAFB" strokeOpacity={0.55} strokeWidth={1.4} />
            <line x1={x} x2={x} y1={BOXES[2].bottom} y2={AXIS_Y} stroke="#F9FAFB" strokeOpacity={0.55} strokeWidth={1.4} />
            <rect x={x - 42} y={AXIS_Y + 3} width={84} height={23} rx={6} fill="#F9FAFB" />
            <text x={x} y={AXIS_Y + 20} textAnchor="middle" className="font-mono" fontSize={17} fontWeight={700} fill="#050510">{formatHours(h)}</text>
            <circle cx={x} cy={yFromPct(BOXES[0], clen)} r={5} fill={C.clen} stroke="#fff" strokeWidth={1.5} />
            <text x={x + dx} y={yFromPct(BOXES[0], clen) - 8} textAnchor={anchor} className="font-mono" fontSize={17} fontWeight={700} fill="#FFE4E6">{formatPct(clen)}</text>
            {step >= 1 && (
                <g>
                    <circle cx={x} cy={yFromPct(BOXES[1], (sMin + sMax) / 2)} r={5} fill={C.salb} stroke="#fff" strokeWidth={1.5} />
                    <text x={x + dx} y={yFromPct(BOXES[1], (sMin + sMax) / 2) - 8} textAnchor={anchor} className="font-mono" fontSize={17} fontWeight={700} fill="#CFFAFE">{sLabel}</text>
                </g>
            )}
        </g>
    );
};

interface TimelineProps {
    readonly step: number;
    readonly cursorU: number;
}

export const Timeline = ({ step, cursorU }: TimelineProps) => {
    const reduced = useReducedMotion() ?? false;
    const draw = (delay: number) => ({ duration: reduced ? 0 : 1.3, delay: reduced ? 0 : delay, ease: 'easeOut' as const });
    const showSalb = step >= 1;
    const tachyX0 = xFromHours(PK.tachyMinDays * 24);
    const tachyX1 = xFromHours(PK.tachyMaxDays * 24);
    const cb = BOXES[0];
    const sb = BOXES[1];
    return (
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 w-full h-full block" role="img"
            aria-label="Linha do tempo em escala logarítmica: eliminação do clembuterol (meia-vida de cerca de 35 horas) e do salbutamol (4 a 6 horas)">
            <defs>
                <pattern id="b2k-hatch" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1={0} y1={0} x2={0} y2={8} stroke={C.clen} strokeOpacity={0.45} strokeWidth={3} />
                </pattern>
            </defs>

            {/* Faixas HORAS / DIAS / SEMANAS */}
            {REGIONS.map((r, i) => {
                const x0 = xFromHours(r.h0);
                const x1 = xFromHours(r.h1);
                return (
                    <g key={r.label}>
                        <rect x={x0 + 1} y={BAND.y} width={x1 - x0 - 2} height={BAND.h} rx={6} fill={`rgba(255,255,255,${0.04 + i * 0.025})`} />
                        <text x={(x0 + x1) / 2} y={BAND.y + 17} textAnchor="middle" className="font-mono" fontSize={17} letterSpacing={2} fill="#F9FAFB">{r.label}</text>
                    </g>
                );
            })}

            {/* Faixa 1: Clembuterol */}
            <LaneFrame box={cb} color={C.clen} active={step === 0} name="Clembuterol" sub="agonista β2" tag={`t½ ~${PK.clenHalfLifeH} h`} />
            <motion.g initial={false} animate={{ opacity: step === 0 ? 1 : 0.85 }}>
                <rect x={tachyX0} y={cb.y0 - 14} width={tachyX1 - tachyX0} height={14} fill="url(#b2k-hatch)" stroke={C.clen} strokeOpacity={0.8} rx={3} />
                <g textAnchor="end" className="font-body">
                    <text x={PLOT.r - 4} y={cb.y100 + 8} fontSize={18} fontWeight={700} fill="#FFE4E6">taquifilaxia</text>
                    <text x={PLOT.r - 4} y={cb.y100 + 27} fontSize={17} fill="#F9FAFB">{PK.tachyMinDays}-{PK.tachyMaxDays} dias de uso</text>
                    <text x={PLOT.r - 4} y={cb.y100 + 46} fontSize={17} fill="#F9FAFB">down-regulation β2</text>
                </g>
            </motion.g>
            <motion.path key={`clen-${reduced}`} d={CLEN_PATH} fill="none" stroke={C.clen} strokeWidth={3} strokeLinecap="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw(0.2)} />
            <HalfMark box={cb} h0={PK.clenHalfLifeH} h1={PK.clenHalfLifeH} color={C.clen} ink="#FECDD3" label={`t½ ~${PK.clenHalfLifeH} h`} show delay={reduced ? 0 : 1.1} />

            {/* Faixa 2: Salbutamol */}
            <LaneFrame box={sb} color={C.salb} active={step === 1 || step === 2} name="Salbutamol" sub="Albuterol · β2" tag={`t½ ~${PK.salbHalfLifeMinH} a ${PK.salbHalfLifeMaxH} h`} dim={!showSalb} />
            {showSalb ? (
                <g>
                    <motion.path d={SALB_BAND} fill={C.salb} initial={{ opacity: 0 }} animate={{ opacity: 0.22 }} transition={{ duration: 0.6, delay: reduced ? 0 : 0.9 }} />
                    <motion.path d={SALB_MAX} fill="none" stroke={C.salb} strokeWidth={2.6} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw(0.1)} />
                    <motion.path d={SALB_MIN} fill="none" stroke={C.salb} strokeWidth={2.6} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={draw(0.1)} />
                    <HalfMark box={sb} h0={PK.salbHalfLifeMinH} h1={PK.salbHalfLifeMaxH} color={C.salb} ink="#A7F3D0" label={`t½ ~${PK.salbHalfLifeMinH} a ${PK.salbHalfLifeMaxH} h`} show delay={reduced ? 0 : 1.1} />
                    <motion.g initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: reduced ? 0 : 1.5 }}>
                        <text x={PLOT.r - 8} y={sb.y100 + 15} textAnchor="end" className="font-body" fontSize={18} fontWeight={700} fill="#A7F3D0">eliminado rapidamente</text>
                        <text x={PLOT.r - 8} y={sb.y100 + 35} textAnchor="end" className="font-body" fontSize={17} fill="#F9FAFB">escapando da janela de detecção</text>
                    </motion.g>
                </g>
            ) : (
                <text x={(PLOT.l + PLOT.r) / 2} y={(sb.y100 + sb.y0) / 2 + 5} textAnchor="middle" className="font-mono" fontSize={17} fill="#D1D5DB">próximo passo</text>
            )}

            {/* Faixa 3: Cardarine */}
            <CardarineLane box={BOXES[2]} step={step} reduced={reduced} />

            {/* Eixo do tempo */}
            {TICKS.map(t => (
                <g key={t.label}>
                    <line x1={xFromHours(t.h)} x2={xFromHours(t.h)} y1={AXIS_Y - 3} y2={AXIS_Y + 4} stroke="#D1D5DB" />
                    <text x={xFromHours(t.h)} y={AXIS_Y + 42} textAnchor={t.h === 1 ? 'start' : t.h >= 1000 ? 'end' : 'middle'} className="font-body" fontSize={17}
                        fontWeight={t.major ? 700 : 400} fill={t.major ? '#F9FAFB' : '#E5E7EB'}>{t.label}</text>
                </g>
            ))}
            <line x1={PLOT.l} x2={PLOT.r} y1={AXIS_Y} y2={AXIS_Y} stroke="rgba(255,255,255,0.35)" />
            <text x={14} y={AXIS_Y + 42} className="font-body" fontSize={17} fill="#F3F4F6">tempo após a dose</text>

            <Cursor u={cursorU} step={step} />
        </svg>
    );
};
