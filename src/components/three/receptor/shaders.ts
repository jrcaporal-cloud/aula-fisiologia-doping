import * as THREE from 'three';
import { ARE_Z, DNA_CENTER, SARC_CENTER } from './layout';

/*
 * Superfícies procedurais do modelo do receptor, enxertadas nos materiais que já existiam
 * (onBeforeCompile): a luz, a neblina e o Bloom continuam os do three; só cor, normal, brilho e (na
 * membrana) a posição dos lipídios passam a vir de funções no shader.
 * - Bicamada: lipídios tremem de lado e a lâmina ondula devagar; onde o esteroide atravessa, a
 *   membrana ondula em anéis. Caudas com o zigue-zague da cadeia de carbono.
 * - Envelope nuclear: lâmina mosqueada, cromatina periférica vista por dentro, poro que brilha na
 *   importação do dímero (poro 0) e na exportação do mRNA (poro 1).
 * - DNA: brilho que corre pelas fitas, ARE pulsando com o dímero ancorado, bolha acesa na transcrição.
 * - Receptor: resíduos marcados ao longo da cadeia e uma onda de ativação do LBD ao DBD na ligação.
 * - Sarcômero: coroas de miosina e linha M nos filamentos grossos, retículo na linha Z e uma frente de
 *   incorporação correndo pelos filamentos novos.
 * - Proteínas em nuvem (HSP, polimerase, SRC-1, ribossomo): grão de superfície.
 * Todo detalhe fino some quando fica abaixo de ~1 px (fwidth): sem moiré nem cintilação.
 * Os sinais da coreografia ficam em RC_U, escritos uma vez por quadro (signals.ts).
 */

export const RC_U = {
    uTime: { value: 0 },
    /** xyz = posição do ligante, w = quanto ele está dentro da bicamada (0…1). */
    uLig: { value: [new THREE.Vector4(), new THREE.Vector4()] },
    /** Dímero passando pelo poro de importação / mRNA passando pelo poro de exportação (0…1). */
    uImport: { value: 0 },
    uExport: { value: 0 },
    /** Dímero ancorado no ARE (0…1). */
    uDock: { value: 0 },
    /** Bolha de transcrição aberta (polimerase lendo, 0…1) e z (mundo) da bolha. */
    uRead: { value: 0 },
    uRnapZ: { value: 0 },
    /** Ligante no bolsão / H12 fechada (0…1). */
    uBind: { value: 0 },
    /** Frente da onda de ativação ao longo da cadeia (1 = LBD, 0 = DBD) e sua intensidade. */
    uWave: { value: 1 },
    uWaveAmp: { value: 0 },
    /** Frente de incorporação nos filamentos novos (0 = linha M, 1 = ponta) e intensidade. */
    uGrowFront: { value: 0 },
    uGrowAmp: { value: 0 },
};

// Hash inteiro (pcg3d) e ruído de gradiente 3D: adaptados de shader-art-coding glsl/hash.glsl e noise.glsl (MIT).
const NOISE_GLSL = /* glsl */ `
uvec3 rcPcg3(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    return v;
}
vec3 rcHash33(vec3 p) { return vec3(rcPcg3(uvec3(ivec3(floor(p)) + 32768))) * (1.0 / 4294967296.0); }
float rcNoise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    float a = dot(rcHash33(i) * 2.0 - 1.0, f);
    float b = dot(rcHash33(i + vec3(1, 0, 0)) * 2.0 - 1.0, f - vec3(1, 0, 0));
    float c = dot(rcHash33(i + vec3(0, 1, 0)) * 2.0 - 1.0, f - vec3(0, 1, 0));
    float d = dot(rcHash33(i + vec3(1, 1, 0)) * 2.0 - 1.0, f - vec3(1, 1, 0));
    float e = dot(rcHash33(i + vec3(0, 0, 1)) * 2.0 - 1.0, f - vec3(0, 0, 1));
    float g = dot(rcHash33(i + vec3(1, 0, 1)) * 2.0 - 1.0, f - vec3(1, 0, 1));
    float h = dot(rcHash33(i + vec3(0, 1, 1)) * 2.0 - 1.0, f - vec3(0, 1, 1));
    float k = dot(rcHash33(i + vec3(1, 1, 1)) * 2.0 - 1.0, f - vec3(1, 1, 1));
    return mix(mix(mix(a, b, u.x), mix(c, d, u.x), u.y), mix(mix(e, g, u.x), mix(h, k, u.x), u.y), u.z);
}
/* fbm de até 4 oitavas; px = tamanho do pixel na escala da 1ª oitava (fwidth fora de laço/ramo). */
float rcFbm(vec3 p, float px, int oct) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) {
        if (i >= oct) break;
        s += a * rcNoise(p) * (1.0 - smoothstep(0.3, 0.7, px));
        p = p * 2.03 + vec3(17.1, 3.7, 9.2);
        px *= 2.03;
        a *= 0.5;
    }
    return s;
}
`;

