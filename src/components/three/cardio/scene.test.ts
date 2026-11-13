import * as THREE from 'three';
import { describe, expect, it } from 'vitest';
import { CARDIO_VITALS, type CardioVitals } from '../../../data/cardioSteps';
import { chamberPoint } from './chamber';
import { FLOW, PLAQUE_SAMPLE, SAMPLES, makeFlowFrame, radiusAt, rangeOf, speedAt, stenosisAt, writeFlowFrame } from './flow';
import { emptyShape, lvShape, rvShape } from './heartShapes';
import { STENOSIS_PER_PLAQUE, controlsOf, jetFactor, labVitals, presetById } from './lab/labModel';
import { useLab } from './lab/labStore';
import { FLOW_NODES, toLocal, toWorld, type Kind } from './layout';
import { cardiacCycle, deriveGeometry, emptyCycle, emptyParams, type CardioParams } from './params';
import { clearSeries, makeSeries, pressureAt, pushSeries, seriesIndex } from './series';

const paramsOf = (v: CardioVitals): CardioParams => {
    const p = emptyParams();
    Object.assign(p.v, v);
    return deriveGeometry(p);
};
const TRAINED = CARDIO_VITALS.uso[1];
const IN_USE = CARDIO_VITALS.uso[7];

describe('circuito: trechos e referencial do coração', () => {
    it('todos os trechos existem e são contíguos na ordem do fluxo', () => {
        const kinds = [...new Set(FLOW_NODES.map(n => n.kind))] as Kind[];
        for (const k of kinds) {
            const [a, b] = rangeOf(k);
            expect(b - a + 1, k).toBe(FLOW.filter(s => s.kind === k).length);
        }
        expect(FLOW.length).toBe(SAMPLES);
    });

    it('toWorld e toLocal são inversos', () => {
        const p = toWorld(1.3, -2.1, -0.4, new THREE.Vector3());
        const l = toLocal(p, new THREE.Vector3());
        expect(l.x).toBeCloseTo(1.3, 9);
        expect(l.y).toBeCloseTo(-2.1, 9);
        expect(l.z).toBeCloseTo(-0.4, 9);
    });

    it('o quadro do corte: s no plano frontal, k para trás, ambos ⟂ ao fluxo', () => {
        for (const s of FLOW) {
            expect(Math.abs(s.s.z)).toBeLessThan(1e-6);
            expect(s.k.z).toBeLessThanOrEqual(1e-9);
            expect(Math.abs(s.s.dot(s.k))).toBeLessThan(1e-6);
        }
    });
});

describe('física didática do circuito', () => {
    const cy = emptyCycle();

    it('sem placa não há estreitamento; com placa, o pico fica na lesão e vale 0,62 × placa', () => {
        const clean = paramsOf(TRAINED);
        expect(FLOW.every((_, i) => stenosisAt(i, clean) === 0)).toBe(true);
        const sick = paramsOf(IN_USE);
        let peak = 0;
        let at = -1;
        FLOW.forEach((_, i) => { const s = stenosisAt(i, sick); if (s > peak) { peak = s; at = i; } });
        expect(peak).toBeCloseTo(STENOSIS_PER_PLAQUE * IN_USE.placa, 2);
        expect(Math.abs(at - PLAQUE_SAMPLE)).toBeLessThanOrEqual(3);
    });

    it('continuidade: o sangue acelera na placa na proporção do jato', () => {
        cardiacCycle(0.1, paramsOf(TRAINED), false, cy);
        const base = paramsOf({ ...TRAINED, placa: 0 });
        const plaque = paramsOf({ ...TRAINED, placa: 0.7 });
        const ratio = speedAt(PLAQUE_SAMPLE, plaque, cy) / speedAt(PLAQUE_SAMPLE, base, cy);
        expect(ratio).toBeCloseTo(jetFactor(0.7), 1);
    });

    it('sangue viscoso anda mais devagar, sobretudo nas arteríolas', () => {
        const thin = paramsOf(TRAINED);
        const thick = paramsOf({ ...TRAINED, hct: 54, viscosidade: 1.45 });
        const [a] = rangeOf('arteriola');
        const [v] = rangeOf('veia');
        const dropArteriole = speedAt(a + 2, thick, cy) / speedAt(a + 2, thin, cy);
        const dropVein = speedAt(v + 2, thick, cy) / speedAt(v + 2, thin, cy);
        expect(dropArteriole).toBeLessThan(1);
        expect(dropArteriole).toBeLessThan(dropVein);
    });

    it('artéria rígida pulsa menos', () => {
        const [a, b] = rangeOf('arteria');
        const mid = Math.round((a + b) / 2);
        const swing = (p: CardioParams) => {
            let lo = Infinity;
            let hi = -Infinity;
            for (let t = 0; t < 1.2; t += 0.01) {
                cardiacCycle(t, p, false, cy);
                const r = radiusAt(mid, p, cy);
                lo = Math.min(lo, r);
                hi = Math.max(hi, r);
            }
            return (hi - lo) / lo;
        };
        expect(swing(paramsOf(IN_USE))).toBeLessThan(swing(paramsOf(TRAINED)) * 0.6);
    });

    it('a tabela do quadro é finita em todos os cenários e extremos', () => {
        const f = makeFlowFrame();
        for (const v of [TRAINED, IN_USE, CARDIO_VITALS.apos[7], labVitals({ parede: 17, eLinha: 7.5, paSist: 165, hct: 60, placa: 1 })]) {
            const p = paramsOf(v);
            cardiacCycle(0.33, p, false, cy);
            writeFlowFrame(f, p, cy);
            for (const arr of [f.ax, f.rad, f.spd, f.sten, f.swl]) expect(arr.every(Number.isFinite)).toBe(true);
            expect(f.rad.every(r => r > 0)).toBe(true);
        }
    });
});

