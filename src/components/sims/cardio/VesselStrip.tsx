import { useRef, type RefObject } from 'react';
import { SvgText } from '../peptide/ui';
import type { CardioVitals } from '../../../data/cardioSteps';
import { br } from './format';
import { flowWave, pressureShape, rigidity, useHeartFrame, type HeartClock } from './heart';

/*
 * Artéria em corte longitudinal: mostra o que muda no vaso, não no músculo.
 *  - hematócrito: quantas hemácias passam (a densidade segue o número);
 *  - viscosidade: a velocidade média cai com ela;
 *  - batimento: o fluxo surge na sístole e quase para na diástole;
 *  - pressão: a parede distende no pulso, e menos quando a aorta está rígida;
 *  - placa: estreita o lúmen, e as hemácias se espremem e aceleram ao passar por ela.
 * Tudo é escrito por quadro, lendo `vitalsRef`; só os rótulos passam pelo React.
 * Densidade e velocidade são ilustrativas, não proporcionais.
 */

const W = 500;
const H = 136;
const MID = 70;
const WALL = 36;
const PLAQUE_X = 330;
const PLAQUE_HALF = 70;
const CELL_COUNT = 34;
/** Velocidade de referência em px/s; a média real sai ~60% disso por causa do pulso. */
const SPEED = 380;

interface Cell {
    x: number;
    /** Posição entre as paredes de -1 a 1. */
    lane: number;
    r: number;
    /** Opacidade atual (-1 = ainda não inicializada). */
    alpha: number;
}

const makeCells = (): Cell[] =>
    Array.from({ length: CELL_COUNT }, (_, i) => ({
        x: ((i * 0.618034) % 1) * W,
        lane: (((i * 0.381966 * 11) % 1) * 2) - 1,
        r: 5.5 + (i % 3) * 1.1,
        alpha: -1,
    }));

/** Posição inicial e raio de cada hemácia, só para o primeiro desenho (o movimento é por quadro). */
const CELL_SEEDS: readonly Cell[] = makeCells();

/** Perfil da placa ao longo do vaso: 1 no centro, 0 nas bordas. */
const plaqueProfile = (x: number) => {
    const u = (x - PLAQUE_X) / PLAQUE_HALF;
    return u * u >= 1 ? 0 : 1 - u * u;
};

const clamp = (x: number, lo: number, hi: number) => (x < lo ? lo : x > hi ? hi : x);

interface VesselStripProps {
    clock: HeartClock;
    vitalsRef: RefObject<CardioVitals>;
    vitals: CardioVitals;
}

export const VesselStrip = ({ clock, vitalsRef, vitals }: VesselStripProps) => {
    const cells = useRef<Cell[]>(makeCells());
    const cellEls = useRef<(SVGCircleElement | null)[]>([]);
    const topRef = useRef<SVGLineElement>(null);
    const bottomRef = useRef<SVGLineElement>(null);
    const plaqueRef = useRef<SVGPathElement>(null);

    useHeartFrame(clock, frame => {
        const v = vitalsRef.current;
        const rigid = rigidity(v);
        // A parede distende com o pulso; a aorta rígida distende menos.
        const half = WALL * (1 + 0.09 * (1 - 0.65 * rigid) * pressureShape(frame.phase, rigid));
        const top = MID - half;
        const bottom = MID + half;
        const depth = v.placa * 27;
        const wallWidth = (2.5 + 2 * rigid).toFixed(1);

        topRef.current?.setAttribute('y1', top.toFixed(1));
        topRef.current?.setAttribute('y2', top.toFixed(1));
        topRef.current?.setAttribute('stroke-width', wallWidth);
        bottomRef.current?.setAttribute('y1', bottom.toFixed(1));
        bottomRef.current?.setAttribute('y2', bottom.toFixed(1));
        bottomRef.current?.setAttribute('stroke-width', wallWidth);
        plaqueRef.current?.setAttribute(
            'd', `M${PLAQUE_X - PLAQUE_HALF} ${top.toFixed(1)} Q${PLAQUE_X} ${(top + depth * 2).toFixed(1)} ${PLAQUE_X + PLAQUE_HALF} ${top.toFixed(1)} Z`);
        plaqueRef.current?.setAttribute('fill-opacity', depth < 0.5 ? '0' : '0.88');

        // Fluxo pulsátil: surto na sístole, quase parado na diástole. Mais viscoso, mais lento.
        const flow = 0.3 + 1.7 * flowWave(frame.phase);
        const baseSpeed = SPEED / Math.pow(v.viscosidade, 0.7);
        const visible = clamp(Math.round(8 + ((v.hct - 44) / 12) * 26), 6, CELL_COUNT);

        cells.current.forEach((cell, i) => {
            const lumenTop = top + depth * plaqueProfile(cell.x);
            const span = bottom - lumenTop;
            // Continuidade: onde o lúmen estreita, o fluxo acelera.
            const accel = Math.min(2.4, (2 * half) / span);
            cell.x += baseSpeed * flow * accel * frame.dt;
            if (cell.x > W + 12) cell.x -= W + 24;

            const target = i < visible ? 0.92 : 0;
            cell.alpha = cell.alpha < 0 || frame.dt === 0 ? target : cell.alpha + (target - cell.alpha) * Math.min(1, frame.dt * 6);
            const room = Math.max(span / 2 - cell.r - 1, 0);
            const el = cellEls.current[i];
            if (!el) return;
            el.setAttribute('cx', cell.x.toFixed(1));
            el.setAttribute('cy', ((lumenTop + bottom) / 2 + cell.lane * room).toFixed(1));
            el.setAttribute('fill-opacity', cell.alpha.toFixed(2));
        });
    });

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img"
            aria-label={`Artéria com hematócrito ${vitals.hct.toFixed(0)} por cento e viscosidade ${br(vitals.viscosidade, 2)} vezes a do plasma`}>
            <defs>
                <clipPath id="cardio-lumen">
                    <rect x={0} y={MID - WALL - 6} width={W} height={WALL * 2 + 12} />
                </clipPath>
            </defs>

            <rect x={0} y={MID - WALL} width={W} height={WALL * 2} fill="#0B0B16" />

            <g clipPath="url(#cardio-lumen)">
                {CELL_SEEDS.map((cell, i) => (
                    <circle key={i} ref={el => { cellEls.current[i] = el; }} cx={cell.x} cy={MID} r={cell.r} fill="#E11D48" fillOpacity={0} />
                ))}
            </g>

            <path ref={plaqueRef} d="" fill="#F59E0B" fillOpacity={0} />
            <line ref={topRef} x1={0} x2={W} y1={MID - WALL} y2={MID - WALL} stroke="#FDA4AF" strokeWidth={2.5} />
            <line ref={bottomRef} x1={0} x2={W} y1={MID + WALL} y2={MID + WALL} stroke="#FDA4AF" strokeWidth={2.5} />

            <SvgText x={10} y={18} size={16} color="#9CA3AF" text="artéria em corte" />
            {vitals.placa > 0.2 && <SvgText x={PLAQUE_X} y={MID - WALL - 8} anchor="middle" size={17} color="#FDE68A" text="placa" />}
            <SvgText x={10} y={H - 8} size={17} color="#D1D5DB"
                text={`fluxo →  hemácias ${vitals.hct.toFixed(0)}%  ·  viscosidade ${br(vitals.viscosidade, 2)}×`} />
        </svg>
    );
};
