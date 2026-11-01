import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { arPose, h12Angle, makePose } from './choreo';
import { POCKET_LOCAL, V, W, ph, rng } from './layout';
import { Cloud, Glow } from './primitives';
import { curveCloud, type Sphere } from './geometry';
import type { TimeRef } from './types';
import type { LigandKind } from './molecules';
import { LIGANDS } from './ligandInfo';
import { useHover } from './useHover';

/*
 * Receptor androgênico estilizado: domínio de ligação (LBD) como feixe de hélices em "sanduíche" ao redor
 * de um bolsão central; a hélice 12 é uma tampa articulada; abaixo, o domínio de ligação ao DNA.
 */

const COIL_R = 0.25;
const PITCH = 0.54;
const PER_TURN = 14;

const coil = (start: THREE.Vector3, dir: THREE.Vector3, len: number, phase0: number, out: THREE.Vector3[]) => {
    const u = new THREE.Vector3().crossVectors(dir, Math.abs(dir.y) > 0.9 ? V(1, 0, 0) : V(0, 1, 0)).normalize();
    const v = new THREE.Vector3().crossVectors(dir, u).normalize();
    const n = Math.max(Math.round((len / PITCH) * PER_TURN), 4);
    for (let i = 0; i <= n; i++) {
        const s = (i / n) * len;
        const th = phase0 + (s / PITCH) * Math.PI * 2;
        out.push(start.clone().addScaledVector(dir, s).addScaledVector(u, Math.cos(th) * COIL_R).addScaledVector(v, Math.sin(th) * COIL_R));
    }
};

/** Pontos do esqueleto do receptor: DBD (2 hélices) → dobradiça → 9 hélices do LBD em torno do bolsão. */
const buildChain = () => {
    const rand = rng(11);
    const pts: THREE.Vector3[] = [];
    // DBD
    coil(V(-0.1, -2.15, -0.55), V(0, 0.15, 1).normalize(), 1.1, 0, pts);
    pts.push(V(0.55, -2.65, 0.9));
    coil(V(0.75, -2.55, 0.4), V(-0.2, 0.05, -1).normalize(), 0.9, 1, pts);
    pts.push(V(0.9, -2.0, -0.8), V(1.25, -1.75, 0.1));
    // LBD
    const angles = [45, 82, 118, 152, 186, 220, 256, 292, 326];
    angles.forEach((deg, k) => {
        const a = (deg * Math.PI) / 180;
        const r = k % 2 === 0 ? 1.62 : 1.98;
        const up = k % 2 === 0;
        const len = 2.3 + rand() * 0.5;
        const tangent = V(-Math.sin(a), 0, Math.cos(a));
        const dir = V(0, 1, 0).addScaledVector(tangent, (rand() - 0.5) * 0.55).normalize();
        if (!up) dir.negate();
        const center = V(Math.cos(a) * r, (rand() - 0.5) * 0.3, Math.sin(a) * r);
        const start = center.clone().addScaledVector(dir, -len / 2);
        if (k > 0) {
            // alça: passa por fora do feixe
            const prev = pts[pts.length - 1];
            const mid = prev.clone().lerp(start, 0.5);
            const radial = V(mid.x, 0, mid.z).normalize().multiplyScalar(0.55);
            mid.add(radial);
            mid.y += up ? -0.45 : 0.45;
            pts.push(mid);
        }
        coil(start, dir, len, rand() * 6, pts);
    });
    return pts;
};

const H12_PIVOT = V(1.85, 1.25, -0.25);

const tubeWithGradient = (pts: THREE.Vector3[], radius: number, stops: string[]) => {
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal', 0.5);
    const segs = pts.length * 3;
    const radial = 7;
    const geo = new THREE.TubeGeometry(curve, segs, radius, radial, false);
    const colors = new Float32Array((segs + 1) * (radial + 1) * 3);
    const cs = stops.map(s => new THREE.Color(s));
    const c = new THREE.Color();
    for (let i = 0; i <= segs; i++) {
        const u = (i / segs) * (cs.length - 1);
        const k = Math.min(Math.floor(u), cs.length - 2);
        c.copy(cs[k]).lerp(cs[k + 1], u - k);
        for (let j = 0; j <= radial; j++) c.toArray(colors, (i * (radial + 1) + j) * 3);
    }
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
};

interface ArmSet { a: Sphere[]; b: Sphere[] }
const buildHsp = (seed: number): ArmSet => {
    const arm = (side: number) => new THREE.CatmullRomCurve3([
        V(-1.75, -2.0, side * 0.35),
        V(-2.35, -0.6, side * 0.95),
        V(-2.5, 0.9, side * 1.35),
        V(-2.15, 2.0, side * 1.25),
    ]);
    return {
        a: curveCloud(seed, arm(1), 54, 0.36, 0.3, 0.46),
        b: curveCloud(seed + 7, arm(-1), 54, 0.36, 0.3, 0.46),
    };
};

interface ReceptorProps { timeRef: TimeRef; ligand: LigandKind }

