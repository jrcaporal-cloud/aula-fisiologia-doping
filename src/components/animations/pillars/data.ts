/**
 * Conteúdo do slide "Os Três Pilares do Desempenho". Os textos (rótulos, agentes e
 * detalhes) são os mesmos da versão anterior; as cadeias só reorganizam em etapas
 * o que cada `detail` já afirma.
 */
export type PillarKind = 'heart' | 'mito' | 'fiber';

export interface ChainLink {
    title: string;
    note?: string;
}

export interface Pillar {
    kind: PillarKind;
    label: string;
    sub: string;
    drugs: string[];
    color: string;
    soft: string;
    detail: string;
    chains: ChainLink[][];
    /** Destaques numéricos que já estão no `detail`. */
    facts: { value: string; label: string; tone?: 'risk' }[];
}

export const PILLARS: Pillar[] = [
    {
        kind: 'heart',
        label: 'Coração & Sangue',
        sub: 'Capacidade O₂',
        drugs: ['EPO', 'Transfusões', 'AICAR'],
        color: '#F43F5E',
        soft: 'rgba(244,63,94,0.14)',
        detail: 'A EPO estimula eritropoiese na medula óssea, elevando o VO₂máx em até 5–7%. Com Hct >55%, o sangue se torna viscoso — risco de trombose fatal durante bradicardia do sono. Janela de detecção da rhEPO: apenas 24–72h.',
        chains: [[
            { title: 'EPO' },
            { title: 'Medula óssea', note: 'eritropoiese' },
            { title: 'VO₂máx', note: 'até +5–7%' },
        ]],
        facts: [
            { value: '+5–7%', label: 'VO₂máx' },
            { value: '>55%', label: 'Hct: sangue viscoso, trombose no sono', tone: 'risk' },
            { value: '24–72h', label: 'janela de detecção da rhEPO' },
        ],
    },
    {
        kind: 'mito',
        label: 'Mitocôndrias',
        sub: 'Eficiência de Substrato',
        drugs: ['Beta-2 Agonistas', 'AICAR', 'GW501516'],
        color: '#F59E0B',
        soft: 'rgba(245,158,11,0.14)',
        detail: 'AICAR ativa AMPK simulando "baixa energia celular". Induz expressão de PGC-1α — regulador-mestre da biogênese mitocondrial. Mais mitocôndrias = maior capacidade oxidativa por kg de músculo.',
        chains: [[
            { title: 'AICAR' },
            { title: 'AMPK', note: '"baixa energia celular"' },
            { title: 'PGC-1α', note: 'regulador-mestre' },
            { title: 'Biogênese', note: 'mais mitocôndrias' },
        ]],
        facts: [
            { value: 'Mais mitocôndrias', label: '= maior capacidade oxidativa por kg de músculo' },
        ],
    },
    {
        kind: 'fiber',
        label: 'Fibra Muscular',
        sub: 'Output Neuromotor',
        drugs: ['EAA', 'hGH', 'Insulina', 'IGF-1'],
        color: '#34D399',
        soft: 'rgba(52,211,153,0.14)',
        detail: 'EAA age via Receptores Androgênicos → proliferação de células satélite → mionúcleos extras permanentes. hGH induz IGF-1 local ativando PI3K/Akt/mTOR para síntese proteica máxima.',
        chains: [
            [
                { title: 'EAA' },
                { title: 'Receptor androgênico' },
                { title: 'Células satélite', note: 'proliferação' },
                { title: 'Mionúcleos', note: 'extras e permanentes' },
            ],
            [
                { title: 'hGH' },
                { title: 'IGF-1 local' },
                { title: 'PI3K/Akt/mTOR' },
                { title: 'Síntese proteica', note: 'máxima' },
            ],
        ],
        facts: [],
    },
];
