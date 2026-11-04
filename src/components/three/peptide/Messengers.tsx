import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { V, lerp, rng, seg, smooth } from '../receptor/layout';
import type { TimeRef } from '../receptor/types';
import { CA_CHANNEL, CA_N, ER_CHANNELS, ER_TUBE_R, ER_SQUASH, FIRST_CA, FIRST_MSG, MSG_N, PKA_POS, PW, enzymes, erPoint, type Side } from './layout';
import { PC, PEPTIDE_LIGANDS } from './ligands';

/*
 * Segundos mensageiros como partículas instanciadas. Cada partícula nasce num instante (em T), viaja
 * de a → m → b e some no fim do sinal (etapa 7). As primeiras nascem na etapa 4; a maioria, na etapa 5
 * (amplificação: mais proteínas G e mais enzimas ativas).
 * Gq: IP3 (fosfolipase C → retículo) e Ca²⁺ (retículo → citosol).
 * Gs: AMPc (adenilato ciclase → citosol perto da membrana / PKA) e Ca²⁺ (de fora, pelo canal da membrana).
 */


interface Particle { a: THREE.Vector3; m: THREE.Vector3; b: THREE.Vector3; birth: number; dur: number; death: number; ph: number; r: number }

const box = (rand: () => number, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
    V(lerp(x0, x1, rand()), lerp(y0, y1, rand()), lerp(z0, z1, rand()));

const birthOf = (i: number, first: number, total: number, w1: readonly [number, number], rand: () => number) =>
    i < first
        ? lerp(w1[0], w1[1] - 0.22, i / first) + rand() * 0.02
        : lerp(PW.amp[0], PW.amp[1] - 0.2, (i - first) / (total - first)) + rand() * 0.03;

const deathOf = (rand: () => number) => PW.fade[0] + rand() * 0.45;

const buildMessengers = (s: Side): Particle[] => {
    const rand = rng(s < 0 ? 301 : 307);
    const enz = enzymes(s);
    return Array.from({ length: MSG_N }, (_, i) => {
        const e = i < FIRST_MSG ? 0 : i % 3;
        const a = enz[e].clone().add(V((rand() - 0.5) * 0.8, -0.55, (rand() - 0.5) * 0.8));
        let b: THREE.Vector3;
        if (s < 0) {
            b = erPoint(0, 0.05 + rand() * 0.9, ER_TUBE_R[0] * ER_SQUASH + 0.25 + rand() * 1.1, new THREE.Vector3());
            if (rand() < 0.35) b = ER_CHANNELS[i % 3].clone().add(V((rand() - 0.5) * 0.6, 0.2 + rand() * 0.4, (rand() - 0.5) * 0.6));
        } else {
            b = rand() < 0.3
                ? PKA_POS[i % 2].clone().add(V((rand() - 0.5) * 1.6, (rand() - 0.5) * 1.2, (rand() - 0.5) * 1.4))
                : box(rand, 5.2, 13.2, -7.0, -2.8, -4.6, 2.6);
        }
        const m = a.clone().lerp(b, 0.5).add(V((rand() - 0.5) * 2, (rand() - 0.5) * 1.2, (rand() - 0.5) * 2));
        return { a, m, b, birth: birthOf(i, FIRST_MSG, MSG_N, PW.msg1, rand), dur: 0.32, death: deathOf(rand), ph: rand() * 6.28, r: 0.15 + rand() * 0.05 };
    });
};

const buildCalcium = (s: Side): Particle[] => {
    const rand = rng(s < 0 ? 401 : 409);
    return Array.from({ length: CA_N }, (_, i) => {
        let a: THREE.Vector3;
        let m: THREE.Vector3;
        let b: THREE.Vector3;
        if (s < 0) {
            const ch = ER_CHANNELS[i % 3];
            a = ch.clone().add(V((rand() - 0.5) * 0.3, -0.3, (rand() - 0.5) * 0.3));
            m = ch.clone().add(V((rand() - 0.5) * 1.6, 0.6 + rand() * 1.2, (rand() - 0.5) * 1.6));
            b = rand() < 0.4 ? box(rand, -3.2, 3.2, -9.5, -3.2, -4.2, 2.4) : box(rand, -13.5, 2, -11, -2.9, -5.5, 2.6);
        } else {
            a = CA_CHANNEL.clone().add(V((rand() - 0.5) * 3.2, 2.4 + rand() * 2.6, (rand() - 0.5) * 3));
            m = CA_CHANNEL.clone().add(V((rand() - 0.5) * 0.4, -1.6, (rand() - 0.5) * 0.4));
            b = rand() < 0.4 ? box(rand, -3.2, 3.2, -9.5, -3.2, -4.2, 2.4) : box(rand, -2, 13.5, -11, -2.9, -5.5, 2.6);
        }
        const w = s < 0 ? PW.ca : ([3.6, 3.97] as const);
        return { a, m, b, birth: birthOf(i, FIRST_CA, CA_N, w, rand), dur: 0.5, death: deathOf(rand), ph: rand() * 6.28, r: 0.065 + rand() * 0.03 };
    });
};

const tmpM = new THREE.Matrix4();
const tq = new THREE.Quaternion();
const te = new THREE.Euler();
const tp = new THREE.Vector3();
const ts = new THREE.Vector3();

/** Escreve a matriz da partícula; devolve se está visível. */
const place = (pt: Particle, T: number, clock: number, spin: boolean): boolean => {
    if (T < pt.birth) return false;
    const k = smooth(seg(T, pt.birth, pt.birth + pt.dur));
    const split = 0.42;
    if (k < split) tp.copy(pt.a).lerp(pt.m, k / split);
    else tp.copy(pt.m).lerp(pt.b, (k - split) / (1 - split));
    const j = 0.05 + 0.1 * k;
    tp.x += Math.sin(clock * 2.1 + pt.ph) * j;
    tp.y += Math.cos(clock * 1.7 + pt.ph * 1.3) * j;
    tp.z += Math.sin(clock * 1.9 + pt.ph * 0.7) * j;
    const grow = Math.min((T - pt.birth) / 0.04, 1);
    const fade = 1 - smooth(seg(T, pt.death, pt.death + 0.22));
    const r = pt.r * grow * fade;
    if (r <= 1e-3) return false;
    if (spin) te.set(clock * 1.3 + pt.ph, clock * 0.9 + pt.ph * 2, 0);
    else te.set(0, 0, 0);
    tmpM.compose(tp, tq.setFromEuler(te), ts.set(r, r, r));
    return true;
};

const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);
const TETRA = new THREE.TetrahedronGeometry(1, 0);
const OCTA = new THREE.OctahedronGeometry(1, 0);
const CA_GEO = new THREE.SphereGeometry(1, 8, 6);

