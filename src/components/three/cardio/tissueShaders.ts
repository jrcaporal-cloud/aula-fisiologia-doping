import * as THREE from 'three';

/*
 * Superfícies procedurais da peça em corte (sem textura), enxertadas no MeshPhysicalMaterial via
 * onBeforeCompile — a luz, o ambiente e o verniz (clearcoat) úmido continuam os do three:
 *  - coração: epicárdio liso e úmido com gordura no sulco atrioventricular; endocárdio com
 *    trabéculas perto do ápice; na face do corte, o músculo com as fibras em hélice (o ângulo gira
 *    através da parede), a linha do endocárdio, a gordura epicárdica e, com fibrose, estrias claras;
 *  - vasos: na face do corte, as três túnicas (íntima, média com lâminas elásticas, adventícia) e a
 *    placa entre a íntima e a média (núcleo lipídico + capa fibrosa); na luz, o endotélio em
 *    paralelepípedos, que fica opaco e amarelado sobre a placa;
 *  - hemácia: disco bicôncavo.
 * O relevo (fibra, trabécula, lâmina) vira normal perturbada pela derivada da altura (como um
 * bumpMap), e todo detalhe fino some antes de ficar menor que ~1 px (frequência limitada por fwidth).
 */

type Shader = THREE.WebGLProgramParametersWithUniforms;

/** Par de props que liga o efeito a um material do JSX. */
export interface MaterialFx {
    onBeforeCompile: (s: Shader) => void;
    customProgramCacheKey: () => string;
}

/** Direção da luz de chave da cena (CardioScene), em coordenadas de mundo. */
export const KEY_DIR = new THREE.Vector3(5, 12, 16).normalize();

/* Hash inteiro (pcg), ruído de valor e Voronoi. Adaptado de shader-art-coding/glsl — MIT. */
const NOISE = /* glsl */ `
uint cPcg(uint v) { uint s = v * 747796405u + 2891336453u; uint w = ((s >> ((s >> 28u) + 4u)) ^ s) * 277803737u; return (w >> 22u) ^ w; }
float cHash(vec2 p) { uvec2 q = uvec2(ivec2(floor(p))); return float(cPcg(q.x + cPcg(q.y)) >> 8u) * (1.0 / 16777216.0); }
float cNoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(cHash(i), cHash(i + vec2(1.0, 0.0)), u.x), mix(cHash(i + vec2(0.0, 1.0)), cHash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float cFbm(vec2 p) { return cNoise(p) * 0.55 + cNoise(p * 2.03 + 7.1) * 0.3 + cNoise(p * 4.1 + 2.3) * 0.15; }
vec2 cVoronoi(vec2 p) {
    vec2 ip = floor(p); vec2 fp = fract(p); float f1 = 8.0; float f2 = 8.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 c = ip + g;
        vec2 o = vec2(cHash(c), cHash(c + vec2(41.0, 17.0)));
        vec2 r = g + 0.8 * o - fp;
        float d = dot(r, r);
        if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) { f2 = d; }
    }
    return sqrt(vec2(f1, f2));
}
// relevo: normal perturbada pela derivada da altura H (mesma conta do perturbNormalArb do three)
vec3 cBump(vec3 n, vec3 viewPos, float H, float k) {
    vec3 dpx = dFdx(-viewPos); vec3 dpy = dFdy(-viewPos);
    float dhx = dFdx(H) * k; float dhy = dFdy(H) * k;
    vec3 r1 = cross(dpy, n); vec3 r2 = cross(n, dpx);
    float det = dot(dpx, r1);
    vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
    return normalize(abs(det) * n - grad);
}
`;

const lin = (hex: string) => new THREE.Color(hex);

/* ───────────────────────── Coração ───────────────────────── */

export type HeartUniform = 'uMerLen' | 'uCircLen' | 'uThick' | 'uFib' | 'uLit' | 'uContract';

export interface HeartTissueFx extends MaterialFx {
    /** Escreve um uniform numérico (por quadro ou no hover). */
    set: (key: HeartUniform, value: number) => void;
}

/**
 * Tecido do coração. `fat` (0…1) liga a gordura do sulco AV; os uniforms de comprimento convertem as
 * frações do meridiano e da volta em mundo (o padrão não estica quando a câmara cresce).
 */
