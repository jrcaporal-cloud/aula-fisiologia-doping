import { motion, useReducedMotion } from 'framer-motion';
import { Beta2Glyph } from './Beta2Glyph';
import { C } from './content';

/**
 * Passos 0–2: brônquio (corte transversal) e músculo esquelético, ambos com receptores β2.
 * 0: o mesmo receptor nos dois · 1: inalador → só o brônquio (dilata) · 2: comprimido → sangue → os dois.
 */

interface TissueSceneProps {
    readonly step: number;
}

const BR = { x: 170, y: 150 } as const;
const VESSEL_Y = 292;
const BR_RECEPTORS = Array.from({ length: 8 }, (_, i) => (360 / 8) * i + 22);
const FIBERS = [104, 140, 176, 212] as const;
const FIBER_X0 = 410;
const FIBER_X1 = 676;
const MUSCLE_RECEPTORS = [440, 500, 560, 620] as const;
const FAT = [{ x: 470, y: 122 }, { x: 600, y: 158 }, { x: 530, y: 194 }, { x: 652, y: 122 }] as const;

const INHALED_PATH = `M 66 52 C 100 70, 130 100, ${BR.x} ${BR.y}`;
const PILL_PATH = `M 350 54 L 350 ${VESSEL_Y}`;
const TO_BRONCHUS = `M 350 ${VESSEL_Y} L 100 ${VESSEL_Y} L 100 222`;
const TO_MUSCLE = `M 350 ${VESSEL_Y} L 540 ${VESSEL_Y} L 540 228`;

const Particles = ({ path, color, n, duration, reduced }: { path: string; color: string; n: number; duration: number; reduced: boolean }) => (
    <>
        {Array.from({ length: n }, (_, k) => (
            <motion.circle key={k} r={3.6} fill={color}
                initial={{ offsetDistance: '0%', opacity: 0 }}
                animate={reduced ? { offsetDistance: `${(k + 1) * (90 / n)}%`, opacity: 1 } : { offsetDistance: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
                transition={reduced ? { duration: 0 } : { duration, delay: (k * duration) / n, repeat: Infinity, ease: 'linear' }}
                style={{ offsetPath: `path("${path}")`, filter: `drop-shadow(0 0 3px ${color})` }} />
        ))}
    </>
);

const Bronchus = ({ open, active }: { open: boolean; active: boolean }) => {
    const lumen = open ? 50 : 30;
    return (
        <g>
            <circle cx={BR.x} cy={BR.y} r={100} fill="rgba(244,114,182,0.08)" stroke="rgba(244,114,182,0.35)" strokeWidth={1.2} />
            <motion.circle cx={BR.x} cy={BR.y} fill="none" stroke="#DB2777" strokeOpacity={0.7} strokeDasharray="10 4"
                initial={false} animate={{ r: lumen + 22, strokeWidth: open ? 9 : 18 }} transition={{ duration: 1.4, ease: 'easeInOut' }} />
            <motion.circle cx={BR.x} cy={BR.y} fill="rgba(251,207,232,0.10)" stroke="#F9A8D4" strokeWidth={1.4}
                initial={false} animate={{ r: lumen + 6 }} transition={{ duration: 1.4, ease: 'easeInOut' }} />
            <motion.circle cx={BR.x} cy={BR.y} fill="#03030a" initial={false} animate={{ r: lumen }} transition={{ duration: 1.4, ease: 'easeInOut' }} />
            <text x={BR.x} y={BR.y + 6} textAnchor="middle" className="font-mono" fontSize={19} fill="#FCE7F3">luz</text>
            {BR_RECEPTORS.map(a => {
                const rad = (a * Math.PI) / 180;
                return <Beta2Glyph key={a} x={BR.x + Math.cos(rad) * 88} y={BR.y + Math.sin(rad) * 88} angle={a - 90} on={active} color={C.inhaled} />;
            })}
            <text x={BR.x} y={20} textAnchor="middle" className="font-body" fontSize={19} fontWeight={700} fill="#FBCFE8">Músculo liso bronquial</text>
            <motion.text x={BR.x} y={BR.y + 118} textAnchor="middle" initial={false} animate={{ opacity: open ? 1 : 0 }} transition={{ delay: 1, duration: 0.4 }}
                className="font-display" fontSize={19} fontWeight={700} fill="#BFDBFE">broncodilatação</motion.text>
        </g>
    );
};

const Muscle = ({ active }: { active: boolean }) => (
    <g>
        <text x={(FIBER_X0 + FIBER_X1) / 2} y={20} textAnchor="middle" className="font-body" fontSize={19} fontWeight={700} fill="#FECACA">Músculo esquelético</text>
        {FIBERS.map((y, i) => (
            <motion.g key={y} initial={false} animate={{ scaleY: active ? 1.22 : 1 }} transition={{ duration: 1.6, delay: 0.6 + i * 0.1, ease: 'easeInOut' }}
                style={{ originY: 0.5, transformBox: 'fill-box' }}>
                <rect x={FIBER_X0} y={y - 13} width={FIBER_X1 - FIBER_X0} height={26} rx={13} fill="#7f1d1d" stroke="#FCA5A5" strokeOpacity={0.5} />
                {Array.from({ length: 22 }, (_, k) => (
                    <line key={k} x1={FIBER_X0 + 16 + k * 11.5} x2={FIBER_X0 + 16 + k * 11.5} y1={y - 9} y2={y + 9} stroke="#FCA5A5" strokeOpacity={0.28} strokeWidth={1.4} />
                ))}
            </motion.g>
        ))}
        {FAT.map(f => (
            <motion.circle key={`${f.x}-${f.y}`} cx={f.x} cy={f.y} fill="rgba(245,158,11,0.75)" stroke="#FDE68A" strokeWidth={1}
                initial={false} animate={{ r: active ? 4 : 10 }} transition={{ duration: 2, delay: 0.8, ease: 'easeInOut' }} />
        ))}
        {MUSCLE_RECEPTORS.map(x => <Beta2Glyph key={x} x={x} y={80} on={active} color={C.amber} />)}
        <motion.g initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ delay: 1.4, duration: 0.4 }}
            className="font-display" fontSize={19} fontWeight={700} fill="#FDE68A" textAnchor="middle">
            <text x={(FIBER_X0 + FIBER_X1) / 2} y={246}>hipertrofia ·</text>
            <text x={(FIBER_X0 + FIBER_X1) / 2} y={268}>gordura oxidada (lipólise)</text>
        </motion.g>
    </g>
);

