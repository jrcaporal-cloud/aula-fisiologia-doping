import * as THREE from 'three';
import {
    AR_REST, DIMER_FORM, DIMER_HALF, DNA_CENTER, DOCK, memX, NUCLEUS_R, NUCLEUS_R_INNER, POCKET_LOCAL,
    RNAP_END_Z, RNAP_START_Z, V, W, clamp01, lerp, ph, phase, porePoint, sg, smooth,
} from './layout';

/*
 * Coreografia: posições e orientações de tudo em função do tempo da aula T (e do relógio, só para
 * micro-movimentos). Funções puras que escrevem em objetos de saída para não alocar por quadro.
 */

export interface Pose { p: THREE.Vector3; q: THREE.Quaternion }
export const makePose = (): Pose => ({ p: new THREE.Vector3(), q: new THREE.Quaternion() });

const Y = new THREE.Vector3(0, 1, 0);
const qy = (a: number) => new THREE.Quaternion().setFromAxisAngle(Y, a);
const tq = new THREE.Quaternion();
const IDENT = new THREE.Quaternion();
const tv = new THREE.Vector3();
const tv2 = new THREE.Vector3();

// ------------------------------------------------------------------ dímero (referencial comum)

/** O dímero se forma com o eixo longo em x (os dois receptores lado a lado para a câmera),
 * atravessa o poro assim (eixo longo alinhado ao eixo do poro) e gira para alinhar ao DNA (eixo z). */
const FORM_Q = qy(Math.PI / 2);
const transPath = new THREE.CatmullRomCurve3([
    DIMER_FORM.clone(),
    V(3.5, 0.6, -2.6),
    porePoint(0, NUCLEUS_R + 2.6),
    porePoint(0, NUCLEUS_R),
    porePoint(0, NUCLEUS_R_INNER - 2.4),
    V(-7.0, 2.4, -4.2),
    DOCK.clone(),
], false, 'centripetal');

export const dimerFrame = (T: number, out: Pose) => {
    const s = 0.8 * ph(T, W.transloc) + 0.2 * ph(T, W.dock);
    transPath.getPointAt(s, out.p);
    const turn = smooth(clamp01((T - 3.72) / 0.6));
    out.q.copy(FORM_Q).slerp(IDENT, turn);
    return out;
};

// ------------------------------------------------------------------ receptores

const REST_Q = [qy(-0.42), qy(-0.15)];
/** Encaixe de cada receptor no dímero (AR1 na frente, AR2 girado 180° — simetria de ordem 2). */
const SLOT_P = [V(0, 0, -DIMER_HALF), V(0, 0, DIMER_HALF)];
const SLOT_Q = [qy(Math.PI), new THREE.Quaternion()];
const frame = makePose();

export const arPose = (i: number, T: number, clock: number, out: Pose) => {
    const k = phase(T, W.dimer[0] + i * 0.04, W.dimer[1]);
    const docked = ph(T, W.dock);
    // micro-movimento térmico enquanto livre
    const free = 1 - docked;
    const bob = tv2.set(Math.sin(clock * 0.7 + i * 2) * 0.06, Math.sin(clock * 0.9 + i) * 0.08, Math.cos(clock * 0.6 + i * 3) * 0.06).multiplyScalar(free);
    dimerFrame(T, frame);
    tv.copy(SLOT_P[i]).applyQuaternion(frame.q).add(frame.p);
    tq.copy(frame.q).multiply(SLOT_Q[i]);
    if (k <= 0) {
        out.p.copy(AR_REST[i]);
        out.q.copy(REST_Q[i]);
    } else {
        out.p.copy(AR_REST[i]).lerp(tv, k);
        out.p.y += Math.sin(Math.PI * k) * 0.8 * (i === 0 ? 1 : -1);
        out.q.copy(REST_Q[i]).slerp(tq, k);
    }
    out.p.add(bob);
    return out;
};

/** Abertura da hélice 12 (rad). SARM fecha numa conformação diferente (texto do slide de SARMs). */
export const h12Angle = (T: number, sarm: boolean) => {
    const open = 1.25;
    const closed = sarm ? 0.42 : 0;
    return lerp(open, closed, ph(T, W.h12));
};

// ------------------------------------------------------------------ ligantes

const LIGAND_PATHS = [
    new THREE.CatmullRomCurve3([V(21.5, 2.9, 4.2), V(17.8, 2.2, 3.0), V(memX(1.9, 2.75), 1.9, 2.75), V(13.4, 1.85, 2.4), V(12.6, 1.9, 2.1)], false, 'centripetal'),
    new THREE.CatmullRomCurve3([V(22, -1.6, -0.8), V(18.5, -2.0, -1.8), V(memX(-2.4, -2.2), -2.4, -2.2), V(13.6, -2.6, -2.6), V(13.0, -2.6, -2.8)], false, 'centripetal'),
];
/** Orientação do ligante dentro do bolsão (plano do esteroide no plano yz do receptor, face β para a abertura). */
const IN_POCKET_Q = qy(Math.PI / 2);
const tumble = new THREE.Euler();
const arTmp = makePose();

