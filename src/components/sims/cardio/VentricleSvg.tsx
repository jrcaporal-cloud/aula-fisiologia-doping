import { useRef, type RefObject } from 'react';
import { SvgText } from '../peptide/ui';
import type { CardioVitals } from '../../../data/cardioSteps';
import { signed } from './format';
import { SYSTOLE_END, useHeartFrame, type HeartClock } from './heart';

/*
 * Corte transversal (eixo curto) do ventrículo esquerdo. A cavidade encolhe enquanto a parede
 * engrossa: é o desenho da hipertrofia concêntrica. A silhueta tracejada guarda o ponto de
 * partida do atleta treinado, para a comparação ficar na tela e não só na fala.
 *
 * O batimento é escrito por quadro direto nos atributos (relógio compartilhado), lendo os
 * valores em transição de `vitalsRef`. O que não muda por quadro (cotas, medidor, fibrose)
 * vem de `vitals` e passa pelo React.
 */

/** 1 mm de parede/cavidade = 3,6 px de desenho. */
const MM = 3.6;
const CX = 210;
const CY = 214;
const MYO = '#9F1239';
const MYO_LIGHT = '#E11D48';
const CAVITY = '#0B0B16';
const GAUGE = { x: 336, y: 64, r: 26 };

interface VentricleSvgProps {
    clock: HeartClock;
    /** Valores em transição, lidos por quadro. */
    vitalsRef: RefObject<CardioVitals>;
    /** Mesmos valores, para o que é desenhado pelo React. */
    vitals: CardioVitals;
    /** Ponto de partida (atleta treinado), desenhado como referência tracejada. */
    baseline: CardioVitals;
}

/** Raios em diástole (c = 0) e em sístole (c = 1). */
const radii = (v: CardioVitals, c: number) => {
    const inner = (v.cavidadeMm / 2) * MM * (1 - (v.fe / 100) * 0.34 * c);
    return { inner, outer: inner + v.paredeMm * MM * (1 + 0.22 * c) };
};

/** Manchas de fibrose no miocárdio: direções fixas, opacidade conforme a carga. */
const SPECKLES = [-2.8, -1.9, -0.7, 0.35, 1.4, 2.5];

const feTone = (fe: number) => (fe < 54 ? '#FB7185' : fe < 57 ? '#FCD34D' : '#67E8F9');