export const makeHeartTissueFx = (fat = 1): HeartTissueFx => {
    const uniforms = {
        uMerLen: { value: 6 }, uCircLen: { value: 8 }, uThick: { value: 1 },
        uFib: { value: 0 }, uFat: { value: fat }, uLit: { value: 0 }, uContract: { value: 0 },
        uEpi: { value: lin('#5a0f1c') }, uEndo: { value: lin('#6e1322') }, uMuscle: { value: lin('#86192b') },
        uMuscleDark: { value: lin('#430912') }, uFatC: { value: lin('#d6a84f') }, uScar: { value: lin('#e6d0c8') },
        uLining: { value: lin('#c97a80') },
    };
    return {
        set: (k, v) => { uniforms[k].value = v; },
        customProgramCacheKey: () => 'cardio-heart',
        onBeforeCompile: s => {
            Object.assign(s.uniforms, uniforms);
            s.vertexShader = s.vertexShader
                .replace('#include <common>', `#include <common>
attribute float aFace; attribute float aDepth; attribute float aMer; attribute float aSide;
varying float vFace; varying float vDepth; varying float vMer; varying float vSide;`)
                .replace('#include <begin_vertex>', `#include <begin_vertex>
vFace = aFace; vDepth = aDepth; vMer = aMer; vSide = aSide;`);
            s.fragmentShader = s.fragmentShader
                .replace('#include <common>', `#include <common>
uniform float uMerLen; uniform float uCircLen; uniform float uThick; uniform float uFib; uniform float uFat;
uniform float uLit; uniform float uContract;
uniform vec3 uEpi; uniform vec3 uEndo; uniform vec3 uMuscle; uniform vec3 uMuscleDark; uniform vec3 uFatC;
uniform vec3 uScar; uniform vec3 uLining;
varying float vFace; varying float vDepth; varying float vMer; varying float vSide;
${NOISE}`)
                .replace('#include <color_fragment>', `#include <color_fragment>
float hIn = 1.0 - step(0.5, vFace);
float hOut = step(0.5, vFace) * (1.0 - step(1.5, vFace));
float hCut = step(1.5, vFace) * (1.0 - step(2.5, vFace));
float hRim = step(2.5, vFace);
vec2 hSurf = vec2(vMer * uMerLen, vSide * uCircLen);
vec2 hSec = vec2(vMer * uMerLen, vDepth * uThick);
float tisH = 0.0;
vec3 hCol = uEpi;
float hGloss = 1.0;

// epicárdio: liso, ondulação baixa, gordura amarela no sulco atrioventricular
{
    float n = cFbm(hSurf * 1.6);
    float fat = smoothstep(0.74, 0.9, vMer + (n - 0.5) * 0.22) * uFat;
    float lob = cVoronoi(hSurf * 5.0).x;
    vec3 c = mix(uEpi * (0.85 + 0.3 * n), uFatC * (0.82 + 0.25 * lob), fat);
    hCol = mix(hCol, c, hOut);
    tisH += hOut * (n * 0.25 + fat * (0.6 - lob) * 0.5);
}
// endocárdio: trabéculas (cristas ao longo do eixo) mais fortes perto do ápice
{
    vec2 q = vec2(hSurf.y * 4.5 + cNoise(hSurf * 2.0) * 1.5, hSurf.x * 0.9);
    float ridge = 1.0 - abs(cNoise(q) * 2.0 - 1.0);
    float lod = 1.0 - smoothstep(0.25, 0.7, length(fwidth(q)));
    float tr = ridge * ridge * mix(0.35, 1.0, 1.0 - smoothstep(0.2, 0.75, vMer)) * lod;
    vec3 c = mix(uEndo * 0.72, uEndo * 1.25, tr);
    hCol = mix(hCol, c, hIn);
    tisH += hIn * tr * 1.2;
    hGloss -= hIn * 0.45;
}
// face do corte: fibras em hélice (+60° perto do endocárdio, −60° perto do epicárdio)
{
    float a = mix(1.05, -1.05, vDepth);
    float ca = cos(a); float sa = sin(a);
    vec2 q = vec2(hSec.x * ca + hSec.y * sa, -hSec.x * sa + hSec.y * ca);
    float across = q.y * 5.5 / (1.0 + 0.12 * uContract);
    float wob = cNoise(vec2(q.x * 1.2, across * 0.7));
    float fib = 0.5 + 0.5 * sin(6.2831853 * across + wob * 2.6);
    float lod = 1.0 - smoothstep(0.15, 0.35, fwidth(across));
    float crest = smoothstep(0.1, 0.95, fib);
    vec3 c = mix(uMuscleDark, uMuscle, mix(0.6, crest, lod));
    // fibrose intersticial: estrias claras entre os feixes, só onde a ficha manda
    float scar = smoothstep(0.62, 0.8, cFbm(vec2(q.x * 0.9, across * 0.32)) + uFib * 0.42 - 0.42) * step(0.01, uFib);
    c = mix(c, uScar, scar * 0.85);
    // revestimentos: endocárdio (linha clara) e epicárdio com gordura perto da base
    float lining = 1.0 - smoothstep(0.0, max(0.045, fwidth(vDepth) * 1.5), vDepth);
    c = mix(c, uLining, lining * 0.8);
    float fatCut = smoothstep(0.86, 0.97, vDepth) * smoothstep(0.78, 0.92, vMer) * uFat;
    c = mix(c, uFatC, fatCut);
    hCol = mix(hCol, c, hCut + hRim);
    tisH += (hCut + hRim) * (crest * lod * 0.9 - scar * 0.3);
    hGloss -= (hCut + hRim) * 0.92;
}
diffuseColor.rgb = hCol;`)
                .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + (1.0 - hGloss) * 0.4, 0.08, 1.0);`)
                .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
normal = cBump(normal, vViewPosition, tisH, mix(0.02, 0.05, hCut + hRim));`)
                .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
{
    vec3 eV = normalize(vViewPosition);
    float fr = 1.0 - clamp(abs(dot(normal, eV)), 0.0, 1.0);
    totalEmissiveRadiance += vec3(1.0, 0.36, 0.42) * fr * fr * fr * 0.05 * hOut;
    totalEmissiveRadiance += vec3(0.95, 0.25, 0.32) * uLit * 0.16;
}`)
                .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
material.clearcoat *= clamp(hGloss, 0.0, 1.0);`);
        },
    };
};

