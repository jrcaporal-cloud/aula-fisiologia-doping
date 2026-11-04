import { clamp01, lerp, smooth } from '../receptor/layout';
import { SYS } from './params';

/*
 * Onda de pressão arterial (raiz da aorta) em função da fase do ciclo, de 0 (pressão diastólica) a 1
 * (sistólica). A escala em mmHg vem de `cardioVitalsAt`; aqui só mora o formato. A rigidez (0…1,
 * a mesma que enrijece a parede da aorta na cena) muda a morfologia como no achado clínico:
 *  - subida mais rápida e pico sistólico tardio e sustentado (a onda refletida volta cedo e soma);
 *  - incisura dicrótica rasa e quase sem onda dicrótica;
 *  - queda diastólica mais rápida (a aorta rígida devolve menos do volume que armazenou).
 * Esquemático: o formato é didático, não é um traçado medido.
 */

const bell = (x: number, at: number, sd: number) => Math.exp(-((x - at) * (x - at)) / (2 * sd * sd));

/** Sístole: subida, pico e queda até o fechamento da valva (cs = 0…1 dentro da sístole). */
const systolic = (cs: number, rig: number): number => {
    const soft = smooth(clamp01((cs - 0.05) / 0.25)) * (1 - 0.42 * smooth(clamp01((cs - 0.3) / 0.62)));
    const stiff = 0.86 * smooth(clamp01((cs - 0.05) / 0.15))
        + 0.14 * smooth(clamp01((cs - 0.2) / 0.3))
        - 0.28 * smooth(clamp01((cs - 0.55) / 0.4));
    return lerp(soft, stiff, rig);
};

/** Nível ao fim da sístole, onde a diástole começa. */
const endSystole = (rig: number): number => systolic(1, rig);

/** Formato bruto (sem normalizar) numa fase c ∈ [0, 1) do ciclo. */
export const rawPressure = (c: number, rig: number): number => {
    if (c < SYS) return systolic(c / SYS, rig);
    const cd = (c - SYS) / (1 - SYS);
    const s0 = endSystole(rig);
    const k = 1.7 + 1.9 * rig;
    const decay = (Math.exp(-k * cd) - Math.exp(-k)) / (1 - Math.exp(-k));
    // incisura (queda breve) e onda dicrótica (reforço leve), ambas atenuadas pela rigidez
    const notch = -0.1 * (1 - 0.65 * rig) * bell(c, SYS + 0.012, 0.014);
    const wave = 0.07 * (1 - 0.8 * rig) * bell(c, SYS + 0.075, 0.03);
    return s0 * decay + notch + wave;
};

/** Fase no instante `ago` segundos atrás, dado o batimento atual (c) e a frequência em Hz. */
export const phaseAgo = (c: number, hz: number, ago: number): number => {
    const x = c - hz * ago;
    return x - Math.floor(x);
};

/** Pressão em mmHg a partir do formato normalizado `s` (0…1) e das faixas diastólica/sistólica. */
export const pressureMmHg = (s: number, diast: number, sist: number): number => diast + (sist - diast) * s;
