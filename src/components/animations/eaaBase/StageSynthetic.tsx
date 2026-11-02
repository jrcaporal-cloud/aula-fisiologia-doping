import { motion, useReducedMotion } from 'framer-motion';
import { Molecule } from './Molecule';
import { ALPHA, C17, OH, alphaHashes, fitMolecule } from './steroidGeometry';
import { EASE, LAYERS, STAGE_H, STAGE_W } from './content';

const BLUE = LAYERS[0].color;
const BLUE_INK = LAYERS[0].ink;
const AMBER = '#F59E0B';
const AMBER_INK = '#FCD34D';

const FRAME = fitMolecule(28, 40, 420, 240);
const [c17x, c17y] = FRAME.map(C17);
const [ohx, ohy] = FRAME.map(OH);
const [ax, ay] = FRAME.map(ALPHA);

const BAR_X = 186;
const BAR_W = 380;

/** Camada 1 — onde a química sintética mexe: o C17 (17α-alquilação e éster). */
export const StageSynthetic = () => {
    const still = useReducedMotion();
    const t = (delay: number, duration = 0.6) => (still ? { duration: 0 } : { delay, duration, ease: EASE });
    return (
        <svg viewBox={`0 0 ${STAGE_W} ${STAGE_H}`} className="w-full h-full" role="img" aria-label="Testosterona com o C17 em destaque: 17α-alquilação e esterificação">
            <Molecule frame={FRAME} stroke={3} idPrefix="eaa-syn" />

            {/* C17 em destaque */}
            <motion.circle
                cx={c17x} cy={c17y} r={15} fill="none" stroke="#fff" strokeWidth={1.5}
                initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 0.9, scale: 1 }} transition={t(0.9)}
                style={{ transformOrigin: `${c17x}px ${c17y}px` }}
            />
            {!still && (
                <motion.circle
                    cx={c17x} cy={c17y} r={15} fill="none" stroke="#fff" strokeWidth={1}
                    animate={{ scale: [1, 2.1], opacity: [0.6, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1.3, ease: 'easeOut' }}
                    style={{ transformOrigin: `${c17x}px ${c17y}px` }}
                />
            )}
            <motion.text x={c17x - 19} y={c17y - 14} fill="#fff" fontSize={14} className="font-mono" fontWeight={600} textAnchor="end"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(1)}>C17</motion.text>

            {/* 17α: alquila (hash wedge) */}
            <g transform={FRAME.transform} stroke={BLUE} strokeWidth={2.6 / FRAME.scale} strokeLinecap="round">
                {alphaHashes().map((d, i) => (
                    <motion.path key={i} d={d} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(1.3 + i * 0.06, 0.2)} />
                ))}
            </g>
            <motion.text x={ax + 6} y={ay + 6} fill={BLUE_INK} fontSize={15} fontWeight={700} className="font-body"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(1.6)}>CH₃</motion.text>

            {/* Éster no O do C17 */}
            <motion.rect
                x={ohx - 4} y={ohy - 22} width={34} height={26} rx={7} fill="none" stroke={AMBER} strokeWidth={2}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(2.1)}
            />

            {/* Chamadas */}
            <motion.g initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={t(2.2)}>
                <path d={`M${ohx + 30} ${ohy - 9} L${470} ${ohy - 9}`} stroke={AMBER} strokeWidth={1.2} strokeDasharray="3 3" />
                <text x={476} y={ohy - 14} fill={AMBER_INK} fontSize={15} fontWeight={700} className="font-body">esterificação</text>
                <text x={476} y={ohy + 4} fill={AMBER_INK} fontSize={15} fontWeight={700} className="font-body">do C17</text>
                <text x={476} y={ohy + 22} fill="#E5E7EB" fontSize={13} className="font-body">ex.: Cipionato,</text>
                <text x={476} y={ohy + 38} fill="#E5E7EB" fontSize={13} className="font-body">Decanoato</text>
            </motion.g>
            <motion.g initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={t(1.7)}>
                <path d={`M${ax + 44} ${ay} L${470} ${ay + 48}`} stroke={BLUE} strokeWidth={1.2} strokeDasharray="3 3" />
                <text x={476} y={ay + 52} fill={BLUE_INK} fontSize={15} fontWeight={700} className="font-body">17α-alquilação</text>
                <text x={476} y={ay + 70} fill="#E5E7EB" fontSize={13} className="font-body">H no C17 → –CH₃</text>
            </motion.g>

            {/* Biodisponibilidade oral (números do texto da camada) */}
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(2.6)}>
                <text x={20} y={318} fill="#9CA3AF" fontSize={12} className="font-mono" letterSpacing={1.5}>BIODISPONIBILIDADE ORAL</text>
                {[
                    { y: 348, label: '17α-alquilado', from: 0.95, to: 1, value: '95–100%', color: BLUE, ink: BLUE_INK },
                    { y: 390, label: 'Testosterona base', from: 0.01, to: 0.01, value: '~1%', color: '#9CA3AF', ink: '#E5E7EB' },
                ].map((r, i) => (
                    <g key={r.label}>
                        <text x={20} y={r.y + 5} fill="#E5E7EB" fontSize={14} className="font-body">{r.label}</text>
                        <rect x={BAR_X} y={r.y - 9} width={BAR_W} height={18} rx={9} fill="rgba(255,255,255,0.05)" />
                        <motion.rect
                            x={BAR_X} y={r.y - 9} height={18} rx={9} fill={r.color} opacity={0.85}
                            initial={{ width: 0 }} animate={{ width: Math.max(BAR_W * r.from, 6) }}
                            transition={t(2.7 + i * 0.2, 1)}
                        />
                        {r.to > r.from && (
                            <motion.rect
                                x={BAR_X + BAR_W * r.from} y={r.y - 9} width={BAR_W * (r.to - r.from)} height={18} rx={4}
                                fill={r.color} opacity={0.4} initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={t(3.5)}
                            />
                        )}
                        <motion.text
                            x={BAR_X + 16} y={r.y + 5}
                            fill={r.to > 0.5 ? '#0B1220' : r.ink} fontSize={14} fontWeight={700} className="font-mono"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t(3.3 + i * 0.2)}
                        >{r.value}</motion.text>
                    </g>
                ))}
            </motion.g>
        </svg>
    );
};
