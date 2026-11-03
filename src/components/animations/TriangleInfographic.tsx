import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { PILLARS } from './pillars/data';
import { PillarCard, type PillarMode } from './pillars/PillarCard';

/** Frontão: o "Performance Total" sustentado pelos três eixos. */
const Pediment = ({ activeColor }: { activeColor: string | null }) => (
    <div className="relative h-[60px] mx-[-10px]">
        <svg viewBox="0 0 1000 60" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden>
            <defs>
                <linearGradient id="pediment-stroke" x1="0" x2="1">
                    <stop offset="0%" stopColor={PILLARS[0].color} />
                    <stop offset="50%" stopColor={PILLARS[1].color} />
                    <stop offset="100%" stopColor={PILLARS[2].color} />
                </linearGradient>
                <linearGradient id="pediment-fill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.015)" />
                </linearGradient>
            </defs>
            <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}>
                <polygon points="10,44 500,4 990,44" fill="url(#pediment-fill)" />
                <polyline
                    points="10,44 500,4 990,44"
                    fill="none"
                    stroke={activeColor ?? 'url(#pediment-stroke)'}
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </motion.g>
            <rect x="0" y="46" width="1000" height="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)" vectorEffect="non-scaling-stroke" />
        </svg>
        <motion.div
            className="absolute inset-x-0 top-[20px] text-center font-display font-bold tracking-[0.3em] text-[18px] text-white"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, textShadow: activeColor ? `0 0 18px ${activeColor}` : '0 0 18px rgba(255,255,255,0.25)' }}
            transition={{ delay: 0.6, duration: 0.6 }}
        >
            PERFORMANCE TOTAL
        </motion.div>
    </div>
);

/**
 * Os Três Pilares do Desempenho: um templo cujo frontão (performance) é sustentado
 * por três eixos. Passador: 0 = visão geral; 1–3 = abre um pilar e seu mecanismo; os pilares
 * já vistos ficam compactos e acesos (no último passo os três aparecem legíveis).
 * Clicar num pilar abre/fecha manualmente até o próximo passo.
 */
export const TriangleInfographic = () => {
    const { step } = useSlideSteps(4);
    const [manual, setManual] = useState<{ step: number; value: number | null } | null>(null);
    const active = manual && manual.step === step ? manual.value : step > 0 ? step - 1 : null;
    const toggle = (i: number) => setManual({ step, value: active === i ? null : i });
    const modeOf = (i: number): PillarMode =>
        active === null ? 'idle' : active === i ? 'focus' : i < active ? 'done' : 'dim';

    return (
        <div className="w-full font-body not-prose">
            <Pediment activeColor={active !== null ? PILLARS[active].color : null} />
            <div className="flex gap-6 h-[450px] px-2 pt-1">
                {PILLARS.map((p, i) => (
                    <PillarCard key={p.kind} pillar={p} index={i} mode={modeOf(i)} onToggle={() => toggle(i)} />
                ))}
            </div>
            <div className="h-2.5 mx-[-14px] mt-0 rounded-sm bg-white/[0.06] border border-white/10" aria-hidden />
        </div>
    );
};
