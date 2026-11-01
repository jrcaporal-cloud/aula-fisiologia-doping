/*
 * Ligantes em bolas e varetas, gerados a partir das coordenadas 2D do esqueleto (comprimento de ligação = 1)
 * com leve relevo 3D. Hidrogênios omitidos. Topologia correta; geometria esquemática.
 */

export type Element = 'C' | 'O' | 'N' | 'F';
export type LigandKind = 'testosterona' | 'trembolona' | 'sarm';

export interface Atom { el: Element; p: [number, number, number] }
/** [índice a, índice b, ordem da ligação] */
export type Bond = [number, number, 1 | 2 | 3];
export interface MoleculeData { atoms: Atom[]; bonds: Bond[] }

export const CPK: Record<Element, string> = {
    C: '#5b616d', // carbono: cinza-escuro
    O: '#ff2a2a',
    N: '#3b5bff',
    F: '#8fe05a',
};
export const ATOM_R: Record<Element, number> = { C: 0.36, O: 0.4, N: 0.38, F: 0.34 };

/** Escala do desenho (unidades do mundo por comprimento de ligação). */
export const MOL_SCALE = 0.3;

// Classes alternadas do reticulado hexagonal → cadeira suave (+/−) nos anéis A, B e C.
const UP = 0.16;

/** Núcleo esteroide 6-6-6-5 (numeração clássica C1…C19). */
const steroid = (withC19: boolean, flatABC: boolean): MoleculeData => {
    const z = (k: number) => (flatABC ? k * 0.35 : k);
    const atoms: Atom[] = [
        { el: 'C', p: [0, 1, z(UP)] }, //            0  C1
        { el: 'C', p: [-0.866, 0.5, z(-UP)] }, //    1  C2
        { el: 'C', p: [-0.866, -0.5, UP * 0.3] }, // 2  C3 (sp2)
        { el: 'C', p: [0, -1, -UP * 0.3] }, //       3  C4 (sp2)
        { el: 'C', p: [0.866, -0.5, UP * 0.3] }, //  4  C5 (sp2)
        { el: 'C', p: [1.732, -1, z(-UP)] }, //      5  C6
        { el: 'C', p: [2.598, -0.5, z(UP)] }, //     6  C7
        { el: 'C', p: [2.598, 0.5, z(-UP)] }, //     7  C8
        { el: 'C', p: [1.732, 1, z(UP)] }, //        8  C9
        { el: 'C', p: [0.866, 0.5, z(-UP)] }, //     9  C10
        { el: 'C', p: [1.732, 2, z(-UP)] }, //       10 C11
        { el: 'C', p: [2.598, 2.5, z(UP)] }, //      11 C12
        { el: 'C', p: [3.464, 2, -UP] }, //          12 C13
        { el: 'C', p: [3.464, 1, UP] }, //           13 C14
        { el: 'C', p: [4.415, 0.691, 0.1] }, //      14 C15
        { el: 'C', p: [5.003, 1.5, -0.12] }, //      15 C16
        { el: 'C', p: [4.415, 2.309, 0.05] }, //     16 C17
        { el: 'C', p: [3.55, 2.45, 0.75] }, //       17 C18 (metila angular β)
        { el: 'O', p: [-1.732, -1.0, 0.05] }, //     18 O3 (3-ceto)
        { el: 'O', p: [4.88, 3.08, 0.42] }, //       19 O17 (17β-OH)
    ];
    const bonds: Bond[] = [
        // anel A
        [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 2], [4, 9, 1], [9, 0, 1],
        // anel B
        [4, 5, 1], [5, 6, 1], [6, 7, 1], [7, 8, 1], [8, 9, 1],
        // anel C
        [8, 10, 1], [10, 11, 1], [11, 12, 1], [12, 13, 1], [13, 7, 1],
        // anel D (5)
        [13, 14, 1], [14, 15, 1], [15, 16, 1], [16, 12, 1],
        // substituintes
        [12, 17, 1], [2, 18, 2], [16, 19, 1],
    ];
    if (withC19) {
        atoms.push({ el: 'C', p: [0.93, 0.95, 0.7] }); // 20 C19 (metila angular β sobre C10)
        bonds.push([9, 20, 1]);
    }
    return { atoms, bonds };
};

/** Testosterona: Δ4-3-ceto, 17β-OH, metilas C18 e C19. */
const TESTOSTERONE = steroid(true, false);

/** Trembolona: 19-nor (sem C19), duplas conjugadas 4,9 e 11 → núcleo mais plano. */
const TRENBOLONE = (() => {
    const m = steroid(false, true);
    const bonds = m.bonds.map((b): Bond => {
        const [a, c] = b;
        const key = `${Math.min(a, c)}-${Math.max(a, c)}`;
        if (key === '8-9' || key === '10-11') return [a, c, 2];
        return b;
    });
    return { atoms: m.atoms, bonds };
})();

