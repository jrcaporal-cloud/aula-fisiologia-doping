import { BookOpenCheck, FileCheck2, Stethoscope, ShieldCheck, type LucideIcon } from 'lucide-react';

export interface InfoBlock {
    label: string;
    text: string;
    tone?: 'red' | 'blue' | 'amber';
}

export interface MedicoStep {
    tab: string;
    icon: LucideIcon;
    title: string;
    blocks: InfoBlock[];
    foot: string;
}

/** O médico diante do doping: regra do Código, AUT, limites do consultório e suplementos. */
export const MEDICO_STEPS: MedicoStep[] = [
    {
        tab: 'A regra',
        icon: BookOpenCheck,
        title: 'O pessoal de apoio responde pelo Código',
        blocks: [
            { label: 'Art. 2.8', text: 'Administrar ou tentar administrar substância proibida a um atleta.' },
            { label: 'Art. 2.9', text: 'Cumplicidade: ajudar, incentivar ou encobrir, inclusive com apoio psicológico.' },
            { label: 'Art. 2.10', text: 'Associação proibida: o atleta não pode se consultar com profissional suspenso por violação antidopagem.' },
        ],
        foot: 'Código Mundial Antidopagem 2021, WADA.',
    },
    {
        tab: 'A AUT',
        icon: FileCheck2,
        title: 'Autorização de Uso Terapêutico: quatro critérios',
        blocks: [
            { label: '1', text: 'Sem a substância, o atleta teria prejuízo significativo à saúde.', tone: 'blue' },
            { label: '2', text: 'O uso não dá ganho de desempenho além do retorno ao estado normal de saúde.', tone: 'blue' },
            { label: '3', text: 'Não existe alternativa terapêutica razoável que seja permitida.', tone: 'blue' },
            { label: '4', text: 'A necessidade não é consequência de uso anterior, sem AUT, de substância proibida.', tone: 'blue' },
        ],
        foot: 'Em regra, peça antes do uso; há exceção para emergências. Glicocorticoides: desde 2022, todas as vias injetáveis e a oral são proibidas em competição; respeite o intervalo mínimo recomendado pela WADA.',
    },
    {
        tab: 'No consultório',
        icon: Stethoscope,
        title: 'Tratar a doença, não o desempenho',
        blocks: [
            { label: 'Vedado', tone: 'red', text: 'Prescrever, divulgar ou fazer propaganda de esteroides anabolizantes para estética, ganho de massa ou desempenho esportivo (Resolução CFM 2.333/2023), para amadores e profissionais.' },
            { label: 'Permitido', tone: 'blue', text: 'Tratar doenças em que o benefício supera o risco, como o hipogonadismo diagnosticado.' },
            { label: 'Acompanhar', tone: 'amber', text: 'Quem já usa precisa de monitoramento: hematócrito, lipídios, pressão arterial, função hepática, coração e humor. Oriente e encaminhe.' },
        ],
        foot: 'A resolução veda a prescrição com essas finalidades; não veda o tratamento de doenças.',
    },
    {
        tab: 'Suplementos',
        icon: ShieldCheck,
        title: 'O atleta responde pelo que está no corpo',
        blocks: [
            { label: 'Regra', tone: 'red', text: 'Responsabilidade objetiva: o atleta responde pela substância encontrada, mesmo sem intenção.' },
            { label: 'Orientação', tone: 'blue', text: 'Prefira produtos com certificação independente de lote e registre a orientação no prontuário.' },
            { label: 'Cuidado', tone: 'amber', text: 'Desconfie de produto sem certificação, com promessa de ganho ou rótulo vago.' },
        ],
        foot: 'Foi o que o caso do lutador mostrou: o rigor do teste é maior que o controle de qualidade da indústria.',
    },
];

export interface ActionItem {
    title: string;
    text: string;
}

/** O que levar para o consultório (fechamento clínico da aula). */
export const ACTIONS: ActionItem[] = [
    { title: 'Suspeite pelo padrão', text: 'Testosterona alta com LH e FSH suprimidos. Hemoglobina e hematócrito altos com reticulócitos baixos. IGF-1 elevado.' },
    { title: 'AUT antes, não depois', text: 'Atleta que compete e precisa de medicação: confira a lista e peça a autorização antes do uso.' },
    { title: 'Suplemento só com certificação', text: 'Oriente produtos com certificação independente e registre no prontuário. Pergunte por injetáveis "de pesquisa": nome, frasco e lote.' },
    { title: 'Saiba onde você se enquadra', text: 'O pessoal de apoio responde pelo Código (arts. 2.8 a 2.10) e pela Resolução CFM 2.333/2023.' },
    { title: 'Acompanhe sem prescrever', text: 'Monitore hematócrito, lipídios, pressão e fígado de quem já usa. Trate a doença, não o desempenho.' },
];
