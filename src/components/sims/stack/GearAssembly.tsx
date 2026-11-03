import { motion } from 'framer-motion';
import { buildGears, contactPoint, gearPath, type GearSpec } from './gearGeometry';
import { PIECES, type Piece } from './content';
import { useGearSpin } from './useGearSpin';

const BODY = 'var(--font-body), sans-serif';
const MONO = 'var(--font-mono), monospace';
const DISPLAY = 'var(--font-display), sans-serif';

export const GEAR_VIEW = { w: 450, h: 470 } as const;

const GEARS = buildGears({ teeth: [16, 12, 8], c1: [158, 316], a12: (-58 * Math.PI) / 180, a23: (14 * Math.PI) / 180 });
const PATHS = GEARS.map(g => gearPath(g.teeth, g.r));
const EASE = [0.16, 1, 0.3, 1] as const;

/** Furos de alívio: deixam o giro visível sem girar os rótulos. */
const holes = (g: GearSpec, count: number) =>
    Array.from({ length: count }, (_, k) => {
        const a = (k * 2 * Math.PI) / count;
        return <circle key={k} cx={g.r * 0.74 * Math.cos(a)} cy={g.r * 0.74 * Math.sin(a)} r={g.r * 0.075} fill="#050510" stroke="rgba(255,255,255,0.12)" />;
    });

/** Posição do rótulo do papel de cada peça (fora da engrenagem quando ela é pequena). */
const ROLE_POS: readonly { x: number; y: number; anchor: 'middle' | 'end' }[] = [
    { x: GEARS[0].cx, y: GEARS[0].cy + GEARS[0].r + 34, anchor: 'middle' },
    { x: GEARS[1].cx, y: GEARS[1].cy - GEARS[1].r - 22, anchor: 'middle' },
    { x: GEAR_VIEW.w - 14, y: GEARS[2].cy + GEARS[2].r + 40, anchor: 'end' },
];

interface GearProps {
    readonly index: number;
    readonly piece: Piece;
    readonly engaged: boolean;
    readonly focus: boolean;
    readonly ghost: boolean;
    readonly alarm: boolean;
    readonly reduced: boolean;
    readonly setRef: (el: SVGGElement | null) => void;
    readonly onSelect: (i: number) => void;
}

