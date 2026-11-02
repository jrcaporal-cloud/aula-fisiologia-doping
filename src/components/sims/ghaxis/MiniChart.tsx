import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { COLORS } from './content';
import {
    CONTROL_AT, GHRH_SYNERGY, GHRP_PEAK, GHRP_WINDOW, IGF_BOUND_HALF, INJ_AT, SC_HALF_POINT, SC_PEAK_X, SLEEP,
    ghNatural, ghrpCurve, igfBound, igfFree, igfNatural, rhghIv, rhghSc, sampleFn, type Pt,
} from './chartModel';

export const CHART = { w: 620, h: 190, l: 48, r: 16, t: 14, b: 30 } as const;
const MONO = 'var(--font-mono)';
const EASE = [0.16, 1, 0.3, 1] as const;

interface Scale { x: (v: number) => number; y: (v: number) => number }

const makeScale = (x0: number, x1: number, yMax: number): Scale => ({
    x: v => CHART.l + ((v - x0) / (x1 - x0)) * (CHART.w - CHART.l - CHART.r),
    y: v => CHART.h - CHART.b - (v / yMax) * (CHART.h - CHART.t - CHART.b),
});

const toPath = (pts: Pt[], s: Scale): string => pts.map((p, i) => `${i ? 'L' : 'M'}${s.x(p.x).toFixed(1)},${s.y(p.y).toFixed(1)}`).join('');
const toArea = (top: Pt[], bottom: Pt[], s: Scale): string =>
    `${toPath(top, s)}${[...bottom].reverse().map(p => `L${s.x(p.x).toFixed(1)},${s.y(p.y).toFixed(1)}`).join('')}Z`;

interface Tick { v: number; label: string }

const Axes = ({ s, ticks, yLabel, yTicks = [] }: { s: Scale; ticks: Tick[]; yLabel: string; yTicks?: Tick[] }) => {
    const base = CHART.h - CHART.b;
    return (
        <g>
            <line x1={CHART.l} x2={CHART.w - CHART.r} y1={base} y2={base} stroke="rgba(255,255,255,0.4)" />
            <line x1={CHART.l} x2={CHART.l} y1={CHART.t} y2={base} stroke="rgba(255,255,255,0.25)" />
            {ticks.map((t, i) => (
                <g key={t.label} transform={`translate(${s.x(t.v)},${base})`}>
                    <line y2={5} stroke="rgba(255,255,255,0.55)" />
                    <text x={i === ticks.length - 1 ? 4 : 0} y={19} textAnchor={i === ticks.length - 1 && t.label.length > 3 ? 'end' : 'middle'}
                        fontSize={12} fontFamily={MONO} fill="#D1D5DB">{t.label}</text>
                </g>
            ))}
            {yTicks.map(t => (
                <g key={t.label}>
                    <line x1={CHART.l} x2={CHART.w - CHART.r} y1={s.y(t.v)} y2={s.y(t.v)} stroke="rgba(255,255,255,0.07)" />
                    <text x={CHART.l - 6} y={s.y(t.v) + 4} textAnchor="end" fontSize={12} fontFamily={MONO} fill="#D1D5DB">{t.label}</text>
                </g>
            ))}
            <text transform={`translate(13,${(CHART.t + base) / 2}) rotate(-90)`} textAnchor="middle" fontSize={12} fill="#D1D5DB"
                style={{ fontFamily: 'var(--font-body)' }}>{yLabel}</text>
        </g>
    );
};

const Curve = ({ d, color, width = 2.6, dash, delay = 0, duration = 1.4 }: { d: string; color: string; width?: number; dash?: string; delay?: number; duration?: number }) => (
    <motion.path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash}
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration, ease: 'easeInOut', delay }, opacity: { duration: 0.2, delay } }} />
);

const Fade = ({ delay = 0, children }: { delay?: number; children: ReactNode }) => (
    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay }}>{children}</motion.g>
);

const Label = ({ x, y, text, color, anchor = 'start', size = 12.5 }: { x: number; y: number; text: string; color: string; anchor?: 'start' | 'middle' | 'end'; size?: number }) => (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={600} fill={color}
        style={{ fontFamily: 'var(--font-body)', paintOrder: 'stroke', stroke: '#080812', strokeWidth: 4, strokeLinejoin: 'round' }}>{text}</text>
);

