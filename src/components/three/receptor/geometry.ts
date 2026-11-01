import * as THREE from 'three';
import { rng } from './layout';

const UP = new THREE.Vector3(0, 1, 0);
const tmpQ = new THREE.Quaternion();
const tmpS = new THREE.Vector3();
const tmpP = new THREE.Vector3();

/** Matriz de um cilindro unitário (eixo y) ligando a → b. */
export const stickMatrix = (a: THREE.Vector3, b: THREE.Vector3, r: number, out: THREE.Matrix4) => {
    tmpP.subVectors(b, a);
    const len = tmpP.length();
    if (len < 1e-6) return out.makeScale(0, 0, 0);
    tmpQ.setFromUnitVectors(UP, tmpP.multiplyScalar(1 / len));
    tmpS.set(r, len, r);
    tmpP.addVectors(a, b).multiplyScalar(0.5);
    return out.compose(tmpP, tmpQ, tmpS);
};

export const SPHERE_GEO = new THREE.SphereGeometry(1, 14, 10);
export const SPHERE_LO = new THREE.SphereGeometry(1, 10, 7);
export const STICK_GEO = new THREE.CylinderGeometry(1, 1, 1, 8, 1, true);

export interface Sphere { p: THREE.Vector3; r: number; shade: number }

/** Nuvem dentro de um elipsoide; `keep` filtra (ex.: abrir um canal). */
export const ellipsoidCloud = (
    seed: number, count: number, radii: [number, number, number], rMin: number, rMax: number,
    keep?: (p: THREE.Vector3) => boolean,
): Sphere[] => {
    const rand = rng(seed);
    const out: Sphere[] = [];
    let guard = 0;
    while (out.length < count && guard++ < count * 40) {
        const p = new THREE.Vector3(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
        if (p.lengthSq() > 1) continue;
        // empurra para a casca: superfície mais "cheia"
        p.setLength(0.5 + 0.5 * Math.cbrt(p.length()));
        p.set(p.x * radii[0], p.y * radii[1], p.z * radii[2]);
        if (keep && !keep(p)) continue;
        out.push({ p, r: rMin + (rMax - rMin) * rand(), shade: rand() });
    }
    return out;
};

/** Nuvem ao longo de uma curva (braços, filamentos). */
export const curveCloud = (seed: number, curve: THREE.Curve<THREE.Vector3>, count: number, thick: number, rMin: number, rMax: number): Sphere[] => {
    const rand = rng(seed);
    return Array.from({ length: count }, (_, i) => {
        const u = (i + rand() * 0.8) / count;
        const p = curve.getPoint(u);
        const taper = 0.75 + 0.25 * Math.sin(Math.PI * u);
        p.add(new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(thick * 2 * taper));
        return { p, r: (rMin + (rMax - rMin) * rand()) * taper, shade: rand() };
    });
};

let glowTex: THREE.Texture | null = null;
export const getGlowTexture = () => {
    if (glowTex) return glowTex;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    if (g) {
        const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
        grd.addColorStop(0, 'rgba(255,255,255,1)');
        grd.addColorStop(0.25, 'rgba(255,255,255,0.55)');
        grd.addColorStop(0.6, 'rgba(255,255,255,0.12)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd;
        g.fillRect(0, 0, 128, 128);
    }
    glowTex = new THREE.CanvasTexture(c);
    return glowTex;
};

