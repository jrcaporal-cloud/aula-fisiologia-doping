import type { LabelSpec } from '../receptor/Label3D';
import { CC } from './colors';
import { AORTIC, ENDO_AT, LA_CENTER, MITRAL, PLAQUE_AT, VENT_X } from './layout';

/* Rótulos de cada etapa (aparecem quando a etapa assenta). Posições afinadas com capturas. */

type Spec = Omit<LabelSpec, 'big'>;

const at = (x: number, y: number, z = 0): [number, number, number] => [x, y, z];

const stepLabels = (step: number): Spec[] => {
    switch (step) {
        case 0:
            return [
                { id: 've', text: 'Ventrículo esquerdo', sub: 'em corte', color: CC.myo, at: at(VENT_X, -1.6, 0.8), dx: -45, dy: 76 },
                { id: 'ao', text: 'Aorta e arco', color: CC.artery, at: at(-5.3, 5.5), dx: 60, dy: -30 },
                { id: 'ar', text: 'Artéria de condução', color: CC.artery, at: at(4.7, 2.45), dx: 30, dy: -78 },
                { id: 'al', text: 'Leito de resistência', sub: 'arteríolas', color: CC.arteriole, at: at(11.3, 0.2), dx: -50, dy: 125 },
                { id: 'vn', text: 'Retorno venoso', color: CC.vein, at: at(0.4, -3.6), dx: -30, dy: 70 },
            ];
        case 1:
            return [
                { id: 'pa', text: 'Parede', sub: 'espessura do atleta treinado', color: CC.myo, at: at(VENT_X - 3.1, 0.5), dx: -60, dy: -40 },
                { id: 'cv', text: 'Cavidade', sub: 'acompanha a parede', color: CC.blood, at: at(VENT_X, 0.3, 1.2), dx: 70, dy: 56 },
                { id: 'mi', text: 'Valva mitral', color: CC.valve, at: at(MITRAL.x, MITRAL.y, 0.9), dx: -56, dy: -46 },
                { id: 'ao', text: 'Valva aórtica', color: CC.valve, at: at(AORTIC.x, AORTIC.y, 0.7), dx: 64, dy: -52 },
            ];
        case 2:
            return [
                { id: 'pa', text: 'Parede cresce para dentro', sub: 'hipertrofia concêntrica', color: CC.myo, at: at(VENT_X - 1.6, -1.2), dx: -56, dy: -44 },
                { id: 'cv', text: 'A cavidade encolhe', color: CC.blood, at: at(VENT_X, 0.0, 1.2), dx: 76, dy: 46 },
                { id: 'fb', text: 'Fibrose intersticial', sub: 'achado de autópsia, não de RM', color: CC.fibrose, at: at(VENT_X + 2.2, 0.2, 2.2), dx: 70, dy: -40 },
            ];
        case 3:
            return [
                { id: 'mi', text: 'Enchimento mais lento', sub: 'E′ baixo no Doppler tecidual', color: CC.valve, at: at(MITRAL.x, MITRAL.y - 0.4, 0.9), dx: 64, dy: 52 },
                { id: 'la', text: 'O átrio empurra no fim da diástole', color: CC.atrium, at: at(LA_CENTER.x, LA_CENTER.y - 1.0, 0.4), dx: 56, dy: -16 },
                { id: 'pa', text: 'Parede espessa relaxa devagar', color: CC.myo, at: at(VENT_X - 1.2, -1.4), dx: -56, dy: -46 },
            ];
        case 4:
            return [
                { id: 'ao', text: 'Aorta rígida amortece menos', color: CC.artery, at: at(-5.3, 5.0), dx: 60, dy: -16 },
                { id: 'va', text: 'A sístole vence mais pressão', sub: 'pós-carga', color: CC.valve, at: at(AORTIC.x, AORTIC.y + 0.4, 0.6), dx: 70, dy: 70 },
                { id: 'ar', text: 'Artéria distende menos', sub: 'rigidez', color: CC.artery, at: at(6.4, 2.3), dx: 24, dy: 70 },
            ];
        case 5:
            return [
                { id: 'hc', text: 'Mais hemácias por volume', sub: 'hematócrito alto', color: CC.cell, at: at(9.2, 2.05), dx: -60, dy: -74 },
                { id: 'vs', text: 'Nas arteríolas o sangue se arrasta', color: CC.arteriole, at: at(11.0, -1.1), dx: -60, dy: 70 },
            ];
        case 6:
            return [
                { id: 'pl', text: 'Placa não calcificada', color: CC.plaque, at: at(PLAQUE_AT.x, PLAQUE_AT.y + 0.5, 0.4), dx: -56, dy: 86 },
                { id: 'lu', text: 'Lúmen estreitado', sub: 'o fluxo acelera e se desorganiza', color: CC.cell, at: at(PLAQUE_AT.x + 1.0, PLAQUE_AT.y - 0.3), dx: 56, dy: 52 },
                { id: 'en', text: 'Endotélio', sub: 'deixa de dilatar', color: CC.endo, at: at(ENDO_AT.x, ENDO_AT.y, 0.5), dx: -64, dy: -34 },
            ];
        default:
            return [
                { id: 'mu', text: 'Músculo espesso e fibrosado', color: CC.myo, at: at(VENT_X, -1.7, 0.8), dx: 64, dy: 86 },
                { id: 'po', text: 'Pós-carga alta', color: CC.artery, at: at(-2.2, 6.9), dx: 44, dy: 40 },
                { id: 'la', text: 'Átrio dilatado', sub: 'substrato de fibrilação atrial', color: CC.atrium, at: at(LA_CENTER.x, LA_CENTER.y + 0.6, 0.4), dx: 58, dy: 40 },
                { id: 'vi', text: 'Sangue viscoso', color: CC.cell, at: at(6.0, -3.2), dx: 60, dy: 70 },
                { id: 'pl', text: 'Placa', color: CC.plaque, at: at(PLAQUE_AT.x, PLAQUE_AT.y + 0.5, 0.4), dx: 50, dy: -62 },
            ];
    }
};

export const cardioLabelsForStep = (step: number): LabelSpec[] =>
    stepLabels(step).map(l => ({ ...l, big: true }));
