import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { phase, rng, smooth } from '../receptor/layout';
import { SPHERE_LO, STICK_GEO, stickMatrix } from '../receptor/geometry';
import { useHover } from '../receptor/useHover';
import type { TimeRef } from '../receptor/types';
import { CA_CHANNEL, GRANULES, MEM_CUT_Z, MEM_HALF, MEM_X, MEM_Z0, PW, RECEPTOR_X, enzymes, pp, type Side } from './layout';
import { PC } from './ligands';
import { lipidFreedom, lipidHeadMaterial, lipidTailMaterial } from './shaders';

/*
 * Bicamada fosfolipídica horizontal (recorte): cabeças polares em cima e embaixo, duas caudas por lipídio.
 * Furos fixos para as proteínas que atravessam a membrana (receptores, adenilato ciclase, canal de Ca²⁺).
 * Furos dinâmicos: poro de fusão dos grânulos (etapa 6) e a invaginação do receptor internalizado (etapa 7).
 */

const SP = 0.52;
/** `rec` = dentro do furo de um receptor (escondido até a vesícula se soltar). */
interface Lipid { x: number; z: number; s: number; e: number; tw: number; rec: boolean }
interface Site { x: number; z: number; r: number }

const REC_HOLE = 1.5;
const STATIC_HOLES: Site[] = [
    ...enzymes(1).map(p => ({ x: p.x, z: p.z, r: 0.95 })),
    { x: CA_CHANNEL.x, z: CA_CHANNEL.z, r: 0.75 },
];

const buildLipids = () => {
    const rand = rng(21);
    const out: Lipid[] = [];
    let row = 0;
    for (let z = MEM_CUT_Z; z >= MEM_Z0; z -= SP * 0.866, row++) {
        for (let x = -MEM_X + (row % 2) * SP * 0.5; x <= MEM_X; x += SP) {
            if (STATIC_HOLES.some(h => Math.hypot(x - h.x, z - h.z) < h.r)) continue;
            const rec = Math.hypot(Math.abs(x) - RECEPTOR_X, z) < REC_HOLE;
            // a borda frontal (recorte) fica nítida; o fundo e as laterais se dissolvem
            const edge = Math.min(1 - Math.abs(x) / MEM_X, (z - MEM_Z0) / 5);
            const e = smooth(Math.min(edge * 4, 1));
            if (e < 0.05) continue;
            for (const s of [1, -1]) out.push({ x: x + (rand() - 0.5) * 0.08, z: z + (rand() - 0.5) * 0.08, s, e, tw: rand(), rec });
        }
    }
    return out;
};

const tmpM = new THREE.Matrix4();
const q0 = new THREE.Quaternion();
const sc = new THREE.Vector3();
const a = new THREE.Vector3();
const b = new THREE.Vector3();
const hp = new THREE.Vector3();

const writeLipid = (heads: THREE.InstancedMesh, tails: THREE.InstancedMesh, i: number, l: Lipid, dy: number, k: number) => {
    const r = 0.21 * l.e * k;
    hp.set(l.x, dy + l.s * MEM_HALF, l.z);
    tmpM.compose(hp, q0, sc.set(r, r, r));
    heads.setMatrixAt(i, tmpM);
    for (let j = 0; j < 2; j++) {
        const off = (j - 0.5) * 0.17;
        const kink = j === 1 ? Math.sin(l.tw * 6) * 0.06 : 0;
        a.set(l.x + off, dy + l.s * 0.85, l.z + kink);
        b.set(l.x + off * 1.3, dy + l.s * 0.08, l.z + kink * 2 + (l.tw - 0.5) * 0.1);
        tails.setMatrixAt(i * 2 + j, stickMatrix(a, b, 0.05 * l.e * k, tmpM));
    }
};

/** Rascunho do deslocamento vertical e da escala de um lipídio (reaproveitado: zero alocação por quadro). */
const dyn = { k: 1, dy: 0 };
const FUSE_SITES = GRANULES.flatMap(g => (g.fuse ? [g.fuse] : []));

/** Deslocamento vertical e escala de um lipídio perto de um sítio dinâmico (escreve em `dyn`). */
const dynamic = (l: Lipid, T: number, active: Side, fuse: number, e: number) => {
    let k = l.rec ? 0 : 1;
    let dy = 0;
    if (fuse > 0) {
        for (let g = 0; g < FUSE_SITES.length; g++) {
            const f = FUSE_SITES[g];
            const d = Math.hypot(l.x - f.x, l.z - f.z);
            k = Math.min(k, smooth(Math.min(Math.max((d - 1.05 * fuse) / 0.35, 0), 1)));
        }
    }
    if (e > 0) {
        const d = Math.hypot(l.x - active * RECEPTOR_X, l.z);
        dy = -2.1 * Math.sin(Math.PI * Math.min(e * 1.15, 1)) * Math.exp(-(d * d) / 3.2);
        // depois que a vesícula se solta, o furo do receptor fecha
        if (l.rec && d < REC_HOLE) k = phase(T, 6.7, 6.94);
    }
    dyn.k = k;
    dyn.dy = dy;
};

