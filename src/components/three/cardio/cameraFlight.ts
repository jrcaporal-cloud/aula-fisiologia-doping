import { CARDIO_STEPS } from '../../../data/cardioSteps';
import type { StepData } from '../../../data/steps';
import { buildCameraPath, type CameraPath } from '../peptide/camera';
import type { Pin } from './selection';
import { STRUCTURES, type Pose, type Vec3 } from './structures';

/*
 * Voos de câmera fora da trilha das etapas (fixar uma estrutura, voltar à pose da etapa). Reaproveitam
 * a spline de `buildCameraPath`: uma trilha de dois pontos-chave (de onde a câmera está → destino)
 * com um ponto intermediário que abre um arco curto, para o voo parecer um deslize e não uma reta.
 */

/** Pose da câmera da etapa (a mesma que a trilha das etapas assenta em T = etapa). */
export const stepPose = (step: number): Pose => ({
    pos: CARDIO_STEPS[step].cameraPosition,
    tgt: CARDIO_STEPS[step].cameraTarget,
});

/** Distância e altura do close-up da hemácia clicada (a hemácia anda; o alvo é o ponto do clique). */
const CELL_BACK = 6.8;
const CELL_UP = 0.9;
/** A câmera nunca entra na cena pela frente: o circuito vive em z ∈ [−4, 3,4]. */
const MIN_Z = 8;

/** Pose do close-up de uma estrutura fixada. Só a hemácia usa o ponto do clique. */
export const poseOfPin = (pin: Pin): Pose => {
    const base = STRUCTURES[pin.id].pose;
    if (pin.id !== 'hemacia' || !pin.point) return base;
    const [x, y, z] = pin.point;
    return { pos: [x + 0.5, y + CELL_UP, Math.max(z + CELL_BACK, MIN_Z)], tgt: [x, y, z] };
};

const avg = (a: Vec3, b: Vec3): [number, number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
const dist = (a: Vec3, b: Vec3) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

const keyStep = (id: number, pose: Pose, via?: Pose): StepData => ({
    id,
    badge: '',
    title: '',
    short: '',
    description: '',
    cameraPosition: [pose.pos[0], pose.pos[1], pose.pos[2]],
    cameraTarget: [pose.tgt[0], pose.tgt[1], pose.tgt[2]],
    via: via && { position: [via.pos[0], via.pos[1], via.pos[2]], target: [via.tgt[0], via.tgt[1], via.tgt[2]] },
});

/** Ponto intermediário do voo: no meio do caminho, afastado do alvo (≈12% do deslocamento) e um pouco acima. */
export const midPose = (from: Pose, to: Pose): Pose => {
    const tgt = avg(from.tgt, to.tgt);
    const pos = avg(from.pos, to.pos);
    const away = [pos[0] - tgt[0], pos[1] - tgt[1], pos[2] - tgt[2]];
    const len = Math.hypot(away[0], away[1], away[2]) || 1;
    const lift = 0.12 * dist(from.pos, to.pos);
    return {
        pos: [pos[0] + (away[0] / len) * lift, pos[1] + (away[1] / len) * lift + lift * 0.35, pos[2] + (away[2] / len) * lift],
        tgt,
    };
};

/** Trilha do voo, com T indo de 0 (partida) a 1 (chegada). */
export const flightPath = (from: Pose, to: Pose): CameraPath =>
    buildCameraPath([keyStep(0, from), keyStep(1, to, midPose(from, to))], false);