const Gear = ({ index, piece, engaged, focus, ghost, alarm, reduced, setRef, onSelect }: GearProps) => {
    const g = GEARS[index];
    const c = piece.color;
    const fill = ghost ? 'transparent' : `url(#stack-fill-${piece.id})`;
    const nameSize = index === 0 ? 34 : index === 1 ? 20 : 16;
    const lineGap = nameSize * 1.05;
    const lines = piece.gearLines;
    const nameY0 = g.cy - ((lines.length - 1) * lineGap) / 2 + nameSize * 0.36;
    const role = ROLE_POS[index];

    return (
        <motion.g
            style={{ cursor: 'pointer' }}
            onClick={() => onSelect(index)}
            initial={false}
            animate={{
                opacity: engaged ? (focus ? 1 : 0.78) : 1,
                x: engaged || reduced ? 0 : 46,
                y: engaged || reduced ? 0 : -34,
            }}
            transition={{ duration: 0.9, ease: EASE }}
        >
            {engaged ? (
                <>
                    {alarm && (
                        <motion.circle
                            cx={g.cx} cy={g.cy} r={g.r + 15} fill="none" stroke={c} strokeWidth={3}
                            animate={reduced ? { opacity: 0.7 } : { opacity: [0.15, 0.9, 0.15], strokeWidth: [2, 5, 2] }}
                            transition={reduced ? { duration: 0.3 } : { duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    )}
                    <g ref={setRef}>
                        <motion.path
                            d={PATHS[index]}
                            animate={{ fillOpacity: ghost ? 0 : 1, strokeOpacity: ghost ? 0.55 : 1 }}
                            transition={{ duration: 0.6 }}
                            fill={fill}
                            stroke={c}
                            strokeWidth={2.4}
                            strokeDasharray={ghost ? '7 7' : undefined}
                            strokeLinejoin="round"
                            style={{ filter: focus && !ghost ? `drop-shadow(0 0 14px ${c}88)` : undefined }}
                        />
                        {!ghost && index < 2 && holes(g, index === 0 ? 8 : 6)}
                        {!ghost && <circle r={g.r * 0.6} fill="none" stroke={c} strokeOpacity={0.35} strokeWidth={1.5} />}
                    </g>
                    {lines.map((line, k) => (
                        <text
                            key={line}
                            x={g.cx + (ghost ? 8 : 0)} y={nameY0 + k * lineGap} textAnchor="middle"
                            fontFamily={DISPLAY} fontWeight={700} fontSize={nameSize}
                            fill={ghost ? piece.soft : '#fff'}
                            style={{ pointerEvents: 'none', ...(ghost ? { paintOrder: 'stroke', stroke: '#050510', strokeWidth: 4, strokeLinejoin: 'round' as const } : {}) }}
                        >
                            {line}
                        </text>
                    ))}
                    <text
                        x={role.x} y={role.y} textAnchor={role.anchor}
                        fontFamily={MONO} fontSize={16} fontWeight={600} letterSpacing="0.04em"
                        fill={piece.soft} style={{ pointerEvents: 'none', textTransform: 'uppercase' }}
                    >
                        {piece.role}
                    </text>
                    {ghost && ['não aparece', 'no teste'].map((line, k) => (
                        <motion.text
                            key={line}
                            x={role.x} y={role.y + 22 * (k + 1)} textAnchor={role.anchor} fontFamily={MONO} fontSize={16} fontWeight={700}
                            fill="#FDA4AF" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                            style={{ pointerEvents: 'none' }}
                        >
                            {line}
                        </motion.text>
                    ))}
                </>
            ) : (
                // O grupo está deslocado para a animação de entrada; a vaga fica no lugar final.
                <g transform={reduced ? undefined : 'translate(-46 34)'}>
                    <circle cx={g.cx} cy={g.cy} r={g.r + 4} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.28)" strokeWidth={1.5} strokeDasharray="5 7" />
                    <text x={g.cx} y={g.cy + 5} textAnchor="middle" fontFamily={MONO} fontSize={16} fill="#CBD5E1" style={{ pointerEvents: 'none' }}>
                        peça {index + 1}
                    </text>
                </g>
            )}
        </motion.g>
    );
};

interface GearAssemblyProps {
    readonly step: number;
    readonly reduced: boolean;
    readonly onSelect: (i: number) => void;
}

/** As três peças do stack como engrenagens que se encaixam; com a insulina, o conjunto gira. */
export const GearAssembly = ({ step, reduced, onSelect }: GearAssemblyProps) => {
    const running = step >= 2 && !reduced;
    const refs = useGearSpin(GEARS, running, step);
    const pulseAt = step === 1 || step === 2 ? contactPoint(GEARS[step - 1], GEARS[step]) : null;

    return (
        <svg viewBox={`0 0 ${GEAR_VIEW.w} ${GEAR_VIEW.h}`} className="h-full w-full" role="img" aria-label="Engrenagem do stack: EAA, hGH/IGF-1 e insulina">
            <defs>
                {PIECES.map(p => (
                    <radialGradient key={p.id} id={`stack-fill-${p.id}`} cx="35%" cy="30%" r="80%">
                        <stop offset="0%" stopColor={p.color} stopOpacity={0.42} />
                        <stop offset="70%" stopColor={p.color} stopOpacity={0.14} />
                        <stop offset="100%" stopColor="#050510" stopOpacity={0.9} />
                    </radialGradient>
                ))}
            </defs>

            <text x={20} y={34} fontFamily={MONO} fontSize={16} letterSpacing="0.1em" fill="#D1D5DB">ENGRENAGEM DO STACK</text>
            <text x={20} y={58} fontFamily={BODY} fontSize={16} fill="#CBD5E1">3 classes · sistemas e receptores diferentes</text>

            {PIECES.map((p, i) => (
                <Gear
                    key={p.id}
                    index={i}
                    piece={p}
                    engaged={step >= i}
                    focus={step === i || step >= 3}
                    ghost={i === 2 && step === 3}
                    alarm={i === 2 && step === 4}
                    reduced={reduced}
                    setRef={el => { refs.current[i] = el; }}
                    onSelect={onSelect}
                />
            ))}

            {pulseAt && !reduced && (
                <motion.circle
                    key={`pulse-${step}`}
                    cx={pulseAt[0]} cy={pulseAt[1]} r={4} fill="none" stroke="#fff" strokeWidth={2.5} vectorEffect="non-scaling-stroke"
                    style={{ originX: `${pulseAt[0]}px`, originY: `${pulseAt[1]}px` }}
                    initial={{ scale: 1, opacity: 0 }}
                    animate={{ scale: [1, 8], opacity: [0, 1, 0] }}
                    transition={{ delay: 0.75, duration: 0.8, ease: 'easeOut' }}
                />
            )}
        </svg>
    );
};
