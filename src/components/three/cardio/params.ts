import { cardioVitalsAt, type CardioVitals } from '../../../data/cardioSteps';
import { clamp01, lerp, smooth } from '../receptor/layout';
import { APEX_RATIO, BASE_FRAC, BASE_Y, MM } from './layout';

/*
 * Da ficha clínica para a geometria. Tudo o que a cena desenha vem de `cardioVitalsAt`: a parede e a
 * cavidade saem em milímetros, a pressão vira distensão (e rigidez), o hematócrito vira densidade de
 * hemácias e a viscosidade vira velocidade. Nada de número inventado aqui.
 *
 * `mix` (0 = em uso, 1 = depois de parar) é animado pelo gsap quando o seletor troca, para o circuito
 * transitar em vez de pular.
 */

export interface CardioParams {
    /** Valores da ficha já interpolados em T e entre as duas fases. */
    v: CardioVitals;
    /** Cavidade em diástole: raio equatorial e semi-eixo vertical. */
    rCav: number;
    hCav: number;
    /** Espessura da parede (cresce para dentro: o epicárdio quase não se move). */
    wall: number;
    /** Epicárdio: raio e semi-eixo, fixos no ciclo. */
    rOut: number;
    hOut: number;
    /** Centro vertical do elipsoide (o plano das valvas fica em BASE_Y). */
    yc: number;
    /** 0…1 — perda de complacência arterial: pressão alta distende menos. */
    rigidez: number;
    /**
     * 0…1 derivado de `eLinha` (E′ do Doppler tecidual, cm/s): 1 = relaxa normalmente,
     * 0 = relaxa devagar. É o que divide o enchimento entre a fase passiva e o empurrão do átrio.
     */
    relax: number;
    /**
     * Frequência do batimento em Hz: 0,85 (≈51 bpm) a 1,05 (≈63 bpm), subindo junto com a pressão.
     * Acompanha a atividade simpática aumentada, que é o mecanismo com melhor suporte humano para a
     * elevação da pressão nesses usuários. Não é taquicardia, e a frequência não aparece no painel.
     */
    hz: number;
}

export const emptyParams = (): CardioParams => ({
    v: cardioVitalsAt(0, 'uso'),
    rCav: 1, hCav: 1, wall: 1, rOut: 1, hOut: 1, yc: 0, rigidez: 0, relax: 1, hz: 1,
});

/** Referência de E′ normal (cm/s): abaixo disso o relaxamento já é lento. */
export const E_LINHA_REF = 10;

const mixVitals = (a: CardioVitals, b: CardioVitals, k: number, out: CardioVitals): CardioVitals => {
    out.paredeMm = lerp(a.paredeMm, b.paredeMm, k);
    out.cavidadeMm = lerp(a.cavidadeMm, b.cavidadeMm, k);
    out.paSist = lerp(a.paSist, b.paSist, k);
    out.paDiast = lerp(a.paDiast, b.paDiast, k);
    out.fe = lerp(a.fe, b.fe, k);
    out.eLinha = lerp(a.eLinha, b.eLinha, k);
    out.hct = lerp(a.hct, b.hct, k);
    out.hdl = lerp(a.hdl, b.hdl, k);
    out.ldl = lerp(a.ldl, b.ldl, k);
    out.viscosidade = lerp(a.viscosidade, b.viscosidade, k);
    out.placa = lerp(a.placa, b.placa, k);
    out.fibrose = lerp(a.fibrose, b.fibrose, k);
    return out;
};

/** Escreve em `out` (reaproveitado por quadro) a geometria derivada dos valores da ficha em T. */
export const cardioParams = (T: number, mix: number, out: CardioParams): CardioParams => {
    const v = mixVitals(cardioVitalsAt(T, 'uso'), cardioVitalsAt(T, 'apos'), clamp01(mix), out.v);
    out.rCav = (v.cavidadeMm * MM) / 2;
    out.hCav = out.rCav * APEX_RATIO;
    out.wall = v.paredeMm * MM;
    out.rOut = out.rCav + out.wall;
    out.hOut = out.hCav + out.wall;
    out.yc = BASE_Y - BASE_FRAC * out.hCav;
    out.rigidez = clamp01((v.paSist - 118) / 34);
    out.relax = clamp01((v.eLinha - 8.6) / 3);
    out.hz = 0.85 + clamp01((v.paSist - 118) / 26) * 0.2;
    return out;
};

// ------------------------------------------------------------------ ciclo cardíaco

/** Fração do ciclo ocupada pela sístole. */
export const SYS = 0.36;
/** Onda de enchimento passivo, com relaxamento normal (rápida e precoce) e lento (tardia e arrastada). */
const E_FAST: readonly [number, number] = [0.16, 0.1];
const E_SLOW: readonly [number, number] = [0.31, 0.17];
/** Onda atrial, no fim da diástole. */
const A_AT = 0.86;
const A_SD = 0.07;
const TABLE = 96;

const bell = (x: number, at: number, sd: number) => Math.exp(-((x - at) * (x - at)) / (2 * sd * sd));

