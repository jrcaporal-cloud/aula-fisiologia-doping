/**
 * Motor da simulação: um único objeto mutável, avançado uma vez por quadro (useFrame com
 * prioridade negativa) e lido pelos componentes visuais. Arrays tipados por desempenho —
 * a mutação fica confinada aqui, fora do estado React.
 */
import {
    BLOOD,
    CHANNELS,
    CHANNEL_ORDER,
    GLYCOGEN_CENTERS,
    POCKET_Y,
    RECEPTORS,
    RECEPTOR_ORDER,
    seeded,
} from './layout';
import { bloodGlucoseTarget, freeInsulinFraction, receptorOccupancy } from './model';

export const GLUCOSE_COUNT = 120;
export const FREE_INSULIN_COUNT = 14;

export const GState = { Stored: 0, Blood: 1, Entering: 2, Spawning: 3 } as const;

export interface Telemetry {
    glucose: number;
    glycogen: number;
    bound: number;
    open: number;
}

export interface Engine {
    time: number;
    bound: Float32Array;
    act: Float32Array;
    vesicle: Float32Array;
    glucoseLevel: number;
    glycogen: number;
    g: {
        state: Uint8Array;
        t: Float32Array;
        x: Float32Array;
        y: Float32Array;
        z: Float32Array;
        sx: Float32Array;
        sy: Float32Array;
        sz: Float32Array;
        baseY: Float32Array;
        baseZ: Float32Array;
        phase: Float32Array;
        speed: Float32Array;
        channel: Uint8Array;
        store: Uint8Array;
        durA: Float32Array;
        durC: Float32Array;
        scale: Float32Array;
    };
    free: { x: Float32Array; baseY: Float32Array; baseZ: Float32Array; phase: Float32Array; scale: Float32Array };
    /** Pulso de passagem de glicose em cada canal (0–1, decai). */
    channelPulse: Float32Array;
    dispatchAcc: number;
    spawnAcc: number;
    telemetryAcc: number;
    rand: () => number;
}

export interface EngineInput {
    step: number;
    dose: number;
}

export const createEngine = (): Engine => {
    const rand = seeded(42);
    const n = GLUCOSE_COUNT;
    const g = {
        state: new Uint8Array(n),
        t: new Float32Array(n),
        x: new Float32Array(n),
        y: new Float32Array(n),
        z: new Float32Array(n),
        sx: new Float32Array(n),
        sy: new Float32Array(n),
        sz: new Float32Array(n),
        baseY: new Float32Array(n),
        baseZ: new Float32Array(n),
        phase: new Float32Array(n),
        speed: new Float32Array(n),
        channel: new Uint8Array(n),
        store: new Uint8Array(n),
        durA: new Float32Array(n),
        durC: new Float32Array(n),
        scale: new Float32Array(n),
    };
    for (let i = 0; i < n; i++) {
        g.state[i] = GState.Blood;
        g.x[i] = (rand() * 2 - 1) * BLOOD.halfX;
        g.baseY[i] = BLOOD.minY + rand() * (BLOOD.maxY - BLOOD.minY);
        g.baseZ[i] = (rand() * 2 - 1) * BLOOD.halfZ;
        g.phase[i] = rand() * Math.PI * 2;
        g.speed[i] = 0.25 + rand() * 0.3;
        g.scale[i] = 1;
    }
    const nf = FREE_INSULIN_COUNT;
    const free = {
        x: new Float32Array(nf),
        baseY: new Float32Array(nf),
        baseZ: new Float32Array(nf),
        phase: new Float32Array(nf),
        scale: new Float32Array(nf),
    };
    for (let i = 0; i < nf; i++) {
        free.x[i] = (rand() * 2 - 1) * (BLOOD.halfX - 1);
        free.baseY[i] = BLOOD.minY + 0.3 + rand() * (BLOOD.maxY - BLOOD.minY - 0.4);
        free.baseZ[i] = (rand() * 2 - 1) * (BLOOD.halfZ - 0.4);
        free.phase[i] = rand() * Math.PI * 2;
    }
    return {
        time: 0,
        bound: new Float32Array(RECEPTORS.length),
        act: new Float32Array(RECEPTORS.length),
        vesicle: new Float32Array(CHANNELS.length),
        glucoseLevel: 1,
        glycogen: 0.18,
        g,
        free,
        channelPulse: new Float32Array(CHANNELS.length),
        dispatchAcc: 0,
        spawnAcc: 0,
        telemetryAcc: 0,
        rand,
    };
};

