import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ellipsoidCloud } from '../receptor/geometry';
import { Cloud, Glow } from '../receptor/primitives';
import { useHover } from '../receptor/useHover';
import type { TimeRef } from '../receptor/types';
import { alphaPos, extraAlphaPos, extraGtp, nucleotide, trimerFrame, waveState } from './choreo';
import { ALPHA_LOCAL, RECEPTOR_X, betaLocal, extraTrimers, gammaLocal, ligandOf, type Side } from './layout';
import { PC, PEPTIDE_LIGANDS } from './ligands';

/*
 * Proteína G heterotrimérica presa à face interna: α (com o nucleotídeo), β e γ. No lado ativo, a α troca
 * GDP (esfera escura) por GTP (esfera clara), solta-se do par βγ e desliza até a enzima-alvo.
 */

const ALPHA_COLOR: Record<Side, string> = { [-1]: '#67E8F9', [1]: '#FCD34D' } as Record<Side, string>;
const NUC_LOCAL = new THREE.Vector3(0.05, -0.3, 0.82);
const NUC_AWAY = new THREE.Vector3(0.2, -1, 0.7).normalize();
const cGdp = new THREE.Color(PC.gdp);
const cGtp = new THREE.Color(PC.gtp);

interface Shapes { a: ReturnType<typeof ellipsoidCloud>; b: ReturnType<typeof ellipsoidCloud>; g: ReturnType<typeof ellipsoidCloud> }
const useShapes = (seed: number): Shapes => useMemo(() => ({
    a: ellipsoidCloud(seed, 74, [0.98, 0.72, 0.82], 0.2, 0.32),
    b: ellipsoidCloud(seed + 3, 58, [0.86, 0.55, 0.86], 0.2, 0.3),
    g: ellipsoidCloud(seed + 5, 18, [0.6, 0.24, 0.3], 0.14, 0.22),
}), [seed]);

const Invisible = () => <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />;

interface AlphaProps { color: string; shapes: Shapes; nucRef: React.Ref<THREE.Mesh>; matRef: React.Ref<THREE.MeshStandardMaterial>; glowRef?: React.Ref<THREE.Sprite> }
const AlphaBody = ({ color, shapes, nucRef, matRef, glowRef }: AlphaProps) => (
    <>
        <Cloud spheres={shapes.a} color={color} color2="#475569" roughness={0.5} emissive={color} emissiveIntensity={0.08} />
        <mesh ref={nucRef} position={NUC_LOCAL}>
            <sphereGeometry args={[0.26, 16, 12]} />
            <meshStandardMaterial ref={matRef} color={PC.gdp} roughness={0.3} emissive="#ffffff" emissiveIntensity={0} />
        </mesh>
        {glowRef && <Glow spriteRef={glowRef} color={PC.gtp} size={1.6} opacity={0} position={[NUC_LOCAL.x, NUC_LOCAL.y, NUC_LOCAL.z]} />}
    </>
);

const paintNucleotide = (mesh: THREE.Mesh | null, mat: THREE.MeshStandardMaterial | null, gtp: number, offset: number, scale: number) => {
    if (mesh) {
        mesh.position.copy(NUC_LOCAL).addScaledVector(NUC_AWAY, offset);
        mesh.scale.setScalar(Math.max(scale, 1e-3));
        mesh.visible = scale > 0.01;
    }
    if (mat) {
        mat.color.copy(cGdp).lerp(cGtp, gtp);
        mat.emissiveIntensity = gtp * 0.9;
    }
};

interface TrimerProps { s: Side; active: Side; timeRef: TimeRef }