type Shader = THREE.WebGLProgramParametersWithUniforms;

/** Props de material: `<meshStandardMaterial {...PATCH} />`. */
export interface MaterialPatch {
    onBeforeCompile: (s: Shader) => void;
    customProgramCacheKey: () => string;
}

const inject = (src: string, chunk: string, code: string, after = true): string => {
    const tag = `#include <${chunk}>`;
    if (!src.includes(tag)) throw new Error(`receptor/shaders: chunk ${chunk} não encontrado`);
    return src.replace(tag, after ? `${tag}\n${code}` : `${code}\n${tag}`);
};

interface PatchSpec {
    key: string;
    uniforms?: Record<string, { value: unknown }>;
    vertPars?: string;
    /** Depois de begin_vertex (objeto, `transformed`). */
    vert?: string;
    /** Substitui project_vertex inteiro. */
    project?: string;
    fragPars?: string;
    color?: string;
    normal?: string;
    emissive?: string;
}

const makePatch = (p: PatchSpec): MaterialPatch => ({
    onBeforeCompile: (s: Shader) => {
        Object.assign(s.uniforms, p.uniforms ?? {});
        let vs = inject(s.vertexShader, 'common', NOISE_GLSL + (p.vertPars ?? ''));
        if (p.vert) vs = inject(vs, 'begin_vertex', p.vert);
        if (p.project) vs = vs.replace('#include <project_vertex>', p.project);
        let fs = inject(s.fragmentShader, 'common', NOISE_GLSL + (p.fragPars ?? ''));
        if (p.color) fs = inject(fs, 'color_fragment', p.color);
        if (p.normal) fs = inject(fs, 'normal_fragment_maps', p.normal);
        if (p.emissive) fs = inject(fs, 'emissivemap_fragment', p.emissive);
        s.vertexShader = vs;
        s.fragmentShader = fs;
    },
    customProgramCacheKey: () => `receptor-${p.key}-v1`,
});

/** Posição no mundo (com instância) e uv do objeto, para os padrões. */
const WORLD_VERT_PARS = /* glsl */ `
varying vec3 vRcW;
varying vec2 vRcUv;
`;
const WORLD_VERT = /* glsl */ `
{
    vec4 rcWp = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
        rcWp = instanceMatrix * rcWp;
    #endif
    vRcW = (modelMatrix * rcWp).xyz;
    vRcUv = uv;
}
`;
const WORLD_FRAG_PARS = /* glsl */ `
varying vec3 vRcW;
varying vec2 vRcUv;
`;

/* ───────────────────────── Bicamada lipídica ───────────────────────── */

const LIPID_VERT_PARS = /* glsl */ `
uniform float uTime;
uniform vec4 uLig[2];
varying vec2 vRcUv;
vec3 rcLipidOffset(vec3 o, float id) {
    float t = uTime;
    // ondulação lenta da lâmina inteira (ao longo da normal da membrana, x)
    float wave = sin(o.y * 0.45 + t * 0.5) * cos(o.z * 0.38 - t * 0.37) * 0.07
               + sin((o.y - o.z) * 0.23 - t * 0.29) * 0.04;
    // anéis onde o esteroide atravessa (some longe do ponto de passagem)
    for (int i = 0; i < 2; i++) {
        float d = distance(o.yz, uLig[i].yz);
        wave += uLig[i].w * sin(d * 3.0 - t * 5.0) * exp(-d * 0.8) * 0.07;
    }
    // difusão lateral de cada lipídio (cabeça e as duas caudas com a mesma fase)
    float ph = id * 2.399;
    vec2 jit = vec2(sin(t * 1.7 + ph) + 0.5 * sin(t * 2.9 + ph * 1.7),
                    cos(t * 1.3 + ph * 1.3) + 0.5 * sin(t * 2.3 + ph * 0.7)) * 0.03;
    return vec3(wave, jit.x, jit.y);
}
`;
const lipidProject = (idExpr: string) => /* glsl */ `
vRcUv = uv;
vec4 mvPosition = vec4(transformed, 1.0);
#ifdef USE_INSTANCING
    mvPosition = instanceMatrix * mvPosition;
    mvPosition.xyz += rcLipidOffset(instanceMatrix[3].xyz, ${idExpr});
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;
`;

