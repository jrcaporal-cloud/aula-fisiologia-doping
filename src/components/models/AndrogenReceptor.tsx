import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

interface Props {
    progressRef: React.MutableRefObject<{ value: number }>;
}

export const AndrogenReceptor: React.FC<Props> = ({ progressRef }) => {
    const groupRef = useRef<THREE.Group>(null);
    const complexRef = useRef<THREE.Group>(null);
    const setHoveredObject = useStore(state => state.setHoveredObject);

    const startPositions = useMemo(() => [
        new THREE.Vector3(6, 0.5, 2.5),
        new THREE.Vector3(5, -1.5, -2),
        new THREE.Vector3(7, 1.5, -0.5),
    ], []);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const p = progressRef.current.value;

        // AR floating logic
        if (groupRef.current) {
            groupRef.current.children.forEach((child, i) => {
                child.rotation.y = Math.sin(t * 0.25 + i) * 0.08;

                // Hide individual ARs at step 3+ (p >= 0.4)
                child.visible = p <= 0.4;

                // HSP dissociation glow effect during step 2
                if (p > 0.2 && p <= 0.4) {
                    const localP = (p - 0.2) * 5;
                    const glowMesh = child.children[3] as THREE.Mesh;
                    (glowMesh.material as THREE.MeshBasicMaterial).opacity = 0.06 + localP * 0.18;

                    // HSP meshes fly away
                    const hsp1 = child.children[1] as THREE.Group;
                    const hsp2 = child.children[2] as THREE.Group;
                    hsp1.position.x = -0.4 - localP * 1.5;
                    hsp1.position.y = 0.5 + localP;
                    hsp2.position.x = 0.4 + localP * 1.5;
                    hsp2.position.y = 0.3 + localP;

                    [hsp1, hsp2].forEach(hsp => {
                        hsp.children.forEach(m => {
                            ((m as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 1 - localP;
                        });
                    });
                } else if (p <= 0.2) {
                    // reset hsps
                    const hsp1 = child.children[1] as THREE.Group;
                    const hsp2 = child.children[2] as THREE.Group;
                    hsp1.position.set(-0.4, 0.5, 0.2);
                    hsp2.position.set(0.4, 0.3, -0.1);
                    [hsp1, hsp2].forEach(hsp => {
                        hsp.children.forEach(m => {
                            ((m as THREE.Mesh).material as THREE.MeshStandardMaterial).opacity = 1;
                        });
                    });
                }
            });
        }

        // T-AR Complex logic (Step 3 to 4)
        if (complexRef.current) {
            complexRef.current.visible = p > 0.4;
            const startRotY = Math.sin(t * 0.25 + 0) * 0.08;

            if (p > 0.4 && p <= 0.6) { // Translocation
                const localP = (p - 0.4) * 5;
                const sp = startPositions[0].clone();
                const ep = new THREE.Vector3(2.5, 0.5, 0.8);
                complexRef.current.position.lerpVectors(sp, ep, localP);
                complexRef.current.rotation.y = startRotY + localP * Math.PI * 1.5;
                complexRef.current.scale.setScalar(1);
            } else if (p > 0.6 && p <= 0.8) { // Inside nucleus binding DNA
                const localP = (p - 0.6) * 5;
                const sp = new THREE.Vector3(2.5, 0.5, 0.8);
                const ep = new THREE.Vector3(0.5, 0.5, 0);
                complexRef.current.position.lerpVectors(sp, ep, localP);
                complexRef.current.scale.setScalar(1 - localP * 0.45); // shrink to fit DNA
                complexRef.current.rotation.y = (startRotY + Math.PI * 1.5) + localP * Math.PI * 0.5;
            } else if (p > 0.8) {
                complexRef.current.position.set(0.5, 0.5, 0);
                complexRef.current.scale.setScalar(0.55);
                complexRef.current.rotation.y = (startRotY + Math.PI * 2);
            }

            if (complexRef.current.visible) {
                complexRef.current.rotation.y += 0.004;
            }
        }
    });

    const interactAR = (e: any) => {
        e.stopPropagation();
        setHoveredObject({
            name: 'Receptor androgênico (AR)',
            info: 'Receptor intracelular. Permanece ligado às proteínas de choque térmico (HSP) até a testosterona induzir a mudança conformacional.'
        });
        document.body.style.cursor = 'pointer';
    };

    const interactHSP = (e: any) => {
        e.stopPropagation();
        setHoveredObject({
            name: 'Proteínas de choque térmico (HSP90)',
            info: 'Chaperonas que mantêm o AR estável e inativo. Dissociam-se quando a testosterona se liga.'
        });
        document.body.style.cursor = 'pointer';
    };

    const interactComplex = (e: any) => {
        e.stopPropagation();
        setHoveredObject({
            name: 'Dímero T-AR',
            info: 'Forma ativa que se transloca para o núcleo e se liga aos genes-alvo.'
        });
        document.body.style.cursor = 'pointer';
    };

    const out = () => {
        setHoveredObject(null);
        document.body.style.cursor = '';
    };

    return (
        <group>
            {/* Androgen Receptor (AR) Base Model */}
            <group> {/* This group now uses individualARsGroupRef */}
                {startPositions.map((pos, i) => (
                    <ReceptorModel key={i} position={pos} interact={interactAR} interactHsp={interactHSP} out={out} />
                ))}
            </group>

            {/* T-AR Complex */}
            <group ref={complexRef} onPointerOver={interactComplex} onPointerOut={out}>
                {/* Receptor Part */}
                <OrganicARCore />

                {/* Testosterone Part, physically bound exactly where the pocket is */}
                <group position={[0, 1.05, 0.1]} rotation={[Math.PI / 4, 0, 0]} scale={0.45}>
                    <mesh position={[0, 0, 0]}>
                        <torusGeometry args={[0.28, 0.09, 16, 12]} />
                        <meshStandardMaterial color="#00e676" emissive="#00c853" emissiveIntensity={0.7} roughness={0.2} metalness={0.4} />
                    </mesh>
                    <mesh position={[0.48, 0, 0]}>
                        <torusGeometry args={[0.28, 0.09, 16, 12]} />
                        <meshStandardMaterial color="#00e676" emissive="#00c853" emissiveIntensity={0.7} roughness={0.2} metalness={0.4} />
                    </mesh>
                    <mesh position={[0.24, 0.42, 0]}>
                        <torusGeometry args={[0.28, 0.09, 16, 12]} />
                        <meshStandardMaterial color="#00e676" emissive="#00c853" emissiveIntensity={0.7} roughness={0.2} metalness={0.4} />
                    </mesh>
                    <mesh position={[0.58, 0.42, 0]}>
                        <torusGeometry args={[0.2, 0.07, 16, 10]} />
                        <meshStandardMaterial color="#00e676" emissive="#00c853" emissiveIntensity={0.7} roughness={0.2} metalness={0.4} />
                    </mesh>
                </group>
            </group>
        </group>
    );
};

