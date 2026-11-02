import { motion, useReducedMotion } from 'framer-motion';
import { COLORS, SYNERGY, type SynergyId } from './content';
import { SCENE } from './SystemicLocalScene';

/**
 * Passo 3: uma fibra muscular esquemática com os quatro alvos do stack (cartão "Sinergia Total com EAA + Insulina"):
 * núcleo/RA (EAA), mTOR (GH/IGF-1), proteassoma + GLUT4 (insulina) e hemácias/O₂ no capilar (EPO).
 */

const BODY = 'var(--font-body)';
const CELL = { x: 150, y: 70, w: 420, h: 250 } as const;

const Text = ({ x, y, text, color = '#E5E7EB', size = 13, anchor = 'middle', weight = 600 }: {
    x: number; y: number; text: string; color?: string; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number;
}) => (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color}
        style={{ fontFamily: BODY, paintOrder: 'stroke', stroke: '#080812', strokeWidth: 4, strokeLinejoin: 'round' }}>{text}</text>
);

interface Anchor { readonly tag: { x: number; y: number; anchor: 'start' | 'end' }; readonly target: { x: number; y: number } }
const ANCHORS: Record<SynergyId, Anchor> = {
    eaa: { tag: { x: 40, y: 64, anchor: 'start' }, target: { x: 250, y: 150 } },
    ghigf: { tag: { x: 680, y: 64, anchor: 'end' }, target: { x: 452, y: 146 } },
    insulin: { tag: { x: 680, y: 300, anchor: 'end' }, target: { x: CELL.x + CELL.w, y: 250 } },
    epo: { tag: { x: 40, y: 388, anchor: 'start' }, target: { x: 250, y: 384 } },
};

interface SynergySceneProps {
    readonly revealed: number;
    readonly focus: SynergyId | null;
}

