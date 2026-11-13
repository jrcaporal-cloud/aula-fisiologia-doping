import type { ChamberShape, RingFn } from './chamber';
import { atrialScale, rvShrink, type CardioState } from './flow';
import { BASE_Y, RV_APEX_LIFT, RV_W, RV_WALL, RV_ZS, type AtriumDef } from './layout';
import { longShrink, radialShrink } from './params';

/*
 * Forma de cada câmara no quadro, a partir do estado do circuito. Usado pelas câmaras (Heart) e pelo
 * que se prende nelas (músculos papilares, cordas tendíneas).
 */

export const emptyShape = (keep: ChamberShape['keep']): ChamberShape =>
    ({ cx: 0, yc: 0, rIn: 1, hIn: 1, rOut: 1.2, hOut: 1.2, zs: 1, cutY: 0, keep });

/** VE: a parede vem da ficha (mm); a cavidade contrai com o ciclo e o epicárdio fica parado. */
export const lvShape = (st: CardioState, o: ChamberShape): ChamberShape => {
    const { p, cy } = st;
    o.cx = 0;
    o.yc = p.yc;
    o.rIn = p.rCav * radialShrink(cy.volRatio);
    o.hIn = p.hCav * longShrink(cy.volRatio);
    o.rOut = p.rOut;
    o.hOut = p.hOut;
    o.zs = 1;
    o.cutY = BASE_Y;
    return o;
};

/** Geometria do VE no quadro, lida pelo perfil do VD (função estável: nada aloca por quadro). */
const RV_CTX = { rOut: 3.27, hOut: 4.44, yc: 0.97, k: 1 };

/** Borda esquerda do epicárdio do VE na altura y (o septo visto do lado do VD). */
const septumX = (y: number): number => {
    const q = (y - RV_CTX.yc) / RV_CTX.hOut;
    return -RV_CTX.rOut * Math.sqrt(Math.max(1 - q * q, 0));
};

/**
 * Perfil do VD: um crescente que nasce no septo. A borda do lado do septo fica um pouco DENTRO da
 * parede do VE (o corte do VE, desenhado na frente, cobre a costura), e a parede livre se afasta
 * com a altura — estreito no ápice, largo na base, como no corte de quatro câmaras.
 */
const rvRing: RingFn = (f, inner, out) => {
    const yApex = RV_CTX.yc - RV_CTX.hOut + RV_APEX_LIFT - (inner ? 0 : RV_WALL);
    out.y = yApex + (BASE_Y - yApex) * f;
    const xs = septumX(out.y) + 0.12;
    const w = RV_W * Math.sqrt(f) * (0.85 + 0.15 * f) * RV_CTX.k;
    if (inner) {
        out.r = w / 2;
        out.cx = xs - out.r;
    } else {
        out.r = (w + RV_WALL + 0.05) / 2;
        out.cx = xs + 0.05 - out.r;
    }
    return out;
};

/** VD: crescente encostado no septo; contrai junto, com menos amplitude. */
export const rvShape = (st: CardioState, o: ChamberShape): ChamberShape => {
    RV_CTX.rOut = st.p.rOut;
    RV_CTX.hOut = st.p.hOut;
    RV_CTX.yc = st.p.yc;
    RV_CTX.k = rvShrink(st.cy);
    o.ring = rvRing;
    o.zs = RV_ZS;
    o.cutY = BASE_Y;
    return o;
};

/** Átrio: enche na diástole, encolhe no empurrão atrial; com relaxamento lento ele dilata. */
export const atriumShape = (a: AtriumDef) => (st: CardioState, o: ChamberShape): ChamberShape => {
    const dil = 1 + 0.1 * (1 - st.p.relax);
    const k = atrialScale(st.cy) * dil;
    o.cx = a.x;
    o.yc = a.y + (k - 1) * a.ry * 0.5;
    o.rIn = a.rx * k;
    o.hIn = a.ry * k;
    o.rOut = o.rIn + a.wall;
    o.hOut = o.hIn + a.wall;
    o.zs = 0.9;
    o.cutY = a.floor;
    return o;
};

/** Comprimentos (meridiano, meia-volta, parede) que o shader usa para não esticar o padrão. */
export const shapeLengths = (s: ChamberShape): [number, number, number] =>
    [(s.hOut + s.rOut) * 1.05, Math.PI * s.rOut, s.rOut - s.rIn];
