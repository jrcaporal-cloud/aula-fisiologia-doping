import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { ANIMATED_BACKGROUND_SLIDES } from '../deck/slides';

const CELL_COUNT = 70;
const DUST_COUNT = 500;
const FIELD = { x: 34, y: 20, z: 26 };

/** Hemácia: disco bicôncavo gerado por revolução de um perfil (mais fino no centro). */
const makeErythrocyteGeometry = () => {
    const points: THREE.Vector2[] = [];
    const R = 1;
    for (let i = 0; i <= 24; i++) {
        const r = (i / 24) * R;
        const t = r / R;
        // Perfil clássico de Evans–Fung, simplificado.
        const h = 0.5 * Math.sqrt(Math.max(1 - t * t, 0)) * (0.2 + 2.0 * t * t - 1.1 * t ** 4);
        points.push(new THREE.Vector2(r, Math.max(h, 0.04)));
    }
    for (let i = 24; i >= 0; i--) points.push(new THREE.Vector2(points[i].x, -points[i].y));
    const geo = new THREE.LatheGeometry(points, 40);
    geo.computeVertexNormals();
    return geo;
};

const seeded = (seed: number) => {
    let s = seed;
    return () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
};

interface Cell {
    pos: THREE.Vector3;
    rot: THREE.Euler;
    spin: THREE.Vector3;
    speed: number;
    scale: number;
}

const BloodStream = () => {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const geometry = useMemo(() => makeErythrocyteGeometry(), []);
    const cells = useMemo<Cell[]>(() => {
        const rand = seeded(7);
        return Array.from({ length: CELL_COUNT }, () => ({
            pos: new THREE.Vector3((rand() - 0.5) * FIELD.x * 2, (rand() - 0.5) * FIELD.y * 2, -rand() * FIELD.z - 4),
            rot: new THREE.Euler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI),
            spin: new THREE.Vector3((rand() - 0.5) * 0.3, (rand() - 0.5) * 0.3, (rand() - 0.5) * 0.2),
            speed: 0.6 + rand() * 1.1,
            scale: 0.55 + rand() * 0.6,
        }));
    }, []);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    useFrame((_, delta) => {
        const mesh = meshRef.current;
        if (!mesh) return;
        const dt = Math.min(delta, 0.05);
        cells.forEach((c, i) => {
            c.pos.x += c.speed * dt;
            c.pos.y += Math.sin(c.pos.x * 0.15 + i) * 0.12 * dt;
            if (c.pos.x > FIELD.x) c.pos.x = -FIELD.x;
            c.rot.x += c.spin.x * dt;
            c.rot.y += c.spin.y * dt;
            c.rot.z += c.spin.z * dt;
            dummy.position.copy(c.pos);
            dummy.rotation.copy(c.rot);
            dummy.scale.setScalar(c.scale);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[geometry, undefined, CELL_COUNT]}>
            <meshStandardMaterial color="#b3123a" emissive="#5a0418" emissiveIntensity={0.55} roughness={0.45} metalness={0.05} />
        </instancedMesh>
    );
};

const Plasma = () => {
    const ref = useRef<THREE.Points>(null);
    const geometry = useMemo(() => {
        const rand = seeded(13);
        const pos = new Float32Array(DUST_COUNT * 3);
        for (let i = 0; i < DUST_COUNT; i++) {
            pos[i * 3] = (rand() - 0.5) * FIELD.x * 2;
            pos[i * 3 + 1] = (rand() - 0.5) * FIELD.y * 2;
            pos[i * 3 + 2] = -rand() * FIELD.z * 1.4;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        return geo;
    }, []);
    useFrame((_, delta) => {
        if (ref.current) ref.current.rotation.z += delta * 0.006;
    });
    return (
        <points ref={ref} geometry={geometry}>
            <pointsMaterial size={0.07} color="#f472b6" transparent opacity={0.35} sizeAttenuation depthWrite={false} />
        </points>
    );
};

/** Parallax suave com o mouse + leve aproximação ao avançar na aula. */
const CameraDrift = () => {
    const slide = useStore(s => s.currentSlide);
    const target = useRef(new THREE.Vector3());
    useFrame(({ camera, pointer }, delta) => {
        target.current.set(pointer.x * 1.6, pointer.y * 1.0, 16 - Math.min(slide, 40) * 0.08);
        camera.position.lerp(target.current, Math.min(delta * 1.5, 1));
        camera.lookAt(0, 0, -10);
    });
    return null;
};

/**
 * Fundo 3D da aula: hemácias e plasma fluindo — tema da aula, baixo custo
 * (uma instância, sem pós-processamento) e fica atenuado nos slides de conteúdo.
 */
export const AmbientBackground = () => {
    const slide = useStore(s => s.currentSlide);
    const modalOpen = useStore(s => s.modalOpen);
    const isHero = slide === 0;

    return (
        <div
            aria-hidden
            className="absolute inset-0 z-0 transition-opacity duration-1000"
            style={{ opacity: isHero ? 0.95 : 0.4 }}
        >
            <Canvas
                dpr={[1, 1.5]}
                frameloop={modalOpen ? 'never' : ANIMATED_BACKGROUND_SLIDES.has(slide) ? 'always' : 'demand'}
                camera={{ position: [0, 0, 16], fov: 50 }}
                gl={{ antialias: true, powerPreference: 'low-power' }}
            >
                <color attach="background" args={['#050510']} />
                <fog attach="fog" args={['#050510', 14, 46]} />
                <ambientLight intensity={0.35} color="#4a2050" />
                <directionalLight position={[8, 10, 12]} intensity={1.4} color="#ffd1dc" />
                <pointLight position={[-12, -4, 4]} intensity={2.5} distance={40} color="#7c3aed" />
                <CameraDrift />
                <BloodStream />
                <Plasma />
            </Canvas>
            {/* Vinheta: garante contraste do texto sobre o fundo animado. */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,5,16,0.55)_60%,rgba(5,5,16,0.92)_100%)]" />
        </div>
    );
};
