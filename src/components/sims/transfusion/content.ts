/**
 * Texto do slide "Transfusão Autóloga Homóloga" (JSON id 17) — verbatim de
 * src/components/animations/BloodDopingAnimation.tsx (fases, contexto técnico e quadro de defesa).
 */

export interface PhaseText {
    readonly label: string;
    readonly sub: string;
    readonly items: readonly string[];
    readonly detail: string;
}

export const PHASE_TEXT: readonly PhaseText[] = [
    {
        label: 'Fase 1 — Altitude',
        sub: '8–12 semanas antes',
        items: [
            'Atleta faz estágio em altitude (2.000–3.000m) por 3–4 semanas — hematócrito sobe naturalmente para 50–55%.',
            'Coleta de 450–900mL de sangue rico em eritrócitos funcionais no pico de adaptação eritropoiética.',
            'Criopreservação da bolsa com DMSO (agente crioprotetor) em –80°C. O sangue pode ser armazenado por meses sem perda de viabilidade eritrocitária.',
            'Opcionalmente, microdose de rhEPO pós-sangria para compensar a queda de Hb causada pela retirada.',
        ],
        detail: 'A coleta em altitude maximiza a qualidade do sangue. Hematócrito de 52–55% vs. 42–45% basal significa +20–30% de capacidade de transporte de O₂. A autóloga é o método preferido porque elimina o risco de antígenos de grupo sanguíneo incompatíveis.',
    },
    {
        label: 'Fase 2 — Armazenamento',
        sub: 'Envelhecimento controlado',
        items: [
            'Bolsa armazenada a –80°C. Microvasculatura dos eritrócitos preservada pelo DMSO. Taxa de sobrevivência >95% após 6 meses.',
            'Monitoramento do Passaporte Biológico durante esse período para manter Hb/Hct dentro da faixa “normal” — sem anomalias detectáveis.',
            'O Calcanhar de Aquiles: mudanças sutis no perfil de glóbulos envelhecidos vs. jovens podem ser detectadas pelo ABP como microvariações de reticulócitos.',
        ],
        detail: 'O armazenamento exige logística sofisticada: transporte aéreo, câmaras criogênicas portáteis, pessoal médico treinado. O ciclismo profissional (pré-2006) tinha médicos de equipe exclusivos para isso. O escândalo da Operação Puerto (2006) revelou geladeiras com +200 bolsas de atletas de elite europeus.',
    },
    {
        label: 'Fase 3 — Reinfusão',
        sub: '12-24h antes da prova',
        items: [
            'Na véspera da etapa decisiva, a bolsa é descongelada, lavada para remover DMSO e aquecida até 37°C.',
            'Reinfundida IV em 30–45 min. Hematócrito sobe de ~43% para 49–51% em poucas horas — pouco acima do limite UCI de 50%.',
            'VO₂máx aumenta 3–5% imediatamente. Em ritmo de competição de alto nível, essa diferença representa 1–2min em uma prova de 40km de contrarrelógio.',
            'O sangue reinfundido é 100% do próprio atleta — sem moléculas exógenas detectáveis convencionalmente. O ABP tenta capturar a anomalia pelo padrão longitudinal.',
        ],
        detail: 'A reinfusão autóloga é considerada o método de doping “perfeito” do ponto de vista analítico. Não existe uma substância química a detectar. O ABP é a única ferramenta disponível, e requer variação estatisticamente improvável no perfil do atleta para emitir um alerta — algo que exige amostras históricas suficientes (mínimo 3 coletas prévias).',
    },
];

export interface DefenseText {
    readonly before: string;
    readonly strong: string;
    readonly after: string;
}

/** Quadro "Defesa: o Passaporte Biológico" (verbatim). */
export const DEFENSE: DefenseText = {
    before: 'O ABP detecta transfusões pela assinatura estatística — Hb anormalmente alta seguida de queda abrupta de reticulócitos (medula óssea “apagada” pela sobrecarga). Porém, exige mínimo de ',
    strong: '3 amostras basais',
    after: ' e coleta oportuna. Em 2006, amostras da Operação Puerto não foram coletadas a tempo de emitir alertas válidos.',
};

export interface StepInfo {
    readonly tab: string;
    readonly title: string;
    readonly caption: string;
    readonly color: string;
}

export const STEPS: readonly StepInfo[] = [
    { tab: 'Altitude', title: 'Fase 1 — Altitude', caption: 'Hct sobe de 42–45% para 50–55%; coleta no pico.', color: '#60A5FA' },
    { tab: 'Armazenamento', title: 'Fase 2 — Armazenamento', caption: '–80 °C com DMSO por meses; o perfil segue “normal”.', color: '#F59E0B' },
    { tab: 'Reinfusão', title: 'Fase 3 — Reinfusão', caption: '12–24h antes da prova: Hct de ~43% para 49–51%.', color: '#E11D48' },
    { tab: 'Defesa ABP', title: 'Defesa: o Passaporte Biológico', caption: 'Hb alta seguida de queda abrupta de reticulócitos.', color: '#10B981' },
    { tab: 'Calcanhar', title: 'O Calcanhar de Aquiles', caption: 'Sem 3 amostras basais e coleta oportuna, não há alerta.', color: '#F59E0B' },
];

export const STEP_COUNT = STEPS.length;

export const C = {
    red: '#E11D48',
    crimson: '#9F1239',
    blue: '#60A5FA',
    amber: '#F59E0B',
    green: '#10B981',
    cyan: '#22D3EE',
    ice: '#BAE6FD',
} as const;