const Monomer = ({ index, chainGeo, h12Geo, timeRef, ligand }: { index: number; chainGeo: THREE.BufferGeometry; h12Geo: THREE.BufferGeometry } & ReceptorProps) => {
    const root = useRef<THREE.Group>(null);
    const h12 = useRef<THREE.Group>(null);
    const hspA = useRef<THREE.Group>(null);
    const hspB = useRef<THREE.Group>(null);
    const matA = useRef<THREE.MeshStandardMaterial>(null);
    const matB = useRef<THREE.MeshStandardMaterial>(null);
    const glow = useRef<THREE.Sprite>(null);
    const pose = useMemo(() => makePose(), []);
    const hsp = useMemo(() => buildHsp(31 + index * 17), [index]);
    const hoverAR = useHover('Receptor androgênico (AR)', 'Fator de transcrição ativado por ligante. O domínio de ligação (LBD) tem um bolsão para o androgênio; a hélice 12 fecha sobre ele como uma tampa.');
    const hoverHsp = useHover('Chaperonas HSP90 / HSP70', 'Proteínas chaperonas inibitórias: mantêm o AR inativo no citosol e se dissociam após a ligação do androgênio.');
    const info = LIGANDS[ligand];

    useFrame(({ clock }) => {
        const T = timeRef.current.t;
        const g = root.current;
        if (!g) return;
        arPose(index, T, clock.elapsedTime, pose);
        g.position.copy(pose.p);
        g.quaternion.copy(pose.q);
        if (h12.current) h12.current.rotation.z = h12Angle(T, ligand === 'sarm') + Math.sin(clock.elapsedTime * 1.6 + index) * 0.03 * (1 - ph(T, W.h12));
        const rel = ph(T, [W.hsp[0] + index * 0.04, W.hsp[1]]);
        const gone = ph(T, [2.05, 2.55]);
        const side = index === 0 ? 1 : -1;
        if (hspA.current && hspB.current) {
            hspA.current.position.set(-rel * 2.2, rel * 1.1, rel * 1.3 * side);
            hspB.current.position.set(-rel * 2.6, rel * 0.3, -rel * 1.5 * side);
            hspA.current.rotation.z = rel * 0.6;
            hspB.current.rotation.x = -rel * 0.5;
            hspA.current.visible = hspB.current.visible = gone < 0.999;
        }
        const op = (1 - 0.55 * rel) * (1 - gone);
        if (matA.current) matA.current.opacity = op;
        if (matB.current) matB.current.opacity = op;
        if (glow.current) {
            const bound = ph(T, W.h12);
            const m = glow.current.material as THREE.SpriteMaterial;
            m.opacity = bound * info.glow * (0.85 + 0.15 * Math.sin(clock.elapsedTime * 2.4));
        }
    });

    return (
        <group ref={root}>
            <mesh geometry={chainGeo}>
                <meshStandardMaterial vertexColors roughness={0.42} metalness={0.05} />
            </mesh>
            <group ref={h12} position={H12_PIVOT}>
                <mesh geometry={h12Geo}>
                    <meshStandardMaterial color="#22D3EE" emissive="#0e7490" emissiveIntensity={0.55} roughness={0.35} />
                </mesh>
            </group>
            {/* zinco dos dedos de zinco do DBD */}
            <mesh position={[0.1, -1.85, 0.55]} scale={0.17}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.25} /></mesh>
            <mesh position={[0.55, -2.4, -0.65]} scale={0.17}><sphereGeometry args={[1, 14, 10]} /><meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.25} /></mesh>
            <Glow spriteRef={glow} color={info.color} size={2.6} opacity={0} position={[POCKET_LOCAL.x, POCKET_LOCAL.y, POCKET_LOCAL.z]} />
            <group ref={hspA}><Cloud spheres={hsp.a} color="#a78bfa" color2="#7c3aed" roughness={0.7} opacity={0.999} materialRef={matA} /></group>
            <group ref={hspB}><Cloud spheres={hsp.b} color="#c4b5fd" color2="#8b5cf6" roughness={0.7} opacity={0.999} materialRef={matB} /></group>
            {/* alvos de hover (baratos de testar) */}
            <mesh {...hoverAR} scale={[2.3, 2.6, 2.3]} position={[0.2, -0.2, 0]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
            <mesh {...hoverHsp} scale={[0.9, 2.2, 1.4]} position={[-2.3, 0, 0]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
        </group>
    );
};

export const Receptors = ({ timeRef, ligand }: ReceptorProps) => {
    const chainGeo = useMemo(() => tubeWithGradient(buildChain(), 0.085, ['#fde68a', '#fbbf24', '#fb923c', '#f97316', '#f43f5e']), []);
    const h12Geo = useMemo(() => {
        const pts: THREE.Vector3[] = [V(-0.35, 0.25, 0), V(-0.1, 0.05, 0)];
        coil(V(0, -0.05, 0.05), V(0, -1, 0.12).normalize(), 1.5, 0, pts);
        return tubeWithGradient(pts, 0.1, ['#67e8f9', '#22d3ee']);
    }, []);
    return (
        <>
            <Monomer index={0} chainGeo={chainGeo} h12Geo={h12Geo} timeRef={timeRef} ligand={ligand} />
            <Monomer index={1} chainGeo={chainGeo} h12Geo={h12Geo} timeRef={timeRef} ligand={ligand} />
        </>
    );
};
