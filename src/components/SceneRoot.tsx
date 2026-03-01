import React, { useRef, useEffect } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { useStore } from '../store/useStore';
import { STEPS } from '../data/steps';

// Core components imported below
import { Effects } from './Effects';

export const SceneRoot: React.FC = () => {
    const { currentSlide, setAnimating } = useStore();
    const cameraRef = useRef<THREE.PerspectiveCamera>(null);
    const controlsRef = useRef<any>(null);

    // Track continuous global progress (0.0 to 1.0) based on currentSlide
    const progressRef = useRef({ value: currentSlide / 30 });

    useEffect(() => {
        if (!cameraRef.current || !controlsRef.current) return;

        const targetStepIndex = Math.min(Math.floor(currentSlide / 6), STEPS.length - 1);
        const step = STEPS[targetStepIndex];
        const targetProgress = Math.min(currentSlide / 30, 1.0);

        setAnimating(true);

        const tl = gsap.timeline({
            onComplete: () => {
                setAnimating(false);
            }
        });

        // Animate Camera Position
        tl.to(cameraRef.current.position, {
            x: step.cameraPosition[0],
            y: step.cameraPosition[1],
            z: step.cameraPosition[2],
            duration: 1.5,
            ease: "power3.inOut"
        }, 0);

        // Animate OrbitControls Target
        tl.to(controlsRef.current.target, {
            x: step.cameraTarget[0],
            y: step.cameraTarget[1],
            z: step.cameraTarget[2],
            duration: 1.5,
            ease: "power3.inOut"
        }, 0);

        // Animate Global Timeline Progress for components to hook into
        tl.to(progressRef.current, {
            value: targetProgress,
            duration: 1.5,
            ease: "power2.inOut"
        }, 0);

    }, [currentSlide, setAnimating]);

    return (
        <>
            <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 8, 35]} fov={45} />
            <OrbitControls
                ref={controlsRef}
                enablePan={false}
                maxPolarAngle={Math.PI * 0.85}
                minDistance={5}
                maxDistance={60}
                dampingFactor={0.05}
            />

            {/* Lighting */}
            <ambientLight intensity={0.4} color="#1a1a40" />
            <directionalLight
                position={[12, 18, 10]}
                intensity={1.2}
                color="#88ccff"
                castShadow
                shadow-mapSize={[1024, 1024]}
                shadow-camera-far={60}
            />
            <directionalLight position={[-12, 5, -10]} intensity={0.4} color="#3344aa" />
            <pointLight position={[0, 0, 0]} intensity={0.8} distance={20} color="#9c27b0" />


            <Effects />
        </>
    );
};