/** Acumuladas normalizadas das ondas E e A: evitam integrar o enchimento por quadro. */
const cumulative = (at: number, sd: number): Float32Array => {
    const c = new Float32Array(TABLE + 1);
    let s = 0;
    for (let i = 1; i <= TABLE; i++) {
        s += bell((i - 0.5) / TABLE, at, sd);
        c[i] = s;
    }
    for (let i = 0; i <= TABLE; i++) c[i] /= s;
    return c;
};
const CUM_E_FAST = cumulative(E_FAST[0], E_FAST[1]);
const CUM_E_SLOW = cumulative(E_SLOW[0], E_SLOW[1]);
const CUM_A = cumulative(A_AT, A_SD);
const peakOf = (sd: number) => 1 / (sd * Math.sqrt(2 * Math.PI));

const readCum = (tab: Float32Array, x: number) => {
    const u = clamp01(x) * TABLE;
    const i = Math.min(Math.floor(u), TABLE - 1);
    return lerp(tab[i], tab[i + 1], u - i);
};

export interface CycleState {
    /** Posição no ciclo, 0…1 (0 = início da sístole). */
    c: number;
    systole: boolean;
    /** Volume atual da cavidade / volume no fim da diástole. */
    volRatio: number;
    /** 0 = fechada, 1 = totalmente aberta. */
    mitral: number;
    aortic: number;
    /** Velocidade instantânea de entrada e de saída de sangue (0…1). */
    inflow: number;
    outflow: number;
    /** Força da contração atrial agora (onda A). */
    atrial: number;
    /** Onda de pressão que parte da raiz da aorta. */
    pulse: number;
}

export const emptyCycle = (): CycleState => ({
    c: 0, systole: true, volRatio: 1, mitral: 0, aortic: 0, inflow: 0, outflow: 0, atrial: 0, pulse: 0,
});

/**
 * Relógio próprio do coração: corre do começo ao fim, independente de T. A fração ejetada vem de `fe`;
 * a divisão do enchimento entre a fase passiva e o empurrão do átrio vem de E′ (via `relax`) — com
 * relaxamento lento, a fase passiva atrasa e encurta, e o átrio completa o volume no fim da diástole.
 */
export const cardiacCycle = (clock: number, p: CardioParams, reduced: boolean, out: CycleState): CycleState => {
    const fe = p.v.fe / 100;
    const wE = 0.34 + 0.46 * p.relax;
    const wA = 1 - wE;
    const c = (clock * p.hz) % 1;
    out.c = c;
    out.systole = c < SYS;

    if (out.systole) {
        const cs = c / SYS;
        const ej = smooth(clamp01(cs / 0.72));
        out.volRatio = 1 - fe * ej;
        out.outflow = bell(cs, 0.34, 0.2);
        out.inflow = 0;
        out.mitral = 0;
        out.aortic = smooth(clamp01((cs - 0.05) / 0.12)) * (1 - smooth(clamp01((cs - 0.78) / 0.16)));
        out.atrial = 0;
        out.pulse = bell(cs, 0.3, 0.19);
    } else {
        const cd = (c - SYS) / (1 - SYS);
        const eCum = lerp(readCum(CUM_E_SLOW, cd), readCum(CUM_E_FAST, cd), p.relax);
        const eAt = lerp(E_SLOW[0], E_FAST[0], p.relax);
        const eSd = lerp(E_SLOW[1], E_FAST[1], p.relax);
        const aRate = bell(cd, A_AT, A_SD) * peakOf(A_SD);
        const fill = wE * eCum + wA * readCum(CUM_A, cd);
        const rate = wE * bell(cd, eAt, eSd) * peakOf(eSd) + wA * aRate;
        out.volRatio = 1 - fe * (1 - fill);
        out.inflow = clamp01(rate / 3.2);
        out.outflow = 0;
        out.mitral = clamp01(0.1 + rate / 2.6);
        out.aortic = 0;
        out.atrial = clamp01((wA * aRate) / 3.2);
        out.pulse = 0.22 * Math.exp(-cd * 2.6);
    }

    if (reduced) {
        // prefers-reduced-motion: o batimento fica mínimo, mas as valvas ainda contam a história
        out.volRatio = 1 - (1 - out.volRatio) * 0.3;
        out.mitral *= 0.65;
        out.aortic *= 0.65;
        out.pulse *= 0.3;
    }
    return out;
};

/** Onda de pressão na posição `c` do ciclo (serve para atrasá-la ao longo da árvore arterial). */
export const pulseWave = (c: number): number => {
    const x = ((c % 1) + 1) % 1;
    return x < SYS ? bell(x / SYS, 0.3, 0.19) : 0.22 * Math.exp(-((x - SYS) / (1 - SYS)) * 2.6);
};

/** Encurtamento radial e longitudinal que dão o volume `volRatio` (R²·h ∝ volume). */
export const radialShrink = (volRatio: number) => Math.pow(volRatio, 0.42);
export const longShrink = (volRatio: number) => Math.pow(volRatio, 0.16);
