import { motion, useReducedMotion } from 'framer-motion';
import { C, NUMBERS } from './content';
import { Pulses, RailParticles } from './Pulses';

/**
 * Eixo HPG desenhado (hipotálamo → hipófise → testículo) com o freio do estradiol (E2) e,
 * por passo, onde cada classe da TPC entra. Esquema qualitativo; o único número do desenho é
 * o "E2 cai até 98%" do cartão dos IA.
 */

export const VB = { w: 700, h: 416 } as const;
const SHIFT_X = 14;

interface AxisState {
    readonly gnrh: number;
    readonly lh: number;
    readonly testis: number;
    readonly tOut: number;
    readonly e2: number;
    readonly serm: boolean;
    readonly ia: boolean;
    readonly hcg: boolean;
}

const STATES: readonly AxisState[] = [
    { gnrh: 0, lh: 0, testis: 0.8, tOut: 0.2, e2: 1, serm: false, ia: false, hcg: false },
    { gnrh: 1, lh: 1, testis: 0.94, tOut: 1, e2: 1, serm: true, ia: false, hcg: false },
    { gnrh: 0.6, lh: 0.6, testis: 0.88, tOut: 0.7, e2: 0.02, serm: false, ia: true, hcg: false },
    { gnrh: 0, lh: 0, testis: 1, tOut: 1, e2: 1, serm: false, ia: false, hcg: true },
    { gnrh: 1, lh: 1, testis: 1, tOut: 1, e2: 0.3, serm: true, ia: true, hcg: true },
];

const CAPTIONS: readonly string[] = [
    'Sem LH, células de Leydig atrofiam',
    'Freio cego: pulsações de GnRH, LH/FSH sobem',
    `E2 cai até ${NUMBERS.e2Drop}%: menos E2 no feedback`,
    'Volume testicular mantido sob forte supressão',
    '',
];

const CX = 245;
const HYPO = { x: 140, y: 18, w: 210, h: 46 } as const;
const PIT = { x: 140, y: 106, w: 210, h: 46 } as const;
const TES = { x: 90, y: 226, w: 310, h: 116 } as const;
const AROM = { x: 452, y: 256, w: 224, h: 56 } as const;
const RAIL_X = 564;
const SOCKET_X = HYPO.x + HYPO.w;
const Y_HYPO = HYPO.y + HYPO.h / 2;
const Y_PIT = PIT.y + PIT.h / 2;

const OFF = 'rgba(156,163,175,0.55)';
const ON_GNRH = '#F9A8D4';

const Node = ({ box, label, dim }: { box: { x: number; y: number; w: number; h: number }; label: string; dim: boolean }) => (
    <g>
        <motion.rect x={box.x} y={box.y} width={box.w} height={box.h} rx={14} strokeWidth={1.5}
            initial={false} animate={{ fill: dim ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)', stroke: dim ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.5)' }}
            transition={{ duration: 0.5 }} />
        <text x={box.x + 16} y={box.y + 31} className="font-display" fontSize={20} fontWeight={600} fill="#F9FAFB">{label}</text>
    </g>
);

/** Receptor de estrogênio na borda do nó: concha aberta para a direita; SERM ocupa a concha. */
const Socket = ({ y, serm, reduced }: { y: number; serm: boolean; reduced: boolean }) => (
    <g>
        <path d={`M ${SOCKET_X - 2} ${y - 13} L ${SOCKET_X + 14} ${y - 13} L ${SOCKET_X + 14} ${y - 7} L ${SOCKET_X + 5} ${y - 7} L ${SOCKET_X + 5} ${y + 7} L ${SOCKET_X + 14} ${y + 7} L ${SOCKET_X + 14} ${y + 13} L ${SOCKET_X - 2} ${y + 13} Z`}
            fill="#F472B6" fillOpacity={0.35} stroke="#F9A8D4" strokeWidth={1.4} />
        <motion.rect x={SOCKET_X + 4} y={y - 7} width={14} height={14} rx={2} fill={C.serm} stroke="#fff" strokeWidth={1.2}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            initial={false} animate={{ opacity: serm ? 1 : 0, rotate: 45, x: serm ? 0 : 30 }} transition={{ duration: reduced ? 0 : 0.6, delay: serm && !reduced ? 0.3 : 0 }} />
    </g>
);

