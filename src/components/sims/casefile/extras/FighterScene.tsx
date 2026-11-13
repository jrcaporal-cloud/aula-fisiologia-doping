import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { FileText, Lock, Pill, TestTube, type LucideIcon } from 'lucide-react';
import { DUR, EASE_IN_OUT, EASE_OUT } from '../../../../lib/motion';
import { CASE_COLORS, SUBSTANCE } from '../../../../lib/palette';
import type { SceneProps } from '../types';

/** Cor do caso 03 (lutador): suplemento, rótulo e frasco. */
const FIGHTER = CASE_COLORS.fighter;
const FIGHTER_RGB = '251,191,36';

/**
 * Coluna central do caso 03 (slide id 28): linha do tempo suplemento → controle surpresa → defesa,
 * o rótulo, o laudo com a quantidade detectada e a suspensão (4 → 1 ano).
 */

interface Node {
    readonly icon: LucideIcon;
    readonly title: string;
    readonly sub: string;
    readonly color: string;
}

const NODES: readonly Node[] = [
    { icon: Pill, title: 'Suplemento', sub: '"Testo Booster Natural"', color: FIGHTER },
    { icon: TestTube, title: 'Controle surpresa', sub: 'positivo · LGD-4033', color: '#E11D48' },
    { icon: FileText, title: 'Defesa', sub: 'prontuário clínico', color: SUBSTANCE.allowed },
];

/** Em que nó o raciocínio está em cada passo. */
const FOCUS = [1, 1, 0, 2] as const;
const NODE_SIZE = 38;

