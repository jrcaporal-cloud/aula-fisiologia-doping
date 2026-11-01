import { useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LUMEN_R, THROMBUS_X, VESSEL_LEN, WALL_THICKNESS } from './geometry';

export interface WallInputs {
    /** 0–1: espessamento do sangue (escurece o plasma). */
    thickness: number;
    /** 0–1: brilho de alerta no endotélio sob o microtrombo. */
    danger: number;
}

interface VesselWallProps {
    /** Lido a cada quadro, sem re-render do React. */
    getInputs: () => WallInputs;
}

const VERT = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorld;
void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorld = wp.xyz;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

/** Voronoi (Inigo Quilez) com distância à borda: desenha células endoteliais alongadas no sentido do fluxo. */
const VORONOI = /* glsl */ `
const float CELLS_AROUND = 22.0;
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453);
}
vec2 cellHash(vec2 n) { return hash2(vec2(mod(n.x, CELLS_AROUND), n.y)); }
// x: distância à borda; y: distância ao centro (núcleo); z: id da célula
vec3 voronoi(vec2 x) {
    vec2 n = floor(x);
    vec2 f = fract(x);
    vec2 mg; vec2 mr; float md = 8.0;
    for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 o = 0.15 + 0.7 * cellHash(n + g);
        vec2 r = g + o - f;
        float d = dot(r, r);
        if (d < md) { md = d; mr = r; mg = g; }
    }
    float ed = 8.0;
    for (int j = -2; j <= 2; j++) for (int i = -2; i <= 2; i++) {
        vec2 g = mg + vec2(float(i), float(j));
        vec2 o = 0.15 + 0.7 * cellHash(n + g);
        vec2 r = g + o - f;
        if (dot(mr - r, mr - r) > 0.00001) ed = min(ed, dot(0.5 * (mr + r), normalize(r - mr)));
    }
    return vec3(ed, length(mr * vec2(1.0, 1.6)), cellHash(n + mg).x);
}
`;

const BACK_FRAG = /* glsl */ `
uniform float uThick;
uniform float uDanger;
uniform float uTime;
uniform float uThrombusX;
uniform vec3 uTissueA;
uniform vec3 uTissueB;
uniform vec3 uJunction;
uniform vec3 uNucleus;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorld;
${VORONOI}
void main() {
    vec2 p = vec2(vUv.x * CELLS_AROUND, vUv.y * 15.0);
    vec3 v = voronoi(p);
    vec3 base = mix(uTissueA, uTissueB, 0.35 + 0.65 * v.z);
    float junction = 1.0 - smoothstep(0.012, 0.045, v.x);
    float nucleus = 1.0 - smoothstep(0.13, 0.19, v.y);
    vec3 col = mix(base, uNucleus, nucleus * 0.6);
    col = mix(col, uJunction, junction * 0.26);
    // Luz difusa na face interna (normal invertida) + escurecimento nas bordas do tubo.
    vec3 n = -normalize(vNormalW);
    float lambert = 0.38 + 0.62 * max(dot(n, normalize(vec3(0.2, 0.85, 0.5))), 0.0);
    float depthShade = smoothstep(-1.6, 0.6, vWorld.y * 0.6 - vWorld.z * 0.4);
    col *= lambert * (0.55 + 0.45 * depthShade);
    // Sangue mais espesso: lúmen mais escuro e saturado.
    col *= 1.0 - 0.32 * uThick;
    // Alerta: endotélio sob o trombo pulsa em vermelho.
    float near = exp(-pow(vWorld.x - uThrombusX, 2.0) / 0.9);
    col += vec3(1.0, 0.12, 0.22) * uDanger * near * (0.55 + 0.45 * sin(uTime * 3.14159));
    // Esvanecimento nas pontas do trecho de vaso.
    float edgeFade = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);
    gl_FragColor = vec4(col * edgeFade, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
`;

const FRONT_FRAG = /* glsl */ `
uniform vec3 uRim;
varying vec2 vUv;
varying vec3 vNormalW;
varying vec3 vWorld;
${VORONOI}
void main() {
    vec3 viewDir = normalize(cameraPosition - vWorld);
    float fres = pow(1.0 - abs(dot(normalize(vNormalW), viewDir)), 2.6);
    vec2 p = vec2(vUv.x * CELLS_AROUND, vUv.y * 15.0);
    float junction = 1.0 - smoothstep(0.02, 0.06, voronoi(p).x);
    float edgeFade = smoothstep(0.0, 0.1, vUv.y) * smoothstep(1.0, 0.9, vUv.y);
    float alpha = (0.03 + 0.55 * fres + 0.07 * junction) * edgeFade;
    gl_FragColor = vec4(uRim * (0.6 + 0.8 * fres), alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
`;

const createWallMaterials = () => {
    const back = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: BACK_FRAG,
        side: THREE.BackSide,
        uniforms: {
            uThick: { value: 0 },
            uDanger: { value: 0 },
            uTime: { value: 0 },
            uThrombusX: { value: THROMBUS_X },
            uTissueA: { value: new THREE.Color('#2a0614') },
            uTissueB: { value: new THREE.Color('#561629') },
            uJunction: { value: new THREE.Color('#f9a8c0') },
            uNucleus: { value: new THREE.Color('#3b1550') },
        },
    });
    const front = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRONT_FRAG,
        side: THREE.FrontSide,
        transparent: true,
        depthWrite: false,
        uniforms: { uRim: { value: new THREE.Color('#fecdd3') } },
    });
    const update = (time: number, thickness: number, danger: number) => {
        back.uniforms.uTime.value = time;
        back.uniforms.uThick.value = thickness;
        back.uniforms.uDanger.value = danger;
    };
    return { back, front, update };
};

/**
 * Parede do vaso em corte: a face interna do lado de trás é o endotélio (opaco, com
 * células e núcleos), e a face da frente é uma película translúcida com borda de Fresnel.
 */
export const VesselWall = ({ getInputs }: VesselWallProps) => {
    const geometry = useMemo(() => {
        const g = new THREE.CylinderGeometry(LUMEN_R, LUMEN_R, VESSEL_LEN, 96, 1, true);
        g.rotateZ(Math.PI / 2);
        return g;
    }, []);
    const outerGeometry = useMemo(() => {
        const g = new THREE.CylinderGeometry(LUMEN_R + WALL_THICKNESS, LUMEN_R + WALL_THICKNESS, VESSEL_LEN, 96, 1, true);
        g.rotateZ(Math.PI / 2);
        return g;
    }, []);

    const wall = useMemo(() => createWallMaterials(), []);
    useEffect(() => () => {
        [geometry, outerGeometry, wall.back, wall.front].forEach(o => o.dispose());
    }, [geometry, outerGeometry, wall]);

    useFrame(({ clock }) => {
        const { thickness, danger } = getInputs();
        wall.update(clock.elapsedTime, thickness, danger);
    });

    return (
        <group>
            <mesh geometry={geometry} material={wall.back} renderOrder={0} />
            <mesh geometry={outerGeometry} material={wall.front} renderOrder={10} />
        </group>
    );
};
