import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { V, phase, rng } from '../receptor/layout';
import { ellipsoidCloud, type Sphere } from '../receptor/geometry';
import { Cloud, Glow } from '../receptor/primitives';
import { useHover } from '../receptor/useHover';
import type { TimeRef } from '../receptor/types';
import { enzymeActivity } from './choreo';
import { CA_CHANNEL, ER_CENTER, ER_CHANNELS, ER_CURVES, ER_SQUASH, ER_TUBE_R, MEM_HALF, PKA_POS, PW, enzymes, erPoint, pp, type Side } from './layout';
import { PC, PEPTIDE_LIGANDS } from './ligands';

/*
 * Alvos da α: fosfolipase C (Gq, presa à face interna) e adenilato ciclase (Gs, atravessa a membrana).
 * Do lado Gq, o retículo endoplasmático (cisterna curva) com canais que o IP3 abre; do lado Gs, a PKA e o
 * canal de cálcio da membrana que ela abre.
 */

const Invisible = () => <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />;
const setOpacity = (s: THREE.Sprite | null, o: number) => { if (s) (s.material as THREE.SpriteMaterial).opacity = o; };

interface SceneProps { active: Side; timeRef: TimeRef }

const Enzyme = ({ s, e, active, timeRef }: SceneProps & { s: Side; e: number }) => {
    const glow = useRef<THREE.Sprite>(null);
    const info = PEPTIDE_LIGANDS[s < 0 ? 'ghrp' : 'ghrh'];
    const blob = useMemo(() => ellipsoidCloud(91 + e * 7 + (s > 0 ? 50 : 0), s < 0 ? 64 : 58, s < 0 ? [1.15, 0.72, 0.9] : [1.0, 0.7, 0.95], 0.2, 0.32), [s, e]);
    const hover = useHover(info.enzyme, s < 0
        ? 'Enzima-alvo da Gαq, na face interna da membrana. Ativada, gera IP3.'
        : 'Enzima-alvo da Gαs; atravessa a membrana. Ativada, gera AMPc.');
    const p = enzymes(s)[e];
    useFrame(() => setOpacity(glow.current, enzymeActivity(s, active, e, timeRef.current.t) * 0.8));
    const color = s < 0 ? '#38BDF8' : '#F59E0B';
    return (
        <group position={p}>
            <Cloud spheres={blob} color={color} color2="#334155" roughness={0.55} lowPoly={e > 0} />
            {s > 0 && Array.from({ length: 6 }, (_, k) => {
                const a = (k / 6) * Math.PI * 2;
                return (
                    <mesh key={k} position={[Math.cos(a) * 0.5, 2.15, Math.sin(a) * 0.5]}>
                        <cylinderGeometry args={[0.16, 0.16, 2.6, 8]} />
                        <meshStandardMaterial color={color} roughness={0.5} />
                    </mesh>
                );
            })}
            <Glow spriteRef={glow} color={info.messengerColor} size={3.6} opacity={0} />
            <mesh {...hover} scale={[1.25, 0.9, 1.0]}><sphereGeometry args={[1, 10, 8]} /><Invisible /></mesh>
        </group>
    );
};

// ------------------------------------------------------------------ retículo endoplasmático

const buildStores = (): Sphere[] => {
    const rand = rng(17);
    return Array.from({ length: 46 }, (_, i) => {
        const p = erPoint(i % 2, 0.08 + rand() * 0.84, 0, new THREE.Vector3());
        p.add(V((rand() - 0.5) * 0.5, (rand() - 0.5) * 0.2, (rand() - 0.5) * 0.5));
        return { p, r: 0.07, shade: rand() };
    });
};