interface MessengersProps { active: Side; timeRef: TimeRef }

/** Partículas do lado ativo (o outro lado não tem sinal). */
export const Messengers = ({ active, timeRef }: MessengersProps) => {
    const msgRef = useRef<THREE.InstancedMesh>(null);
    const caRef = useRef<THREE.InstancedMesh>(null);
    const msgs = useMemo(() => buildMessengers(active), [active]);
    const cas = useMemo(() => buildCalcium(active), [active]);
    const info = PEPTIDE_LIGANDS[active < 0 ? 'ghrp' : 'ghrh'];
    const msgColor = useMemo(() => new THREE.Color(info.messengerColor).multiplyScalar(1.5), [info.messengerColor]);
    const caColor = useMemo(() => new THREE.Color(PC.calcium).multiplyScalar(2.2), []);

    useFrame(({ clock }) => {
        const T = timeRef.current.t;
        const c = clock.elapsedTime;
        const live = T > PW.msg1[0] - 0.05 && T < PW.fade[1] + 0.5;
        const pairs: [THREE.InstancedMesh | null, Particle[], boolean][] = [[msgRef.current, msgs, true], [caRef.current, cas, false]];
        pairs.forEach(([mesh, list, spin]) => {
            if (!mesh) return;
            if (!live && !mesh.visible) return;
            mesh.visible = live;
            list.forEach((pt, i) => mesh.setMatrixAt(i, live && place(pt, T, c, spin) ? tmpM : HIDDEN));
            mesh.instanceMatrix.needsUpdate = true;
        });
    });

    return (
        <>
            <instancedMesh key={`m${active}`} ref={msgRef} args={[active < 0 ? TETRA : OCTA, undefined, MSG_N]} frustumCulled={false} visible={false}>
                <meshBasicMaterial color={msgColor} toneMapped={false} />
            </instancedMesh>
            <instancedMesh key={`c${active}`} ref={caRef} args={[CA_GEO, undefined, CA_N]} frustumCulled={false} visible={false}>
                <meshBasicMaterial color={caColor} toneMapped={false} />
            </instancedMesh>
        </>
    );
};
