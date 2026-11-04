import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { smooth, smoother } from '../receptor/layout';
import type { TimeRef } from '../receptor/types';
import type { CameraPath } from '../peptide/camera';
import { flightPath, poseOfPin, stepPose } from './cameraFlight';
import type { Pin } from './selection';

/*
 * Quem manda na câmera. Três "pilotos automáticos", em ordem de prioridade:
 *  1. voo (fixar uma estrutura ou voltar à pose da etapa), a partir de onde a câmera está;
 *  2. transição de etapa: segue a spline das poses-chave no mesmo T da coreografia;
 *  3. varredura lenta: depois de ~6 s sem toque, a câmera balança ±29° em torno do alvo.
 * O primeiro toque do usuário no canvas desliga os dois primeiros; o relógio de inatividade recomeça
 * quando ele solta. A varredura vai e volta (não dá volta completa) porque o corte do ventrículo e
 * os rótulos só fazem sentido de frente.
 */

const IDLE_MS = 6000;
const SWEEP_AMP = 0.5;
const SWEEP_PERIOD = 38;
const SWEEP_RAMP = 2.5;
const Y_AXIS = new THREE.Vector3(0, 1, 0);

interface TweenState { active: boolean; u: number; offP: THREE.Vector3; offT: THREE.Vector3 }
interface FlightState { active: boolean; u: number; path: CameraPath | null; anim: gsap.core.Tween | null }
interface Rig {
    tween: TweenState;
    flight: FlightState;
    idleAt: number;
    sweepT: number;
    down: boolean;
}

const makeRig = (): Rig => ({
    tween: { active: false, u: 1, offP: new THREE.Vector3(), offT: new THREE.Vector3() },
    flight: { active: false, u: 0, path: null, anim: null },
    idleAt: performance.now(),
    sweepT: 0,
    down: false,
});

export interface CameraDirectorProps {
    step: number;
    reduced: boolean;
    /** Estrutura fixada (câmera em close-up) ou null (câmera na pose da etapa). */
    pin: Pin | null;
    /** Muda a cada clique em "Recentrar": devolve a câmera à pose da etapa. */
    recenterKey: number;
    onSettled: (step: number) => void;
    timeRef: TimeRef;
    path: CameraPath;
}

export const CameraDirector = ({ step, reduced, pin, recenterKey, onSettled, timeRef, path }: CameraDirectorProps) => {
    const camera = useThree(s => s.camera);
    const gl = useThree(s => s.gl);
    const controls = useThree(s => s.controls) as OrbitControlsImpl | null;
    const rig = useRef<Rig>(makeRig());
    const stepRef = useRef(step);
    const prev = useRef({ pin, key: recenterKey });
    const tp = useMemo(() => new THREE.Vector3(), []);
    const tt = useMemo(() => new THREE.Vector3(), []);

    useEffect(() => { stepRef.current = step; }, [step]);

    // Toque do usuário: assume o comando, e a varredura só volta depois de ficar parado.
    useEffect(() => {
        const el = gl.domElement;
        const r = rig.current;
        const touch = () => { r.idleAt = performance.now(); r.sweepT = 0; };
        const onDown = () => {
            r.down = true;
            r.flight.active = false;
            r.tween.active = false;
            touch();
        };
        const onUp = () => { r.down = false; touch(); };
        el.addEventListener('pointerdown', onDown);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointercancel', onUp);
        el.addEventListener('wheel', touch, { passive: true });
        return () => {
            el.removeEventListener('pointerdown', onDown);
            el.removeEventListener('pointerup', onUp);
            el.removeEventListener('pointercancel', onUp);
            el.removeEventListener('wheel', touch);
        };
    }, [gl]);

    // Transição de etapa: T anima de onde estava até a etapa nova; a câmera segue a trilha com um
    // deslocamento que se desfaz, para sair de onde o usuário a deixou sem pulo.
    useEffect(() => {
        if (!controls) return;
        const r = rig.current;
        const time = timeRef.current;
        const tw = r.tween;
        const from = time.t;
        const d = step - from;
        tw.offP.copy(camera.position).sub(path.pos(from, tp));
        tw.offT.copy(controls.target).sub(path.tgt(from, tt));
        tw.active = true;
        tw.u = 0;
        r.flight.active = false;
        r.idleAt = performance.now();
        const dist = Math.abs(d);
        const duration = reduced ? 0.35 : d > 0
            ? (dist <= 1.01 ? 3.6 : Math.min(2 + dist * 0.8, 6))
            : Math.min(1.2 + dist * 0.35, 3);
        const anim = gsap.to(time, {
            t: step,
            duration: Math.max(duration, 0.05),
            ease: 'power1.inOut',
            onUpdate: () => { tw.u = anim.progress(); },
            onComplete: () => { tw.active = false; onSettled(step); },
        });
        return () => { anim.kill(); };
    }, [step, controls, camera, path, reduced, onSettled, timeRef, tp, tt]);

    // Voo: fixar (close-up), soltar ou recentrar (pose da etapa). Só roda quando pin/recentrar mudam.
    useEffect(() => {
        if (!controls) return;
        const last = prev.current;
        if (last.pin === pin && last.key === recenterKey) return;
        prev.current = { pin, key: recenterKey };
        const r = rig.current;
        // soltar por troca de etapa: a transição de etapa já leva a câmera à pose nova
        if (!pin && r.tween.active) return;
        const from = {
            pos: [camera.position.x, camera.position.y, camera.position.z] as const,
            tgt: [controls.target.x, controls.target.y, controls.target.z] as const,
        };
        const f = r.flight;
        f.path = flightPath(from, pin ? poseOfPin(pin) : stepPose(stepRef.current));
        f.u = 0;
        f.active = true;
        r.tween.active = false;
        f.anim?.kill();
        f.anim = gsap.to(f, {
            u: 1,
            duration: reduced ? 0.3 : 1.15,
            ease: 'power2.inOut',
            onComplete: () => { f.active = false; r.idleAt = performance.now(); },
        });
        return () => { f.anim?.kill(); f.active = false; };
    }, [pin, recenterKey, controls, camera, reduced]);

    useFrame((_, delta) => {
        if (!controls) return;
        const r = rig.current;
        const now = performance.now();
        const f = r.flight;
        if (f.active && f.path) {
            f.path.pos(f.u, tp);
            f.path.tgt(f.u, tt);
            camera.position.copy(tp);
            controls.target.copy(tt);
            controls.update();
            r.idleAt = now;
            return;
        }
        const tw = r.tween;
        if (tw.active) {
            const T = timeRef.current.t;
            const fade = 1 - smoother(Math.min(tw.u * 1.25, 1));
            path.pos(T, tp).addScaledVector(tw.offP, fade);
            path.tgt(T, tt).addScaledVector(tw.offT, fade);
            camera.position.copy(tp);
            controls.target.copy(tt);
            controls.update();
            r.idleAt = now;
            return;
        }
        if (reduced || r.down || now - r.idleAt < IDLE_MS) {
            r.sweepT = 0;
            return;
        }
        // varredura: velocidade angular senoidal (volta ao ponto de partida), com rampa de entrada
        const dt = Math.min(delta, 0.05);
        r.sweepT += dt;
        const w = (Math.PI * 2) / SWEEP_PERIOD;
        const ramp = smooth(Math.min(r.sweepT / SWEEP_RAMP, 1));
        const dTheta = SWEEP_AMP * w * Math.cos(w * r.sweepT) * ramp * dt;
        camera.position.sub(controls.target).applyAxisAngle(Y_AXIS, dTheta).add(controls.target);
        controls.update();
    });

    return null;
};
