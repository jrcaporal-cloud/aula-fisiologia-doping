import * as THREE from 'three';
import { clamp01, lerp, smooth } from '../receptor/layout';
import { STENOSIS_PER_PLAQUE } from './lab/labModel';
import {
    BASE_Y, FLOW_NODES, HEART_KINDS, LA, PLAQUE_U, PLAQUE_W, RA, RV_SEPTUM_X, toLocal, toWorld, type Kind,
} from './layout';
import { pulseWave, radialShrink, longShrink, type CardioParams, type CycleState } from './params';

/*
 * O circuito amostrado: uma curva fechada que passa pelo centro de cada trecho. A mesma tabela serve
 * para desenhar os tubos e para andar com as hemácias, de modo que célula e parede nunca discordam.
 *
 * Cada amostra tem um quadro "do corte": `s` fica no plano do corte coronal (aponta para uma borda de
 * corte do vaso) e `k` aponta para trás (−z). A metade de trás do vaso é o arco de `s` a `−s`
 * passando por `k`. Dentro do coração, o caminho acompanha a câmara que contrai.
 * Tudo aqui é função pura dos parâmetros + do ciclo; nada aloca por quadro.
 */

export const SAMPLES = 520;

export interface FlowSample {
    p: THREE.Vector3;
    /** Ponto no referencial do coração (só nos trechos dentro dele). */
    local: THREE.Vector3;
    s: THREE.Vector3;
    k: THREE.Vector3;
    r0: number;
    kind: Kind;
    /** Posição dentro do próprio trecho (0 = entrada, 1 = saída). */
    localU: number;
    /** Comprimento (mundo) até a próxima amostra. */
    len: number;
}

const CURVE = new THREE.CatmullRomCurve3(FLOW_NODES.map(n => n.p), true, 'centripetal');
const Z = new THREE.Vector3(0, 0, 1);

/** Quadro do corte: `s` no plano frontal, perpendicular ao fluxo; `k` para trás. */
const cutFrame = (t: THREE.Vector3, s: THREE.Vector3, k: THREE.Vector3) => {
    s.crossVectors(t, Z);
    if (s.lengthSq() < 1e-6) s.set(1, 0, 0);
    s.normalize();
    k.crossVectors(t, s).normalize();
    if (k.z > 0) k.negate();
};

