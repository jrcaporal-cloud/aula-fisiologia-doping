import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

interface Props {
    progressRef: React.MutableRefObject<{ value: number }>;
}

export const NucleusAndDNA: React.FC<Props> = ({ progressRef }) => {
    const nucleusRef = useRef<THREE.Group>(null);
    const dnaRef = useRef<THREE.Group>(null);
    const poreRef = useRef<THREE.Mesh>(null);
    const setHoveredObject = useStore(state => state.setHoveredObject);

    const HELIX_POINTS = 120;

    const dnaData = useMemo(() => {
        const strands1 = [];
        const strands2 = [];
        const rungs = [];

        for (let i = 0; i < HELIX_POINTS; i++) {
            const t = (i / HELIX_POINTS) * Math.PI * 6; // 3 full turns
            const y = (i / HELIX_POINTS) * 8 - 4;

            const p1 = new THREE.Vector3(Math.cos(t) * 1.2, y, Math.sin(t) * 1.2);
            const p2 = new THREE.Vector3(Math.cos(t + Math.PI) * 1.2, y, Math.sin(t + Math.PI) * 1.2);

            strands1.push(p1);
            strands2.push(p2);

            if (i % 3 === 0) {
                rungs.push({ p1, p2, y });
            }
        }
        return { strands1, strands2, rungs };
    }, []);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const p = progressRef.current.value;

        if (dnaRef.current) {
            dnaRef.current.rotation.y = t * 0.15;

            // Glow up during translation/transcription steps (Step 4, p > 0.6)
            dnaRef.current.children.forEach(child => {
                if ((child as THREE.Mesh).material) {
                    const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
                    if (mat.emissiveIntensity !== undefined) {
                        if (p > 0.6 && p <= 0.8) {
                            mat.emissiveIntensity = 0.5 + Math.sin(t * 3) * 0.6 * ((p - 0.6) * 5);
                        } else if (p > 0.8) {
                            mat.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.4;
                        } else {
                            mat.emissiveIntensity = 0.5;
                        }
                    }
                }
            });
        }

        if (poreRef.current) {
            // Highlight Pore during Step 3
            const mat = poreRef.current.material as THREE.MeshBasicMaterial;
            if (p > 0.4 && p <= 0.6) {
                mat.opacity = Math.sin((p - 0.4) * 5 * Math.PI) * 0.8;
            } else {
                mat.opacity = 0;
            }
        }

        if (nucleusRef.current) {
            if (p > 0.4) {
                const coreMat = (nucleusRef.current.children[0] as THREE.Mesh).material as THREE.MeshPhysicalMaterial;
                coreMat.emissiveIntensity = 0.4 + Math.min((p - 0.4) * 2, 1) * 0.5;
            }
        }
    });

    const interactNucleus = (e: any) => {
        e.stopPropagation();
        setHoveredObject({
            name: 'Nucleus',
            info: 'Stores DNA and controls gene expression. T-AR enters here to activate transcription.'
        });
        document.body.style.cursor = 'pointer';
    };

    const interactDNA = (e: any) => {
        e.stopPropagation();
        setHoveredObject({
            name: 'DNA Double Helix (AREs)',
            info: 'Contains genes for contractile proteins (actin, myosin). Contains Androgen Response Elements (AREs) that the T-AR complex binds to.'
        });
        document.body.style.cursor = 'pointer';
    };

    const interactPore = (e: any) => {
        e.stopPropagation();
        setHoveredObject({
            name: 'Nuclear Pore Complex (NPC)',
            info: 'Gated channel that imports the T-AR complex into the nucleus via importin-β.'
        });
        document.body.style.cursor = 'pointer';
    };

    const out = () => {
        setHoveredObject(null);
        document.body.style.cursor = 'grab';
    };

    return (
        <group>
            {/* Nucleus */}
            <group ref={nucleusRef} onPointerOver={interactNucleus} onPointerOut={out}>
                <mesh scale={[3.5, 3.2, 3.3]} castShadow>
                    <sphereGeometry args={[1, 64, 48]} />
                    <meshPhysicalMaterial
                        color="#4a148c"
                        transparent
                        opacity={0.35}
                        roughness={0.25}
                        metalness={0.15}
                        emissive="#2a0060"
                        emissiveIntensity={0.4}
                    />
                </mesh>
                <mesh scale={[3.7, 3.4, 3.5]}>
                    <sphereGeometry args={[1, 64, 48]} />
                    <meshPhysicalMaterial
                        color="#6a1b9a"
                        transparent
                        opacity={0.15}
                        roughness={0.1}
                        transmission={0.5}
                        side={THREE.DoubleSide}
                    />
                </mesh>

                {/* DNA Inside Nucleus */}
                <group ref={dnaRef} scale={0.75} onPointerOver={interactDNA} onPointerOut={out}>
                    {/* Strands */}
                    {dnaData.strands1.map((pos, i) => (
                        <mesh key={`s1-${i}`} position={pos} scale={0.12}>
                            <sphereGeometry args={[1, 12, 12]} />
                            <meshStandardMaterial color="#7c4dff" emissive="#651fff" emissiveIntensity={0.5} roughness={0.3} metalness={0.2} />
                        </mesh>
                    ))}
                    {dnaData.strands2.map((pos, i) => (
                        <mesh key={`s2-${i}`} position={pos} scale={0.12}>
                            <sphereGeometry args={[1, 12, 12]} />
                            <meshStandardMaterial color="#7c4dff" emissive="#651fff" emissiveIntensity={0.5} roughness={0.3} metalness={0.2} />
                        </mesh>
                    ))}
                    {/* Base Pairs (Rungs) */}
                    {dnaData.rungs.map((rung, i) => {
                        const dir = new THREE.Vector3().subVectors(rung.p2, rung.p1);
                        const length = dir.length();
                        const center = new THREE.Vector3().addVectors(rung.p1, rung.p2).multiplyScalar(0.5);
                        const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());

                        return (
                            <mesh key={`rung-${i}`} position={center} quaternion={quaternion}>
                                <cylinderGeometry args={[0.04, 0.04, length, 8]} />
                                <meshStandardMaterial color="#b388ff" emissive="#7c4dff" emissiveIntensity={0.2} />
                            </mesh>
                        )
                    })}
                </group>
            </group>

            {/* Nuclear Pore */}
            <mesh ref={poreRef} position={[3.4, 0.5, 1.2]} onPointerOver={interactPore} onPointerOut={out}>
                <torusGeometry args={[0.55, 0.1, 16, 24]} />
                <meshBasicMaterial color="#00e5ff" transparent opacity={0} />
            </mesh>
        </group>
    );
};
