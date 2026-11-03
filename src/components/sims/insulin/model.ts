/**
 * Conteúdo e modelo do simulador de insulina/GLUT4.
 *
 * Todos os textos e números vêm da aula:
 *  - Slide "A Margem que Mata" (id 12): régua ~10 UI microdose (stack) → ~15+ UI gatilho de coma
 *    hipoglicêmico; faixas verde / amarelo (acima de ~12 UI, receptores saturados) / vermelho
 *    (margem de erro de 2 a 4 unidades extras; depleção crítica de glicose no SNC).
 *  - Slide "Translocação Massiva do GLUT4" (id 13) e o card "O Gatilho Master Indetectável":
 *    receptor IR-α/β (tirosina quinase), sinalização PI3K → Akt, GLUT4 arrastado para a membrana
 *    "em poucos minutos", fibra muscular vira "esponja" de glicogênio.
 *
 * A curva de glicemia é um MODELO ILUSTRATIVO (sem mg/dL): só os pontos-âncora da régua são da aula.
 */

export const STEP_COUNT = 4;

/** Posição máxima do controle. Tudo a partir de 15 aparece como "15+ UI" (a régua da aula não tem teto). */
export const DOSE_MAX = 18;
export const DOSE_MICRO = 10;
export const DOSE_SATURATION = 12;
export const DOSE_COMA = 15;

/** Dose aplicada automaticamente quando o passador chega em cada passo. */
export const STEP_DOSE: readonly number[] = [0, DOSE_MICRO, DOSE_MICRO, DOSE_MAX];

export const doseLabel = (dose: number): string => (dose >= DOSE_COMA ? '15+ UI' : `${dose} UI`);

export type ZoneId = 'green' | 'yellow' | 'red';

export interface DoseZone {
    id: ZoneId;
    title: string;
    text: string;
    color: string;
}

export const ZONES: Record<ZoneId, DoseZone> = {
    green: {
        id: 'green',
        title: 'Máximo anabolismo',
        text: 'A dose ideal (~10 UI) pós-treino satura os receptores celulares, garantindo captação total de nutrientes sem esvaziar a glicose central agudamente.',
        color: '#22D3EE',
    },
    yellow: {
        id: 'yellow',
        title: 'Receptores saturados',
        text: 'Acima de ~12 UI não há mais receptores musculares disponíveis. A insulina extra sobra no sangue derrubando violentamente a glicemia.',
        color: '#F59E0B',
    },
    red: {
        id: 'red',
        title: 'Coma hipoglicêmico',
        text: 'A margem de erro terapêutico é de apenas 2 a 4 unidades extras. O cérebro desliga por falta de glicose antes que o corpo exiba letargia profunda.',
        color: '#E11D48',
    },
};

export const zoneForDose = (dose: number): DoseZone => {
    if (dose >= DOSE_COMA) return ZONES.red;
    if (dose > DOSE_MICRO) return ZONES.yellow;
    return ZONES.green;
};

export interface StepInfo {
    kicker: string;
    title: string;
    text: string;
}

export const STEPS: readonly StepInfo[] = [
    {
        kicker: 'Estado basal',
        title: 'GLUT4 guardado',
        text: 'Sem insulina, as vesículas de GLUT4 ficam no citoplasma. A glicose sobra no sangue.',
    },
    {
        kicker: 'Sinalização',
        title: 'Insulina liga no receptor IR',
        text: 'O receptor IR-α/β (tirosina quinase) é ativado e acende a cascata PI3K → Akt.',
    },
    {
        kicker: 'Translocação',
        title: 'Translocação massiva do GLUT4',
        text: 'GLUT4 arrastado para a membrana em poucos minutos: a fibra vira esponja de glicogênio.',
    },
    {
        kicker: 'A margem que mata',
        title: '~15+ UI: hipoglicemia',
        text: 'Receptores saturados: a insulina extra sobra no sangue e derruba a glicemia.',
    },
];

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const smooth = (t: number) => {
    const x = clamp01(t);
    return x * x * (3 - 2 * x);
};

/** Fração de receptores IR ocupados: ~10 UI já satura (slide 12, faixa verde). */
export const receptorOccupancy = (dose: number): number => clamp01(dose / DOSE_MICRO);

/** Insulina que sobra livre no sangue quando os receptores já estão saturados (faixa amarela/vermelha). */
export const freeInsulinFraction = (dose: number): number => clamp01((dose - DOSE_MICRO) / (DOSE_MAX - DOSE_MICRO));

/**
 * Glicose no sangue (0–1, qualitativo). Âncoras da régua:
 * ~10 UI → ainda preservada; acima de ~12 UI → despencando; ~15+ UI → depleção crítica.
 */
export const bloodGlucoseTarget = (dose: number): number => {
    if (dose <= DOSE_MICRO) return 1 - 0.04 * dose;
    if (dose < DOSE_COMA) return 0.6 - 0.48 * smooth((dose - DOSE_MICRO) / (DOSE_COMA - DOSE_MICRO));
    return Math.max(0.12 - 0.03 * (dose - DOSE_COMA), 0.03);
};

/** Faixas qualitativas do medidor de glicose no sangue (de cima para baixo). */
export const GLUCOSE_BANDS = [
    { from: 0.45, to: 1, label: 'Glicose central preservada', color: '#22D3EE' },
    { from: 0.18, to: 0.45, label: 'Glicemia despencando', color: '#F59E0B' },
    { from: 0, to: 0.18, label: 'Depleção crítica de glicose SNC', color: '#E11D48' },
] as const;

export const HYPO_THRESHOLD = 0.18;

export const glucoseBandColor = (g: number): string =>
    (GLUCOSE_BANDS.find(b => g >= b.from) ?? GLUCOSE_BANDS[2]).color;
