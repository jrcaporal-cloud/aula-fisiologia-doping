import { useRef, type RefObject } from 'react';
import { SvgText } from '../peptide/ui';
import type { CardioVitals } from '../../../data/cardioSteps';
import { heartHz, pressureShape, rigidity, useHeartFrame, type HeartClock } from './heart';

/*
 * Pulso arterial: a pressão rolando da esquerda para a direita, na mesma fase do batimento do
 * ventrículo. Pressão mais alta, subida mais brusca (aorta rígida) e entalhe dicrótico se leem
 * na própria onda. A onda tracejada é a do coração treinado, de onde se partiu.
 * O desenho é escrito por quadro; só o número ao lado passa pelo React.
 */

const W = 500;
const H = 112;
const X0 = 10;
const PLOT_W = 372;
const TOP = 14;
const BOTTOM = 86;
const P_MIN = 60;
const P_MAX = 170;
/** Segundos de pulso visíveis na janela. */
const WINDOW_S = 3.2;
const POINTS = 120;
const LIMIT = 130;

const yOf = (p: number) => {
    const y = BOTTOM - ((p - P_MIN) / (P_MAX - P_MIN)) * (BOTTOM - TOP);
    return y < TOP ? TOP : y > BOTTOM ? BOTTOM : y;
};

interface PressureTraceProps {
    clock: HeartClock;
    vitalsRef: RefObject<CardioVitals>;
    vitals: CardioVitals;
    baseline: CardioVitals;
}

export const PressureTrace = ({ clock, vitalsRef, vitals, baseline }: PressureTraceProps) => {
    const lineRef = useRef<SVGPathElement>(null);
    const areaRef = useRef<SVGPathElement>(null);
    const ghostRef = useRef<SVGPathElement>(null);
    const dotRef = useRef<SVGGElement>(null);

    useHeartFrame(clock, frame => {
        const v = vitalsRef.current;
        const hz = heartHz(v);
        const rigid = rigidity(v);
        const rigidBase = rigidity(baseline);
        let line = '';
        let ghost = '';
        let lastY = BOTTOM;
        for (let i = 0; i <= POINTS; i++) {
            const u = i / POINTS;
            // Fase que a pressão tinha naquele ponto da janela (o presente fica na borda direita).
            const phase = (((frame.phase - (1 - u) * WINDOW_S * hz) % 1) + 1) % 1;
            const x = (X0 + u * PLOT_W).toFixed(1);
            lastY = yOf(v.paDiast + (v.paSist - v.paDiast) * pressureShape(phase, rigid));
            const gy = yOf(baseline.paDiast + (baseline.paSist - baseline.paDiast) * pressureShape(phase, rigidBase));
            line += `${i === 0 ? 'M' : 'L'}${x} ${lastY.toFixed(1)} `;
            ghost += `${i === 0 ? 'M' : 'L'}${x} ${gy.toFixed(1)} `;
        }
        lineRef.current?.setAttribute('d', line);
        areaRef.current?.setAttribute('d', `${line}L${X0 + PLOT_W} ${BOTTOM} L${X0} ${BOTTOM} Z`);
        ghostRef.current?.setAttribute('d', ghost);
        dotRef.current?.setAttribute('transform', `translate(${X0 + PLOT_W} ${lastY.toFixed(1)})`);
    });

    const high = vitals.paSist >= 140;
    const valueColor = high ? '#FB7185' : vitals.paSist >= 130 ? '#FCD34D' : '#67E8F9';

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img"
            aria-label={`Pulso arterial ${vitals.paSist.toFixed(0)} por ${vitals.paDiast.toFixed(0)} milímetros de mercúrio`}>
            <defs>
                <linearGradient id="cardio-pulse" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E11D48" stopOpacity={0.34} />
                    <stop offset="100%" stopColor="#E11D48" stopOpacity={0} />
                </linearGradient>
            </defs>

            {/* Faixa acima do limite de 130 mmHg. */}
            <rect x={X0} y={TOP} width={PLOT_W} height={yOf(LIMIT) - TOP} fill="rgba(252,211,77,0.07)" />
            <line x1={X0} y1={yOf(LIMIT)} x2={X0 + PLOT_W} y2={yOf(LIMIT)} stroke="#FCD34D" strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="5 5" />
            <SvgText x={X0 + 4} y={yOf(LIMIT) - 5} size={16} color="#FDE68A" text="130" />

            <path ref={areaRef} d="" fill="url(#cardio-pulse)" />
            <path ref={ghostRef} d="" fill="none" stroke="#38BDF8" strokeOpacity={0.6} strokeWidth={2} strokeDasharray="6 5" />
            <path ref={lineRef} d="" fill="none" stroke="#FB7185" strokeWidth={3} strokeLinejoin="round" />
            {/* Ponto do instante atual, na borda direita da janela. */}
            <g ref={dotRef} transform={`translate(${X0 + PLOT_W} ${BOTTOM})`}>
                <circle r={9} fill="#FB7185" fillOpacity={0.25} />
                <circle r={4.5} fill="#FFFFFF" />
            </g>

            <SvgText x={X0 + 4} y={H - 5} size={16} color="#7DD3FC" text="- - -  treinado" />

            <SvgText x={402} y={28} size={16} color="#D1D5DB" text="pulso arterial" />
            <SvgText x={402} y={60} size={28} color={valueColor} weight={700}
                text={`${vitals.paSist.toFixed(0)}/${vitals.paDiast.toFixed(0)}`} />
            <SvgText x={402} y={82} size={16} color="#D1D5DB" text="mmHg" />
        </svg>
    );
};
