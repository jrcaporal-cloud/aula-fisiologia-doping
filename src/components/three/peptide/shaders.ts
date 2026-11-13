import * as THREE from 'three';
import { phase } from '../receptor/layout';
import { CA_CHANNEL, GRANULES, PW, RECEPTOR_X, enzymes, pp, type Side } from './layout';
import { PC } from './ligands';

/*
 * Superfícies procedurais (sem textura) enxertadas por onBeforeCompile nos materiais que a cena já usa:
 * a bicamada fluida (que ondula com a fusão dos grânulos e acende a folha de dentro com o Ca²⁺), as caudas
 * com os segmentos de CH₂, a vesícula translúcida do grânulo, o pulso que desce pelas hélices do receptor
 * ligado e o citosol do fundo que acende com o cálcio. A luz, a neblina e o tom continuam os do three.
 * Ruído e hash adaptados de shader-art-coding (MIT): pcg3d (Jarzynski & Olano 2020) e value noise/fBm.
 */

/* ───────────────────────── sinal da coreografia → uniformes ───────────────────────── */

type U = { value: number };
/**
 * Uniformes compartilhadas por todos os materiais da cena (um objeto só, atualizado uma vez por quadro).
 * bind = peptídeo no bolsão; gact = proteína G ativa (GTP); ca = Ca²⁺ no citosol; fuse = poro de fusão aberto.
 */
export const SIGNAL = {
    time: { value: 0 } as U,
    bind: { value: 0 } as U,
    gact: { value: 0 } as U,
    ca: { value: 0 } as U,
    fuse: { value: 0 } as U,
};

/** Ca²⁺ livre no citosol (0…1): sobe com a onda da etapa 4, segue alto na 5 e na 6, apaga no fim do sinal. */
export const calciumLevel = (active: Side, T: number) => {
    const w = active < 0 ? PW.ca : ([3.6, 3.97] as const);
    return phase(T, w[0], w[1]) * (1 - pp(T, PW.fade));
};

/** Atualiza as uniformes a partir do tempo da aula T (fora dos componentes: nada de mutar valor de hook). */
export const tickSignal = (T: number, clock: number, active: Side) => {
    SIGNAL.time.value = clock;
    SIGNAL.bind.value = pp(T, PW.dock) * (1 - pp(T, PW.fade));
    SIGNAL.gact.value = pp(T, PW.gtpIn) * (1 - pp(T, PW.hydro));
    SIGNAL.ca.value = calciumLevel(active, T);
    SIGNAL.fuse.value = pp(T, PW.fuse) * (1 - pp(T, PW.reseal));
};

/** Uniforme própria de um material (ex.: receptor ativo); escrita por função para o lint do React. */
export const makeU = (v = 0): U => ({ value: v });
export const setU = (u: U, v: number) => { u.value = v; };

/* ───────────────────────── GLSL comum ───────────────────────── */

/** Direção da luz de chave (PeptideScene), em coordenadas de mundo. */
const KEY_DIR = new THREE.Vector3(8, 16, 14).normalize();
const glslVec3 = (c: THREE.Color) => `vec3(${c.r.toFixed(4)}, ${c.g.toFixed(4)}, ${c.b.toFixed(4)})`;
const CA_RGB = glslVec3(new THREE.Color(PC.calcium));

const NOISE_GLSL = /* glsl */ `
uvec3 pepPcg(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    return v;
}
float pepHash(vec3 p) { return float(pepPcg(uvec3(ivec3(floor(p)) + 32768)).x >> 8u) * (1.0 / 16777216.0); }
float pepNoise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(pepHash(i), pepHash(i + vec3(1, 0, 0)), u.x),
                   mix(pepHash(i + vec3(0, 1, 0)), pepHash(i + vec3(1, 1, 0)), u.x), u.y),
               mix(mix(pepHash(i + vec3(0, 0, 1)), pepHash(i + vec3(1, 0, 1)), u.x),
                   mix(pepHash(i + vec3(0, 1, 1)), pepHash(i + vec3(1, 1, 1)), u.x), u.y), u.z);
}
// fBm de até 4 oitavas; cada oitava some quando o seu período fica abaixo de ~1 px (px = fwidth de p,
// medido fora do laço) e o laço para aí: de longe o ruído nem é calculado
float pepFbm(vec3 p, float px, int octaves) {
    float sum = 0.0, amp = 0.5, freq = 1.0;
    for (int i = 0; i < 4; i++) {
        if (i >= octaves) break;
        float fade = 1.0 - smoothstep(0.25, 0.5, px * freq);
        if (fade <= 0.0) break;
        sum += amp * (pepNoise(p * freq) - 0.5) * fade;
        freq *= 2.03;
        amp *= 0.5;
    }
    return sum;
}
`;