describe('anatomia: o VD encosta no septo', () => {
    it('a borda septal do VD fica dentro da parede do VE em toda a altura (treinado e em uso)', () => {
        for (const v of [TRAINED, IN_USE]) {
            const st = { p: paramsOf(v), cy: emptyCycle(), f: makeFlowFrame(), dt: 0 };
            const lv = lvShape(st, emptyShape('below'));
            const rv = rvShape(st, emptyShape('below'));
            const a = new THREE.Vector3();
            const lvIn = new THREE.Vector3();
            const lvOut = new THREE.Vector3();
            for (let f = 0.15; f <= 1; f += 0.05) {
                chamberPoint(rv, f, 1, true, a); // borda do corte do lado do septo
                const q = (a.y - lv.yc) / lv.hOut;
                if (Math.abs(q) >= 1) continue;
                lvOut.set(-lv.rOut * Math.sqrt(1 - q * q), a.y, 0);
                const qi = (a.y - lv.yc) / lv.hIn;
                lvIn.set(Math.abs(qi) < 1 ? -lv.rIn * Math.sqrt(1 - qi * qi) : 0, a.y, 0);
                expect(a.x, `f=${f.toFixed(2)}`).toBeGreaterThan(lvOut.x);
                expect(a.x, `f=${f.toFixed(2)}`).toBeLessThan(lvIn.x);
            }
        }
    });

    it('a hipertrofia engrossa a parede e encolhe a cavidade do VE', () => {
        const t = paramsOf(TRAINED);
        const u = paramsOf(IN_USE);
        expect(u.wall).toBeGreaterThan(t.wall);
        expect(u.rCav).toBeLessThan(t.rCav);
        // o epicárdio quase não se move (a parede cresce para dentro)
        expect(Math.abs(u.rOut - t.rOut) / t.rOut).toBeLessThan(0.03);
    });
});

describe('séries do monitor', () => {
    it('buffer circular: guarda os últimos pontos em ordem', () => {
        const s = makeSeries(4);
        for (let i = 0; i < 6; i++) pushSeries(s, i, { pa: i, paRef: 0, vol: 0, volRef: 0, vel: 0, velRef: 0 });
        expect(s.count).toBe(4);
        expect([0, 1, 2, 3].map(i => s.v.pa[seriesIndex(s, i)])).toEqual([2, 3, 4, 5]);
        clearSeries(s);
        expect(s.count).toBe(0);
    });

    it('a pressão instantânea vai da diastólica à sistólica da ficha', () => {
        for (const rig of [0, 1]) {
            let lo = Infinity;
            let hi = -Infinity;
            for (let c = 0; c < 1; c += 0.002) {
                const v = pressureAt(c, rig, 82, 142);
                lo = Math.min(lo, v);
                hi = Math.max(hi, v);
            }
            expect(hi).toBeCloseTo(142, 0);
            expect(lo).toBeGreaterThanOrEqual(82 - 1e-9);
            expect(lo).toBeLessThan(84);
        }
    });
});

describe('laboratório: cenário animado chega exatamente na ficha', () => {
    it('applyPreset leva os controles até a linha da ficha (sem resíduo do tween)', async () => {
        const s = useLab.getState();
        s.reset();
        s.applyPreset('uso', true);
        await new Promise(r => setTimeout(r, 600));
        const after = useLab.getState();
        expect(after.controls).toEqual(controlsOf(presetById('uso').vitals));
        expect(after.preset).toBe('uso');
        after.setControl('hct', 50);
        expect(useLab.getState().preset).toBeNull();
        after.stepPreset(1, true);
        await new Promise(r => setTimeout(r, 600));
        expect(useLab.getState().preset).toBe('treinado');
        useLab.getState().reset();
    });
});
