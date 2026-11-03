/**
 * Conteúdo do slide "A Margem que Mata" / "Anabolismo vs Hipoglicemia" (id 12 do parsedPresentation.json).
 *
 * Tudo verbatim da aula (só ortografia ajustada):
 *  - 3 frases do topo (lista do slide).
 *  - Régua: "~10 UI · Microdose (Stack)", "▲ Aumento Exponencial de Captação CHO ▲",
 *    "~15+ UI · Gatilho de Coma Hipoglicêmico"; textos dos segmentos verde/amarelo/vermelho
 *    (os mesmos de `../insulin/model.ts`, de onde são importados); rótulos estáticos
 *    "Risco de Hipoglicemia", "Saturação de Receptores IR", "Depleção Crítica de Glicose SNC".
 * Nenhum número novo: só ~10, ~12 e ~15+ UI e "2 a 4 unidades extras".
 */

export { DOSE_COMA, DOSE_MICRO, DOSE_SATURATION, ZONES } from '../insulin/model';
export type { DoseZone, ZoneId } from '../insulin/model';

export type FactIcon = 'anabolic' | 'hidden' | 'antidote';

export interface Fact {
    readonly icon: FactIcon;
    readonly pre: string;
    readonly hi: string;
    readonly post: string;
    readonly color: string;
    /** Primeiro passo em que o fato acende. */
    readonly from: number;
}

export const FACTS: readonly Fact[] = [
    { icon: 'anabolic', pre: 'Insulina é o ', hi: 'agente anabolizante mais potente', post: ' do corpo humano.', color: '#22D3EE', from: 0 },
    {
        icon: 'hidden',
        pre: 'Por ser idêntica à forma endógena, a insulina humana injetada é ',
        hi: 'muito difícil de detectar',
        post: ' depois de 2–4 horas.',
        color: '#A855F7',
        from: 4,
    },
    { icon: 'antidote', pre: '', hi: 'Hipoglicemia grave é emergência', post: ' em dose maciça incorreta.', color: '#E11D48', from: 3 },
];

export interface StepInfo {
    readonly tab: string;
    readonly title: string;
    readonly caption: string;
    /** Dose em que o marcador para (UI); `null` = caiu no abismo. */
    readonly dose: number | null;
}

export const STEPS: readonly StepInfo[] = [
    { tab: 'A régua', title: 'Anabolismo vs hipoglicemia', caption: '~10 UI de um lado, ~15+ UI do outro', dose: 0 },
    { tab: '~10 UI', title: '~10 UI · microdose (stack)', caption: 'máximo anabolismo', dose: 10 },
    { tab: '~12 UI', title: 'Acima de ~12 UI', caption: 'receptores saturados', dose: 12 },
    { tab: '~15+ UI', title: '~15+ UI · gatilho de coma hipoglicêmico', caption: 'margem de erro de 2 a 4 unidades extras', dose: null },
    { tab: 'Sem volta', title: 'Difícil de detectar, sem margem de erro', caption: 'a margem que mata', dose: null },
];

export const LABELS = {
    micro: '~10 UI',
    microSub: 'Microdose (stack)',
    sat: '~12 UI',
    satSub: 'Saturação de receptores IR',
    coma: '~15+ UI',
    comaSub: 'Gatilho de coma hipoglicêmico',
    uptake: ['▲ Aumento exponencial', 'de captação CHO ▲'],
    risk: 'Risco de hipoglicemia',
    cns: 'Depleção crítica de glicose SNC',
    cnsLines: ['Depleção crítica', 'de glicose SNC'],
    margin: 'Margem de erro',
    marginSub: '2 a 4 unidades extras',
} as const;