/**
 * Cópia da geometria com o atributo instanciado `aLip` (x, z, índice, liberdade) que o shader da bicamada
 * usa para mover cabeça e caudas juntas. `per` = instâncias por lipídio (1 cabeça, 2 caudas).
 */
const withLipidAttr = (base: THREE.BufferGeometry, lipids: Lipid[], per: number) => {
    const g = base.clone();
    const a = new Float32Array(lipids.length * per * 4);
    lipids.forEach((l, i) => {
        const free = lipidFreedom(l.x, l.z);
        for (let j = 0; j < per; j++) a.set([l.x, l.z, i, free], (i * per + j) * 4);
    });
    g.setAttribute('aLip', new THREE.InstancedBufferAttribute(a, 4));
    return g;
};

interface PepMembraneProps { timeRef: TimeRef; active: Side }

export const PepMembrane = ({ timeRef, active }: PepMembraneProps) => {
    const heads = useRef<THREE.InstancedMesh>(null);
    const tails = useRef<THREE.InstancedMesh>(null);
    const lipids = useMemo(() => buildLipids(), []);
    // lipídios que podem se mover: perto dos poros de fusão e dos dois receptores
    const near = useMemo(() => lipids.flatMap((l, i) => (
        FUSE_SITES.some(f => Math.hypot(l.x - f.x, l.z - f.z) < 1.8)
        || Math.hypot(Math.abs(l.x) - RECEPTOR_X, l.z) < 4.2) ? [i] : []), [lipids]);
    const last = useRef({ T: -1, active: 0 });
    const hover = useHover('Membrana plasmática', 'Bicamada lipídica: cabeças polares voltadas para a água e caudas apolares no meio. Barra o peptídeo, que é hidrossolúvel e tem cargas.');

    // geometrias e materiais feitos à mão: o R3F não os descarta sozinho
    const gpu = useMemo(() => ({
        headGeo: withLipidAttr(SPHERE_LO, lipids, 1),
        tailGeo: withLipidAttr(STICK_GEO, lipids, 2),
        headMat: lipidHeadMaterial(new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.05 })),
        tailMat: lipidTailMaterial(new THREE.MeshStandardMaterial({ color: PC.tails, roughness: 0.75, emissive: '#3a2a05', emissiveIntensity: 0.4 })),
    }), [lipids]);
    useEffect(() => () => {
        gpu.headGeo.dispose();
        gpu.tailGeo.dispose();
        gpu.headMat.dispose();
        gpu.tailMat.dispose();
    }, [gpu]);

    useLayoutEffect(() => {
        const h = heads.current;
        const t = tails.current;
        if (!h || !t) return;
        const c = new THREE.Color();
        const base = new THREE.Color(PC.heads);
        const rand = rng(9);
        lipids.forEach((l, i) => {
            writeLipid(h, t, i, l, 0, l.rec ? 0 : 1);
            h.setColorAt(i, c.copy(base).multiplyScalar(0.8 + rand() * 0.32));
        });
        h.instanceMatrix.needsUpdate = true;
        t.instanceMatrix.needsUpdate = true;
        if (h.instanceColor) h.instanceColor.needsUpdate = true;
    }, [lipids]);

    useFrame(() => {
        const T = timeRef.current.t;
        const prev = last.current;
        if (Math.abs(T - prev.T) < 1e-4 && prev.active === active) return;
        const moving = T > 5.3 || prev.T > 5.3;
        prev.T = T;
        prev.active = active;
        if (!moving) return;
        const h = heads.current;
        const t = tails.current;
        if (!h || !t) return;
        const fuse = pp(T, PW.fuse) * (1 - pp(T, PW.reseal));
        const e = pp(T, PW.endo);
        for (let n = 0; n < near.length; n++) {
            const i = near[n];
            dynamic(lipids[i], T, active, fuse, e);
            writeLipid(h, t, i, lipids[i], dyn.dy, dyn.k);
        }
        h.instanceMatrix.needsUpdate = true;
        t.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh ref={heads} args={[gpu.headGeo, gpu.headMat, lipids.length]} frustumCulled={false} />
            <instancedMesh ref={tails} args={[gpu.tailGeo, gpu.tailMat, lipids.length * 2]} frustumCulled={false} />
            <mesh {...hover} position={[0, 0, (MEM_CUT_Z + MEM_Z0) / 2]} scale={[MEM_X * 1.6, MEM_HALF * 2.2, MEM_CUT_Z - MEM_Z0]}>
                <boxGeometry />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
        </group>
    );
};