/** Cabeças polares: tremem e ondulam; leve brilho de interface com a água na borda. */
export const LIPID_HEAD = makePatch({
    key: 'lipid-head',
    uniforms: { uTime: RC_U.uTime, uLig: RC_U.uLig },
    vertPars: LIPID_VERT_PARS,
    project: lipidProject('float(gl_InstanceID)'),
    fragPars: 'varying vec2 vRcUv;',
    emissive: /* glsl */ `
{
    float rcF = 1.0 - saturate(dot(normal, normalize(vViewPosition)));
    totalEmissiveRadiance += diffuseColor.rgb * rcF * rcF * rcF * 0.22;
}`,
});

/** Caudas apolares: seguem a cabeça (2 caudas por lipídio) e mostram o zigue-zague da cadeia. */
export const LIPID_TAIL = makePatch({
    key: 'lipid-tail',
    uniforms: { uTime: RC_U.uTime, uLig: RC_U.uLig },
    vertPars: LIPID_VERT_PARS,
    project: lipidProject('float(gl_InstanceID / 2)'),
    fragPars: 'varying vec2 vRcUv;',
    color: /* glsl */ `
{
    float rcS = vRcUv.y * 8.0;
    float rcFade = 1.0 - smoothstep(0.25, 0.55, fwidth(rcS));
    float rcZig = abs(fract(rcS) - 0.5) * 2.0;
    diffuseColor.rgb *= 1.0 - 0.22 * smoothstep(0.55, 0.95, rcZig) * rcFade;
}`,
});

/* ───────────────────────── DNA ───────────────────────── */

/** Fitas, fosfatos e bases: brilho que corre ao longo da hélice, ARE com o dímero e bolha lida. */
export const DNA_STRAND = makePatch({
    key: 'dna',
    uniforms: { uTime: RC_U.uTime, uDock: RC_U.uDock, uRead: RC_U.uRead, uRnapZ: RC_U.uRnapZ, uAreZ: { value: DNA_CENTER.z + ARE_Z } },
    vertPars: WORLD_VERT_PARS,
    vert: WORLD_VERT,
    fragPars: WORLD_FRAG_PARS + 'uniform float uTime; uniform float uDock; uniform float uRead; uniform float uRnapZ; uniform float uAreZ;',
    emissive: /* glsl */ `
{
    float rcZ = vRcW.z;
    // brilho que percorre a hélice no sentido da leitura (mais forte com a polimerase lendo)
    float rcG = 0.5 + 0.5 * sin(rcZ * 1.6 - uTime * 2.4);
    rcG *= rcG; rcG *= rcG; rcG *= rcG;
    vec3 rcEm = diffuseColor.rgb * rcG * (0.05 + 0.16 * uRead);
    // ARE pulsando enquanto o dímero está ancorado
    float rcAre = 1.0 - smoothstep(1.6, 2.3, abs(rcZ - uAreZ));
    rcEm += vec3(0.85, 0.35, 0.95) * rcAre * uDock * (0.08 + 0.07 * sin(uTime * 2.6));
    // bolha de transcrição acesa onde está a polimerase
    float rcB = (rcZ - uRnapZ) / 1.3;
    rcEm += vec3(0.95, 0.45, 0.75) * exp(-rcB * rcB) * uRead * 0.2;
    totalEmissiveRadiance += rcEm;
}`,
});

/* ───────────────────────── Receptor (cadeia) ───────────────────────── */

/**
 * Cadeia do receptor (tubo com uv.x ao longo da cadeia): resíduos marcados e, na ligação, uma onda de
 * ativação que desce do LBD (fim da cadeia) ao DBD (começo).
 */
export const proteinPatch = (residues: number): MaterialPatch => makePatch({
    key: 'protein',
    uniforms: { uRes: { value: residues }, uBind: RC_U.uBind, uWave: RC_U.uWave, uWaveAmp: RC_U.uWaveAmp },
    vertPars: WORLD_VERT_PARS,
    vert: WORLD_VERT,
    fragPars: WORLD_FRAG_PARS + 'uniform float uRes; uniform float uBind; uniform float uWave; uniform float uWaveAmp;',
    color: /* glsl */ `
{
    float rcS = vRcUv.x * uRes;
    float rcFade = 1.0 - smoothstep(0.3, 0.6, fwidth(rcS));
    float rcR = abs(fract(rcS) - 0.5) * 2.0;
    diffuseColor.rgb *= 1.0 - 0.16 * smoothstep(0.55, 1.0, rcR) * rcFade;
}`,
    emissive: /* glsl */ `
{
    float rcD = (vRcUv.x - uWave) * 9.0;
    totalEmissiveRadiance += diffuseColor.rgb * (exp(-rcD * rcD) * uWaveAmp * 0.55 + uBind * 0.05);
}`,
});