export const ligandPose = (i: number, T: number, clock: number, out: Pose) => {
    const d = phase(T, 0.05 + i * 0.1, 0.95);
    LIGAND_PATHS[i].getPointAt(d, out.p);
    tumble.set(0.6 + T * 2.2 + clock * 0.25 + i, 0.3 + T * 3.1 + i * 2, clock * 0.18 + T * 1.3);
    out.q.setFromEuler(tumble);
    const enter = phase(T, W.enterPocket[0] + i * 0.05, W.enterPocket[1]);
    // Browniano enquanto livre
    const free = 1 - enter;
    out.p.x += Math.sin(clock * 1.3 + i) * 0.05 * free;
    out.p.y += Math.cos(clock * 1.1 + i * 2) * 0.05 * free;
    if (enter > 0) {
        arPose(i, T, clock, arTmp);
        tv.copy(POCKET_LOCAL).applyQuaternion(arTmp.q).add(arTmp.p);
        tq.copy(arTmp.q).multiply(IN_POCKET_Q);
        out.p.lerp(tv, enter);
        out.q.slerp(tq, enter);
    }
    return out;
};

// ------------------------------------------------------------------ transcrição

export const RNAP_EXIT = V(0.35, 2.05, -0.55);
export const rnapPose = (T: number, out: THREE.Vector3) => {
    const z = lerp(RNAP_START_Z, RNAP_END_Z, smooth(sg(T, W.transcribe)));
    out.set(DNA_CENTER.x, DNA_CENTER.y, DNA_CENTER.z + z);
    const arrive = ph(T, W.rnapIn);
    const leave = ph(T, W.rnapOut);
    out.x += (1 - arrive) * 3.5 + leave * 3.0;
    out.y += (1 - arrive) * 6 + leave * 6.5;
    return { scale: Math.min(arrive, 1 - leave) };
};

export const bubbleState = (T: number) => {
    const z = lerp(RNAP_START_Z, RNAP_END_Z, smooth(sg(T, W.transcribe)));
    return { z, open: ph(T, W.bubble) * (1 - ph(T, W.rnapOut)) };
};

export const MRNA_N = 40;
const MRNA_LEN = 6.4;
const DRIFT = V(0.45, 0.8, 0.4).normalize();
const CURL_U = new THREE.Vector3().crossVectors(DRIFT, V(0, 0, 1)).normalize();
const CURL_V = new THREE.Vector3().crossVectors(DRIFT, CURL_U).normalize();

/** Posição do nucleotídeo i durante a transcrição (pr = progresso da polimerase 0…1). */
const transcribedBead = (i: number, pr: number, out: THREE.Vector3) => {
    const f = ((i + 1) / MRNA_N) * 0.985;
    const age = Math.max(pr - f, 0);
    const z = lerp(RNAP_START_Z, RNAP_END_Z, f);
    out.set(DNA_CENTER.x, DNA_CENTER.y, DNA_CENTER.z + z).add(RNAP_EXIT);
    const dist = age * MRNA_LEN;
    out.addScaledVector(DRIFT, dist);
    const curl = Math.min(dist / 1.2, 1) * 0.5;
    out.addScaledVector(CURL_U, Math.sin(i * 0.55 + 0.6) * curl);
    out.addScaledVector(CURL_V, Math.cos(i * 0.55) * curl);
    return out;
};

// Trilho de exportação: a própria cadeia (da cauda 3' até a ponta 5'), depois o poro e a linha de tradução.
const EXPORT_IN = porePoint(1, NUCLEUS_R_INNER - 1.6);
const EXPORT_OUT = porePoint(1, NUCLEUS_R + 1.8);
const LINE_A = V(0.2, -5.2, 6.2);
const LINE_B = V(10.8, -4.0, 5.2);

interface Track { pts: THREE.Vector3[]; acc: number[] }
const buildTrack = () => {
    const chain = Array.from({ length: MRNA_N }, (_, i) => transcribedBead(i, 1, new THREE.Vector3()));
    const head = chain[0];
    const guide = new THREE.CatmullRomCurve3([
        head.clone(),
        EXPORT_IN.clone().lerp(head, 0.35),
        EXPORT_IN.clone(),
        porePoint(1, NUCLEUS_R),
        EXPORT_OUT.clone(),
        LINE_A.clone().lerp(EXPORT_OUT, 0.4),
        LINE_A.clone(),
        ...Array.from({ length: 8 }, (_, k) => {
            const u = (k + 1) / 8;
            return LINE_A.clone().lerp(LINE_B, u).add(V(0, Math.sin(u * Math.PI * 2.2) * 0.35, Math.cos(u * Math.PI * 1.7) * 0.3));
        }),
    ], false, 'centripetal');
    const pts: THREE.Vector3[] = [];
    for (let i = MRNA_N - 1; i >= 0; i--) pts.push(chain[i]);
    const guidePts = guide.getSpacedPoints(160);
    pts.push(...guidePts.slice(1));
    const acc = [0];
    for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + pts[i].distanceTo(pts[i - 1]));
    return { pts, acc, headArc: acc[MRNA_N - 1] };
};
const TRACK: Track & { headArc: number } = buildTrack();

