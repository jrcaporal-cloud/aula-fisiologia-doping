import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const CARDS = [
    {
        id: 0,
        title: 'Base Transcricional Sintética',
        icon: '🧬',
        color: '#60a5fa',
        glow: 'rgba(96,165,250,0.3)',
        bg: 'rgba(30,58,138,0.2)',
        border: 'rgba(96,165,250,0.3)',
        summary: 'Derivados 17α-alquilados e compostos esterificados de Testosterona criando farmacocinéticas exclusivas.',
        detail: '17α-alquilação substitui o H no C17 por um grupo alquil (geralmente –CH₃), impedindo o metabolismo de primeira passagem hepática. Resultado: biodisponibilidade oral de 95–100% vs. ~1% da testosterona base. Exemplos: Oximetolona, Oxandrolona, Estanozolol. Custo: hepatotoxicidade significativa por acúmulo hepático.',
        mechanism: 'A esterificação do C17 (ex: Cipionato, Decanoato) cria um pró-fármaco lipofílico que é lentamente hidrolisado por esterases teciduais — prolongando a meia-vida de horas para dias/semanas. Isso reduz a frequência de aplicação e mantém níveis séricos mais estáveis.',
        risk: 'Dislipidemia severa (HDL –60%, LDL +30%), hepatotoxicidade (colestase, peliosi hepática, adenoma), hipertensão arterial sistêmica.',
    },
    {
        id: 1,
        title: 'Razão Anabólica/Androgênica',
        icon: '⚖️',
        color: '#a855f7',
        glow: 'rgba(168,85,247,0.3)',
        bg: 'rgba(88,28,135,0.2)',
        border: 'rgba(168,85,247,0.3)',
        summary: 'Química manipulada para hipertrofia sem virilização excessiva. Trembolona: afinidade 3× superior ao AR.',
        detail: 'A Razão AA (Anabolismo:Androgênio) compara a capacidade de promover crescimento muscular vs. efeitos masculinizantes. Testosterona = 1:1 (razão referência). Trembolona = 1:10+ em modelos animais murinos. Oxandrolona ≈ 10:1 em humanos — altamente seletiva para músculo.',
        mechanism: 'A seletividade tecidual é mediada pela expressão diferencial de 5α-redutase (converte T em DHT — 3× mais androgênica) e 11β-HSD2. Músculos têm baixa 5α-redutase; próstata e couro cabeludo têm alta. Compostos que resistem à 5α-redução (ex: Trembolona, Nandrolona) têm efeitos androgênicos periféricos reduzidos.',
        risk: 'Apesar da "seletividade", todos os EAA suprimem o eixo HPG — parar T endógena = atrofia testicular e infertilidade dose-dependente. Reversibilidade: ~80% dos usuários recuperam a função em 12 meses; ~20% necessitam TRT vitalícia.',
    },
    {
        id: 2,
        title: 'Remodelagem dos Satélites',
        icon: '💪',
        color: '#34d399',
        glow: 'rgba(52,211,153,0.3)',
        bg: 'rgba(6,78,59,0.2)',
        border: 'rgba(52,211,153,0.3)',
        summary: 'Hipertrofia via acréscimo massivo de mionúcleos — células satélite ativadas por androgênios.',
        detail: 'Células satélite musculares expressam receptores androgênicos (RA). Androgênios → proliferação e diferenciação de satélites → fusão à fibra existente → novos mionúcleos. Resultado: razão mionúcleos/volume de fibra aumentada, permitindo síntese proteica local mais eficiente.',
        mechanism: 'Os mionúcleos extras são PERMANENTES mesmo após cessação dos androgênios (memória muscular). Estudos de Staron, Schwartz et al. usando biópsias longitudinais demonstram manutenção do número de mionúcleos por 15+ anos após o uso. Isso explica por que ex-usuários retreinam 3–5× mais rápido.',
        risk: '[Bhasin et al., NEJM]: em 16 semanas, T suprafisiológica + treino → +6,1kg massa magra vs. +1,9kg treino limpo. Em 6–8 meses de ciclo típico, o aumento pode chegar a +10–15kg de tecido contrátil funcional.',
    },
    {
        id: 3,
        title: 'Colaterais Biológicos Críticos',
        icon: '⚠️',
        color: '#f87171',
        glow: 'rgba(248,113,113,0.3)',
        bg: 'rgba(127,29,29,0.2)',
        border: 'rgba(248,113,113,0.3)',
        summary: 'Supressão irreversível do eixo HPG. Hipertrofia ventricular concêntrica letal.',
        detail: 'O eixo HPG (Hipotálamo–Hipófise–Gônadas) é suprimido por feedback negativo: T exógena → hipotálamo detecta T alta → para GnRH → Hipófise para LH/FSH → testículos param de produzir T e espermatozoides. Sem LH, células de Leydig atrofiam — produção endógena nula em semanas.',
        mechanism: 'Cardiomiopatia: androgênios promovem hipertrofia de cardiomiócitos via RA cardíaco → parede do VE engrossa → diastólica prejudicada → risco de morte súbita. Estudos de ecocardiografia: espessura do septo interventricular em fisiculturistas: 13,2mm vs. 9,8mm controles. Fibrose miocárdica detectada em RNM em 50% dos usuários de longa data.',
        risk: 'Análise de mortalidade (Pope et al., Biol Psychiatry): usuários de EAA têm mortalidade 4,6× maior que controles. Principais causas: cardiomiopatia, suicídio (efeito de abstinência), hepatocarcinoma. Expectativa de vida reduzida em 8–12 anos versus população geral nos estudos de fisiculturistas profissionais.',
    },
];

