import { motion, type Transition } from 'framer-motion';
import { GENOMIC_COLOR } from './content';
import { ARE_X, DNA_Y, EAA_COLOR, EASE, Label, MRNA_COLOR, Pill, PORE, Receptor, SRC_COLOR, Steroid } from './shapes';

interface Point {
    x: number;
    y: number;
}

/** Fases (useSequence): 0 entrada · 1 HSP soltam · 2 dímero · 3 poro/ARE · 4 SRC-1 · 5 mRNA · 6 proteínas. */
interface Unit {
    rest: Point;
    dimer: Point;
    dna: Point;
}

const UNITS: Unit[] = [
    { rest: { x: 90, y: 168 }, dimer: { x: 160, y: 200 }, dna: { x: 160, y: 300 } },
    { rest: { x: 238, y: 168 }, dimer: { x: 190, y: 200 }, dna: { x: 190, y: 300 } },
];
const OUTSIDE_Y = 36;
const EAA_IN_CUP = -3;

const MRNA_PATH = 'M 190,300 C 190,272 176,258 175,236 C 174,212 250,204 310,222 C 360,236 392,258 410,288';
const ROUTE_PATH = `M 238,44 C 238,140 175,168 175,${PORE.y - 4} L 175,292`;

const SARC_X0 = 410;
const SARC_X1 = 650;
const SARC_MID = (SARC_X0 + SARC_X1) / 2;
const Z_LINES = [SARC_X0, SARC_X1];
const ACTIN_ROWS = [304, 322, 340, 358];
const MYOSIN_ROWS = [313, 331, 349];

const unitPos = (u: Unit, phase: number): Point => (phase >= 3 ? u.dna : phase >= 2 ? u.dimer : u.rest);

interface GenomicLayerProps {
    phase: number;
    reduced: boolean;
    dim: boolean;
    showRoute: boolean;
    onSelect: () => void;
}

