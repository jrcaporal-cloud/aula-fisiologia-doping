import { motion } from 'framer-motion';
import { useState } from 'react';

const COMPOUNDS = [
    {
        name: 'EAA',
        role: 'Base Androgênica',
        color: '#60a5fa',
        glow: 'rgba(96,165,250,0.35)',
        bg: 'rgba(30,58,138,0.25)',
        border: 'rgba(96,165,250,0.3)',
        half: '7–10 dias',
        detect: '3 meses',
        desc: 'Mionucleação permanente. O "chassis" do stack — suporta todas as adaptações estruturais.',
    },
    {
        name: 'hGH / IGF-1',
        role: 'Multiplicador Celular',
        color: '#34d399',
        glow: 'rgba(52,211,153,0.35)',
        bg: 'rgba(6,78,59,0.25)',
        border: 'rgba(52,211,153,0.3)',
        half: '15–20 min',
        detect: '24–48h',
        desc: 'Hiperplasia via GHR → Síntese hepática/local de IGF-1. Lipólise extrema + pele "granítica".',
    },
    {
        name: 'INSULINA',
        role: 'Gatilho Master',
        color: '#f87171',
        glow: 'rgba(248,113,113,0.35)',
        bg: 'rgba(127,29,29,0.25)',
        border: 'rgba(248,113,113,0.3)',
        half: '4–6 min',
        detect: 'Indetectável',
        desc: 'Satura GLUT4 → células musculares viram "esponjas". Blinda mTORC1 via Ubiquitina-Proteassoma.',
    },
];

export const StackOlimpicoDisplay = () => {
    const [active, setActive] = useState<number | null>(null);

    return (
        <div className="w-full space-y-6 font-body">

            {/* === Result headline === */}
            <motion.div
                className="relative overflow-hidden rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 border"
                style={{ background: 'rgba(5,5,18,0.8)', borderColor: 'rgba(255,255,255,0.08)' }}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.4 }}
                transition={{ duration: 0.7 }}
            >
                {/* BG glow */}
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(96,165,250,0.04) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(225,29,72,0.06) 0%, transparent 60%)' }} />

                {/* Stat */}
                <div className="text-center flex-shrink-0">
                    <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Resultado documentado</div>
                    <div className="flex items-baseline gap-1 justify-center">
                        <motion.span
                            className="font-display font-black text-5xl text-white"
                            initial={{ opacity: 0, scale: 0.7 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: false }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        >
                            +5
                        </motion.span>
                        <span className="text-gray-400 text-2xl font-display">→</span>
                        <motion.span
                            className="font-display font-black text-5xl"
                            style={{ color: '#e11d48' }}
                            initial={{ opacity: 0, scale: 0.7 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: false }}
                            transition={{ type: 'spring', stiffness: 200, delay: 0.4 }}
                        >
                            +8kg
                        </motion.span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">massa funcional limpa · 8-12 semanas</div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-16 bg-white/10 flex-shrink-0" />

                {/* Risk */}
                <motion.div
                    className="flex-1 flex items-start gap-3 rounded-xl p-4 border border-red-900/40"
                    style={{ background: 'rgba(127,29,29,0.2)' }}
                    animate={{ borderColor: ['rgba(127,29,29,0.4)', 'rgba(225,29,72,0.5)', 'rgba(127,29,29,0.4)'] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <span className="text-2xl flex-shrink-0">⚠️</span>
                    <div>
                        <div className="text-xs font-bold text-red-300 uppercase tracking-wider mb-1">Risco Sistêmico Crítico</div>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            Hiperglicemia reativa aguda pela INSULINA: risco de hipoglicemia severa intra-treino levando a coma e indução fatal celular. Janela de erro = minutos.
                        </p>
                    </div>
                </motion.div>
            </motion.div>

            {/* === Compound cards (interactive) === */}
            <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-3">Componentes do Stack — clique para detalhar</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {COMPOUNDS.map((c, i) => {
                        const isActive = active === i;
                        return (
                            <motion.div
                                key={i}
                                className="rounded-2xl border cursor-pointer overflow-hidden"
                                style={{
                                    borderColor: isActive ? c.border : 'rgba(255,255,255,0.06)',
                                    background: isActive ? c.bg : 'rgba(8,8,18,0.6)',
                                }}
                                whileHover={{ y: -4, borderColor: c.border, boxShadow: `0 16px 40px ${c.glow}` }}
                                animate={{ boxShadow: isActive ? `0 0 30px ${c.glow}` : 'none' }}
                                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                                onClick={() => setActive(isActive ? null : i)}
                            >
                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <div className="font-display font-black text-xl" style={{ color: c.color }}>{c.name}</div>
                                            <div className="text-[10px] text-gray-400 uppercase tracking-wider">{c.role}</div>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isActive ? 45 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="w-6 h-6 rounded-full border flex items-center justify-center text-xs"
                                            style={{ borderColor: c.border, color: c.color }}
                                        >
                                            +
                                        </motion.div>
                                    </div>

                                    {/* Pills */}
                                    <div className="flex gap-2 flex-wrap mb-3">
                                        <span className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: `${c.color}33`, color: c.color, background: `${c.color}11` }}>
                                            T½ {c.half}
                                        </span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-gray-400">
                                            Det: {c.detect}
                                        </span>
                                    </div>

                                    {/* Expandable */}
                                    <motion.div
                                        initial={false}
                                        animate={{ height: isActive ? 'auto' : 0, opacity: isActive ? 1 : 0 }}
                                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <p className="text-xs text-gray-300 leading-relaxed pt-2 border-t border-white/8">
                                            {c.desc}
                                        </p>
                                    </motion.div>
                                </div>

                                {/* Bottom accent line */}
                                <motion.div
                                    className="h-[2px] w-full"
                                    style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }}
                                    animate={{ opacity: isActive ? 1 : 0.2 }}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
