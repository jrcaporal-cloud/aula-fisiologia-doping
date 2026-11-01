export interface StepData {
    id: number;
    badge: string;
    title: string;
    description: string;
    cameraPosition: [number, number, number];
    cameraTarget: [number, number, number];
}

export const STEPS: StepData[] = [
    {
        id: 0,
        badge: 'VISÃO GERAL',
        title: 'Mecanismo genômico de ação',
        description: 'A testosterona, esteroide lipofílico, atravessa a membrana celular, liga-se ao receptor androgênico intracelular e ativa a transcrição de genes da síntese proteica muscular.',
        cameraPosition: [4, 7, 40],
        cameraTarget: [4, 0, 0]
    },
    {
        id: 1,
        badge: 'ETAPA 1 — DIFUSÃO',
        title: 'Difusão pela membrana',
        description: 'A testosterona (C₁₉H₂₈O₂) é um hormônio esteroide apolar. Por ser lipofílica, atravessa livremente a bicamada fosfolipídica da membrana por difusão simples.',
        cameraPosition: [16, 5, 22],
        cameraTarget: [12, 0, 0]
    },
    {
        id: 2,
        badge: 'ETAPA 2 — LIGAÇÃO',
        title: 'Ligação ao receptor androgênico',
        description: 'No citoplasma, a testosterona liga-se ao receptor androgênico (AR) e desloca as proteínas de choque térmico (HSP90). A mudança conformacional expõe o sinal de localização nuclear (NLS).',
        cameraPosition: [6, 2, 12],
        cameraTarget: [6, 0, 0]
    },
    {
        id: 3,
        badge: 'ETAPA 3 — TRANSLOCAÇÃO',
        title: 'Translocação nuclear',
        description: 'O dímero T-AR atravessa os complexos de poro nuclear (NPC) via importina-β. No núcleo, liga-se aos elementos de resposta androgênica (AREs) nos promotores dos genes-alvo.',
        cameraPosition: [1.5, 2.5, 8],
        cameraTarget: [0, 0, 0]
    },
    {
        id: 4,
        badge: 'ETAPA 4 — TRANSCRIÇÃO',
        title: 'Transcrição gênica → mRNA',
        description: 'A ligação do AR recruta coativadores e a RNA polimerase II, ativando a transcrição dos genes MYH (miosina) e ACTA (actina). O mRNA resultante é processado e exportado.',
        cameraPosition: [-4, 2, 8],
        cameraTarget: [-2, 0, 0]
    },
    {
        id: 5,
        badge: 'ETAPA 5 — SÍNTESE',
        title: 'Síntese proteica e hipertrofia',
        description: 'Ribossomos traduzem o mRNA em proteínas contráteis (actina, miosina). A testosterona eleva a taxa de síntese proteica muscular, levando à hipertrofia miofibrilar ao longo do tempo.',
        cameraPosition: [-8, -2, 14],
        cameraTarget: [-6, -2, 4]
    }
];
