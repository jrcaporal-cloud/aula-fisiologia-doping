import { AnimatePresence, motion } from 'framer-motion';
import { useTween } from '../abpconcept/useTween';
import { BloodBag } from './BloodBag';
import { C } from './content';
import {
    ALT_START, BAND_FROM, BAND_HCT, BAND_RET, BASAL_HI, BASAL_LO, COLLECT_T, DAYS_X0, HCT_TOP,
    PLOT_X0, PLOT_X1, RACE_T, REINFUSE_T, RET_BOTTOM, RET_TOP, SAMPLES, STORAGE_CHECKS, T_END, UCI_LIMIT,
    VIEW_H, VIEW_W, WEEKS_X1, hct, hy, linePath, ret, ry, tx, type AbpSample, type Scenario,
} from './model';

/**
 * Linha do tempo até a prova: hematócrito (em cima), reticulócitos relativos (embaixo)
 * e a bolsa de sangue andando pelas fases. Eixo quebrado: semanas → últimos dias.
 */

const LANE_Y = 46;
const PHASE_LABEL_Y = 100;
const REVEAL_T = [COLLECT_T + 12, -1.2, T_END, T_END, T_END] as const;
const FREEZER_X0 = tx(COLLECT_T + 4);
const FREEZER_X1 = DAYS_X0 + 24;
const BAG_X = [tx(COLLECT_T), FREEZER_X1 - 36, tx(REINFUSE_T)] as const;

const HCT_PATH = linePath(hct, hy);
const RET_PATH = linePath(ret, ry);

const X_TICKS: readonly { t: number; label: string }[] = [
    { t: -112, label: '−16 sem' }, { t: -84, label: '−12 sem' }, { t: -56, label: '−8 sem' }, { t: -28, label: '−4 sem' },
    { t: -2.4, label: '−2 d' }, { t: 0, label: 'prova' }, { t: 3, label: '+3 d' }, { t: 6, label: '+6 d' },
];

const Y_TICKS = [42, 45, 50, 55] as const;

const BreakMark = ({ y }: { y: number }) => {
    const x = (WEEKS_X1 + DAYS_X0) / 2;
    return (
        <g stroke="#E5E7EB" strokeWidth={1.6}>
            <rect x={x - 9} y={y - 9} width={18} height={18} fill="#0B0B16" stroke="none" />
            <line x1={x - 8} y1={y + 7} x2={x - 2} y2={y - 7} />
            <line x1={x + 2} y1={y + 7} x2={x + 8} y2={y - 7} />
        </g>
    );
};

/** Inverso de tx (para o ponto que acompanha a revelação da curva). */
const tInv = (x: number): number => {
    if (x <= WEEKS_X1) return -112 + ((x - PLOT_X0) / (WEEKS_X1 - PLOT_X0)) * 105;
    if (x >= DAYS_X0) return -3 + ((x - DAYS_X0) / (PLOT_X1 - DAYS_X0)) * 9;
    return -7 + ((x - WEEKS_X1) / (DAYS_X0 - WEEKS_X1)) * 4;
};

interface MarkerProps {
    readonly s: AbpSample;
    readonly alert: boolean;
    readonly index: number;
}

const SampleMarker = ({ s, alert, index }: MarkerProps) => {
    const x = tx(s.t);
    const color = s.kind === 'basal' ? C.green : s.kind === 'oportuna' ? (alert ? C.red : C.amber) : '#CBD5E1';
    return (
        <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + index * 0.18, duration: 0.35 }}
            style={{ transformOrigin: `${x}px ${hy(hct(s.t))}px` }}>
            <line x1={x} x2={x} y1={hy(hct(s.t))} y2={ry(ret(s.t))} stroke={color} strokeOpacity={0.45} strokeDasharray="2 4" />
            <circle cx={x} cy={hy(hct(s.t))} r={6.5} fill="#050510" stroke={color} strokeWidth={2.6} />
            <circle cx={x} cy={ry(ret(s.t))} r={5.5} fill="#050510" stroke={color} strokeWidth={2.4} />
            {alert && s.kind === 'oportuna' && (
                <motion.circle cx={x} cy={hy(hct(s.t))} fill="none" stroke={C.red} strokeWidth={2}
                    initial={{ r: 8, opacity: 0.9 }} animate={{ r: [8, 20], opacity: [0.9, 0] }} transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }} />
            )}
        </motion.g>
    );
};

interface CalloutProps {
    readonly scenario: Scenario;
}

