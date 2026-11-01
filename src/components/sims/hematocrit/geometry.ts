import * as THREE from 'three';

/** Raio interno do lúmen e comprimento do trecho de vaso simulado (unidades da cena). */
export const LUMEN_R = 1.45;
export const VESSEL_LEN = 13;
export const HALF_LEN = VESSEL_LEN / 2;
export const WALL_THICKNESS = 0.16;
/** Escala da hemácia (geometria de raio 1). */
export const CELL_SCALE = 0.28;
/** Posição do microtrombo ao longo do vaso. */
export const THROMBUS_X = 1.5;
export const THROMBUS_HALF = 0.72;

/** Hemácia: disco bicôncavo por revolução do perfil de Evans–Fung simplificado. */
export const makeErythrocyteGeometry = (radialSegments = 30, profileSteps = 14) => {
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= profileSteps; i++) {
        const t = i / profileSteps;
        const h = 0.5 * Math.sqrt(Math.max(1 - t * t, 0)) * (0.2 + 2.0 * t * t - 1.1 * t ** 4);
        points.push(new THREE.Vector2(t, Math.max(h, 0.035)));
    }
    for (let i = profileSteps; i >= 0; i--) points.push(new THREE.Vector2(points[i].x, -points[i].y));
    const geo = new THREE.LatheGeometry(points, radialSegments);
    geo.computeVertexNormals();
    return geo;
};

/** Gerador pseudoaleatório determinístico (mesma cena a cada carga). */
export const seeded = (seed: number) => {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
};
