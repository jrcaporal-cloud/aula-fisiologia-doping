import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PEPTIDE_N, RIBO_EXIT_LOCAL, finalRiboPose, makePose, peptideBeads, riboAssembly, riboPose } from './choreo';
import { W, phase } from './layout';
import { Cloud } from './primitives';
import { SPHERE_GEO, STICK_GEO, ellipsoidCloud, stickMatrix } from './geometry';
import { DELIVERY_TARGETS } from './sarcLattice';
import type { TimeRef } from './types';
import { useHover } from './useHover';
import { commitInstances, raycastIfShown } from './instancing';

/*
 * Tradução: subunidades menor e maior do ribossomo se encaixam sobre o mRNA e o percorrem; a cadeia
 * polipeptídica sai pelo túnel da subunidade maior, cresce e se dobra. Depois, as proteínas prontas
 * seguem até a miofibrila.
 */

const LARGE = ellipsoidCloud(61, 250, [1.6, 1.15, 1.4], 0.3, 0.5, p => p.y > -0.85);
const SMALL = ellipsoidCloud(67, 140, [1.2, 0.62, 1.0], 0.28, 0.44, p => p.y < 0.45);
const LARGE_Y = 1.15;
const SMALL_Y = -0.78;

const tmpM = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const sc = new THREE.Vector3();
const DELIVER_N = DELIVERY_TARGETS.length;
const PEP_R = new THREE.Vector3(0.15, 0.15, 0.15);

export const Translation = ({ timeRef }: { timeRef: TimeRef }) => {
    const ribo = useRef<THREE.Group>(null);
    const large = useRef<THREE.Group>(null);
    const small = useRef<THREE.Group>(null);
    const pepRef = useRef<THREE.InstancedMesh>(null);
    const pepLinks = useRef<THREE.InstancedMesh>(null);
    const parcels = useRef<THREE.InstancedMesh>(null);
    const pose = useMemo(() => makePose(), []);
    const exit = useMemo(() => new THREE.Vector3(), []);
    const beads = useMemo(() => Array.from({ length: PEPTIDE_N }, () => new THREE.Vector3()), []);
    const start = useMemo(() => RIBO_EXIT_LOCAL.clone().applyQuaternion(finalRiboPose.q).add(finalRiboPose.p), []);
    const lastT = useRef(-1);
    const hoverR = useHover('Ribossomo', 'Subunidades menor e maior se encaixam sobre o mRNA e leem os códons; a cadeia polipeptídica sai pelo túnel da subunidade maior.');
    const hoverP = useHover('Cadeia polipeptídica', 'Proteína nascente (actina / miosina pesada): cresce aminoácido a aminoácido e se dobra.');

    useFrame(() => {
        const T = timeRef.current.t;
        if (Math.abs(T - lastT.current) < 1e-5) return;
        lastT.current = T;
        const asm = riboAssembly(T);
        riboPose(T, pose);
        if (ribo.current) {
            ribo.current.position.copy(pose.p);
            ribo.current.quaternion.copy(pose.q);
            ribo.current.visible = asm > 0.001;
        }
        if (large.current) large.current.position.set(0, LARGE_Y + (1 - asm) * 3.5, (1 - asm) * 1.5);
        if (small.current) small.current.position.set(0, SMALL_Y - (1 - asm) * 3.0, -(1 - asm) * 1.2);
        large.current?.scale.setScalar(0.4 + 0.6 * asm);
        small.current?.scale.setScalar(0.4 + 0.6 * asm);

        exit.copy(RIBO_EXIT_LOCAL).applyQuaternion(pose.q).add(pose.p);
        // a cadeia nascente é um prefixo (0 … n-1): count corta o resto
        const n = peptideBeads(T, exit, pose.q, beads);
        const pm = pepRef.current;
        const pl = pepLinks.current;
        if (pm && pl) {
            for (let j = 0; j < n; j++) {
                pm.setMatrixAt(j, tmpM.compose(beads[j], q0, PEP_R));
                if (j < n - 1) pl.setMatrixAt(j, stickMatrix(beads[j], beads[j + 1], 0.06, tmpM));
            }
            commitInstances(pm, n);
            commitInstances(pl, Math.max(n - 1, 0));
        }
        const pc = parcels.current;
        if (pc) {
            let w = 0;
            for (let k = 0; k < DELIVER_N; k++) {
                const a = W.deliver[0] + k * 0.07;
                const u = phase(T, a, a + 0.36);
                if (u <= 0 || u >= 1) continue;
                sc.copy(start).lerp(DELIVERY_TARGETS[k], u);
                sc.y += Math.sin(Math.PI * u) * 1.8;
                sc.z += Math.sin(Math.PI * u) * 1.2;
                const r = 0.42 * (1 - 0.4 * u);
                pc.setMatrixAt(w++, tmpM.makeScale(r, r, r).setPosition(sc));
            }
            commitInstances(pc, w);
        }
    });

    return (
        <group>
            <group ref={ribo} visible={false}>
                <group ref={large}><Cloud spheres={LARGE} color="#38bdf8" color2="#0284c7" roughness={0.6} /></group>
                <group ref={small}><Cloud spheres={SMALL} color="#7dd3fc" color2="#38bdf8" roughness={0.6} /></group>
                {/* alvo de hover em casca simples (as ~390 esferas das subunidades não entram no raycast) */}
                <mesh {...hoverR} position={[0, 0.45, 0]} scale={[1.75, 1.95, 1.55]} raycast={raycastIfShown}>
                    <sphereGeometry args={[1, 10, 8]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
                </mesh>
            </group>
            <instancedMesh ref={pepRef} args={[SPHERE_GEO, undefined, PEPTIDE_N]} frustumCulled={false} {...hoverP}>
                <meshStandardMaterial color="#fde047" emissive="#ca8a04" emissiveIntensity={0.55} roughness={0.35} />
            </instancedMesh>
            <instancedMesh ref={pepLinks} args={[STICK_GEO, undefined, PEPTIDE_N - 1]} frustumCulled={false}>
                <meshStandardMaterial color="#fef08a" emissive="#a16207" emissiveIntensity={0.4} />
            </instancedMesh>
            <instancedMesh ref={parcels} args={[SPHERE_GEO, undefined, DELIVER_N]} frustumCulled={false}>
                <meshStandardMaterial color="#fde047" emissive="#facc15" emissiveIntensity={1.4} roughness={0.4} toneMapped={false} />
            </instancedMesh>
        </group>
    );
};
