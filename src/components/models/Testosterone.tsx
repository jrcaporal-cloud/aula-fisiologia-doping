import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

interface Props {
    progressRef: React.MutableRefObject<{ value: number }>;
}

export const Testosterone: React.FC<Props> = ({ progressRef }) => {
    const groupRef = useRef<THREE.Group>(null);
    const setHoveredObject = useStore(state => state.setHoveredObject);

    const startPositions = useMemo(() => [
        new THREE.Vector3(17, 3, 4),
        new THREE.Vector3(18, -1, -3),
        new THREE.Vector3(16, 1, 0),
        new THREE.Vector3(19, 2, -5),
        new THREE.Vector3(17.5, -3, 2),
        new THREE.Vector3(20, 0, 1),
    ], []);

    useFrame(({ clock }) => {
        if (!groupRef.current) return;
        const t = clock.getElapsedTime();
        const p = progressRef.current.value;

        groupRef.current.children.forEach((child, i) => {
            // Step 0: Floating outside
            // Step 1: Diffusion inside cell
            // Step 2: Binding (first 3 go to AR, rest stay in cytoplasm)

            const sp = startPositions[i];
            let tPos = new THREE.Vector3();
            let scale = 1;

            if (p < 0.2) { // Step 0 to 1
                const localP = p * 5; // 0 to 1
                const ep = new THREE.Vector3(9 - i * 1.2, (i - 2.5) * 0.7, (i - 2.5) * 0.5);
                tPos.lerpVectors(sp, ep, localP);
            } else if (p < 0.4) { // Step 1 to 2
                const localP = (p - 0.2) * 5;
                if (i < 3) {
                    // Move to ARs
                    const arPos = [
                        new THREE.Vector3(6, 0.5, 2.5),
                        new THREE.Vector3(5, -1.5, -2),
                        new THREE.Vector3(7, 1.5, -0.5),
                    ][i];
                    const ep = arPos.clone().add(new THREE.Vector3(0, 1.05, 0.1));
                    const sp2 = new THREE.Vector3(9 - i * 1.2, (i - 2.5) * 0.7, (i - 2.5) * 0.5);
                    tPos.lerpVectors(sp2, ep, localP);
                    tPos.y += Math.sin(localP * Math.PI) * 2.0; // wider arc into the pocket

                    // Dynamic rotation to simulate docking
                    child.rotation.x = localP * (Math.PI / 4);
                    child.rotation.y = localP * Math.PI * 2;
                    child.rotation.z = 0; // reset

                    scale = 1 - localP * 0.55; // ends at 0.45 target scale
                } else {
                    tPos.copy(new THREE.Vector3(9 - i * 1.2, (i - 2.5) * 0.7, (i - 2.5) * 0.5));
                }
            } else {
                if (i < 3) {
                    child.visible = false; // Hidden inside AR or nucleus complex
                } else {
                    tPos.copy(new THREE.Vector3(9 - i * 1.2, (i - 2.5) * 0.7, (i - 2.5) * 0.5));
                }
            }

            if (i >= 3 || p < 0.4) child.visible = true;

            child.position.copy(tPos);
            child.scale.setScalar(scale);

            // Ambient floating
            if (p < 0.2) {
                child.position.y += Math.sin(t * 1.2 + i * 1.5) * 0.05;
                child.rotation.y = t * 0.4 + i;
                child.rotation.z = Math.sin(t * 0.6 + i) * 0.08;
            }
        });
    });

    const interact = (e: any) => {
        e.stopPropagation();
        setHoveredObject({
            name: 'Testosterona',
            info: 'Testosterona (C₁₉H₂₈O₂) — hormônio esteroide anabólico-androgênico lipofílico.'
        });
        document.body.style.cursor = 'pointer';
    };

    const out = () => {
        setHoveredObject(null);
        document.body.style.cursor = '';
    };

    return (
        <group ref={groupRef}>
            {startPositions.map((_, i) => (
                <TestosteroneMolecule key={i} interact={interact} out={out} />
            ))}
        </group>
    );
};

// Extremely detailed representation of the 4 carbon rings
const TestosteroneMolecule = ({ interact, out }: { interact: any, out: any }) => {
    return (
        <group onPointerOver={interact} onPointerOut={out}>
            {/* 4 Carbon Rings */}
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
            <mesh position={[0.58, 0.42, 0]}> {/* 5-membered ring D */}
                <torusGeometry args={[0.2, 0.07, 16, 10]} />
                <meshStandardMaterial color="#00e676" emissive="#00c853" emissiveIntensity={0.7} roughness={0.2} metalness={0.4} />
            </mesh>
            {/* connecting bonds */}
            <mesh position={[0.24, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.04, 0.04, 0.22, 10]} />
                <meshStandardMaterial color="#00e676" emissive="#00c853" emissiveIntensity={0.7} roughness={0.2} metalness={0.4} />
            </mesh>
            {/* Inner Glow Sphere */}
            <mesh position={[0.25, 0.2, 0]}>
                <sphereGeometry args={[0.5, 16, 16]} />
                <meshBasicMaterial color="#00e676" transparent opacity={0.12} />
            </mesh>
        </group>
    );
};
