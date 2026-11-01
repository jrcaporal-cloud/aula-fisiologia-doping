import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Studies: name, n, advantage_pct (% residual advantage after TRT), years_TRT, note
const STUDIES = [
    { name: 'Hilton & Lundberg 2021', n: 'Meta-análise', adv: 12, years: '2-3', color: '#e11d48', finding: 'Vantagem residual de 10-14% em força muscular após 2-3 anos de TRT feminizante.', limit: 'Maioria dos estudos com amostras pequenas (N<30). Atletas recreacionais, não de elite.' },
    { name: 'Roberts et al. 2021', n: 'N=29 trans', adv: 0, years: '4+', color: '#34d399', finding: 'Após 4 anos de TRT, nenhuma diferença estatisticamente significativa em tempos de corrida vs. cis femininas.', limit: 'Militares da Força Aérea dos EUA — não atletas de elite. N muito pequeno.' },
    { name: 'Harper et al. 2021', n: 'N≈50', adv: 6, years: '2', finding: 'Após 2 anos de TRT, tempo de corrida reduziu ~12%. Força de preensão: -17%. Vantagem residual ainda presente.', color: '#f59e0b', limit: 'Militares britânicos. Sem controle pelo nível atlético pré-transição.' },
    { name: 'Handelsman 2017', n: 'Revisão', adv: 10, years: '1', color: '#a855f7', finding: 'Gap de força entre sexos: 10-12% em velocidade, 20-30% em força. Maior parte da diferença persiste após 12 meses de TRT.', limit: 'Baseado em dados fisiológicos gerais, não em estudos longitudinais de atletas trans.' },
];

const GAPS = [
    { sport: 'Corrida 100m', gap: 10, icon: '🏃' },
    { sport: 'Natação 100m', gap: 7, icon: '🏊' },
    { sport: 'Levantamento de peso', gap: 25, icon: '🏋️' },
    { sport: 'Salto em distância', gap: 14, icon: '⬆️' },
    { sport: 'Ciclismo (FTP)', gap: 10, icon: '🚴' },
    { sport: 'Arremesso de peso', gap: 30, icon: '⚙️' },
];

const GAPS_KNOWN: { item: string; confident: boolean }[] = [
    { item: 'T elevada durante puberdade cria vantagens estruturais', confident: true },
    { item: 'TRT feminizante por 2+ anos reduz força muscular significativamente', confident: true },
    { item: 'Vantagem residual de força de 10-14% persiste após 2-3 anos (Hilton 2021)', confident: true },
    { item: 'Gap desaparece completamente após 4 anos (Roberts 2021)', confident: false },
    { item: 'Trans femininas têm desempenho superior a cis femininas em elite', confident: false },
    { item: 'Períodos maiores de TRT eliminam totalmente a vantagem', confident: false },
    { item: 'Efeitos da TRT em atletas de elite são equivalentes aos de recreacionais', confident: false },
];