const MainTrimer = ({ s, active, timeRef }: TrimerProps) => {
    const bg = useRef<THREE.Group>(null);
    const al = useRef<THREE.Group>(null);
    const nuc = useRef<THREE.Mesh>(null);
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    const glow = useRef<THREE.Sprite>(null);
    const shapes = useShapes(s < 0 ? 61 : 67);
    const info = PEPTIDE_LIGANDS[ligandOf(s)];
    const hoverA = useHover(`Subunidade α (Gα${info.gProtein.slice(1)})`, 'Troca GDP por GTP quando o receptor ativo a toca, separa-se do par βγ e corre pela face interna da membrana até a enzima-alvo.');
    const hoverBG = useHover(`Par βγ (proteína ${info.gProtein})`, 'Subunidades β e γ da proteína G, presas à face interna da membrana. A α se separa delas ao pegar GTP.');
    useFrame(() => {
        const T = timeRef.current.t;
        if (bg.current) trimerFrame(s, active, T, bg.current.position);
        if (al.current) alphaPos(s, active, T, al.current.position);
        const n = nucleotide(s, active, T);
        paintNucleotide(nuc.current, mat.current, n.gtp, n.offset, n.scale);
        if (glow.current) (glow.current.material as THREE.SpriteMaterial).opacity = n.gtp * 0.7;
    });
    const b = betaLocal(s);
    const g = gammaLocal(s);
    return (
        <>
            <group ref={bg}>
                <group position={b}><Cloud spheres={shapes.b} color={PC.beta} color2="#6D28D9" roughness={0.6} /></group>
                <group position={g}><Cloud spheres={shapes.g} color={PC.gamma} color2="#8B5CF6" roughness={0.6} /></group>
                <mesh {...hoverBG} position={b.clone().lerp(g, 0.3)} scale={[1.2, 0.9, 1.0]}><sphereGeometry args={[1, 10, 8]} /><Invisible /></mesh>
            </group>
            <group ref={al}>
                <AlphaBody color={ALPHA_COLOR[s]} shapes={shapes} nucRef={nuc} matRef={mat} glowRef={glow} />
                <mesh {...hoverA} scale={[1.1, 0.85, 0.95]}><sphereGeometry args={[1, 10, 8]} /><Invisible /></mesh>
            </group>
        </>
    );
};

const ExtraTrimer = ({ s, active, i, timeRef }: TrimerProps & { i: number }) => {
    const al = useRef<THREE.Group>(null);
    const nuc = useRef<THREE.Mesh>(null);
    const mat = useRef<THREE.MeshStandardMaterial>(null);
    const shapes = useShapes((s < 0 ? 71 : 79) + i * 4);
    const frame = extraTrimers(s)[i];
    useFrame(() => {
        const T = timeRef.current.t;
        if (al.current) extraAlphaPos(s, active, i, T, al.current.position);
        paintNucleotide(nuc.current, mat.current, extraGtp(s, active, i, T), 0, 1);
    });
    const b = betaLocal(s);
    const g = gammaLocal(s);
    return (
        <>
            <group position={frame}>
                <group position={b}><Cloud spheres={shapes.b} color={PC.beta} color2="#6D28D9" roughness={0.6} lowPoly /></group>
                <group position={g}><Cloud spheres={shapes.g} color={PC.gamma} color2="#8B5CF6" roughness={0.6} lowPoly /></group>
            </group>
            <group ref={al} position={frame.clone().add(ALPHA_LOCAL)}>
                <AlphaBody color={ALPHA_COLOR[s]} shapes={shapes} nucRef={nuc} matRef={mat} />
            </group>
        </>
    );
};

/** Onda de ativação do receptor (etapa 5): o mesmo receptor ativa várias proteínas G. */
const Wave = ({ s, active, timeRef }: TrimerProps) => {
    const ref = useRef<THREE.Mesh>(null);
    const mat = useRef<THREE.MeshBasicMaterial>(null);
    useFrame(() => {
        const { r, o } = waveState(s, active, timeRef.current.t);
        if (ref.current) {
            ref.current.scale.setScalar(0.6 + r * 4.4);
            ref.current.visible = o > 0.01;
        }
        if (mat.current) mat.current.opacity = o * 0.7;
    });
    return (
        <mesh ref={ref} position={[s * RECEPTOR_X, -2.35, 0]} rotation={[Math.PI / 2, 0, 0]} visible={false}>
            <torusGeometry args={[1, 0.05, 8, 64]} />
            <meshBasicMaterial ref={mat} color={PEPTIDE_LIGANDS[ligandOf(s)].color} transparent opacity={0} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
    );
};

export const GProteins = ({ active, timeRef }: { active: Side; timeRef: TimeRef }) => (
    <>
        {([-1, 1] as const).map(s => (
            <group key={s}>
                <MainTrimer s={s} active={active} timeRef={timeRef} />
                <ExtraTrimer s={s} active={active} i={0} timeRef={timeRef} />
                <ExtraTrimer s={s} active={active} i={1} timeRef={timeRef} />
                <Wave s={s} active={active} timeRef={timeRef} />
            </group>
        ))}
    </>
);
