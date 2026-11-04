import * as THREE from 'three';
import { clamp01, lerp, smooth } from '../receptor/layout';
import { BASE_Y, FLOW_NODES, PLAQUE_U, PLAQUE_W, VENT_X, type Kind } from './layout';
import { pulseWave, radialShrink, longShrink, type CardioParams, type CycleState } from './params';

/*
 * O circuito amostrado: uma curva fechada que passa pelo centro de cada trecho. A mesma tabela serve
 * para desenhar os tubos e para andar com as hemácias, de modo que célula e parede nunca discordam.
 * Tudo aqui é função pura dos parâmetros + do ciclo; nada aloca por quadro.
 */

export const SAMPLES = 460;

export interface FlowSample {
    p: THREE.Vector3;
    /** Normal e binormal do quadro de Frenet (para montar o anel do tubo e deslocar a célula). */
    n: THREE.Vector3;
    b: THREE.Vector3;
    r0: number;
    kind: Kind;
    /** Posição dentro do próprio trecho (0 = entrada, 1 = saída). */
    localU: number;
    /** Comprimento (mundo) até a próxima amostra. */
    len: number;
}

const CURVE = new THREE.CatmullRomCurve3(FLOW_NODES.map(n => n.p), true, 'centripetal');

/** Geometria de referência da cavidade com que os nós do circuito foram desenhados. */
const REF_RCAV = 2.21;
const REF_HCAV = 3.32;
const REF_YC = 1.045;

const buildSamples = (): FlowSample[] => {
    const nodes = FLOW_NODES.length;
    const frames = CURVE.computeFrenetFrames(SAMPLES, true);
    const out: FlowSample[] = Array.from({ length: SAMPLES }, (_, i) => {
        const u = i / SAMPLES;
        const idx = u * nodes;
        const i0 = Math.min(Math.floor(idx), nodes - 1);
        const i1 = (i0 + 1) % nodes;
        const k = idx - i0;
        return {
            p: CURVE.getPoint(u, new THREE.Vector3()),
            n: frames.normals[i].clone(),
            b: frames.binormals[i].clone(),
            r0: lerp(FLOW_NODES[i0].r, FLOW_NODES[i1].r, k),
            kind: FLOW_NODES[i0].kind,
            localU: 0,
            len: 0,
        };
    });
    // comprimentos e posição relativa dentro de cada trecho
    out.forEach((s, i) => { s.len = s.p.distanceTo(out[(i + 1) % SAMPLES].p); });
    const counts = new Map<Kind, number>();
    out.forEach(s => counts.set(s.kind, (counts.get(s.kind) ?? 0) + 1));
    const seen = new Map<Kind, number>();
    out.forEach(s => {
        const i = seen.get(s.kind) ?? 0;
        seen.set(s.kind, i + 1);
        s.localU = i / Math.max((counts.get(s.kind) ?? 1) - 1, 1);
    });
    return out;
};

export const FLOW: readonly FlowSample[] = buildSamples();

/** Primeira e última amostra de um trecho (os trechos são contíguos na ordem do fluxo). */
export const rangeOf = (kind: Kind): [number, number] => {
    let a = -1;
    let b = -1;
    FLOW.forEach((s, i) => {
        if (s.kind !== kind) return;
        if (a < 0) a = i;
        b = i;
    });
    return [a, b];
};

/** Sino em torno de 0 com meia-largura 1 (lesão, turbulência pós-estenótica). */
const hump = (x: number) => {
    const k = clamp01(1 - Math.abs(x));
    return smooth(k);
};

/** Quanto a lesão estreita o lúmen na amostra i (0…1). */
export const stenosisAt = (i: number, p: CardioParams): number => {
    const s = FLOW[i];
    if (s.kind !== 'arteria') return 0;
    return 0.62 * p.v.placa * hump((s.localU - PLAQUE_U) / PLAQUE_W);
};

/** Onda de pressão na amostra i: chega mais tarde quanto mais longe da raiz da aorta. */
export const pulseAt = (i: number, cy: CycleState): number => {
    const s = FLOW[i];
    if (s.kind !== 'aorta' && s.kind !== 'arteria') return 0;
    const dist = s.kind === 'aorta' ? s.localU * 0.45 : 0.45 + s.localU * 0.55;
    return pulseWave(cy.c - dist * 0.2);
};

/** Raio do vaso na amostra i: distensão média pela pressão, pulso e estreitamento pela placa. */
export const radiusAt = (i: number, p: CardioParams, cy: CycleState): number => {
    const s = FLOW[i];
    const mean = (p.v.paSist + 2 * p.v.paDiast) / 3;
    if (s.kind === 'aorta' || s.kind === 'arteria') {
        const stretch = 1 + 0.055 * clamp01((mean - 88) / 40);
        // a rigidez é parte do achado: mais pressão, menos pulso na parede
        const amp = 0.14 * (1 - p.rigidez);
        return s.r0 * stretch * (1 + amp * pulseAt(i, cy)) * (1 - stenosisAt(i, p));
    }
    if (s.kind === 'veia') return s.r0 * (1 + 0.02 * Math.sin(cy.c * Math.PI * 2));
    return s.r0;
};

