import type { StepData } from './steps';

/*
 * Roteiro do modelo 3D da dinâmica circulatória sob esteroides androgênicos anabolizantes (EAA)
 * — slide 109 "O Coração sob Esteroides" (Ato III).
 *
 * Diferença em relação aos outros dois modelos: aqui o tempo da aula T não é uma sequência de
 * eventos, é a soma progressiva dos colaterais. T = k mostra o estado com os colaterais de 1 a k
 * já instalados; o batimento do coração corre num relógio próprio, independente de T.
 *
 * Os números de cada etapa ficam em CARDIO_VITALS: a cena e o painel leem daqui, para que
 * conteúdo e desenho não saiam de sincronia. São valores ilustrativos de um caso composto,
 * ancorados nas fontes do slide — não são a média de nenhuma coorte.
 */

/** Em uso × depois de parar: o seletor do painel troca o estado do circuito. */
export type CardioPhase = 'uso' | 'apos';

export const CARDIO_STEPS: StepData[] = [
    {
        id: 0,
        badge: 'VISÃO GERAL',
        title: 'O circuito sob pressão',
        short: 'Visão geral',
        description: 'Ventrículo esquerdo em corte, valvas, aorta, uma artéria de condução, o leito de resistência e o retorno venoso. As etapas somam, uma a uma, os colaterais cardiovasculares dos EAA e mostram o que cada um faz com a pressão, o fluxo e o trabalho do músculo.',
        cameraPosition: [2, 4, 46],
        cameraTarget: [0, -0.5, 0],
    },
    {
        id: 1,
        badge: 'ETAPA 1 — PONTO DE PARTIDA',
        title: 'O coração do atleta treinado',
        short: 'Treinado',
        description: 'O treino já remodela o coração: a parede engrossa e a cavidade acompanha, de modo que o volume ejetado sobe. Enchimento rápido, relaxamento normal. É deste ponto que se parte — e é com ele que o remodelamento induzido precisa ser comparado, não com o de um sedentário.',
        cameraPosition: [-6, 2.5, 26],
        cameraTarget: [-7.5, 0, 0],
    },
    {
        id: 2,
        badge: 'ETAPA 2 — HIPERTROFIA',
        title: 'A parede cresce para dentro',
        short: 'Hipertrofia',
        description: 'O miócito cardíaco tem receptor androgênico: o estímulo é direto, e a sobrecarga de pressão soma. A parede engrossa sem que a cavidade acompanhe — hipertrofia concêntrica, com a espessura relativa de parede aumentada. O espessamento começa cedo, antes de a função cair.',
        cameraPosition: [-7.5, 1.5, 19],
        cameraTarget: [-7.5, -0.2, 0],
    },
    {
        id: 3,
        badge: 'ETAPA 3 — ENCHIMENTO',
        title: 'A diástole falha onde o Doppler comum não olha',
        short: 'Enchimento',
        description: 'Parede espessa e mais rígida relaxa devagar. O detalhe que importa na prática: a relação E/A do Doppler transmitral costuma vir normal nesses pacientes — quem mostra o problema é a velocidade de relaxamento precoce (E′) do Doppler tecidual. Um eco sem Doppler tecidual passa em branco.',
        cameraPosition: [-9, -1, 17],
        cameraTarget: [-7.2, 0.6, 0],
    },
    {
        id: 4,
        badge: 'ETAPA 4 — PRESSÃO',
        title: 'A pós-carga realimenta a hipertrofia',
        short: 'Pressão',
        description: 'A pressão sobe por mais de uma via: atividade simpática aumentada, peptídeos natriuréticos suprimidos e artérias mais rígidas. Metade dos usuários tem hipertensão sistólica na medida de 24 horas. Cada sístole vence uma pressão maior, e a sobrecarga alimenta de volta o espessamento.',
        cameraPosition: [0.3, 2, 35],
        cameraTarget: [0, 0.5, 0],
    },
    {
        id: 5,
        badge: 'ETAPA 5 — VISCOSIDADE',
        title: 'Sangue mais espesso, mesmo motor',
        short: 'Viscosidade',
        description: 'A testosterona eleva a eritropoetina e derruba a hepcidina, liberando ferro para a eritropoese. O hematócrito sobe e a viscosidade sobe com ele, mais que proporcionalmente. Sangue espesso exige mais pressão para o mesmo fluxo — sobretudo quando a frequência cardíaca cai, no sono.',
        cameraPosition: [10, 1, 22],
        cameraTarget: [9, 0, 0],
    },
    {
        id: 6,
        badge: 'ETAPA 6 — PAREDE DO VASO',
        title: 'Endotélio, lipídios e placa',
        short: 'Placa',
        description: 'O HDL despenca e o LDL sobe, com os orais 17-alfa-alquilados no pior extremo. Soma-se disfunção endotelial e artéria rígida: a placa cresce, e boa parte dela é placa não calcificada — a que o escore de cálcio não enxerga. Um cálcio zero não tranquiliza nesse paciente.',
        cameraPosition: [8, -1.5, 18],
        cameraTarget: [7.5, 0, 0],
    },
    {
        id: 7,
        badge: 'ETAPA 7 — CONVERGÊNCIA',
        title: 'Onde os colaterais se encontram',
        short: 'Desfecho',
        // Texto desta etapa depende do seletor: ver CARDIO_PHASE_TEXT.
        description: '',
        cameraPosition: [1, 3, 42],
        cameraTarget: [0, -0.5, 0],
    },
];

