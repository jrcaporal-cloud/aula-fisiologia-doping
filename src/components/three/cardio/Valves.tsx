import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { lerp } from '../receptor/layout';
import { stickMatrix } from '../receptor/geometry';
import { chamberPoint } from './chamber';
import type { CardioStateRef } from './flow';
import { emptyShape, lvShape, rvShape } from './heartShapes';
import { AORTIC, MITRAL, TRICUSPID, type ValveDef } from './layout';
import { noRaycast, type PickKind } from './pickHelpers';
import type { StructureId } from './structures';
import { useStructure } from './useStructure';

/*
 * Valvas em corte (referencial do coração). Cada valva é um funil de folhetos — metade de trás, como
 * o resto da peça — preso ao ânulo: aberto, os folhetos pendem paralelos para dentro da câmara;
 * fechado, eles se encontram no meio (coaptação). No plano do corte, as bordas do funil aparecem como
 * os dois folhetos de perfil, exatamente como no eco. Mitral e tricúspide abrem para baixo na
 * diástole, presas por cordas tendíneas aos músculos papilares; a aórtica abre para cima na sístole.
 * O quanto cada uma abre vem do ciclo, que tira o `fe` e o E′ da ficha.
 */

const NU = 7;
const NV = 15;
const SOLID: { pick: PickKind } = { pick: 'solid' };

interface Funnel { geometry: THREE.BufferGeometry; write: (R: number, rf: number, L: number, dir: number) => void }

const makeFunnel = (): Funnel => {
    const pos = new Float32Array(NU * NV * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(NU * NV * 3), 3));
    const idx: number[] = [];
    for (let i = 0; i < NU - 1; i++) {
        for (let j = 0; j < NV - 1; j++) {
            const a = i * NV + j;
            idx.push(a, a + 1, a + NV + 1, a, a + NV + 1, a + NV);
        }
    }
    geometry.setIndex(idx);
    geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2.5);
    const write = (R: number, rf: number, L: number, dir: number) => {
        for (let i = 0; i < NU; i++) {
            const u = i / (NU - 1);
            const rad = lerp(R, rf, Math.pow(u, 0.8));
            const y = dir * L * Math.pow(u, 0.9);
            for (let j = 0; j < NV; j++) {
                const phi = Math.PI + (Math.PI * j) / (NV - 1);
                const k = (i * NV + j) * 3;
                pos[k] = rad * Math.cos(phi);
                pos[k + 1] = y;
                pos[k + 2] = Math.min(rad * Math.sin(phi), 0) * 0.9;
            }
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
    };
    return { geometry, write };
};

interface ValveGeom { R: number; rf: number; L: number; dir: number }

/** Abertura (0…1) → raio da borda livre e comprimento do folheto. */
const shapeOf = (def: ValveDef, open: number, dir: number, out: ValveGeom): ValveGeom => {
    out.R = def.r;
    out.dir = dir;
    out.rf = lerp(0.04, 0.8, open) * def.r;
    out.L = lerp(0.38, dir < 0 ? 1.3 : 0.95, open) * def.r;
    return out;
};

const LEAFLET = '#d6a99e';

const LeafletMaterial = ({ lit }: { lit: boolean }) => (
    <meshPhysicalMaterial
        color={LEAFLET} roughness={0.5} metalness={0} side={THREE.DoubleSide} transparent opacity={0.82} depthWrite={false}
        clearcoat={0.6} clearcoatRoughness={0.3} sheen={0.6} sheenColor="#ffd9d4" sheenRoughness={0.5}
        emissive="#fb7185" emissiveIntensity={lit ? 0.35 : 0}
    />
);

interface OneValveProps {
    def: ValveDef;
    id: StructureId | null;
    funnel: Funnel;
}

const OneValve = ({ def, id, funnel }: OneValveProps) => {
    const s = useStructure(id ?? 'mitral');
    const bind = id ? s.bind : {};
    const lit = id ? s.lit : false;
    return (
        <group position={[def.x, def.y, 0]}>
            <mesh geometry={funnel.geometry} userData={id ? SOLID : undefined} raycast={id ? undefined : noRaycast} {...bind}>
                <LeafletMaterial lit={lit} />
            </mesh>
            {/* ânulo fibroso, em meia-volta */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} raycast={noRaycast}>
                <torusGeometry args={[def.r, 0.07, 8, 20, Math.PI]} />
                <meshPhysicalMaterial color="#d9b2a6" roughness={0.6} />
            </mesh>
        </group>
    );
};

const tmpA = new THREE.Vector3();
const tmpB = new THREE.Vector3();
const tmpM = new THREE.Matrix4();

/** Pontos de ancoragem das cordas na borda livre (fração da meia-volta) e o papilar de cada uma. */
const MITRAL_CHORDS: readonly (readonly [number, number])[] = [[0.08, 0], [0.22, 0], [0.36, 0], [0.64, 1], [0.78, 1], [0.92, 1]];
const TRI_CHORDS: readonly (readonly [number, number])[] = [[0.15, 2], [0.35, 2], [0.65, 2], [0.85, 2]];
const CHORDS = MITRAL_CHORDS.length + TRI_CHORDS.length;