const trackAt = (s: number, out: THREE.Vector3) => {
    const { pts, acc } = TRACK;
    const total = acc[acc.length - 1];
    const x = Math.min(Math.max(s, 0), total);
    let lo = 0;
    let hi = acc.length - 1;
    while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (acc[mid] <= x) lo = mid; else hi = mid;
    }
    const span = acc[hi] - acc[lo] || 1;
    return out.copy(pts[lo]).lerp(pts[hi], (x - acc[lo]) / span);
};

/** Escreve as posições do mRNA; devolve quantos nucleotídeos existem. */
export const mrnaBeads = (T: number, out: THREE.Vector3[]) => {
    const pr = smooth(sg(T, W.transcribe));
    const e = ph(T, W.export);
    const total = TRACK.acc[TRACK.acc.length - 1];
    const shift = (total - TRACK.headArc - 0.3) * e;
    let count = 0;
    for (let i = 0; i < MRNA_N; i++) {
        const f = ((i + 1) / MRNA_N) * 0.985;
        if (pr < f) { out[i].set(0, -999, 0); continue; }
        count++;
        if (e <= 0) transcribedBead(i, pr, out[i]);
        else trackAt(TRACK.acc[MRNA_N - 1 - i] + shift, out[i]);
    }
    return count;
};

// ------------------------------------------------------------------ tradução

const finalBeads = Array.from({ length: MRNA_N }, () => new THREE.Vector3());
mrnaBeads(6.9, finalBeads);

/** Ribossomo: percorre o mRNA da ponta 5' (nucleotídeo 0) em direção à 3'. */
export const riboPose = (T: number, out: Pose) => {
    const k = lerp(2.5, 27, ph(T, W.translate));
    const i0 = Math.floor(k);
    const a = finalBeads[i0];
    const b = finalBeads[Math.min(i0 + 1, MRNA_N - 1)];
    out.p.copy(a).lerp(b, k - i0);
    tv.subVectors(finalBeads[Math.min(i0 + 3, MRNA_N - 1)], finalBeads[Math.max(i0 - 3, 0)]).normalize();
    // eixo x local = direção de leitura (5'→3'), y local ≈ para cima
    const m = new THREE.Matrix4();
    const zAxis = tv2.crossVectors(tv, Y).normalize();
    const yAxis = new THREE.Vector3().crossVectors(zAxis, tv).normalize();
    m.makeBasis(tv, yAxis, zAxis);
    out.q.setFromRotationMatrix(m);
    return out;
};

export const riboAssembly = (T: number) => ph(T, W.riboAssemble);

export const PEPTIDE_N = 34;
const EXTENDED = 5;
/** Cadeia polipeptídica: sai estendida pelo túnel e enrola em α-hélice (100° por resíduo) cujo eixo se curva → domínio compacto. */
export const peptideBeads = (T: number, exit: THREE.Vector3, q: THREE.Quaternion, out: THREE.Vector3[]) => {
    const tp = smooth(sg(T, W.translate));
    const fade = 1 - phase(T, 7.0, 7.14);
    let count = 0;
    for (let j = 0; j < PEPTIDE_N; j++) {
        const f = (j + 1) / PEPTIDE_N;
        if (tp < f || fade <= 0) { out[j].set(0, -999, 0); continue; }
        count++;
        const a = (tp - f) * PEPTIDE_N; // idade em resíduos
        if (a < EXTENDED) out[j].set(Math.sin(a * 1.4) * 0.12, a * 0.3, 0);
        else {
            const m = a - EXTENDED;
            const u = m * 0.16 / 1.05; // ângulo ao longo do eixo curvo (raio 1,05)
            tv.set(-Math.sin(u) * 1.05, EXTENDED * 0.3 + (1 - Math.cos(u)) * 1.05 * 0.5, (1 - Math.cos(u)) * 1.05 * 0.85);
            const tw = m * 1.745;
            out[j].set(tv.x + Math.cos(tw) * 0.33, tv.y + Math.sin(tw) * 0.33, tv.z + Math.sin(tw + 1.57) * 0.2);
        }
        out[j].applyQuaternion(q).add(exit);
    }
    return count;
};

/** Ponto de saída do túnel no referencial do ribossomo. */
export const RIBO_EXIT_LOCAL = V(-0.5, 2.15, 0);
export const finalRiboPose = riboPose(7, makePose());

