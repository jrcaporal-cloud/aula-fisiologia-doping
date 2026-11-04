import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPHERE_LO } from '../receptor/geometry';
import { clamp01, rng } from '../receptor/layout';
import { CC } from './colors';
import { FIBROSE_N, VENT_X } from './layout';
import { longShrink, radialShrink } from './params';
import type { CardioStateRef } from './flow';
import { makeShell, shellPoint } from './shell';
import { belowBaseRaycast, type PickKind } from './pickHelpers';
import { useStructure } from './useStructure';

/*
 * Miocárdio do ventrículo esquerdo em corte, o volume de sangue da cavidade e as estrias de fibrose.
 * A parede contrai no ciclo; a hipertrofia e a fibrose vêm de T (soma dos colaterais).
 */

interface Seed { a: number; phi: number; cut: 0 | 1 | -1; len: number; wide: number; spin: number }

const buildSeeds = (): Seed[] => {
    const rand = rng(77);
    return Array.from({ length: FIBROSE_N }, (_, i) => {
        const onCut = i % 3 === 2;
        return {
            a: 0.15 + rand() * 0.78,
            phi: onCut ? 0 : 0.04 + rand() * 0.92,
            cut: onCut ? (rand() < 0.5 ? -1 : 1) : 0,
            len: 0.3 + rand() * 0.34,
            wide: 0.12 + rand() * 0.12,
            spin: rand() * Math.PI,
        };
    });
};

const UP = new THREE.Vector3(0, 1, 0);
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const spinQ = new THREE.Quaternion();
const tmpS = new THREE.Vector3();
const tmpP = new THREE.Vector3();
const tmpN = new THREE.Vector3();
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);

/** O miocárdio é opaco: uma hemácia atrás dele não pode ser apontada através dele. */
const SOLID: { pick: PickKind } = { pick: 'solid' };

interface VentricleProps { stateRef: CardioStateRef }

export const Ventricle = ({ stateRef }: VentricleProps) => {
    const shell = useMemo(() => makeShell(), []);
    const seeds = useMemo(() => buildSeeds(), []);
    const fib = useRef<THREE.InstancedMesh>(null);
    const cavity = useRef<THREE.Mesh>(null);

    const myo = useStructure('miocardio');
    const cav = useStructure('cavidade');

    useFrame(() => {
        const { p, cy } = stateRef.current;
        shell.write(p, cy);
        const rIn = p.rCav * radialShrink(cy.volRatio);
        const hIn = p.hCav * longShrink(cy.volRatio);
        const cav = cavity.current;
        if (cav) {
            cav.position.set(VENT_X, p.yc, 0);
            cav.scale.set(rIn * 0.94, hIn * 0.94, rIn * 0.94);
        }
        const mesh = fib.current;
        if (!mesh) return;
        /*
         * Estrias claras no miocárdio, crescendo com T. Discretas de propósito: em ressonância a
         * fibrose nesses usuários é um achado inconsistente (há série com T1 nativo até reduzido e
         * realce focal ausente). Quem a mostra é a histologia de autópsia, sem dado de incidência.
         */
        const grow = clamp01(p.v.fibrose);
        const n = Math.round(grow * FIBROSE_N);
        const mid = (p.rCav + p.rOut) / 2;
        const midH = (p.hCav + p.hOut) / 2;
        seeds.forEach((s, i) => {
            if (i >= n) {
                mesh.setMatrixAt(i, HIDDEN);
                return;
            }
            const k = clamp01((n - i) * 0.8);
            if (s.cut === 0) {
                shellPoint(s.a, s.phi, p.rOut * 1.002, p.hOut * 1.002, p.yc, tmpP);
                tmpN.set((tmpP.x - VENT_X) / (p.rOut * p.rOut), (tmpP.y - p.yc) / (p.hOut * p.hOut), tmpP.z / (p.rOut * p.rOut)).normalize();
            } else {
                shellPoint(s.a, s.cut < 0 ? 0 : 1, mid, midH, p.yc, tmpP);
                shellPoint(s.a, s.cut < 0 ? 0.02 : 0.98, mid, midH, p.yc, tmpN).sub(tmpP).normalize().multiplyScalar(-1);
            }
            tmpQ.setFromUnitVectors(UP, tmpN);
            tmpQ.multiply(spinQ.setFromAxisAngle(UP, s.spin));
            tmpS.set(s.len * k, 0.05, s.wide * k);
            mesh.setMatrixAt(i, tmpM.compose(tmpP, tmpQ, tmpS));
        });
        mesh.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <mesh geometry={shell.geometry} userData={SOLID} {...myo.bind}>
                <meshStandardMaterial
                    color={CC.myo}
                    emissive={CC.myoDeep}
                    emissiveIntensity={myo.lit ? 0.7 : 0.3}
                    roughness={0.52}
                    metalness={0.04}
                    side={THREE.DoubleSide}
                />
            </mesh>
            <mesh ref={cavity} raycast={belowBaseRaycast} {...cav.bind} renderOrder={2}>
                <sphereGeometry args={[1, 24, 16]} />
                <meshBasicMaterial color={CC.blood} transparent opacity={cav.lit ? 0.55 : 0.3} depthWrite={false} />
            </mesh>
            <instancedMesh ref={fib} args={[SPHERE_LO, undefined, FIBROSE_N]} frustumCulled={false}>
                <meshStandardMaterial color={CC.fibrose} roughness={0.85} emissive="#223040" emissiveIntensity={0.3} />
            </instancedMesh>
        </group>
    );
};
