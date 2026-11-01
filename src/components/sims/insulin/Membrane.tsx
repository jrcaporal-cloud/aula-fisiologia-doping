import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { CHANNELS, CHANNEL_RADIUS, MEMBRANE, RECEPTORS, seeded } from './layout';
import { channelFusion, type Engine } from './engine';

interface Lipid {
    x: number;
    y: number;
    z: number;
    tilt: number;
    yaw: number;
    /** Canal mais próximo (−1 = nenhum) e direção para afastar o lipídio quando o canal abre. */
    channel: number;
    dx: number;
    dz: number;
    dist: number;
}

const OPEN_RADIUS = CHANNEL_RADIUS + 0.32;

const buildLipids = (): Lipid[] => {
    const rand = seeded(11);
    const out: Lipid[] = [];
    const { halfX, halfZ, headY, spacing } = MEMBRANE;
    const rowStep = spacing * 0.87;
    for (const leaflet of [1, -1]) {
        let row = 0;
        for (let z = -halfZ; z <= halfZ + 0.001; z += rowStep, row++) {
            const offset = row % 2 ? spacing / 2 : 0;
            for (let x = -halfX + offset; x <= halfX; x += spacing) {
                const jx = x + (rand() - 0.5) * 0.06;
                const jz = Math.min(z + (rand() - 0.5) * 0.06, halfZ);
                // O β do receptor atravessa a membrana: sem lipídio ali.
                if (RECEPTORS.some(r => Math.hypot(r.x - jx, r.z - jz) < 0.3)) continue;
                let channel = -1;
                let dist = Infinity;
                CHANNELS.forEach((c, i) => {
                    const d = Math.hypot(c.x - jx, c.z - jz);
                    if (d < OPEN_RADIUS && d < dist) {
                        dist = d;
                        channel = i;
                    }
                });
                const dx = channel >= 0 ? (jx - CHANNELS[channel].x) / Math.max(dist, 0.01) : 0;
                const dz = channel >= 0 ? (jz - CHANNELS[channel].z) / Math.max(dist, 0.01) : 0;
                out.push({
                    x: jx,
                    y: leaflet * (headY + (rand() - 0.5) * 0.035),
                    z: jz,
                    tilt: (rand() - 0.5) * 0.35,
                    yaw: rand() * Math.PI * 2,
                    channel,
                    dx,
                    dz,
                    dist,
                });
            }
        }
    }
    return out;
};

/** Ondulação lenta da bicamada, feita na GPU a partir da posição de cada instância. */
const makeWavyMaterial = (params: THREE.MeshStandardMaterialParameters, time: { value: number }) => {
    const mat = new THREE.MeshStandardMaterial(params);
    mat.onBeforeCompile = shader => {
        shader.uniforms.uTime = time;
        shader.vertexShader = shader.vertexShader
            .replace('#include <common>', '#include <common>\nuniform float uTime;')
            .replace(
                '#include <begin_vertex>',
                `#include <begin_vertex>
#ifdef USE_INSTANCING
  vec3 ip = vec3(instanceMatrix[3][0], instanceMatrix[3][1], instanceMatrix[3][2]);
  transformed.y += sin(ip.x * 0.85 + uTime * 0.7) * 0.035 + sin(ip.z * 1.4 - uTime * 0.55 + ip.x * 0.37) * 0.022;
#endif`
            );
    };
    return mat;
};

const makeTailGeometry = () => {
    const a = new THREE.CylinderGeometry(0.026, 0.018, 0.24, 5, 1);
    a.translate(-0.038, 0, 0);
    const b = new THREE.CylinderGeometry(0.026, 0.018, 0.22, 5, 1);
    b.rotateZ(0.12);
    b.translate(0.04, -0.01, 0);
    return mergeGeometries([a, b]) ?? a;
};

interface MembraneProps {
    engine: Engine;
    reduced: boolean;
}

export const Membrane = ({ engine, reduced }: MembraneProps) => {
    const lipids = useMemo(() => buildLipids(), []);
    const headRef = useRef<THREE.InstancedMesh>(null);
    const tailRef = useRef<THREE.InstancedMesh>(null);
    const time = useMemo(() => ({ value: 0 }), []);
    const headGeo = useMemo(() => new THREE.SphereGeometry(MEMBRANE.headRadius, 10, 8), []);
    const tailGeo = useMemo(() => makeTailGeometry(), []);
    const headMat = useMemo(
        () => makeWavyMaterial({ color: '#ffffff', roughness: 0.42, metalness: 0.05, emissive: '#1d3b78', emissiveIntensity: 0.35 }, time),
        [time]
    );
    const tailMat = useMemo(
        () => makeWavyMaterial({ color: '#d9b77c', roughness: 0.75, metalness: 0, emissive: '#3a2a10', emissiveIntensity: 0.25 }, time),
        [time]
    );
    const nearChannel = useMemo(() => lipids.flatMap((l, i) => (l.channel >= 0 ? [i] : [])), [lipids]);
    const applied = useMemo(() => new Float32Array(CHANNELS.length).fill(-1), []);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const writeLipid = (i: number, open: number) => {
        const l = lipids[i];
        const head = headRef.current;
        const tail = tailRef.current;
        if (!head || !tail) return;
        // Ao abrir o canal, os lipídios vizinhos se afastam e encolhem: a membrana "abre espaço".
        const push = open * Math.max(OPEN_RADIUS - l.dist, 0) * 0.9;
        const shrink = l.dist < CHANNEL_RADIUS + 0.08 ? 1 - open : 1 - open * 0.25;
        const x = l.x + l.dx * push;
        const z = l.z + l.dz * push;
        const s = Math.max(shrink, 0.001);
        dummy.position.set(x, l.y, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        head.setMatrixAt(i, dummy.matrix);
        const sign = Math.sign(l.y);
        dummy.position.set(x, l.y - sign * 0.185, z);
        dummy.rotation.set(l.tilt * 0.4, l.yaw, l.tilt);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        tail.setMatrixAt(i, dummy.matrix);
    };

    useLayoutEffect(() => {
        const head = headRef.current;
        const tail = tailRef.current;
        if (!head || !tail) return;
        const rand = seeded(5);
        const c = new THREE.Color();
        const cool = new THREE.Color('#9fbaf5');
        const warm = new THREE.Color('#c7b8f0');
        lipids.forEach((l, i) => {
            writeLipid(i, 0);
            c.copy(cool).lerp(warm, rand() * 0.8);
            // Folheto externo um pouco mais claro que o interno.
            if (l.y < 0) c.multiplyScalar(0.82);
            head.setColorAt(i, c);
        });
        head.instanceMatrix.needsUpdate = true;
        tail.instanceMatrix.needsUpdate = true;
        if (head.instanceColor) head.instanceColor.needsUpdate = true;
        // writeLipid só depende de refs e dados estáveis.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lipids]);

    useFrame((_, delta) => {
        if (!reduced) time.value += Math.min(delta, 0.05);
        let dirty = false;
        for (let c = 0; c < CHANNELS.length; c++) {
            const f = channelFusion(engine, c);
            if (Math.abs(f - applied[c]) < 0.004) continue;
            applied[c] = f;
            dirty = true;
        }
        if (!dirty) return;
        for (const i of nearChannel) writeLipid(i, applied[lipids[i].channel]);
        if (headRef.current) headRef.current.instanceMatrix.needsUpdate = true;
        if (tailRef.current) tailRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh ref={headRef} args={[headGeo, headMat, lipids.length]} />
            <instancedMesh ref={tailRef} args={[tailGeo, tailMat, lipids.length]} />
        </group>
    );
};
