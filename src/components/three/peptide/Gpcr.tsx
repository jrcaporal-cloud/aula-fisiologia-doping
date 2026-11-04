import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { V, rng } from '../receptor/layout';
import { SPHERE_LO, ellipsoidCloud, type Sphere } from '../receptor/geometry';
import { Cloud, Glow } from '../receptor/primitives';
import { useHover } from '../receptor/useHover';
import type { TimeRef } from '../receptor/types';
import { arrestinPos, helix6Angle, receptorPos, vesicleScale } from './choreo';
import { HELIX_HALF, PW, RING_R, ligandOf, pp, type Side } from './layout';
import { PC, PEPTIDE_LIGANDS } from './ligands';

/*
 * Receptor acoplado à proteína G: sete hélices transmembrana em anel (fita em espiral + núcleo), alças como
 * cadeias de contas recalculadas a partir das pontas das hélices. A hélice 6 gira em torno da ponta de cima
 * e a de baixo se afasta do feixe (ativação). O receptor do lado direito é girado 180° (mesma quiralidade).
 */

const TM6 = 5;
const TM6_ANGLE = (162 * Math.PI) / 180;
const helixAngle = (k: number) => TM6_ANGLE + (k - TM6) * ((2 * Math.PI) / 7);
const TILT = [0.12, -0.1, 0.14, -0.12, 0.1, 0, -0.14];
const radial = (k: number) => V(Math.cos(helixAngle(k)), 0, Math.sin(helixAngle(k)));
const tangent = (k: number) => V(-Math.sin(helixAngle(k)), 0, Math.cos(helixAngle(k)));

/** Fita em espiral (α-hélice esquemática) ao longo do eixo y, de +L a −L. */
const buildCoil = () => {
    const pts: THREE.Vector3[] = [];
    const n = 120;
    for (let i = 0; i <= n; i++) {
        const y = HELIX_HALF - (i / n) * HELIX_HALF * 2;
        const th = (y / 0.54) * Math.PI * 2;
        pts.push(V(Math.cos(th) * 0.24, y, Math.sin(th) * 0.24));
    }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 220, 0.075, 6, false);
};
const COIL_GEO = buildCoil();
const CORE_GEO = new THREE.CylinderGeometry(0.19, 0.19, HELIX_HALF * 2, 12, 1);

const qTmp = new THREE.Quaternion();
const helixQuat = (k: number, a6: number, out: THREE.Quaternion) => {
    out.setFromAxisAngle(tangent(k), TILT[k]);
    if (k === TM6) out.premultiply(qTmp.setFromAxisAngle(tangent(k), a6));
    return out;
};

/** Pontas da hélice k no referencial do receptor (a hélice 6 gira em torno da ponta de cima). */
const ends = (k: number, a6: number, top: THREE.Vector3, bot: THREE.Vector3) => {
    const c = radial(k).multiplyScalar(RING_R);
    helixQuat(k, a6, qTmp);
    if (k === TM6) {
        top.set(0, HELIX_HALF, 0).applyQuaternion(new THREE.Quaternion().setFromAxisAngle(tangent(k), TILT[k])).add(c);
        bot.set(0, -2 * HELIX_HALF, 0).applyQuaternion(qTmp).add(top);
    } else {
        top.set(0, HELIX_HALF, 0).applyQuaternion(qTmp).add(c);
        bot.set(0, -HELIX_HALF, 0).applyQuaternion(qTmp).add(c);
    }
};

