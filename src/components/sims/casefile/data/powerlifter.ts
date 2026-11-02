import { Dumbbell } from 'lucide-react';
import { PowerlifterContrast } from '../extras/PowerlifterContrast';
import type { CaseData } from '../types';

/** Slide "O Powerlifter com Exames 'Alterados'" — parsedPresentation.json id 26 (texto verbatim). */
export const POWERLIFTER: CaseData = {
    caseNumber: 'Caso clínico 01',
    accent: '#60A5FA',
    icon: Dumbbell,
    stepNames: ['Relato', 'Exames', 'Hipótese', 'Lição'],
    stepCaptions: [
        'o que o atleta conta',
        'painel laboratorial crítico',
        'diagnóstico fisiológico oculto',
        'a "reposição" como álibi',
    ],
    profile: {
        headline: 'Homem, 28 anos, powerlifter (categoria -93 kg)',
        paragraphs: [
            [
                { text: 'Relata uso de ' },
                { text: '"testosterona terapêutica"', strong: true, mark: { fromStep: 3, label: 'álibi', color: '#F59E0B' } },
                { text: ' prescrita há 6 meses por hipogonadismo.' },
            ],
            [{ text: 'Busca otimização para mundial em 10 semanas. Relata energia excelente e progressão de carga.' }],
        ],
        question: 'A "reposição" por hipogonadismo explica este painel?',
    },
    center: {
        kind: 'labs',
        title: 'Painel laboratorial crítico',
        layout: 'grid',
        rows: [
            { id: 'testo', label: 'Testosterona total', value: '1.850', unit: 'ng/dL', tone: 'red' },
            { id: 'lhfsh', label: 'LH / FSH', value: '< 0,2', unit: 'mUI/mL', tone: 'red' },
            { id: 'igf1', label: 'IGF-1', value: '380', unit: 'ng/mL', flag: 'Elevado', tone: 'amber' },
            { id: 'hct', label: 'Hematócrito', value: '52%', tone: 'red' },
        ],
    },
    hypothesis: {
        title: 'Diagnóstico fisiológico oculto',
        headline: 'Polifarmácia.',
        items: [
            { parts: [{ text: 'Supressão HPG prova que o hipogonadismo é ' }, { text: 'induzido (secundário).', strong: true }], evidence: ['lhfsh'] },
            { parts: [{ text: 'O IGF-1 elevado sugere ' }, { text: 'uso cruzado de GH/IGF-1 exógeno.', strong: true }], evidence: ['igf1'] },
        ],
    },
    lesson: {
        title: 'Lição',
        items: [
            { parts: [{ text: 'A justificativa de "reposição" é ' }, { text: 'álibi', strong: true }, { text: ' ("TUE informal").' }] },
        ],
        Extra: PowerlifterContrast,
    },
};
