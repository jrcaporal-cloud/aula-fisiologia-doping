import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { REFERENCE_ID, STEROIDS, type SteroidData } from './data';
import { Shape } from './markers';
import { shapeOf } from './markerShapes';
import {
    ANAB_DOMAIN, ANAB_TICKS, ANDRO_DOMAIN, ANDRO_TICKS, MAP_MARGIN, MAP_W, RATIO_LINES, mapGeometry,
    type MapGeometry,
} from './scales';

interface ProfileMapProps {
    height: number;
    step: number;
    selectedId: string;
    onSelect: (id: string) => void;
}

type Anchor = 'start' | 'middle' | 'end';

/** Posição do rótulo de cada ponto (os de anabólico ~320 ficam quase na mesma altura). */
const LABEL_OFFSET: Record<string, { dx: number; dy: number; anchor: Anchor }> = {
    test: { dx: 16, dy: 5, anchor: 'start' },
    dianabol: { dx: 16, dy: 5, anchor: 'start' },
    nandrolona: { dx: 0, dy: -18, anchor: 'middle' },
    trembolona: { dx: -16, dy: 5, anchor: 'end' },
    winstrol: { dx: 0, dy: 28, anchor: 'middle' },
    oxandrolona: { dx: -8, dy: -18, anchor: 'start' },
    primobolan: { dx: 0, dy: 28, anchor: 'middle' },
    hemogenin: { dx: 16, dy: 5, anchor: 'start' },
};

/** Texto de eixos, marcas e anotações do mapa: ≥ 16 px de projeto (o SVG é desenhado em px reais). */
const AXIS_FONT = 16;

const TEXT_HALO = { paintOrder: 'stroke', stroke: '#050510', strokeWidth: 4, strokeLinejoin: 'round' } as const;

export const ProfileMap = ({ height, step, selectedId, onSelect }: ProfileMapProps) => {
    const g = mapGeometry(height);
    const plotBottom = MAP_MARGIN.top + g.plotH;
    const plotRight = MAP_MARGIN.left + g.plotW;
    const selected = STEROIDS.find(s => s.id === selectedId);
    const guided = selected && (step > 0 || selected.id === REFERENCE_ID) ? selected : undefined;

    return (
        <svg width={MAP_W} height={height} className="block select-none" role="img"
            aria-label="Mapa de dispersão: potência anabólica versus androgênica, escala logarítmica, testosterona = 100">
            <defs>
                <clipPath id="spv-plot">
                    <rect x={MAP_MARGIN.left} y={MAP_MARGIN.top} width={g.plotW} height={g.plotH} />
                </clipPath>
            </defs>

            <Zones g={g} showLabels={step < 2} />
            <Grid g={g} plotBottom={plotBottom} plotRight={plotRight} guided={guided} />
            <RatioLines g={g} step={step} />
            <SelectionGuides g={g} plotBottom={plotBottom} selected={guided} />

            {STEROIDS.map((s, i) => (
                <Point key={s.id} s={s} g={g} order={i}
                    visible={step >= 1 || s.id === REFERENCE_ID}
                    selected={s.id === selectedId}
                    showReference={step === 0 && s.id === REFERENCE_ID}
                    onSelect={onSelect} />
            ))}

            {/* Títulos dos eixos */}
            <text x={MAP_MARGIN.left + g.plotW / 2} y={height - 7} textAnchor="middle"
                className="fill-zinc-200 font-body" fontSize={AXIS_FONT}>
                Potência androgênica (virilização) · Test = 100 · escala log
            </text>
            <text transform={`translate(17 ${MAP_MARGIN.top + g.plotH / 2}) rotate(-90)`} textAnchor="middle"
                className="fill-zinc-200 font-body" fontSize={AXIS_FONT}>
                Potência anabólica · Test = 100 · log
            </text>
        </svg>
    );
};

/* ---------- Fundo: as duas zonas separadas pela diagonal 1:1 ---------- */

