import { useId, useMemo, useRef, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { STRAT } from './model';
import { buildLogLanes, buildStratLanes, COLORS } from './lanes';
import { LaneView, RED } from './LaneView';
import { LOG_REGIONS, LOG_TICKS, STRAT_TICKS, uFromDay, uFromX, VB, xFromU, type Tick } from './scales';

export type ChartMode = 'log' | 'strat';

interface DetectionChartProps {
    mode: ChartMode;
    mix: number;
    u: number;
    pillText: string;
    onScrubStart: () => void;
    onScrub: (u: number) => void;
}

const MONO = 'JetBrains Mono, ui-monospace, monospace';

const Axis = ({ ticks, title }: { ticks: Tick[]; title: string }) => (
    <g>
        <line x1={VB.pl} x2={VB.pr} y1={VB.axisY} y2={VB.axisY} stroke="rgba(255,255,255,0.35)" />
        {ticks.map(t => (
            <g key={t.u} transform={`translate(${xFromU(t.u)},${VB.axisY})`}>
                <line y1={-(VB.axisY - VB.lanesTop)} y2={0} stroke="rgba(255,255,255,0.06)" />
                <line y1={0} y2={t.major ? 7 : 5} stroke="rgba(255,255,255,0.55)" />
                {t.label && <text y={21} textAnchor="middle" fontSize={16} fontFamily={MONO} fill={t.major ? '#F3F4F6' : '#CBD5E1'}
                    stroke="#050510" strokeWidth={4} paintOrder="stroke">{t.label}</text>}
            </g>
        ))}
        <text x={(VB.pl + VB.pr) / 2} y={VB.h - 4} textAnchor="middle" fontSize={16} fill="#CBD5E1" style={{ fontFamily: 'var(--font-body)' }}>{title}</text>
    </g>
);

const LogBand = () => (
    <g>
        {LOG_REGIONS.map((r, i) => (
            <g key={r.label}>
                {i > 0 && <line x1={xFromU(r.u0)} x2={xFromU(r.u0)} y1={VB.bandTop + 4} y2={VB.bandTop + VB.bandH - 4} stroke="rgba(255,255,255,0.18)" />}
                <text x={(xFromU(r.u0) + xFromU(r.u1)) / 2} y={VB.bandTop + 19} textAnchor="middle" fontSize={16} fontFamily={MONO}
                    fill="#CBD5E1" letterSpacing={0.4}>{r.label}</text>
            </g>
        ))}
    </g>
);

const Phase = ({ d0, d1, color, label, delay }: { d0: number; d1: number; color: string; label: string; delay: number }) => {
    const x0 = xFromU(uFromDay(d0));
    const x1 = xFromU(uFromDay(d1));
    return (
        <motion.g initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay }}>
            <rect x={x0 + 1} y={VB.bandTop} width={x1 - x0 - 2} height={VB.bandH} rx={6} fill={color} fillOpacity={0.16} stroke={color} strokeOpacity={0.6} />
            <text x={(x0 + x1) / 2} y={VB.bandTop + 19.5} textAnchor="middle" fontSize={16} fontWeight={600} fill="#fff" style={{ fontFamily: 'var(--font-body)' }}>{label}</text>
        </motion.g>
    );
};

const StratBackdrop = () => {
    const xz = xFromU(uFromDay(STRAT.zoomFrom));
    const xp = xFromU(uFromDay(0));
    return (
        <g>
            <rect x={xz} y={VB.lanesTop - 4} width={VB.pr - xz} height={VB.axisY - VB.lanesTop + 4} fill="rgba(96,165,250,0.05)" />
            <line x1={xz} x2={xz} y1={VB.lanesTop - 4} y2={VB.axisY} stroke="rgba(96,165,250,0.35)" strokeDasharray="3 4" />
            {/* quebra de escala no eixo */}
            <path d={`M${xz - 6},${VB.axisY + 5} l4,-10 M${xz + 2},${VB.axisY + 5} l4,-10`} stroke="#93C5FD" strokeWidth={1.6} />
            <line x1={xp} x2={xp} y1={VB.bandTop + VB.bandH} y2={VB.axisY} stroke={COLORS.prova} strokeWidth={2} strokeOpacity={0.85} />
        </g>
    );
};

const StratBand = () => (
    <g>
        <Phase d0={STRAT.offSeason[0]} d1={STRAT.offSeason[1]} color={COLORS.long} label="Construção (off-season)" delay={0.1} />
        <Phase d0={STRAT.clearance[0]} d1={STRAT.clearance[1]} color={COLORS.short} label="Clearance window · ação curta" delay={0.35} />
        <Phase d0={0} d1={STRAT.end} color={COLORS.prova} label="Prova" delay={0.6} />
    </g>
);

