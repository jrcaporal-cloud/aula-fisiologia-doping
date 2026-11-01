import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CELL_SCALE, LUMEN_R, THROMBUS_HALF, THROMBUS_X, makeErythrocyteGeometry, seeded } from './geometry';

const N_RBC = 80;
const N_PLATELET = 90;
const N_FIBRIN = 120;

interface Piece {
    pos: THREE.Vector3;
    quat: THREE.Quaternion;
    scale: THREE.Vector3;
    /** Ordem de surgimento 0–1: o trombo cresce a partir da parede inferior. */
    order: number;
}

const randomQuat = (rand: () => number) =>
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * Math.PI * 2, rand() * Math.PI * 2, rand() * Math.PI * 2));

/** Ponto aleatório dentro do lúmen, no volume em forma de lente do microtrombo. */
const samplePoint = (rand: () => number, margin: number) => {
    const r = LUMEN_R - margin;
    const y = (rand() * 2 - 1) * r;
    const zMax = Math.sqrt(Math.max(r * r - y * y, 0));
    const z = (rand() * 2 - 1) * zMax;
    const lens = 1 - 0.35 * ((y * y + z * z) / (r * r));
    const x = THROMBUS_X + (rand() * 2 - 1) * THROMBUS_HALF * lens;
    return new THREE.Vector3(x, y, z);
};

const growthOrder = (p: THREE.Vector3, rand: () => number) =>
    THREE.MathUtils.clamp(0.82 * ((p.y + LUMEN_R) / (2 * LUMEN_R)) + 0.12 * (Math.abs(p.x - THROMBUS_X) / THROMBUS_HALF) + rand() * 0.06, 0, 1);

const makePieces = (count: number, seed: number, build: (rand: () => number, i: number) => Piece) => {
    const rand = seeded(seed);
    return Array.from({ length: count }, (_, i) => build(rand, i));
};

const easeOutBack = (t: number) => {
    const c = 1.6;
    return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};