/** Turbulência depois do estreitamento: o jato se desorganiza. */
export const swirlAt = (i: number, p: CardioParams): number => {
    const s = FLOW[i];
    if (s.kind !== 'arteria') return 0;
    return p.v.placa * hump((s.localU - (PLAQUE_U + PLAQUE_W * 1.5)) / 0.22);
};

const V_BASE: Record<Kind, number> = {
    cavidade: 4.6, aorta: 7.4, arteria: 6.2, arteriola: 1.25, veia: 3.0, pulmonar: 3.4,
};
/** Expoente da viscosidade: o vaso pequeno é o que mais sofre com sangue espesso. */
const V_VISC: Record<Kind, number> = {
    cavidade: 0.25, aorta: 0.35, arteria: 0.5, arteriola: 1.6, veia: 0.6, pulmonar: 0.6,
};

/** Velocidade (unidades do mundo por segundo) na amostra i. */
export const speedAt = (i: number, p: CardioParams, cy: CycleState): number => {
    const s = FLOW[i];
    const mean = (p.v.paSist + 2 * p.v.paDiast) / 3;
    let v = V_BASE[s.kind] * Math.pow(p.v.viscosidade, -V_VISC[s.kind]);
    v *= 0.8 + 0.4 * clamp01((mean - 88) / 40);
    if (s.kind === 'aorta' || s.kind === 'arteria') {
        v *= 0.3 + 1.7 * pulseAt(i, cy);
        // continuidade: no estreitamento o mesmo fluxo passa mais rápido
        const nar = 1 - stenosisAt(i, p);
        v *= Math.min(1 / (nar * nar), 3.4);
    }
    if (s.kind === 'cavidade') {
        // metade da entrada obedece ao enchimento; metade da saída, à ejeção
        v *= s.localU < 0.5 ? 0.38 + 1.8 * cy.inflow : 0.38 + 2.1 * cy.outflow;
    }
    return v;
};

/** Desloca a amostra da cavidade para a geometria atual do ventrículo (ela encolhe no ciclo). */
export const cavityPoint = (i: number, p: CardioParams, cy: CycleState, out: THREE.Vector3): THREE.Vector3 => {
    const s = FLOW[i];
    out.copy(s.p);
    const w = clamp01((BASE_Y - s.p.y) / 0.9);
    if (w <= 0) return out;
    const sx = lerp(1, (p.rCav * radialShrink(cy.volRatio)) / REF_RCAV, w);
    const sy = lerp(1, (p.hCav * longShrink(cy.volRatio)) / REF_HCAV, w);
    out.x = VENT_X + (s.p.x - VENT_X) * sx;
    out.y = lerp(p.yc, REF_YC, 1 - w) + (s.p.y - REF_YC) * sy;
    out.z = s.p.z * sx;
    return out;
};

/** Ponto do eixo do circuito na amostra i, já na geometria atual. */
export const axisPoint = (i: number, p: CardioParams, cy: CycleState, out: THREE.Vector3): THREE.Vector3 =>
    FLOW[i].kind === 'cavidade' ? cavityPoint(i, p, cy, out) : out.copy(FLOW[i].p);

/**
 * Tabela do quadro: eixo, raio, velocidade e turbulência de cada amostra, calculados uma vez por
 * quadro. Parede e hemácias leem daqui — assim a célula nunca aparece fora do vaso.
 */
export interface FlowFrame {
    ax: Float32Array;
    rad: Float32Array;
    spd: Float32Array;
    swl: Float32Array;
}

export const makeFlowFrame = (): FlowFrame => ({
    ax: new Float32Array(SAMPLES * 3),
    rad: new Float32Array(SAMPLES),
    spd: new Float32Array(SAMPLES),
    swl: new Float32Array(SAMPLES),
});

const scratch = new THREE.Vector3();

/** Estado do circuito num quadro: calculado uma vez e lido por todos os componentes da cena. */
export interface CardioState { p: CardioParams; cy: CycleState; f: FlowFrame }
export type CardioStateRef = { readonly current: CardioState };

export const writeFlowFrame = (f: FlowFrame, p: CardioParams, cy: CycleState): void => {
    for (let i = 0; i < SAMPLES; i++) {
        axisPoint(i, p, cy, scratch);
        f.ax[i * 3] = scratch.x;
        f.ax[i * 3 + 1] = scratch.y;
        f.ax[i * 3 + 2] = scratch.z;
        f.rad[i] = radiusAt(i, p, cy);
        f.spd[i] = speedAt(i, p, cy);
        f.swl[i] = swirlAt(i, p);
    }
};