type Shader = THREE.WebGLProgramParametersWithUniforms;

/** Encadeia um onBeforeCompile ao que o material já tiver e marca o programa com uma chave própria. */
const chain = <M extends THREE.Material>(mat: M, key: string, fn: (s: Shader) => void): M => {
    const prev = mat.onBeforeCompile.bind(mat);
    const prevKey = mat.customProgramCacheKey.bind(mat);
    mat.onBeforeCompile = (s, r) => { prev(s, r); fn(s); };
    mat.customProgramCacheKey = () => `${prevKey()}|${key}`;
    return mat;
};

/* ───────────────────────── Bicamada lipídica ───────────────────────── */

/** Pontos (x, z) onde proteínas atravessam a membrana: ali ela fica presa (raio interno, externo). */
const GATES: { x: number; z: number; r0: number; r1: number }[] = [
    { x: -RECEPTOR_X, z: 0, r0: 1.5, r1: 3.2 },
    { x: RECEPTOR_X, z: 0, r0: 1.5, r1: 3.2 },
    ...enzymes(1).map(p => ({ x: p.x, z: p.z, r0: 1.0, r1: 2.6 })),
    { x: CA_CHANNEL.x, z: CA_CHANNEL.z, r0: 0.9, r1: 2.2 },
];
const smoothstep = (a: number, b: number, x: number) => {
    const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
};
/**
 * Quanto o lipídio em (x, z) pode se mover (0 = preso junto a uma proteína, 1 = livre). Fixo: calculado
 * uma vez por lipídio na CPU e levado no atributo `aLip.w`, em vez de refeito em cada vértice.
 */
export const lipidFreedom = (x: number, z: number): number =>
    GATES.reduce((pin, g) => Math.min(pin, smoothstep(g.r0, g.r1, Math.hypot(x - g.x, z - g.z))), 1);
const PORES = GRANULES.flatMap(g => (g.fuse ? [new THREE.Vector2(g.fuse.x, g.fuse.z)] : []));

/**
 * Deslocamento da bicamada (mesma função nas cabeças e nas caudas, que leem o lipídio pelo atributo
 * `aLip` = x, z, índice, liberdade): onda lenta de membrana fluida, tremor lateral por lipídio e, na
 * exocitose, anéis que correm a partir de cada poro de fusão. Perto das proteínas a membrana fica presa.
 */
const MEMBRANE_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uFuse;
uniform vec2 uPores[${PORES.length}];
attribute vec4 aLip;
varying float vRipple;
vec3 memOffset(vec2 o, float id, float pin) {
    float t = uTime;
    float wave = sin(o.x * 0.34 + t * 0.55) * cos(o.y * 0.42 - t * 0.4) * 0.07
               + sin((o.x + o.y) * 0.21 - t * 0.31) * 0.04;
    float rip = 0.0;
    // ramo uniforme (igual em todos os vértices): fora da exocitose os anéis nem são calculados
    if (uFuse > 0.001) {
        for (int i = 0; i < ${PORES.length}; i++) {
            float d = distance(o, uPores[i]);
            rip += sin(d * 2.4 - t * 4.2) * exp(-d * 0.32) * smoothstep(1.0, 1.8, d);
        }
        rip *= uFuse;
    }
    vRipple = rip;
    float ph = id * 2.399;
    vec2 jit = vec2(sin(t * 1.7 + ph) + sin(t * 2.9 + ph * 1.7) * 0.5,
                    cos(t * 1.3 + ph * 1.3) + sin(t * 2.3 + ph * 0.7) * 0.5) * 0.028;
    return vec3(jit.x, wave + rip * 0.26, jit.y) * pin;
}`;

const MEMBRANE_PROJECT = /* glsl */ `vec4 mvPosition = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
    mvPosition = instanceMatrix * mvPosition;
    mvPosition.xyz += memOffset(aLip.xy, aLip.z, aLip.w);
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`;

const membraneUniforms = (s: Shader) => {
    s.uniforms.uTime = SIGNAL.time;
    s.uniforms.uFuse = SIGNAL.fuse;
    s.uniforms.uCa = SIGNAL.ca;
    s.uniforms.uPores = { value: PORES };
    s.uniforms.uKeyDir = { value: KEY_DIR };
};

/**
 * Cabeças polares: superfície molhada (borda acesa e brilho da chave), a crista dos anéis de fusão um
 * pouco mais clara e a folha de dentro tingida pelo Ca²⁺ do citosol. (Sem ruído por pixel: as cabeças
 * cobrem a maior área da tela e o grão custava quadros.)
 */
export const lipidHeadMaterial = <M extends THREE.MeshStandardMaterial>(mat: M): M =>
    chain(mat, 'pep-lipid-head', s => {
        membraneUniforms(s);
        s.vertexShader = s.vertexShader
            .replace('#include <common>', `#include <common>
