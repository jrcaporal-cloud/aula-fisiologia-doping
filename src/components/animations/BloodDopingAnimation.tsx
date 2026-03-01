import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const PHASES = [
    {
        id: 0,
        icon: '🩸',
        label: 'Fase 1 — Altitude',
        sub: '8–12 semanas antes',
        color: '#60a5fa',
        glow: 'rgba(96,165,250,0.3)',
        bg: 'rgba(30,58,138,0.25)',
        border: 'rgba(96,165,250,0.35)',
        steps: [
            { icon: '🏔️', text: 'Atleta faz estágio em altitude (2.000–3.000m) por 3–4 semanas — hematócrito sobe naturalmente para 50–55%.' },
            { icon: '🩸', text: 'Coleta de 450–900mL de sangue rico em eritrócitos funcionais no pico de adaptação eritropoiética.' },
            { icon: '❄️', text: 'Criopreservação da bolsa com DMSO (agente crioprotetor) em –80°C. O sangue pode ser armazenado por meses sem perda de viabilidade eritrocitária.' },
            { icon: '💉', text: 'Opcionalmente, microdose de rhEPO pós-sangria para compensar a queda de Hb causada pela retirada.' },
        ],
        detail: 'A coleta em altitude maximiza a qualidade do sangue. Hematócrito de 52–55% vs. 42–45% basal significa +20–30% de capacidade de transporte de O₂. A autóloga é o método preferido porque elimina o risco de antígenos de grupo sanguíneo incompatíveis.',
    },
    {
        id: 1,
        icon: '🔬',
        label: 'Fase 2 — Armazenamento',
        sub: 'Envelhecimento controlado',
        color: '#f59e0b',
        glow: 'rgba(245,158,11,0.3)',
        bg: 'rgba(120,53,0,0.25)',
        border: 'rgba(245,158,11,0.35)',
        steps: [
            { icon: '🧊', text: 'Bolsa armazenada a –80°C. Microvasculatura dos eritrócitos preservada pelo DMSO. Taxa de sobrevivência >95% após 6 meses.' },
            { icon: '🔬', text: 'Monitoramento do Passaporte Biológico durante esse período para manter Hb/Hct dentro da faixa "normal" — sem anomalias detectáveis.' },
            { icon: '📋', text: 'O Calcanhar de Aquiles: mudanças sutis no perfil de glóbulos envelhecidos vs. jovens podem ser detectadas pelo ABP como micro-variações de reticulócitos.' },
        ],
        detail: 'O armazenamento exige logística sofisticada: transporte aéreo, câmaras criogênicas portáteis, pessoal médico treinado. O ciclismo profissional (pré-2006) tinha médicos de equipe exclusivos para isso. O escândalo da Operação Puerto (2006) revelou geladeiras com +200 bolsas de atletas de elite europeus.',
    },
    {
        id: 2,
        icon: '💊',
        label: 'Fase 3 — Reinfusão',
        sub: '12-24h antes da prova',
        color: '#e11d48',
        glow: 'rgba(225,29,72,0.3)',
        bg: 'rgba(127,29,29,0.25)',
        border: 'rgba(225,29,72,0.35)',
        steps: [
            { icon: '🏁', text: 'Na véspera da etapa decisiva, a bolsa é descongelada, lavada para remover DMSO e aquecida até 37°C.' },
            { icon: '💉', text: 'Reinfundida IV em 30–45 min. Hematócrito sobe de ~43% para 49–51% em poucas horas — pouco acima do limite UCI de 50%.' },
            { icon: '🔋', text: 'VO₂max aumenta 3–5% imediatamente. Em pace de competição de alto nível, essa diferença representa 1–2min em uma prova de 40km de contrarrelógio.' },
            { icon: '🩸', text: 'O sangue reinfundido é 100% do próprio atleta — sem moléculas exógenas detectáveis convencionalmente. O ABP tenta capturar a anomalia pelo padrão longitudinal.' },
        ],
        detail: 'A reinfusão autóloga é considerada o método de doping "perfeito" do ponto de vista analítico. Não existe uma substância química a detectar. O ABP é a única ferramenta disponível, e requer variação estatisticamente improvável no perfil do atleta para emitir um alerta — algo que exige amostras históricas suficientes (mínimo 3 coletas prévias).',
    },
];

export const BloodDopingAnimation = () => {
    const [activePhase, setActivePhase] = useState<number>(0);
    const phase = PHASES[activePhase];

    return (
        <div className="w-full font-body space-y-5">
            {/* Phase selector */}
            <div className="flex gap-3">
                {PHASES.map((p, i) => (
                    <motion.button
                        key={p.id}
                        onClick={() => setActivePhase(i)}
                        className="flex-1 rounded-2xl border p-3 text-left cursor-pointer transition-colors"
                        style={{
                            borderColor: activePhase === i ? p.border : 'rgba(255,255,255,0.07)',
                            background: activePhase === i ? p.bg : 'rgba(8,8,18,0.6)',
                        }}
                        whileHover={{ y: -3 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 22 }}
                    >
                        <div className="text-2xl mb-1">{p.icon}</div>
                        <div className="text-[11px] font-bold leading-tight" style={{ color: activePhase === i ? p.color : '#9ca3af' }}>{p.label}</div>
                        <div className="text-[9px] text-gray-500 mt-0.5">{p.sub}</div>
                    </motion.button>
                ))}
            </div>

            {/* Phase detail */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={phase.id}
                    initial={{ opacity: 0, x: 20, filter: 'blur(6px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="rounded-2xl border p-5 space-y-4"
                    style={{ background: phase.bg, borderColor: phase.border }}
                >
                    <div className="text-sm font-bold" style={{ color: phase.color }}>{phase.label}</div>

                    {/* Steps */}
                    <div className="space-y-2.5">
                        {phase.steps.map((step, i) => (
                            <motion.div
                                key={i}
                                className="flex gap-3 items-start"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.07, duration: 0.3 }}
                            >
                                <span className="text-lg flex-shrink-0 mt-0.5">{step.icon}</span>
                                <p className="text-xs text-gray-300 leading-relaxed">{step.text}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Deep dive */}
                    <div className="rounded-xl border border-white/8 p-3 mt-2" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="text-[10px] uppercase tracking-widest mb-1.5" style={{ color: phase.color }}>📚 Contexto técnico</div>
                        <p className="text-[11px] text-gray-400 leading-relaxed">{phase.detail}</p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Detection note */}
            <motion.div
                className="flex items-start gap-3 rounded-xl border border-amber-900/40 p-4"
                style={{ background: 'rgba(120,53,0,0.15)' }}
                animate={{ borderColor: ['rgba(120,53,0,0.4)', 'rgba(245,158,11,0.4)', 'rgba(120,53,0,0.4)'] }}
                transition={{ duration: 4, repeat: Infinity }}
            >
                <span className="text-xl flex-shrink-0">🛡️</span>
                <div>
                    <div className="text-xs font-bold text-amber-400 mb-1">Defesa: o Passaporte Biológico</div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                        O ABP detecta transfusões pela assinatura estatística — Hb anormalmente alta seguida de queda abrupta de reticulócitos (medula óssea "apagada" pela sobrecarga). Porém, exige mínimo de <strong className="text-white">3 amostras basais</strong> e coleta oportuna. Em 2006, amostras da Operação Puerto não foram coletadas a tempo de emitir alertas válidos.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};