/** Contas das alças: N-terminal, 3 alças de fora, 3 de dentro, hélice 8 e C-terminal. */
const loopBeads = (a6: number): THREE.Vector3[] => {
    const tops = Array.from({ length: 7 }, () => new THREE.Vector3());
    const bots = Array.from({ length: 7 }, () => new THREE.Vector3());
    for (let k = 0; k < 7; k++) ends(k, a6, tops[k], bots[k]);
    const out: THREE.Vector3[] = [];
    const arc = (a: THREE.Vector3, b: THREE.Vector3, bulge: number) => {
        const mid = a.clone().lerp(b, 0.5);
        const out2 = V(mid.x, 0, mid.z).normalize().multiplyScalar(0.55);
        mid.add(out2).add(V(0, bulge, 0));
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        const n = Math.max(Math.round(curve.getLength() / 0.3), 3);
        for (let i = 1; i < n; i++) out.push(curve.getPoint(i / n));
    };
    // N-terminal (fora) e C-terminal (dentro, com a hélice 8 deitada na face interna)
    const nTerm = tops[0].clone().add(V(0.4, 1.2, 0.5));
    arc(nTerm, tops[0], 0.2);
    for (let k = 0; k < 6; k++) {
        const outside = k % 2 === 1; // TM1 desce: alça 1→2 é de dentro; 2→3 de fora; …
        if (outside) arc(tops[k], tops[k + 1], 0.75);
        else arc(bots[k], bots[k + 1], -0.75);
    }
    const h8 = bots[6].clone().add(radial(6).multiplyScalar(0.9)).add(V(0, 0.35, 0));
    arc(bots[6], h8, -0.2);
    return out;
};
const LOOP_N = loopBeads(0).length;

interface GpcrProps { s: Side; active: Side; timeRef: TimeRef }