const Arrow = ({ x1, y1, x2, y2, level, color, label, labelX, labelAnchor }: {
    x1: number; y1: number; x2: number; y2: number; level: number; color: string; label: string; labelX: number; labelAnchor: 'start' | 'end';
}) => {
    const on = level > 0;
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const head = (s: number) => `${x2 - 11 * Math.cos(ang - s)} ${y2 - 11 * Math.sin(ang - s)}`;
    const stroke = on ? color : OFF;
    return (
        <g>
            <motion.line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={3} strokeLinecap="round" initial={false}
                animate={{ stroke, strokeOpacity: on ? 0.45 + 0.55 * level : 1, strokeDasharray: on ? '0 0' : '4 6' }} transition={{ duration: 0.5 }} />
            <motion.path d={`M ${head(0.45)} L ${x2} ${y2} L ${head(-0.45)}`} fill="none" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"
                initial={false} animate={{ stroke }} transition={{ duration: 0.5 }} />
            <motion.text x={labelX} y={(y1 + y2) / 2 + 5} textAnchor={labelAnchor} className="font-mono" fontSize={18} fontWeight={700}
                initial={false} animate={{ fill: on ? color : '#D1D5DB' }} transition={{ duration: 0.5 }}>{label}</motion.text>
        </g>
    );
};

const LEYDIG = [[-52, -14], [-30, -22], [-40, 6], [-16, -4], [-60, 14], [-24, 18]] as const;
const TUBULES = [[44, -12], [70, 12], [26, 16]] as const;

const Testis = ({ s, reduced }: { s: AxisState; reduced: boolean }) => {
    const cy = TES.y + TES.h / 2;
    const leydigOn = s.tOut > 0.5;
    return (
        <motion.g style={{ transformOrigin: `${CX}px ${cy}px` }} initial={false} animate={{ scale: s.testis }} transition={{ duration: reduced ? 0 : 1.2, ease: 'easeInOut' }}>
            <rect x={TES.x} y={TES.y} width={TES.w} height={TES.h} rx={58} fill="rgba(159,18,57,0.16)" stroke="rgba(253,164,175,0.55)" strokeWidth={1.5} />
            <line x1={CX} x2={CX} y1={TES.y + 14} y2={TES.y + TES.h - 14} stroke="rgba(253,164,175,0.35)" strokeDasharray="4 5" />
            <text x={CX} y={TES.y - 8} textAnchor="middle" className="font-display" fontSize={20} fontWeight={600} fill="#F9FAFB">Testículo</text>
            {LEYDIG.map(([dx, dy], k) => (
                <motion.circle key={k} cx={CX - 70 + dx * 1.2} cy={cy - 14 + dy} r={8} initial={false}
                    animate={{ fill: leydigOn ? '#F59E0B' : '#6B7280', fillOpacity: leydigOn ? 0.85 : 0.5 }} transition={{ duration: 0.6 }} stroke="#fff" strokeOpacity={0.3} />
            ))}
            <text x={TES.x + 24} y={TES.y + TES.h - 32} className="font-body" fontSize={17.5} fontWeight={700} fill="#FDE68A">células de</text>
            <text x={TES.x + 24} y={TES.y + TES.h - 12} className="font-body" fontSize={17.5} fontWeight={700} fill="#FDE68A">Leydig</text>
            {TUBULES.map(([dx, dy], k) => (
                <g key={k}>
                    <circle cx={CX + 20 + dx} cy={cy - 6 + dy} r={14} fill="none" stroke={s.lh > 0 || s.hcg ? '#67E8F9' : '#6B7280'} strokeWidth={3} />
                    <circle cx={CX + 20 + dx} cy={cy - 6 + dy} r={4} fill={s.lh > 0 || s.hcg ? '#A5F3FC' : '#6B7280'} />
                </g>
            ))}
            <text x={TES.x + TES.w - 24} y={TES.y + TES.h - 12} textAnchor="end" className="font-body" fontSize={17.5} fontWeight={700} fill="#A5F3FC">espermatozoides</text>
        </motion.g>
    );
};

const Badge = ({ x, y, w, label, sub, color, show, delay, reduced }: {
    x: number; y: number; w: number; label: string; sub?: string; color: string; show: boolean; delay: number; reduced: boolean;
}) => (
    <motion.g initial={false} animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }} transition={{ duration: reduced ? 0 : 0.45, delay: show && !reduced ? delay : 0 }}>
        <rect x={x} y={y} width={w} height={sub ? 52 : 34} rx={10} fill={`${color}2a`} stroke={color} strokeWidth={1.5} />
        <text x={x + w / 2} y={y + 24} textAnchor="middle" className="font-display" fontSize={19} fontWeight={700} fill="#fff">{label}</text>
        {sub && <text x={x + w / 2} y={y + 44} textAnchor="middle" className="font-mono" fontSize={17} fill="#F9FAFB">{sub}</text>}
    </motion.g>
);

