import * as THREE from 'three';
import { beforeEach, describe, expect, it } from 'vitest';
import { CARDIO_VITALS } from '../../../data/cardioSteps';
import { COLLATERALS, installedAt, regressedFraction } from './collaterals';
import { flightPath, midPose, poseOfPin, stepPose } from './cameraFlight';
import { pinOrRelease } from './pickGesture';
import { cellsFirst } from './pickHelpers';
import { SYS } from './params';
import { phaseAgo, pressureMmHg, rawPressure } from './pressureWave';
import { armPin, useSelection } from './selection';
import { STRUCTURES, type StructureId } from './structures';

const sample = (rig: number, n = 400): number[] => Array.from({ length: n }, (_, i) => rawPressure(i / n, rig));

describe('onda de pressão arterial', () => {
    it('sobe na sístole e volta ao mínimo no fim da diástole', () => {
        for (const rig of [0, 0.5, 1]) {
            const v = sample(rig);
            const peak = v.indexOf(Math.max(...v)) / v.length;
            expect(peak).toBeLessThan(SYS);
            expect(v[v.length - 1]).toBeLessThan(0.02);
            expect(Math.min(...v)).toBeGreaterThan(-0.12);
        }
    });

    it('tem incisura dicrótica com aorta complacente e quase a perde com aorta rígida', () => {
        // depth da incisura: queda local logo após o fechamento da valva
        const notch = (rig: number) => {
            const a = rawPressure(SYS - 0.005, rig);
            const b = rawPressure(SYS + 0.012, rig);
            return a - b;
        };
        expect(notch(0)).toBeGreaterThan(notch(1));
        expect(notch(0)).toBeGreaterThan(0.05);
    });

    it('a rigidez sustenta o pico sistólico tardio e acelera a queda diastólica', () => {
        const lateSystole = (rig: number) => rawPressure(SYS * 0.55, rig);
        const earlyDiastole = (rig: number) => rawPressure(SYS + (1 - SYS) * 0.4, rig) / rawPressure(SYS + 0.01, rig);
        expect(lateSystole(1)).toBeGreaterThan(lateSystole(0));
        expect(earlyDiastole(1)).toBeLessThan(earlyDiastole(0));
    });

    it('phaseAgo volta no tempo sem sair de [0, 1)', () => {
        expect(phaseAgo(0.1, 1, 0.25)).toBeCloseTo(0.85, 6);
        expect(phaseAgo(0.9, 1, 0)).toBeCloseTo(0.9, 6);
        for (const c of [0, 0.3, 0.99]) for (const ago of [0, 0.7, 2.4]) {
            const p = phaseAgo(c, 0.95, ago);
            expect(p).toBeGreaterThanOrEqual(0);
            expect(p).toBeLessThan(1);
        }
    });

    it('converte o formato normalizado nas faixas diastólica e sistólica da ficha', () => {
        expect(pressureMmHg(0, 74, 118)).toBe(74);
        expect(pressureMmHg(1, 74, 118)).toBe(118);
        expect(pressureMmHg(0.5, 80, 140)).toBe(110);
    });
});

describe('soma dos colaterais', () => {
    const byId = Object.fromEntries(COLLATERALS.map(c => [c.id, c]));

    it('pressão, viscosidade e hipertrofia regridem; relaxamento e placa persistem', () => {
        expect(byId.pressao.status).toBe('regride');
        expect(byId.viscosidade.status).toBe('regride');
        expect(byId.hipertrofia.status).toBe('regride');
        expect(byId.relaxamento.status).toBe('persiste');
        expect(byId.placa.status).toBe('persiste');
    });

    it('entram na soma na ordem das etapas', () => {
        expect(installedAt(0)).toBe(0);
        expect(installedAt(1)).toBe(0);
        expect(installedAt(2)).toBe(1);
        expect(installedAt(6)).toBe(5);
        expect(installedAt(7)).toBe(5);
    });

    it('fração que volta: 0 sem desvio, 1 quando volta tudo', () => {
        const base = CARDIO_VITALS.uso[1];
        const def = { read: (v: typeof base) => v.paSist, worse: 1 as const };
        expect(regressedFraction(def, base, base, base)).toBe(0);
        expect(regressedFraction(def, base, { ...base, paSist: 140 }, base)).toBe(1);
        expect(regressedFraction(def, base, { ...base, paSist: 140 }, { ...base, paSist: 140 })).toBe(0);
    });
});

