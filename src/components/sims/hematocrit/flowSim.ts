import * as THREE from 'three';
import { CELL_SCALE, HALF_LEN, LUMEN_R, THROMBUS_HALF, THROMBUS_X, VESSEL_LEN, seeded } from './geometry';

/** Velocidade no eixo do vaso (unidades/s) com fluxo relativo = 1. */
const U_MAX = 2.7;
/** Raio máximo do centro da hemácia (não atravessa a parede). */
const LANE_R = LUMEN_R - CELL_SCALE * 1.15;
/** Distância entre hemácias empilhadas face a face (rouleaux). */
const STACK_SPACING = CELL_SCALE * 0.6;
const MAX_STACK = 7;

export interface FlowParams {
    /** Hemácias visíveis (proporcional ao hematócrito). */
    count: number;
    /** Multiplicador global de fluxo (viscosidade × batimento × obstrução). */
    flow: number;
    /** Grau de empilhamento 0–1. */
    aggregation: number;
    /** Obstrução do lúmen pelo microtrombo 0–1 (cresce a partir da parede inferior). */
    occlusion: number;
}

const wrap = (d: number) => {
    if (d > HALF_LEN) return d - VESSEL_LEN;
    if (d < -HALF_LEN) return d + VESSEL_LEN;
    return d;
};

/**
 * Escoamento laminar (Poiseuille) de hemácias num tubo: cada célula segue sua "faixa"
 * radial com velocidade u(r) = Umax·(1 − r²/R²) e gira com o cisalhamento.
 * Com agregação, células do mesmo grupo se alinham atrás de uma líder (rouleaux).
 */
export class FlowSim {
    readonly max: number;
    private readonly x: Float32Array;
    private readonly y: Float32Array;
    private readonly z: Float32Array;
    private readonly laneY: Float32Array;
    private readonly laneZ: Float32Array;
    private readonly leader: Int32Array;
    private readonly slot: Float32Array;
    private readonly stackAxis: Float32Array;
    private readonly spin: Float32Array;
    private readonly spinRate: Float32Array;
    private readonly roll: Float32Array;
    private readonly size: Float32Array;
    private readonly vis: Float32Array;
    private readonly stopJitter: Float32Array;
    private readonly inStack: Uint8Array;
    private readonly baseQuat: THREE.Quaternion[];

    private readonly qFree = new THREE.Quaternion();
    private readonly qStack = new THREE.Quaternion();
    private readonly qSpin = new THREE.Quaternion();
    private readonly qRoll = new THREE.Quaternion();
    private readonly axis = new THREE.Vector3();
    private readonly upY = new THREE.Vector3(0, 1, 0);
    private readonly pos = new THREE.Vector3();
    private readonly scl = new THREE.Vector3();
    private readonly mat = new THREE.Matrix4();

    constructor(max: number, seed = 11) {
        this.max = max;
        const rand = seeded(seed);
        this.x = new Float32Array(max);
        this.y = new Float32Array(max);
        this.z = new Float32Array(max);
        this.laneY = new Float32Array(max);
        this.laneZ = new Float32Array(max);
        this.leader = new Int32Array(max);
        this.slot = new Float32Array(max);
        this.stackAxis = new Float32Array(max * 3);
        this.spin = new Float32Array(max);
        this.spinRate = new Float32Array(max);
        this.roll = new Float32Array(max);
        this.size = new Float32Array(max);
        this.vis = new Float32Array(max);
        this.stopJitter = new Float32Array(max);
        this.inStack = new Uint8Array(max);
        this.baseQuat = [];

        let i = 0;
        while (i < max) {
            // Grupos de 1 a 7 células consecutivas; o primeiro índice é a líder.
            const groupSize = Math.min(rand() < 0.18 ? 1 : 2 + Math.floor(rand() * (MAX_STACK - 1)), max - i);
            const tilt = (rand() - 0.5) * 0.5;
            const yaw = (rand() - 0.5) * 0.5;
            const ax = Math.cos(tilt) * Math.cos(yaw);
            const ay = Math.sin(tilt);
            const az = Math.cos(tilt) * Math.sin(yaw);
            for (let k = 0; k < groupSize; k++, i++) {
                this.leader[i] = i - k;
                this.inStack[i] = groupSize > 1 ? 1 : 0;
                this.slot[i] = k;
                this.stackAxis[i * 3] = ax;
                this.stackAxis[i * 3 + 1] = ay;
                this.stackAxis[i * 3 + 2] = az;
                this.initCell(i, rand);
            }
        }
    }