/* ── Passo 0 ── */
const NaturalPlot = () => {
    const s = makeScale(0, 24, 1.12);
    const gh = sampleFn(ghNatural, 0, 24, 240);
    const igf = sampleFn(igfNatural, 0, 24, 60);
    const base = CHART.h - CHART.b;
    return (
        <g>
            <rect x={s.x(SLEEP[0])} y={CHART.t} width={s.x(SLEEP[1]) - s.x(SLEEP[0])} height={base - CHART.t} fill="rgba(96,165,250,0.08)" />
            <Label x={s.x(SLEEP[1]) - 6} y={CHART.t + 14} text="sono" color="#93C5FD" anchor="end" />
            <Axes s={s} yLabel="nível (u.a.)" ticks={[{ v: 0, label: 'dia' }, { v: 19, label: 'noite' }, { v: 24, label: '24 h' }]} />
            <motion.path d={toArea(gh, gh.map(p => ({ x: p.x, y: 0 })), s)} fill={COLORS.hipofise} initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ delay: 0.8, duration: 0.8 }} />
            <Curve d={toPath(gh, s)} color={COLORS.hipofise} duration={1.8} />
            <Curve d={toPath(igf, s)} color={COLORS.igf} width={3} delay={0.5} duration={1.4} />
            <Fade delay={1.4}>
                <Label x={s.x(15.4)} y={s.y(1.0) + 4} text="pulso de alta amplitude · sono profundo (N3)" color="#6EE7B7" anchor="end" />
                <Label x={s.x(0.4)} y={s.y(0.42) - 9} text="IGF-1 (ligado à IGFBP-3, t½ ~15 h): estável" color="#FDA4AF" />
                <Label x={s.x(4.5)} y={s.y(0.27)} text="GH: pulsátil" color="#6EE7B7" anchor="middle" />
            </Fade>
        </g>
    );
};

/* ── Passo 1 ── */
const GhrpPlot = ({ synergy }: { synergy: boolean }) => {
    const yMax = synergy ? 12.6 : 1.2;
    const s = makeScale(0, 120, yMax);
    const base = CHART.h - CHART.b;
    const pts = sampleFn(ghrpCurve, 0, 120, 180);
    const lo = pts.map(p => ({ x: p.x, y: p.y * GHRH_SYNERGY[0] }));
    const hi = pts.map(p => ({ x: p.x, y: p.y * GHRH_SYNERGY[1] }));
    const bracketY = CHART.t + 16;
    return (
        <g>
            <rect x={s.x(GHRP_PEAK[0])} y={CHART.t} width={s.x(GHRP_PEAK[1]) - s.x(GHRP_PEAK[0])} height={base - CHART.t} fill="rgba(168,85,247,0.14)" />
            <defs>
                <linearGradient id="gh-win-fade" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor="#A855F7" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#A855F7" stopOpacity={0.1} />
                </linearGradient>
            </defs>
            <Axes s={s} yLabel={synergy ? 'GH (× pico do GHRP)' : 'GH (u.a.)'}
                ticks={[0, 15, 30, 60, 90, 120].map(v => ({ v, label: v === 120 ? '120 min' : String(v) }))}
                yTicks={synergy ? [{ v: 1, label: '1×' }, { v: 4, label: '4×' }, { v: 10, label: '10×' }] : []} />
            {synergy && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
                    <path d={toArea(hi, lo, s)} fill="rgba(245,158,11,0.22)" stroke="rgba(245,158,11,0.7)" strokeDasharray="4 3" />
                    <Label x={s.x(36)} y={s.y(7.2)} text="GHRP + GHRH (CJC-1295): 4–10× no pico" color="#FCD34D" />
                </motion.g>
            )}
            <Curve key={synergy ? 'g-s' : 'g'} d={toPath(pts, s)} color="#C084FC" width={3} duration={1.3} />
            <Fade delay={0.9}>
                <Label x={(s.x(GHRP_PEAK[0]) + s.x(GHRP_PEAK[1])) / 2} y={synergy ? s.y(2.4) : base - 8} text="pico 15–30 min" color="#E9D5FF" anchor="middle" />
                {/* janela de ação ~60–90 min */}
                <line x1={s.x(0)} x2={s.x(GHRP_WINDOW[0])} y1={bracketY} y2={bracketY} stroke="#A855F7" strokeWidth={2} />
                <rect x={s.x(GHRP_WINDOW[0])} y={bracketY - 1} width={s.x(GHRP_WINDOW[1]) - s.x(GHRP_WINDOW[0])} height={2} fill="url(#gh-win-fade)" />
                <line x1={s.x(0)} x2={s.x(0)} y1={bracketY - 5} y2={bracketY + 5} stroke="#A855F7" strokeWidth={2} />
                <Label x={s.x(GHRP_WINDOW[0]) + 4} y={bracketY - 7} text="janela de ação ~60–90 min" color="#E9D5FF" anchor="middle" />
                {!synergy && <Label x={s.x(30) + 8} y={s.y(0.95)} text="GH após GHRP" color="#D8B4FE" />}
                <Label x={CHART.w - CHART.r - 4} y={s.y(synergy ? 1.6 : 0.3)} text="urina: detectável 4–8 h" color="#D1D5DB" anchor="end" />
            </Fade>
        </g>
    );
};