/**
 * Ostarina (MK-2866), SARM não esteroidal — aproximação esquemática:
 * 4-ciano-3-(trifluorometil)fenil–NH–C(=O)–C(OH)(CH3)–CH2–O–(4-cianofenil).
 */
const OSTARINE: MoleculeData = (() => {
    const t = (x: number, y: number, zz = 0): [number, number, number] => [x, y, zz];
    // inclina o anel B para dar relevo
    const rb = (x: number, y: number): [number, number, number] => [x, y, 0.32 * (y - 1.7)];
    const atoms: Atom[] = [
        { el: 'C', p: t(4, 0, 0.1) }, //        0 a1 (liga N)
        { el: 'C', p: t(4.5, 0.866, 0.25) }, // 1 a2
        { el: 'C', p: t(5.5, 0.866, 0.25) }, // 2 a3 (CF3)
        { el: 'C', p: t(6, 0, 0.1) }, //        3 a4 (CN)
        { el: 'C', p: t(5.5, -0.866, -0.05) }, // 4 a5
        { el: 'C', p: t(4.5, -0.866, -0.05) }, // 5 a6
        { el: 'C', p: t(6, 1.732, 0.4) }, //    6 C do CF3
        { el: 'F', p: t(5.55, 2.6, 0.62) }, //  7
        { el: 'F', p: t(6.95, 2.05, 0.62) }, // 8
        { el: 'F', p: t(6.2, 2.1, -0.5) }, //   9
        { el: 'C', p: t(7, 0, 0.1) }, //        10 C≡N
        { el: 'N', p: t(7.85, 0, 0.1) }, //     11
        { el: 'N', p: t(3.5, -0.866, 0) }, //   12 NH amida
        { el: 'C', p: t(2.5, -0.866, 0) }, //   13 C=O
        { el: 'O', p: t(2.0, -1.732, 0) }, //   14
        { el: 'C', p: t(2.0, 0, 0) }, //        15 C quaternário
        { el: 'C', p: t(2.4, 0.4, -0.85) }, //  16 CH3
        { el: 'O', p: t(2.45, 0.35, 0.82) }, // 17 OH
        { el: 'C', p: t(1.5, 0.866, 0) }, //    18 CH2
        { el: 'O', p: t(0.5, 0.866, 0) }, //    19 O éter
        { el: 'C', p: rb(0, 1.732) }, //        20 b1
        { el: 'C', p: rb(0.5, 2.598) }, //      21 b2
        { el: 'C', p: rb(0, 3.464) }, //        22 b3
        { el: 'C', p: rb(-1, 3.464) }, //       23 b4 (CN)
        { el: 'C', p: rb(-1.5, 2.598) }, //     24 b5
        { el: 'C', p: rb(-1, 1.732) }, //       25 b6
        { el: 'C', p: rb(-1.5, 4.33) }, //      26 C≡N
        { el: 'N', p: rb(-1.93, 5.07) }, //     27
    ];
    const bonds: Bond[] = [
        [0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
        [2, 6, 1], [6, 7, 1], [6, 8, 1], [6, 9, 1],
        [3, 10, 1], [10, 11, 3],
        [0, 12, 1], [12, 13, 1], [13, 14, 2], [13, 15, 1],
        [15, 16, 1], [15, 17, 1], [15, 18, 1], [18, 19, 1], [19, 20, 1],
        [20, 21, 2], [21, 22, 1], [22, 23, 2], [23, 24, 1], [24, 25, 2], [25, 20, 1],
        [23, 26, 1], [26, 27, 3],
    ];
    return { atoms, bonds };
})();

const center = (m: MoleculeData, scale: number): MoleculeData => {
    const c = [0, 0, 0];
    m.atoms.forEach(a => { c[0] += a.p[0]; c[1] += a.p[1]; c[2] += a.p[2]; });
    const k = 1 / m.atoms.length;
    return {
        bonds: m.bonds,
        atoms: m.atoms.map(a => ({
            el: a.el,
            p: [(a.p[0] - c[0] * k) * scale, (a.p[1] - c[1] * k) * scale, (a.p[2] - c[2] * k) * scale],
        })),
    };
};

export const MOLECULES: Record<LigandKind, MoleculeData> = {
    testosterona: center(TESTOSTERONE, MOL_SCALE),
    trembolona: center(TRENBOLONE, MOL_SCALE),
    sarm: center(OSTARINE, MOL_SCALE * 0.82),
};
