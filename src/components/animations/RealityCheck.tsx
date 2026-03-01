import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';

// 100 athletes: we'll label the first N as detected, next M as truly doping but undetected, rest as clean
const TOTAL = 100;
const DETECTED = 2;       // official WADA catch rate
const TRUE_DOPING = 43;   // real prevalence

type AthleteState = 'clean' | 'detected' | 'hidden_doper';

interface Athlete {
    id: number;
    state: AthleteState;
    x: number;
    y: number;
}

const COLS = 10;
const athletes: Athlete[] = Array.from({ length: TOTAL }, (_, i) => {
    let state: AthleteState = 'clean';
    if (i < DETECTED) state = 'detected';
    else if (i < TRUE_DOPING) state = 'hidden_doper';
    return {
        id: i,
        state,
        x: (i % COLS) * 10,
        y: Math.floor(i / COLS) * 10,
    };
});

const stateConfig = {
    detected: {
        color: '#3b82f6',
        glow: 'rgba(59,130,246,0.5)',
        label: 'Detectado (WADA)',
        emoji: '🔍',
    },
    hidden_doper: {
        color: '#e11d48',
        glow: 'rgba(225,29,72,0.5)',
        label: 'Dopado (Não Detectado)',
        emoji: '🩸',
    },
    clean: {
        color: 'rgba(255,255,255,0.15)',
        glow: 'transparent',
        label: 'Limpo',
        emoji: '✅',
    },
};