const Callout = ({ scenario }: CalloutProps) => {
    const ok = scenario === 'completo';
    const color = ok ? C.red : C.amber;
    const x = DAYS_X0 + 64;
    const y = 222;
    return (
        <motion.g key={scenario} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.45 }}>
            <rect x={x} y={y} width={150} height={ok ? 78 : 96} rx={10} fill="rgba(8,8,18,0.92)" stroke={color} strokeWidth={1.6} />
            <text x={x + 12} y={y + 22} className="font-mono" fontSize={13} fontWeight={700} letterSpacing="0.08em" fill={ok ? '#FDA4AF' : '#FCD34D'}>
                {ok ? 'ALERTA DO ABP' : 'SEM ALERTA'}
            </text>
            {ok ? (
                <g className="font-body" fontSize={13.5} fill="#F3F4F6">
                    <text x={x + 12} y={y + 44}>Hb anormalmente alta</text>
                    <text x={x + 12} y={y + 63}>+ queda de %Ret</text>
                </g>
            ) : (
                <g className="font-body" fontSize={13.5} fill="#F3F4F6">
                    <text x={x + 12} y={y + 44}>1 amostra basal</text>
                    <text x={x + 12} y={y + 62}>(mínimo: 3)</text>
                    <text x={x + 12} y={y + 84}>sem coleta oportuna</text>
                </g>
            )}
        </motion.g>
    );
};

interface TimelineChartProps {
    readonly step: number;
    readonly scenario: Scenario;
}