const approach = (v: number, target: number, up: number, down: number, dt: number) =>
    v < target ? Math.min(v + up * dt, target) : Math.max(v - down * dt, target);

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const channelFusion = (e: Engine, i: number) => Math.min(Math.max(e.vesicle[i] - 1, 0), 1);
export const isChannelOpen = (e: Engine, i: number) => e.vesicle[i] >= 1.85;

const stepReceptors = (e: Engine, input: EngineInput, dt: number) => {
    const occ = input.step >= 1 ? receptorOccupancy(input.dose) : 0;
    const nBound = input.step >= 1 && input.dose > 0 ? Math.max(1, Math.round(occ * RECEPTORS.length)) : 0;
    RECEPTOR_ORDER.forEach((r, k) => {
        e.bound[r] = approach(e.bound[r], k < nBound ? 1 : 0, 0.5, 1.1, dt);
        e.act[r] = approach(e.act[r], e.bound[r] > 0.97 ? 1 : 0, 0.75, 1.4, dt);
    });
    return occ;
};

const stepVesicles = (e: Engine, input: EngineInput, occ: number, dt: number) => {
    const nTrans = input.step >= 2 ? Math.round(occ * CHANNELS.length) : 0;
    CHANNEL_ORDER.forEach((c, k) => {
        const wants = k < nTrans;
        const prev = k > 0 ? e.vesicle[CHANNEL_ORDER[k - 1]] : 2;
        if (wants && prev > 0.3) e.vesicle[c] = approach(e.vesicle[c], 2, 0.62, 0.9, dt);
        else if (!wants) e.vesicle[c] = approach(e.vesicle[c], 0, 0.62, 0.9, dt);
        e.channelPulse[c] = Math.max(e.channelPulse[c] - dt * 2.5, 0);
    });
    let open = 0;
    for (let i = 0; i < CHANNELS.length; i++) open += channelFusion(e, i);
    return open / CHANNELS.length;
};

const stepLevels = (e: Engine, input: EngineInput, openFrac: number, dt: number) => {
    const target = input.step >= 2 ? bloodGlucoseTarget(input.dose) : 1;
    const effective = 1 + (target - 1) * openFrac;
    const k = 0.22 + 0.06 * input.dose;
    e.glucoseLevel += (effective - e.glucoseLevel) * Math.min(k * dt, 1);
    const glyTarget = 0.18 + 0.78 * openFrac;
    e.glycogen += (glyTarget - e.glycogen) * Math.min(0.32 * dt, 1);
};

const nearestOpenChannel = (e: Engine, x: number, z: number) => {
    let best = -1;
    let bestD = Infinity;
    for (let c = 0; c < CHANNELS.length; c++) {
        if (!isChannelOpen(e, c)) continue;
        const d = Math.abs(CHANNELS[c].x - x) + 0.5 * Math.abs(CHANNELS[c].z - z);
        if (d < bestD) {
            bestD = d;
            best = c;
        }
    }
    return best;
};

