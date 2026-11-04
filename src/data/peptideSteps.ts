import type { StepData } from './steps';

/*
 * Roteiro do modelo 3D da via de membrana de um secretagogo de GH (slides 103 "Peptídeos: o Sinal que
 * Bate na Porta" e 104 "O Mapa dos Peptídeos"). A transição k-1 → k mostra o processo da etapa k.
 * As câmeras estão escritas para o ligante GHRP/grelina (receptor à esquerda, x < 0); para o análogo de
 * GHRH a cena espelha o eixo x (o receptor de GHRH fica à direita).
 */

export type PeptideLigand = 'ghrp' | 'ghrh';

export const PEPTIDE_STEPS: StepData[] = [
    {
        id: 0,
        badge: 'VISÃO GERAL',
        title: 'Via de membrana de um secretagogo de GH',
        short: 'Visão geral',
        description: 'Célula somatotrófica da adeno-hipófise. O peptídeo é hidrossolúvel e não entra na célula: liga um receptor na membrana, que ativa uma proteína G, gera um segundo mensageiro e libera os grânulos de GH. É a via rápida, de segundos a minutos.',
        cameraPosition: [-1, 3.0, 35],
        cameraTarget: [0, -0.8, -1],
    },
    {
        id: 1,
        badge: 'ETAPA 1 — CHEGADA',
        title: 'O peptídeo não atravessa a bicamada',
        short: 'Chegada',
        description: 'Cadeia curta de aminoácidos, com cargas e grupos polares: a bicamada lipídica a barra. Compare com o esteroide do outro modelo, que se dissolve na membrana e passa.',
        cameraPosition: [-3.2, 4.0, 11.5],
        cameraTarget: [-0.9, 1.4, 0.4],
    },
    {
        id: 2,
        badge: 'ETAPA 2 — ENCAIXE',
        title: 'Ligação ao receptor acoplado à proteína G',
        short: 'Encaixe',
        description: 'O receptor tem sete hélices que atravessam a membrana. O peptídeo encaixa na face de fora; as hélices internas se reorganizam (a hélice 6 se afasta) e abrem um sítio para a proteína G na face de dentro.',
        cameraPosition: [-1.4, 1.2, 12.5],
        cameraTarget: [-3.9, -0.3, 0],
    },
    {
        id: 3,
        badge: 'ETAPA 3 — PROTEÍNA G',
        title: 'A subunidade α troca GDP por GTP',
        short: 'Proteína G',
        description: 'O receptor ativo faz a subunidade α soltar GDP e pegar GTP. A α se separa do par βγ e corre pela face interna da membrana até a enzima-alvo.',
        cameraPosition: [-5.6, -3.2, 17],
        cameraTarget: [-6.2, -1.6, 0],
    },
    {
        id: 4,
        badge: 'ETAPA 4 — SEGUNDO MENSAGEIRO',
        title: 'O sinal muda de molécula',
        short: 'Mensageiro',
        // O texto desta etapa depende do ligante: ver PEPTIDE_STEP4_TEXT.
        description: '',
        cameraPosition: [-5.0, -3.0, 20],
        cameraTarget: [-6.8, -4.9, -1],
    },
    {
        id: 5,
        badge: 'ETAPA 5 — AMPLIFICAÇÃO',
        title: 'Um peptídeo, milhares de mensageiros',
        short: 'Amplificação',
        description: 'Um receptor ativa várias proteínas G, e cada enzima produz muitas moléculas de mensageiro. Por isso doses minúsculas de peptídeo produzem efeito grande em segundos.',
        cameraPosition: [-4.0, -1.4, 27],
        cameraTarget: [-4.6, -4.4, -1],
    },
    {
        id: 6,
        badge: 'ETAPA 6 — EXOCITOSE',
        title: 'Os grânulos de GH se fundem à membrana',
        short: 'Exocitose',
        description: 'O cálcio no citosol dispara a fusão dos grânulos com a membrana, e o GH sai da célula de uma vez: um pulso de secreção.',
        cameraPosition: [0.4, 0.6, 18],
        cameraTarget: [0.2, 0.2, -1],
    },
    {
        id: 7,
        badge: 'ETAPA 7 — DO PULSO AO IGF-1',
        title: 'O sinal liga e desliga',
        short: 'Pulso',
        description: 'O GH vai pelo sangue ao fígado, que produz IGF-1 (o eixo GH-IGF-1 que vimos antes). Na célula, a α hidrolisa o GTP e a β-arrestina retira o receptor da superfície: o sinal se apaga, e a secreção segue em pulsos.',
        cameraPosition: [-0.6, 1.2, 30],
        cameraTarget: [-1.2, 0.3, -1],
    },
];

/** Etapa 4: o mensageiro depende do receptor que o ligante escolhido ativa. */
export const PEPTIDE_STEP4_TEXT: Record<PeptideLigand, string> = {
    ghrp: 'Gαq ativa a fosfolipase C, que gera IP3. O IP3 abre canais do retículo endoplasmático e o cálcio inunda o citosol.',
    ghrh: 'Gαs ativa a adenilato ciclase, que gera AMPc. O AMPc ativa a proteína quinase A (PKA), que abre canais de cálcio e estimula a síntese de GH.',
};

export const peptideStepText = (step: number, ligand: PeptideLigand): string =>
    step === 4 ? PEPTIDE_STEP4_TEXT[ligand] : PEPTIDE_STEPS[step].description;
