import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMemo, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { BrainBubble, Body, Hypothalamus, Liver, Muscle, Pituitary, Receptors, Syringe, ZoomCone } from './Anatomy';
import { COLORS } from './content';
import { BUBBLE, PATHS, VIEW, type PathId } from './flow';
import { POOL, useFlowLoop, type GlowRefs } from './useFlowLoop';

interface AxisDiagramProps {
    step: number;
    insulin: boolean;
    onSelect: (level: 1 | 2 | 3) => void;
}

const EASE = [0.16, 1, 0.3, 1] as const;
const HALO = { paintOrder: 'stroke', stroke: '#050510', strokeWidth: 4, strokeLinejoin: 'round' } as const;

/** Etiqueta com fundo (chip) desenhada no SVG. */
const Chip = ({ x, y, text, color, anchor = 'middle' }: { x: number; y: number; text: string; color: string; anchor?: 'start' | 'middle' | 'end' }) => {
    const w = text.length * 8.1 + 20;
    const left = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
    return (
        <g>
            <rect x={left} y={y - 13} width={w} height={27} rx={13.5} fill="#0a0d1c" fillOpacity={0.92} stroke={color} strokeOpacity={0.75} />
            <text x={left + w / 2} y={y + 5.5} textAnchor="middle" fontSize={15} fontWeight={600} fill="#F9FAFB" style={{ fontFamily: 'var(--font-body)' }}>{text}</text>
        </g>
    );
};

/** Rótulo de nível clicável: número + nome. */
const LevelLabel = ({ x, y, n, text, color, anchor = 'start' }: { x: number; y: number; n: number; text: string; color: string; anchor?: 'start' | 'end' }) => {
    const textX = anchor === 'start' ? x + 16 : x - 16;
    return (
        <g>
            <circle cx={x} cy={y - 5} r={10.5} fill="#050510" stroke={color} strokeWidth={1.5} />
            <text x={x} y={y} textAnchor="middle" fontSize={15} fontWeight={700} fill={color} style={{ fontFamily: 'var(--font-mono)' }}>{n}</text>
            <text x={textX} y={y} textAnchor={anchor} fontSize={15} fontWeight={600} fill="#F9FAFB" style={{ fontFamily: 'var(--font-display)', ...HALO }}>{text}</text>
        </g>
    );
};

/** Área clicável acessível (foca o nível). */
const Hit = ({ label, onActivate, children }: { label: string; onActivate: () => void; children: ReactNode }) => (
    <g role="button" tabIndex={0} aria-label={label} className="cursor-pointer outline-none"
        onClick={onActivate}
        onKeyDown={(e: KeyboardEvent<SVGGElement>) => { if (e.key === 'Enter') onActivate(); }}>
        {children}
    </g>
);

/** Anel de foco pulsante em volta do órgão do passo. */
const FocusRing = ({ cx, cy, rx, ry, color }: { cx: number; cy: number; rx: number; ry: number; color: string }) => {
    const still = useReducedMotion();
    return (
        <motion.ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={color} strokeWidth={1.8} strokeDasharray="4 4"
            initial={{ opacity: 0 }} animate={still ? { opacity: 0.9 } : { opacity: [0.35, 1, 0.35] }} exit={{ opacity: 0 }}
            transition={{ duration: 1.8, repeat: Infinity }} />
    );
};

const LEGEND = [
    { label: 'sinal hipotalâmico', color: COLORS.hipotalamo, exo: false },
    { label: 'GH', color: COLORS.hipofise, exo: false },
    { label: 'IGF-1', color: COLORS.igf, exo: false },
    { label: 'exógeno (seringa)', color: '#9CA3AF', exo: true },
] as const;

/** Legenda das partículas (canto inferior direito; some no passo 3, onde entra o medidor de glicemia). */
const Legend = ({ dim }: { dim: boolean }) => (
    <motion.g initial={false} animate={{ opacity: dim ? 0 : 1 }} transition={{ duration: 0.4 }}>
        {LEGEND.map((l, i) => (
            <g key={l.label} transform={`translate(318 ${358 + i * 24})`}>
                <circle r={4.5} fill={l.color} stroke={l.exo ? '#FCD34D' : 'none'} strokeWidth={1.8} />
                <text x={12} y={5} fontSize={14.5} fill="#E5E7EB" style={{ fontFamily: 'var(--font-body)' }}>{l.label}</text>
            </g>
        ))}
    </motion.g>
);