export const SynergyScene = ({ revealed, focus }: SynergySceneProps) => {
    const reduce = useReducedMotion();
    const isOn = (i: number): boolean => i < revealed;
    const lit = (id: SynergyId): number => (focus === null || focus === id ? 1 : 0.3);

    return (
        <svg viewBox={`0 0 ${SCENE.w} ${SCENE.h}`} className="absolute inset-0 w-full h-full block" preserveAspectRatio="xMidYMid meet" role="img"
            aria-label="Fibra muscular com os quatro alvos do stack: núcleo, mTOR, proteassoma e GLUT4, e capilar com hemácias">
            {/* célula */}
            <rect x={CELL.x} y={CELL.y} width={CELL.w} height={CELL.h} rx={36} fill="rgba(76,16,39,0.55)" stroke="rgba(251,113,133,0.55)" strokeWidth={1.6} />
            <Text x={CELL.x + CELL.w / 2} y={CELL.y + 26} text="fibra muscular" color="#FECDD3" size={14} />

            {/* núcleo + RA (EAA) */}
            <motion.g animate={{ opacity: isOn(0) ? lit('eaa') : 0.35 }}>
                <ellipse cx={250} cy={168} rx={62} ry={40} fill="rgba(196,181,253,0.18)" stroke={COLORS.nucleus} strokeWidth={1.6} />
                <path d="M210,172 C225,156 240,186 255,170 S285,160 292,176" stroke="rgba(196,181,253,0.7)" strokeWidth={2} fill="none" />
                {[[226, 150], [262, 152], [280, 184]].map(([x, y]) => (
                    <circle key={x} cx={x} cy={y} r={6} fill={isOn(0) ? COLORS.eaa : 'rgba(255,255,255,0.2)'} />
                ))}
                <Text x={250} y={226} text="núcleo · RA → transcrição" color="#E9D5FF" size={13} />
            </motion.g>

            {/* mTOR (GH/IGF-1) */}
            <motion.g animate={{ opacity: isOn(1) ? lit('ghigf') : 0.35 }}>
                <motion.circle cx={452} cy={166} fill="rgba(96,165,250,0.18)" stroke={COLORS.ghigf} strokeWidth={2}
                    initial={{ r: 30 }} animate={isOn(1) && !reduce ? { r: [30, 34, 30] } : { r: 30 }} transition={{ duration: 1.6, repeat: Infinity }} />
                <Text x={452} y={171} text="mTOR" color="#FFFFFF" size={15} weight={700} />
                <Text x={452} y={218} text="sinalização × hiperplasia" color="#BFDBFE" size={13} />
            </motion.g>

            {/* proteassoma bloqueado + GLUT4 (insulina) */}
            <motion.g animate={{ opacity: isOn(2) ? lit('insulin') : 0.35 }}>
                <g transform="translate(330,262)">
                    {[0, 1, 2, 3].map(i => <rect key={i} x={-28 + i * 14} y={-14} width={12} height={28} rx={4} fill="rgba(148,163,184,0.35)" stroke="rgba(203,213,225,0.6)" />)}
                    {isOn(2) && (
                        <g stroke={COLORS.insulin} strokeWidth={3.2} strokeLinecap="round">
                            <line x1={-34} y1={-20} x2={34} y2={20} /><line x1={-34} y1={20} x2={34} y2={-20} />
                        </g>
                    )}
                </g>
                <Text x={330} y={302} text="ubiquitina-proteassoma" color="#A5F3FC" size={13} />
                {[214, 244, 274].map(y => (
                    <g key={y}>
                        <rect x={CELL.x + CELL.w - 6} y={y - 9} width={12} height={18} rx={3} fill={COLORS.insulin} opacity={0.85} />
                        {isOn(2) && !reduce && (
                            <motion.circle r={3.5} fill="#ECFEFF" cy={y}
                                initial={{ cx: CELL.x + CELL.w + 34, opacity: 0 }} animate={{ cx: [CELL.x + CELL.w + 34, CELL.x + CELL.w - 26], opacity: [0, 1, 0] }}
                                transition={{ duration: 1.4, repeat: Infinity, delay: (y - 214) / 60, ease: 'easeIn' }} />
                        )}
                    </g>
                ))}
                <Text x={CELL.x + CELL.w - 16} y={196} text="GLUT4" color="#A5F3FC" size={13} anchor="end" />
            </motion.g>

            {/* capilar + hemácias (EPO) */}
            <motion.g animate={{ opacity: isOn(3) ? lit('epo') : 0.35 }}>
                <rect x={100} y={364} width={520} height={40} rx={20} fill="rgba(225,29,72,0.16)" stroke="rgba(251,113,133,0.45)" />
                {Array.from({ length: isOn(3) ? 11 : 5 }, (_, i) => (
                    <motion.ellipse key={i} cy={384} rx={11} ry={7} fill="#E11D48" stroke="#FDA4AF" strokeWidth={1}
                        initial={{ cx: 110 + i * 46 }}
                        animate={reduce ? {} : { cx: [110 + i * 46, 156 + i * 46] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }} />
                ))}
                {isOn(3) && [260, 360, 460].map(x => (
                    <g key={x}>
                        <line x1={x} y1={360} x2={x} y2={CELL.y + CELL.h + 6} stroke="#FDA4AF" strokeWidth={2} strokeDasharray="3 4" />
                        <Text x={x + 14} y={346} text="O₂" color="#FDA4AF" size={13} anchor="start" />
                    </g>
                ))}
                <Text x={636} y={389} text="capilar" color="#FDA4AF" size={13} anchor="start" />
            </motion.g>

            {/* rótulos das quatro drogas, ligados ao alvo */}
            {SYNERGY.map((s, i) => {
                const a = ANCHORS[s.id];
                return (
                    <g key={s.id} style={{ opacity: isOn(i) ? lit(s.id) : 0, transition: 'opacity 0.4s ease' }}>
                        <line x1={a.tag.x + (a.tag.anchor === 'start' ? 70 : -86)} y1={a.tag.y - 5} x2={a.target.x} y2={a.target.y}
                            stroke={s.color} strokeWidth={1.6} strokeDasharray="5 4" />
                        <rect x={a.tag.anchor === 'start' ? a.tag.x - 10 : a.tag.x - 92} y={a.tag.y - 22} width={s.id === 'ghigf' || s.id === 'insulin' ? 102 : 80} height={30} rx={9}
                            fill="#080812" stroke={s.color} strokeWidth={1.6} />
                        <Text x={a.tag.anchor === 'start' ? a.tag.x : a.tag.x - 82} y={a.tag.y - 2} text={s.name} color={s.color} size={15} weight={700} anchor="start" />
                    </g>
                );
            })}
        </svg>
    );
};