export const VentricleSvg = ({ clock, vitalsRef, vitals, baseline }: VentricleSvgProps) => {
    const haloRef = useRef<SVGCircleElement>(null);
    const outerRef = useRef<SVGCircleElement>(null);
    const bloodRef = useRef<SVGCircleElement>(null);
    const innerRef = useRef<SVGCircleElement>(null);
    const pillRef = useRef<SVGRectElement>(null);
    const pillTextRef = useRef<SVGTextElement>(null);
    const lastSystole = useRef<boolean | null>(null);

    useHeartFrame(clock, frame => {
        const v = vitalsRef.current;
        const c = frame.contraction;
        const { inner, outer } = radii(v, c);
        outerRef.current?.setAttribute('r', outer.toFixed(1));
        innerRef.current?.setAttribute('r', inner.toFixed(1));
        bloodRef.current?.setAttribute('r', (inner * 0.9).toFixed(1));
        bloodRef.current?.setAttribute('fill-opacity', (0.1 + 0.16 * (1 - c)).toFixed(3));
        haloRef.current?.setAttribute('r', (outer + 6 + 10 * c).toFixed(1));
        haloRef.current?.setAttribute('stroke-opacity', (0.12 + 0.38 * c).toFixed(3));

        const systole = c > 0.02 && frame.phase < SYSTOLE_END;
        if (systole !== lastSystole.current) {
            lastSystole.current = systole;
            if (pillTextRef.current) pillTextRef.current.textContent = systole ? 'SÍSTOLE' : 'DIÁSTOLE';
            pillRef.current?.setAttribute('fill', systole ? 'rgba(225,29,72,0.45)' : 'rgba(56,189,248,0.16)');
            pillRef.current?.setAttribute('stroke', systole ? '#FB7185' : '#38BDF8');
        }
    });

    const dia = radii(vitals, 0);
    const base = radii(baseline, 0);
    const wallMid = (dia.inner + dia.outer) / 2;
    const dWall = vitals.paredeMm - baseline.paredeMm;
    const dCav = vitals.cavidadeMm - baseline.cavidadeMm;
    const isBaseline = Math.abs(dWall) < 0.5 && Math.abs(dCav) < 0.5;
    const tone = feTone(vitals.fe);

    return (
        <svg viewBox="0 0 420 420" className="h-full w-full" role="img"
            aria-label={`Corte do ventrículo esquerdo: parede ${vitals.paredeMm.toFixed(0)} milímetros, cavidade ${vitals.cavidadeMm.toFixed(0)} milímetros, fração de ejeção ${vitals.fe.toFixed(0)} por cento`}>
            <defs>
                <radialGradient id="cardio-myo" cx="38%" cy="32%">
                    <stop offset="0%" stopColor={MYO_LIGHT} stopOpacity={0.95} />
                    <stop offset="100%" stopColor={MYO} stopOpacity={0.9} />
                </radialGradient>
            </defs>

            {/* Os raios abaixo mudam por quadro; o valor inicial é constante para o React não os sobrescrever. */}
            <circle ref={haloRef} cx={CX} cy={CY} r={150} fill="none" stroke="#FDA4AF" strokeWidth={3} strokeOpacity={0.15} />

            {/* Referência: cavidade do coração treinado, de onde se partiu. */}
            <circle cx={CX} cy={CY} r={base.inner} fill="none" stroke="#38BDF8" strokeOpacity={0.55}
                strokeWidth={2} strokeDasharray="7 6" />

            <circle ref={outerRef} cx={CX} cy={CY} r={140} fill="url(#cardio-myo)" stroke={MYO_LIGHT} strokeWidth={2} />
            <circle ref={innerRef} cx={CX} cy={CY} r={90} fill={CAVITY} />
            <circle ref={bloodRef} cx={CX} cy={CY} r={80} fill={MYO_LIGHT} fillOpacity={0.2} />

            {SPECKLES.map(a => (
                <circle key={a} r={5.5} fill="#FDE68A" opacity={vitals.fibrose * 0.55}
                    cx={CX + Math.cos(a) * wallMid * 0.78} cy={CY + Math.sin(a) * wallMid * 0.78} />
            ))}

            {/* Cota da espessura da parede, do lado do septo. */}
            <line x1={CX - dia.outer} y1={CY} x2={CX - dia.inner} y2={CY} stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={2} />
            <SvgText x={CX - dia.outer - 8} y={CY - 8} anchor="end" size={19} color="#FFFFFF" text={`${vitals.paredeMm.toFixed(0)} mm`} />
            <SvgText x={CX - dia.outer - 8} y={CY + 12} anchor="end" size={16} color="#D1D5DB" text="parede" />

            {/* Cota da cavidade, em diástole. */}
            <line x1={CX - dia.inner} y1={CY + 1} x2={CX + dia.inner} y2={CY + 1} stroke="#38BDF8" strokeOpacity={0.8} strokeWidth={2} />
            <SvgText x={CX} y={CY - 10} anchor="middle" size={19} color="#BAE6FD" text={`${vitals.cavidadeMm.toFixed(0)} mm`} />
            <SvgText x={CX} y={CY + 22} anchor="middle" size={16} color="#D1D5DB" text="cavidade" />

            <SvgText x={CX} y={CY + dia.outer + 28} anchor="middle" size={17} color="#F9A8D4" text="miocárdio" />
            <SvgText x={CX} y={408} anchor="middle" size={16} color={isBaseline ? '#7DD3FC' : '#FDE68A'}
                text={isBaseline ? 'este é o ponto de comparação' : `vs treinado: parede ${signed(dWall)} mm · cavidade ${signed(dCav)} mm`} />

            <SvgText x={14} y={26} size={16} color="#7DD3FC" text="- - -  cavidade do coração treinado" />

            {/* Indicador do ciclo: o texto e a cor são escritos pelo relógio. */}
            <rect ref={pillRef} x={14} y={38} width={116} height={28} rx={14} fill="rgba(56,189,248,0.16)" stroke="#38BDF8" strokeWidth={1.5} />
            <text ref={pillTextRef} x={72} y={58} textAnchor="middle" fontSize={16} fontWeight={700} fill="#FFFFFF"
                style={{ fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}>
                DIÁSTOLE
            </text>

            {/* Medidor da fração de ejeção. */}
            <circle cx={GAUGE.x} cy={GAUGE.y} r={GAUGE.r} fill="rgba(8,8,18,0.7)" stroke="rgba(255,255,255,0.14)" strokeWidth={6} />
            <circle cx={GAUGE.x} cy={GAUGE.y} r={GAUGE.r} fill="none" stroke={tone} strokeWidth={6} strokeLinecap="round"
                pathLength={100} strokeDasharray={`${vitals.fe} ${100 - vitals.fe}`}
                transform={`rotate(-90 ${GAUGE.x} ${GAUGE.y})`} />
            <SvgText x={GAUGE.x} y={GAUGE.y + 7} anchor="middle" size={20} color="#FFFFFF" text={vitals.fe.toFixed(0)} />
            <SvgText x={GAUGE.x} y={GAUGE.y + 52} anchor="middle" size={16} color="#D1D5DB" text="fração de ejeção" />
        </svg>
    );
};
