import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';

export const CellEnvironment: React.FC = () => {
    const membraneRef = useRef<THREE.Mesh>(null);
    const cytoRef = useRef<THREE.Points>(null);
    const setHoveredObject = useStore(state => state.setHoveredObject);
    const currentStep = useStore(state => state.currentStep);

    // Cytoplasm Particles
    const PARTICLE_COUNT = 400;
    const particles = useMemo(() => {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(PARTICLE_COUNT * 3);
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const r = 3 + Math.random() * 8;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = (r * Math.cos(phi)) * 0.6;
            pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return geo;
    }, []);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        // Ambient breathing
        if (membraneRef.current && currentStep < 5) {
            const s = 1 + Math.sin(t * 0.4) * 0.005;
            membraneRef.current.scale.set(13 * s, 8 * s, 10 * s);
        } else if (membraneRef.current && currentStep === 5) {
            // Hypertrophy expansion handled in step specific logic later, or keep static here
            membraneRef.current.scale.lerp(new THREE.Vector3(14, 8.5, 11), 0.05);
        }

        if (cytoRef.current) {
            const positions = cytoRef.current.geometry.attributes.position.array as Float32Array;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                positions[i * 3] += Math.sin(t * 0.3 + i) * 0.002;
                positions[i * 3 + 1] += Math.cos(t * 0.2 + i * 0.5) * 0.001;
            }
            cytoRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    const handlePointerOver = (e: any) => {
        e.stopPropagation();
        setHoveredObject({
            name: 'Membrana celular',
            info: 'Bicamada lipídica — o interior hidrofóbico permite que hormônios esteroides (como a testosterona) se difundam livremente.'
        });
        document.body.style.cursor = 'pointer';
    };

    const handlePointerOut = () => {
        setHoveredObject(null);
        document.body.style.cursor = '';
    };

    return (
        <group>
            <mesh scale={[13.1, 8.1, 10.1]}>
                <sphereGeometry args={[1, 64, 48]} />
                <meshBasicMaterial color="#0088ff" transparent opacity={0.08} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </mesh>

            {/* Structured Membrane Boundary */}
            <mesh
                ref={membraneRef}
                scale={[13, 8, 10]}
                onPointerOver={handlePointerOver}
                onPointerOut={handlePointerOut}
            >
                <sphereGeometry args={[1, 64, 48]} />
                <meshPhysicalMaterial
                    color="#00e5ff"
                    transparent
                    opacity={0.25}
                    roughness={0.2}
                    metalness={0.4}
                    transmission={0.9}
                    clearcoat={1.0}
                    clearcoatRoughness={0.2}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Inner Fluid Sphere */}
            <mesh scale={[12.8, 7.8, 9.8]}>
                <sphereGeometry args={[1, 48, 36]} />
                <meshPhysicalMaterial
                    color="#061e3d"
                    transparent
                    opacity={0.4}
                    roughness={0.8}
                    transmission={0.5}
                />
            </mesh>

            {/* Cytoplasm Particles */}
            <points ref={cytoRef} geometry={particles}>
                <pointsMaterial size={0.05} color="#1565c0" transparent opacity={0.3} sizeAttenuation />
            </points>

            {/* Mitochondria Instances (Decorative) */}
            <Mitochondria />
        </group>
    );
};

const Mitochondria: React.FC = () => {
    const positions = useMemo(() => [
        [-7, 2.5, 2.5], [-5, -4, -2.5], [6, -3.5, 1.5],
        [-8, 0.5, -1.5], [8, 3, -2.5], [3, -5, 3]
    ], []);

    const setHoveredObject = useStore(state => state.setHoveredObject);

    const interact = (e: any) => {
        e.stopPropagation();
        setHoveredObject({
            name: 'Mitocôndria',
            info: 'Fornece ATP para a síntese proteica. A testosterona estimula a biogênese mitocondrial.'
        });
        document.body.style.cursor = 'pointer';
    };

    const out = () => {
        setHoveredObject(null);
        document.body.style.cursor = '';
    };

    return (
        <group onPointerOver={interact} onPointerOut={out}>
            {positions.map((pos, i) => (
                <group key={i} position={pos as [number, number, number]} rotation={[Math.random() * 2, Math.random() * 2, Math.random() * 2]}>
                    <mesh>
                        <cylinderGeometry args={[0.35, 0.35, 1.2, 10]} />
                        <meshStandardMaterial color="#d84315" transparent opacity={0.35} roughness={0.5} emissive="#bf360c" emissiveIntensity={0.15} />
                    </mesh>
                    <mesh position={[0, 0.6, 0]}>
                        <sphereGeometry args={[0.35, 12, 12]} />
                        <meshStandardMaterial color="#d84315" transparent opacity={0.35} roughness={0.5} emissive="#bf360c" emissiveIntensity={0.15} />
                    </mesh>
                    <mesh position={[0, -0.6, 0]}>
                        <sphereGeometry args={[0.35, 12, 12]} />
                        <meshStandardMaterial color="#d84315" transparent opacity={0.35} roughness={0.5} emissive="#bf360c" emissiveIntensity={0.15} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};
