import { motion, type Transition } from 'framer-motion';
import { NONGENOMIC_COLOR } from './content';
import { CA_COLOR, CHANNEL_X, CORTISOL_COLOR, EASE, GPCR_X, Label, MEM_BOT, MEM_TOP, Pill, Receptor, Steroid } from './shapes';

/** Fases (useSequence): 0 EAA no GPCR · 1 cascatas · 2 bloqueio do receptor de cortisol · 3 Ca²⁺. */
const MAPK = { x: 360, y: 160 };
const PI3K = { x: 470, y: 160 };
const BRANCHES = [
    { from: { x: GPCR_X - 4, y: MEM_BOT + 4 }, to: { x: MAPK.x + 12, y: MAPK.y - 13 } },
    { from: { x: GPCR_X + 4, y: MEM_BOT + 4 }, to: { x: PI3K.x - 12, y: PI3K.y - 13 } },
];
const CORT_RECEPTOR = { x: 520, y: 238 };
const EAA_C_REST = { x: 510, y: 36 };
const CORTISOL_REST = 632;
const BLOCK_X = CORT_RECEPTOR.x + 50;

/** Íons de Ca²⁺: posição fora (junto ao canal) e dentro (espalhados no citosol), determinísticas. */
const IONS = Array.from({ length: 14 }, (_, i) => ({
    out: { x: 562 + (i % 5) * 16 + (Math.floor(i / 5) % 2) * 8, y: 24 + Math.floor(i / 5) * 12 },
    in: { x: 524 + ((i * 41) % 140), y: 124 + ((i * 29) % 76) },
}));

const HELIX_X = Array.from({ length: 7 }, (_, i) => GPCR_X - 15 + i * 5);

const Gpcr = () => (
    <g>
        {HELIX_X.map(x => (
            <rect key={x} x={x - 2.1} y={MEM_TOP - 4} width={4.2} height={MEM_BOT - MEM_TOP + 8} rx={2.1} fill={NONGENOMIC_COLOR} />
        ))}
        {HELIX_X.slice(0, -1).map((x, i) => (
            <path
                key={x}
                d={i % 2 === 0 ? `M ${x},${MEM_TOP - 3} q 2.5,-6 5,0` : `M ${x},${MEM_BOT + 3} q 2.5,6 5,0`}
                fill="none"
                stroke="#FDA4AF"
                strokeWidth={1.4}
            />
        ))}
    </g>
);

interface NonGenomicLayerProps {
    phase: number;
    reduced: boolean;
    dim: boolean;
    showRoute: boolean;
    onSelect: () => void;
}