/* ── Passo 2 ── */
const RhghPlot = () => {
    const s = makeScale(0, 11, 1.15);
    const base = CHART.h - CHART.b;
    const sc = sampleFn(rhghSc, 0, 11, 220);
    const iv = sampleFn(rhghIv, INJ_AT, 4, 80);
    const clock = ['21h', '22h', '23h', '00h', '01h', '02h', '03h', '04h', '05h', '06h', '07h', '08h'];
    const ivLabelY = s.y(0.55);
    return (
        <g>
            <Axes s={s} yLabel="GH plasmático (u.a.)" ticks={clock.map((label, v) => ({ v, label }))} />
            <line x1={s.x(INJ_AT)} x2={s.x(INJ_AT)} y1={CHART.t} y2={base} stroke={COLORS.exo} strokeWidth={1.6} strokeDasharray="4 3" />
            <Label x={s.x(INJ_AT) + 6} y={CHART.t + 12} text="injeção 23h" color="#FCD34D" />
            <rect x={s.x(CONTROL_AT) - 1.5} y={CHART.t} width={3} height={base - CHART.t} fill={COLORS.red} />
            <Label x={s.x(CONTROL_AT) + 7} y={CHART.t + 12} text="controle 6h" color="#FDA4AF" />
            <Curve d={toPath(iv, s)} color="#CBD5E1" width={1.8} dash="5 4" duration={0.8} />
            <motion.path d={toArea(sc, sc.map(p => ({ x: p.x, y: 0 })), s)} fill={COLORS.hipofise} initial={{ opacity: 0 }} animate={{ opacity: 0.14 }} transition={{ delay: 1, duration: 0.8 }} />
            <Curve d={toPath(sc, s)} color={COLORS.hipofise} width={3} duration={1.8} delay={0.2} />
            <Fade delay={1.6}>
                <line x1={s.x(SC_PEAK_X)} x2={s.x(SC_HALF_POINT.x)} y1={s.y(0.5)} y2={s.y(0.5)} stroke="#6EE7B7" strokeDasharray="3 3" />
                <circle cx={s.x(SC_HALF_POINT.x)} cy={s.y(0.5)} r={3.5} fill="#6EE7B7" />
                <Label x={(s.x(SC_PEAK_X) + s.x(SC_HALF_POINT.x)) / 2} y={s.y(0.5) - 8} text="t½ SC ~3–4 h" color="#6EE7B7" anchor="middle" />
                <text x={s.x(INJ_AT) - 8} y={ivLabelY} textAnchor="end" fontSize={12.5} fontWeight={600} fill="#E5E7EB" style={{ fontFamily: 'var(--font-body)' }}>
                    <tspan x={s.x(INJ_AT) - 8}>IV (- -)</tspan>
                    <tspan x={s.x(INJ_AT) - 8} dy={16}>t½ ~15–20 min</tspan>
                </text>
                <Label x={s.x(CONTROL_AT) + 7} y={s.y(0.14)} text="já eliminado" color="#FDA4AF" />
            </Fade>
        </g>
    );
};

/* ── Passo 3 ── */
const IgfPlot = () => {
    const s = makeScale(0, 24, 1.1);
    const bound = sampleFn(igfBound, 0, 24, 120);
    const free = sampleFn(igfFree, 0, 1.2, 80);
    return (
        <g>
            <Axes s={s} yLabel="% da dose" ticks={[0, 6, 12, 15, 18, 24].map(v => ({ v, label: v === 24 ? '24 h' : `${v}` }))}
                yTicks={[{ v: 0.5, label: '50%' }, { v: 1, label: '100%' }]} />
            <Curve d={toPath(free, s)} color="#FDE68A" width={2.4} duration={0.7} />
            <Curve d={toPath(bound, s)} color={COLORS.igf} width={3} duration={1.8} delay={0.3} />
            <Fade delay={1.6}>
                <line x1={s.x(IGF_BOUND_HALF)} x2={s.x(IGF_BOUND_HALF)} y1={s.y(0.5)} y2={CHART.h - CHART.b} stroke="#FDA4AF" strokeDasharray="3 3" />
                <circle cx={s.x(IGF_BOUND_HALF)} cy={s.y(0.5)} r={4} fill={COLORS.igf} />
                <Label x={s.x(IGF_BOUND_HALF) + 8} y={s.y(0.5) - 8} text="ligado à IGFBP-3: t½ ~15 h" color="#FDA4AF" />
                <Label x={s.x(0.9)} y={s.y(0.16)} text="livre: t½ ~10 min" color="#FDE68A" />
                <Label x={s.x(7.6)} y={s.y(0.22)} text="biologicamente ativo por horas após a injeção" color="#E5E7EB" />
            </Fade>
        </g>
    );
};

export const MiniChart = ({ step, synergy }: { step: number; synergy: boolean }) => (
    <svg viewBox={`0 0 ${CHART.w} ${CHART.h}`} className="w-full h-auto block" role="img" aria-label="Mini-gráfico do passo atual (modelo ilustrativo)">
        <AnimatePresence mode="wait">
            <motion.g key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25, ease: EASE }}>
                {step === 0 && <NaturalPlot />}
                {step === 1 && <GhrpPlot synergy={synergy} />}
                {step === 2 && <RhghPlot />}
                {step === 3 && <IgfPlot />}
            </motion.g>
        </AnimatePresence>
    </svg>
);
