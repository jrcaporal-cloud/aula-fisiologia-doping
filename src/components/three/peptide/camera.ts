import * as THREE from 'three';
import type { StepData } from '../../../data/steps';

/*
 * Caminho da câmera: uma pose-chave por etapa (em T = k) e, se houver, uma intermediária (em T = k − 0,5).
 * `mirror` espelha o eixo x (o receptor de GHRH fica do lado direito da cena).
 */

export interface CameraPath {
    pos: (T: number, out: THREE.Vector3) => THREE.Vector3;
    tgt: (T: number, out: THREE.Vector3) => THREE.Vector3;
}

export const buildCameraPath = (steps: StepData[], mirror: boolean): CameraPath => {
    const sx = mirror ? -1 : 1;
    const v3 = (a: [number, number, number]) => new THREE.Vector3(a[0] * sx, a[1], a[2]);
    const keys: { t: number; p: THREE.Vector3; q: THREE.Vector3 }[] = [];
    steps.forEach((s, k) => {
        if (s.via) keys.push({ t: k - 0.5, p: v3(s.via.position), q: v3(s.via.target) });
        keys.push({ t: k, p: v3(s.cameraPosition), q: v3(s.cameraTarget) });
    });
    const last = steps.length - 1;
    const pos = new THREE.CatmullRomCurve3(keys.map(k => k.p), false, 'centripetal');
    const tgt = new THREE.CatmullRomCurve3(keys.map(k => k.q), false, 'centripetal');
    const n = keys.length - 1;
    const u = (T: number) => {
        const x = Math.min(Math.max(T, 0), last);
        let i = 0;
        while (i < n - 1 && keys[i + 1].t < x) i++;
        const span = keys[i + 1].t - keys[i].t || 1;
        return Math.min((i + (x - keys[i].t) / span) / n, 1);
    };
    return {
        pos: (T, out) => pos.getPoint(u(T), out),
        tgt: (T, out) => tgt.getPoint(u(T), out),
    };
};