export const EAAInteractive = () => {
    const [activeCard, setActiveCard] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'detail' | 'mechanism' | 'risk'>('detail');
    const card = activeCard !== null ? CARDS[activeCard] : null;

    const TABS = [
        { key: 'detail', label: '🔬 Química', color: '#60a5fa' },
        { key: 'mechanism', label: '⚙️ Mecanismo', color: '#a855f7' },
        { key: 'risk', label: '⚠️ Risco Real', color: '#f87171' },
    ] as const;

    return (
        <div className="w-full font-body mt-4">
            <div className="flex flex-col lg:flex-row gap-5">
                {/* Cards grid */}
                <div className="grid grid-cols-2 gap-3 flex-1">
                    {CARDS.map(c => {
                        const isAct = activeCard === c.id;
                        return (
                            <motion.div
                                key={c.id}
                                onClick={() => setActiveCard(isAct ? null : c.id)}
                                className="rounded-2xl border cursor-pointer overflow-hidden"
                                style={{ borderColor: isAct ? c.border : 'rgba(255,255,255,0.06)', background: isAct ? c.bg : 'rgba(8,8,18,0.6)' }}
                                whileHover={{ y: -3, boxShadow: `0 12px 32px ${c.glow}` }}
                                animate={{ boxShadow: isAct ? `0 0 24px ${c.glow}` : 'none' }}
                                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                            >
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <span className="text-2xl">{c.icon}</span>
                                        <motion.span
                                            animate={{ rotate: isAct ? 45 : 0, color: isAct ? c.color : '#6b7280' }}
                                            transition={{ duration: 0.2 }}
                                            className="text-sm font-bold"
                                        >+</motion.span>
                                    </div>
                                    <div className="font-display font-semibold text-sm mb-1 leading-tight" style={{ color: isAct ? c.color : 'white' }}>{c.title}</div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">{c.summary}</p>
                                </div>
                                <motion.div className="h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${c.color}, transparent)` }} animate={{ opacity: isAct ? 1 : 0.15 }} />
                            </motion.div>
                        );
                    })}
                </div>

                {/* Detail panel */}
                <div className="lg:w-64 xl:w-72">
                    <AnimatePresence mode="wait">
                        {card ? (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, x: 16, filter: 'blur(4px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: -16, filter: 'blur(4px)' }}
                                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="h-full rounded-2xl border p-4 space-y-3"
                                style={{ background: card.bg, borderColor: card.border }}
                            >
                                <div className="text-sm font-bold leading-tight" style={{ color: card.color }}>{card.icon} {card.title}</div>

                                {/* Tab switcher */}
                                <div className="flex gap-1.5 flex-wrap">
                                    {TABS.map(t => (
                                        <button
                                            key={t.key}
                                            onClick={() => setActiveTab(t.key)}
                                            className="text-[9px] px-2 py-0.5 rounded-full border cursor-pointer transition-all"
                                            style={activeTab === t.key
                                                ? { borderColor: t.color, color: t.color, background: `${t.color}18` }
                                                : { borderColor: 'rgba(255,255,255,0.1)', color: '#6b7280' }
                                            }
                                        >{t.label}</button>
                                    ))}
                                </div>

                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-[11px] text-gray-300 leading-relaxed"
                                    >
                                        {card[activeTab]}
                                    </motion.p>
                                </AnimatePresence>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-full rounded-2xl border border-white/6 flex flex-col items-center justify-center text-center p-6 min-h-[200px]"
                                style={{ background: 'rgba(255,255,255,0.015)' }}
                            >
                                <div className="text-4xl mb-3">🔬</div>
                                <p className="text-gray-500 text-xs">Selecione um card para explorar os detalhes moleculares</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
