import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import gsap from 'gsap';
import * as THREE from 'three';
import { noRaycast } from './pickHelpers';
import { BASE_Y, VENT_X } from './layout';
import { cardioParams, emptyParams } from './params';

/*
 * "Sobrepor o treinado": o coração do atleta treinado (etapa 1, CARDIO_VITALS.uso[1]) como fantasma
 * por cima do estado atual — duas cascas translúcidas só com o contorno aceso, uma para a cavidade
 * e outra para o epicárdio, em diástole e paradas. A parede do treinado é a faixa entre as duas;
 * a hipertrofia concêntrica aparece como a cavidade real (vermelha) encolhida dentro do contorno
 * ciano, enquanto o epicárdio quase não se move. Desenhado sem teste de profundidade (por cima de
 * tudo) e sem acerto de ponteiro.
 */

const CYAN = '#22D3EE';

/** Opacidade global do fantasma (0…1), animada pelo gsap; compartilhada pelas duas cascas e pelo chip. */
const K = { value: 0 };

/** Geometria do treinado, uma vez: é o ponto de partida da ficha, não depende de T nem da fase. */
const TRAINED = cardioParams(1, 0, emptyParams());

const VERT = `varying vec3 vN; varying vec3 vV;
void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
}`;
const FRAG = `uniform vec3 uColor; uniform float uK; uniform float uFill; uniform float uRim;
varying vec3 vN; varying vec3 vV;
void main() {
    float f = 1.0 - abs(dot(normalize(vN), normalize(vV)));
    gl_FragColor = vec4(uColor, (uFill + uRim * pow(f, 3.2)) * uK);
}`;

const makeUniforms = (fill: number, rim: number) => ({
    uColor: { value: new THREE.Color(CYAN) },
    uK: K,
    uFill: { value: fill },
    uRim: { value: rim },
});

/** Elipsoide cortado no plano das valvas (o ventrículo só existe abaixo dele). */
const ellipsoid = (h: number, yc: number): THREE.SphereGeometry => {
    const cut = Math.acos(Math.max(Math.min((BASE_Y - yc) / h, 1), -1));
    return new THREE.SphereGeometry(1, 56, 36, 0, Math.PI * 2, cut, Math.PI - cut);
};

interface ShellProps { r: number; h: number; fill: number; rim: number }

const Shell = ({ r, h, fill, rim }: ShellProps) => {
    const geo = useMemo(() => ellipsoid(h, TRAINED.yc), [h]);
    const uniforms = useMemo(() => makeUniforms(fill, rim), [fill, rim]);
    return (
        <mesh geometry={geo} position={[VENT_X, TRAINED.yc, 0]} scale={[r, h, r]} renderOrder={20} raycast={noRaycast}>
            <shaderMaterial
                uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG}
                transparent depthWrite={false} depthTest={false} side={THREE.DoubleSide}
            />
        </mesh>
    );
};

/** Etiqueta no 3D, na borda esquerda inferior do contorno da cavidade (nasce invisível; o quadro a acende). */
const Chip = ({ el }: { el: RefObject<HTMLDivElement | null> }) => {
    const at = useMemo(() => new THREE.Vector3(VENT_X - TRAINED.rCav * 0.72, TRAINED.yc - TRAINED.hCav * 0.7, 0.4), []);
    return (
        <group position={at}>
            <Html zIndexRange={[41, 11]} style={{ pointerEvents: 'none' }}>
                <div ref={el} style={{ position: 'absolute', left: 0, top: 0, opacity: 0, visibility: 'hidden' }}>
                    <svg width={1} height={1} style={{ position: 'absolute', overflow: 'visible', left: 0, top: 0 }}>
                        <line x1={0} y1={0} x2={-30} y2={46} stroke={CYAN} strokeWidth={1.6} strokeDasharray="4 3" />
                        <circle cx={0} cy={0} r={4} fill={CYAN} />
                    </svg>
                    <div
                        className="absolute rounded-lg px-3 py-1.5 font-body text-[15px] font-semibold leading-tight text-right text-cyan-100"
                        style={{
                            width: 118, left: -34, top: 46, transform: 'translate(-100%, -50%)',
                            background: 'rgba(5,5,16,0.86)', border: `1px solid ${CYAN}66`, borderRight: `3px solid ${CYAN}`,
                            boxShadow: `0 6px 24px rgba(0,0,0,0.55), 0 0 18px ${CYAN}22`,
                        }}
                    >
                        cavidade do treinado
                    </div>
                </div>
            </Html>
        </group>
    );
};

export const GhostHeart = ({ overlay, reduced }: { overlay: boolean; reduced: boolean }) => {
    const group = useRef<THREE.Group>(null);
    const chip = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const anim = gsap.to(K, { value: overlay ? 1 : 0, duration: reduced ? 0.15 : 0.7, ease: 'power2.inOut' });
        return () => { anim.kill(); };
    }, [overlay, reduced]);

    useFrame(() => {
        const on = K.value > 0.004;
        if (group.current) group.current.visible = on;
        const el = chip.current;
        if (!el) return;
        el.style.visibility = on ? 'visible' : 'hidden';
        el.style.opacity = on ? String(K.value) : '0';
    });

    return (
        <>
            <group ref={group} visible={false}>
                <Shell r={TRAINED.rCav} h={TRAINED.hCav} fill={0.06} rim={0.75} />
                <Shell r={TRAINED.rOut} h={TRAINED.hOut} fill={0.02} rim={0.4} />
            </group>
            <Chip el={chip} />
        </>
    );
};