/* ───────────────────────── Vasos ───────────────────────── */

export type VesselStyle = 'aorta' | 'artery' | 'arteriole' | 'vein' | 'pulm';

interface StyleDef { lumen: string; adv: string; media: string; intima: string; mediaFrac: number; lamellae: number }

const STYLES: Record<VesselStyle, StyleDef> = {
    aorta: { lumen: '#9b3a46', adv: '#d7a294', media: '#c9757a', intima: '#f1d2cb', mediaFrac: 0.72, lamellae: 1 },
    artery: { lumen: '#963a47', adv: '#d39b8e', media: '#b5505c', intima: '#f1d2cb', mediaFrac: 0.62, lamellae: 0.45 },
    arteriole: { lumen: '#8f3443', adv: '#cf8e86', media: '#ad4553', intima: '#efcbc4', mediaFrac: 0.6, lamellae: 0 },
    vein: { lumen: '#4a3554', adv: '#7d6b93', media: '#6b5580', intima: '#cbbfd6', mediaFrac: 0.3, lamellae: 0 },
    pulm: { lumen: '#5a3d58', adv: '#8b7591', media: '#7a5f7f', intima: '#d6c8d8', mediaFrac: 0.4, lamellae: 0 },
};

export interface VesselFx extends MaterialFx {
    set: (key: 'uDys' | 'uLit', value: number) => void;
}