${MEMBRANE_VERTEX}
varying float vInner;`)
            .replace('#include <begin_vertex>', `#include <begin_vertex>
#ifdef USE_INSTANCING
vInner = step(instanceMatrix[3].y, 0.0);
#else
vInner = 0.0;
#endif`)
            .replace('#include <project_vertex>', MEMBRANE_PROJECT);
        s.fragmentShader = s.fragmentShader
            .replace('#include <common>', `#include <common>
uniform float uCa;
uniform vec3 uKeyDir;
varying float vRipple;
varying float vInner;`)
            .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
{
    vec3 V = normalize(vViewPosition);
    float ndv = clamp(dot(normal, V), 0.0, 1.0);
    float fr = 1.0 - ndv;
    vec3 L = normalize((viewMatrix * vec4(uKeyDir, 0.0)).xyz);
    vec3 H = normalize(L + V);
    float glint = pow(max(dot(normal, H), 0.0), 48.0);
    totalEmissiveRadiance += vec3(0.78, 0.84, 1.0) * (fr * fr * fr * 0.32 + glint * 0.32);
    // crista do anel de fusão: a membrana "brilha" onde a onda passa
    totalEmissiveRadiance += vec3(1.0, 0.55, 0.62) * max(vRipple, 0.0) * 0.22;
    // folha de dentro banhada pelo Ca²⁺ do citosol
    totalEmissiveRadiance += ${CA_RGB} * uCa * vInner * (0.16 + 0.22 * fr);
}`);
    });

/**
 * Caudas apolares: acompanham a cabeça (mesma onda), escurecem rumo ao miolo hidrofóbico e mostram os
 * segmentos de CH₂ — que se apagam quando ficam mais finos que um pixel.
 */
export const lipidTailMaterial = <M extends THREE.MeshStandardMaterial>(mat: M): M =>
    chain(mat, 'pep-lipid-tail', s => {
        membraneUniforms(s);
        s.vertexShader = s.vertexShader
            .replace('#include <common>', `#include <common>
${MEMBRANE_VERTEX}
varying float vTail;`)
            // cilindro unitário em y: −0,5 na ponta da cabeça, +0,5 no miolo da bicamada
            .replace('#include <begin_vertex>', `#include <begin_vertex>
vTail = position.y + 0.5;`)
            .replace('#include <project_vertex>', MEMBRANE_PROJECT);
        s.fragmentShader = s.fragmentShader
            .replace('#include <common>', `#include <common>
varying float vTail;`)
            .replace('#include <color_fragment>', `#include <color_fragment>
{
    float seg = vTail * 7.0;
    float w = fwidth(seg);
    float lod = 1.0 - smoothstep(0.35, 0.7, w);
    float band = abs(fract(seg) - 0.5) * 2.0;
    float groove = (1.0 - smoothstep(0.55 - w, 0.85 + w, band)) * lod;
    diffuseColor.rgb *= mix(1.0, 0.72, groove);
    diffuseColor.rgb *= mix(1.0, 0.62, smoothstep(0.35, 1.0, vTail));
}`);
    });

/* ───────────────────────── Grânulo de GH ───────────────────────── */

/**
 * Vesícula translúcida: a membrana do grânulo aparece como um anel (mais opaca de lado, transparente de
 * frente), com um grão suave; o miolo brilha com o GH e o anel acende quando o grânulo funde.
 */
export const granuleMaterial = <M extends THREE.MeshStandardMaterial>(mat: M, fuses: boolean): M =>
    chain(mat, 'pep-granule', s => {
        s.uniforms.uFuse = fuses ? SIGNAL.fuse : { value: 0 };
        s.uniforms.uCa = SIGNAL.ca;
        s.uniforms.uTime = SIGNAL.time;
        s.vertexShader = s.vertexShader
            .replace('#include <common>', '#include <common>\nvarying vec3 vGranP;')
            .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGranP = position;');
        s.fragmentShader = s.fragmentShader
            .replace('#include <common>', `#include <common>
