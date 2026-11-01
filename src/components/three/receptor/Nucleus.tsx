import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { NUCLEUS_CENTER, NUCLEUS_R, NUCLEUS_R_INNER, NUC_CUT_ANG, NUC_CUT_DIR, PORE_DIRS, PORE_HOLE, rng } from './layout';
import { SPHERE_LO } from './geometry';
import { useHover } from './useHover';

/*
 * Envelope nuclear: duas membranas (externa e interna) com borda de Fresnel e furos onde estão os
 * complexos de poro (anel citoplasmático, anel nuclear, raios e "cesta" nuclear).
 */

const vert = /* glsl */ `
varying vec3 vN; varying vec3 vView; varying vec3 vDir;
void main(){
  vDir = normalize(position);
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - wp.xyz);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const frag = /* glsl */ `
uniform vec3 uColor; uniform vec3 uRim; uniform float uOpacity; uniform float uCosHole; uniform vec3 uPores[${PORE_DIRS.length}];
uniform vec3 uCutDir; uniform float uCosCut;
varying vec3 vN; varying vec3 vView; varying vec3 vDir;
void main(){
  float edge = 0.0;
  float cc = dot(vDir, uCutDir);
  if (cc > uCosCut) discard;
  float cutEdge = smoothstep(uCosCut - 0.006, uCosCut, cc);
  for (int i = 0; i < ${PORE_DIRS.length}; i++) {
    float c = dot(vDir, uPores[i]);
    if (c > uCosHole) discard;
    edge = max(edge, smoothstep(uCosHole - 0.004, uCosHole, c));
  }
  float f = pow(clamp(1.0 - abs(dot(normalize(vN), normalize(vView))), 0.0, 1.0), 2.2);
  vec3 col = mix(uColor, uRim, f) + uRim * (edge * 0.8 + cutEdge * 1.4);
  gl_FragColor = vec4(col, uOpacity * (0.1 + 0.85 * f) + edge * 0.35 + cutEdge * 0.75);
}`;

const envelopeMaterial = (r: number, color: string, rim: string, opacity: number) => new THREE.ShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    uniforms: {
        uColor: { value: new THREE.Color(color) },
        uRim: { value: new THREE.Color(rim) },
        uOpacity: { value: opacity },
        uCosHole: { value: Math.cos(PORE_HOLE / r) },
        uPores: { value: PORE_DIRS },
        uCutDir: { value: NUC_CUT_DIR },
        uCosCut: { value: Math.cos(NUC_CUT_ANG) },
    },
});

const Z = new THREE.Vector3(0, 0, 1);

/** Complexos de poro: anel citoplasmático + anel nuclear + 8 raios que atravessam as duas membranas. */
const Pores = () => {
    const rings = useRef<THREE.InstancedMesh>(null);
    const spokes = useRef<THREE.InstancedMesh>(null);
    const ringGeo = useMemo(() => new THREE.TorusGeometry(PORE_HOLE + 0.12, 0.3, 12, 48), []);
    const SPOKES = 8;
    const hover = useHover('Complexo do poro nuclear', 'Canal que atravessa as duas membranas do envelope nuclear: o dímero AR–ligante entra ativamente no núcleo e o mRNA sai para o citoplasma.');

    useLayoutEffect(() => {
        const r = rings.current;
        const s = spokes.current;
        if (!r || !s) return;
        const m = new THREE.Matrix4();
        const q = new THREE.Quaternion();
        const p = new THREE.Vector3();
        const u = new THREE.Vector3();
        const v = new THREE.Vector3();
        const one = new THREE.Vector3(1, 1, 1);
        const rand = rng(3);
        let si = 0;
        PORE_DIRS.forEach((d, k) => {
            q.setFromUnitVectors(Z, d);
            u.set(1, 0, 0).applyQuaternion(q);
            v.set(0, 1, 0).applyQuaternion(q);
            p.copy(d).multiplyScalar((NUCLEUS_R + NUCLEUS_R_INNER) / 2).add(NUCLEUS_CENTER);
            r.setMatrixAt(k, m.compose(p, q, one));
            for (let i = 0; i < SPOKES; i++) {
                const ang = (i / SPOKES) * Math.PI * 2 + rand() * 0.1;
                const c = Math.cos(ang);
                const sn = Math.sin(ang);
                for (let t = 0; t < 2; t++) {
                    const rad = t === 0 ? NUCLEUS_R + 0.32 : NUCLEUS_R_INNER - 0.32;
                    p.copy(d).multiplyScalar(rad).add(NUCLEUS_CENTER)
                        .addScaledVector(u, c * (PORE_HOLE - 0.05)).addScaledVector(v, sn * (PORE_HOLE - 0.05));
                    const sz = 0.36 + rand() * 0.08;
                    s.setMatrixAt(si++, m.compose(p, q, new THREE.Vector3(sz, sz, sz)));
                }
            }
        });
        [r, s].forEach(x => { x.instanceMatrix.needsUpdate = true; x.computeBoundingSphere(); });
    }, []);

    return (
        <group>
            <instancedMesh ref={rings} args={[ringGeo, undefined, PORE_DIRS.length]} {...hover}>
                <meshStandardMaterial color="#a5b4fc" emissive="#4f46e5" emissiveIntensity={0.35} roughness={0.45} />
            </instancedMesh>
            <instancedMesh ref={spokes} args={[SPHERE_LO, undefined, PORE_DIRS.length * SPOKES * 2]}>
                <meshStandardMaterial color="#818cf8" roughness={0.6} />
            </instancedMesh>
        </group>
    );
};

export const Nucleus = () => {
    const outer = useMemo(() => envelopeMaterial(NUCLEUS_R, '#1e1b4b', '#818cf8', 0.85), []);
    const inner = useMemo(() => envelopeMaterial(NUCLEUS_R_INNER, '#1e1b4b', '#6366f1', 0.6), []);
    const geoO = useMemo(() => new THREE.SphereGeometry(NUCLEUS_R, 120, 80), []);
    const geoI = useMemo(() => new THREE.SphereGeometry(NUCLEUS_R_INNER, 120, 80), []);
    return (
        <group>
            <mesh geometry={geoO} material={outer} position={NUCLEUS_CENTER} renderOrder={2} />
            <mesh geometry={geoI} material={inner} position={NUCLEUS_CENTER} renderOrder={1} />
            <Pores />
        </group>
    );
};