/* ───────────────────────── Sarcômero ───────────────────────── */

/** Filamento grosso: coroas de miosina, zona nua e linha M; frente de incorporação nos filamentos novos. */
export const MYOSIN_ROD = makePatch({
    key: 'myosin',
    uniforms: { uTime: RC_U.uTime, uGrowFront: RC_U.uGrowFront, uGrowAmp: RC_U.uGrowAmp },
    vertPars: WORLD_VERT_PARS,
    vert: WORLD_VERT,
    fragPars: WORLD_FRAG_PARS + 'uniform float uTime; uniform float uGrowFront; uniform float uGrowAmp;',
    color: /* glsl */ `
{
    float rcX = abs(vRcUv.y - 0.5) * 2.0;
    float rcS = rcX * 26.0;
    float rcW = fwidth(rcS);
    float rcFade = 1.0 - smoothstep(0.3, 0.6, rcW);
    float rcCrown = smoothstep(0.6, 1.0, abs(fract(rcS) - 0.5) * 2.0);
    float rcBare = smoothstep(0.06, 0.12, rcX);
    diffuseColor.rgb *= 1.0 - 0.18 * rcCrown * rcFade * rcBare;
    float rcM = 1.0 - smoothstep(0.012, 0.012 + max(fwidth(rcX), 0.004), rcX);
    diffuseColor.rgb *= 1.0 - 0.4 * rcM;
}`,
    emissive: /* glsl */ `
{
    #ifdef USE_COLOR
        float rcNew = saturate((vColor.g - vColor.b) * 1.4);
    #else
        float rcNew = 0.0;
    #endif
    float rcX = abs(vRcUv.y - 0.5) * 2.0;
    float rcD = (rcX - uGrowFront) * 7.0;
    totalEmissiveRadiance += vec3(1.0, 0.85, 0.3) * rcNew * exp(-rcD * rcD) * uGrowAmp * 0.45;
}`,
});

/** Linha Z: retículo do disco (espaçamento do retículo de filamentos), mais vivo na periferia nova. */
export const Z_DISC = makePatch({
    key: 'zdisc',
    uniforms: { uCenter: { value: new THREE.Vector2(SARC_CENTER.y, SARC_CENTER.z) }, uGrowAmp: RC_U.uGrowAmp },
    vertPars: WORLD_VERT_PARS,
    vert: WORLD_VERT,
    fragPars: WORLD_FRAG_PARS + 'uniform vec2 uCenter; uniform float uGrowAmp;',
    color: /* glsl */ `
{
    vec2 rcP = (vRcW.yz - uCenter) / 0.575;
    vec2 rcW = fwidth(rcP);
    float rcFade = 1.0 - smoothstep(0.25, 0.5, max(rcW.x, rcW.y));
    vec2 rcG = abs(fract(rcP + 0.5) - 0.5) / max(rcW, vec2(1e-4));
    float rcLine = 1.0 - min(min(rcG.x, rcG.y), 1.0);
    diffuseColor.rgb *= 1.0 + 0.45 * rcLine * rcFade;
}`,
    emissive: /* glsl */ `
{
    float rcR = length(vRcW.yz - uCenter);
    totalEmissiveRadiance += vec3(1.0, 0.85, 0.3) * smoothstep(1.7, 2.1, rcR) * uGrowAmp * 0.25;
}`,
});

/* ───────────────────────── Proteínas em nuvem ───────────────────────── */

/** Grão de superfície nas esferas das proteínas (relevo leve; some quando fica sub-pixel). */
export const CLOUD_GRAIN = makePatch({
    key: 'cloud',
    vertPars: 'varying vec3 vRcObj;',
    vert: /* glsl */ `
vRcObj = position * 3.2;
#ifdef USE_INSTANCING
    vRcObj += instanceMatrix[3].xyz * 7.0;
#endif
`,
    fragPars: 'varying vec3 vRcObj;',
    normal: /* glsl */ `
{
    float rcPx = length(fwidth(vRcObj));
    float rcFade = 1.0 - smoothstep(0.3, 0.7, rcPx);
    // relevo de senos entrelaçados: barato (a nuvem cobre muita tela de perto) e sem padrão visível
    vec3 rcN = sin(vRcObj.yzx * 2.7 + 1.7 * sin(vRcObj.zxy * 1.9));
    normal = normalize(normal + rcN * 0.3 * rcFade);
    diffuseColor.rgb *= 1.0 + 0.06 * rcN.x * rcFade;
}`,
});

/* ───────────────────────── Envelope nuclear (ShaderMaterial próprio) ───────────────────────── */

export const ENVELOPE_NOISE = NOISE_GLSL;
