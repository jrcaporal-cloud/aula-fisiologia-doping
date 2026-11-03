import { Bike } from 'lucide-react';
import { EpoChain } from '../extras/EpoChain';
import type { CaseData } from '../types';

/** Slide "A Ciclista com Anemia 'Paradoxal'" — parsedPresentation.json id 27 (valores e referências da tabela). */
export const CYCLIST: CaseData = {
    caseNumber: 'Caso clínico 02',
    accent: '#FB7185',
    icon: Bike,
    stepNames: ['Relato', 'Exames', 'Hipótese', 'Lição'],
    stepCaptions: [
        'a queixa da atleta',
        'cenário sanguíneo',
        'interpretação implacável',
        'o "crash" paradoxal',
    ],
    profile: {
        headline: 'Ciclista, atleta feminina de elite',
        paragraphs: [
            [{ text: 'Reclama de ' }, { text: '"fadiga inexplicável"', strong: true }, { text: ' com queda de VO₂máx.' }],
        ],
        question: 'Que tipo de anemia é esta?',
    },
    center: {
        kind: 'labs',
        title: 'Cenário sanguíneo · valor do atleta × referência',
        layout: 'list',
        rows: [
            {
                id: 'hb', label: 'Hemoglobina', value: '12,1', unit: 'g/dL', numeric: 12.1, flag: 'Limítrofe', tone: 'amber',
                reference: { low: 12, high: 16, lowLabel: '12,0', highLabel: '16,0', unit: 'g/dL', domain: [10, 18] },
            },
            {
                id: 'retic', label: 'Reticulócitos', value: '0,2%', numeric: 0.2, flag: 'Supresso', tone: 'red',
                reference: { low: 0.5, high: 1.5, lowLabel: '0,5%', highLabel: '1,5%', domain: [0, 2] },
            },
            {
                id: 'epo', label: 'EPO sérica', value: '2,1', unit: 'mUI/mL', numeric: 2.1, flag: 'Baixa', tone: 'red',
                reference: { low: 4.3, high: 29, lowLabel: '4,3', highLabel: '29,0', unit: 'mUI/mL', domain: [0, 32] },
            },
            { id: 'ferro', label: 'Ferro sérico / ferritina', value: 'Normais', tone: 'green' },
        ],
    },
    hypothesis: {
        title: 'Interpretação',
        items: [
            { parts: [{ text: 'Não é anemia ferropriva.', strong: true }], evidence: ['ferro'] },
            { parts: [{ text: 'É padrão clássico de ' }, { text: 'supressão eritropoiética pós-uso de rhEPO.', strong: true }], evidence: ['hb', 'retic', 'epo'] },
        ],
    },
    lesson: {
        title: 'Por que o "crash"',
        items: [
            {
                parts: [
                    { text: 'Ao interromper a EPO para burlar o teste (limpar a janela), o corpo desliga a produção natural devido ao feedback excessivo anterior, causando o ' },
                    { text: '"crash" paradoxal com reticulócitos zerados.', strong: true },
                ],
            },
        ],
        Extra: EpoChain,
    },
};
