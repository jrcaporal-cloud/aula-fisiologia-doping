/**
 * Geometria das três engrenagens do stack. Módulo único (mesmo passo de dente) para que
 * engrenem de verdade: raio primitivo = módulo × dentes / 2, e as fases são calculadas
 * para que dente encaixe em vão no ponto de contato.
 */

export const MODULE = 12;

export interface GearSpec {
    readonly teeth: number;
    readonly cx: number;
    readonly cy: number;
    /** Raio primitivo. */
    readonly r: number;
    /** Fase inicial (rad) para engrenar com a vizinha. */
    readonly phase: number;
    /** Sentido e razão de giro em relação à engrenagem 1. */
    readonly ratio: number;
}

const pitchRadius = (teeth: number): number => (MODULE * teeth) / 2;

const mod = (v: number, m: number): number => ((v % m) + m) % m;

interface Placement {
    readonly teeth: readonly [number, number, number];
    readonly c1: readonly [number, number];
    /** Direção (rad) do centro 1 → centro 2. */
    readonly a12: number;
    /** Direção (rad) do centro 2 → centro 3. */
    readonly a23: number;
}

/** Monta as três engrenagens em cadeia (1 ↔ 2 ↔ 3) com fases de engrenamento corretas. */
export const buildGears = ({ teeth, c1, a12, a23 }: Placement): readonly [GearSpec, GearSpec, GearSpec] => {
    const [n1, n2, n3] = teeth;
    const [r1, r2, r3] = teeth.map(pitchRadius);
    const c2: [number, number] = [c1[0] + (r1 + r2) * Math.cos(a12), c1[1] + (r1 + r2) * Math.sin(a12)];
    const c3: [number, number] = [c2[0] + (r2 + r3) * Math.cos(a23), c2[1] + (r2 + r3) * Math.sin(a23)];

    // 1 tem um dente apontando para 2; 2 tem um vão apontando para 1.
    const p1 = a12;
    const p2 = a12 + Math.PI - Math.PI / n2;
    // Quanto 2 precisa girar (para trás) até um dente seu apontar para 3.
    const e = mod(p2 - a23, (2 * Math.PI) / n2);
    const p3 = a23 + Math.PI - (e * n2) / n3 - Math.PI / n3;

    return [
        { teeth: n1, cx: c1[0], cy: c1[1], r: r1, phase: p1, ratio: 1 },
        { teeth: n2, cx: c2[0], cy: c2[1], r: r2, phase: p2, ratio: -n1 / n2 },
        { teeth: n3, cx: c3[0], cy: c3[1], r: r3, phase: p3, ratio: n1 / n3 },
    ];
};

const pt = (r: number, a: number): string => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;

/** Contorno de engrenagem centrado na origem, dente 0 apontando para o ângulo 0. */
export const gearPath = (teeth: number, r: number): string => {
    const outer = r + MODULE * 0.9;
    const root = r - MODULE * 1.05;
    const pitch = (2 * Math.PI) / teeth;
    const wRoot = pitch * 0.3;
    const wTip = pitch * 0.17;
    let d = '';
    for (let k = 0; k < teeth; k++) {
        const a = k * pitch;
        const start = a - wRoot;
        d += k === 0 ? `M${pt(root, start)}` : ` A${root} ${root} 0 0 1 ${pt(root, start)}`;
        d += ` L${pt(outer, a - wTip)} A${outer} ${outer} 0 0 1 ${pt(outer, a + wTip)} L${pt(root, a + wRoot)}`;
    }
    d += ` A${root} ${root} 0 0 1 ${pt(root, -wRoot)} Z`;
    return d;
};

/** Ponto de contato entre duas engrenagens (sobre a linha de centros, no raio primitivo da primeira). */
export const contactPoint = (a: GearSpec, b: GearSpec): [number, number] => {
    const ang = Math.atan2(b.cy - a.cy, b.cx - a.cx);
    return [a.cx + a.r * Math.cos(ang), a.cy + a.r * Math.sin(ang)];
};

const DEG = 180 / Math.PI;

/** Atributo `transform` de uma engrenagem girada `spin` rad (referência: engrenagem 1). */
export const gearTransform = (g: GearSpec, spin: number): string =>
    `translate(${g.cx} ${g.cy}) rotate(${((g.phase + spin * g.ratio) * DEG).toFixed(3)})`;
