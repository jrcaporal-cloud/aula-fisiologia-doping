/**
 * Modelo ILUSTRATIVO de reologia para o slide "O Hematócrito que Mata".
 * Âncoras da aula (slide id 14): fisiologia normal ≈ 45%; rhEPO abusiva > 55–60%;
 * no sono, FC ~30 bpm → estase → microtrombose + infarto agudo.
 * As curvas entre as âncoras são qualitativas — nenhum valor numérico de viscosidade
 * ou fluxo é exibido, só barras relativas com selo "modelo ilustrativo".
 */

export const HCT_MIN = 40;
export const HCT_MAX = 65;
/** Aula: "Fisiologia Normal (Hematócrito ~45%)". */
export const HCT_NORMAL = 45;
/** Aula: "rhEPO Abusiva (Hematócrito >55-60%)" — limiar inferior da faixa. */
export const HCT_EPO_LOW = 55;
export const HCT_EPO_HIGH = 60;
/** Valor de demonstração dentro da faixa >55–60% da aula. */
export const HCT_EPO_DEMO = 58;
/** Aula: "No sono, com FC ~30bpm em atletas". */
export const SLEEP_HR = 30;
export const BEAT_PERIOD = 60 / SLEEP_HR;

const VISC_K = 0.06;

export const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

export const smoothstep = (a: number, b: number, v: number) => {
    const t = clamp01((v - a) / (b - a));
    return t * t * (3 - 2 * t);
};

/** Viscosidade relativa ao normal (1 em 45%), crescimento exponencial qualitativo. */
export const viscosityRel = (hct: number) => Math.exp(VISC_K * (hct - HCT_NORMAL));

/** Preenchimento da barra de viscosidade (0–1 na escala 40–65%). */
export const viscosityFill = (hct: number) => viscosityRel(hct) / viscosityRel(HCT_MAX);

/** Fluxo relativo em vigília (1 em 45%): inverso da viscosidade. */
export const flowRel = (hct: number) => 1 / viscosityRel(hct);

/** Fluxo máximo da escala da barra (o fluxo em 40%). */
export const FLOW_SCALE_MAX = flowRel(HCT_MIN);

/** Grau de empilhamento das hemácias (rouleaux): começa perto de 55%. */
export const aggregation = (hct: number) => smoothstep(52, 60, hct);

/**
 * Onda de fluxo de um batimento (0–1): subida rápida e decaimento lento.
 * Usada só no modo sono (FC ~30 bpm → um pulso a cada 2 s).
 */
export const pulseWave = (t: number) => {
    const phase = (t % BEAT_PERIOD) / BEAT_PERIOD;
    if (phase < 0.12) {
        const s = Math.sin((phase / 0.12) * (Math.PI / 2));
        return s * s;
    }
    return Math.exp(-(phase - 0.12) * 6);
};

/** Fator de fluxo no sono: fluxo baixo entre batimentos lentos. */
export const sleepFlowFactor = (t: number) => 0.2 + 0.8 * pulseWave(t);

export type FlowState = 'normal' | 'hiper' | 'trombose';

export const classify = (hct: number, sleep: boolean): FlowState => {
    if (hct < HCT_EPO_LOW) return 'normal';
    return sleep ? 'trombose' : 'hiper';
};

export const flowWord = (flow: number) => {
    if (flow > 0.8) return 'Adequado';
    if (flow > 0.5) return 'Reduzido';
    if (flow > 0.18) return 'Muito reduzido';
    return 'Estase';
};