/**
 * Etapa 7: o desfecho depende de o paciente estar em uso ou ter parado. A literatura não dá um
 * "sim" nem um "não" para a reversibilidade: dá uma lista do que volta e do que não volta.
 */
export const CARDIO_PHASE_TEXT: Record<CardioPhase, string> = {
    uso: 'Músculo espesso, pós-carga alta, sangue viscoso e coronária com placa: quatro mecanismos no mesmo paciente. Numa coorte de registro com seguimento de cerca de 11 anos, usuários tiveram mais cardiomiopatia, insuficiência cardíaca, infarto, arritmias e tromboembolismo venoso. Nenhum mecanismo isolado explica esse risco; a soma explica.',
    apos: 'Depois de parar, a lista se divide. Voltam: pressão, hematócrito, lipídios (em cerca de três meses) e boa parte da massa e da fração de ejeção do ventrículo. Não voltam, ou voltam pouco: o relaxamento (E′ e strain seguem piores), a rigidez da aorta e a placa já formada — cujo volume não difere entre quem usa e quem parou. Reversível em parte não é reversível.',
};

export const cardioStepText = (step: number, phase: CardioPhase): string =>
    step === 7 ? CARDIO_PHASE_TEXT[phase] : CARDIO_STEPS[step].description;

/**
 * Valores que a cena e o painel usam em cada etapa. Caso composto e ilustrativo: servem para
 * mostrar direção e magnitude relativa, não para diagnosticar.
 *
 * parede/cavidade em mm, pa em mmHg, fe em %, eLinha = E′ do Doppler tecidual em cm/s,
 * hct em %, hdl/ldl em mg/dL, viscosidade relativa ao plasma, placa e fibrose em 0…1.
 *
 * `eLinha`, e não a relação E/A: em usuários de EAA o E/A transmitral costuma vir normal, e a
 * alteração aparece no Doppler tecidual. Usar E/A aqui ensinaria o erro que o slide denuncia.
 */
export interface CardioVitals {
    paredeMm: number;
    cavidadeMm: number;
    paSist: number;
    paDiast: number;
    fe: number;
    eLinha: number;
    hct: number;
    hdl: number;
    ldl: number;
    viscosidade: number;
    placa: number;
    fibrose: number;
}