export const TissueScene = ({ step }: TissueSceneProps) => {
    const reduced = useReducedMotion() ?? false;
    const inhaled = step === 1;
    const systemic = step === 2;
    return (
        <svg viewBox="0 0 700 305" className="w-full h-full block" role="img"
            aria-label="Brônquio e músculo esquelético com receptores beta-2; inalador age no brônquio, dose oral chega aos dois pelo sangue">
            {/* Sangue (aparece com a dose sistêmica) */}
            <motion.g initial={false} animate={{ opacity: systemic ? 1 : 0.6 }} transition={{ duration: 0.5 }}>
                <rect x={30} y={VESSEL_Y - 12} width={650} height={24} rx={12} fill="rgba(159,18,57,0.55)" stroke="#FB7185" strokeOpacity={0.6} />
                <text x={668} y={VESSEL_Y + 6} textAnchor="end" className="font-mono" fontSize={19} fill="#FFE4E6">sangue</text>
            </motion.g>

            <Bronchus open={inhaled || systemic} active={inhaled || systemic} />
            <Muscle active={systemic} />

            {/* Passo 0: o mesmo receptor nos dois tecidos */}
            <motion.g initial={false} animate={{ opacity: step === 0 ? 1 : 0 }} transition={{ duration: 0.5 }}>
                <path d={`M ${BR.x + 62} ${BR.y - 62} C 300 60, 380 60, 432 80`} fill="none" stroke={C.cyan} strokeWidth={1.6} strokeDasharray="5 5" />
                <rect x={236} y={40} width={198} height={32} rx={16} fill="rgba(34,211,238,0.16)" stroke={C.cyan} />
                <text x={335} y={63} textAnchor="middle" className="font-body" fontSize={19} fontWeight={700} fill="#CFFAFE">mesmo receptor β2</text>
            </motion.g>

            {/* Passo 1: inalador */}
            <motion.g initial={false} animate={{ opacity: inhaled ? 1 : 0 }} transition={{ duration: 0.4 }}>
                <g transform="translate(30 20)">
                    <rect x={0} y={8} width={26} height={38} rx={6} fill="#DBEAFE" stroke={C.inhaled} strokeWidth={1.6} />
                    <rect x={20} y={30} width={22} height={14} rx={3} fill="#BFDBFE" stroke={C.inhaled} strokeWidth={1.6} />
                </g>
                {inhaled && <Particles path={INHALED_PATH} color={C.inhaled} n={7} duration={2.2} reduced={reduced} />}
            </motion.g>

            {/* Passo 2: comprimido → sangue → os dois tecidos */}
            <motion.g initial={false} animate={{ opacity: systemic ? 1 : 0 }} transition={{ duration: 0.4 }}>
                <g transform="translate(350 40)">
                    <rect x={-20} y={-11} width={40} height={22} rx={11} fill="#FDE68A" stroke="#F59E0B" strokeWidth={1.4} />
                    <line x1={0} x2={0} y1={-11} y2={11} stroke="#F59E0B" strokeWidth={1.2} />
                    <text x={28} y={7} className="font-mono" fontSize={19} fontWeight={700} fill="#FDE68A">oral &gt;8 mg</text>
                </g>
                {systemic && (
                    <>
                        <Particles path={PILL_PATH} color="#FBBF24" n={5} duration={2} reduced={reduced} />
                        <Particles path={TO_BRONCHUS} color="#FBBF24" n={5} duration={2.4} reduced={reduced} />
                        <Particles path={TO_MUSCLE} color="#FBBF24" n={5} duration={2.4} reduced={reduced} />
                    </>
                )}
            </motion.g>
        </svg>
    );
};