const OrganicARCore = () => (
    <group>
        {/* LBD - Ligand Binding Domain (Top - Pocket) */}
        <mesh position={[0, 0.8, 0]} scale={[1, 0.8, 1.2]}>
            <sphereGeometry args={[0.3, 32, 32]} />
            <meshStandardMaterial color="#d84315" roughness={0.4} metalness={0.2} emissive="#bf360c" emissiveIntensity={0.2} />
        </mesh>
        <mesh position={[0.2, 1.0, 0]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#d84315" roughness={0.4} metalness={0.2} />
        </mesh>
        <mesh position={[-0.2, 0.9, 0.2]}>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshStandardMaterial color="#d84315" roughness={0.4} metalness={0.2} />
        </mesh>
        {/* DBD - DNA Binding Domain (Middle) */}
        <mesh position={[0.1, 0.3, -0.1]} scale={[0.8, 1.2, 0.8]}>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshStandardMaterial color="#bf360c" roughness={0.5} metalness={0.1} />
        </mesh>
        {/* NTD - N-Terminal Domain (Bottom/Tail) */}
        <mesh position={[-0.1, -0.2, 0.1]} scale={[1.2, 1.5, 0.8]}>
            <sphereGeometry args={[0.25, 32, 32]} />
            <meshStandardMaterial color="#e64a19" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[0.1, -0.6, 0]} scale={[0.8, 1.2, 1]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#e64a19" roughness={0.6} metalness={0.1} />
        </mesh>

        {/* Binding Pocket Hole (visual cue) */}
        <mesh position={[0, 1.05, 0.1]} rotation={[Math.PI / 4, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.05, 0.2, 16]} />
            <meshStandardMaterial color="#3e1004" roughness={0.9} />
        </mesh>
    </group>
);

const ReceptorModel = ({ position, interact, interactHsp, out }: any) => {
    return (
        <group position={position} onPointerOver={interact} onPointerOut={out}>
            <OrganicARCore />

            {/* HSP90 Blockers (Detailed organic addition) */}
            <group position={[-0.4, 0.5, 0.2]} onPointerOver={interactHsp} onPointerOut={out}>
                <mesh position={[0, 0, 0]}>
                    <dodecahedronGeometry args={[0.25, 1]} />
                    <meshPhysicalMaterial color="#ffb74d" transparent roughness={0.3} clearcoat={0.5} />
                </mesh>
                <mesh position={[0.15, -0.1, 0.1]}>
                    <dodecahedronGeometry args={[0.15, 1]} />
                    <meshStandardMaterial color="#ffa726" transparent />
                </mesh>
            </group>
            <group position={[0.4, 0.3, -0.1]} onPointerOver={interactHsp} onPointerOut={out}>
                <mesh position={[0, 0, 0]}>
                    <dodecahedronGeometry args={[0.25, 1]} />
                    <meshPhysicalMaterial color="#ffb74d" transparent roughness={0.3} clearcoat={0.5} />
                </mesh>
                <mesh position={[-0.1, 0.2, -0.1]}>
                    <dodecahedronGeometry args={[0.15, 1]} />
                    <meshStandardMaterial color="#ffa726" transparent />
                </mesh>
            </group>

            {/* Glow */}
            <mesh>
                <sphereGeometry args={[1.0, 16, 16]} />
                <meshBasicMaterial color="#ff7043" transparent opacity={0.06} />
            </mesh>
        </group>
    );
}
