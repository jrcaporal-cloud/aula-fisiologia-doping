/**
 * Geometria fixa da cena (unidades de mundo). A membrana fica em y = 0:
 * acima = sangue/interstício, abaixo = citoplasma da fibra muscular.
 */

export interface Site {
    x: number;
    z: number;
}

export const MEMBRANE = {
    halfX: 8.2,
    halfZ: 2.6,
    headY: 0.34,
    spacing: 0.27,
    headRadius: 0.118,
} as const;

/** Receptores de insulina (IR-α/β). O índice LABELED recebe os rótulos da cascata. */
export const RECEPTORS: readonly Site[] = [
    { x: -4.4, z: 0.5 },
    { x: -1.3, z: 0.9 },
    { x: 1.8, z: -0.4 },
    { x: 4.8, z: 0.9 },
];
export const LABELED_RECEPTOR = 1;
/** Ordem em que os receptores vão sendo ocupados conforme a dose sobe. */
export const RECEPTOR_ORDER: readonly number[] = [1, 2, 0, 3];

/** Locais onde cada vesícula de GLUT4 se funde e vira canal. */
export const CHANNELS: readonly Site[] = [
    { x: -5.7, z: -0.6 },
    { x: -3.0, z: 1.1 },
    { x: 0.3, z: 0.0 },
    { x: 3.3, z: 1.1 },
    { x: 3.5, z: -1.5 },
    { x: 6.1, z: -0.1 },
];
export const LABELED_CHANNEL = 2;
/** Ordem da translocação (do centro para as bordas). */
export const CHANNEL_ORDER: readonly number[] = [2, 1, 3, 0, 4, 5];

/** Vesículas em repouso, no fundo do citoplasma, abaixo do seu local de fusão. */
export const VESICLE_REST: readonly [number, number, number][] = [
    [-5.2, -2.15, -0.3],
    [-2.6, -2.45, 0.1],
    [0.9, -2.3, 0.0],
    [2.7, -2.2, 0.5],
    [4.1, -2.1, -1.0],
    [5.8, -2.3, 0.0],
];

export const VESICLE_RADIUS = 0.44;
export const CHANNEL_RADIUS = 0.32;

/** Pontos da cascata de um receptor: quinase (dentro da membrana) → PI3K → Akt. */
export const cascadePoints = (s: Site) => ({
    kinase: [s.x, -0.72, s.z] as [number, number, number],
    pi3k: [s.x + 0.32, -1.38, s.z] as [number, number, number],
    akt: [s.x + 0.78, -2.0, s.z] as [number, number, number],
});

/** Bolsão onde a insulina encaixa, entre os braços α. */
export const POCKET_Y = 1.08;

export const BLOOD = { minY: 0.85, maxY: 2.5, halfX: 7.6, halfZ: 2.3 } as const;

/** Rosetas de glicogênio (partículas β) no citoplasma. */
export const GLYCOGEN_CENTERS: readonly [number, number, number][] = [
    [-5.9, -2.85, 1.3],
    [-4.3, -3.05, 1.8],
    [-2.4, -2.85, 1.4],
    [-0.6, -3.05, 1.9],
    [1.3, -2.85, 1.5],
    [3.1, -3.05, 1.8],
    [4.9, -2.85, 1.4],
    [6.5, -3.0, 1.1],
    [-1.4, -2.95, -0.6],
    [2.4, -2.95, -0.8],
];
export const GLYCOGEN_PER_ROSETTE = 9;

/** Gerador pseudoaleatório determinístico (render puro, sem Math.random). */
export const seeded = (seed: number) => {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
};
