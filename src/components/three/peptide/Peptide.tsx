import { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { V } from '../receptor/layout';
import { SPHERE_GEO, STICK_GEO, stickMatrix } from '../receptor/geometry';
import { Glow } from '../receptor/primitives';
import { useHover } from '../receptor/useHover';
import type { TimeRef } from '../receptor/types';
import { peptidePose } from './choreo';
import { MEM_HALF, ligandOf, type Side } from './layout';
import { PEPTIDE_LIGANDS } from './ligands';

/*
 * Peptídeo em bolas e varetas: esqueleto de resíduos (cor do ligante) com uma cadeia lateral por resíduo
 * — carregada (+ azul, − vermelho), polar (clara) ou apolar (cinza). Livre, fica estendido; no bolsão do
 * receptor, enrola. O análogo de GHRH é desenhado mais longo que o GHRP.
 */

type Res = '+' | '-' | 'p' | 'h';
const SEQ: Record<Side, Res[]> = {
    [-1]: ['+', 'h', 'p', 'h', 'h', '+'],
    [1]: ['p', 'h', '-', 'h', 'p', '+', '-', 'p', '+'],
} as Record<Side, Res[]>;
const SIDE_COLOR: Record<Res, string> = { '+': '#60A5FA', '-': '#F43F5E', p: '#F1F5F9', h: '#94A3B8' };

const extended = (j: number, n: number, out: THREE.Vector3) =>
    out.set((j - (n - 1) / 2) * 0.6, (j % 2 - 0.5) * 0.24, Math.sin(j * 1.3) * 0.12);
const coiled = (j: number, n: number, out: THREE.Vector3) => {
    const a = j * 1.75;
    return out.set(Math.cos(a) * 0.42, 0.75 - (j / (n - 1)) * (n > 6 ? 1.5 : 1.05), Math.sin(a) * 0.42);
};
const sideDir = (j: number, bb: THREE.Vector3, compact: number, out: THREE.Vector3) => {
    out.set(0, j % 2 === 0 ? 1 : -1, j % 3 === 0 ? 0.6 : -0.4).normalize();
    const radial = new THREE.Vector3(bb.x, 0, bb.z).normalize();
    return out.lerp(radial, compact).normalize();
};

const tmpM = new THREE.Matrix4();
const tq = new THREE.Quaternion();
const ts = new THREE.Vector3();
const ta = new THREE.Vector3();
const tb = new THREE.Vector3();
const tc = new THREE.Vector3();
const td = new THREE.Vector3();

interface ChainRefs { bb: THREE.InstancedMesh | null; sc: THREE.InstancedMesh | null; st: THREE.InstancedMesh | null }

/** Escreve as instâncias de uma cadeia (referencial local do grupo). */
const writeChain = (refs: ChainRefs, seq: Res[], compact: number) => {
    const { bb, sc, st } = refs;
    if (!bb || !sc || !st) return;
    const n = seq.length;
    let k = 0;
    for (let j = 0; j < n; j++) {
        extended(j, n, ta).lerp(coiled(j, n, tb), compact);
        bb.setMatrixAt(j, tmpM.compose(ta, tq, ts.set(0.27, 0.27, 0.27)));
        sideDir(j, ta, compact, tc);
        td.copy(ta).addScaledVector(tc, 0.5);
        sc.setMatrixAt(j, tmpM.compose(td, tq, ts.set(0.17, 0.17, 0.17)));
        st.setMatrixAt(k++, stickMatrix(ta, td, 0.06, tmpM));
        if (j < n - 1) {
            extended(j + 1, n, tb).lerp(coiled(j + 1, n, tc), compact);
            st.setMatrixAt(k++, stickMatrix(ta, tb, 0.07, tmpM));
        }
    }
    bb.instanceMatrix.needsUpdate = true;
    sc.instanceMatrix.needsUpdate = true;
    st.instanceMatrix.needsUpdate = true;
};

interface ChainProps { s: Side; compactRef?: { readonly current: number } }

const Chain = ({ s, compactRef }: ChainProps) => {
    const seq = SEQ[s];
    const color = PEPTIDE_LIGANDS[ligandOf(s)].color;
    const bbRef = useRef<THREE.InstancedMesh>(null);
    const scRef = useRef<THREE.InstancedMesh>(null);
    const stRef = useRef<THREE.InstancedMesh>(null);
    const lastC = useRef(-1);
    useLayoutEffect(() => {
        const sc = scRef.current;
        if (!sc) return;
        const c = new THREE.Color();
        seq.forEach((r, j) => sc.setColorAt(j, c.set(SIDE_COLOR[r])));
        if (sc.instanceColor) sc.instanceColor.needsUpdate = true;
    }, [seq]);
    useFrame(() => {
        const compact = compactRef?.current ?? 0;
        if (Math.abs(compact - lastC.current) < 1e-4) return;
        lastC.current = compact;
        writeChain({ bb: bbRef.current, sc: scRef.current, st: stRef.current }, seq, compact);
    });
    return (
        <>
            <instancedMesh ref={bbRef} args={[SPHERE_GEO, undefined, seq.length]} frustumCulled={false}>
                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.3} />
            </instancedMesh>
            <instancedMesh ref={scRef} args={[SPHERE_GEO, undefined, seq.length]} frustumCulled={false}>
                <meshStandardMaterial roughness={0.3} />
            </instancedMesh>
            <instancedMesh ref={stRef} args={[STICK_GEO, undefined, seq.length * 2 - 1]} frustumCulled={false}>
                <meshStandardMaterial color="#CBD5E1" roughness={0.45} />
            </instancedMesh>
        </>
    );
};