describe('fixar por clique', () => {
    beforeEach(() => {
        useSelection.getState().reset();
        pinOrRelease(true, false);
    });

    it('sobe sem arrastar: fixa a estrutura armada na descida', () => {
        armPin('aorta', [1, 2, 3]);
        pinOrRelease(false, false);
        expect(useSelection.getState().pin).toEqual({ id: 'aorta', point: [1, 2, 3] });
    });

    it('arrasto da câmera nunca fixa', () => {
        armPin('aorta', [1, 2, 3]);
        pinOrRelease(false, true);
        expect(useSelection.getState().pin).toBeNull();
    });

    it('clique no vazio solta o que estava fixado', () => {
        useSelection.getState().pinStructure('placa', null);
        pinOrRelease(false, false);
        expect(useSelection.getState().pin).toBeNull();
    });

    it('arrasto no vazio não solta a fixação', () => {
        useSelection.getState().pinStructure('placa', null);
        pinOrRelease(false, true);
        expect(useSelection.getState().pin?.id).toBe('placa');
    });

    it('armação velha não vaza para o gesto seguinte', () => {
        armPin('veia', null);
        pinOrRelease(true, false);
        pinOrRelease(false, false);
        expect(useSelection.getState().pin).toBeNull();
    });
});

describe('câmera', () => {
    const ids = Object.keys(STRUCTURES) as StructureId[];

    it('todo close-up fica na frente de toda a geometria (z máx. ≈ 3,4) e a pelo menos minDistance do alvo', () => {
        for (const id of ids) {
            const { pos, tgt } = STRUCTURES[id].pose;
            expect(pos[2], id).toBeGreaterThan(4);
            expect(Math.hypot(pos[0] - tgt[0], pos[1] - tgt[1], pos[2] - tgt[2]), id).toBeGreaterThanOrEqual(6);
        }
    });

    it('a hemácia mira o ponto do clique, sem entrar na cena', () => {
        const pose = poseOfPin({ id: 'hemacia', point: [9, 1, -3.5] });
        expect(pose.tgt).toEqual([9, 1, -3.5]);
        expect(pose.pos[2]).toBeGreaterThanOrEqual(8);
        expect(poseOfPin({ id: 'hemacia', point: null })).toEqual(STRUCTURES.hemacia.pose);
        expect(poseOfPin({ id: 'aorta', point: [0, 0, 0] })).toEqual(STRUCTURES.aorta.pose);
    });

    it('o voo parte de onde a câmera está e chega ao destino', () => {
        const from = { pos: [3, 2, 40] as const, tgt: [0, 0, 0] as const };
        const to = stepPose(2);
        const path = flightPath(from, to);
        const p = new THREE.Vector3();
        const t = new THREE.Vector3();
        path.pos(0, p); path.tgt(0, t);
        expect(p.toArray()).toEqual([3, 2, 40]);
        expect(t.toArray()).toEqual([0, 0, 0]);
        path.pos(1, p); path.tgt(1, t);
        expect(p.distanceTo(new THREE.Vector3(...to.pos))).toBeLessThan(1e-6);
        expect(t.distanceTo(new THREE.Vector3(...to.tgt))).toBeLessThan(1e-6);
    });

    it('o ponto intermediário abre um arco para fora do alvo', () => {
        const from = { pos: [0, 0, 30] as const, tgt: [0, 0, 0] as const };
        const to = { pos: [20, 0, 30] as const, tgt: [10, 0, 0] as const };
        const mid = midPose(from, to);
        expect(Math.hypot(mid.pos[0] - mid.tgt[0], mid.pos[2] - mid.tgt[2])).toBeGreaterThan(Math.hypot(10 - 5, 30));
    });
});

describe('ordem de acerto das hemácias', () => {
    const hit = (pick: 'cell' | 'solid' | undefined, distance: number): THREE.Intersection => {
        const object = new THREE.Object3D();
        if (pick) object.userData = { pick };
        return { distance, point: new THREE.Vector3(), object };
    };

    it('a hemácia passa à frente da parede translúcida', () => {
        const wall = hit(undefined, 1);
        const cell = hit('cell', 2);
        expect(cellsFirst([wall, cell])[0]).toBe(cell);
    });

    it('não passa à frente de algo opaco', () => {
        const hits = [hit('solid', 1), hit('cell', 2)];
        expect(cellsFirst(hits)).toBe(hits);
    });

    it('sem hemácia, a lista não muda', () => {
        const hits = [hit(undefined, 1), hit(undefined, 2)];
        expect(cellsFirst(hits)).toBe(hits);
    });
});