const Zones = ({ g, showLabels }: { g: MapGeometry; showLabels: boolean }) => {
    const reduce = useReducedMotion();
    const lo = Math.max(ANDRO_DOMAIN.min, ANAB_DOMAIN.min);
    const hi = Math.min(ANDRO_DOMAIN.max, ANAB_DOMAIN.max);
    const [x0, y0, x1, y1] = [g.x(lo), g.y(lo), g.x(hi), g.y(hi)];
    const left = MAP_MARGIN.left;
    const top = MAP_MARGIN.top;
    const right = left + g.plotW;
    const bottom = top + g.plotH;
    const angle = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    // Ponto da diagonal onde ficam os rótulos das zonas (entre a testosterona e a trembolona).
    const mid = 230;
    const [mx, my] = [g.x(mid), g.y(mid)];

    return (
        <g clipPath="url(#spv-plot)">
            <rect x={left} y={top} width={g.plotW} height={g.plotH} fill="rgba(255,255,255,0.025)" />
            <polygon points={`${left},${top} ${x1},${y1} ${x0},${y0} ${left},${bottom}`} fill="rgba(16,185,129,0.06)" />
            <polygon points={`${x0},${y0} ${x1},${y1} ${right},${top} ${right},${bottom}`} fill="rgba(225,29,72,0.07)" />
            <motion.g transform={`translate(${mx} ${my}) rotate(${angle})`} initial={false}
                animate={{ opacity: showLabels ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.3 }}>
                <text y={-12} textAnchor="middle" fontSize={AXIS_FONT} className="fill-emerald-300 font-body font-semibold">
                    ↑ mais anabólico que androgênico
                </text>
                <text y={24} textAnchor="middle" fontSize={AXIS_FONT} className="fill-rose-300 font-body font-semibold">
                    ↓ mais androgênico que anabólico
                </text>
            </motion.g>
        </g>
    );
};

/* ---------- Grade e marcas dos eixos ---------- */

interface GridProps { g: MapGeometry; plotBottom: number; plotRight: number; guided: SteroidData | undefined }

/** Distância mínima (px) entre uma marca do eixo e a etiqueta do valor selecionado. */
const PILL_CLEARANCE = 30;

const Grid = ({ g, plotBottom, plotRight, guided }: GridProps) => {
    const hideX = (t: number) => guided !== undefined && Math.abs(g.x(t) - g.x(guided.androgenic)) < PILL_CLEARANCE;
    const hideY = (t: number) => guided !== undefined && Math.abs(g.y(t) - g.y(guided.anabolic)) < PILL_CLEARANCE * 0.7;
    return (
        <g>
            {ANDRO_TICKS.map(t => (
                <g key={`x${t}`}>
                    <line x1={g.x(t)} x2={g.x(t)} y1={MAP_MARGIN.top} y2={plotBottom}
                        stroke={t === 100 ? 'rgba(96,165,250,0.35)' : 'rgba(255,255,255,0.07)'} strokeDasharray={t === 100 ? '3 4' : undefined} />
                    <text x={g.x(t)} y={plotBottom + 19} textAnchor="middle" fontSize={AXIS_FONT} opacity={hideX(t) ? 0 : 1}
                        className={t === 100 ? 'fill-blue-300 font-mono' : 'fill-zinc-300 font-mono'}>{t}</text>
                </g>
            ))}
            {ANAB_TICKS.map(t => (
                <g key={`y${t}`}>
                    <line x1={MAP_MARGIN.left} x2={plotRight} y1={g.y(t)} y2={g.y(t)}
                        stroke={t === 100 ? 'rgba(96,165,250,0.35)' : 'rgba(255,255,255,0.07)'} strokeDasharray={t === 100 ? '3 4' : undefined} />
                    <text x={MAP_MARGIN.left - 8} y={g.y(t) + 5} textAnchor="end" fontSize={AXIS_FONT} opacity={hideY(t) ? 0 : 1}
                        className={t === 100 ? 'fill-blue-300 font-mono' : 'fill-zinc-300 font-mono'}>{t}</text>
                </g>
            ))}
            <rect x={MAP_MARGIN.left} y={MAP_MARGIN.top} width={g.plotW} height={g.plotH}
                fill="none" stroke="rgba(255,255,255,0.14)" />
        </g>
    );
};

/* ---------- Retas de razão constante ---------- */

const RatioLines = ({ g, step }: { g: MapGeometry; step: number }) => {
    const reduce = useReducedMotion();
    return (
        <g>
            {RATIO_LINES.map(({ k, label }) => {
                // Segmento de anab = k·andro recortado pelo domínio dos dois eixos.
                const a0 = Math.max(ANDRO_DOMAIN.min, ANAB_DOMAIN.min / k);
                const a1 = Math.min(ANDRO_DOMAIN.max, ANAB_DOMAIN.max / k);
                const main = k === 1;
                const visible = main || step >= 1;
                const [x0, y0, x1, y1] = [g.x(a0), g.y(a0 * k), g.x(a1), g.y(a1 * k)];
                return (
                    <motion.g key={k} initial={false} animate={{ opacity: visible ? 1 : 0 }}
                        transition={{ duration: reduce ? 0 : 0.6, delay: visible && !main ? 0.9 : 0 }}>
                        <motion.line x1={x0} y1={y0} x2={x1} y2={y1}
                            stroke={main ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.28)'}
                            strokeWidth={main ? 1.8 : 1.2} strokeDasharray={main ? undefined : '5 6'}
                            initial={main && !reduce ? { pathLength: 0 } : false}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }} />
                        {/* 1:1 à direita da reta, logo abaixo do canto; 3:1 e 10:1 na borda de cima */}
                        <text x={main ? x1 - 3 : x1 + 5} y={main ? y1 + 40 : y1 + 15} fontSize={AXIS_FONT}
                            textAnchor={main ? 'end' : 'start'}
                            className={main ? 'fill-white font-mono font-semibold' : 'fill-zinc-300 font-mono'}>
                            {label}
                        </text>
                    </motion.g>
                );
            })}
        </g>
    );
};