const Gauge = ({ insulin }: { insulin: boolean }) => {
    const level = insulin ? 0.14 : 0.52;
    const top = 318;
    const h = 104;
    return (
        <motion.g initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <text x={410} y={top - 12} textAnchor="middle" fontSize={15} fontWeight={600} fill="#A5F3FC" style={{ fontFamily: 'var(--font-body)' }}>Glicemia</text>
            <rect x={396} y={top} width={28} height={h} rx={14} fill="rgba(34,211,238,0.06)" stroke="rgba(165,243,252,0.5)" />
            <rect x={398} y={top + h - 30} width={24} height={28} rx={12} fill="rgba(225,29,72,0.22)" />
            <motion.rect x={400} width={20} rx={10}
                initial={false}
                animate={{ y: top + h - 4 - (h - 8) * level, height: (h - 8) * level, fill: insulin ? '#E11D48' : '#22D3EE' }}
                transition={{ duration: 1.6, ease: EASE }} />
            <line x1={388} x2={396} y1={top + h - 30} y2={top + h - 30} stroke="#FDA4AF" />
            <text x={384} y={top + h - 12} textAnchor="end" fontSize={15} fill="#FDA4AF" style={{ fontFamily: 'var(--font-mono)' }}>hipo</text>
            <text x={410} y={top + h + 22} textAnchor="middle" fontSize={15} fontWeight={700} fill={insulin ? '#FDA4AF' : '#A5F3FC'} style={{ fontFamily: 'var(--font-body)' }}>
                {insulin ? 'hipoglicemia' : '↓ via IGF-1R'}
            </text>
        </motion.g>
    );
};

