import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { SPHERE_LO } from '../receptor/geometry';
import { clamp01, rng } from '../receptor/layout';
import { CC } from './colors';
import { FLOW, SAMPLES, type CardioStateRef } from './flow';
import { CELL_N, HCT_FULL } from './layout';
import { makeCellRaycast, type PickKind } from './pickHelpers';
import { useStructure } from './useStructure';

/*
 * Hemácias: uma única malha instanciada (um draw call) percorrendo o circuito. A densidade de células
 * acesas vem do hematócrito e a velocidade cai com a viscosidade — mais nos vasos pequenos, onde elas
 * se amontoam e passam com dificuldade. O amontoado é consequência, não efeito desenhado à mão: a
 * densidade de equilíbrio é inversamente proporcional à velocidade local.
 *
 * A posição é integrada por quadro (não dá para ser função pura do tempo, porque a velocidade muda
 * com os parâmetros); o arranjo fica num Float32Array pré-alocado, sem alocação por quadro.
 */

interface Cell { a: number; b: number; ph: number; r: number; spin: number }

const buildCells = (): Cell[] => {
    const rand = rng(911);
    return Array.from({ length: CELL_N }, () => {
        // ponto uniforme num disco: as células preenchem a seção, não só o eixo
        const t = rand() * Math.PI * 2;
        const rr = Math.sqrt(rand()) * 0.82;
        return { a: Math.cos(t) * rr, b: Math.sin(t) * rr, ph: rand() * 6.28, r: 0.088 + rand() * 0.028, spin: rand() * 3.14 };
    });
};

/** Distribui as células ao longo do circuito; a densidade de equilíbrio se ajusta sozinha depois. */
const spreadCells = () => Float32Array.from({ length: CELL_N }, (_, i) => (i / CELL_N) * SAMPLES);

const tmpM = new THREE.Matrix4();
const tmpQ = new THREE.Quaternion();
const tmpE = new THREE.Euler();
const tmpP = new THREE.Vector3();
const tmpS = new THREE.Vector3();
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0);
const CELL: { pick: PickKind } = { pick: 'cell' };

interface RedCellsProps { stateRef: CardioStateRef; reduced: boolean }

export const RedCells = ({ stateRef, reduced }: RedCellsProps) => {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const cells = useMemo(() => buildCells(), []);
    /** Posição de cada célula no circuito, em índice de amostra (0 … SAMPLES); criada no 1º quadro. */
    const atRef = useRef<Float32Array | null>(null);
    const { bind, lit } = useStructure('hemacia');
    const get = useThree(s => s.get);
    // acerto por proximidade (ver cellPick): lê fov e altura do canvas na hora do raio
    const raycast = useMemo(() => makeCellRaycast(() => {
        const { camera, size } = get();
        return { fov: camera instanceof THREE.PerspectiveCamera ? camera.fov : 40, height: size.height };
    }), [get]);

    useFrame(({ clock }, delta) => {
        const m = mesh.current;
        if (!m) return;
        const { p, f } = stateRef.current;
        const at = atRef.current ?? (atRef.current = spreadCells());
        const dt = Math.min(delta, 0.05) * (reduced ? 0.45 : 1);
        const t = clock.elapsedTime;
        const n = Math.round(CELL_N * clamp01(p.v.hct / HCT_FULL));
        for (let i = 0; i < CELL_N; i++) {
            const c = cells[i];
            let a = at[i];
            const idx = Math.min(Math.floor(a), SAMPLES - 1);
            // avança em comprimento de arco e converte para índice de amostra
            a += (f.spd[idx] * dt) / Math.max(FLOW[idx].len, 1e-3);
            if (a >= SAMPLES) a -= SAMPLES;
            at[i] = a;
            if (i >= n) {
                m.setMatrixAt(i, HIDDEN);
                continue;
            }
            const i0 = Math.min(Math.floor(a), SAMPLES - 1);
            const i1 = (i0 + 1) % SAMPLES;
            const k = a - i0;
            const s = FLOW[i0];
            const r = f.rad[i0] * 0.82;
            tmpP.set(
                f.ax[i0 * 3] + (f.ax[i1 * 3] - f.ax[i0 * 3]) * k,
                f.ax[i0 * 3 + 1] + (f.ax[i1 * 3 + 1] - f.ax[i0 * 3 + 1]) * k,
                f.ax[i0 * 3 + 2] + (f.ax[i1 * 3 + 2] - f.ax[i0 * 3 + 2]) * k,
            );
            // turbulência depois do estreitamento: o jato se desorganiza
            const sw = f.swl[i0];
            const oa = c.a + (sw > 0 ? Math.sin(t * 7 + c.ph * 3) * sw * 0.7 : 0);
            const ob = c.b + (sw > 0 ? Math.cos(t * 6.2 + c.ph * 2.4) * sw * 0.7 : 0);
            tmpP.addScaledVector(s.n, oa * r).addScaledVector(s.b, ob * r);
            tmpE.set(c.spin + t * 0.5 + c.ph, c.ph * 2 + t * 0.35, c.spin);
            tmpS.set(c.r, c.r * 0.42, c.r);
            m.setMatrixAt(i, tmpM.compose(tmpP, tmpQ.setFromEuler(tmpE), tmpS));
        }
        m.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[SPHERE_LO, undefined, CELL_N]} frustumCulled={false} userData={CELL} raycast={raycast} {...bind}>
            <meshStandardMaterial color={CC.cell} emissive={CC.cellDark} emissiveIntensity={lit ? 1.1 : 0.35} roughness={0.42} metalness={0.05} />
        </instancedMesh>
    );
};
