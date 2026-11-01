import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MRNA_N, dimerFrame, makePose, mrnaBeads, rnapPose } from './choreo';
import { V, W, ph } from './layout';
import { Cloud, Glow } from './primitives';
import { SPHERE_GEO, STICK_GEO, ellipsoidCloud, stickMatrix } from './geometry';
import type { TimeRef } from './types';
import { useHover } from './useHover';

/*
 * Maquinaria de transcrição: coativador SRC-1 (atraído pelo dímero no ARE), RNA polimerase II em corte
 * (pinça aberta para a câmera, para ver a bolha) e o mRNA nascente.
 */

const CUT_DIR = Math.atan2(9.5, 9);
const RNAP_SPHERES = ellipsoidCloud(41, 240, [1.95, 1.9, 1.75], 0.28, 0.46, p => {
    if (Math.hypot(p.x, p.y) < 1.85) return false; // canal do DNA
    const a = Math.atan2(p.y, p.x);
    let d = Math.abs(a - CUT_DIR);
    if (d > Math.PI) d = Math.PI * 2 - d;
    return d > 0.95; // recorte voltado para a câmera
});
const SRC_SPHERES = ellipsoidCloud(53, 80, [0.95, 0.75, 0.85], 0.26, 0.4);

const tmpM = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const sc = new THREE.Vector3();

export const Transcription = ({ timeRef }: { timeRef: TimeRef }) => {
    const rnap = useRef<THREE.Group>(null);
    const src = useRef<THREE.Group>(null);
    const beadsRef = useRef<THREE.InstancedMesh>(null);
    const linksRef = useRef<THREE.InstancedMesh>(null);
    const pose = useMemo(() => makePose(), []);
    const beads = useMemo(() => Array.from({ length: MRNA_N }, () => new THREE.Vector3()), []);
    const rp = useMemo(() => new THREE.Vector3(), []);
    const lastT = useRef(-1);
    const hoverPol = useHover('RNA polimerase II', 'Recrutada pelos coativadores, abre localmente a dupla-hélice e desliza sobre a fita-molde sintetizando o mRNA.');
    const hoverSrc = useHover('Coativador SRC-1', 'Recrutado pelo AR ligado ao ARE; conecta o receptor à maquinaria de transcrição.');
    const hoverM = useHover('mRNA', 'Transcrito dos genes de proteínas estruturais (actina, miosina pesada). Sai do núcleo pelo poro e é traduzido no citoplasma.');

    useFrame(() => {
        const T = timeRef.current.t;
        if (Math.abs(T - lastT.current) < 1e-5) return;
        lastT.current = T;
        if (rnap.current) {
            const { scale } = rnapPose(T, rp);
            rnap.current.position.copy(rp);
            rnap.current.scale.setScalar(Math.max(scale, 0.001));
            rnap.current.visible = scale > 0.01;
        }
        if (src.current) {
            const k = ph(T, W.src1);
            dimerFrame(T, pose);
            src.current.position.copy(V(0.1, 2.55, 0).applyQuaternion(pose.q).add(pose.p)).add(V(3, 4, 2.5).multiplyScalar(1 - k));
            src.current.scale.setScalar(Math.max(k, 0.001));
            src.current.visible = k > 0.01;
        }
        const b = beadsRef.current;
        const l = linksRef.current;
        if (!b || !l) return;
        mrnaBeads(T, beads);
        for (let i = 0; i < MRNA_N; i++) {
            const hidden = beads[i].y < -900;
            const r = hidden ? 0 : 0.17;
            b.setMatrixAt(i, tmpM.compose(beads[i], q0, sc.set(r, r, r)));
            if (i < MRNA_N - 1) {
                const ok = !hidden && beads[i + 1].y > -900;
                l.setMatrixAt(i, ok ? stickMatrix(beads[i], beads[i + 1], 0.07, tmpM) : tmpM.makeScale(0, 0, 0));
            }
        }
        b.instanceMatrix.needsUpdate = true;
        l.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <group ref={rnap} visible={false}>
                <Cloud spheres={RNAP_SPHERES} color="#94a3b8" color2="#64748b" roughness={0.65} />
                <Glow color="#f472b6" size={1.6} opacity={0.55} />
                <mesh {...hoverPol} scale={2.1}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} /></mesh>
            </group>
            <group ref={src} visible={false}>
                <Cloud spheres={SRC_SPHERES} color="#2dd4bf" color2="#0d9488" roughness={0.6} />
                <mesh {...hoverSrc} scale={1}><sphereGeometry args={[1, 10, 8]} /><meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} /></mesh>
            </group>
            <instancedMesh ref={beadsRef} args={[SPHERE_GEO, undefined, MRNA_N]} frustumCulled={false} {...hoverM}>
                <meshStandardMaterial color="#f472b6" emissive="#be185d" emissiveIntensity={0.45} roughness={0.35} />
            </instancedMesh>
            <instancedMesh ref={linksRef} args={[STICK_GEO, undefined, MRNA_N - 1]} frustumCulled={false}>
                <meshStandardMaterial color="#f9a8d4" emissive="#9d174d" emissiveIntensity={0.3} roughness={0.4} />
            </instancedMesh>
        </group>
    );
};
