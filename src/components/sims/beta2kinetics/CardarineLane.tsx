import { motion } from 'framer-motion';
import { C } from './content';
import { PLOT, VB, type LaneBox } from './scales';

/**
 * Faixa do Cardarine: nos passos 1–3 aparece como "mais um beta-2" da prateleira; no passo 4 a etiqueta
 * troca para PPAR-delta e a faixa mostra o que o cartão diz (combustível e tipo de fibra). Esquema qualitativo.
 */

const FAST = '#FBCFE8';
const SLOW = '#B91C1C';
const FIBERS = [0, 1, 2, 3, 4, 5, 6] as const;

interface CardarineLaneProps {
    readonly box: LaneBox;
    readonly step: number;
    readonly reduced: boolean;
}

interface FuelBarProps {
    readonly y: number;
    readonly label: string;
    readonly from: number;
    readonly to: number;
    readonly color: string;
    readonly on: boolean;
    readonly reduced: boolean;
}

const FUEL_X = 336;
const FuelBar = ({ y, label, from, to, color, on, reduced }: FuelBarProps) => (
    <g>
        <text x={FUEL_X - 10} y={y + 13} textAnchor="end" className="font-body" fontSize={17} fill="#F9FAFB">{label}</text>
        <rect x={FUEL_X} y={y} width={150} height={16} rx={8} fill="rgba(255,255,255,0.1)" />
        <motion.rect x={FUEL_X} y={y} height={16} rx={8} fill={color}
            initial={{ width: from }} animate={{ width: on ? to : from }} transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : 0.6, ease: 'easeInOut' }} />
    </g>
);

export const CardarineLane = ({ box, step, reduced }: CardarineLaneProps) => {
    const on = step >= 3;
    const midY = (box.top + box.bottom) / 2;
    return (
        <g>
            <motion.rect x={2} y={box.top} width={VB.w - 4} height={box.bottom - box.top} rx={12} strokeWidth={1.2}
                initial={false} animate={{ fill: on ? `${C.gw}14` : 'rgba(255,255,255,0.025)', stroke: on ? `${C.gw}aa` : 'rgba(255,255,255,0.14)' }}
                transition={{ duration: 0.4 }} />
            <g opacity={on ? 1 : 0.75}>
                <text x={14} y={box.top + 22} className="font-display" fontSize={18} fontWeight={700} fill={C.gw}>Cardarine</text>
                <text x={14} y={box.top + 41} className="font-body" fontSize={17} fill="#F3F4F6">(GW1516)</text>
            </g>
            {/* Etiqueta: "β2?" → riscada → PPAR-δ */}
            <g>
                <text x={100} y={box.top + 41} className="font-mono" fontSize={17} fontWeight={700} fill={on ? '#D1D5DB' : '#F9FAFB'} opacity={on ? 0.9 : 0.75}>beta-2?</text>
                <motion.line x1={98} x2={172} y1={box.top + 35.5} y2={box.top + 35.5} stroke={C.red} strokeWidth={2.6}
                    initial={false} animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.2 }} />
                <motion.g initial={false} animate={{ opacity: on ? 1 : 0, y: on ? 0 : 6 }} transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : 0.45 }}>
                    <rect x={12} y={box.top + 52} width={122} height={24} rx={7} fill={`${C.gw}33`} stroke={C.gw} />
                    <text x={73} y={box.top + 70} textAnchor="middle" className="font-mono" fontSize={17} fontWeight={700} fill="#F3E8FF">PPAR-delta</text>
                </motion.g>
            </g>

            {!on && (
                <text x={(PLOT.l + PLOT.r) / 2} y={midY + 6} textAnchor="middle" className="font-body" fontSize={17} fill="#F3F4F6">
                    frequentemente vendido ao lado de SARMs e Beta-2
                </text>
            )}

            {on && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                    <text x={PLOT.l + 8} y={box.top + 19} className="font-mono" fontSize={19} fill="#F3E8FF">PREFERÊNCIA DO MÚSCULO</text>
                    <FuelBar y={box.top + 25} label="glicose" from={124} to={40} color="#60A5FA" on reduced={reduced} />
                    <FuelBar y={box.top + 43} label="ácidos graxos" from={40} to={136} color={C.amber} on reduced={reduced} />

                    <text x={PLOT.r - 4} y={box.top + 19} textAnchor="end" className="font-mono" fontSize={19} fill="#F3E8FF">FIBRAS MUSCULARES</text>
                    {FIBERS.map(k => (
                        <motion.circle key={k} cx={PLOT.r - 14 - (6 - k) * 26} cy={box.top + 40} r={10} stroke="#fff" strokeOpacity={0.4}
                            initial={{ fill: FAST }} animate={{ fill: SLOW }}
                            transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.9 + ((k * 3) % 7) * 0.18 }} />
                    ))}
                    <text x={PLOT.r - 4} y={box.top + 80} textAnchor="end" className="font-body" fontSize={17} fontWeight={700}>
                        <tspan fill="#FBCFE8">Tipo II rápidas</tspan><tspan fill="#F9FAFB" fontWeight={400}> → </tspan><tspan fill="#FECACA">Tipo I lentas e oxidativas</tspan>
                    </text>
                </motion.g>
            )}
        </g>
    );
};