export const TransScienceReview = () => {
    const [activeStudy, setActiveStudy] = useState<number | null>(null);
    const [section, setSection] = useState<'studies' | 'gaps' | 'consensus'>('studies');

    const SECTIONS = [
        { key: 'studies', label: '📊 Estudos Comparados', color: '#a855f7' },
        { key: 'gaps', label: '🏆 Diferença por Modalidade', color: '#60a5fa' },
        { key: 'consensus', label: '✅ O Que Sabemos', color: '#34d399' },
    ] as const;

    return (
        <div className="w-full space-y-5 font-body">
            {/* Section tabs */}
            <div className="flex gap-2 flex-wrap">
                {SECTIONS.map(s => (
                    <button
                        key={s.key}
                        onClick={() => setSection(s.key)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all"
                        style={section === s.key
                            ? { borderColor: s.color, color: s.color, background: `${s.color}15` }
                            : { borderColor: 'rgba(255,255,255,0.1)', color: '#6b7280' }
                        }
                    >{s.label}</button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Studies */}
                {section === 'studies' && (
                    <motion.div key="studies" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                        <div className="text-xs text-gray-500 mb-2">Clique em cada estudo para ver detalhes críticos</div>
                        {STUDIES.map((study, i) => {
                            const isAct = activeStudy === i;
                            return (
                                <motion.div
                                    key={study.name}
                                    onClick={() => setActiveStudy(isAct ? null : i)}
                                    className="rounded-xl border cursor-pointer overflow-hidden"
                                    style={{ borderColor: isAct ? `${study.color}55` : 'rgba(255,255,255,0.07)', background: isAct ? `${study.color}08` : 'rgba(8,8,18,0.6)' }}
                                    whileHover={{ y: -2 }}
                                    transition={{ type: 'spring', stiffness: 280 }}
                                >
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="text-sm font-semibold text-white">{study.name}</div>
                                                <div className="text-[10px] text-gray-500">{study.n} · {study.years} anos de TRT</div>
                                            </div>
                                            {/* Advantage bar */}
                                            <div className="flex items-center gap-2">
                                                <div className="text-right">
                                                    <div className="text-xs font-bold" style={{ color: study.color }}>
                                                        {study.adv === 0 ? 'Sem diferença' : `+${study.adv}%`}
                                                    </div>
                                                    <div className="text-[9px] text-gray-600">vantagem residual</div>
                                                </div>
                                                <div className="w-16 h-6 rounded bg-white/5 overflow-hidden">
                                                    <motion.div
                                                        className="h-full rounded"
                                                        style={{ background: study.color }}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(study.adv / 35) * 100}%` }}
                                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <AnimatePresence>
                                            {isAct && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    style={{ overflow: 'hidden' }}
                                                >
                                                    <div className="pt-3 border-t border-white/8 space-y-2">
                                                        <div>
                                                            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Achado principal</div>
                                                            <p className="text-xs text-gray-300">{study.finding}</p>
                                                        </div>
                                                        <div className="flex gap-2 items-start">
                                                            <span className="text-amber-400 flex-shrink-0">⚠️</span>
                                                            <div>
                                                                <div className="text-[10px] text-amber-400 font-bold">Limitação crítica</div>
                                                                <p className="text-[11px] text-gray-400">{study.limit}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}

                {/* Performance gaps */}
                {section === 'gaps' && (
                    <motion.div key="gaps" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                        <div className="text-xs text-gray-500 mb-4">Gap médio de performance entre atletas masculinos e femininos de elite (antes de qualquer TRT)</div>
                        <div className="space-y-3">
                            {GAPS.map((g, i) => (
                                <motion.div key={g.sport} className="flex items-center gap-3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                                    <span className="w-6 text-center">{g.icon}</span>
                                    <span className="text-xs text-gray-300 w-36 flex-shrink-0">{g.sport}</span>
                                    <div className="flex-1 relative h-7 flex items-center">
                                        <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full"
                                                style={{ background: `linear-gradient(90deg, #60a5fa, #a855f7)` }}
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${(g.gap / 35) * 100}%` }}
                                                viewport={{ once: false }}
                                                transition={{ duration: 0.9, delay: i * 0.1 }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-white w-12 text-right">~{g.gap}%</span>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-4 p-3 rounded-xl border border-blue-900/30 text-xs text-gray-400" style={{ background: 'rgba(30,58,138,0.15)' }}>
                            💡 A TRT feminizante reduz uma parte desse gap — mas quanto, por quanto tempo, e a que ponto é "suficiente" para competição igualitária? Essa é a pergunta central sem resposta definitiva na literatura.
                        </div>
                    </motion.div>
                )}

                {/* Consensus */}
                {section === 'consensus' && (
                    <motion.div key="consensus" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-2">
                        <div className="text-xs text-gray-500 mb-3">O que a literatura científica atual consegue ou não afirmar com confiança</div>
                        {GAPS_KNOWN.map((item, i) => (
                            <motion.div
                                key={item.item}
                                initial={{ opacity: 0, x: -8 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.07 }}
                                className="flex items-center gap-3 rounded-xl border px-4 py-3"
                                style={{
                                    borderColor: item.confident ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)',
                                    background: item.confident ? 'rgba(6,78,59,0.12)' : 'rgba(127,29,29,0.12)',
                                }}
                            >
                                <span className="text-lg flex-shrink-0">{item.confident ? '✅' : '❓'}</span>
                                <span className="text-xs text-gray-300">{item.item}</span>
                                <span className="ml-auto text-[10px] flex-shrink-0" style={{ color: item.confident ? '#34d399' : '#f87171' }}>
                                    {item.confident ? 'Evidência sólida' : 'Inconclusivo'}
                                </span>
                            </motion.div>
                        ))}
                        <div className="mt-3 p-4 rounded-2xl border border-white/8" style={{ background: 'rgba(8,8,18,0.6)' }}>
                            <div className="text-xs font-bold text-white mb-2">🔬 Posição das Sociedades Médicas</div>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                <strong className="text-white">Endocrine Society, WPATH e Pediatric Endocrine Society</strong> recomendam inclusão de atletas trans com monitoramento caso a caso — reconhecendo que a ciência ainda não permite regras universais baseadas estritamente em evidência. O debate permanece mais ético e político do que puramente científico.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
