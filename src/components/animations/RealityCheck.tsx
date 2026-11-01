import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

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

const DATA = [
    {
        id: 'wada',
        pct: 2,
        title: 'Detectado pela WADA',
        subtitle: '📊 Dados Oficiais Abertos',
        color: '#3b82f6',
        bg: 'rgba(30,58,138,0.2)',
        border: 'rgba(59,130,246,0.3)',
        glow: 'rgba(59,130,246,0.15)',
        question: 'Como funcionam os testes oficiais?',
        bullets: [
            'Dos ~300.000 testes/ano realizados pela WADA, apenas 1-2% resultam em AAF (Achados Analíticos Adversos).',
            'Isso equivale a cerca de 4.000 atletas pegos por ano em todo o mundo esportivo.',
            'Muitos destes casos positivos são de substâncias sociais/recreativas, não ergogênicas (doping intencional de performance).',
            'O teste é altamente específico (poucos falsos positivos), mas possui baixa sensibilidade real nas janelas off-season.'
        ]
    },
    {
        id: 'real',
        pct: 43,
        title: 'Prevalência Real',
        subtitle: '🔬 Metodologia Científica Anônima',
        color: '#e11d48',
        bg: 'rgba(127,29,29,0.2)',
        border: 'rgba(225,29,72,0.35)',
        glow: 'rgba(225,29,72,0.15)',
        question: 'Qual é a verdadeira extensão?',
        bullets: [
            'Pesquisa anônima de Ulrich et al. (2018) em eventos da IAAF usando a técnica do "Randomized Response Model".',
            '43,6% dos atletas de elite admitiram anonimamente uso de substâncias proibidas nos últimos 12 meses.',
            'Em Jogos Pan-Árabes e Pan-Americanos o número variou de 30% a 57% dependendo da modalidade avaliada.',
            'Isso indica que o sistema antidoping atual captura apenas uma fração mínima (aprox. 1 em cada 20) dos usuários crônicos.'
        ]
    }
];

export const RealityCheck = () => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    return (
        <div className="w-full max-w-4xl mx-auto mt-4 font-body">

            <div className="flex flex-col md:flex-row gap-6">
                {DATA.map((col) => {
                    const isAct = expandedRow === col.id;
                    return (
                        <motion.div
                            key={col.id}
                            layout
                            className="relative rounded-2xl border p-6 flex flex-col transition-colors cursor-pointer"
                            style={{
                                background: col.bg,
                                borderColor: isAct ? col.color : col.border,
                                boxShadow: isAct ? `0 0 30px ${col.glow}` : 'none',
                                flex: isAct ? '5 0 0' : '4 0 0'
                            }}
                            transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                            onClick={() => setExpandedRow(isAct ? null : col.id)}
                            whileHover={{ y: isAct ? 0 : -4 }}
                        >
                            <div className="absolute inset-0 pointer-events-none rounded-2xl"
                                style={{ background: `radial-gradient(ellipse at top, ${col.glow} 0%, transparent 60%)` }} />

                            {/* Circle Chart */}
                            <div className="flex justify-center mb-5">
                                <motion.div
                                    className="w-28 h-28 rounded-full flex items-center justify-center relative shadow-lg"
                                    style={{
                                        background: `conic-gradient(${col.color} ${(col.pct / 100) * 360}deg, rgba(255,255,255,0.05) 0deg)`
                                    }}
                                    initial={{ rotate: -90, opacity: 0 }}
                                    whileInView={{ rotate: 0, opacity: 1 }}
                                    viewport={{ once: false, amount: 0.5 }}
                                    transition={{ duration: 1, type: "spring", stiffness: 60 }}
                                >
                                    <div className="w-[88px] h-[88px] rounded-full bg-[#080818] flex items-center justify-center border border-white/5">
                                        <AnimatedNumber target={col.pct} color={col.color} />
                                    </div>
                                </motion.div>
                            </div>

                            <motion.h3 layout className="text-center font-display text-xl font-bold text-white mb-2">{col.title}</motion.h3>
                            <motion.p layout className="text-center text-xs font-semibold uppercase tracking-wide opacity-80 mb-6" style={{ color: col.color }}>{col.subtitle}</motion.p>

                            {/* Expandable Accordion Header */}
                            <div className="mt-auto pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between group">
                                    <span className="text-sm font-semibold flex items-center gap-2" style={{ color: isAct ? 'white' : '#fbbf24' }}>
                                        <motion.span animate={{ rotate: isAct ? 90 : 0 }} className="text-xs">▶</motion.span>
                                        {col.question}
                                    </span>
                                </div>

                                {/* Expanded Content */}
                                <AnimatePresence mode="wait">
                                    {isAct && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-4 pb-2">
                                                <ul className="space-y-3">
                                                    {col.bullets.map((b, i) => (
                                                        <motion.li
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.1 + (i * 0.05) }}
                                                            className="flex items-start gap-2 text-sm text-gray-300"
                                                        >
                                                            <span className="text-xs mt-1" style={{ color: col.color }}>●</span>
                                                            <span className="leading-relaxed">{b}</span>
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <p className="text-center text-[10px] text-gray-500 mt-6 tracking-widest uppercase">
                Clique nos painéis para expandir os dados
            </p>
        </div>
    );
};