interface PeptideProps { active: Side; timeRef: TimeRef }

const MainPeptide = ({ active, timeRef }: PeptideProps) => {
    const g = useRef<THREE.Group>(null);
    const ring = useRef<THREE.Mesh>(null);
    const ringMat = useRef<THREE.MeshBasicMaterial>(null);
    const compactRef = useRef(0);
    const info = PEPTIDE_LIGANDS[ligandOf(active)];
    const hover = useHover(`Peptídeo (${info.name})`, 'Cadeia curta de aminoácidos, hidrossolúvel, com cargas e grupos polares: a bicamada lipídica a barra. Liga o receptor pela face de fora.');
    useFrame(({ clock }) => {
        const grp = g.current;
        if (!grp) return;
        const { compact, pulse } = peptidePose(active, timeRef.current.t, clock.elapsedTime, grp.position, grp.quaternion);
        compactRef.current = compact;
        if (ring.current && ringMat.current) {
            ring.current.visible = pulse > 0.01;
            ring.current.scale.setScalar(0.9 + 0.5 * pulse + Math.sin(clock.elapsedTime * 3) * 0.06 * pulse);
            ringMat.current.opacity = pulse * 0.85;
        }
    });
    return (
        <>
            <group ref={g}>
                <Chain key={active} s={active} compactRef={compactRef} />
                <Glow color={info.color} size={2.6} opacity={0.3} />
                <mesh {...hover} scale={[1.9, 0.9, 0.9]}>
                    <sphereGeometry args={[1, 10, 8]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
                </mesh>
            </group>
            {/* pulso vermelho onde o peptídeo bate e é barrado */}
            <mesh ref={ring} position={[active * 0.75, MEM_HALF + 0.24, 0.6]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
                <ringGeometry args={[0.85, 1.05, 48]} />
                <meshBasicMaterial ref={ringMat} color="#FB3B5C" transparent opacity={0} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
            </mesh>
        </>
    );
};

const DRIFT = [V(-9, 6.2, -2.5), V(8.5, 7.4, -3.5), V(-4.5, 8.8, -4.5), V(11.5, 4.6, 0.5)];

/** Outros peptídeos livres no meio extracelular (contexto). */
const Drifter = ({ s, i }: { s: Side; i: number }) => {
    const g = useRef<THREE.Group>(null);
    useFrame(({ clock }) => {
        const grp = g.current;
        if (!grp) return;
        const t = clock.elapsedTime * 0.3 + i * 1.9;
        grp.position.copy(DRIFT[i]).add(ta.set(Math.sin(t) * 0.8, Math.cos(t * 0.8) * 0.5, Math.sin(t * 0.6) * 0.6));
        grp.rotation.set(t * 0.7, t * 0.5, t * 0.3);
    });
    return <group ref={g}><Chain s={s} /></group>;
};

export const Peptides = ({ active, timeRef }: PeptideProps) => (
    <>
        <MainPeptide active={active} timeRef={timeRef} />
        {DRIFT.map((_, i) => <Drifter key={`${active}-${i}`} s={active} i={i} />)}
    </>
);
