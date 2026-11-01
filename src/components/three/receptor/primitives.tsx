import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { ATOM_R, CPK, MOL_SCALE, type MoleculeData } from './molecules';
import { SPHERE_GEO, SPHERE_LO, STICK_GEO, getGlowTexture, stickMatrix, type Sphere } from './geometry';

const UP = new THREE.Vector3(0, 1, 0);
const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpS = new THREE.Vector3();

// ---------------------------------------------------------------- bolas e varetas

interface BallStickProps { data: MoleculeData }

/** Molécula em bolas e varetas (cores CPK); cada ligação é dividida ao meio com a cor de cada átomo. */
export const BallStick = ({ data }: BallStickProps) => {
    const atomsRef = useRef<THREE.InstancedMesh>(null);
    const bondsRef = useRef<THREE.InstancedMesh>(null);
    const bondCount = useMemo(() => data.bonds.reduce((s, b) => s + b[2] * 2, 0), [data]);

    useLayoutEffect(() => {
        const am = atomsRef.current;
        const bm = bondsRef.current;
        if (!am || !bm) return;
        const col = new THREE.Color();
        const pos = data.atoms.map(a => new THREE.Vector3(...a.p));
        data.atoms.forEach((a, i) => {
            const r = ATOM_R[a.el] * MOL_SCALE;
            tmpM.compose(pos[i], tmpQ.identity(), tmpS.set(r, r, r));
            am.setMatrixAt(i, tmpM);
            am.setColorAt(i, col.set(CPK[a.el]));
        });
        am.instanceMatrix.needsUpdate = true;
        if (am.instanceColor) am.instanceColor.needsUpdate = true;

        let k = 0;
        const dir = new THREE.Vector3();
        const perp = new THREE.Vector3();
        const ref = new THREE.Vector3(0, 0, 1);
        const a2 = new THREE.Vector3();
        const b2 = new THREE.Vector3();
        const mid = new THREE.Vector3();
        data.bonds.forEach(([ia, ib, order]) => {
            const a = pos[ia];
            const b = pos[ib];
            dir.subVectors(b, a).normalize();
            perp.crossVectors(dir, Math.abs(dir.z) > 0.9 ? UP : ref).normalize();
            const gap = 0.09;
            const r = order === 1 ? 0.045 : 0.032;
            for (let o = 0; o < order; o++) {
                const off = (o - (order - 1) / 2) * gap;
                a2.copy(a).addScaledVector(perp, off);
                b2.copy(b).addScaledVector(perp, off);
                mid.addVectors(a2, b2).multiplyScalar(0.5);
                bm.setMatrixAt(k, stickMatrix(a2, mid, r, tmpM));
                bm.setColorAt(k++, col.set(CPK[data.atoms[ia].el]));
                bm.setMatrixAt(k, stickMatrix(mid, b2, r, tmpM));
                bm.setColorAt(k++, col.set(CPK[data.atoms[ib].el]));
            }
        });
        bm.instanceMatrix.needsUpdate = true;
        if (bm.instanceColor) bm.instanceColor.needsUpdate = true;
    }, [data]);

    return (
        <group>
            <instancedMesh key={`a${data.atoms.length}`} ref={atomsRef} args={[SPHERE_GEO, undefined, data.atoms.length]}>
                <meshStandardMaterial roughness={0.28} metalness={0.15} envMapIntensity={0} />
            </instancedMesh>
            <instancedMesh key={`b${bondCount}`} ref={bondsRef} args={[STICK_GEO, undefined, bondCount]}>
                <meshStandardMaterial roughness={0.4} metalness={0.1} />
            </instancedMesh>
        </group>
    );
};

// ---------------------------------------------------------------- nuvens de esferas (estilo Goodsell)

interface CloudProps {
    spheres: Sphere[];
    color: string;
    color2?: string;
    roughness?: number;
    emissive?: string;
    emissiveIntensity?: number;
    opacity?: number;
    lowPoly?: boolean;
    materialRef?: React.Ref<THREE.MeshStandardMaterial>;
}

/** Desenha uma nuvem de esferas como uma única malha instanciada. */
export const Cloud = ({ spheres, color, color2, roughness = 0.6, emissive = '#000000', emissiveIntensity = 0, opacity = 1, lowPoly, materialRef }: CloudProps) => {
    const ref = useRef<THREE.InstancedMesh>(null);
    useLayoutEffect(() => {
        const m = ref.current;
        if (!m) return;
        const c1 = new THREE.Color(color);
        const c2 = new THREE.Color(color2 ?? color);
        const c = new THREE.Color();
        spheres.forEach((s, i) => {
            tmpM.compose(s.p, tmpQ.identity(), tmpS.set(s.r, s.r, s.r));
            m.setMatrixAt(i, tmpM);
            c.copy(c1).lerp(c2, s.shade).multiplyScalar(0.86 + 0.28 * s.shade);
            m.setColorAt(i, c);
        });
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
        m.computeBoundingSphere();
    }, [spheres, color, color2]);
    return (
        <instancedMesh ref={ref} args={[lowPoly ? SPHERE_LO : SPHERE_GEO, undefined, spheres.length]} frustumCulled={false}>
            <meshStandardMaterial
                ref={materialRef}
                roughness={roughness}
                metalness={0.05}
                emissive={emissive}
                emissiveIntensity={emissiveIntensity}
                transparent={opacity < 1}
                opacity={opacity}
            />
        </instancedMesh>
    );
};

// ---------------------------------------------------------------- brilho (sprite gerado em canvas)

interface GlowProps {
    color: string;
    size: number;
    opacity?: number;
    spriteRef?: React.Ref<THREE.Sprite>;
    position?: [number, number, number];
}
export const Glow = ({ color, size, opacity = 0.6, spriteRef, position }: GlowProps) => {
    const tex = useMemo(() => getGlowTexture(), []);
    return (
        <sprite ref={spriteRef} scale={[size, size, 1]} position={position} renderOrder={5}>
            <spriteMaterial map={tex} color={color} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </sprite>
    );
};