/** Escreve as cordas (pares de pontos) no buffer da geometria. */
const writeChords = (g: THREE.BufferGeometry, mi: ValveGeom, tri: ValveGeom, tips: readonly THREE.Vector3[]) => {
    const arr = g.attributes.position.array as Float32Array;
    let c = 0;
    for (const [list, def, vg] of [[MITRAL_CHORDS, MITRAL, mi], [TRI_CHORDS, TRICUSPID, tri]] as const) {
        for (const [side, pap] of list) {
            const phi = Math.PI + Math.PI * side;
            arr[c * 6] = def.x + vg.rf * Math.cos(phi);
            arr[c * 6 + 1] = def.y + vg.dir * vg.L;
            arr[c * 6 + 2] = Math.min(vg.rf * Math.sin(phi), 0) * 0.9;
            arr[c * 6 + 3] = tips[pap].x;
            arr[c * 6 + 4] = tips[pap].y;
            arr[c * 6 + 5] = tips[pap].z;
            c++;
        }
    }
    g.attributes.position.needsUpdate = true;
};

export const Valves = ({ stateRef }: { stateRef: CardioStateRef }) => {
    const funnels = useMemo(() => ({ mi: makeFunnel(), tri: makeFunnel(), ao: makeFunnel() }), []);
    const sticks = useRef<THREE.InstancedMesh>(null);
    const papillary = useRef<THREE.InstancedMesh>(null);
    const chords = useMemo(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(CHORDS * 6), 3));
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(-1.5, 0.5, 0), 6);
        return g;
    }, []);
    const lv = useMemo(() => emptyShape('below'), []);
    const rv = useMemo(() => emptyShape('below'), []);
    const geo = useMemo(() => ({ mi: {} as ValveGeom, tri: {} as ValveGeom, ao: {} as ValveGeom }), []);
    /** Pontas dos 3 papilares (2 no VE, 1 no VD), no referencial do coração. */
    const tips = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], []);
    const bases = useMemo(() => [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()], []);

    useEffect(() => () => {
        funnels.mi.geometry.dispose();
        funnels.tri.geometry.dispose();
        funnels.ao.geometry.dispose();
        chords.dispose();
    }, [funnels, chords]);

    useFrame(() => {
        const st = stateRef.current;
        const { cy } = st;
        shapeOf(MITRAL, cy.mitral, -1, geo.mi);
        shapeOf(TRICUSPID, cy.mitral * 0.92, -1, geo.tri);
        shapeOf(AORTIC, cy.aortic, 1, geo.ao);
        funnels.mi.write(geo.mi.R, geo.mi.rf, geo.mi.L, -1);
        funnels.tri.write(geo.tri.R, geo.tri.rf, geo.tri.L, -1);
        funnels.ao.write(geo.ao.R, geo.ao.rf, geo.ao.L, 1);

        // perfis dos folhetos no plano do corte (as bordas do funil, com espessura)
        const m = sticks.current;
        if (m) {
            let n = 0;
            for (const [def, g] of [[MITRAL, geo.mi], [TRICUSPID, geo.tri], [AORTIC, geo.ao]] as const) {
                for (const sgn of [-1, 1]) {
                    tmpA.set(def.x + sgn * g.R, def.y, 0.02);
                    tmpB.set(def.x + sgn * g.rf, def.y + g.dir * g.L, 0.02);
                    m.setMatrixAt(n++, stickMatrix(tmpA, tmpB, 0.045, tmpM));
                }
            }
            m.instanceMatrix.needsUpdate = true;
        }

        // músculos papilares: nascem na parede (que contrai) e apontam para a valva
        lvShape(st, lv);
        rvShape(st, rv);
        const pm = papillary.current;
        chamberPoint(lv, 0.4, 0.2, true, bases[0]);
        chamberPoint(lv, 0.4, 0.8, true, bases[1]);
        chamberPoint(rv, 0.42, 0.5, true, bases[2]);
        for (let i = 0; i < 3; i++) {
            const def = i === 2 ? TRICUSPID : MITRAL;
            tmpA.set(def.x, def.y - 1.1, 0);
            tips[i].copy(bases[i]).lerp(tmpA, i === 2 ? 0.32 : 0.36);
            pm?.setMatrixAt(i, stickMatrix(bases[i], tips[i], i === 2 ? 0.16 : 0.22, tmpM));
        }
        if (pm) pm.instanceMatrix.needsUpdate = true;

        // cordas tendíneas: da borda livre dos folhetos à ponta do papilar
        writeChords(chords, geo.mi, geo.tri, tips);
    });

    return (
        <group>
            <OneValve def={MITRAL} id="mitral" funnel={funnels.mi} />
            <OneValve def={TRICUSPID} id={null} funnel={funnels.tri} />
            <OneValve def={AORTIC} id="aortica" funnel={funnels.ao} />
            <instancedMesh ref={sticks} args={[undefined, undefined, 6]} frustumCulled={false} raycast={noRaycast}>
                <cylinderGeometry args={[1, 1, 1, 8, 1]} />
                <meshPhysicalMaterial color={LEAFLET} roughness={0.4} clearcoat={0.5} />
            </instancedMesh>
            <instancedMesh ref={papillary} args={[undefined, undefined, 3]} frustumCulled={false} raycast={noRaycast}>
                <cylinderGeometry args={[0.55, 1, 1, 12, 1]} />
                <meshPhysicalMaterial color="#8a1a2b" roughness={0.5} clearcoat={0.6} clearcoatRoughness={0.3} />
            </instancedMesh>
            <lineSegments geometry={chords} raycast={noRaycast} frustumCulled={false}>
                <lineBasicMaterial color="#f3ddd3" transparent opacity={0.85} />
            </lineSegments>
        </group>
    );
};