export const AxisDiagram = ({ step }: { step: number }) => {
    const reduced = useReducedMotion() ?? false;
    const s = STATES[step];
    const axisOff = s.gnrh === 0;
    const e2Opacity = 0.25 + 0.75 * s.e2;
    const railD = `M ${RAIL_X} ${AROM.y} L ${RAIL_X} ${Y_HYPO} L ${SOCKET_X + 22} ${Y_HYPO}`;
    const branchD = `M ${RAIL_X} ${Y_PIT} L ${SOCKET_X + 22} ${Y_PIT}`;
    const caption = CAPTIONS[step];
    return (
        <svg viewBox={`0 0 ${VB.w} ${VB.h}`} className="absolute inset-0 w-full h-full block" role="img"
            aria-label="Eixo hipotálamo-hipófise-testículo com o feedback negativo do estradiol e os pontos de ação de SERMs, inibidores de aromatase, hCG e rhFSH">
            <g transform={`translate(${SHIFT_X} 0)`}>
            {/* Freio: E2 → receptores no hipotálamo/hipófise */}
            <motion.g initial={false} animate={{ opacity: e2Opacity }} transition={{ duration: 0.8 }}>
                <path d={railD} fill="none" stroke={C.red} strokeWidth={2.6} strokeLinejoin="round" />
                <path d={branchD} fill="none" stroke={C.red} strokeWidth={2.6} />
                {[Y_HYPO, Y_PIT].map(y => (
                    <line key={y} x1={SOCKET_X + 22} x2={SOCKET_X + 22} y1={y - 11} y2={y + 11} stroke={C.red} strokeWidth={3.5} strokeLinecap="round" />
                ))}
            </motion.g>
            {/* rótulo do freio: sempre legível, mesmo com o E2 baixo */}
            <g opacity={Math.max(0.7, e2Opacity)}>
                <text x={RAIL_X + 10} y={174} className="font-mono" fontSize={20} fontWeight={700} fill={C.redInk}>E2</text>
                <text x={RAIL_X + 10} y={196} className="font-body" fontSize={17.5} fill="#FFE4E6">feedback</text>
                <text x={RAIL_X + 10} y={216} className="font-body" fontSize={17.5} fill="#FFE4E6">negativo</text>
            </g>
            <RailParticles paths={[railD, branchD]} amount={s.e2} blocked={s.serm} reduced={reduced} />
            <text x={SOCKET_X + 30} y={Y_HYPO + 34} className="font-mono" fontSize={17.5} fill="#FBCFE8">ERα/ERβ</text>

            {/* Nós do eixo */}
            <Node box={HYPO} label="Hipotálamo" dim={axisOff} />
            <Node box={PIT} label="Hipófise" dim={axisOff} />
            <Socket y={Y_HYPO} serm={s.serm} reduced={reduced} />
            <Socket y={Y_PIT} serm={s.serm} reduced={reduced} />

            <Arrow x1={CX} y1={HYPO.y + HYPO.h + 4} x2={CX} y2={PIT.y - 4} level={s.gnrh} color={ON_GNRH} label="GnRH" labelX={CX - 14} labelAnchor="end" />
            <Pulses x1={CX} y1={HYPO.y + HYPO.h + 6} x2={CX} y2={PIT.y - 8} level={s.gnrh} color={ON_GNRH} reduced={reduced} />
            <Arrow x1={205} y1={PIT.y + PIT.h + 4} x2={178} y2={TES.y - 26} level={s.lh} color={C.blue} label="LH" labelX={176} labelAnchor="end" />
            <Pulses x1={205} y1={PIT.y + PIT.h + 6} x2={178} y2={TES.y - 30} level={s.lh} color={C.blue} reduced={reduced} />
            <Arrow x1={285} y1={PIT.y + PIT.h + 4} x2={312} y2={TES.y - 26} level={s.lh} color={C.cyan} label="FSH" labelX={314} labelAnchor="start" />
            <Pulses x1={285} y1={PIT.y + PIT.h + 6} x2={312} y2={TES.y - 30} level={s.lh} color={C.cyan} reduced={reduced} />
            {axisOff && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                    <text x={CX + 14} y={90} className="font-body" fontSize={17.5} fontWeight={700} fill={C.redInk}>suprimido</text>
                    <text x={CX} y={184} textAnchor="middle" className="font-body" fontSize={17.5} fontWeight={700} fill={C.redInk}>suprimidos</text>
                </motion.g>
            )}

            {/* Testículo → T → aromatase */}
            <Testis s={s} reduced={reduced} />
            <motion.g initial={false} animate={{ opacity: 0.25 + 0.75 * s.tOut }} transition={{ duration: 0.6 }}>
                <line x1={TES.x + TES.w + 4} x2={AROM.x - 6} y1={AROM.y + AROM.h / 2} y2={AROM.y + AROM.h / 2} stroke="#FDE68A" strokeWidth={3} />
                <path d={`M ${AROM.x - 15} ${AROM.y + AROM.h / 2 - 7} L ${AROM.x - 5} ${AROM.y + AROM.h / 2} L ${AROM.x - 15} ${AROM.y + AROM.h / 2 + 7}`} fill="none" stroke="#FDE68A" strokeWidth={3} strokeLinecap="round" />
                <text x={(TES.x + TES.w + AROM.x) / 2} y={AROM.y + AROM.h / 2 - 9} textAnchor="middle" className="font-mono" fontSize={19} fontWeight={700} fill="#FDE68A">T</text>
            </motion.g>
            <rect x={AROM.x} y={AROM.y} width={AROM.w} height={AROM.h} rx={12} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.45)" strokeWidth={1.4} />
            <text x={AROM.x + 14} y={AROM.y + 25} className="font-display" fontSize={19} fontWeight={600} fill="#F9FAFB">Aromatase</text>
            <text x={AROM.x + 14} y={AROM.y + 47} className="font-mono" fontSize={17} fill="#F3F4F6">CYP19A1 · periférica</text>

            {/* IA: bloqueio da aromatase */}
            <motion.g initial={false} animate={{ opacity: s.ia ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.4, delay: s.ia && !reduced ? 0.2 : 0 }}>
                <rect x={RAIL_X - 34} y={AROM.y - 16} width={68} height={12} rx={6} fill={C.ia} />
                <rect x={AROM.x - 2} y={AROM.y - 2} width={AROM.w + 4} height={AROM.h + 4} rx={13} fill="none" stroke={C.ia} strokeWidth={2.5} />
            </motion.g>
            <Badge x={AROM.x + 10} y={AROM.y + AROM.h + 12} w={176} label="IA" sub={`E2 cai até ${NUMBERS.e2Drop}%`} color={C.ia} show={s.ia} delay={0.4} reduced={reduced} />

            {/* SERM nos receptores */}
            <Badge x={SOCKET_X + 40} y={Y_HYPO + 48} w={96} label="SERM" color={C.serm} show={s.serm} delay={0.5} reduced={reduced} />

            {/* hCG → Leydig; rhFSH → espermatozoides */}
            <Badge x={2} y={TES.y + 14} w={82} label="hCG" sub="≈ LH" color={C.hcg} show={s.hcg} delay={0.3} reduced={reduced} />
            <motion.g initial={false} animate={{ opacity: s.hcg ? 1 : 0 }} transition={{ duration: 0.4, delay: s.hcg && !reduced ? 0.5 : 0 }}>
                <line x1={84} x2={122} y1={TES.y + 38} y2={TES.y + 46} stroke={C.hcg} strokeWidth={3} />
                <path d={`M 112 ${TES.y + 37} L 124 ${TES.y + 46.5} L 109 ${TES.y + 51}`} fill="none" stroke={C.hcg} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </motion.g>
            <Badge x={TES.x + TES.w - 40} y={TES.y + TES.h + 14} w={100} label="rhFSH" color={C.hcg} show={s.hcg} delay={0.7} reduced={reduced} />
            <motion.g initial={false} animate={{ opacity: s.hcg ? 1 : 0 }} transition={{ duration: 0.4, delay: s.hcg && !reduced ? 0.8 : 0 }}>
                <line x1={TES.x + TES.w - 26} x2={TES.x + TES.w - 48} y1={TES.y + TES.h + 20} y2={TES.y + TES.h - 4} stroke={C.hcg} strokeWidth={3} />
            </motion.g>
            {step === 3 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 0.9, duration: 0.4 }}>
                    <text x={PIT.x - 12} y={Y_PIT - 4} textAnchor="end" className="font-body" fontSize={17.5} fill="#F3F4F6">{NUMBERS.hcgWhen}:</text>
                    <text x={PIT.x - 12} y={Y_PIT + 17} textAnchor="end" className="font-body" fontSize={17.5} fill="#F3F4F6">eixo suprimido</text>
                </motion.g>
            )}

            {caption && (
                <motion.text key={caption} x={4} y={VB.h - 6} className="font-body" fontSize={18} fontWeight={700} fill="#F9FAFB"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 0.6, duration: 0.4 }}>{caption}</motion.text>
            )}
            </g>
        </svg>
    );
};
