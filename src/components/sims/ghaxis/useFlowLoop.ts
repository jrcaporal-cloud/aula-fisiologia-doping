import { useEffect, useRef, type RefObject } from 'react';
import { CYCLE, EMITTERS, ORGAN_LEVELS, PATHS, isBurst, type Burst, type OrganLevels, type PathId, type Stream } from './flow';

/** Motor de partículas: um único requestAnimationFrame escreve atributos direto no SVG (sem re-render). */

export const POOL = 96;

export interface GlowRefs {
    hypo: RefObject<SVGGElement | null>;
    pit: RefObject<SVGGElement | null>;
    pitHead: RefObject<SVGGElement | null>;
    liver: RefObject<SVGGElement | null>;
    muscle: RefObject<SVGGElement | null>;
}

interface Lut { readonly xs: Float32Array; readonly ys: Float32Array }

const LUT_N = 120;

const sample = (el: SVGPathElement): Lut => {
    const len = el.getTotalLength();
    const xs = new Float32Array(LUT_N + 1);
    const ys = new Float32Array(LUT_N + 1);
    for (let i = 0; i <= LUT_N; i++) {
        const p = el.getPointAtLength((i / LUT_N) * len);
        xs[i] = p.x;
        ys[i] = p.y;
    }
    return { xs, ys };
};

const hash = (a: number, b: number): number => {
    const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
    return s - Math.floor(s);
};

/** Distância circular entre fases (0–1). */
const gauss = (phase: number, center: number, width: number): number => {
    const d0 = Math.abs(phase - center);
    const d = Math.min(d0, 1 - d0);
    return Math.exp(-(d * d) / (2 * width * width));
};

const approach = (v: number, target: number, k: number): number => v + (target - v) * Math.min(1, k);

const lerpLevels = (a: OrganLevels, b: OrganLevels, k: number): OrganLevels => ({
    hypo: approach(a.hypo, b.hypo, k),
    pit: approach(a.pit, b.pit, k),
    liver: approach(a.liver, b.liver, k),
    liverBase: approach(a.liverBase, b.liverBase, k),
    muscle: approach(a.muscle, b.muscle, k),
    axisOff: approach(a.axisOff, b.axisOff, k),
});

const emissionTimes = (cfg: Burst | Stream, t: number, travel: number): number[] => {
    const out: number[] = [];
    if (isBurst(cfg)) {
        const c0 = Math.floor((t - travel) / CYCLE) - 1;
        const c1 = Math.floor(t / CYCLE);
        for (let c = c0; c <= c1; c++) {
            for (let i = 0; i < cfg.n; i++) out.push(c * CYCLE + (cfg.phase + (cfg.spread * i) / cfg.n) * CYCLE);
        }
        return out;
    }
    const k0 = Math.ceil((t - travel) * cfg.rate);
    const k1 = Math.floor(t * cfg.rate);
    for (let k = k0; k <= k1; k++) out.push(k / cfg.rate);
    return out;
};

export const useFlowLoop = (
    step: number,
    reduced: boolean,
    pathRefs: RefObject<Partial<Record<PathId, SVGPathElement | null>>>,
    dotRefs: RefObject<(SVGCircleElement | null)[]>,
    glows: GlowRefs,
): void => {
    const stepRef = useRef(step);
    useEffect(() => { stepRef.current = step; }, [step]);
    /** Com movimento reduzido, o quadro estático é refeito a cada passo; animado, o laço lê o passo por ref. */
    const staticKey = reduced ? step : -1;

    useEffect(() => {
        if (staticKey >= 0) stepRef.current = staticKey;
        const paths = pathRefs.current;
        const luts: Partial<Record<PathId, Lut>> = {};
        (Object.keys(PATHS) as PathId[]).forEach(id => {
            const el = paths[id];
            if (el) luts[id] = sample(el);
        });

        const gains: number[] = EMITTERS.map(e => (e.steps[stepRef.current] ? 1 : 0));
        const lastCfg: (Burst | Stream | null)[] = EMITTERS.map(e => e.steps[stepRef.current]);
        let levels: OrganLevels = ORGAN_LEVELS[stepRef.current];
        const t0 = performance.now();
        let last = t0;
        let raf = 0;

        const place = (slot: number, x: number, y: number, r: number, color: string, exo: boolean, alpha: number) => {
            const dot = dotRefs.current[slot];
            if (!dot) return;
            dot.setAttribute('cx', x.toFixed(1));
            dot.setAttribute('cy', y.toFixed(1));
            dot.setAttribute('r', r.toFixed(2));
            dot.setAttribute('fill', color);
            dot.setAttribute('stroke', exo ? '#FCD34D' : 'none');
            dot.setAttribute('opacity', alpha.toFixed(3));
        };

        const draw = (t: number, dt: number) => {
            const step = stepRef.current;
            const k = reduced ? 1 : dt / 0.45;
            let slot = 0;

            EMITTERS.forEach((em, ei) => {
                const cfg = em.steps[step];
                if (cfg) lastCfg[ei] = cfg;
                gains[ei] = approach(gains[ei], cfg ? 1 : 0, k);
                const use = lastCfg[ei];
                const lut = luts[em.path];
                if (!use || !lut || gains[ei] < 0.01) return;
                for (const te of emissionTimes(use, t, em.travel)) {
                    const age = t - te;
                    if (age < 0 || age > em.travel || slot >= POOL) continue;
                    const u = age / em.travel;
                    const f = u * LUT_N;
                    const i = Math.min(LUT_N - 1, Math.floor(f));
                    const w = f - i;
                    const x = lut.xs[i] + (lut.xs[i + 1] - lut.xs[i]) * w;
                    const y = lut.ys[i] + (lut.ys[i + 1] - lut.ys[i]) * w;
                    const dx = lut.xs[i + 1] - lut.xs[i];
                    const dy = lut.ys[i + 1] - lut.ys[i];
                    const len = Math.hypot(dx, dy) || 1;
                    const seed = Math.round(te * 1000);
                    const off = (hash(ei, seed) * 2 - 1) * em.jitter;
                    const r = em.size * (0.85 + hash(seed, ei) * 0.3);
                    const fade = Math.min(1, u / 0.08, (1 - u) / 0.14);
                    place(slot, x - (dy / len) * off, y + (dx / len) * off, r, em.color, em.exo, gains[ei] * Math.max(0, fade));
                    slot++;
                }
            });
            for (; slot < POOL; slot++) dotRefs.current[slot]?.setAttribute('opacity', '0');

            levels = lerpLevels(levels, ORGAN_LEVELS[step], k);
            const phase = (t % CYCLE) / CYCLE;
            const set = (ref: RefObject<SVGGElement | null>, v: number) => ref.current?.setAttribute('opacity', Math.max(0, Math.min(1, v)).toFixed(3));
            set(glows.hypo, levels.hypo * gauss(phase, 0.05, 0.07));
            const pit = levels.pit * gauss(phase, 0.3, 0.07);
            set(glows.pit, pit);
            set(glows.pitHead, pit);
            set(glows.liver, levels.liverBase + levels.liver * gauss(phase, 0.78, 0.11));
            set(glows.muscle, levels.muscle * (0.8 + 0.2 * Math.sin(t * 4.5)));
        };

        if (reduced) {
            draw(CYCLE * 0.42, 1);
            return undefined;
        }

        const frame = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            draw((now - t0) / 1000 + CYCLE * 0.2, dt);
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, [reduced, staticKey, pathRefs, dotRefs, glows]);
};
