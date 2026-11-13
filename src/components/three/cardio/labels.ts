import type { LabelSpec } from '../receptor/Label3D';
import { CC } from './colors';
import { FLOW, PLAQUE_SAMPLE } from './flow';
import { W } from './layout';

/*
 * Rótulos de cada etapa do roteiro (aparecem quando a etapa assenta). No máximo quatro por etapa:
 * o resto está no cartão da estrutura (hover/clique) e no monitor. Posições afinadas com capturas.
 */

type Spec = Omit<LabelSpec, 'big'>;
type P3 = [number, number, number];

const w = (x: number, y: number, z = 0.05): P3 => { const v = W(x, y, z); return [v.x, v.y, v.z]; };
const at = (x: number, y: number, z = 0): P3 => [x, y, z];

/** Âncoras no referencial do coração (convertidas para o mundo). */
const LV_FREE_WALL = w(2.75, 0.4);
const LV_SEPTUM = w(-2.8, 0.2);
const LV_CAVITY = w(0.2, -0.4, -0.6);
const MITRAL_AT = w(1.2, 1.55, -0.2);
const LA_AT = w(1.3, 3.9, -0.4);
const AORTIC_AT = w(-1.3, 2.7, -0.2);
const FIBROSE_AT = w(2.2, -1.2);
/** Ponto mais apertado da lesão, na borda de corte de baixo da artéria. */
const PLAQUE_AT: P3 = (() => {
    const s = FLOW[PLAQUE_SAMPLE];
    const p = s.p.clone().addScaledVector(s.s, s.r0 * 0.75);
    return [p.x, p.y, p.z + 0.05];
})();

const stepLabels = (step: number): Spec[] => {
    switch (step) {
        case 0:
            return [
                { id: 'co', text: 'Coração em corte', sub: 'quatro câmaras, como no eco', color: CC.myo, at: LV_CAVITY, dx: -150, dy: 130 },
                { id: 'ao', text: 'Aorta', color: CC.artery, at: at(-3.7, 8.4), dx: 50, dy: -24 },
                { id: 'ar', text: 'Artéria de condução', color: CC.artery, at: at(4.7, 4.15), dx: 20, dy: -56 },
                { id: 'al', text: 'Leito de resistência', sub: 'arteríolas', color: CC.arteriole, at: at(8.3, -0.6), dx: -70, dy: 60 },
            ];
        case 1:
            return [
                { id: 'pa', text: 'Parede do VE', sub: 'atleta treinado', color: CC.myo, at: LV_FREE_WALL, dx: 70, dy: 40 },
                { id: 'cv', text: 'Cavidade', sub: 'acompanha a parede', color: CC.blood, at: LV_CAVITY, dx: 70, dy: 90 },
                { id: 'mi', text: 'Valva mitral', color: CC.valve, at: MITRAL_AT, dx: 90, dy: -60 },
            ];
        case 2:
            return [
                { id: 'pa', text: 'A parede cresce para dentro', sub: 'hipertrofia concêntrica', color: CC.myo, at: LV_SEPTUM, dx: -40, dy: -130 },
                { id: 'cv', text: 'A cavidade encolhe', color: CC.blood, at: LV_CAVITY, dx: -90, dy: 110 },
                { id: 'fb', text: 'Fibrose intersticial', sub: 'achado de autópsia, não de RM', color: CC.fibrose, at: FIBROSE_AT, dx: -70, dy: -150 },
            ];
        case 3:
            return [
                { id: 'mi', text: 'Enchimento mais lento', sub: 'E′ baixo no Doppler tecidual', color: CC.valve, at: MITRAL_AT, dx: 60, dy: 70 },
                { id: 'la', text: 'O átrio empurra no fim da diástole', color: CC.atrium, at: LA_AT, dx: 40, dy: -90 },
                { id: 'pa', text: 'Parede espessa relaxa devagar', color: CC.myo, at: LV_FREE_WALL, dx: -30, dy: 120 },
            ];
        case 4:
            return [
                { id: 'ao', text: 'Aorta rígida amortece menos', color: CC.artery, at: at(-3.7, 8.4), dx: 40, dy: -30 },
                { id: 'va', text: 'A sístole vence mais pressão', sub: 'pós-carga', color: CC.valve, at: AORTIC_AT, dx: 60, dy: 90 },
                { id: 'ar', text: 'Artéria distende menos', sub: 'rigidez', color: CC.artery, at: at(2.0, 4.4), dx: -20, dy: 80 },
            ];
        case 5:
            return [
                { id: 'hc', text: 'Mais hemácias por volume', sub: 'hematócrito alto', color: CC.cell, at: at(4.7, 3.7), dx: -60, dy: -50 },
                { id: 'vs', text: 'Nas arteríolas o sangue se arrasta', color: CC.arteriole, at: at(8.1, 1.2), dx: -80, dy: 40 },
            ];
        case 6:
            return [
                { id: 'pl', text: 'Placa não calcificada', sub: 'núcleo lipídico sob a capa', color: CC.plaque, at: PLAQUE_AT, dx: -40, dy: 80 },
                { id: 'lu', text: 'Luz estreitada', sub: 'o fluxo acelera e se desorganiza', color: CC.cell, at: at(4.3, 3.95), dx: 40, dy: -70 },
                { id: 'en', text: 'Endotélio', sub: 'deixa de dilatar', color: CC.endo, at: at(1.6, 4.55, -0.35), dx: -50, dy: -50 },
            ];
        default:
            return [
                { id: 'mu', text: 'Músculo espesso', color: CC.myo, at: LV_FREE_WALL, dx: 60, dy: 90 },
                { id: 'po', text: 'Pós-carga alta', color: CC.artery, at: at(-1.9, 7.6), dx: 40, dy: -24 },
                { id: 'vi', text: 'Sangue viscoso', color: CC.cell, at: at(5.9, 3.35), dx: -30, dy: -70 },
                { id: 'pl', text: 'Placa', color: CC.plaque, at: PLAQUE_AT, dx: 40, dy: 60 },
            ];
    }
};

export const cardioLabelsForStep = (step: number): LabelSpec[] =>
    stepLabels(step).map(l => ({ ...l, big: true }));
