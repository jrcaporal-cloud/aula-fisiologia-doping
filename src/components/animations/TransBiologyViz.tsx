import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Testosterone levels by group (nmol/L)
const T_GROUPS = [
    { label: 'Homem Cis', range: [8, 29], mean: 18, color: '#60a5fa', icon: '👨' },
    { label: 'Mulher Trans\n(sem TRT)', range: [8, 29], mean: 17, color: '#a78bfa', icon: '🏃' },
    { label: 'Mulher Trans\n(2 anos TRT)', range: [0.3, 3.5], mean: 1.8, color: '#c084fc', icon: '🏅' },
    { label: 'Mulher Trans\n(WA: <2.5 nmol)', range: [0, 2.5], mean: 1.2, color: '#e879f9', icon: '📋' },
    { label: 'Mulher Cis', range: [0.2, 2.5], mean: 1.0, color: '#f0abfc', icon: '👩' },
];

const MAX_T = 30;

// What TRT reverses / doesn't
const REVERSIBILITY = [
    { item: 'Força muscular relativa', reversed: true, note: '~80% normalizada em 2-3 anos' },
    { item: 'VO₂max relativo', reversed: true, note: 'Redução de ~10-12% documentada' },
    { item: 'Número de mionúcleos', reversed: false, note: 'Memória muscular permanente' },
    { item: 'Estatura e envergadura', reversed: false, note: 'Estrutura óssea irreversível' },
    { item: 'Tamanho do coração (VE)', reversed: false, note: 'Hipertrofia persistente' },
    { item: 'Densidade óssea', reversed: false, note: 'Vantagem esquelética residual' },
    { item: 'Hematócrito', reversed: true, note: 'Normaliza em ~3 meses' },
    { item: 'Velocidade de reação', reversed: false, note: 'Latência neural diferencial' },
];

export const TransBiologyViz = () => {
    const [activeGroup, setActiveGroup] = useState<number | null>(null);
    const [showAll, setShowAll] = useState(false);

    return (
        <div className="w-full space-y-6 font-body">

            {/* ═══ Testosterone Level Chart ═══ */}
            <div className="rounded-2xl border border-white/8 p-5" style={{ background: 'rgba(5,5,18,0.85)' }}>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-gray-500 mb-1">Níveis Séricos de Testosterona (nmol/L)</div>
                        <div className="text-white font-medium text-sm">Comparação entre grupos — valores de referência clínica</div>
                    </div>
                    <div className="text-[10px] text-gray-500 text-right">Cada barra = faixa normal<br />ponto = média</div>
                </div>

                <div className="space-y-3">
                    {T_GROUPS.map((g, i) => {
                        const barL = (g.range[0] / MAX_T) * 100;
                        const barW = ((g.range[1] - g.range[0]) / MAX_T) * 100;
                        const meanX = (g.mean / MAX_T) * 100;
                        const isAct = activeGroup === i;
                        return (
                            <motion.div
                                key={i}
                                className="cursor-pointer"
                                onClick={() => setActiveGroup(isAct ? null : i)}
                                whileHover={{ x: 4 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-base w-6 flex-shrink-0">{g.icon}</span>
                                    <span className="text-xs text-gray-300 w-36 flex-shrink-0 leading-tight" style={{ color: isAct ? g.color : '#9ca3af' }}>
                                        {g.label.replace('\n', ' ')}
                                    </span>
                                    <div className="flex-1 relative h-5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        {/* Range bar */}
                                        <motion.div
                                            className="absolute top-1 h-3 rounded-full"
                                            style={{ left: `${barL}%`, background: g.color, opacity: isAct ? 0.7 : 0.3 }}
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${barW}%` }}
                                            viewport={{ once: false }}
                                            transition={{ duration: 0.8, delay: i * 0.1 }}
                                        />
                                        {/* Mean dot */}
                                        <motion.div
                                            className="absolute top-0.5 w-4 h-4 rounded-full border-2"
                                            style={{ left: `calc(${meanX}% - 8px)`, background: g.color, borderColor: 'rgba(0,0,0,0.5)' }}
                                            initial={{ scale: 0 }}
                                            whileInView={{ scale: 1 }}
                                            viewport={{ once: false }}
                                            transition={{ duration: 0.5, delay: i * 0.1 + 0.4 }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-gray-500 w-20 text-right">{g.range[0]}–{g.range[1]} nmol/L</span>
                                </div>
                                <AnimatePresence>
                                    {isAct && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="ml-9 pl-3 border-l text-xs text-gray-400 py-1.5" style={{ borderColor: g.color }}>
                                                Média: <strong style={{ color: g.color }}>{g.mean} nmol/L</strong>
                                                {i === 3 && ' — limiar regulatório imposto pelo World Athletics'}
                                                {i === 2 && ' — após 2 anos de TRT feminizante padrão'}
                                                {i === 0 && ' — testosterona fisiológica masculina adulta'}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* X axis markers */}
                <div className="ml-[216px] flex justify-between text-[9px] text-gray-600 mt-2">
                    {[0, 5, 10, 15, 20, 25, 30].map(v => <span key={v}>{v}</span>)}
                </div>
            </div>

            {/* ═══ Reversibility Grid ═══ */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="text-xs uppercase tracking-widest text-gray-500">O que a TRT Feminizante Reverte vs. Não Reverte</div>
                    <button
                        onClick={() => setShowAll(s => !s)}
                        className="text-[10px] px-3 py-1 rounded-full border border-white/10 text-gray-400 hover:border-white/20 cursor-pointer transition-colors"
                    >
                        {showAll ? 'Mostrar menos' : 'Ver todos'}
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {(showAll ? REVERSIBILITY : REVERSIBILITY.slice(0, 6)).map((item, i) => (
                        <motion.div
                            key={item.item}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
                            style={{
                                borderColor: item.reversed ? 'rgba(52,211,153,0.25)' : 'rgba(248,113,113,0.25)',
                                background: item.reversed ? 'rgba(6,78,59,0.15)' : 'rgba(127,29,29,0.15)',
                            }}
                        >
                            <span className="text-lg flex-shrink-0">{item.reversed ? '✅' : '❌'}</span>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-white leading-tight">{item.item}</div>
                                <div className="text-[10px] text-gray-400">{item.note}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

        </div>
    );
};
