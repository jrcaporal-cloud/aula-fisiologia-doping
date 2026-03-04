import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const CASES = [
    {
        year: 2009,
        name: 'Caster Semenya',
        country: '🇿🇦',
        sport: 'Atletismo 800m',
        color: '#f59e0b',
        case: 'IAAF exige teste de gênero. Semenya é mulher intersexual com hiperandrogenismo congênito (produção natural de T elevada).',
        outcome: 'Obrigada a tomar anticoncepcionais para competir. TEDH negou recurso final em 2023. 3× ré nas regras da WA.',
        regulation: 'World Athletics',
        impact: 'Criou precedente de vigilância biológica coercitiva para atletas femininas com T naturalmente alta.',
        twist: 'Semenya NUNCA fez doping. Suas T elevadas são endógenas — fruto de genética, não de manipulação.',
        result: 'lose',
    },
    {
        year: 2014,
        name: 'Dutee Chand',
        country: '🇮🇳',
        sport: 'Velocidade 100m',
        color: '#60a5fa',
        case: 'IAAF suspende Chand por hiperandrogenismo. Ela recorre ao CAS (Corte Arbitral do Esporte).',
        outcome: 'CAS suspende temporariamente as regras de hiperandrogenismo da IAAF por falta de evidência científica suficiente.',
        regulation: 'CAS',
        impact: 'Comprou 2 anos de pausa nas regras, gerando pressão por pesquisa científica mais robusta.',
        twist: 'A IAAF teve 2 anos para produzir evidência científica. Voltou com o estudo Bermon & Garnier (2017), posteriormente criticado por falhas metodológicas.',
        result: 'win',
    },
    {
        year: 2021,
        name: 'Laurel Hubbard',
        country: '🇳🇿',
        sport: 'Halterofilia',
        color: '#a855f7',
        case: 'Primeira atleta trans a competir nas Olimpíadas. Tokyo 2021, categoria +87kg feminino.',
        outcome: 'Eliminada sem medalha após falhar 3 tentativas no snatch. Nenhuma performance superior às finalistas cis.',
        regulation: 'COI',
        impact: 'Debacle mediático sem vitória atlética. Abriu espaço para o famework IOC 2021 que aboliu regras universais de T.',
        twist: 'Hubbard era competitiva internacionalmente, mas não alcançou o pódio. O "problema" esperado não aconteceu — mas o debate já estava posto.',
        result: 'neutral',
    },
    {
        year: 2022,
        name: 'Lia Thomas',
        country: '🇺🇸',
        sport: 'Natação 500yd',
        color: '#e11d48',
        case: 'Primeira trans campeã nacional NCAA. Competia na equipe masculina de Penn, transitou e foi para feminino.',
        outcome: 'Campeã dos 500 jardas femininos (NCAA). Tempos pré-transição (masculino) vs pós-transição (feminino): diferença de ~1.5s em 500yd.',
        regulation: 'NCAA / World Aquatics',
        impact: 'World Aquatics proibiu trans femininas que passaram por puberdade masculina. Gerou a política mais restritiva do esporte olímpico.',
        twist: 'Thomas foi de top-100 (masculino) para top-10 (feminino) na mesma distância — mas não venceu todas as provas. Debate: é uma "vantagem injusta" ou apenas competição normal?',
        result: 'lose_for_policy',
    },
];

const POLICIES = [
    { org: 'IOC', year: 2021, rule: 'Eliminou limites de T. Delegou às federações. "Presunção de não-vantagem."', icon: '🏅', color: '#34d399', stance: 'inclusivo' },
    { org: 'World Athletics', year: 2023, rule: 'T < 2.5 nmol/L por 24 meses para provas de 60m–1500m. Trans femininas completamente excluídas.', icon: '🏃', color: '#e11d48', stance: 'restritivo' },
    { org: 'World Aquatics', year: 2022, rule: 'Exclui trans femininas que passaram por puberdade masculina. Permite transição pré-puberal.', icon: '🏊', color: '#f59e0b', stance: 'restritivo' },
    { org: 'NCAA', year: 2022, rule: 'Seguiu as regras de cada federação esportiva (caso a caso por modalidade).', icon: '🎓', color: '#60a5fa', stance: 'neutro' },
];

const RESULT_COLOR: Record<string, string> = {
    win: '#34d399',
    lose: '#e11d48',
    neutral: '#f59e0b',
    lose_for_policy: '#a855f7',
};

const RESULT_LABEL: Record<string, string> = {
    win: 'Vitória atlética',
    lose: 'Exclusão regulatória',
    neutral: 'Sem medalha',
    lose_for_policy: 'Gerou proibição',
};

