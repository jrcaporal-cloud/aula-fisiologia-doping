import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SPHERE_LO } from '../receptor/geometry';
import { V, clamp01 } from '../receptor/layout';
import { CC } from './colors';
import { FLOW, SAMPLES, rangeOf, type CardioStateRef } from './flow';
import { ENDO_AT, PLAQUE_U, PLAQUE_W, type Kind } from './layout';
import { makeTube } from './tube';
import { visibleRaycast, type PickKind } from './pickHelpers';
import type { StructureId } from './structures';
import { useStructure } from './useStructure';

/*
 * Paredes do circuito. Tudo translúcido: o que importa é ver as hemácias passando por dentro.
 * Aorta e artéria pulsam com a sístole; o segmento com placa estreita o lúmen e o fluxo acelera ali.
 */

interface FlowTubeProps {
    kind: Kind;
    color: string;
    opacity: number;
    stateRef: CardioStateRef;
    structure: StructureId;
    /** < 1 desenha uma camada interna (revestimento endotelial). */
    rScale?: number;
}

const FlowTube = ({ kind, color, opacity, stateRef, structure, rScale = 1 }: FlowTubeProps) => {
    const tube = useMemo(() => {
        const [a, b] = rangeOf(kind);
        // uma amostra de folga em cada ponta para os trechos se encostarem sem fenda
        return makeTube(Math.max(a - 1, 0), Math.min(b + 1, SAMPLES - 1), rScale);
    }, [kind, rScale]);
    const { bind, lit } = useStructure(structure);
    useFrame(() => {
        tube.write(stateRef.current.f);
    });
    return (
        <mesh geometry={tube.geometry} {...bind}>
            <meshStandardMaterial
                color={color}
                roughness={0.38}
                metalness={0.05}
                side={THREE.DoubleSide}
                transparent
                opacity={lit ? Math.min(opacity * 2, 0.62) : opacity}
                depthWrite={false}
            />
        </mesh>
    );
};

/** A placa é opaca: hemácia atrás dela não pode ser apontada através dela. */
const SOLID: { pick: PickKind } = { pick: 'solid' };

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpS = new THREE.Vector3();

/** Núcleo lipídico da lesão: cresce na parede e empurra o lúmen (o estreitamento está em `radiusAt`). */
const Plaque = ({ stateRef }: { stateRef: CardioStateRef }) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { bind, lit } = useStructure('placa');
    const blobs = useMemo(() => {
        const [a, b] = rangeOf('arteria');
        const out: { p: THREE.Vector3; r: number }[] = [];
        for (let i = a; i <= b; i++) {
            const s = FLOW[i];
            const d = (s.localU - PLAQUE_U) / PLAQUE_W;
            if (Math.abs(d) > 1) continue;
            const k = 1 - Math.abs(d);
            if (out.length && out[out.length - 1].p.distanceTo(s.p) < 0.22) continue;
            // o núcleo se acomoda num lado do vaso, logo sob o endotélio
            out.push({ p: V(s.p.x, s.p.y, s.p.z).addScaledVector(s.n, s.r0 * 0.5), r: s.r0 * (0.3 + 0.42 * k) });
        }
        return out;
    }, []);

    useFrame(() => {
        const m = mesh.current;
        if (!m) return;
        const k = clamp01(stateRef.current.p.v.placa * 1.25);
        m.visible = k > 0.02;
        if (!m.visible) return;
        blobs.forEach((b, i) => {
            const r = b.r * k;
            m.setMatrixAt(i, tmpM.compose(b.p, tmpQ.identity(), tmpS.set(r, r * 0.8, r)));
        });
        m.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={mesh} args={[SPHERE_LO, undefined, blobs.length]} frustumCulled={false} visible={false}
            userData={SOLID} raycast={visibleRaycast} {...bind}
        >
            <meshStandardMaterial color={CC.plaque} roughness={0.5} emissive="#4a2b02" emissiveIntensity={lit ? 1.1 : 0.45} />
        </instancedMesh>
    );
};

/** Anel de endotélio em corte: o revestimento que perde a capacidade de dilatar. */
const EndotheliumRing = () => {
    const { bind, lit } = useStructure('endotelio');
    return (
        <group position={ENDO_AT} rotation={[0, Math.PI / 2, -0.08]} {...bind}>
            <mesh>
                <torusGeometry args={[0.44, 0.05, 6, 24]} />
                <meshStandardMaterial color={CC.endo} emissive={CC.endo} emissiveIntensity={lit ? 2.2 : 0.9} roughness={0.3} toneMapped={false} />
            </mesh>
            {/* alvo de clique mais gordo que o anel de 0,05, invisível */}
            <mesh>
                <torusGeometry args={[0.44, 0.2, 6, 24]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
        </group>
    );
};

/** Ramos curtos do leito de resistência (decorativos: o fluxo corre pelo trecho principal). */
const ArterioleBranches = () => {
    const geo = useMemo(() => {
        const curves = [
            [V(11.3, 0.9, 0), V(12.3, 0.7, -0.4), V(13.1, 0.95, -1.0)],
            [V(11.45, 0.1, 0), V(12.6, -0.15, 0.5), V(13.4, -0.2, 1.2)],
            [V(11.1, -0.75, 0), V(12.2, -1.1, -0.3), V(12.9, -1.6, -0.9)],
        ];
        return curves.map(pts => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 10, 0.1, 6, false));
    }, []);
    return (
        <group>
            {geo.map((g, i) => (
                <mesh key={i} geometry={g}>
                    <meshStandardMaterial color={CC.arteriole} roughness={0.5} transparent opacity={0.5} depthWrite={false} />
                </mesh>
            ))}
        </group>
    );
};

export const Vessels = ({ stateRef }: { stateRef: CardioStateRef }) => (
    <group>
        <FlowTube
            kind="aorta" color={CC.artery} opacity={0.3} stateRef={stateRef} structure="aorta"
        />
        <FlowTube
            kind="arteria" color={CC.artery} opacity={0.3} stateRef={stateRef} structure="arteria"
        />
        <FlowTube
            kind="arteria" color={CC.endo} opacity={0.12} stateRef={stateRef} rScale={0.88} structure="endotelio"
        />
        <FlowTube
            kind="arteriola" color={CC.arteriole} opacity={0.4} stateRef={stateRef} structure="arteriola"
        />
        <FlowTube
            kind="veia" color={CC.vein} opacity={0.26} stateRef={stateRef} structure="veia"
        />
        <FlowTube
            kind="pulmonar" color={CC.pulm} opacity={0.16} stateRef={stateRef} structure="pulmonar"
        />
        <ArterioleBranches />
        <EndotheliumRing />
        <Plaque stateRef={stateRef} />
    </group>
);
