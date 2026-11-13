import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import type { Line2 } from 'three-stdlib';
import { presetById } from './lab/labModel';
import { useLab } from './lab/labStore';
import { makeChamber, chamberPoint, type ChamberShape } from './chamber';
import type { CardioStateRef } from './flow';
import { atriumShape, emptyShape, lvShape, rvShape, shapeLengths } from './heartShapes';
import { APEX_RATIO, BASE_FRAC, BASE_Y, HEART_POS, HEART_SCALE, HEART_TILT, LA, MM, RA } from './layout';
import { makeHeartTissueFx, type HeartTissueFx } from './tissueShaders';
import { noRaycast, type PickKind } from './pickHelpers';
import type { StructureId } from './structures';
import { useStructure } from './useStructure';
import { Valves } from './Valves';

/*
 * O coração em corte de quatro câmaras: VE, septo, VD e os dois átrios, cada um uma câmara de parede
 * espessa (ver chamber.ts) dentro de um grupo inclinado como no tórax. Tudo lê o estado do quadro:
 * a parede do VE vem da ficha (mm), a cavidade contrai com o ciclo, o VD contrai junto (com menos
 * amplitude), os átrios enchem e empurram no fim da diástole.
 */

const SOLID: { pick: PickKind } = { pick: 'solid' };

interface ChamberMeshProps {
    id: StructureId;
    keep: ChamberShape['keep'];
    fx: HeartTissueFx;
    /** Escreve a forma da câmara no quadro. */
    shape: (st: CardioStateRef['current'], out: ChamberShape) => ChamberShape;
    stateRef: CardioStateRef;
    /** O VE ganha a disputa de profundidade no septo (as faces do corte são coplanares). */
    front?: boolean;
}

const ChamberMesh = ({ id, keep, fx, shape, stateRef, front = false }: ChamberMeshProps) => {
    const chamber = useMemo(() => makeChamber(keep), [keep]);
    const sh = useMemo(() => emptyShape(keep), [keep]);
    const { bind, lit } = useStructure(id);
    useEffect(() => () => chamber.geometry.dispose(), [chamber]);
    useEffect(() => fx.set('uLit', lit ? 1 : 0), [lit, fx]);
    useFrame(() => {
        shape(stateRef.current, sh);
        chamber.write(sh);
        const [mer, circ, thick] = shapeLengths(sh);
        fx.set('uMerLen', mer);
        fx.set('uCircLen', circ);
        fx.set('uThick', thick);
    });
    return (
        <mesh geometry={chamber.geometry} userData={SOLID} {...bind}>
            <meshPhysicalMaterial
                color="#ffffff"
                roughness={0.48}
                metalness={0}
                clearcoat={0.75}
                clearcoatRoughness={0.26}
                polygonOffset={front}
                polygonOffsetFactor={front ? -1 : 0}
                polygonOffsetUnits={front ? -2 : 0}
                onBeforeCompile={fx.onBeforeCompile}
                customProgramCacheKey={fx.customProgramCacheKey}
            />
        </mesh>
    );
};

/** Contorno do VE do coração treinado (diástole), desenhado no plano do corte. */
const trainedContour = (): { endo: THREE.Vector3[]; epi: THREE.Vector3[] } => {
    const v = presetById('treinado').vitals;
    const rCav = (v.cavidadeMm * MM) / 2;
    const hCav = rCav * APEX_RATIO;
    const wall = v.paredeMm * MM;
    const s: ChamberShape = {
        cx: 0, yc: BASE_Y - BASE_FRAC * hCav, rIn: rCav, hIn: hCav, rOut: rCav + wall, hOut: hCav + wall,
        zs: 1, cutY: BASE_Y, keep: 'below',
    };
    const line = (inner: boolean) => {
        const pts: THREE.Vector3[] = [];
        for (let i = 40; i >= 0; i--) pts.push(chamberPoint(s, i / 40, 0, inner, new THREE.Vector3()).setZ(0.03));
        for (let i = 1; i <= 40; i++) pts.push(chamberPoint(s, i / 40, 1, inner, new THREE.Vector3()).setZ(0.03));
        return pts;
    };
    return { endo: line(true), epi: line(false) };
};

const CONTOUR = '#7DD3FC';

/** "Sobrepor o treinado": contorno tracejado do VE treinado, como no slide 2D. */
const TrainedContour = () => {
    const pts = useMemo(() => trainedContour(), []);
    const on = useLab(s => s.contour);
    const endo = useRef<Line2>(null);
    const epi = useRef<Line2>(null);
    const k = useRef(0);
    useFrame((_, dt) => {
        k.current += ((on ? 1 : 0) - k.current) * Math.min(dt * 6, 1);
        for (const l of [endo.current, epi.current]) {
            if (!l) continue;
            const m = l.material;
            m.opacity = 0.9 * k.current;
            l.visible = k.current > 0.01;
        }
    });
    return (
        <group>
            {[[endo, pts.endo], [epi, pts.epi]].map(([ref, p], i) => (
                <Line
                    key={i}
                    ref={ref as React.RefObject<Line2>}
                    points={p as THREE.Vector3[]}
                    color={CONTOUR}
                    lineWidth={2.4}
                    dashed
                    dashSize={0.22}
                    gapSize={0.14}
                    transparent
                    depthTest={false}
                    renderOrder={10}
                    raycast={noRaycast}
                />
            ))}
        </group>
    );
};

export const Heart = ({ stateRef }: { stateRef: CardioStateRef }) => {
    const fx = useMemo(() => ({
        lv: makeHeartTissueFx(1),
        rv: makeHeartTissueFx(0.85),
        la: makeHeartTissueFx(0.35),
        ra: makeHeartTissueFx(0.35),
    }), []);
    useFrame(() => {
        const { p, cy } = stateRef.current;
        fx.lv.set('uFib', p.v.fibrose);
        fx.lv.set('uContract', Math.min(Math.max((1 - cy.volRatio) / Math.max(p.v.fe / 100, 0.05), 0), 1));
    });
    const la = useMemo(() => atriumShape(LA), []);
    const ra = useMemo(() => atriumShape(RA), []);
    return (
        <group position={HEART_POS} rotation={[0, 0, HEART_TILT]} scale={HEART_SCALE}>
            <ChamberMesh id="miocardio" keep="below" fx={fx.lv} shape={lvShape} stateRef={stateRef} front />
            <ChamberMesh id="vd" keep="below" fx={fx.rv} shape={rvShape} stateRef={stateRef} />
            <ChamberMesh id="atrioE" keep="above" fx={fx.la} shape={la} stateRef={stateRef} />
            <ChamberMesh id="atrioD" keep="above" fx={fx.ra} shape={ra} stateRef={stateRef} />
            <Valves stateRef={stateRef} />
            <TrainedContour />
        </group>
    );
};