    private initCell(i: number, rand: () => number) {
        const r = LANE_R * Math.sqrt(rand());
        const th = rand() * Math.PI * 2;
        this.laneY[i] = r * Math.cos(th);
        this.laneZ[i] = r * Math.sin(th);
        this.x[i] = (rand() - 0.5) * VESSEL_LEN;
        this.y[i] = this.laneY[i];
        this.z[i] = this.laneZ[i];
        this.spin[i] = rand() * Math.PI * 2;
        this.spinRate[i] = 0.7 + rand() * 0.8;
        this.roll[i] = (rand() - 0.5) * 0.6;
        this.size[i] = 0.92 + rand() * 0.16;
        this.stopJitter[i] = rand();
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI));
        this.baseQuat.push(q);
    }

    private speedAt(y: number, z: number) {
        const rr = (y * y + z * z) / (LUMEN_R * LUMEN_R);
        return U_MAX * Math.max(1 - rr, 0.05);
    }

    /** Fator 0–1 de bloqueio: células abaixo da altura ocupada pelo trombo param a montante. */
    private gate(i: number, occlusion: number) {
        if (occlusion <= 0.001) return 1;
        const x = this.x[i];
        const y = this.y[i];
        const front = THROMBUS_X - THROMBUS_HALF - 0.1;
        if (x > THROMBUS_X + THROMBUS_HALF || x < front - 4.5) return 1;
        const blockY = -LUMEN_R + 2 * LUMEN_R * occlusion * 1.08;
        const blocked = THREE.MathUtils.smoothstep(blockY + 0.15 - y, 0, 0.3);
        if (blocked <= 0) return 1;
        const stopX = front - this.stopJitter[i] * 2.6 * occlusion;
        const byDistance = Math.min(Math.max((stopX - x) / 0.9, 0), 1);
        return 1 - blocked * (1 - byDistance);
    }

    step(dt: number, p: FlowParams) {
        const { count, flow, aggregation, occlusion } = p;
        const fade = Math.min(dt * 3, 1);
        const laneRate = Math.min(dt * 1.6 * (0.3 + aggregation), 1);
        for (let i = 0; i < this.max; i++) {
            this.vis[i] += ((i < count ? 1 : 0) - this.vis[i]) * fade;
            if (this.vis[i] < 0.002 && i >= count) continue;

            const L = this.leader[i];
            const isMember = L !== i && L < count;
            const agg = this.inStack[i] ? aggregation : 0;

            // Faixa-alvo: própria (laminar) ou posição na pilha da líder.
            let ty = this.laneY[i];
            let tz = this.laneZ[i];
            let slotDx = 0;
            if (isMember && agg > 0) {
                const s = this.slot[i] * STACK_SPACING;
                const ax = this.stackAxis[i * 3];
                const sy = this.y[L] - this.stackAxis[i * 3 + 1] * s;
                const sz = this.z[L] - this.stackAxis[i * 3 + 2] * s;
                ty += (sy - ty) * agg;
                tz += (sz - tz) * agg;
                slotDx = wrap(this.x[L] - ax * s - this.x[i]);
            }
            this.y[i] += (ty - this.y[i]) * laneRate;
            this.z[i] += (tz - this.z[i]) * laneRate;
            const rr = Math.hypot(this.y[i], this.z[i]);
            if (rr > LANE_R) {
                this.y[i] *= LANE_R / rr;
                this.z[i] *= LANE_R / rr;
            }

            let u = this.speedAt(this.y[i], this.z[i]);
            if (isMember && agg > 0) {
                const uL = this.speedAt(this.y[L], this.z[L]);
                u += (uL - u) * agg;
            }
            let vx = u * flow * this.gate(i, occlusion);
            if (isMember && agg > 0) vx += slotDx * 2.4 * agg * Math.max(flow, 0.25);
            this.x[i] += vx * dt;
            if (this.x[i] > HALF_LEN) this.x[i] -= VESSEL_LEN;
            if (this.x[i] < -HALF_LEN) this.x[i] += VESSEL_LEN;

            // Rolagem pelo cisalhamento: proporcional à distância do eixo e ao fluxo.
            this.spin[i] += this.spinRate[i] * (rr / LUMEN_R) * flow * 1.6 * dt * (1 - agg);
        }
    }

    write(mesh: THREE.InstancedMesh, aggregation: number) {
        for (let i = 0; i < this.max; i++) {
            const v = this.vis[i];
            if (v < 0.002) {
                this.mat.makeScale(0, 0, 0);
                mesh.setMatrixAt(i, this.mat);
                continue;
            }
            const y = this.y[i];
            const z = this.z[i];
            const r = Math.hypot(y, z) || 1;
            // Eixo de rotação do cisalhamento: x̂ × r̂.
            this.axis.set(0, -z / r, y / r);
            this.qSpin.setFromAxisAngle(this.axis, this.spin[i]);
            this.qFree.copy(this.qSpin).multiply(this.baseQuat[i]);

            if (this.inStack[i] && aggregation > 0) {
                this.axis.set(this.stackAxis[i * 3], this.stackAxis[i * 3 + 1], this.stackAxis[i * 3 + 2]);
                this.qStack.setFromUnitVectors(this.upY, this.axis);
                this.qRoll.setFromAxisAngle(this.axis, this.roll[i]);
                this.qStack.premultiply(this.qRoll);
                this.qFree.slerp(this.qStack, aggregation);
            }
            this.pos.set(this.x[i], y, z);
            this.scl.setScalar(CELL_SCALE * this.size[i] * v);
            this.mat.compose(this.pos, this.qFree, this.scl);
            mesh.setMatrixAt(i, this.mat);
        }
        mesh.instanceMatrix.needsUpdate = true;
    }
}
