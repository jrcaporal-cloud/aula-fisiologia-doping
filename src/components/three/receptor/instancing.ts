import * as THREE from 'three';

/**
 * Fecha a escrita de uma malha instanciada que foi preenchida só com as instâncias visíveis, em
 * sequência: desenha as `n` primeiras, sobe para a GPU só esse trecho e invalida a esfera envolvente
 * (recalculada com o novo count apenas se houver raycast).
 */
export const commitInstances = (m: THREE.InstancedMesh, n: number): void => {
    m.count = n;
    m.boundingSphere = null;
    m.instanceMatrix.clearUpdateRanges();
    if (n > 0) m.instanceMatrix.addUpdateRange(0, n * 16);
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) {
        m.instanceColor.clearUpdateRanges();
        if (n > 0) m.instanceColor.addUpdateRange(0, n * 3);
        m.instanceColor.needsUpdate = true;
    }
};

/** Raycast que ignora o alvo quando ele ou algum ancestral está oculto (o three não olha `visible`). */
export function raycastIfShown(this: THREE.Mesh, raycaster: THREE.Raycaster, hits: THREE.Intersection[]): void {
    if (!this.visible) return;
    for (let o = this.parent; o; o = o.parent) if (!o.visible) return;
    THREE.Mesh.prototype.raycast.call(this, raycaster, hits);
}

/** Cursor escrito direto no canvas (sem estado do React). */
export const setCanvasCursor = (el: HTMLElement, cursor: string): void => {
    el.style.cursor = cursor;
};
