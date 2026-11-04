import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CC } from './colors';
import { LA_CENTER, LA_R, MITRAL, RA_CENTER, RA_R } from './layout';
import type { CardioStateRef } from './flow';
import { useStructure } from './useStructure';

/*
 * Átrios. O esquerdo faz o trabalho extra quando o ventrículo relaxa mal: contrai com força no fim da
 * diástole (onda A) e dilata com a pressão de enchimento — é esse átrio remodelado que serve de
 * substrato para a fibrilação atrial, citada no desfecho.
 */

interface AtriaProps { stateRef: CardioStateRef }

export const Atria = ({ stateRef }: AtriaProps) => {
    const laRef = useRef<THREE.Group>(null);
    const raRef = useRef<THREE.Group>(null);

    const la = useStructure('atrioE');
    const ra = useStructure('atrioD');

    useFrame(() => {
        const { p, cy } = stateRef.current;
        const dil = 1 + 0.2 * (1 - p.relax);
        const squeeze = 1 - 0.16 * cy.atrial;
        if (laRef.current) laRef.current.scale.set(dil * squeeze, dil * squeeze * 1.12, dil * squeeze);
        if (raRef.current) {
            const k = 1 - 0.05 * cy.atrial;
            raRef.current.scale.set(k, k, k);
        }
    });

    return (
        <group>
            <group ref={laRef} position={LA_CENTER} {...la.bind}>
                <mesh>
                    <sphereGeometry args={[LA_R, 20, 14]} />
                    <meshStandardMaterial color={CC.atrium} roughness={0.55} transparent opacity={la.lit ? 0.7 : 0.42} depthWrite={false} />
                </mesh>
            </group>
            {/* colo entre o átrio esquerdo e o ânulo mitral */}
            <mesh position={[(LA_CENTER.x + MITRAL.x) / 2, (LA_CENTER.y + MITRAL.y) / 2 - 0.1, LA_CENTER.z / 2]} rotation={[0, 0, 0.12]}>
                <cylinderGeometry args={[0.68, 0.86, 2.3, 16, 1, true]} />
                <meshStandardMaterial color={CC.atrium} roughness={0.6} side={THREE.DoubleSide} transparent opacity={0.3} depthWrite={false} />
            </mesh>
            <group ref={raRef} position={RA_CENTER} {...ra.bind}>
                <mesh>
                    <sphereGeometry args={[RA_R, 18, 12]} />
                    <meshStandardMaterial color={CC.vein} roughness={0.6} transparent opacity={ra.lit ? 0.72 : 0.45} depthWrite={false} />
                </mesh>
            </group>
        </group>
    );
};
