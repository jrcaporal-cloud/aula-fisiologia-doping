import { motion, useReducedMotion } from 'framer-motion';
import { DOSE_MAX, DOSE_MIN, STAGES, gainAt } from '../dose/model';
import { EASE, strokeK, type EchoProps } from './echoKit';
import { EchoSvg, Label } from './EchoParts';

/**
 * Eco do slide "O Paradoxo da Dose": os 4 pontos da aula (Fisiol./100/300/600+ mg → ~0/+1,2/+3,5/+6,0 kg)
 * e a mesma curva ilustrativa daquele simulador; embaixo, a régua de semanas com a faixa 3ª–10ª do achado.
 */

const X0 = 80;
const X1 = 560;
const Y_TOP = 52;
const Y_BOT = 250;
const D_MIN = -40;
const D_MAX = 660;
const G_MAX = 7;

const sx = (dose: number) => X0 + ((dose - D_MIN) / (D_MAX - D_MIN)) * (X1 - X0);
const sy = (kg: number) => Y_BOT - (kg / G_MAX) * (Y_BOT - Y_TOP);

const CURVE = (() => {
    const pts: string[] = [];
    for (let d = DOSE_MIN; d <= DOSE_MAX; d += 10) pts.push(`${sx(d).toFixed(1)},${sy(gainAt(d)).toFixed(1)}`);
    return `M${pts.join('L')}`;
})();

/** Posição do rótulo de ganho de cada ponto (fora da curva). */
const GAIN_LABEL: Record<string, { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' }> = {
    fisio: { dx: 0, dy: -24, anchor: 'middle' },
    trt: { dx: 18, dy: 20, anchor: 'start' },
    supra: { dx: -16, dy: -14, anchor: 'end' },
    abuso: { dx: -16, dy: -14, anchor: 'end' },
};

const RULER_Y = 356;
const WEEK_X = (w: number) => X0 + (w / 12) * (X1 - X0);
const BAND = { from: 3, to: 10 } as const;

export const DoseEcho = ({ compact }: EchoProps) => {
    const reduce = useReducedMotion() ?? false;
    const k = strokeK(compact);
    const d = (s: number) => (reduce ? 0 : s);

    return (
        <EchoSvg label="Curva dose-resposta da testosterona e faixa da 3ª à 10ª semana">
            <defs>
                <linearGradient id="gf-dose-grad" gradientUnits="userSpaceOnUse" x1={sx(0)} x2={sx(600)} y1="0" y2="0">
                    <stop offset="0%" stopColor="#A1A1AA" />
                    <stop offset="22%" stopColor="#60A5FA" />
                    <stop offset="55%" stopColor="#F87171" />
                    <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
            </defs>

            <Label compact={compact} x={X0} y={30} size={13} mono fill="#D1D5DB" weight={600}>DOSE · GANHO DE MASSA MAGRA</Label>

            {/* eixos */}
            <line x1={X0} x2={X1} y1={Y_BOT} y2={Y_BOT} stroke="#fff" strokeOpacity={0.55} strokeWidth={1.5 * k} />
            <line x1={X0} x2={X0} y1={Y_TOP - 6} y2={Y_BOT} stroke="#fff" strokeOpacity={0.55} strokeWidth={1.5 * k} />

            {/* curva do simulador da dose (modelo ilustrativo) */}
            <motion.path
                d={CURVE} fill="none" stroke="url(#gf-dose-grad)" strokeWidth={4 * k} strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: d(1.3), delay: d(1.4), ease: EASE }}
            />

            {/* pontos da aula */}
            {STAGES.map((s, i) => {
                const px = sx(s.dose);
                const py = sy(s.gain);
                return (
                    <g key={s.id}>
                        <motion.line
                            x1={px} x2={px} y1={Y_BOT} stroke={s.color} strokeWidth={2 * k} strokeDasharray={compact ? undefined : '4 5'} strokeOpacity={0.7}
                            initial={reduce ? false : { y2: Y_BOT }} animate={{ y2: py }}
                            transition={{ duration: d(0.7), delay: d(0.2 + i * 0.3), ease: EASE }}
                        />
                        <motion.g
                            initial={reduce ? false : { opacity: 0, y: Y_BOT - py }} animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: d(0.7), delay: d(0.2 + i * 0.3), ease: EASE }}
                        >
                            <circle cx={px} cy={py} r={9 * k} fill="#050510" stroke={s.color} strokeWidth={3 * k} />
                            <circle cx={px} cy={py} r={3.5 * k} fill={s.color} />
                        </motion.g>
                        <Label compact={compact} x={px} y={Y_BOT + 24} anchor="middle" size={14} mono fill="#E5E7EB" delay={0.3 + i * 0.3}>
                            {s.doseText}
                        </Label>
                        <Label
                            compact={compact} x={px + GAIN_LABEL[s.id].dx} y={py + GAIN_LABEL[s.id].dy}
                            anchor={GAIN_LABEL[s.id].anchor} size={18} weight={700} fill={s.color} delay={0.6 + i * 0.3}
                        >
                            {s.gainText}
                        </Label>
                    </g>
                );
            })}

            {/* régua de semanas: faixa 3ª–10ª do achado */}
            <Label compact={compact} x={X0} y={312} size={13} mono fill="#D1D5DB" weight={600}>TEMPO · SEMANAS</Label>
            <line x1={X0} x2={X1} y1={RULER_Y} y2={RULER_Y} stroke="#fff" strokeOpacity={0.55} strokeWidth={1.5 * k} />
            {Array.from({ length: 13 }, (_, w) => (
                <line key={w} x1={WEEK_X(w)} x2={WEEK_X(w)} y1={RULER_Y} y2={RULER_Y + (w % 4 === 0 ? 8 : 5)} stroke="#fff" strokeOpacity={0.45} strokeWidth={k} />
            ))}
            <motion.rect
                x={WEEK_X(BAND.from)} y={RULER_Y - 30} height={30} rx={6} fill="#60A5FA" fillOpacity={0.22} stroke="#60A5FA" strokeWidth={1.5 * k}
                initial={reduce ? false : { width: 0 }} animate={{ width: WEEK_X(BAND.to) - WEEK_X(BAND.from) }}
                transition={{ duration: d(1.1), delay: d(2.6), ease: EASE }}
            />
            <Label compact={compact} x={(WEEK_X(BAND.from) + WEEK_X(BAND.to)) / 2} y={RULER_Y - 10} anchor="middle" size={15} weight={600} fill="#DBEAFE" delay={3.3}>
                saturação via receptor AR
            </Label>
            <Label compact={compact} x={WEEK_X(BAND.from)} y={RULER_Y + 26} anchor="middle" size={14} mono fill="#BFDBFE" delay={2.7}>3ª semana</Label>
            <Label compact={compact} x={WEEK_X(BAND.to)} y={RULER_Y + 26} anchor="middle" size={14} mono fill="#BFDBFE" delay={3.4}>10ª semana</Label>
        </EchoSvg>
    );
};
