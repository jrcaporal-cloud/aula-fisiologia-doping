import { motion, useReducedMotion } from 'framer-motion';
import {
    ALT_START, COLLECT_T, PLOT_X0, PLOT_X1, RACE_T, REINFUSE_T, T_DAYS_START, T_END, T_START, T_WEEKS_END, hct, ret, tx,
} from '../transfusion/model';
import { EASE, strokeK, type EchoProps } from './echoKit';
import { EchoSvg, Label } from './EchoParts';

/**
 * Eco do slide "Transfusão Autóloga Homóloga": o mesmo modelo ilustrativo do TransfusionSim
 * (Hct e reticulócitos no tempo, eixo quebrado semanas | dias). Altitude → coleta → bolsa guardada
 * semanas → reinfusão; depois dela, a queda dos reticulócitos.
 */

const LEFT = 44;
const RIGHT = 566;
const SCALE = (RIGHT - LEFT) / (PLOT_X1 - PLOT_X0);
const X = (t: number) => LEFT + (tx(t) - PLOT_X0) * SCALE;

const HCT_LO = 40;
const HCT_HI = 56;
const HY = (v: number) => 252 - ((v - HCT_LO) / (HCT_HI - HCT_LO)) * 170;
const RY = (v: number) => 372 - v * 60;
const AXIS_Y = 262;

const sampled = (from: number, to: number, stepT: number): number[] => {
    const out: number[] = [];
    for (let t = from; t <= to + 1e-9; t += stepT) out.push(t);
    return out;
};
const WEEKS = sampled(T_START, T_WEEKS_END, 0.5);
const DAYS = sampled(T_DAYS_START, T_END, 0.05);

const path = (times: readonly number[], fx: (t: number) => number, fy: (v: number) => number) =>
    times.map((t, i) => `${i === 0 ? 'M' : 'L'}${X(t).toFixed(1)} ${fy(fx(t)).toFixed(1)}`).join(' ');

const HCT_PATH = `${path(WEEKS, hct, HY)} ${path(DAYS, hct, HY)}`;
const RET_PATH = `${path(WEEKS, ret, RY)} ${path(DAYS, ret, RY)}`;
const BREAK_X = (X(T_WEEKS_END) + X(T_DAYS_START)) / 2;

const Bag = ({ k }: { k: number }) => (
    <g>
        <path d="M0 -24 L0 -32 Q0 -36 6 -36 L13 -36" fill="none" stroke="#E5E7EB" strokeWidth={1.8 * k} strokeLinecap="round" />
        <rect x={-15} y={-22} width={30} height={40} rx={8} fill="#9F1239" stroke="#BAE6FD" strokeWidth={2 * k} />
        <rect x={-10} y={-16} width={4} height={28} rx={2} fill="#fff" opacity={0.2} />
        {[0, 60, 120].map(a => {
            const r = (a * Math.PI) / 180;
            return <line key={a} x1={-7 * Math.cos(r)} y1={-7 * Math.sin(r)} x2={7 * Math.cos(r)} y2={7 * Math.sin(r)} stroke="#BAE6FD" strokeWidth={1.5 * k} strokeLinecap="round" />;
        })}
    </g>
);