export const TransCasesTimeline = () => {
    const [activeCase, setActiveCase] = useState<number | null>(null);
    const [tab, setTab] = useState<'cases' | 'policies'>('cases');


    return (
        <div className="w-full space-y-5 font-body">
            {/* Tab switcher */}
            <div className="flex gap-2">
                {(['cases', 'policies'] as const).map(t => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className="px-4 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-all"
                        style={tab === t
                            ? { borderColor: '#a855f7', color: '#a855f7', background: 'rgba(168,85,247,0.12)' }
                            : { borderColor: 'rgba(255,255,255,0.1)', color: '#6b7280' }
                        }
                    >
                        {t === 'cases' ? '📖 Casos Emblemáticos' : '📋 Políticas das Federações'}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {tab === 'cases' && (
                    <motion.div
                        key="cases"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4"
                    >
                        {/* Timeline */}
                        <div className="relative">
                            {/* Line */}
                            <div className="absolute left-8 top-4 bottom-4 w-px bg-white/10" />

                            <div className="space-y-3">
                                {CASES.map((cas, i) => {
                                    const isAct = activeCase === i;
                                    return (
                                        <motion.div
                                            key={cas.name}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.08 }}
                                        >
                                            <div
                                                className="flex gap-4 cursor-pointer"
                                                onClick={() => setActiveCase(isAct ? null : i)}
                                            >
                                                {/* Year node */}
                                                <div className="flex-shrink-0 w-16 flex flex-col items-center">
                                                    <motion.div
                                                        className="w-5 h-5 rounded-full border-2 z-10"
                                                        style={{
                                                            borderColor: isAct ? cas.color : 'rgba(255,255,255,0.2)',
                                                            background: isAct ? cas.color : 'rgba(8,8,18,1)',
                                                        }}
                                                        animate={{ scale: isAct ? 1.4 : 1 }}
                                                        transition={{ type: 'spring', stiffness: 300 }}
                                                    />
                                                    <span className="text-[9px] text-gray-500 mt-1">{cas.year}</span>
                                                </div>

                                                {/* Card */}
                                                <motion.div
                                                    className="flex-1 rounded-xl border p-4"
                                                    style={{
                                                        borderColor: isAct ? `${cas.color}55` : 'rgba(255,255,255,0.07)',
                                                        background: isAct ? `${cas.color}10` : 'rgba(8,8,18,0.6)',
                                                    }}
                                                    whileHover={{ y: -2 }}
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span>{cas.country}</span>
                                                                <span className="font-bold text-sm" style={{ color: cas.color }}>{cas.name}</span>
                                                                <span className="text-[10px] text-gray-500">{cas.sport}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-400 leading-relaxed">{cas.case}</p>
                                                        </div>
                                                        <div className="text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0" style={{ borderColor: `${RESULT_COLOR[cas.result]}44`, color: RESULT_COLOR[cas.result] }}>
                                                            {RESULT_LABEL[cas.result]}
                                                        </div>
                                                    </div>

                                                    <AnimatePresence>
                                                        {isAct && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                                                style={{ overflow: 'hidden' }}
                                                            >
                                                                <div className="pt-3 mt-3 border-t border-white/8 space-y-2.5">
                                                                    <div>
                                                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Desfecho</span>
                                                                        <p className="text-xs text-gray-300 mt-0.5">{cas.outcome}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Impacto regulatório</span>
                                                                        <p className="text-xs text-gray-300 mt-0.5">{cas.impact}</p>
                                                                    </div>
                                                                    <div className="rounded-lg p-3 border border-amber-900/30" style={{ background: 'rgba(120,53,0,0.15)' }}>
                                                                        <span className="text-[10px] text-amber-400 font-bold">⚡ O Elemento Surpreendente</span>
                                                                        <p className="text-xs text-gray-400 mt-1">{cas.twist}</p>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}

                {tab === 'policies' && (
                    <motion.div
                        key="policies"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                        {POLICIES.map((p, i) => (
                            <motion.div
                                key={p.org}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="rounded-2xl border p-5"
                                style={{
                                    borderColor: `${p.color}33`,
                                    background: `${p.color}08`,
                                }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">{p.icon}</span>
                                    <div>
                                        <div className="font-bold text-sm" style={{ color: p.color }}>{p.org}</div>
                                        <div className="text-[10px] text-gray-500">{p.year} · <span className="capitalize">{p.stance}</span></div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">{p.rule}</p>
                            </motion.div>
                        ))}

                        <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="md:col-span-2 rounded-2xl border border-red-900/30 p-4 flex gap-3"
                            style={{ background: 'rgba(127,29,29,0.15)' }}
                        >
                            <span className="text-xl flex-shrink-0">⚠️</span>
                            <div>
                                <div className="text-xs font-bold text-red-300 mb-1">O Problema da Fragmentação</div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Com cada federação tendo sua própria política, uma atleta trans pode ser elegível em uma modalidade olímpica e banida em outra do mesmo Jogos. Isso cria insegurança jurídica e viola o princípio de padronização do movimento olímpico.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