const Timeline = ({ step, revealed }: SceneProps) => {
    const focus = FOCUS[step] ?? 0;
    const progress = step >= 3 && revealed ? 100 : 50;
    return (
        <div className="relative h-[84px] shrink-0">
            <div className="absolute left-[16.6%] right-[16.6%] h-[2px] bg-white/12" style={{ top: NODE_SIZE / 2 - 1 }} />
            <motion.div className="absolute left-[16.6%] right-[16.6%] h-[2px]" style={{ top: NODE_SIZE / 2 - 1, background: `linear-gradient(90deg,${FIGHTER},${SUBSTANCE.risk},${SUBSTANCE.allowed})`, originX: 0 }}
                initial={false} animate={{ scaleX: progress / 100 }} transition={{ duration: DUR.bar, ease: EASE_IN_OUT }} />
            <div className="grid grid-cols-3 h-full">
                {NODES.map((n, i) => {
                    const visible = i < 2 || (step >= 3 && revealed);
                    const active = i === focus;
                    const Icon = visible ? n.icon : Lock;
                    return (
                        <div key={n.title} className="flex flex-col items-center text-center">
                            <motion.div className="relative shrink-0 rounded-full flex items-center justify-center border-2"
                                style={{ width: NODE_SIZE, height: NODE_SIZE, boxSizing: 'border-box' }}
                                animate={{
                                    borderColor: visible ? n.color : 'rgba(255,255,255,0.25)',
                                    background: active ? `${n.color}40` : 'rgba(8,8,18,1)',
                                    boxShadow: active ? `0 0 0 5px ${n.color}2e` : '0 0 0 0 rgba(0,0,0,0)',
                                }}
                                transition={{ duration: DUR.morph, ease: EASE_OUT }}>
                                <Icon size={18} color={visible ? n.color : '#9CA3AF'} />
                            </motion.div>
                            <div className="mt-1 text-[15px] font-semibold leading-tight" style={{ color: visible ? '#fff' : '#9CA3AF' }}>{n.title}</div>
                            <div className="text-[14px] leading-tight" style={{ color: visible ? n.color : '#9CA3AF' }}>{visible ? n.sub : step >= 3 ? 'oculto' : 'passo 4'}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Jar = ({ glow }: { glow: boolean }) => (
    <svg width="36" height="50" viewBox="0 0 44 62" aria-hidden>
        <rect x="9" y="2" width="26" height="9" rx="2.5" fill="#1F2937" stroke={FIGHTER} strokeWidth="1.5" />
        <rect x="4" y="11" width="36" height="48" rx="7" fill={`rgba(${FIGHTER_RGB},0.10)`} stroke={FIGHTER} strokeWidth="1.5" />
        <rect x="4" y="24" width="36" height="20" fill={glow ? 'rgba(225,29,72,0.35)' : `rgba(${FIGHTER_RGB},0.28)`} />
        <line x1="10" y1="31" x2="34" y2="31" stroke="#FDE68A" strokeWidth="1.5" />
        <line x1="10" y1="37" x2="28" y2="37" stroke="#FDE68A" strokeWidth="1.5" />
    </svg>
);

const LabelCard = ({ step, revealed }: SceneProps) => {
    const exposed = step >= 2 && revealed;
    const [sweep, setSweep] = useState(true);
    return (
        <motion.div className="rounded-xl border px-3 py-2.5 flex flex-col gap-1.5" style={{ background: 'rgba(0,0,0,0.32)' }}
            animate={{ borderColor: FOCUS[step] === 0 ? `rgba(${FIGHTER_RGB},0.75)` : 'rgba(255,255,255,0.12)' }} transition={{ duration: DUR.morph, ease: EASE_OUT }}>
            <div className="font-mono text-[14px] uppercase tracking-wider" style={{ color: FIGHTER }}>O rótulo</div>
            <div className="flex gap-2.5 items-start">
                <Jar glow={exposed} />
                <div className="min-w-0">
                    <div className="text-[17px] font-bold leading-tight text-white">"Testo Booster Natural"</div>
                    <div className="mt-1 flex flex-col text-[15px]">
                        <motion.span className="rounded px-1 -mx-1 self-start"
                            animate={{ backgroundColor: exposed ? `rgba(${FIGHTER_RGB},0.25)` : 'rgba(0,0,0,0)', color: exposed ? '#FDE68A' : '#E5E7EB' }}
                            transition={{ duration: DUR.morph, ease: EASE_OUT }}>
                            Fórmula Proprietária
                        </motion.span>
                        <span className="text-gray-200">+ Tribulus</span>
                    </div>
                </div>
            </div>
            {exposed && (
                <motion.div className="relative overflow-hidden rounded-lg border px-2.5 py-1"
                    style={{ borderColor: 'rgba(225,29,72,0.7)', background: 'rgba(225,29,72,0.14)' }}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.enter, ease: EASE_OUT }}>
                    {/* O brilho sai de cena ao terminar: parado à direita, ele esticava a caixa (estouro de 1 px no 4:3). */}
                    {sweep && (
                        <motion.div className="absolute inset-y-0 left-0 w-[40%]" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }}
                            initial={{ x: '-100%' }} animate={{ x: '275%' }} transition={{ duration: DUR.draw, delay: 0.15, ease: EASE_IN_OUT }}
                            onAnimationComplete={() => setSweep(false)} />
                    )}
                    <div className="text-[15px] font-semibold leading-snug text-rose-100">SARMs ou pró-hormonais cruzados</div>
                    <div className="font-mono text-[14px] uppercase tracking-wide text-rose-300">mascarados</div>
                </motion.div>
            )}
        </motion.div>
    );
};

const ReportCard = ({ step }: { step: number }) => {
    const reduce = useReducedMotion();
    return (
        <motion.div className="rounded-xl border px-3 py-2.5 flex flex-col gap-1" style={{ background: 'rgba(0,0,0,0.32)' }}
            animate={{ borderColor: FOCUS[step] === 1 ? 'rgba(225,29,72,0.75)' : 'rgba(255,255,255,0.12)' }} transition={{ duration: DUR.morph, ease: EASE_OUT }}>
            <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[14px] uppercase tracking-wider text-rose-300">O laudo</span>
                <span className="font-mono text-[14px] font-bold uppercase tracking-wider px-1.5 py-[1px] rounded border-2 -rotate-3"
                    style={{ color: '#FB7185', borderColor: '#FB7185' }}>Positivo</span>
            </div>
            <div className="text-[17px] font-bold leading-tight text-white">SARM LGD-4033</div>
            <div className="text-[15px] text-gray-200 -mt-0.5">controle surpresa</div>
            <div className="mt-auto">
                <div className="font-mono text-[14px] uppercase tracking-wide text-gray-300">Quantidade detectada</div>
                {step >= 1 ? (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.enter, ease: EASE_OUT }}>
                        <span className="font-mono text-[32px] font-bold leading-none text-amber-300">0,8</span>
                        <span className="font-mono text-[16px] font-semibold text-amber-300 ml-1.5">ng/mL</span>
                        <div className="mt-1">
                            <span className="font-mono text-[14px] font-bold uppercase tracking-wide px-1.5 py-[1px] rounded border"
                                style={{ color: '#FBBF24', borderColor: 'rgba(251,191,36,0.6)', background: 'rgba(251,191,36,0.12)' }}>traço baixo</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.span className="inline-block mt-1 font-mono text-[14px] text-gray-300 px-2 py-0.5 rounded border border-dashed border-white/25"
                        animate={reduce ? { opacity: 0.8 } : { opacity: [0.55, 1, 0.55] }}
                        transition={reduce ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: EASE_IN_OUT }}>
                        aguardando
                    </motion.span>
                )}
            </div>
        </motion.div>
    );
};

