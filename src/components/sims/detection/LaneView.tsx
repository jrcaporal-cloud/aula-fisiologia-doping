import { useId } from 'react';
import { motion } from 'framer-motion';
import { EASE_IN_OUT } from '../../../lib/motion';
import { areaAbove, areaUnder, linePath, STRIP_H, type Interval, type LaneBox, type Sample, type YMap } from './geometry';
import { VB, xFromU } from './scales';

export const RED = '#E11D48';
const RED_SOFT = '#FDA4AF';
const MONO = 'JetBrains Mono, ui-monospace, monospace';
const MONO_CHAR = 9.7; // largura média de um caractere mono a 16px
/** Respiro entre a barra e o rótulo que a nomeia (nenhum rótulo encosta no desenho). */
const LABEL_GAP = 14;

export interface StripSpec {
    intervals: Interval[];
    label: string;
}

export interface LaneSpec {
    box: LaneBox;
    title: string;
    badge: string;
    color: string;
    y: YMap;
    main: Sample[];
    /** Segunda curva tracejada (metabólito urinário). */
    secondary?: Sample[];
    effectThr?: number;
    detectThr?: number;
    effect?: StripSpec;
    detect?: StripSpec;
    /** Curva de área (ganho estrutural) em vez de linha + limiares. */
    area?: boolean;
    /** Escreve o nome dos limiares sobre as linhas (só onde há espaço). */
    thresholdLabels?: boolean;
    reveal: { duration: number; delay: number };
}

interface StripProps {
    spec: StripSpec;
    y: number;
    fill: string;
    textColor: string;
    stroke?: string;
}

const StripLabel = ({ end, y, text, color }: { end: number; y: number; text: string; color: string }) => {
    const w = text.length * MONO_CHAR;
    const outside = end + LABEL_GAP + w < VB.pr;
    const x = outside ? end + LABEL_GAP : Math.max(end - LABEL_GAP - 8 - w, VB.pl + 4);
    return (
        <g>
            <rect x={x - 6} y={y - 1} width={w + 12} height={STRIP_H + 2} rx={4} fill="#050510" fillOpacity={0.94} />
            <text x={x} y={y + STRIP_H / 2 + 5.5} fontSize={16} fontFamily={MONO} fill={color}>{text}</text>
        </g>
    );
};

const Strip = ({ spec, y, fill, textColor, stroke }: StripProps) => {
    const last = spec.intervals[spec.intervals.length - 1];
    return (
        <g>
            <rect x={VB.pl} y={y} width={VB.pr - VB.pl} height={STRIP_H} rx={3} fill="rgba(255,255,255,0.035)" />
            {spec.intervals.map(([u0, u1]) => (
                <rect key={u0} x={xFromU(u0)} y={y} width={Math.max(xFromU(u1) - xFromU(u0), 1.5)} height={STRIP_H} rx={3}
                    fill={fill} stroke={stroke} strokeWidth={stroke ? 1 : 0} />
            ))}
            {last && <StripLabel end={xFromU(last[1])} y={y} text={spec.label} color={textColor} />}
        </g>
    );
};

const ThresholdLine = ({ y, color, dash, label, labelBelow }: { y: number; color: string; dash: string; label: string; labelBelow?: boolean }) => (
    <g>
        <line x1={VB.pl} x2={VB.pr} y1={y} y2={y} stroke={color} strokeWidth={1.4} strokeDasharray={dash} strokeOpacity={0.9} />
        {label && <text x={VB.pr - 4} y={labelBelow ? y + 16 : y - 6} textAnchor="end" fontSize={16} fontFamily={MONO} fill={color}
            stroke="#050510" strokeWidth={3} paintOrder="stroke">{label}</text>}
    </g>
);

interface LaneViewProps {
    spec: LaneSpec;
    hatchId: string;
}

export const LaneView = ({ spec, hatchId }: LaneViewProps) => {
    const clipId = useId();
    const { box, y, color } = spec;
    const plotH = box.plotBottom - box.plotTop;
    return (
        <g>
            <defs>
                <clipPath id={clipId}>
                    <motion.rect x={VB.pl - 2} y={box.top} width={VB.pr - VB.pl + 4} height={box.bottom - box.top + 2}
                        style={{ originX: 0 }} initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                        transition={{ duration: spec.reveal.duration, delay: spec.reveal.delay, ease: EASE_IN_OUT }} />
                </clipPath>
            </defs>

            {/* Cabeçalho da faixa */}
            <circle cx={VB.pl + 6} cy={box.top + 11} r={5.5} fill={color} />
            <text x={VB.pl + 18} y={box.top + 17} fontSize={16.5} fill="#fff" stroke="#050510" strokeWidth={4} paintOrder="stroke" style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                {spec.title}
            </text>
            {/* Selo da fase na outra ponta do cabeçalho: longe do título e do começo da curva. */}
            <text x={VB.pr - 4} y={box.top + 17} textAnchor="end" fontSize={15.2} fontFamily={MONO} fill={color} letterSpacing={0.3}
                stroke="#050510" strokeWidth={4} paintOrder="stroke">{spec.badge}</text>

            {/* Fundo do gráfico com décadas */}
            <rect x={VB.pl} y={box.plotTop} width={VB.pr - VB.pl} height={plotH} rx={6} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.08)" />
            {!spec.area && [0.25, 0.5, 0.75].map(f => (
                <line key={f} x1={VB.pl} x2={VB.pr} y1={box.plotTop + f * plotH} y2={box.plotTop + f * plotH} stroke="rgba(255,255,255,0.05)" />
            ))}

            <g clipPath={`url(#${clipId})`}>
                {spec.area ? (
                    <>
                        <path d={areaUnder(spec.main, y, box.plotBottom)} fill={color} fillOpacity={0.3} />
                        <path d={linePath(spec.main, y)} fill="none" stroke={color} strokeWidth={2.4} strokeLinejoin="round" />
                    </>
                ) : (
                    <>
                        {spec.effectThr !== undefined && <path d={areaAbove(spec.main, spec.effectThr, y)} fill={color} fillOpacity={0.2} />}
                        {spec.secondary && (
                            <path d={linePath(spec.secondary, y)} fill="none" stroke={color} strokeOpacity={0.85} strokeWidth={2} strokeDasharray="7 5" />
                        )}
                        <path d={linePath(spec.main, y)} fill="none" stroke={color} strokeWidth={2.4} strokeLinejoin="round" />
                    </>
                )}
                {spec.effect && <Strip spec={spec.effect} y={box.effY} fill={color} textColor={color} />}
                {spec.detect && <Strip spec={spec.detect} y={box.detY} fill={`url(#${hatchId})`} stroke={RED} textColor={RED_SOFT} />}
            </g>

            {spec.effectThr !== undefined && (
                <ThresholdLine y={y(spec.effectThr)} color={color} dash="2 4" label={spec.thresholdLabels ? 'limiar de efeito' : ''} />
            )}
            {spec.detectThr !== undefined && (
                <ThresholdLine y={y(spec.detectThr)} color={RED_SOFT} dash="8 5" label={spec.thresholdLabels ? 'limite de detecção' : ''} labelBelow />
            )}
        </g>
    );
};