const ER = ({ active, timeRef }: SceneProps) => {
    const glows = useRef<(THREE.Sprite | null)[]>([]);
    const geos = useMemo(() => ER_CURVES.map((c, i) => new THREE.TubeGeometry(c, 64, ER_TUBE_R[i], 14, false)), []);
    const stores = useMemo(() => buildStores(), []);
    const hover = useHover('Retículo endoplasmático', 'Reserva de cálcio da célula. O IP3 abre seus canais e o cálcio inunda o citosol.');
    const hoverCh = useHover('Canal de cálcio do retículo', 'Abre quando o IP3 se liga a ele e deixa o cálcio guardado sair para o citosol.');
    useFrame(() => {
        const T = timeRef.current.t;
        const open = active < 0 ? phase(T, PW.ca[0] - 0.06, PW.ca[0] + 0.12) * (1 - pp(T, PW.fade)) : 0;
        glows.current.forEach(g => setOpacity(g, open * 0.9));
    });
    return (
        <group>
            {geos.map((g, i) => (
                <mesh key={i} geometry={g} scale={[1, ER_SQUASH, 1]} position={ER_CENTER}>
                    <meshStandardMaterial color={PC.er} emissive="#4338CA" emissiveIntensity={0.35} roughness={0.45} transparent opacity={0.55} depthWrite={false} side={THREE.DoubleSide} />
                </mesh>
            ))}
            <Cloud spheres={stores} color={PC.calcium} emissive="#e2e8f0" emissiveIntensity={0.8} lowPoly />
            {ER_CHANNELS.map((c, i) => (
                <group key={i} position={c}>
                    <mesh {...hoverCh}><cylinderGeometry args={[0.22, 0.28, 0.5, 10]} /><meshStandardMaterial color="#C7D2FE" emissive={PC.er} emissiveIntensity={0.5} roughness={0.4} /></mesh>
                    <Glow spriteRef={el => { glows.current[i] = el; }} color={PC.calcium} size={1.8} opacity={0} />
                </group>
            ))}
            <mesh {...hover} position={[ER_CENTER.x, ER_CENTER.y + 0.4, ER_CENTER.z]} scale={[4.6, 1.6, 2.2]}><sphereGeometry args={[1, 12, 8]} /><Invisible /></mesh>
        </group>
    );
};

// ------------------------------------------------------------------ PKA e canal de Ca²⁺ (lado Gs)

const Pka = ({ active, timeRef }: SceneProps) => {
    const glows = useRef<(THREE.Sprite | null)[]>([]);
    const blobs = useMemo(() => PKA_POS.map((_, i) => ellipsoidCloud(121 + i * 9, 40, [0.75, 0.55, 0.6], 0.18, 0.28)), []);
    const hover = useHover('Proteína quinase A (PKA)', 'Ativada pelo AMPc: abre canais de cálcio e estimula a síntese de GH.');
    useFrame(() => {
        const T = timeRef.current.t;
        const on = active > 0 ? phase(T, 3.45, 3.75) * (1 - pp(T, PW.fade)) : 0;
        glows.current.forEach(g => setOpacity(g, on * 0.75));
    });
    return (
        <>
            {PKA_POS.map((p, i) => (
                <group key={i} position={p}>
                    <Cloud spheres={blobs[i]} color={PC.pka} color2="#4C1D95" roughness={0.55} />
                    <Glow spriteRef={el => { glows.current[i] = el; }} color={PC.pka} size={2.8} opacity={0} />
                    <mesh {...hover} scale={[0.95, 0.75, 0.8]}><sphereGeometry args={[1, 10, 8]} /><Invisible /></mesh>
                </group>
            ))}
        </>
    );
};

const CaChannel = ({ active, timeRef }: SceneProps) => {
    const glow = useRef<THREE.Sprite>(null);
    const hover = useHover('Canal de cálcio da membrana', 'A PKA abre este canal e o cálcio de fora entra no citosol.');
    useFrame(() => {
        const T = timeRef.current.t;
        setOpacity(glow.current, active > 0 ? phase(T, 3.55, 3.75) * (1 - pp(T, PW.fade)) * 0.9 : 0);
    });
    return (
        <group position={CA_CHANNEL}>
            {Array.from({ length: 4 }, (_, k) => {
                const a = (k / 4) * Math.PI * 2 + 0.4;
                return (
                    <mesh key={k} position={[Math.cos(a) * 0.38, 0, Math.sin(a) * 0.38]}>
                        <cylinderGeometry args={[0.2, 0.2, MEM_HALF * 2 + 0.7, 10]} />
                        <meshStandardMaterial color={PC.channel} roughness={0.45} emissive={PC.channel} emissiveIntensity={0.15} />
                    </mesh>
                );
            })}
            <Glow spriteRef={glow} color={PC.calcium} size={2.2} opacity={0} />
            <mesh {...hover} scale={[0.8, MEM_HALF + 0.4, 0.8]}><sphereGeometry args={[1, 10, 8]} /><Invisible /></mesh>
        </group>
    );
};

export const Effectors = ({ active, timeRef }: SceneProps) => (
    <>
        {([-1, 1] as const).flatMap(s => [0, 1, 2].map(e => <Enzyme key={`${s}-${e}`} s={s} e={e} active={active} timeRef={timeRef} />))}
        <ER active={active} timeRef={timeRef} />
        <Pka active={active} timeRef={timeRef} />
        <CaChannel active={active} timeRef={timeRef} />
    </>
);