const buildSamples = (): FlowSample[] => {
    const tan = new THREE.Vector3();
    const out: FlowSample[] = Array.from({ length: SAMPLES }, (_, i) => {
        const u = i / SAMPLES;
        const p = CURVE.getPointAt(u, new THREE.Vector3());
        CURVE.getTangentAt(u, tan);
        const s = new THREE.Vector3();
        const k = new THREE.Vector3();
        cutFrame(tan, s, k);
        return {
            p, s, k,
            local: toLocal(p, new THREE.Vector3()),
            r0: 1,
            kind: FLOW_NODES[0].kind,
            localU: 0,
            len: 0,
        };
    });
    assignSegments(out);
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

/**
 * Trecho e raio de referência de cada amostra: a curva é reparametrizada por comprimento, então
 * cada amostra herda o trecho do nó que a precede ao longo da curva e o raio interpolado até o próximo.
 */
const assignSegments = (out: FlowSample[]) => {
    const nodes = FLOW_NODES.length;
    // posição (em amostras) de cada nó ao longo da curva
    const at = FLOW_NODES.map(n => {
        let best = 0;
        let bestD = Infinity;
        out.forEach((s, i) => { const d = s.p.distanceToSquared(n.p); if (d < bestD) { bestD = d; best = i; } });
        return best;
    });
    for (let j = 0; j < nodes; j++) {
        const a = at[j];
        const b = at[(j + 1) % nodes];
        const len = (b - a + SAMPLES) % SAMPLES;
        const n0 = FLOW_NODES[j];
        const n1 = FLOW_NODES[(j + 1) % nodes];
        for (let d = 0; d < len; d++) {
            const s = out[(a + d) % SAMPLES];
            s.kind = n0.kind;
            s.r0 = lerp(n0.r, n1.r, d / len);
        }
    }
};

export const FLOW: readonly FlowSample[] = buildSamples();

/** Primeira e última amostra de um trecho (os trechos são contíguos na ordem do fluxo). */
export const rangeOf = (kind: Kind): [number, number] => {
    const idx = FLOW.map((s, i) => (s.kind === kind ? i : -1)).filter(i => i >= 0);
    // trecho que atravessa o índice 0: começa depois do buraco
    for (let j = 1; j < idx.length; j++) if (idx[j] !== idx[j - 1] + 1) return [idx[j], idx[j - 1] + SAMPLES];
    return [idx[0], idx[idx.length - 1]];
};

/** Índice de amostra dentro de [0, SAMPLES). */
export const wrap = (i: number): number => ((i % SAMPLES) + SAMPLES) % SAMPLES;

/** Sino em torno de 0 com meia-largura 1 (lesão, turbulência pós-estenótica). */
const hump = (x: number) => smooth(clamp01(1 - Math.abs(x)));

/** Quanto a lesão estreita o lúmen na amostra i (0…1), no ponto mais apertado da seção. */
export const stenosisAt = (i: number, p: CardioParams): number => {
    const s = FLOW[i];
    if (s.kind !== 'arteria') return 0;
    return STENOSIS_PER_PLAQUE * p.v.placa * hump((s.localU - PLAQUE_U) / PLAQUE_W);
};

/** Onda de pressão na amostra i: chega mais tarde quanto mais longe da raiz da aorta. */
export const pulseAt = (i: number, cy: CycleState): number => {
    const s = FLOW[i];
    if (s.kind !== 'aorta' && s.kind !== 'arteria') return 0;
    const dist = s.kind === 'aorta' ? s.localU * 0.45 : 0.45 + s.localU * 0.55;
    return pulseWave(cy.c - dist * 0.2);
};

/** Raio da luz na amostra i: distensão média pela pressão e pulso (a placa estreita à parte). */
export const radiusAt = (i: number, p: CardioParams, cy: CycleState): number => {
    const s = FLOW[i];
    const mean = (p.v.paSist + 2 * p.v.paDiast) / 3;
    if (s.kind === 'aorta' || s.kind === 'arteria') {
        const stretch = 1 + 0.055 * clamp01((mean - 88) / 40);
        // a rigidez é parte do achado: mais pressão, menos pulso na parede
        const amp = 0.14 * (1 - p.rigidez);
        return s.r0 * stretch * (1 + amp * pulseAt(i, cy));
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
    aorta: 7.4, arteria: 6.2, arteriola: 1.25, veia: 3.0, atrioD: 2.6, vd: 4.0, pulmonar: 4.2, atrioE: 2.6, cavidade: 4.6,
};
/** Expoente da viscosidade: o vaso pequeno é o que mais sofre com sangue espesso. */
const V_VISC: Record<Kind, number> = {
    aorta: 0.35, arteria: 0.5, arteriola: 1.6, veia: 0.6, atrioD: 0.3, vd: 0.25, pulmonar: 0.6, atrioE: 0.3, cavidade: 0.25,
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
        const open = 1 - stenosisAt(i, p);
        v *= Math.min(1 / (open * open), 3.4);
    }
    if (s.kind === 'cavidade' || s.kind === 'vd') {
        // metade da entrada obedece ao enchimento; metade da saída, à ejeção
        v *= s.localU < 0.5 ? 0.38 + 1.8 * cy.inflow : 0.38 + 2.1 * cy.outflow;
    }
    if (s.kind === 'atrioE' || s.kind === 'atrioD') v *= 0.5 + 1.4 * cy.inflow;
    return v;
};

/** Geometria de referência com que os nós da cavidade foram desenhados (VE do treinado). */
const REF_RCAV = 2.3375;
const REF_HCAV = 3.506;
const REF_YC = 0.973;

const scratchL = new THREE.Vector3();

/** Escala dos átrios no quadro (o empurrão atrial encolhe, o enchimento enche). */
export const atrialScale = (cy: CycleState): number => 1 - 0.07 * cy.atrial + 0.025 * cy.inflow;
/** O VD contrai junto, com menos amplitude. */
export const rvShrink = (cy: CycleState): number => Math.pow(radialShrink(cy.volRatio), 0.7);

/** Ponto do eixo do circuito na amostra i, já na geometria atual (mundo). */
export const axisPoint = (i: number, p: CardioParams, cy: CycleState, out: THREE.Vector3): THREE.Vector3 => {
    const s = FLOW[i];
    if (!HEART_KINDS.has(s.kind)) return out.copy(s.p);
    const l = scratchL.copy(s.local);
    if (s.kind === 'cavidade') {
        const w = clamp01((BASE_Y - l.y) / 0.9);
        if (w > 0) {
            const sx = lerp(1, (p.rCav * radialShrink(cy.volRatio)) / REF_RCAV, w);
            const sy = lerp(1, (p.hCav * longShrink(cy.volRatio)) / REF_HCAV, w);
            l.x *= sx;
            l.y = lerp(p.yc, REF_YC, 1 - w) + (l.y - REF_YC) * sy;
            l.z *= sx;
        }
    } else if (s.kind === 'vd') {
        // a parede livre vem em direção ao septo
        const w = clamp01((BASE_Y - l.y) / 0.9);
        l.x = RV_SEPTUM_X + (l.x - RV_SEPTUM_X) * lerp(1, rvShrink(cy), w);
    } else {
        const a = s.kind === 'atrioE' ? LA : RA;
        const k = atrialScale(cy);
        l.x = a.x + (l.x - a.x) * k;
        l.y = a.y + (l.y - a.y) * k;
    }
    return toWorld(l.x, l.y, l.z, out);
};

/**
 * Tabela do quadro: eixo, raio, estreitamento, velocidade e turbulência de cada amostra, calculados
 * uma vez por quadro. Parede e hemácias leem daqui — assim a célula nunca aparece fora do vaso.
 */
export interface FlowFrame {
    ax: Float32Array;
    rad: Float32Array;
    sten: Float32Array;
    spd: Float32Array;
    swl: Float32Array;
}

export const makeFlowFrame = (): FlowFrame => ({
    ax: new Float32Array(SAMPLES * 3),
    rad: new Float32Array(SAMPLES),
    sten: new Float32Array(SAMPLES),
    spd: new Float32Array(SAMPLES),
    swl: new Float32Array(SAMPLES),
});

const scratch = new THREE.Vector3();

/** Estado do circuito num quadro: calculado uma vez e lido por todos os componentes da cena. */
export interface CardioState {
    p: CardioParams;
    cy: CycleState;
    f: FlowFrame;
    /** Passo de tempo do quadro já com a pausa aplicada (0 quando pausado). */
    dt: number;
}
export type CardioStateRef = { readonly current: CardioState };

export const writeFlowFrame = (f: FlowFrame, p: CardioParams, cy: CycleState): void => {
    for (let i = 0; i < SAMPLES; i++) {
        axisPoint(i, p, cy, scratch);
        f.ax[i * 3] = scratch.x;
        f.ax[i * 3 + 1] = scratch.y;
        f.ax[i * 3 + 2] = scratch.z;
        f.rad[i] = radiusAt(i, p, cy);
        f.sten[i] = stenosisAt(i, p);
        f.spd[i] = speedAt(i, p, cy);
        f.swl[i] = swirlAt(i, p);
    }
};

/** Amostra do ponto mais apertado da lesão (âncora do rótulo e do traço de velocidade). */
export const PLAQUE_SAMPLE = (() => {
    const [a, b] = rangeOf('arteria');
    return wrap(Math.round(a + PLAQUE_U * (b - a)));
})();