export const makeVesselFx = (style: VesselStyle): VesselFx => {
    const d = STYLES[style];
    const uniforms = {
        uDys: { value: 0 }, uLit: { value: 0 },
        uLumen: { value: lin(d.lumen) }, uAdv: { value: lin(d.adv) }, uMedia: { value: lin(d.media) },
        uIntima: { value: lin(d.intima) }, uMediaFrac: { value: d.mediaFrac }, uLam: { value: d.lamellae },
        uLipid: { value: lin('#e2ae45') }, uCap: { value: lin('#f3e2c2') },
    };
    return {
        set: (k, v) => { uniforms[k].value = v; },
        customProgramCacheKey: () => 'cardio-vessel',
        onBeforeCompile: s => {
            Object.assign(s.uniforms, uniforms);
            s.vertexShader = s.vertexShader
                .replace('#include <common>', `#include <common>
attribute float aFace; attribute float aDepth; attribute float aPlq; attribute vec2 aTube;
varying float vFace; varying float vDepth; varying float vPlq; varying vec2 vTube;`)
                .replace('#include <begin_vertex>', `#include <begin_vertex>
vFace = aFace; vDepth = aDepth; vPlq = aPlq; vTube = aTube;`);
            s.fragmentShader = s.fragmentShader
                .replace('#include <common>', `#include <common>
uniform float uDys; uniform float uLit;
uniform vec3 uLumen; uniform vec3 uAdv; uniform vec3 uMedia; uniform vec3 uIntima; uniform float uMediaFrac;
uniform float uLam; uniform vec3 uLipid; uniform vec3 uCap;
varying float vFace; varying float vDepth; varying float vPlq; varying vec2 vTube;
${NOISE}`)
                .replace('#include <color_fragment>', `#include <color_fragment>
float vIn = 1.0 - step(0.5, vFace);
float vOut = step(0.5, vFace) * (1.0 - step(1.5, vFace));
float vCut = step(1.5, vFace);
float tisH = 0.0;
float vGloss = 1.0;
vec3 vCol = uAdv;
// adventícia: fibrosa, opaca
{
    float n = cFbm(vec2(vTube.x * 2.2, vTube.y * 6.0));
    vCol = mix(vCol, uAdv * (0.82 + 0.3 * n), vOut);
    tisH += vOut * n * 0.3;
}
// luz: endotélio em paralelepípedos alongados no sentido do fluxo; sobre a placa fica amarelado
{
    vec2 p = vec2(vTube.x * 3.2, vTube.y * 9.0);
    vec2 vr = cVoronoi(p);
    float lod = 1.0 - smoothstep(0.12, 0.4, length(fwidth(p)));
    float groove = (1.0 - smoothstep(0.0, 0.12, vr.y - vr.x)) * lod;
    float onPlq = smoothstep(0.02, 0.25, vPlq);
    vec3 c = mix(uLumen, uLumen * 0.7, groove);
    c = mix(c, uLipid * 0.85, onPlq * 0.75);
    // disfunção endotelial: o brilho úmido some perto da lesão
    vCol = mix(vCol, c, vIn);
    vGloss -= vIn * (onPlq * 0.6 + uDys * 0.25);
    tisH += vIn * (0.3 - groove * 0.3 + onPlq * 0.2);
}
// face do corte: placa (capa fibrosa + núcleo lipídico) e as três túnicas
{
    float dp = vDepth;
    float inPlq = step(dp, vPlq) * step(0.002, vPlq);
    float pq = dp / max(vPlq, 1e-3);
    float speck = smoothstep(0.7, 0.9, cNoise(vec2(vTube.x * 22.0, dp * 30.0)));
    vec3 plaque = mix(uCap, uLipid * (0.85 + 0.25 * speck), smoothstep(0.12, 0.3, pq));
    float w = clamp((dp - vPlq) / max(1.0 - vPlq, 1e-3), 0.0, 1.0);
    float intimaEdge = 1.0 - smoothstep(0.0, max(0.06, fwidth(w) * 1.5), w);
    float media = step(w, uMediaFrac);
    float lam = 0.5 + 0.5 * sin((w * 26.0 + sin(vTube.x * 9.0) * 0.6) * 3.14159);
    float lamLod = 1.0 - smoothstep(0.2, 0.6, fwidth(w * 26.0));
    vec3 tun = mix(uAdv * 0.95, mix(uMedia * 0.9, uMedia * 1.15, lam * uLam * lamLod), media);
    tun = mix(tun, uIntima, intimaEdge);
    vec3 c = mix(tun, plaque, inPlq);
    vCol = mix(vCol, c, vCut);
    vGloss -= vCut * 0.8;
    tisH += vCut * (lam * uLam * lamLod * media * 0.4 + inPlq * speck * 0.3);
}
diffuseColor.rgb = vCol;`)
                .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
roughnessFactor = clamp(roughnessFactor + (1.0 - vGloss) * 0.3, 0.08, 1.0);`)
                .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
normal = cBump(normal, vViewPosition, tisH, 0.02);`)
                .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
totalEmissiveRadiance += vec3(0.95, 0.4, 0.45) * uLit * 0.16;`)
                .replace('#include <lights_physical_fragment>', `#include <lights_physical_fragment>
material.clearcoat *= clamp(vGloss, 0.0, 1.0);`);
        },
    };
};

/* ───────────────────────── Hemácia ───────────────────────── */

/**
 * Disco bicôncavo sobre a esfera achatada: o vértice do miolo afunda, o miolo fino deixa passar luz
 * (mais claro, mais ainda contra a luz) e o anel grosso escurece. Eixo do disco = y do modelo.
 */
export const makeRedCellFx = (): MaterialFx => {
    const keyDir = { value: KEY_DIR.clone() };
    return {
        customProgramCacheKey: () => 'cardio-rbc',
        onBeforeCompile: s => {
            s.uniforms.uKeyDir = keyDir;
            s.vertexShader = s.vertexShader
                .replace('#include <common>', '#include <common>\nvarying float vRbcR;')
                .replace('#include <begin_vertex>', `#include <begin_vertex>
vRbcR = length(position.xz);
transformed.y *= mix(0.4, 1.0, smoothstep(0.0, 0.8, vRbcR));`);
            s.fragmentShader = s.fragmentShader
                .replace('#include <common>', '#include <common>\nuniform vec3 uKeyDir;\nvarying float vRbcR;')
                .replace('#include <color_fragment>', `#include <color_fragment>
float rbCenter = 1.0 - smoothstep(0.12, 0.6, vRbcR);
float rbTorus = smoothstep(0.5, 0.78, vRbcR) * (1.0 - smoothstep(0.92, 1.0, vRbcR));
diffuseColor.rgb *= mix(1.0, 0.62, rbTorus);`)
                .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
{
    vec3 rbV = normalize(vViewPosition);
    vec3 rbL = normalize((viewMatrix * vec4(uKeyDir, 0.0)).xyz);
    float rbBack = smoothstep(-0.3, 1.0, dot(rbL, -rbV));
    totalEmissiveRadiance += vec3(1.0, 0.16, 0.12) * rbCenter * (0.4 + 0.6 * rbBack) * 0.32;
}`);
        },
    };
};