/* ---------- Guias do composto selecionado até os eixos ---------- */

interface GuidesProps { g: MapGeometry; plotBottom: number; selected: SteroidData | undefined }

const SelectionGuides = ({ g, plotBottom, selected }: GuidesProps) => {
    if (!selected) return null;
    const px = g.x(selected.androgenic);
    const py = g.y(selected.anabolic);
    return (
        <AnimatePresence>
            <motion.g key={selected.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}>
                <line x1={px} x2={px} y1={py} y2={plotBottom} stroke={selected.color} strokeOpacity={0.7} strokeDasharray="2 4" />
                <line x1={MAP_MARGIN.left} x2={px} y1={py} y2={py} stroke={selected.color} strokeOpacity={0.7} strokeDasharray="2 4" />
                <ValuePill x={px} y={plotBottom + 15} value={selected.androgenic} color={selected.color} />
                <ValuePill x={MAP_MARGIN.left - 24} y={py} value={selected.anabolic} color={selected.color} />
            </motion.g>
        </AnimatePresence>
    );
};

const ValuePill = ({ x, y, value, color }: { x: number; y: number; value: number; color: string }) => (
    <g transform={`translate(${x} ${y})`}>
        <rect x={-21} y={-11} width={42} height={22} rx={6} fill="#050510" stroke={color} strokeWidth={1.4} />
        <text y={5.2} textAnchor="middle" fontSize={AXIS_FONT} className="font-mono font-bold" fill={color}>{value}</text>
    </g>
);

/* ---------- Ponto de cada composto ---------- */

interface PointProps {
    s: SteroidData;
    g: MapGeometry;
    order: number;
    visible: boolean;
    selected: boolean;
    showReference: boolean;
    onSelect: (id: string) => void;
}

const Point = ({ s, g, order, visible, selected, showReference, onSelect }: PointProps) => {
    const reduce = useReducedMotion();
    const label = LABEL_OFFSET[s.id] ?? { dx: 15, dy: 5, anchor: 'start' as const };
    return (
        <g transform={`translate(${g.x(s.androgenic)} ${g.y(s.anabolic)})`}
            style={{ pointerEvents: visible ? 'auto' : 'none', cursor: 'pointer' }}
            onClick={() => onSelect(s.id)}>
            <motion.g
                initial={false}
                animate={{ opacity: visible ? 1 : 0, scale: visible ? 1 : 0.2 }}
                transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 20, delay: visible ? 0.1 + order * 0.09 : 0 }}
            >
                {selected && (
                    <motion.circle r={15} fill="none" stroke={s.color} strokeWidth={2}
                        initial={{ opacity: 0.9, scale: 1 }}
                        animate={reduce ? { opacity: 0.6 } : { opacity: [0.9, 0], scale: [1, 1.9] }}
                        transition={reduce ? { duration: 0 } : { duration: 1.6, repeat: Infinity, ease: 'easeOut' }} />
                )}
                <circle r={18} fill="transparent" />
                <g style={{ filter: `drop-shadow(0 0 ${selected ? 10 : 4}px ${s.color})` }}>
                    <Shape shape={shapeOf(s.id)} r={selected ? 10.5 : 8.5} fill={s.color}
                        stroke={selected ? '#fff' : '#050510'} strokeWidth={selected ? 2.2 : 2} />
                </g>
                <text x={label.dx} y={label.dy} textAnchor={label.anchor} fontSize={AXIS_FONT}
                    className={selected ? 'font-body font-bold' : 'font-body font-semibold'}
                    fill={selected ? '#fff' : s.color} style={TEXT_HALO}>
                    {s.short}
                </text>
                {showReference && (
                    <text x={label.dx} y={label.dy + 19} fontSize={AXIS_FONT} className="fill-blue-200 font-mono" style={TEXT_HALO}>
                        referência · 100 × 100
                    </text>
                )}
            </motion.g>
        </g>
    );
};