export const TransfusionEcho = ({ compact }: EchoProps) => {
    const reduce = useReducedMotion() ?? false;
    const k = strokeK(compact);
    const d = (s: number) => (reduce ? 0 : s);
    const xCollect = X(COLLECT_T);
    const xReinf = X(REINFUSE_T);
    const xRace = X(RACE_T);
    const bagY = 40;

    return (
        <EchoSvg label="Hematócrito e reticulócitos: coleta em altitude, bolsa guardada, reinfusão e queda dos reticulócitos">
            {/* treino de altitude */}
            <motion.rect
                x={X(ALT_START)} y={64} width={xCollect - X(ALT_START)} height={AXIS_Y - 64} fill="#60A5FA" fillOpacity={0.1}
                stroke="#60A5FA" strokeOpacity={0.35} strokeDasharray="4 5"
                initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: d(0.5), delay: d(0.3) }}
            />
            <Label compact={compact} x={(X(ALT_START) + xCollect) / 2} y={AXIS_Y - 10} anchor="middle" size={14} weight={600} fill="#BFDBFE" delay={0.4}>
                treino de altitude
            </Label>

            {/* eixo do tempo quebrado */}
            <line x1={LEFT} x2={X(T_WEEKS_END)} y1={AXIS_Y} y2={AXIS_Y} stroke="#fff" strokeOpacity={0.5} strokeWidth={1.5 * k} />
            <line x1={X(T_DAYS_START)} x2={RIGHT} y1={AXIS_Y} y2={AXIS_Y} stroke="#fff" strokeOpacity={0.5} strokeWidth={1.5 * k} />
            <path d={`M${BREAK_X - 9} ${AXIS_Y + 7} l6 -14 M${BREAK_X + 3} ${AXIS_Y + 7} l6 -14`} stroke="#fff" strokeOpacity={0.6} strokeWidth={1.5 * k} />
            <Label compact={compact} x={(LEFT + X(T_WEEKS_END)) / 2} y={AXIS_Y + 22} anchor="middle" size={13} mono fill="#D1D5DB">semanas</Label>
            <Label compact={compact} x={(X(T_DAYS_START) + RIGHT) / 2} y={AXIS_Y + 22} anchor="middle" size={13} mono fill="#D1D5DB">dias</Label>

            {/* curvas */}
            <motion.path d={HCT_PATH} fill="none" stroke="#E11D48" strokeWidth={3 * k} strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: d(2.6), delay: d(0.2), ease: 'easeInOut' }} />
            <motion.path d={RET_PATH} fill="none" stroke="#22D3EE" strokeWidth={3 * k} strokeLinejoin="round"
                initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: d(2.6), delay: d(0.2), ease: 'easeInOut' }} />
            <Label compact={compact} x={LEFT} y={HY(hct(T_START)) - 14} size={15} weight={700} fill="#FDA4AF">Hct</Label>
            <Label compact={compact} x={LEFT} y={RY(ret(T_START)) - 12} size={15} weight={700} fill="#A5F3FC">reticulócitos</Label>

            {/* coleta e reinfusão */}
            {[{ x: xCollect, label: 'coleta', color: '#60A5FA', delay: 1.1, anchor: 'middle' as const },
              { x: xReinf, label: 'reinfusão', color: '#E11D48', delay: 2.6, anchor: 'end' as const }].map(m => (
                <g key={m.label}>
                    <motion.line x1={m.x} x2={m.x} y1={bagY + 26} y2={AXIS_Y} stroke={m.color} strokeWidth={1.5 * k} strokeDasharray="4 4"
                        initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 0.85 }} transition={{ duration: d(0.4), delay: d(m.delay) }} />
                    <Label compact={compact} x={m.anchor === 'end' ? m.x - 8 : m.x} y={bagY + 44} anchor={m.anchor} size={14} weight={700} fill={m.color} delay={m.delay}>
                        {m.label}
                    </Label>
                </g>
            ))}
            <Label compact={compact} x={xRace + 8} y={bagY + 44} size={14} weight={600} fill="#E5E7EB" delay={2.8}>prova</Label>

            {/* a bolsa: guardada por semanas e devolvida */}
            <motion.path d={`M${xCollect} ${bagY} L${xReinf} ${bagY}`} stroke="#BAE6FD" strokeOpacity={0.45} strokeWidth={1.5 * k} strokeDasharray="3 6"
                initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: d(1.3), delay: d(1.3), ease: 'linear' }} />
            <motion.g initial={reduce ? false : { x: xCollect, y: bagY, opacity: 0 }} animate={{ x: xReinf, y: bagY, opacity: 1 }}
                transition={{ x: { duration: d(1.3), delay: d(1.3), ease: EASE }, opacity: { duration: d(0.3), delay: d(1.1) } }}>
                <g transform={compact ? 'scale(1.6)' : undefined}><Bag k={compact ? 1.4 : 1} /></g>
            </motion.g>
            <Label compact={compact} x={xCollect + 4} y={bagY - 10} size={14} weight={600} fill="#BAE6FD" delay={1.6}>
                a própria bolsa · semanas
            </Label>

            {/* queda dos reticulócitos após a reinfusão */}
            <Label compact={compact} x={RIGHT} y={RY(ret(T_END)) + 22} anchor="end" size={14} weight={700} fill="#A5F3FC" delay={3.1}>
                reticulócitos ↓
            </Label>
        </EchoSvg>
    );
};