const Suspension = ({ step, revealed }: SceneProps) => {
    const reduce = useReducedMotion();
    const open = step >= 3 && revealed;
    if (!open) {
        return (
            <div className="h-full rounded-xl border border-dashed border-white/20 flex items-center gap-2.5 px-3.5 text-[15px] text-gray-300">
                <Lock size={16} /> Desfecho da defesa: {step >= 3 ? 'resposta oculta' : 'abre no passo 4'}
            </div>
        );
    }
    return (
        <div className="h-full rounded-xl border px-3.5 py-2 flex flex-col justify-center gap-1.5" style={{ borderColor: 'rgba(56,189,248,0.6)', background: 'rgba(56,189,248,0.08)' }}>
            <div className="flex items-center justify-between">
                <span className="font-mono text-[14px] uppercase tracking-wider text-sky-300">Suspensão</span>
                <span className="text-[14px] text-gray-200">com "ausência de intenção" estabelecida</span>
            </div>
            <div className="relative h-[20px] rounded-md bg-white/8 overflow-hidden">
                <div className="absolute inset-0 rounded-md border border-dashed border-rose-400/70" />
                <motion.div className="absolute inset-0 rounded-md"
                    initial={{ clipPath: 'inset(0 0% 0 0 round 6px)', background: '#E11D48' }} animate={{ clipPath: 'inset(0 75% 0 0 round 6px)', background: SUBSTANCE.allowed }}
                    transition={{ duration: reduce ? 0 : DUR.bar, delay: reduce ? 0 : 0.3, ease: EASE_IN_OUT }} />
            </div>
            <div className="relative h-[20px] font-mono text-[15px] font-bold">
                <motion.span className="absolute text-sky-300 -translate-x-full pr-1" style={{ left: '25%' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: DUR.enter, ease: EASE_OUT }}>1 ano</motion.span>
                <span className="absolute right-0 text-rose-300 line-through decoration-2">4 anos</span>
            </div>
        </div>
    );
};

export const FighterScene = ({ step, revealed }: SceneProps) => (
    <div className="flex flex-col gap-2 h-full">
        <Timeline step={step} revealed={revealed} />
        <div className="grid grid-cols-2 gap-2">
            <LabelCard step={step} revealed={revealed} />
            <ReportCard step={step} />
        </div>
        <div className="flex-1 min-h-[76px]">
            <Suspension step={step} revealed={revealed} />
        </div>
    </div>
);