/** Linha do dia do teste: desenhada ATRÁS das faixas, para não riscar os textos dentro delas. */
const TestRule = ({ u }: { u: number }) => {
    const x = xFromU(u);
    return (
        <line x1={x} x2={x} y1={VB.pillY + 24} y2={VB.axisY} stroke="#fff" strokeWidth={2} pointerEvents="none"
            style={{ filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.7))' }} />
    );
};

const TestPill = ({ u, text }: { u: number; text: string }) => {
    const x = xFromU(u);
    const w = text.length * 9.5 + 38;
    const px = Math.min(Math.max(x - w / 2, VB.pl - 30), VB.pr + 10 - w);
    return (
        <g pointerEvents="none">
            <path d={`M${x - 6},${VB.axisY} L${x + 6},${VB.axisY} L${x},${VB.axisY - 8} Z`} fill="#fff" />
            <rect x={px} y={VB.pillY} width={w} height={24} rx={12} fill="#fff" />
            <text x={px + w / 2} y={VB.pillY + 17} textAnchor="middle" fontSize={16} fontFamily={MONO} fontWeight={700} fill="#050510">
                ◂ {text} ▸
            </text>
        </g>
    );
};

export const DetectionChart = ({ mode, mix, u, pillText, onScrubStart, onScrub }: DetectionChartProps) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const dragging = useRef(false);
    const hatchId = useId();
    const lanes = useMemo(() => (mode === 'log' ? buildLogLanes(mix) : buildStratLanes()), [mode, mix]);
    const logLanes = lanes.filter(l => !l.area);
    const yLabelMid = (VB.lanesTop + logLanes[logLanes.length - 1].box.plotBottom) / 2;

    const toU = (e: PointerEvent<SVGRectElement>): number | null => {
        const svg = svgRef.current;
        const ctm = svg?.getScreenCTM();
        if (!svg || !ctm) return null;
        const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
        return uFromX(p.x);
    };
    const handleDown = (e: PointerEvent<SVGRectElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        dragging.current = true;
        onScrubStart();
        const nu = toU(e);
        if (nu !== null) onScrub(nu);
    };
    const handleMove = (e: PointerEvent<SVGRectElement>) => {
        if (!dragging.current) return;
        const nu = toU(e);
        if (nu !== null) onScrub(nu);
    };
    const handleUp = () => { dragging.current = false; };

    return (
        <svg ref={svgRef} viewBox={`0 0 ${VB.w} ${VB.h}`} className="block w-full select-none" role="img"
            aria-label="Concentração e janelas de efeito e detecção ao longo do tempo">
            <defs>
                <pattern id={hatchId} patternUnits="userSpaceOnUse" width={7} height={7} patternTransform="rotate(45)">
                    <rect width={7} height={7} fill={RED} fillOpacity={0.18} />
                    <rect width={3.2} height={7} fill={RED} fillOpacity={0.75} />
                </pattern>
            </defs>

            <TestRule u={u} />

            {/* Troca de modo: o grupo novo monta e entra com fade (sem exit, robusto a toques rápidos). */}
            <motion.g key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }}>
                {mode === 'strat' && <StratBackdrop />}
                {mode === 'log' ? <LogBand /> : <StratBand />}
                <text transform={`translate(16, ${yLabelMid}) rotate(-90)`} textAnchor="middle" fontSize={16}
                    fill="#CBD5E1" style={{ fontFamily: 'var(--font-body)' }}>concentração relativa (escala log)</text>
                {lanes.map((lane, i) => (
                    <g key={lane.title} opacity={mode === 'log' && i === 1 ? mix : 1}>
                        <LaneView spec={lane} hatchId={hatchId} />
                    </g>
                ))}
                <Axis ticks={mode === 'log' ? LOG_TICKS : STRAT_TICKS}
                    title={mode === 'log'
                        ? 'Tempo desde a injeção (dia 0) — escala logarítmica'
                        : 'Tempo até a prova — últimas 4 semanas ampliadas (quebra de escala)'} />
            </motion.g>

            <TestPill u={u} text={pillText} />

            <rect x={VB.pl - 8} y={VB.pillY - 4} width={VB.pr - VB.pl + 16} height={VB.axisY - VB.pillY + 10} fill="transparent"
                style={{ cursor: 'ew-resize', touchAction: 'none' }}
                onPointerDown={handleDown} onPointerMove={handleMove} onPointerUp={handleUp} onPointerCancel={handleUp} />
        </svg>
    );
};