const dispatchOne = (e: Engine) => {
    const g = e.g;
    // Escolhe uma molécula do sangue perto da membrana (mais natural do que sortear qualquer uma).
    let pick = -1;
    let pickY = Infinity;
    for (let tries = 0; tries < 8; tries++) {
        const i = Math.floor(e.rand() * GLUCOSE_COUNT);
        if (g.state[i] !== GState.Blood) continue;
        if (g.y[i] < pickY) {
            pickY = g.y[i];
            pick = i;
        }
    }
    if (pick < 0) return;
    const c = nearestOpenChannel(e, g.x[pick], g.z[pick]);
    if (c < 0) return;
    const ch = CHANNELS[c];
    g.state[pick] = GState.Entering;
    g.t[pick] = 0;
    g.sx[pick] = g.x[pick];
    g.sy[pick] = g.y[pick];
    g.sz[pick] = g.z[pick];
    g.channel[pick] = c;
    const dA = Math.hypot(ch.x - g.x[pick], 0.78 - g.y[pick], ch.z - g.z[pick]);
    g.durA[pick] = Math.max(0.45, dA / 2.4);
    let store = 0;
    let bestD = Infinity;
    GLYCOGEN_CENTERS.forEach(([gx, , gz], k) => {
        const d = Math.abs(gx - ch.x) + Math.abs(gz - ch.z) * 0.3 + e.rand() * 1.5;
        if (d < bestD) {
            bestD = d;
            store = k;
        }
    });
    g.store[pick] = store;
    const [gx, gy, gz] = GLYCOGEN_CENTERS[store];
    g.durC[pick] = Math.max(0.6, Math.hypot(gx - ch.x, gy + 0.78, gz - ch.z) / 2.2);
};

const spawnOne = (e: Engine, fromEdge: boolean) => {
    const g = e.g;
    for (let i = 0; i < GLUCOSE_COUNT; i++) {
        if (g.state[i] !== GState.Stored) continue;
        g.state[i] = GState.Spawning;
        g.t[i] = 0;
        g.scale[i] = 0;
        g.x[i] = fromEdge ? -BLOOD.halfX - e.rand() * 0.4 : (e.rand() * 2 - 1) * BLOOD.halfX;
        g.baseY[i] = BLOOD.minY + e.rand() * (BLOOD.maxY - BLOOD.minY);
        g.baseZ[i] = (e.rand() * 2 - 1) * BLOOD.halfZ;
        return;
    }
};

const PASS_TIME = 0.5;

const moveEntering = (e: Engine, i: number) => {
    const g = e.g;
    const ch = CHANNELS[g.channel[i]];
    const t = g.t[i];
    const dA = g.durA[i];
    const dC = g.durC[i];
    if (t < dA) {
        const u = ease(t / dA);
        g.x[i] = g.sx[i] + (ch.x - g.sx[i]) * u;
        g.y[i] = g.sy[i] + (0.78 - g.sy[i]) * u;
        g.z[i] = g.sz[i] + (ch.z - g.sz[i]) * u;
        g.scale[i] = 1;
        return;
    }
    if (t < dA + PASS_TIME) {
        const u = (t - dA) / PASS_TIME;
        g.x[i] = ch.x;
        g.y[i] = 0.78 - 1.56 * u;
        g.z[i] = ch.z;
        e.channelPulse[g.channel[i]] = 1;
        return;
    }
    const u = Math.min((t - dA - PASS_TIME) / dC, 1);
    const [gx, gy, gz] = GLYCOGEN_CENTERS[g.store[i]];
    const k = ease(u);
    g.x[i] = ch.x + (gx - ch.x) * k;
    g.y[i] = -0.78 + (gy + 0.78) * k;
    g.z[i] = ch.z + (gz - ch.z) * k;
    g.scale[i] = u > 0.75 ? 1 - (u - 0.75) / 0.25 : 1;
    if (u >= 1) {
        g.state[i] = GState.Stored;
        g.scale[i] = 0;
    }
};

