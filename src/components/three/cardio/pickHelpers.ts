import * as THREE from 'three';
import { BASE_Y } from './layout';

/*
 * Ajudas de seleção por ponteiro.
 *
 * Hemácia. Ela é pequena, anda rápido e fica dentro de tubos translúcidos: o raio do mouse
 * acerta a parede do vaso antes (e a hemácia quase nunca era apontada). Duas coisas resolvem:
 *  - `cellRaycast`: acerto por proximidade (tolerância em pixels) em vez de pela malha achatada;
 *  - `cellsFirst`: filtro de ordem do R3F — a hemácia passa à frente da parede translúcida, mas não
 *    à frente de algo opaco (miocárdio, placa, valvas), que a esconderia de verdade.
 */

/** Marca na `userData` dos objetos: 'cell' = hemácias; 'solid' = opaco, esconde o que está atrás. */
export type PickKind = 'cell' | 'solid';

/** Tolerância do clique sobre a hemácia, em pixels de tela. */
const PICK_PX = 3.5;
/** Piso da tolerância em unidades do mundo (a hemácia tem raio ~0,1): de perto, vale o tamanho real dela. */
const PICK_MIN = 0.1;

const P = new THREE.Vector3();

interface CanvasInfo { fov: number; height: number }

/** Cria o `raycast` de uma malha instanciada de hemácias; `info` devolve o fov e a altura do canvas. */
export const makeCellRaycast = (info: () => CanvasInfo) =>
    function cellRaycast(this: THREE.InstancedMesh, raycaster: THREE.Raycaster, hits: THREE.Intersection[]): void {
        const { fov, height } = info();
        const worldPerPx = (2 * Math.tan((fov * Math.PI) / 360)) / Math.max(height, 1);
        const arr = this.instanceMatrix.array;
        const ray = raycaster.ray;
        let best = -1;
        let bestDist = Infinity;
        for (let i = 0; i < this.count; i++) {
            const o = i * 16;
            if (arr[o] === 0) continue; // célula apagada pelo hematócrito (matriz de escala zero)
            P.set(arr[o + 12], arr[o + 13], arr[o + 14]);
            const dist = ray.origin.distanceTo(P);
            const tol = Math.max(PICK_MIN, dist * worldPerPx * PICK_PX);
            if (ray.distanceSqToPoint(P) > tol * tol || dist >= bestDist) continue;
            best = i;
            bestDist = dist;
        }
        if (best < 0) return;
        P.set(arr[best * 16 + 12], arr[best * 16 + 13], arr[best * 16 + 14]);
        hits.push({ distance: bestDist, point: P.clone(), object: this, instanceId: best });
    };

/** A marca pode estar no próprio objeto ou num grupo acima dele (valvas). */
const kindOf = (h: THREE.Intersection): PickKind | undefined => {
    for (let o: THREE.Object3D | null = h.object; o; o = o.parent) {
        const pick = (o.userData as { pick?: PickKind }).pick;
        if (pick) return pick;
    }
    return undefined;
};

/** Move a primeira hemácia atingida para a frente, desde que nenhum objeto opaco venha antes dela. */
export const cellsFirst = (hits: THREE.Intersection[]): THREE.Intersection[] => {
    const i = hits.findIndex(h => kindOf(h) === 'cell');
    if (i <= 0) return hits;
    for (let k = 0; k < i; k++) if (kindOf(hits[k]) === 'solid') return hits;
    return [hits[i], ...hits.slice(0, i), ...hits.slice(i + 1)];
};

/** Raycast que ignora malhas ocultas (a placa some nas etapas iniciais, mas mantém as matrizes antigas). */
export function visibleRaycast(this: THREE.InstancedMesh, raycaster: THREE.Raycaster, hits: THREE.Intersection[]): void {
    if (this.visible) THREE.InstancedMesh.prototype.raycast.call(this, raycaster, hits);
}

/** Objeto sem acerto de ponteiro (contornos e fantasmas por cima da cena). */
export const noRaycast = (): void => undefined;

const scratch: THREE.Intersection[] = [];

/**
 * Raycast da cavidade: o elipsoide de sangue passa um pouco do plano das valvas e cobriria a mitral e
 * a aórtica. Acertos acima do plano são descartados, e as valvas voltam a poder ser apontadas.
 */
export function belowBaseRaycast(this: THREE.Mesh, raycaster: THREE.Raycaster, hits: THREE.Intersection[]): void {
    scratch.length = 0;
    THREE.Mesh.prototype.raycast.call(this, raycaster, scratch);
    for (const h of scratch) if (h.point.y <= BASE_Y + 0.02) hits.push(h);
}