export const AxisDiagram = ({ step, insulin, onSelect }: AxisDiagramProps) => {
    const reduced = useReducedMotion() ?? false;
    const pathRefs = useRef<Partial<Record<PathId, SVGPathElement | null>>>({});
    const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
    const hypo = useRef<SVGGElement | null>(null);
    const pit = useRef<SVGGElement | null>(null);
    const pitHead = useRef<SVGGElement | null>(null);
    const liver = useRef<SVGGElement | null>(null);
    const muscle = useRef<SVGGElement | null>(null);
    const glows = useMemo<GlowRefs>(() => ({ hypo, pit, pitHead, liver, muscle }), []);
    useFlowLoop(step, reduced, pathRefs, dotRefs, glows);

    const axisOff = step === 3;
    const vessel = (id: PathId, visible: boolean, color: string, width = 7) => (
        <motion.path key={id} ref={el => { pathRefs.current[id] = el; }} d={PATHS[id]} fill="none" stroke={color}
            strokeWidth={width} strokeLinecap="round" initial={false}
            animate={{ strokeOpacity: visible ? 0.2 : 0 }} transition={{ duration: 0.6 }} />
    );

    return (
        <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="w-full h-full" role="img"
            aria-label="Eixo GH-IGF-1: hipotálamo e hipófise no encéfalo, fígado e músculo-alvo, com os hormônios fluindo pelo eixo">
            <defs>
                <filter id="gh-glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.2" result="b" />
                    <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <filter id="gh-soft" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="7" /></filter>
            </defs>

            <ZoomCone />
            <Body />

            {/* vasos (trajetórias) */}
            {vessel('gh', true, COLORS.hipofise)}
            {vessel('igf', true, COLORS.igf)}
            {vessel('rhgh', step === 2, COLORS.exo, 6)}
            {vessel('bypass', step === 3, COLORS.exo, 6)}

            <Hit label="Nível 3: Fígado — IGF-1 exógeno" onActivate={() => onSelect(3)}>
                <g ref={liver} opacity={0}><ellipse cx={124} cy={221} rx={52} ry={34} fill={COLORS.figado} fillOpacity={0.35} filter="url(#gh-soft)" /></g>
                <Liver />
                <LevelLabel x={80} y={272} n={3} text="Fígado" color={COLORS.figado} />
            </Hit>
            <Muscle />
            <Receptors color="#FECDD3" glowRef={muscle} />
            <path d="M168,412 L192,436" stroke="rgba(251,113,133,0.6)" strokeWidth={1.2} />
            <text x={196} y={448} fontSize={15} fontWeight={600} fill="#F9FAFB" style={{ fontFamily: 'var(--font-display)', ...HALO }}>Músculo-alvo</text>
            <text x={196} y={467} fontSize={15} fill="#FECDD3" style={{ fontFamily: 'var(--font-mono)', ...HALO }}>receptor IGF-1R</text>

            {/* hipófise na cabeça (origem do pulso) */}
            <motion.g animate={{ opacity: axisOff ? 0.25 : 1 }} transition={{ duration: 0.6 }}>
                <circle cx={130} cy={70} r={4} fill={COLORS.hipofise} />
                <g ref={pitHead} opacity={0}><circle cx={130} cy={70} r={11} fill={COLORS.hipofise} fillOpacity={0.5} filter="url(#gh-soft)" /></g>
            </motion.g>

            {/* lupa do encéfalo */}
            <BrainBubble>
                {vessel('signal', true, COLORS.hipotalamo, 4)}
                {vessel('ghrpHypo', step === 1, '#A855F7', 5)}
                {vessel('ghrpPit', step === 1, '#A855F7', 5)}
                <g ref={hypo} opacity={0}><ellipse cx={340} cy={159} rx={30} ry={20} fill={COLORS.hipotalamo} fillOpacity={0.6} filter="url(#gh-soft)" /></g>
                <g ref={pit} opacity={0}><ellipse cx={351} cy={193} rx={26} ry={18} fill={COLORS.hipofise} fillOpacity={0.65} filter="url(#gh-soft)" /></g>
                <Hit label="Nível 1: Hipotálamo — GHRP" onActivate={() => onSelect(1)}>
                    <ellipse cx={340} cy={159} rx={22} ry={14} fill="transparent" />
                    <Hypothalamus color={COLORS.hipotalamo} />
                </Hit>
                <Hit label="Nível 2: Hipófise — GH recombinante" onActivate={() => onSelect(2)}>
                    <ellipse cx={351} cy={193} rx={20} ry={14} fill="transparent" />
                    <Pituitary color={COLORS.hipofise} />
                </Hit>
                <motion.circle cx={BUBBLE.cx} cy={BUBBLE.cy} r={BUBBLE.r} fill="#050510" pointerEvents="none"
                    initial={false} animate={{ opacity: axisOff ? 0.62 : 0 }} transition={{ duration: 0.8 }} />
            </BrainBubble>
            <Hit label="Nível 1: Hipotálamo — GHRP" onActivate={() => onSelect(1)}>
                <LevelLabel x={354} y={180} n={1} text="Hipotálamo" color={COLORS.hipotalamo} />
            </Hit>
            <Hit label="Nível 2: Hipófise — GH recombinante" onActivate={() => onSelect(2)}>
                <LevelLabel x={326} y={204} n={2} text="Hipófise" color={COLORS.hipofise} anchor="end" />
            </Hit>

            {/* partículas */}
            <g filter="url(#gh-glow)" pointerEvents="none">
                {Array.from({ length: POOL }, (_, i) => (
                    <circle key={i} ref={el => { dotRefs.current[i] = el; }} r={0} opacity={0} strokeWidth={1.4} />
                ))}
            </g>

            <Legend dim={step === 3} />

            {/* anel de foco do nível em destaque */}
            <AnimatePresence>
                {step === 1 && <FocusRing key="f1" cx={340} cy={159} rx={26} ry={17} color={COLORS.hipotalamo} />}
                {step === 2 && <FocusRing key="f2" cx={351} cy={193} rx={24} ry={16} color={COLORS.hipofise} />}
                {step === 3 && <FocusRing key="f3" cx={124} cy={221} rx={50} ry={32} color={COLORS.figado} />}
            </AnimatePresence>

            {/* intervenções exógenas */}
            <AnimatePresence>
                {step === 1 && (
                    <motion.g key="s1" initial={{ opacity: 0, x: 16, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                        <Syringe x={372} y={208} angle={-145} color="#A855F7" scale={0.82} />
                        <Chip x={298} y={256} text="GHRP → GHS-R1a" color="#A855F7" />
                    </motion.g>
                )}
                {step === 2 && (
                    <motion.g key="s2" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                        <Syringe x={98} y={110} angle={0} color={COLORS.hipofise} scale={0.86} />
                        <Chip x={10} y={84} text="rhGH" color={COLORS.exo} anchor="start" />
                        <Chip x={330} y={256} text="pulso endógeno substituído" color={COLORS.hipofise} />
                    </motion.g>
                )}
                {step === 3 && (
                    <motion.g key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                        <Syringe x={248} y={321} angle={168} color={COLORS.igf} scale={0.86} />
                        <Chip x={300} y={290} text="IGF-1 exógeno" color={COLORS.exo} />
                        <Chip x={330} y={256} text="eixo contornado" color="#94A3B8" />
                    </motion.g>
                )}
                {step === 3 && <Gauge key="gauge" insulin={insulin} />}
                {step === 3 && insulin && (
                    <motion.g key="ins" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                        <Syringe x={176} y={398} angle={192} color={COLORS.glucose} scale={0.7} />
                        <text x={236} y={420} fontSize={15} fontWeight={600} fill="#A5F3FC" style={{ fontFamily: 'var(--font-body)', ...HALO }}>insulina</text>
                    </motion.g>
                )}
            </AnimatePresence>
        </svg>
    );
};
