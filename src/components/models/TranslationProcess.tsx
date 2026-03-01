import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

interface Props {
    progressRef: React.MutableRefObject<{ value: number }>;
}

export const TranslationProcess: React.FC<Props> = ({ progressRef }) => {
    const mrnaRef = useRef<THREE.Group>(null);
    const ribosomeRef = useRef<THREE.Group>(null);
    const peptideChainRef = useRef<THREE.Group>(null);

    // We still keep the instanced mesh for the final zoomed out hypertrophy effect
    const proteinsRef = useRef<THREE.InstancedMesh>(null);
    const setHoveredObject = useStore(state => state.setHoveredObject);

    const PROTEIN_COUNT = 80;
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Pre-generate grid positions for identical protein spheres (myofibril cross-section look)
    const proteinPositions = useMemo(() => {
        const pos = [];
        for (let i = 0; i < PROTEIN_COUNT; i++) {
            const row = Math.floor(i / 16);
            const col = i % 16;
            pos.push(new THREE.Vector3(col * 0.5 - 3.75, row * 0.7 - 1.5, Math.sin(col * 0.4) * 0.2));
        }
        return pos;
    }, []);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const p = progressRef.current.value;

        // mRNA & Ribosome Logic (Step 4 -> 5 -> 6)
        // Step 4 (0.6 to 0.8): mRNA created in nucleus
        // Step 5 (0.8 to 1.0): mRNA exported to cytoplasm, Ribosome attaches, Translation occurs

        if (mrnaRef.current && ribosomeRef.current && peptideChainRef.current) {
            mrnaRef.current.visible = p > 0.65;
            ribosomeRef.current.visible = p > 0.85;
            peptideChainRef.current.visible = p > 0.85;

            // MRNA logic
            if (p > 0.65 && p <= 0.8) {
                // Transcription phase
                const localP = (p - 0.65) / 0.15;
                mrnaRef.current.children.forEach((child, i) => {
                    child.visible = (i / mrnaRef.current!.children.length) <= localP;
                });
                mrnaRef.current.position.set(0, 0, 0); // Inside nucleus
            } else if (p > 0.8) {
                const localP = (p - 0.8) / 0.2;
                mrnaRef.current.children.forEach(c => c.visible = true);

                // Export and feed through ribosome
                const mStart = new THREE.Vector3(0, 0, 0); // Nucleus
                const mRibosomeStart = new THREE.Vector3(-4, -1, 3); // Ribosome docking position
                const mRibosomeEnd = new THREE.Vector3(-7, -1, 3); // Threading through

                if (localP < 0.3) { // Travel to Ribosome
                    const moveP = localP / 0.3;
                    mrnaRef.current.position.lerpVectors(mStart, mRibosomeStart, moveP);
                } else { // Threading
                    const threadP = (localP - 0.3) / 0.7;
                    mrnaRef.current.position.lerpVectors(mRibosomeStart, mRibosomeEnd, threadP);
                }

                // Wiggle smoothly
                mrnaRef.current.children.forEach((c, i) => {
                    const stepT = (i / 45) * Math.PI * 4;
                    const baseX = Math.cos(stepT) * 0.5 + Math.sin(stepT * 0.5) * 0.25;
                    c.position.x = baseX + Math.sin(t * 2.5 + i * 0.4) * 0.05;
                });
            } else {
                mrnaRef.current.children.forEach(c => c.visible = false);
            }

            // Ribosome and Peptide Chain Logic
            if (p > 0.85) {
                const localP = (p - 0.85) / 0.15;

                // Ribosome slight breathing pulse
                const pulse = 1 + Math.sin(t * 5) * 0.05;
                ribosomeRef.current.scale.set(pulse, pulse, pulse);
                // Rotate top and bottom sub-units slightly
                ribosomeRef.current.children[0].rotation.y = Math.sin(t * 2) * 0.1;
                ribosomeRef.current.children[1].rotation.y = Math.cos(t * 2) * 0.1;

                // Peptide chain growth
                peptideChainRef.current.children.forEach((aminoAcid, i) => {
                    const threshold = i / 30; // 30 amino acids
                    if (localP > threshold) {
                        aminoAcid.visible = true;
                        // Animate scaling and wiggling as it emerges
                        aminoAcid.scale.setScalar(Math.min(1, (localP - threshold) * 8));
                        const offset = Math.sin(t * 3 + i) * 0.1;
                        aminoAcid.position.x = -5 + Math.cos(i * 0.5) * (0.1 + i * 0.02) + offset;
                        aminoAcid.position.y = -0.5 + i * 0.15; // grows upwards
                        aminoAcid.position.z = 3 + Math.sin(i * 0.5) * (0.1 + i * 0.02);
                    } else {
                        aminoAcid.visible = false;
                        aminoAcid.scale.setScalar(0);
                    }
                });
            } else {
                peptideChainRef.current.children.forEach(a => a.visible = false);
            }
        }

        // Final Hypertrophy Instanced Mesh 
        if (proteinsRef.current) {
            // Show background hypertrophy when translation is well underway
            proteinsRef.current.visible = p > 0.92;

            if (p > 0.92) {
                const localP = (p - 0.92) / 0.08;
                const visCount = Math.floor(localP * PROTEIN_COUNT);

                for (let i = 0; i < PROTEIN_COUNT; i++) {
                    const scaleBase = i < visCount ? Math.min(1, (localP - i / PROTEIN_COUNT) * 6) : 0;
                    if (scaleBase > 0) {
                        const pulse = 1 + Math.sin(t * 3 + i * 0.5) * 0.08;
                        dummy.position.copy(proteinPositions[i]);
                        dummy.scale.setScalar((0.25 + (i % 3) * 0.03) * scaleBase * pulse);
                    } else {
                        dummy.scale.setScalar(0);
                    }
                    dummy.updateMatrix();
                    proteinsRef.current.setMatrixAt(i, dummy.matrix);
                }
                proteinsRef.current.instanceMatrix.needsUpdate = true;
            }
        }
    });

    const interactObj = (name: string, info: string) => (e: any) => {
        e.stopPropagation();
        setHoveredObject({ name, info });
        document.body.style.cursor = 'pointer';
    };

    const out = () => {
        setHoveredObject(null);
        document.body.style.cursor = 'grab';
    };

    return (
        <group>
            {/* mRNA Strand */}
            <group ref={mrnaRef}
                onPointerOver={interactObj('mRNA Strand', 'Messenger RNA transcribed from DNA. It carries the code out into the cytoplasm.')}
                onPointerOut={out}>
                {Array.from({ length: 45 }).map((_, i) => {
                    const t = (i / 45) * Math.PI * 4;
                    const x = Math.cos(t) * 0.5 + Math.sin(t * 0.5) * 0.25;
                    const y = (i / 45) * 5.5 - 2.75 - 1.5; // Offset to thread through horizontally
                    const z = Math.sin(t) * 0.5;
                    // Rotate so it lays flat for threading
                    return (
                        <mesh key={`mrna-${i}`} position={[y, x, z]} scale={0.08}>
                            <sphereGeometry args={[1, 12, 12]} />
                            <meshStandardMaterial color="#ff4081" emissive="#ff4081" emissiveIntensity={0.6} roughness={0.3} metalness={0.2} />
                        </mesh>
                    );
                })}
            </group>

            {/* Ribosome */}
            <group ref={ribosomeRef} position={[-5, -1, 3]}
                onPointerOver={interactObj('Ribosome', 'The cellular machine that reads mRNA and links amino acids together to form proteins.')}
                onPointerOut={out}>
                {/* Large Subunit */}
                <mesh position={[0, 0.4, 0]}>
                    <cylinderGeometry args={[0.8, 0.7, 0.6, 32]} />
                    <meshStandardMaterial color="#8e24aa" roughness={0.7} metalness={0.1} />
                </mesh>
                {/* Small Subunit */}
                <mesh position={[0, -0.3, 0]}>
                    <cylinderGeometry args={[0.5, 0.6, 0.4, 32]} />
                    <meshStandardMaterial color="#ba68c8" roughness={0.7} metalness={0.1} />
                </mesh>
                {/* mRNA Tunnel Glow */}
                <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.2, 0.2, 2.0, 16]} />
                    <meshBasicMaterial color="#ff4081" transparent opacity={0.15} />
                </mesh>
            </group>

            {/* Emerging Polypeptide Chain */}
            <group ref={peptideChainRef}
                onPointerOver={interactObj('Polypeptide Chain', 'Amino acids linked via peptide bonds. Will fold into structural proteins like Actin and Myosin.')}
                onPointerOut={out}>
                {Array.from({ length: 30 }).map((_, i) => (
                    <mesh key={`aa-${i}`} scale={0}>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshStandardMaterial
                            color={i % 3 === 0 ? "#ffeb3b" : (i % 2 === 0 ? "#00bcd4" : "#4caf50")}
                            roughness={0.3}
                            metalness={0.2}
                        />
                    </mesh>
                ))}
            </group>

            {/* Final Background Hypertrophy */}
            <instancedMesh
                ref={proteinsRef}
                args={[undefined, undefined, PROTEIN_COUNT]}
                position={[-8, -2.5, 4.5]}
                onPointerOver={interactObj('Actin & Myosin Formation', 'Increased rate of MPS (Muscle Protein Synthesis) leading directly to muscle hypertrophy (growth).')}
                onPointerOut={out}
            >
                <sphereGeometry args={[1, 16, 16]} />
                <meshStandardMaterial color="#fdd835" emissive="#fbc02d" emissiveIntensity={0.2} roughness={0.35} metalness={0.25} />
            </instancedMesh>
        </group>
    );
};