export const TimelineChart = ({ step, scenario }: TimelineChartProps) => {
    const revealX = useTween(tx(REVEAL_T[step]), 1700, 150, PLOT_X0);
    const bagX = useTween(BAG_X[Math.min(step, 2)], 1100, 0);
    const bagFill = useTween(step === 0 ? 1 : step === 1 ? 1 : 0, step === 2 ? 1300 : 900, step === 0 ? 1300 : step === 2 ? 900 : 0, 0);
    const frozen = useTween(step === 1 ? 1 : 0, 700, step === 1 ? 700 : 0);
    const abp = step >= 3;
    const samples = abp ? SAMPLES[scenario] : [];
    const alert = abp && scenario === 'completo';
    const showBand = alert;

    return (
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-full" role="img"
            aria-label="Linha do tempo do hematócrito e dos reticulócitos na transfusão autóloga">
            <defs>
                <clipPath id="tf-reveal">
                    <rect x={0} y={0} width={revealX} height={VIEW_H} />
                </clipPath>
            </defs>

            {/* faixas de fase */}
            <rect x={tx(ALT_START)} y={HCT_TOP - 32} width={tx(COLLECT_T) - tx(ALT_START)} height={RET_BOTTOM - HCT_TOP + 32} fill={C.blue} fillOpacity={step === 0 ? 0.13 : 0.06} />
            <rect x={tx(COLLECT_T)} y={HCT_TOP - 32} width={tx(REINFUSE_T) - tx(COLLECT_T)} height={RET_BOTTOM - HCT_TOP + 32} fill={C.amber} fillOpacity={step === 1 ? 0.08 : 0.03} />
            <text x={(tx(ALT_START) + tx(COLLECT_T)) / 2} y={PHASE_LABEL_Y} textAnchor="middle" className="font-mono" fontSize={12.5} letterSpacing="0.1em" fill="#BFDBFE">ALTITUDE</text>
            <text x={(tx(COLLECT_T) + WEEKS_X1) / 2} y={PHASE_LABEL_Y} textAnchor="middle" className="font-mono" fontSize={12.5} letterSpacing="0.1em" fill="#FDE68A">ARMAZENAMENTO</text>

            {/* eixo Y do hematócrito */}
            {Y_TICKS.map(v => (
                <g key={v}>
                    <line x1={PLOT_X0} x2={PLOT_X1} y1={hy(v)} y2={hy(v)} stroke="rgba(255,255,255,0.07)" />
                    <text x={PLOT_X0 - 8} y={hy(v) + 4.5} textAnchor="end" className="font-mono" fontSize={12.5} fill="#E5E7EB">{v}%</text>
                </g>
            ))}
            <text x={14} y={HCT_TOP - 12} className="font-mono" fontSize={12.5} fill="#FDA4AF">Hct</text>
            <rect x={PLOT_X0} y={hy(BASAL_HI)} width={PLOT_X1 - PLOT_X0} height={hy(BASAL_LO) - hy(BASAL_HI)} fill={C.green} fillOpacity={0.1} />
            <text x={PLOT_X0 + 6} y={hy(BASAL_LO) + 16} className="font-body" fontSize={13} fill="#6EE7B7">basal 42–45%</text>
            <line x1={PLOT_X0} x2={PLOT_X1} y1={hy(UCI_LIMIT)} y2={hy(UCI_LIMIT)} stroke={C.red} strokeWidth={1.5} strokeDasharray="6 5" />
            <text x={PLOT_X0 + 6} y={hy(UCI_LIMIT) - 7} className="font-body" fontSize={13} fill="#FDA4AF">limite UCI 50%</text>

            {/* faixa dos reticulócitos */}
            <rect x={PLOT_X0} y={RET_TOP - 6} width={PLOT_X1 - PLOT_X0} height={RET_BOTTOM - RET_TOP + 12} rx={6} fill="rgba(255,255,255,0.03)" />
            <text x={PLOT_X0 - 8} y={(RET_TOP + RET_BOTTOM) / 2 - 2} textAnchor="end" className="font-mono" fontSize={12.5} fill="#A5F3FC">%Ret</text>
            <text x={PLOT_X0 - 8} y={(RET_TOP + RET_BOTTOM) / 2 + 13} textAnchor="end" className="font-mono" fontSize={11.5} fill="#CBD5E1">relativo</text>

            {/* corredor individual do ABP (cenário completo) */}
            <AnimatePresence>
                {showBand && (
                    <motion.g key="band" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.8, duration: 0.5 }}>
                        <rect x={tx(BAND_FROM)} y={hy(BAND_HCT.hi)} width={PLOT_X1 - tx(BAND_FROM)} height={hy(BAND_HCT.lo) - hy(BAND_HCT.hi)}
                            fill={C.green} fillOpacity={0.16} stroke={C.green} strokeOpacity={0.7} strokeDasharray="4 4" />
                        <rect x={tx(BAND_FROM)} y={ry(BAND_RET.hi)} width={PLOT_X1 - tx(BAND_FROM)} height={ry(BAND_RET.lo) - ry(BAND_RET.hi)}
                            fill={C.green} fillOpacity={0.16} stroke={C.green} strokeOpacity={0.7} strokeDasharray="4 4" />
                        <text x={tx(-50)} y={hy(BAND_HCT.lo) + 17} className="font-body" fontSize={13} fill="#6EE7B7">perfil individual (após 3 amostras basais)</text>
                    </motion.g>
                )}
            </AnimatePresence>

            {/* curvas, reveladas fase a fase */}
            <g clipPath="url(#tf-reveal)">
                <path d={HCT_PATH} fill="none" stroke={C.red} strokeWidth={3} strokeLinejoin="round" />
                <path d={RET_PATH} fill="none" stroke={C.cyan} strokeWidth={2.4} strokeLinejoin="round" />
            </g>
            <circle cx={Math.min(revealX, PLOT_X1)} cy={hy(hct(tInv(revealX)))} r={4.5} fill={C.red} opacity={revealX < PLOT_X1 - 1 ? 1 : 0} />

            {/* anotações das âncoras */}
            <g className="font-body" fontSize={13.5} fontWeight={600}>
                <text x={tx(COLLECT_T)} y={hy(53.5) - 12} textAnchor="middle" fill="#BFDBFE">coleta: 52–55%</text>
                {step >= 2 && (
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.4 }}>
                        <text x={PLOT_X1} y={hy(50.5) - 14} textAnchor="end" fill="#FDA4AF">~43% → 49–51%</text>
                        <text x={PLOT_X1} y={RET_TOP - 10} textAnchor="end" fill="#A5F3FC">queda abrupta de %Ret</text>
                    </motion.g>
                )}
            </g>

            {/* reinfusão e prova */}
            <line x1={tx(REINFUSE_T)} x2={tx(REINFUSE_T)} y1={HCT_TOP - 28} y2={RET_BOTTOM + 6} stroke={C.red} strokeOpacity={step >= 2 ? 0.9 : 0.35} strokeWidth={1.5} />
            <line x1={tx(RACE_T)} x2={tx(RACE_T)} y1={HCT_TOP - 28} y2={RET_BOTTOM + 6} stroke="#fff" strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="3 4" />
            <text x={tx(REINFUSE_T) - 5} y={PHASE_LABEL_Y} textAnchor="end" className="font-mono" fontSize={12.5} letterSpacing="0.1em" fill="#FDA4AF">REINFUSÃO</text>
            <path d={`M${tx(RACE_T)} ${PHASE_LABEL_Y - 12} l12 4 l-12 4 z`} fill="#fff" />
            <text x={tx(RACE_T) + 16} y={PHASE_LABEL_Y} className="font-mono" fontSize={12.5} letterSpacing="0.1em" fill="#fff">PROVA</text>

            {/* coletas de rotina no armazenamento */}
            {step === 1 && STORAGE_CHECKS.map((t, i) => (
                <motion.g key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 + i * 0.25, duration: 0.3 }}>
                    <circle cx={tx(t)} cy={hy(hct(t))} r={6} fill="#050510" stroke={C.green} strokeWidth={2.4} />
                    {i === 1 && <text x={tx(t)} y={hy(hct(t)) + 26} textAnchor="middle" className="font-body" fontSize={13} fill="#6EE7B7">ABP: dentro da faixa</text>}
                </motion.g>
            ))}

            {/* coletas do ABP (passos 3 e 4) */}
            {samples.map((s, i) => <SampleMarker key={`${scenario}-${s.t}`} s={s} alert={alert} index={i} />)}
            {abp && <Callout scenario={scenario} />}

            {/* eixo X quebrado */}
            <line x1={PLOT_X0} x2={WEEKS_X1} y1={RET_BOTTOM + 10} y2={RET_BOTTOM + 10} stroke="rgba(255,255,255,0.4)" />
            <line x1={DAYS_X0} x2={PLOT_X1} y1={RET_BOTTOM + 10} y2={RET_BOTTOM + 10} stroke="rgba(255,255,255,0.4)" />
            <BreakMark y={RET_BOTTOM + 10} />
            {X_TICKS.map(k => (
                <text key={k.t} x={tx(k.t)} y={RET_BOTTOM + 28} textAnchor="middle" className="font-mono" fontSize={12.5}
                    fill={k.t === 0 ? '#fff' : '#D1D5DB'}>{k.label}</text>
            ))}

            {/* a bolsa de sangue */}
            <AnimatePresence>
                {step === 1 && (
                    <motion.g key="freezer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                        <rect x={FREEZER_X0} y={LANE_Y - 34} width={FREEZER_X1 - FREEZER_X0} height={68} rx={12} fill="rgba(186,230,253,0.07)" stroke={C.ice} strokeOpacity={0.7} strokeDasharray="5 5" />
                        <text x={FREEZER_X0 + 14} y={LANE_Y - 6} className="font-display" fontSize={18} fontWeight={600} fill="#E0F2FE">–80 °C · DMSO</text>
                        <text x={FREEZER_X0 + 14} y={LANE_Y + 16} className="font-body" fontSize={13.5} fill="#BAE6FD">armazenada por meses</text>
                    </motion.g>
                )}
            </AnimatePresence>
            <g style={{ opacity: step >= 3 ? 0 : 1, transition: 'opacity 0.4s' }}>
                <BloodBag x={bagX} y={LANE_Y + 4} fill={bagFill} frozen={frozen} />
            </g>
            {abp && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="font-body" fontSize={13.5}>
                    <text x={PLOT_X0 - 50} y={LANE_Y - 22} className="font-mono" fontSize={12.5} letterSpacing="0.1em" fill="#E5E7EB">COLETAS DO ABP</text>
                    <circle cx={PLOT_X0 - 42} cy={LANE_Y + 2} r={6} fill="#050510" stroke={C.green} strokeWidth={2.6} />
                    <text x={PLOT_X0 - 30} y={LANE_Y + 7} fill="#E5E7EB">amostra basal</text>
                    <circle cx={PLOT_X0 + 92} cy={LANE_Y + 2} r={6} fill="#050510" stroke="#CBD5E1" strokeWidth={2.6} />
                    <text x={PLOT_X0 + 104} y={LANE_Y + 7} fill="#E5E7EB">rotina</text>
                    <circle cx={PLOT_X0 + 172} cy={LANE_Y + 2} r={6} fill="#050510" stroke={C.red} strokeWidth={2.6} />
                    <text x={PLOT_X0 + 184} y={LANE_Y + 7} fill="#E5E7EB">coleta oportuna (após a reinfusão)</text>
                </motion.g>
            )}
            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.g key="l0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 1.2, duration: 0.4 }}>
                        <text x={tx(COLLECT_T) + 30} y={LANE_Y - 2} className="font-display" fontSize={18} fontWeight={600} fill="#fff">coleta: 450–900 mL</text>
                        <text x={tx(COLLECT_T) + 30} y={LANE_Y + 18} className="font-body" fontSize={13.5} fill="#D1D5DB">no pico da adaptação</text>
                    </motion.g>
                )}
                {step === 2 && (
                    <motion.g key="l2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.6, duration: 0.4 }}>
                        <text x={tx(REINFUSE_T) - 30} y={LANE_Y - 2} textAnchor="end" className="font-display" fontSize={18} fontWeight={600} fill="#fff">descongelada, lavada, 37 °C</text>
                        <text x={tx(REINFUSE_T) - 30} y={LANE_Y + 18} textAnchor="end" className="font-body" fontSize={13.5} fill="#D1D5DB">reinfundida IV em 30–45 min</text>
                    </motion.g>
                )}
            </AnimatePresence>
        </svg>
    );
};