export const NonGenomicLayer = ({ phase, reduced, dim, showRoute, onSelect }: NonGenomicLayerProps) => {
    const t = (duration = 0.8, delay = 0): Transition => (reduced ? { duration: 0 } : { duration, delay, ease: EASE });
    const on = (p: number) => phase >= p;
    const caOpen = on(3);

    return (
        <motion.g
            initial={false}
            animate={{ opacity: dim ? 0.2 : 1 }}
            transition={t(0.5)}
            onClick={onSelect}
            style={{ cursor: 'pointer' }}
        >
            {/* Rota tênue (passo 0) */}
            <motion.g initial={false} animate={{ opacity: showRoute ? 1 : 0 }} transition={t(0.5)}>
                <motion.path
                    d={`M ${GPCR_X},46 L ${GPCR_X},${MEM_BOT + 6} M ${EAA_C_REST.x},46 L ${CORT_RECEPTOR.x},${CORT_RECEPTOR.y - 16} M ${CHANNEL_X},52 L ${CHANNEL_X},120`}
                    fill="none"
                    stroke={NONGENOMIC_COLOR}
                    strokeWidth={2}
                    strokeDasharray="5 6"
                    strokeOpacity={0.85}
                    animate={reduced || !showRoute ? { strokeDashoffset: 0 } : { strokeDashoffset: [0, -22] }}
                    transition={reduced || !showRoute ? { duration: 0 } : { duration: 0.55, repeat: Infinity, ease: 'linear' }}
                />
                <Label x={532} y={142} color="#FB7185" weight={700}>
                    via não genômica
                </Label>
            </motion.g>

            {/* Receptor acoplado à proteína G e cascatas */}
            <motion.ellipse
                cx={GPCR_X}
                cy={(MEM_TOP + MEM_BOT) / 2}
                rx={30}
                ry={26}
                fill={NONGENOMIC_COLOR}
                initial={false}
                animate={{ opacity: on(1) ? 0.3 : 0 }}
                transition={t(0.5)}
            />
            <Gpcr />
            <Label x={GPCR_X + 22} y={52} color="#FDA4AF" weight={700}>
                GPCR
            </Label>

            {BRANCHES.map((b, i) => (
                <g key={i}>
                    <motion.line
                        x1={b.from.x}
                        y1={b.from.y}
                        x2={b.to.x}
                        y2={b.to.y}
                        stroke={NONGENOMIC_COLOR}
                        strokeWidth={2}
                        initial={false}
                        animate={{ opacity: on(1) ? 0.9 : 0.35 }}
                        transition={t(0.4)}
                    />
                    {on(1) &&
                        !reduced &&
                        [0, 0.33, 0.66].map(d => (
                            <motion.circle
                                key={d}
                                r={3.6}
                                fill="#FDE68A"
                                initial={{ cx: b.from.x, cy: b.from.y, opacity: 0 }}
                                animate={{ cx: [b.from.x, b.to.x], cy: [b.from.y, b.to.y], opacity: [0, 1, 1, 0] }}
                                transition={{ duration: 0.75, delay: d * 0.75, repeat: Infinity, ease: 'easeIn' }}
                            />
                        ))}
                </g>
            ))}
            <Pill x={MAPK.x} y={MAPK.y} w={96} color={NONGENOMIC_COLOR}>
                MAPK/ERK
            </Pill>
            <Pill x={PI3K.x} y={PI3K.y} w={96} color={NONGENOMIC_COLOR}>
                PI3K/Akt
            </Pill>
            {[MAPK, PI3K].map((p, i) => (
                <motion.g
                    key={i}
                    initial={false}
                    animate={{ scale: on(1) ? 1 : 0, opacity: on(1) ? 1 : 0 }}
                    transition={t(0.4, on(1) ? 0.35 + i * 0.15 : 0)}
                >
                    <circle cx={p.x + 44} cy={p.y - 12} r={9} fill="#FBBF24" stroke="#0A1124" strokeWidth={1.5} />
                    <text x={p.x + 44} y={p.y - 7.7} textAnchor="middle" fontSize={12} fontWeight={800} fill="#1F1300" className="font-mono">
                        P
                    </text>
                </motion.g>
            ))}
            <motion.g initial={false} animate={{ opacity: on(1) ? 1 : 0 }} transition={t(0.4, on(1) ? 0.5 : 0)}>
                <Label x={(MAPK.x + PI3K.x) / 2} y={194} anchor="middle" color="#FCD34D" size={12}>
                    P = fosforilação
                </Label>
            </motion.g>

            {/* Canal iônico + Ca²⁺ */}
            <motion.rect
                y={MEM_TOP - 5}
                width={8}
                height={MEM_BOT - MEM_TOP + 10}
                rx={4}
                fill={NONGENOMIC_COLOR}
                initial={false}
                animate={{ x: CHANNEL_X - (caOpen ? 14 : 9) }}
                transition={t(0.4)}
            />
            <motion.rect
                y={MEM_TOP - 5}
                width={8}
                height={MEM_BOT - MEM_TOP + 10}
                rx={4}
                fill={NONGENOMIC_COLOR}
                initial={false}
                animate={{ x: CHANNEL_X + (caOpen ? 6 : 1) }}
                transition={t(0.4)}
            />
            <Label x={CHANNEL_X - 18} y={106} anchor="end" color="#FDA4AF" size={12}>
                canal iônico
            </Label>
            {IONS.map((ion, i) => (
                <motion.circle
                    key={i}
                    r={4}
                    fill={CA_COLOR}
                    initial={false}
                    animate={
                        caOpen
                            ? { cx: [ion.out.x, CHANNEL_X, ion.in.x], cy: [ion.out.y, MEM_BOT + 6, ion.in.y] }
                            : { cx: ion.out.x, cy: ion.out.y }
                    }
                    transition={reduced ? { duration: 0 } : { duration: 0.9, delay: caOpen ? 0.25 + i * 0.045 : 0, ease: 'easeOut' }}
                />
            ))}
            <motion.g initial={false} animate={{ y: caOpen ? 72 : 0 }} transition={t(0.8, caOpen ? 0.4 : 0)}>
                <Label x={676} y={40} anchor="end" color={CA_COLOR} weight={800}>
                    Ca²⁺
                </Label>
            </motion.g>

            {/* Receptor de cortisol: EAA ocupa o sítio, cortisol não entra */}
            <g transform={`translate(${CORT_RECEPTOR.x} ${CORT_RECEPTOR.y})`}>
                <Receptor color={CORTISOL_COLOR} />
            </g>
            <Label x={CORT_RECEPTOR.x} y={CORT_RECEPTOR.y + 34} anchor="middle" color="#6EE7B7" size={12}>
                receptor de cortisol
            </Label>
            <motion.g
                initial={false}
                animate={
                    on(2)
                        ? { x: [EAA_C_REST.x, EAA_C_REST.x + 2, CORT_RECEPTOR.x], y: [EAA_C_REST.y, 74, CORT_RECEPTOR.y - 3], scale: 0.85 }
                        : { x: EAA_C_REST.x, y: EAA_C_REST.y, scale: 1 }
                }
                transition={t(0.8)}
            >
                <Steroid />
            </motion.g>
            <motion.g
                initial={false}
                animate={on(2) ? { x: [CORTISOL_REST, BLOCK_X - 18, CORTISOL_REST - 6] } : { x: CORTISOL_REST }}
                transition={reduced ? { duration: 0 } : { duration: 1.1, delay: on(2) ? 0.55 : 0, times: [0, 0.55, 1], ease: 'easeInOut' }}
            >
                <g transform={`translate(0 ${CORT_RECEPTOR.y - 2})`}>
                    <Steroid s={4.2} color="#CBD5E1" />
                    <Label x={0} y={-12} anchor="middle" color="#E2E8F0" size={12}>
                        cortisol
                    </Label>
                </g>
            </motion.g>
            <motion.g
                initial={false}
                animate={{ opacity: on(2) ? 1 : 0, scale: on(2) ? 1 : 0.4 }}
                transition={t(0.3, on(2) ? 1.15 : 0)}
            >
                <circle cx={BLOCK_X} cy={CORT_RECEPTOR.y - 2} r={9} fill="#0A1124" stroke={NONGENOMIC_COLOR} strokeWidth={2} />
                <path
                    d={`M ${BLOCK_X - 5},${CORT_RECEPTOR.y - 7} l 10,10 M ${BLOCK_X + 5},${CORT_RECEPTOR.y - 7} l -10,10`}
                    stroke={NONGENOMIC_COLOR}
                    strokeWidth={2.6}
                    strokeLinecap="round"
                />
            </motion.g>

            {/* EAA que aciona o GPCR */}
            <motion.g
                initial={false}
                animate={{ x: GPCR_X, y: on(0) ? MEM_TOP - 14 : 30 }}
                transition={t(0.6)}
            >
                <Steroid />
            </motion.g>
        </motion.g>
    );
};
