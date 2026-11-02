import { Swords } from 'lucide-react';
import { FighterScene } from '../extras/FighterScene';
import type { CaseData } from '../types';

/** Slide "O Lutador e o 'Suplemento Contaminado'" — parsedPresentation.json id 28 (texto verbatim). */
export const FIGHTER: CaseData = {
    caseNumber: 'Caso clínico 03',
    accent: '#FBBF24',
    icon: Swords,
    stepNames: ['O evento', 'A evidência', 'Hipótese', 'Conduta'],
    stepCaptions: [
        'positivo em controle surpresa',
        'o rótulo e a quantidade detectada',
        'doping involuntário',
        'a defesa e o nutricionista',
    ],
    profile: {
        headline: 'Homem, 31 anos, MMA profissional (-77 kg)',
        paragraphs: [
            [{ text: 'Testou positivo para ' }, { text: 'SARM LGD-4033', strong: true }, { text: ' em controle surpresa.' }],
            [
                { text: 'Nega uso intencional. Traz o rótulo de um ' },
                { text: '"Testo Booster Natural"', strong: true },
                { text: ' (Fórmula Proprietária + Tribulus).' },
            ],
        ],
        question: 'Contaminação ou uso intencional? E qual é o papel de quem prescreve?',
    },
    center: { kind: 'scene', title: 'Linha do tempo do caso', Scene: FighterScene },
    hypothesis: {
        title: 'Hipótese',
        headline: 'Doping involuntário é fato.',
        items: [
            {
                parts: [
                    { text: '10–25% dos suplementos de nicho', strong: true },
                    { text: ' no mercado contêm SARMs ou pró-hormonais cruzados mascarados na linha de chão de fábrica.' },
                ],
            },
        ],
    },
    lesson: {
        title: 'A defesa e o nutricionista',
        items: [
            { parts: [{ text: 'Responsabilidade técnica: ', strong: true }, { text: 'só prescrever suplemento com selo (NSF Certified for Sport, Informed Sport).' }] },
            {
                parts: [
                    { text: 'Ação preventiva: ', strong: true },
                    { text: 'o prontuário clínico é defesa legal. Se você documentou alerta contra "fórmulas ocultas", protege a si e ajuda a estabelecer "ausência de intenção", reduzindo a suspensão de 4 para 1 ano.' },
                ],
            },
        ],
    },
};
