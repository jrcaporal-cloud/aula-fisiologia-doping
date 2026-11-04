import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { lerp } from '../receptor/layout';
import { CC } from './colors';
import { AORTIC, AORTIC_R, MITRAL, MITRAL_R } from './layout';
import type { CardioStateRef } from './flow';
import type { PickKind } from './pickHelpers';
import { useStructure } from './useStructure';

/*
 * Valvas de entrada (mitral) e de saída (aórtica). Cada folheto é uma aba articulada no ânulo:
 * a mitral abre para dentro do ventrículo na diástole, a aórtica abre para a aorta na sístole.
 * O quanto cada uma abre vem do ciclo — e o ciclo tira o `fe` e o E′ (`eLinha`) da ficha.
 */

/** Ângulos de folheto fechado e aberto (rad), medidos do plano do ânulo. */
const SHUT = 0.16;
const OPEN = 1.0;
const THICK = 0.07;

const SOLID: { pick: PickKind } = { pick: 'solid' };

const LeafletMat = ({ lit }: { lit: boolean }) => (
    <meshStandardMaterial
        color={CC.valve} roughness={0.42} metalness={0.02} side={THREE.DoubleSide} transparent opacity={0.94}
        emissive="#fb7185" emissiveIntensity={lit ? 0.75 : 0}
    />
);

interface ValveProps { stateRef: CardioStateRef }

export const Valves = ({ stateRef }: ValveProps) => {
    const mitral = useRef<(THREE.Group | null)[]>([]);
    const aortic = useRef<(THREE.Group | null)[]>([]);

    const mi = useStructure('mitral');
    const ao = useStructure('aortica');

    useFrame(() => {
        const { cy } = stateRef.current;
        const m = lerp(SHUT, OPEN, cy.mitral);
        const a = lerp(SHUT, OPEN, cy.aortic);
        mitral.current.forEach((g, i) => { if (g) g.rotation.z = (i === 0 ? -1 : 1) * m; });
        aortic.current.forEach(g => { if (g) g.rotation.z = -a; });
    });

    const mLen = MITRAL_R * 0.98;
    const aLen = AORTIC_R * 0.95;
    return (
        <group>
            <group position={MITRAL} userData={SOLID} {...mi.bind}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[MITRAL_R, 0.08, 8, 28]} />
                    <meshStandardMaterial color={CC.valve} roughness={0.5} />
                </mesh>
                {[-1, 1].map((s, i) => (
                    <group key={s} ref={el => { mitral.current[i] = el; }} position={[s * MITRAL_R * 0.94, 0, 0]}>
                        <mesh position={[(-s * mLen) / 2, 0, 0]}>
                            <boxGeometry args={[mLen, THICK, MITRAL_R * 1.7]} />
                            <LeafletMat lit={mi.lit} />
                        </mesh>
                    </group>
                ))}
            </group>

            <group position={AORTIC} userData={SOLID} {...ao.bind}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[AORTIC_R, 0.07, 8, 24]} />
                    <meshStandardMaterial color={CC.valve} roughness={0.5} />
                </mesh>
                {[0, 1, 2].map(k => (
                    <group key={k} rotation={[0, (k * Math.PI * 2) / 3, 0]}>
                        <group ref={el => { aortic.current[k] = el; }} position={[AORTIC_R * 0.92, 0, 0]}>
                            <mesh position={[-aLen / 2, 0, 0]}>
                                <boxGeometry args={[aLen, THICK, AORTIC_R * 1.12]} />
                                <LeafletMat lit={ao.lit} />
                            </mesh>
                        </group>
                    </group>
                ))}
            </group>
        </group>
    );
};