// Animated number counter
const AnimatedNumber = ({ target, color, suffix = '%' }: { target: number; color: string; suffix?: string }) => (
    <motion.span
        style={{ color }}
        initial={{ scale: 0.7, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: false, amount: 0.5 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="font-black font-display text-5xl tabular-nums"
    >
        {target}{suffix}
    </motion.span>
);

export const RealityCheck = () => {
    const [revealed, setRevealed] = useState(false);
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    const hovered = hoveredId !== null ? athletes[hoveredId] : null;

    return (
        <div className="w-full mt-2 font-body space-y-8 pointer-events-auto">

            {/* === Stats header === */}
            <div className="grid grid-cols-2 gap-4">
                {/* WADA */}
                <motion.div
                    className="relative overflow-hidden rounded-2xl p-5 flex flex-col items-center gap-1 border cursor-default"
                    style={{ background: 'rgba(30,58,138,0.2)', borderColor: 'rgba(59,130,246,0.3)' }}
                    whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(59,130,246,0.2)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse at top, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
                    <motion.div
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-1"
                        style={{ background: 'conic-gradient(#3b82f6 7.2deg, rgba(255,255,255,0.06) 0deg)' }}
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                    >
                        <div className="w-14 h-14 rounded-full bg-[#080818] flex items-center justify-center">
                            <AnimatedNumber target={2} color="#3b82f6" />
                        </div>
                    </motion.div>
                    <p className="text-xs font-semibold text-blue-300 uppercase tracking-widest">Detectado pela WADA</p>
                    <p className="text-[10px] text-gray-500 text-center leading-relaxed mt-1">Amostras positivas em controle oficial</p>
                </motion.div>

                {/* Real */}
                <motion.div
                    className="relative overflow-hidden rounded-2xl p-5 flex flex-col items-center gap-1 border cursor-default"
                    style={{ background: 'rgba(127,29,29,0.2)', borderColor: 'rgba(225,29,72,0.35)' }}
                    whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(225,29,72,0.2)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                    <div className="absolute inset-0 pointer-events-none"
                        style={{ background: 'radial-gradient(ellipse at top, rgba(225,29,72,0.10) 0%, transparent 70%)' }} />
                    <motion.div
                        className="w-20 h-20 rounded-full flex items-center justify-center mb-1"
                        style={{ background: 'conic-gradient(#e11d48 154.8deg, rgba(255,255,255,0.06) 0deg)' }}
                        animate={{ rotate: [0, -360] }}
                        transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
                    >
                        <div className="w-14 h-14 rounded-full bg-[#080818] flex items-center justify-center">
                            <AnimatedNumber target={43} color="#e11d48" />
                        </div>
                    </motion.div>
                    <p className="text-xs font-semibold text-red-300 uppercase tracking-widest">Prevalência Real</p>
                    <p className="text-[10px] text-gray-500 text-center leading-relaxed mt-1">Métodos epidemiológicos anônimos</p>
                </motion.div>
            </div>

            {/* === Dot Grid === */}
            <motion.div
                className="rounded-2xl border border-white/8 p-6"
                style={{ background: 'rgba(5,5,18,0.75)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6 }}
            >
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                        100 atletas de elite — passe o mouse nos pontos
                    </p>
                    <button
                        onClick={() => setRevealed(r => !r)}
                        className="text-xs px-4 py-1.5 rounded-full border transition-all duration-300 font-medium cursor-pointer"
                        style={revealed
                            ? { borderColor: '#e11d48', color: '#e11d48', background: 'rgba(225,29,72,0.1)' }
                            : { borderColor: 'rgba(255,255,255,0.2)', color: '#9ca3af', background: 'rgba(255,255,255,0.04)' }
                        }
                    >
                        {revealed ? '🔴 Esconder realidade' : '👁 Revelar realidade'}
                    </button>
                </div>

                {/* Grid of dots */}
                <div
                    className="grid gap-1.5 mx-auto w-fit"
                    style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
                >
                    {athletes.map((a) => {
                        const isRevealed = revealed || a.state === 'detected';
                        const cfg = stateConfig[isRevealed ? a.state : (a.state === 'detected' ? 'detected' : 'clean')];
                        const isHov = hoveredId === a.id;

                        return (
                            <motion.div
                                key={a.id}
                                className="w-6 h-6 rounded-full cursor-pointer relative"
                                style={{ background: cfg.color }}
                                animate={{
                                    scale: isHov ? 1.6 : 1,
                                    boxShadow: isHov ? `0 0 12px 4px ${cfg.glow}` : 'none',
                                }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                                onHoverStart={() => setHoveredId(a.id)}
                                onHoverEnd={() => setHoveredId(null)}
                                layout
                            />
                        );
                    })}
                </div>

                {/* Tooltip */}
                <div className="mt-4 h-8 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        {hovered && (
                            <motion.div
                                key={hovered.id}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.15 }}
                                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs border"
                                style={{
                                    borderColor: stateConfig[hovered.state].glow,
                                    background: `${stateConfig[hovered.state].glow}22`,
                                    color: hovered.state === 'clean' ? '#9ca3af' : stateConfig[hovered.state].color,
                                }}
                            >
                                <span>{stateConfig[hovered.state].emoji}</span>
                                <span>Atleta #{hovered.id + 1} — {stateConfig[revealed ? hovered.state : (hovered.state === 'detected' ? 'detected' : 'clean')].label}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Legend */}
                <div className="mt-3 flex flex-wrap gap-4 justify-center">
                    {Object.entries(stateConfig).map(([key, cfg]) => (
                        <div key={key} className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: cfg.color }} />
                            {cfg.label}
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* === Why section === */}
            <motion.div
                className="rounded-2xl border border-white/8 p-5"
                style={{ background: 'rgba(0,0,0,0.5)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: 0.1 }}
            >
                <h3 className="font-display text-base text-yellow-400 font-semibold mb-4 flex items-center gap-2">
                    ⚠️ Por que a detecção falha?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { icon: '⏱️', title: 'Microdosagem', desc: 'Frações de dose em horários estratégicos evitam detecção na janela de clearance.' },
                        { icon: '🩸', title: 'Transfusão Autóloga', desc: 'Sangue próprio do atleta. Vestígios de plástico das bolsas são a única pista.' },
                        { icon: '🧬', title: 'Furo Genético (UGT2B17)', desc: 'Deleção genética impede excreção urinária de metabólitos — teste sempre "limpo".' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            className="p-4 rounded-xl border border-white/5 hover:border-yellow-400/30 transition-colors cursor-default"
                            style={{ background: 'rgba(255,255,255,0.02)' }}
                            whileHover={{ y: -3, background: 'rgba(255,255,255,0.04)' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        >
                            <div className="text-xl mb-2">{item.icon}</div>
                            <strong className="block text-white text-xs uppercase tracking-wider mb-1">{item.title}</strong>
                            <p className="text-gray-400 text-[11px] leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};