const writePieces = (mesh: THREE.InstancedMesh, pieces: Piece[], progress: number, lag: number, m: THREE.Matrix4, s: THREE.Vector3) => {
    pieces.forEach((pc, i) => {
        const t = THREE.MathUtils.clamp((progress * 1.1 - pc.order - lag) / 0.12, 0, 1);
        const k = t <= 0 ? 0 : easeOutBack(t);
        s.copy(pc.scale).multiplyScalar(k);
        m.compose(pc.pos, pc.quat, s);
        mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
};

/** Esfera irregular (ruído determinístico) usada como corpo gelatinoso do coágulo. */
const makeClotBodyGeometry = () => {
    const geo = new THREE.IcosahedronGeometry(1, 4);
    const pos = geo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const n = 1 + 0.08 * Math.sin(v.x * 7.1 + v.y * 3.3) * Math.cos(v.z * 5.7 - v.y * 2.1) + 0.05 * Math.sin(v.y * 11 + v.z * 9);
        v.multiplyScalar(n);
        pos.setXYZ(i, v.x, v.y, v.z);
    }
    geo.computeVertexNormals();
    return geo;
};

interface ThrombusProps {
    /** Progresso de formação 0–1 (lido a cada quadro). */
    getProgress: () => number;
}

/**
 * Microtrombo simplificado: hemácias aprisionadas, plaquetas aderidas ao endotélio
 * e uma malha de fibrina — cresce da parede até obstruir o lúmen.
 */
export const Thrombus = ({ getProgress }: ThrombusProps) => {
    const rbcRef = useRef<THREE.InstancedMesh>(null);
    const plateletRef = useRef<THREE.InstancedMesh>(null);
    const fibrinRef = useRef<THREE.InstancedMesh>(null);
    const bodyRef = useRef<THREE.Mesh>(null);
    const bodyGeo = useMemo(() => makeClotBodyGeometry(), []);

    const rbcGeo = useMemo(() => makeErythrocyteGeometry(24, 10), []);
    const plateletGeo = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
    const fibrinGeo = useMemo(() => new THREE.CylinderGeometry(1, 1, 1, 5, 1), []);
    useEffect(() => () => {
        [rbcGeo, plateletGeo, fibrinGeo, bodyGeo].forEach(g => g.dispose());
    }, [rbcGeo, plateletGeo, fibrinGeo, bodyGeo]);

    const rbcs = useMemo(() => makePieces(N_RBC, 101, rand => {
        const pos = samplePoint(rand, CELL_SCALE * 0.8);
        return { pos, quat: randomQuat(rand), scale: new THREE.Vector3().setScalar(CELL_SCALE * (0.9 + rand() * 0.15)), order: growthOrder(pos, rand) };
    }), []);

    const platelets = useMemo(() => makePieces(N_PLATELET, 202, (rand, i) => {
        // As primeiras aderem à parede inferior (lesão endotelial); as demais entram no trombo.
        const onWall = i < 26;
        let pos: THREE.Vector3;
        if (onWall) {
            const ang = -Math.PI / 2 + (rand() - 0.5) * 1.6;
            const rr = LUMEN_R - 0.05;
            pos = new THREE.Vector3(THROMBUS_X + (rand() * 2 - 1) * THROMBUS_HALF * 1.1, Math.sin(ang) * rr, Math.cos(ang) * rr);
        } else {
            pos = samplePoint(rand, 0.08);
        }
        const size = 0.055 + rand() * 0.035;
        return {
            pos,
            quat: randomQuat(rand),
            scale: new THREE.Vector3(size * 1.3, size * 0.5, size),
            order: onWall ? rand() * 0.08 : growthOrder(pos, rand),
        };
    }), []);

    const fibrin = useMemo(() => makePieces(N_FIBRIN, 303, rand => {
        const pos = samplePoint(rand, 0.32);
        const len = 0.22 + rand() * 0.42;
        return {
            pos,
            quat: randomQuat(rand),
            scale: new THREE.Vector3(0.007, len, 0.007),
            order: growthOrder(pos, rand),
        };
    }), []);

    const scratch = useMemo(() => ({ m: new THREE.Matrix4(), s: new THREE.Vector3() }), []);

    useFrame(({ clock }) => {
        const p = getProgress();
        const { m, s } = scratch;
        if (rbcRef.current) writePieces(rbcRef.current, rbcs, p, 0.02, m, s);
        if (plateletRef.current) writePieces(plateletRef.current, platelets, p, 0, m, s);
        if (fibrinRef.current) writePieces(fibrinRef.current, fibrin, p, 0.05, m, s);
        if (bodyRef.current) {
            // Corpo do coágulo: cresce da parede inferior até ocupar o lúmen.
            const k = THREE.MathUtils.smoothstep(p, 0.02, 1);
            bodyRef.current.visible = k > 0.001;
            bodyRef.current.scale.set(THROMBUS_HALF * (0.55 + 0.45 * k), LUMEN_R * 0.98 * k, LUMEN_R * 0.92 * Math.sqrt(k));
            bodyRef.current.position.y = -LUMEN_R + LUMEN_R * 0.98 * k;
        }
        // Brilho pulsante no próprio material (uma luz pontual extra custava ~50% do quadro).
        const bodyMat = bodyRef.current?.material;
        if (bodyMat instanceof THREE.MeshStandardMaterial) {
            const beat = 0.6 + 0.4 * Math.sin(clock.elapsedTime * Math.PI);
            bodyMat.emissiveIntensity = 0.35 + p * 1.1 * beat;
        }
    });

    return (
        <group>
            <instancedMesh ref={rbcRef} args={[rbcGeo, undefined, N_RBC]} frustumCulled={false}>
                <meshStandardMaterial color="#6e0f22" emissive="#3a0410" emissiveIntensity={0.6} roughness={0.55} />
            </instancedMesh>
            <instancedMesh ref={plateletRef} args={[plateletGeo, undefined, N_PLATELET]} frustumCulled={false}>
                <meshStandardMaterial color="#fde4c4" emissive="#f59e0b" emissiveIntensity={0.35} roughness={0.5} flatShading />
            </instancedMesh>
            <instancedMesh ref={fibrinRef} args={[fibrinGeo, undefined, N_FIBRIN]} frustumCulled={false}>
                <meshStandardMaterial color="#fde68a" emissive="#fbbf24" emissiveIntensity={0.55} roughness={0.5} />
            </instancedMesh>
            <mesh ref={bodyRef} geometry={bodyGeo} position={[THROMBUS_X, -LUMEN_R, 0]} visible={false} renderOrder={5}>
                <meshStandardMaterial color="#4a0a18" emissive="#9f1239" emissiveIntensity={0.35} roughness={0.7} transparent opacity={0.62} depthWrite={false} />
            </mesh>
        </group>
    );
};