export const GenomicLayer = ({ phase, reduced, dim, showRoute, onSelect }: GenomicLayerProps) => {
    const t = (duration = 0.9, delay = 0): Transition => (reduced ? { duration: 0 } : { duration, delay, ease: EASE });
    const on = (p: number) => phase >= p;

    return (
        <motion.g
            initial={false}
            animate={{ opacity: dim ? 0.6 : 1 }}
            transition={t(0.5)}
            onClick={onSelect}
            style={{ cursor: 'pointer' }}
        >
            {/* Rota tênue (passo 0) */}
            <motion.g initial={false} animate={{ opacity: showRoute ? 1 : 0 }} transition={t(0.5)}>
                <motion.path
                    d={ROUTE_PATH}
                    fill="none"
                    stroke={GENOMIC_COLOR}
                    strokeWidth={2}
                    strokeDasharray="5 6"
                    strokeOpacity={0.75}
                    animate={reduced || !showRoute ? { strokeDashoffset: 0 } : { strokeDashoffset: [0, -22] }}
                    transition={reduced || !showRoute ? { duration: 0 } : { duration: 1.1, repeat: Infinity, ease: 'linear' }}
                />
                <path d="M 169,284 L 175,294 L 181,284" fill="none" stroke={GENOMIC_COLOR} strokeWidth={2} strokeOpacity={0.85} />
                <Label x={226} y={128} color={GENOMIC_COLOR} weight={700}>
                    via genômica
                </Label>
            </motion.g>

            {/* ARE no DNA */}
            <motion.rect
                x={ARE_X[0]}
                y={DNA_Y - 13}
                width={ARE_X[1] - ARE_X[0]}
                height={26}
                rx={6}
                fill={GENOMIC_COLOR}
                stroke={GENOMIC_COLOR}
                strokeWidth={1.4}
                initial={false}
                animate={{ fillOpacity: on(3) ? 0.28 : 0.06, strokeOpacity: on(3) ? 1 : 0.4 }}
                transition={t(0.6, on(3) ? 0.7 : 0)}
            />
            <Label x={(ARE_X[0] + ARE_X[1]) / 2} y={DNA_Y + 28} anchor="middle" color="#BFDBFE" weight={700}>
                ARE
            </Label>

            {/* Proteínas contráteis (resultado estrutural) */}
            <motion.g initial={false} animate={{ opacity: on(5) ? 1 : 0 }} transition={t(0.5)}>
                {Z_LINES.map(x => (
                    <motion.path
                        key={x}
                        d={`M ${x},296 L ${x},368`}
                        stroke="#E2E8F0"
                        strokeWidth={2.4}
                        strokeLinecap="round"
                        initial={false}
                        animate={{ pathLength: on(6) ? 1 : 0 }}
                        transition={t(0.5)}
                    />
                ))}
                {ACTIN_ROWS.map((y, i) => (
                    <g key={y}>
                        <motion.path
                            d={`M ${SARC_X0},${y} L ${SARC_MID - 12},${y}`}
                            stroke="#93C5FD"
                            strokeWidth={2}
                            strokeLinecap="round"
                            initial={false}
                            animate={{ pathLength: on(6) ? 1 : 0 }}
                            transition={t(0.7, on(6) ? 0.2 + i * 0.08 : 0)}
                        />
                        <motion.path
                            d={`M ${SARC_X1},${y} L ${SARC_MID + 12},${y}`}
                            stroke="#93C5FD"
                            strokeWidth={2}
                            strokeLinecap="round"
                            initial={false}
                            animate={{ pathLength: on(6) ? 1 : 0 }}
                            transition={t(0.7, on(6) ? 0.2 + i * 0.08 : 0)}
                        />
                    </g>
                ))}
                {MYOSIN_ROWS.map((y, i) => (
                    <motion.g
                        key={y}
                        initial={false}
                        animate={{ opacity: on(6) ? 1 : 0, scaleX: on(6) ? 1 : 0.2 }}
                        transition={t(0.6, on(6) ? 0.45 + i * 0.1 : 0)}
                    >
                        <rect x={SARC_MID - 58} y={y - 3.5} width={116} height={7} rx={3.5} fill={GENOMIC_COLOR} />
                        {Array.from({ length: 7 }, (_, k) => SARC_MID - 52 + k * 17.5).map(x => (
                            <path key={x} d={`M ${x},${y - 3} l -4,-5 M ${x},${y + 3} l -4,5`} stroke="#BFDBFE" strokeWidth={1.6} strokeLinecap="round" />
                        ))}
                    </motion.g>
                ))}
                <Label x={SARC_X0 + 4} y={385} color="#93C5FD" weight={700}>
                    Actina
                </Label>
                <Label x={SARC_MID} y={385} anchor="middle" color={GENOMIC_COLOR} weight={700}>
                    Miosina
                </Label>
            </motion.g>

            {/* mRNA sai pelo poro em direção ao citosol */}
            <motion.path
                d={MRNA_PATH}
                fill="none"
                stroke={MRNA_COLOR}
                strokeWidth={3}
                strokeLinecap="round"
                initial={false}
                animate={{ pathLength: on(5) ? 1 : 0, opacity: on(5) ? 1 : 0 }}
                transition={t(1.1)}
            />
            <motion.g initial={false} animate={{ opacity: on(5) ? 1 : 0 }} transition={t(0.4, on(5) ? 0.5 : 0)}>
                <Label x={292} y={204} anchor="middle" color={MRNA_COLOR} weight={700}>
                    mRNA
                </Label>
            </motion.g>

            {/* Receptores (AR) com chaperonas e o EAA */}
            {UNITS.map((u, i) => {
                const pos = unitPos(u, phase);
                const eaaTarget =
                    phase < 0
                        ? { x: u.rest.x, y: OUTSIDE_Y, scale: 1 }
                        : phase === 0
                          ? { x: u.rest.x, y: [OUTSIDE_Y, 74, u.rest.y + EAA_IN_CUP], scale: [1, 1, 0.85] }
                          : { x: pos.x, y: pos.y + EAA_IN_CUP, scale: 0.85 };
                const moveT = phase === 3 ? t(1.1, 0.05) : t(0.9);
                return (
                    <g key={i}>
                        <motion.g initial={false} animate={{ x: pos.x, y: pos.y }} transition={moveT}>
                            <motion.g
                                initial={false}
                                animate={on(1) ? { x: -60, y: 38, opacity: 0 } : { x: -36, y: 14, opacity: 1 }}
                                transition={t(0.9)}
                            >
                                <ellipse rx={30} ry={12.5} fill="#334155" stroke="#94A3B8" strokeWidth={1.2} />
                                <text y={5.2} textAnchor="middle" fontSize={15} fill="#F1F5F9" className="font-mono" fontWeight={600}>
                                    HSP90
                                </text>
                            </motion.g>
                            <motion.g
                                initial={false}
                                animate={on(1) ? { x: 60, y: 38, opacity: 0 } : { x: 36, y: 14, opacity: 1 }}
                                transition={t(0.9, 0.08)}
                            >
                                <ellipse rx={30} ry={12.5} fill="#334155" stroke="#94A3B8" strokeWidth={1.2} />
                                <text y={5.2} textAnchor="middle" fontSize={15} fill="#F1F5F9" className="font-mono" fontWeight={600}>
                                    HSP70
                                </text>
                            </motion.g>
                            <Receptor color={GENOMIC_COLOR} />
                            <motion.g initial={false} animate={{ opacity: on(2) ? 0 : 1 }} transition={t(on(2) ? 0.12 : 0.4)}>
                                <Label x={0} y={34} anchor="middle" color="#BFDBFE" weight={700}>
                                    AR
                                </Label>
                            </motion.g>
                        </motion.g>
                        <motion.g initial={false} animate={eaaTarget} transition={phase === 0 ? t(1.0) : moveT}>
                            <Steroid />
                        </motion.g>
                    </g>
                );
            })}

            {/* Nome da molécula enquanto está do lado de fora */}
            <motion.g initial={false} animate={{ opacity: phase < 0 ? 1 : 0 }} transition={t(0.4)}>
                <Label x={UNITS[0].rest.x + 18} y={OUTSIDE_Y + 5} color={EAA_COLOR} weight={800}>
                    EAA
                </Label>
            </motion.g>

            {/* Dimerização e coativador */}
            <motion.g initial={false} animate={{ opacity: phase === 2 ? 1 : 0 }} transition={t(0.3, phase === 2 ? 0.3 : 0)}>
                <Label x={220} y={205} color="#BFDBFE" weight={700}>
                    dimerização
                </Label>
            </motion.g>
            <motion.g
                initial={false}
                animate={on(4) ? { x: 0, opacity: 1 } : { x: 50, opacity: 0 }}
                transition={t(0.8)}
            >
                <Pill x={252} y={296} w={64} color={SRC_COLOR}>
                    SRC-1
                </Pill>
            </motion.g>
        </motion.g>
    );
};