const stepGlucose = (e: Engine, dt: number) => {
    const g = e.g;
    let blood = 0;
    for (let i = 0; i < GLUCOSE_COUNT; i++) {
        const s = g.state[i];
        if (s === GState.Blood || s === GState.Spawning) {
            blood++;
            g.x[i] += g.speed[i] * dt;
            if (g.x[i] > BLOOD.halfX) g.x[i] = -BLOOD.halfX;
            const ph = g.phase[i] + e.time * 0.7;
            g.y[i] = g.baseY[i] + Math.sin(ph) * 0.12;
            g.z[i] = g.baseZ[i] + Math.cos(ph * 0.8) * 0.12;
            if (s === GState.Spawning) {
                g.t[i] += dt;
                g.scale[i] = Math.min(g.t[i] / 0.6, 1);
                if (g.scale[i] >= 1) g.state[i] = GState.Blood;
            }
        } else if (s === GState.Entering) {
            g.t[i] += dt;
            moveEntering(e, i);
        }
    }
    let openCount = 0;
    for (let c = 0; c < CHANNELS.length; c++) if (isChannelOpen(e, c)) openCount++;
    const target = Math.round(e.glucoseLevel * GLUCOSE_COUNT);
    const excess = blood - target;
    if (openCount > 0) {
        const rate = excess > 0 ? 2 + excess * 1.4 : 0.55 * openCount;
        e.dispatchAcc += rate * dt;
        while (e.dispatchAcc >= 1) {
            dispatchOne(e);
            e.dispatchAcc -= 1;
        }
    }
    if (excess < 0) {
        e.spawnAcc += (2 + -excess * 1.5) * dt;
        while (e.spawnAcc >= 1) {
            spawnOne(e, openCount > 0);
            e.spawnAcc -= 1;
        }
    } else {
        e.spawnAcc = 0;
    }
};

const stepFreeInsulin = (e: Engine, input: EngineInput, dt: number) => {
    const n = input.step >= 1 ? Math.round(freeInsulinFraction(input.dose) * FREE_INSULIN_COUNT) : 0;
    for (let i = 0; i < FREE_INSULIN_COUNT; i++) {
        e.free.scale[i] = approach(e.free.scale[i], i < n ? 1 : 0, 1.6, 1.6, dt);
        e.free.x[i] += 0.22 * dt;
        if (e.free.x[i] > BLOOD.halfX) e.free.x[i] = -BLOOD.halfX;
    }
};

const SUBSTEP = 0.05;
/** Quadros lentos são compensados em subpassos (até 0,25 s); pausas longas não "pulam" a cena. */
const MAX_CATCH_UP = 0.25;

export const stepEngine = (e: Engine, input: EngineInput, rawDt: number, timeScale = 1): Telemetry | null => {
    let remaining = Math.min(rawDt, MAX_CATCH_UP) * timeScale;
    while (remaining > 1e-4) {
        const dt = Math.min(remaining, SUBSTEP);
        advance(e, input, dt);
        remaining -= dt;
    }
    return readTelemetry(e);
};

const advance = (e: Engine, input: EngineInput, dt: number) => {
    e.time += dt;
    const occ = stepReceptors(e, input, dt);
    const openFrac = stepVesicles(e, input, occ, dt);
    stepLevels(e, input, openFrac, dt);
    stepGlucose(e, dt);
    stepFreeInsulin(e, input, dt);
    e.telemetryAcc += dt;
};

const readTelemetry = (e: Engine): Telemetry | null => {
    if (e.telemetryAcc < 0.1) return null;
    e.telemetryAcc = 0;
    let bound = 0;
    let open = 0;
    for (let i = 0; i < RECEPTORS.length; i++) if (e.bound[i] > 0.97) bound++;
    for (let i = 0; i < CHANNELS.length; i++) if (isChannelOpen(e, i)) open++;
    return { glucose: e.glucoseLevel, glycogen: e.glycogen, bound, open };
};

/** Posição da insulina que vem encaixar no receptor r (b = progresso 0–1). */
export const boundInsulinPosition = (r: number, b: number, out: [number, number, number]) => {
    const s = RECEPTORS[r];
    const from: [number, number, number] = [s.x + 1.9, BLOOD.maxY + 0.2, s.z - 0.4];
    const to: [number, number, number] = [s.x, POCKET_Y, s.z];
    const u = Math.min(b / 0.75, 1);
    const k = 1 - (1 - u) ** 3;
    out[0] = from[0] + (to[0] - from[0]) * k;
    out[1] = from[1] + (to[1] - from[1]) * k + Math.sin(u * Math.PI) * 0.25;
    out[2] = from[2] + (to[2] - from[2]) * k;
    return out;
};
