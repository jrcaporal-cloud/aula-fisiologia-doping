import { useEffect, useMemo } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { V } from '../receptor/layout';
import { FLOW, rangeOf, type CardioStateRef } from './flow';
import type { Kind } from './layout';
import { makeTube, type Tube } from './tube';
import { makeVesselFx, type VesselFx, type VesselStyle } from './tissueShaders';
import { noRaycast, type PickKind } from './pickHelpers';
import { armPin, useSelection } from './selection';
import type { StructureId } from './structures';
import { useStructure } from './useStructure';

/*
 * Os vasos em corte longitudinal (ver tube.ts). Opacos: a parede tem cor e camadas de tecido, e o
 * sangue corre à vista na metade de trás. Aorta e artéria pulsam com a sístole (menos quanto mais
 * rígidas); a placa cresce de um lado da parede da artéria e estreita a luz.
 */

const SOLID: { pick: PickKind } = { pick: 'solid' };

const useTube = (kind: Kind): Tube => {
    const tube = useMemo(() => {
        const [a, b] = rangeOf(kind);
        // uma amostra de folga em cada ponta para os trechos se encostarem sem fenda
        return makeTube(a - 1, b + 1);
    }, [kind]);
    useEffect(() => () => tube.geometry.dispose(), [tube]);
    return tube;
};

interface VesselMatProps { fx: VesselFx; clearcoat?: number }

const VesselMaterial = ({ fx, clearcoat = 0.7 }: VesselMatProps) => (
    <meshPhysicalMaterial
        color="#ffffff" roughness={0.42} metalness={0} clearcoat={clearcoat} clearcoatRoughness={0.25}
        onBeforeCompile={fx.onBeforeCompile} customProgramCacheKey={fx.customProgramCacheKey}
    />
);

interface FlowTubeProps { kind: Kind; style: VesselStyle; structure: StructureId; stateRef: CardioStateRef }

const FlowTube = ({ kind, style, structure, stateRef }: FlowTubeProps) => {
    const tube = useTube(kind);
    const fx = useMemo(() => makeVesselFx(style), [style]);
    const { bind, lit } = useStructure(structure);
    useEffect(() => fx.set('uLit', lit ? 1 : 0), [lit, fx]);
    useFrame(() => tube.write(stateRef.current.f));
    return (
        <mesh geometry={tube.geometry} userData={SOLID} {...bind}>
            <VesselMaterial fx={fx} />
        </mesh>
    );
};

/**
 * A artéria de condução distingue três alvos pelo triângulo sob o ponteiro: a parede (corte e
 * adventícia), o endotélio (a luz) e a placa (a luz sobre a lesão).
 */
const ARTERY_IDS: readonly StructureId[] = ['arteria', 'endotelio', 'placa'];

const ConductingArtery = ({ stateRef }: { stateRef: CardioStateRef }) => {
    const tube = useTube('arteria');
    const fx = useMemo(() => makeVesselFx('artery'), []);
    const lit = useSelection(s => {
        const id = s.pin ? s.pin.id : s.hoverId;
        return id !== null && ARTERY_IDS.includes(id);
    });
    useEffect(() => fx.set('uLit', lit ? 1 : 0), [lit, fx]);
    useFrame(() => {
        const st = stateRef.current;
        tube.write(st.f);
        fx.set('uDys', st.p.v.placa);
    });
    const bind = useMemo(() => {
        const idOf = (e: ThreeEvent<PointerEvent>): StructureId => {
            const face = e.faceIndex ?? Infinity;
            if (face >= tube.innerTris) return 'arteria';
            const i = tube.sampleOfFace(face);
            return stateRef.current.f.sten[i] > 0.04 ? 'placa' : 'endotelio';
        };
        return {
            onPointerMove: (e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                useSelection.getState().setHover(idOf(e));
            },
            onPointerOut: () => {
                const s = useSelection.getState();
                if (s.hoverId && ARTERY_IDS.includes(s.hoverId)) s.setHover(null);
            },
            onPointerDown: (e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                armPin(idOf(e), [e.point.x, e.point.y, e.point.z]);
            },
        };
    }, [tube, stateRef]);
    return (
        <mesh geometry={tube.geometry} userData={SOLID} {...bind}>
            <VesselMaterial fx={fx} />
        </mesh>
    );
};

/** Ramos do leito de resistência (decorativos: o fluxo corre pelo trecho principal). */
const ArterioleBranches = () => {
    const geo = useMemo(() => {
        const [a, b] = rangeOf('arteriola');
        const at = (u: number) => FLOW[Math.round(a + (b - a) * u) % FLOW.length].p;
        const branch = (u: number, d: THREE.Vector3, r: number) => {
            const p0 = at(u).clone();
            const p1 = p0.clone().add(d.clone().multiplyScalar(0.55)).add(V(0, 0, -0.25));
            const p2 = p0.clone().add(d).add(V(0, 0, -0.5));
            return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p0, p1, p2]), 12, r, 7, false);
        };
        return [
            branch(0.2, V(1.5, 0.5, 0), 0.09),
            branch(0.35, V(1.7, -0.2, 0), 0.08),
            branch(0.5, V(1.6, -0.4, 0), 0.08),
            branch(0.68, V(1.3, -0.9, 0), 0.07),
            branch(0.15, V(1.1, 1.0, 0), 0.06),
        ];
    }, []);
    useEffect(() => () => geo.forEach(g => g.dispose()), [geo]);
    return (
        <group>
            {geo.map((g, i) => (
                <mesh key={i} geometry={g} raycast={noRaycast}>
                    <meshPhysicalMaterial color="#c97a7f" roughness={0.45} clearcoat={0.5} clearcoatRoughness={0.3} />
                </mesh>
            ))}
        </group>
    );
};

export const Vessels = ({ stateRef }: { stateRef: CardioStateRef }) => (
    <group>
        <FlowTube kind="aorta" style="aorta" structure="aorta" stateRef={stateRef} />
        <ConductingArtery stateRef={stateRef} />
        <FlowTube kind="arteriola" style="arteriole" structure="arteriola" stateRef={stateRef} />
        <FlowTube kind="veia" style="vein" structure="veia" stateRef={stateRef} />
        <FlowTube kind="pulmonar" style="pulm" structure="pulmonar" stateRef={stateRef} />
        <ArterioleBranches />
    </group>
);
