import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { V, lerp, phase, rng, smooth } from '../receptor/layout';
import { SPHERE_LO } from '../receptor/geometry';
import { useHover } from '../receptor/useHover';
import type { TimeRef } from '../receptor/types';
import { BLOOD, GH_PER_GRANULE, GRANULES, GRANULE_R, MEM_HALF, PW, pp, type GranuleSpec } from './layout';
import { PC } from './ligands';

/*
 * Grânulos de secreção com GH. Na etapa 6 os três mais próximos sobem, fundem-se à membrana (o poro de
 * fusão abre na bicamada) e o GH sai de uma vez; na etapa 7 o GH segue para o sangue (rótulo no alto).
 */

/** Centro do grânulo g em T (com o achatamento da fusão). */
const granuleCenter = (g: GranuleSpec, T: number, out: THREE.Vector3) => {
    const up = pp(T, PW.granUp);
    if (g.fuse) return out.copy(g.rest).lerp(g.fuse, up).add(V(0, 0.42 * pp(T, PW.fuse), 0));
    return out.copy(g.rest).add(V(0, 1.1 * up, 0));
};

interface Gh { g: number; o: THREE.Vector3; out: THREE.Vector3; mid: THREE.Vector3; end: THREE.Vector3; d: number; d2: number; ph: number }

const buildGh = (): Gh[] => {
    const rand = rng(503);
    const list: Gh[] = [];
    GRANULES.forEach((g, gi) => {
        for (let i = 0; i < GH_PER_GRANULE; i++) {
            const o = V(rand() - 0.5, rand() - 0.5, rand() - 0.5);
            o.setLength(Math.cbrt(rand()) * 0.62);
            const f = g.fuse ?? g.rest;
            const a = rand() * Math.PI * 2;
            const rr = 0.4 + Math.sqrt(rand()) * 2.2;
            const out = V(f.x + Math.cos(a) * rr, MEM_HALF + 0.7 + rand() * 2.8, f.z + Math.sin(a) * rr * 0.7);
            const end = BLOOD.clone().add(V((rand() - 0.5) * 2.6, (rand() - 0.5) * 1.4, (rand() - 0.5) * 1.6));
            const mid = out.clone().lerp(end, 0.5).add(V((rand() - 0.5) * 3, 1.5 + rand(), (rand() - 0.5) * 2));
            list.push({ g: gi, o, out, mid, end, d: rand(), d2: rand(), ph: rand() * 6.28 });
        }
    });
    return list;
};

const tmpM = new THREE.Matrix4();
const tq = new THREE.Quaternion();
const ts = new THREE.Vector3();
const tp = new THREE.Vector3();
const tc = new THREE.Vector3();
const tpore = new THREE.Vector3();

const placeGh = (h: Gh, T: number, clock: number) => {
    const g = GRANULES[h.g];
    granuleCenter(g, T, tc);
    tp.copy(tc).add(h.o);
    let r = 0.13;
    if (g.fuse) {
        const r0 = PW.release[0] + h.d * 0.22;
        const k = smooth(Math.min(Math.max((T - r0) / 0.2, 0), 1));
        if (k > 0) {
            tpore.set(g.fuse.x, 0, g.fuse.z);
            if (k < 0.4) tp.lerp(tpore, k / 0.4);
            else tp.copy(tpore).lerp(h.out, (k - 0.4) / 0.6);
        }
        const b0 = PW.toBlood[0] + h.d2 * 0.3;
        const k2 = phase(T, b0, b0 + 0.5);
        if (k2 > 0) {
            const u = 1 - k2;
            tp.set(0, 0, 0).addScaledVector(h.out, u * u).addScaledVector(h.mid, 2 * u * k2).addScaledVector(h.end, k2 * k2);
            r = lerp(0.13, 0.11, k2);
        }
    }
    const j = g.fuse && T > PW.release[0] ? 0.06 : 0.025;
    tp.x += Math.sin(clock * 1.8 + h.ph) * j;
    tp.y += Math.cos(clock * 1.5 + h.ph) * j;
    tmpM.compose(tp, tq, ts.set(r, r, r));
};

const Shell = ({ g, timeRef }: { g: GranuleSpec; timeRef: TimeRef }) => {
    const ref = useRef<THREE.Mesh>(null);
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    const hover = useHover('Grânulo de GH', 'Vesícula com GH estocado. O cálcio no citosol dispara a fusão com a membrana e o GH sai da célula de uma vez.');
    useFrame(() => {
        const T = timeRef.current.t;
        const m = ref.current;
        if (!m) return;
        granuleCenter(g, T, m.position);
        const f = g.fuse ? pp(T, PW.fuse) : 0;
        // a vesícula achatada vira parte da membrana e some quando o poro fecha
        const gone = g.fuse ? pp(T, PW.reseal) : 0;
        m.scale.set(GRANULE_R * (1 + 0.5 * f), GRANULE_R * (1 - 0.72 * f), GRANULE_R * (1 + 0.5 * f));
        m.visible = gone < 0.99;
        if (mat.current) mat.current.opacity = (0.34 + 0.16 * f) * (1 - gone);
    });
    return (
        <mesh ref={ref} {...hover} renderOrder={2}>
            <sphereGeometry args={[1, 28, 20]} />
            <meshStandardMaterial ref={mat} color={PC.granule} emissive={PC.gh} emissiveIntensity={0.25} roughness={0.25} transparent opacity={0.34} depthWrite={false} />
        </mesh>
    );
};

export const Granules = ({ timeRef }: { timeRef: TimeRef }) => {
    const ref = useRef<THREE.InstancedMesh>(null);
    const gh = useMemo(() => buildGh(), []);
    useFrame(({ clock }) => {
        const m = ref.current;
        if (!m) return;
        const T = timeRef.current.t;
        gh.forEach((h, i) => {
            placeGh(h, T, clock.elapsedTime);
            m.setMatrixAt(i, tmpM);
        });
        m.instanceMatrix.needsUpdate = true;
    });
    return (
        <>
            {GRANULES.map((g, i) => <Shell key={i} g={g} timeRef={timeRef} />)}
            <instancedMesh ref={ref} args={[SPHERE_LO, undefined, gh.length]} frustumCulled={false}>
                <meshStandardMaterial color="#FB7185" emissive={PC.gh} emissiveIntensity={0.55} roughness={0.4} />
            </instancedMesh>
        </>
    );
};