const VITALS_USO: readonly CardioVitals[] = [
    { paredeMm: 10, cavidadeMm: 50, paSist: 118, paDiast: 74, fe: 62, eLinha: 11.1, hct: 45, hdl: 52, ldl: 105, viscosidade: 1.0, placa: 0, fibrose: 0 },
    { paredeMm: 11, cavidadeMm: 55, paSist: 118, paDiast: 74, fe: 63, eLinha: 11.5, hct: 45, hdl: 54, ldl: 100, viscosidade: 1.0, placa: 0, fibrose: 0 },
    { paredeMm: 14, cavidadeMm: 50, paSist: 124, paDiast: 77, fe: 60, eLinha: 10.4, hct: 46, hdl: 48, ldl: 110, viscosidade: 1.03, placa: 0.05, fibrose: 0.1 },
    { paredeMm: 14, cavidadeMm: 48, paSist: 128, paDiast: 78, fe: 58, eLinha: 9.6, hct: 46, hdl: 46, ldl: 112, viscosidade: 1.03, placa: 0.05, fibrose: 0.2 },
    { paredeMm: 15, cavidadeMm: 47, paSist: 142, paDiast: 82, fe: 56, eLinha: 9.3, hct: 47, hdl: 42, ldl: 118, viscosidade: 1.08, placa: 0.1, fibrose: 0.3 },
    { paredeMm: 15, cavidadeMm: 47, paSist: 142, paDiast: 82, fe: 55, eLinha: 9.3, hct: 54, hdl: 40, ldl: 122, viscosidade: 1.45, placa: 0.15, fibrose: 0.35 },
    { paredeMm: 15, cavidadeMm: 46, paSist: 142, paDiast: 82, fe: 54, eLinha: 9.3, hct: 54, hdl: 35, ldl: 130, viscosidade: 1.45, placa: 0.55, fibrose: 0.4 },
    { paredeMm: 15, cavidadeMm: 46, paSist: 142, paDiast: 82, fe: 52, eLinha: 9.3, hct: 54, hdl: 35, ldl: 130, viscosidade: 1.45, placa: 0.7, fibrose: 0.5 },
];

/**
 * Depois de parar, seguindo o que cada achado faz na literatura: massa, fração de ejeção,
 * pressão, hematócrito e lipídios regridem; E′ melhora pouco; placa e fibrose ficam.
 */
const afterStopping = (v: CardioVitals, i: number): CardioVitals =>
    i < 2 ? v : {
        ...v,
        paredeMm: Math.max(v.paredeMm - 3, 11),
        cavidadeMm: v.cavidadeMm + 2,
        paSist: 128,
        paDiast: 78,
        fe: Math.min(v.fe + 8, 61),
        eLinha: v.eLinha + 0.8,
        hct: 46,
        hdl: 50,
        ldl: 105,
        viscosidade: 1.03,
    };

export const CARDIO_VITALS: Record<CardioPhase, readonly CardioVitals[]> = {
    uso: VITALS_USO,
    apos: VITALS_USO.map(afterStopping),
};

/** Mistura dois conjuntos de valores (k = 0 devolve `a`, k = 1 devolve `b`). */
export const mixVitals = (a: CardioVitals, b: CardioVitals, k: number): CardioVitals => {
    const mix = (x: number, y: number) => x + (y - x) * k;
    return {
        paredeMm: mix(a.paredeMm, b.paredeMm),
        cavidadeMm: mix(a.cavidadeMm, b.cavidadeMm),
        paSist: mix(a.paSist, b.paSist),
        paDiast: mix(a.paDiast, b.paDiast),
        fe: mix(a.fe, b.fe),
        eLinha: mix(a.eLinha, b.eLinha),
        hct: mix(a.hct, b.hct),
        hdl: mix(a.hdl, b.hdl),
        ldl: mix(a.ldl, b.ldl),
        viscosidade: mix(a.viscosidade, b.viscosidade),
        placa: mix(a.placa, b.placa),
        fibrose: mix(a.fibrose, b.fibrose),
    };
};

/** Interpola os valores entre etapas, para a cena acompanhar a transição em T contínuo. */
export const cardioVitalsAt = (t: number, phase: CardioPhase): CardioVitals => {
    const table = CARDIO_VITALS[phase];
    const last = table.length - 1;
    const clamped = Math.min(Math.max(t, 0), last);
    const i = Math.floor(clamped);
    return mixVitals(table[i], table[Math.min(i + 1, last)], clamped - i);
};