uniform float uFuse;
uniform float uCa;
uniform float uTime;
varying vec3 vGranP;
${NOISE_GLSL}`)
            .replace('#include <color_fragment>', `#include <color_fragment>
vec3 gV = normalize(vViewPosition);
float gFr = 1.0 - clamp(abs(dot(normalize(vNormal), gV)), 0.0, 1.0);
float gRim = gFr * gFr;
{
    vec3 gp = vGranP * 4.0 + vec3(0.0, uTime * 0.12, 0.0);
    float px = length(fwidth(gp));
    diffuseColor.rgb *= 1.0 + pepFbm(gp, px, 4) * 0.4;
    // membrana vista de lado é mais espessa: mais opaca na borda, quase transparente no meio
    diffuseColor.a *= mix(0.55, 2.1, gRim);
    diffuseColor.a = clamp(diffuseColor.a, 0.0, 1.0);
}`)
            .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(1.0, 0.62, 0.7) * gRim * (0.18 + 0.55 * uFuse + 0.12 * uCa);`);
    });

/* ───────────────────────── Hélices do receptor ───────────────────────── */

/**
 * Hélice transmembrana: com o peptídeo no bolsão (`act`), pulsos de luz descem da face de fora para a de
 * dentro — o sinal atravessando a membrana. Lê a altura no espaço do modelo (eixo y da hélice).
 */
export const helixMaterial = <M extends THREE.MeshStandardMaterial>(mat: M, act: U, half: number, color: string): M =>
    chain(mat, 'pep-helix', s => {
        s.uniforms.uAct = act;
        s.uniforms.uTime = SIGNAL.time;
        s.uniforms.uPulse = { value: new THREE.Color(color) };
        s.vertexShader = s.vertexShader
            .replace('#include <common>', '#include <common>\nvarying float vHelixY;')
            .replace('#include <begin_vertex>', `#include <begin_vertex>\nvHelixY = position.y / ${half.toFixed(3)};`);
        s.fragmentShader = s.fragmentShader
            .replace('#include <common>', `#include <common>
uniform float uAct;
uniform float uTime;
uniform vec3 uPulse;
varying float vHelixY;`)
            .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
{
    // frente do pulso: de +1 (fora) a −1,6 (passa da ponta de dentro), três por ciclo de ~2,6 s
    float head = 1.0 - fract(uTime * 0.38) * 2.6;
    float d = (vHelixY - head) / 0.22;
    float pulse = exp(-d * d);
    float d2 = (vHelixY - head - 0.9) / 0.22;
    pulse += 0.5 * exp(-d2 * d2);
    vec3 V = normalize(vViewPosition);
    float fr = 1.0 - clamp(abs(dot(normal, V)), 0.0, 1.0);
    totalEmissiveRadiance += uPulse * (pulse * 0.9 * uAct + fr * fr * 0.12);
}`);
    });

/* ───────────────────────── Fundo (citosol) ───────────────────────── */

export const BACKDROP_VERTEX = 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
/** Degradê escuro com tom carmim; a metade de baixo (citosol) ganha um véu de Ca²⁺ quando o cálcio sobe. */
export const BACKDROP_FRAGMENT = /* glsl */ `
uniform float uCa;
uniform float uTime;
varying vec3 vP;
void main(){
    float h = vP.y * 0.5 + 0.5;
    vec3 c = mix(vec3(0.012,0.008,0.02), vec3(0.05,0.03,0.09), smoothstep(0.25, 0.95, h));
    float up = max(vP.y, 0.0);
    c += vec3(0.09,0.01,0.03) * up * up * 0.5;
    float low = smoothstep(0.05, -0.55, vP.y);
    float breathe = 0.85 + 0.15 * sin(uTime * 1.3 + vP.x * 3.0);
    c += ${CA_RGB} * uCa * low * breathe * 0.07;
    gl_FragColor = vec4(c, 1.0);
}`;
export const backdropUniforms = () => ({ uCa: SIGNAL.ca, uTime: SIGNAL.time });