const Receptor = ({ s, active, timeRef }: GpcrProps) => {
    const root = useRef<THREE.Group>(null);
    const tm6 = useRef<THREE.Group>(null);
    const loops = useRef<THREE.InstancedMesh>(null);
    const site = useRef<THREE.Sprite>(null);
    const pocket = useRef<THREE.Sprite>(null);
    const lastA = useRef(-1);
    const info = PEPTIDE_LIGANDS[ligandOf(s)];
    const on = s === active;
    const hover = useHover(info.receptor, 'Receptor acoplado à proteína G: sete hélices atravessam a membrana. O peptídeo encaixa na face de fora; na face de dentro abre-se o sítio da proteína G.');
    const hover6 = useHover('Hélice 6', 'Na ativação, as hélices internas se reorganizam: a hélice 6 se afasta do feixe e abre o sítio da proteína G na face de dentro.');
    const tm6Center = useMemo(() => {
        const top = new THREE.Vector3();
        ends(TM6, 0, top, new THREE.Vector3());
        return top;
    }, []);

    useFrame(() => {
        const T = timeRef.current.t;
        const g = root.current;
        if (!g) return;
        receptorPos(s, active, T, g.position);
        const a6 = helix6Angle(s, active, T);
        if (tm6.current) {
            tm6.current.quaternion.setFromAxisAngle(tangent(TM6), TILT[TM6] + a6);
        }
        if (loops.current && Math.abs(a6 - lastA.current) > 1e-4) {
            lastA.current = a6;
            const m = new THREE.Matrix4();
            const q = new THREE.Quaternion();
            const sc = new THREE.Vector3(0.13, 0.13, 0.13);
            loopBeads(a6).forEach((p, i) => loops.current?.setMatrixAt(i, m.compose(p, q, sc)));
            loops.current.instanceMatrix.needsUpdate = true;
        }
        const open = on ? pp(T, PW.h6) * (1 - pp(T, PW.couple)) : 0;
        if (site.current) (site.current.material as THREE.SpriteMaterial).opacity = open * 0.85;
        const bound = on ? pp(T, PW.dock) * (1 - pp(T, PW.fade)) : 0;
        if (pocket.current) (pocket.current.material as THREE.SpriteMaterial).opacity = bound * 0.5;
    });

    const coreColor = new THREE.Color(info.color).multiplyScalar(0.45).getStyle();
    return (
        <group ref={root} rotation={[0, s > 0 ? Math.PI : 0, 0]}>
            {Array.from({ length: 7 }, (_, k) => k === TM6 ? null : (
                <group key={k} position={radial(k).multiplyScalar(RING_R)} quaternion={helixQuat(k, 0, new THREE.Quaternion())}>
                    <mesh geometry={COIL_GEO}><meshStandardMaterial color={info.color} emissive={info.color} emissiveIntensity={on ? 0.28 : 0.08} roughness={0.38} /></mesh>
                    <mesh geometry={CORE_GEO}><meshStandardMaterial color={coreColor} roughness={0.6} /></mesh>
                </group>
            ))}
            <group position={tm6Center} ref={tm6}>
                <group position={[0, -HELIX_HALF, 0]}>
                    <mesh geometry={COIL_GEO}><meshStandardMaterial color="#F8FAFC" emissive={info.color} emissiveIntensity={0.35} roughness={0.35} /></mesh>
                    <mesh geometry={CORE_GEO}><meshStandardMaterial color={coreColor} roughness={0.6} /></mesh>
                    <mesh {...hover6} scale={[0.5, HELIX_HALF * 2, 0.5]}>
                        <cylinderGeometry args={[1, 1, 1, 8]} />
                        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
                    </mesh>
                </group>
            </group>
            <instancedMesh ref={loops} args={[SPHERE_LO, undefined, LOOP_N]} frustumCulled={false}>
                <meshStandardMaterial color={info.color} emissive={info.color} emissiveIntensity={0.15} roughness={0.5} />
            </instancedMesh>
            <Glow spriteRef={site} color={info.color} size={3.2} opacity={0} position={[0, -HELIX_HALF - 0.3, 0]} />
            <Glow spriteRef={pocket} color={info.color} size={3.4} opacity={0} position={[0, 1.5, 0]} />
            <mesh {...hover} scale={[RING_R + 0.5, HELIX_HALF + 0.4, RING_R + 0.5]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
            </mesh>
        </group>
    );
};

const buildShell = (): Sphere[] => {
    const rand = rng(41);
    const n = 120;
    return Array.from({ length: n }, (_, i) => {
        const y = 1 - (2 * (i + 0.5)) / n;
        const r = Math.sqrt(1 - y * y);
        const th = i * 2.399963;
        return { p: V(Math.cos(th) * r * 1.9, y * 1.9, Math.sin(th) * r * 1.9), r: 0.17, shade: rand() };
    });
};

/** β-arrestina e vesícula de internalização (só no lado ativo, etapa 7). */
const Internalization = ({ s, timeRef }: { s: Side; timeRef: TimeRef }) => {
    const arr = useRef<THREE.Group>(null);
    const ves = useRef<THREE.Group>(null);
    const arrSpheres = useMemo(() => ellipsoidCloud(55, 46, [1.1, 0.55, 0.7], 0.22, 0.34), []);
    const shell = useMemo(() => buildShell(), []);
    const hover = useHover('β-arrestina', 'Liga-se ao receptor ativo e o retira da superfície: o sinal se apaga.');
    const tmp = useMemo(() => new THREE.Vector3(), []);
    useFrame(() => {
        const T = timeRef.current.t;
        if (arr.current) {
            const { scale } = arrestinPos(s, T, arr.current.position);
            arr.current.scale.setScalar(Math.max(scale, 1e-3));
            arr.current.visible = scale > 0.01;
        }
        if (ves.current) {
            const k = vesicleScale(T);
            receptorPos(s, s, T, tmp);
            ves.current.position.set(tmp.x, tmp.y + 1.15, tmp.z);
            ves.current.scale.setScalar(Math.max(k, 1e-3));
            ves.current.visible = k > 0.01;
        }
    });
    return (
        <>
            <group ref={arr} visible={false}>
                <Cloud spheres={arrSpheres} color={PC.arrestin} color2="#64748B" roughness={0.6} />
                <mesh {...hover} scale={[1.3, 0.8, 0.9]}>
                    <sphereGeometry args={[1, 10, 8]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
                </mesh>
            </group>
            <group ref={ves} visible={false}>
                <Cloud spheres={shell} color={PC.heads} color2="#7C93B8" roughness={0.5} lowPoly opacity={0.6} />
            </group>
        </>
    );
};

export const Gpcrs = ({ active, timeRef }: { active: Side; timeRef: TimeRef }) => (
    <>
        <Receptor s={-1} active={active} timeRef={timeRef} />
        <Receptor s={1} active={active} timeRef={timeRef} />
        <Internalization key={active} s={active} timeRef={timeRef} />
    </>
);
