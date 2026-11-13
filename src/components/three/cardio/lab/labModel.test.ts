import { describe, expect, it } from 'vitest';
import { CARDIO_VITALS, type CardioVitals } from '../../../../data/cardioSteps';
import {
    ANCHORS, DIAST_CURVE, LAB_CONTROLS, LAB_PRESETS, VISC_CURVE, clampControl, controlsOf, jetFactor,
    labVitals, matchPreset, piecewise, plaqueWord, type LabControls,
} from './labModel';

const FIELDS = Object.keys(CARDIO_VITALS.uso[0]) as (keyof CardioVitals)[];
const expectSameVitals = (got: CardioVitals, want: CardioVitals, tag: string) => {
    for (const f of FIELDS) expect(got[f], `${tag} · ${f}`).toBeCloseTo(want[f], 9);
};

describe('laboratório: cenário = ficha (cardioSteps.ts)', () => {
    it('cada cenário reproduz exatamente a sua linha da ficha', () => {
        for (const p of LAB_PRESETS) expectSameVitals(labVitals(controlsOf(p.vitals)), p.vitals, p.id);
    });

    it('os cenários apontam para treinado (uso[1]), em uso (uso[7]) e depois de parar (apos[7])', () => {
        const by = Object.fromEntries(LAB_PRESETS.map(p => [p.id, p.vitals]));
        expect(by.treinado).toBe(CARDIO_VITALS.uso[1]);
        expect(by.uso).toBe(CARDIO_VITALS.uso[7]);
        expect(by.apos).toBe(CARDIO_VITALS.apos[7]);
        expect(by.uso.hct).toBe(54);
        expect(by.uso.paSist).toBe(142);
        expect(by.uso.paDiast).toBe(82);
        expect(by.uso.fe).toBe(52);
        expect(by.uso.eLinha).toBe(9.3);
    });

    it('qualquer linha da ficha (todas as etapas, as duas fases) volta idêntica', () => {
        for (const phase of ['uso', 'apos'] as const) {
            CARDIO_VITALS[phase].forEach((row, i) => expectSameVitals(labVitals(controlsOf(row)), row, `${phase}[${i}]`));
        }
    });

    it('as âncoras são as linhas distintas da ficha (14: depois de parar repete as etapas 0 e 1)', () => {
        expect(ANCHORS.length).toBe(14);
    });

    it('todo cenário cabe na faixa dos deslizadores', () => {
        for (const row of [...CARDIO_VITALS.uso, ...CARDIO_VITALS.apos]) {
            const c = controlsOf(row);
            for (const d of LAB_CONTROLS) {
                expect(c[d.key], d.key).toBeGreaterThanOrEqual(d.min);
                expect(c[d.key], d.key).toBeLessThanOrEqual(d.max);
            }
        }
    });

    it('reconhece o cenário só quando os controles batem exatamente', () => {
        const c = controlsOf(CARDIO_VITALS.uso[7]);
        expect(matchPreset(c)).toBe('uso');
        expect(matchPreset({ ...c, hct: 53.5 })).toBeNull();
    });
});

describe('laboratório: física didática entre os pontos medidos', () => {
    const trained: LabControls = controlsOf(CARDIO_VITALS.uso[1]);
    const at = (patch: Partial<LabControls>) => labVitals({ ...trained, ...patch });

    it('curvas da ficha: diastólica(sistólica) e viscosidade(hematócrito) passam pelos pares medidos', () => {
        expect(piecewise(DIAST_CURVE, 142)).toBe(82);
        expect(piecewise(DIAST_CURVE, 118)).toBe(74);
        expect(piecewise(VISC_CURVE, 54)).toBe(1.45);
        expect(piecewise(VISC_CURVE, 45)).toBe(1);
        // monótonas e contínuas, inclusive fora da faixa medida
        let prevD = -Infinity;
        let prevV = -Infinity;
        for (let x = 100; x <= 170; x += 0.5) { const d = piecewise(DIAST_CURVE, x); expect(d).toBeGreaterThan(prevD); prevD = d; }
        for (let h = 40; h <= 60; h += 0.25) { const v = piecewise(VISC_CURVE, h); expect(v).toBeGreaterThan(prevV); prevV = v; }
    });

    it('a viscosidade sobe mais que proporcionalmente ao hematócrito', () => {
        const rel = (h: number) => piecewise(VISC_CURVE, h) / piecewise(VISC_CURVE, 45);
        expect(rel(54) - 1).toBeGreaterThan(54 / 45 - 1);
    });

    it('parede mais grossa: cavidade menor e fração de ejeção menor', () => {
        const thick = at({ parede: 16 });
        expect(thick.cavidadeMm).toBeLessThan(CARDIO_VITALS.uso[1].cavidadeMm);
        expect(thick.fe).toBeLessThan(CARDIO_VITALS.uso[1].fe);
    });

    it('relaxamento lento (E′ baixo) derruba a fração de ejeção', () => {
        expect(at({ eLinha: 8 }).fe).toBeLessThan(at({ eLinha: 12 }).fe);
    });

    it('pressão sistólica alta leva a diastólica junto', () => {
        expect(at({ paSist: 160 }).paDiast).toBeGreaterThan(82);
        expect(at({ paSist: 110 }).paDiast).toBeLessThan(74);
    });

    it('mexer só no hematócrito não muda a parede nem a pressão', () => {
        const v = at({ hct: 58 });
        expect(v.paredeMm).toBe(trained.parede);
        expect(v.paSist).toBe(trained.paSist);
        expect(v.viscosidade).toBeGreaterThan(1.45);
    });

    it('desfechos ficam em faixas fisiológicas em todos os extremos', () => {
        const corners: LabControls[] = [];
        for (let mask = 0; mask < 32; mask++) {
            const c = { ...trained };
            LAB_CONTROLS.forEach((d, i) => { c[d.key] = mask & (1 << i) ? d.max : d.min; });
            corners.push(c);
        }
        for (const c of corners) {
            const v = labVitals(c);
            expect(v.fe).toBeGreaterThanOrEqual(35);
            expect(v.fe).toBeLessThanOrEqual(75);
            expect(v.cavidadeMm).toBeGreaterThanOrEqual(35);
            expect(v.fibrose).toBeGreaterThanOrEqual(0);
            expect(v.fibrose).toBeLessThanOrEqual(1);
            expect(v.viscosidade).toBeGreaterThan(0.5);
            expect(Number.isFinite(v.paDiast)).toBe(true);
        }
    });

    it('jato na placa: continuidade (1/área), com teto', () => {
        expect(jetFactor(0)).toBe(1);
        expect(jetFactor(0.7)).toBeGreaterThan(2.5);
        expect(jetFactor(1)).toBeLessThanOrEqual(3.4);
    });

    it('placa em palavras e controles presos à faixa', () => {
        expect(plaqueWord(0)).toBe('nenhuma');
        expect(plaqueWord(0.15)).toBe('discreta');
        expect(plaqueWord(0.55)).toBe('moderada');
        expect(plaqueWord(0.7)).toBe('extensa');
        expect(clampControl('hct', 80)).toBe(60);
        expect(clampControl('parede', 2)).toBe(9);
    });
});
