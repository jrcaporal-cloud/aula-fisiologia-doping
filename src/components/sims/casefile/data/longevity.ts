import { Stethoscope } from 'lucide-react';
import type { CaseData } from '../types';

/**
 * Caso de consultório do módulo de peptídeos (slide id 108). Caso didático, fictício, montado sobre efeitos
 * conhecidos do excesso de GH/IGF-1 (edema, síndrome do túnel do carpo, piora da glicemia) e do ibutamoren
 * em ensaio (Nass et al., Ann Intern Med 2008). Faixas de referência ilustrativas: variam por laboratório e idade.
 */
export const LONGEVITY: CaseData = {
    caseNumber: 'Caso de consultório',
    accent: '#38BDF8',
    icon: Stethoscope,
    stepNames: ['Relato', 'Exames', 'Hipótese', 'Conduta'],
    stepCaptions: [
        'o paciente da "clínica de longevidade"',
        'o que mudou em um ano',
        'o secretagogo funcionou, e esse é o problema',
        'o que o médico faz na segunda-feira',
    ],
    profile: {
        headline: 'Homem, 34 anos, musculação 5×/semana · caso fictício',
        paragraphs: [
            [
                { text: 'Acompanha numa "clínica de longevidade". Usa ' },
                { text: 'BPC-157 "para o tendão"', strong: true },
                { text: ' e ' },
                { text: 'um secretagogo de GH "para dormir e recuperar"', strong: true },
                { text: ', ' },
                { text: 'comprados como "pesquisa"', mark: { fromStep: 3, label: 'sem registro', color: '#F59E0B' } },
                { text: '.' },
            ],
            [{ text: 'Queixas: fome maior, mãos inchadas ao acordar e formigamento nas mãos à noite.' }],
        ],
        question: 'O que liga as queixas aos exames?',
    },
    center: {
        kind: 'labs',
        title: 'Exames · agora (há 1 ano)',
        layout: 'list',
        rows: [
            {
                id: 'igf1', label: 'IGF-1', value: '410', unit: 'ng/mL', numeric: 410, flag: 'Acima da faixa', tone: 'red',
                reference: { low: 115, high: 307, lowLabel: '115', highLabel: '307', unit: 'ng/mL', domain: [0, 500] },
            },
            {
                id: 'gj', label: 'Glicemia de jejum (era 89)', value: '108', unit: 'mg/dL', numeric: 108, flag: 'Alterada', tone: 'amber',
                reference: { low: 70, high: 99, lowLabel: '70', highLabel: '99', unit: 'mg/dL', domain: [50, 140] },
            },
            {
                id: 'hba1c', label: 'HbA1c (era 5,2)', value: '5,8', unit: '%', numeric: 5.8, flag: 'Limítrofe', tone: 'amber',
                reference: { low: 4, high: 5.6, lowLabel: '4,0', highLabel: '5,6', unit: '%', domain: [3.5, 7] },
            },
            { id: 'clin', label: 'Mãos (Tinel +)', value: 'Edema', tone: 'neutral' },
        ],
    },
    hypothesis: {
        title: 'Hipótese',
        headline: 'Excesso de GH/IGF-1 induzido.',
        items: [
            { parts: [{ text: 'IGF-1 acima da faixa da idade: ' }, { text: 'o secretagogo está funcionando.', strong: true }], evidence: ['igf1'] },
            { parts: [{ text: 'Glicemia e HbA1c subindo: o GH é ' }, { text: 'diabetogênico.', strong: true }], evidence: ['gj', 'hba1c'] },
            { parts: [{ text: 'Edema e formigamento: ' }, { text: 'túnel do carpo', strong: true }, { text: ' por retenção de líquido.' }], evidence: ['clin'] },
        ],
    },
    lesson: {
        title: 'Conduta',
        items: [
            { parts: [{ text: 'Pergunte sem julgar ' }, { text: 'nome, frasco e lote', strong: true }, { text: '; registre.' }] },
            { parts: [{ text: 'Suspender e repetir IGF-1 e glicemia. ' }, { text: 'Não normalizou? Investigue acromegalia.', strong: true }] },
            { parts: [{ text: 'Se competir: não há AUT para isso, e o médico não prescreve (art. 2.8).' }] },
        ],
    },
};
