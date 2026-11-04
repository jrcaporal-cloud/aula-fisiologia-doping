import * as THREE from 'three';
import { V } from '../receptor/layout';

/*
 * Layout do circuito (unidades do mundo), visto de frente: ventrículo esquerdo em corte à esquerda,
 * aorta subindo e arco para a direita, artéria de condução com o segmento da placa, leito de
 * resistência na ponta direita e retorno venoso voltando por baixo até o átrio direito.
 *
 * Diferença em relação aos outros dois modelos: T não é uma sequência de eventos, é a soma dos
 * colaterais (T = k → colaterais 1…k instalados). O batimento corre num relógio próprio.
 */

/** Milímetro do laudo → unidade do mundo (parede de 10 mm ≈ 0,85 de mundo). */
export const MM = 0.085;

// ---------- Ventrículo esquerdo ----------
export const VENT_X = -7.5;
/** Plano das valvas: fica parado no ciclo (só o ápice se move). */
export const BASE_Y = 2.2;
/** Semi-eixo vertical / raio equatorial da cavidade (o VE é um elipsoide prolato). */
export const APEX_RATIO = 1.5;
/** Quanto o plano basal fica acima do centro do elipsoide, em fração do semi-eixo diastólico. */
export const BASE_FRAC = 0.35;
/** Cunha retirada na frente (em radianos, φ medido do eixo +x no plano xz): a cavidade fica à vista. */
export const CUT_PHI_START = Math.PI * 0.69;
export const CUT_PHI_LEN = Math.PI * 1.62;

// ---------- Valvas e átrios ----------
// um fio acima do plano basal: no plano exato, a parede da frente tapava a valva
export const MITRAL = V(-9.05, BASE_Y + 0.14, 0);
export const MITRAL_R = 0.92;
export const AORTIC = V(-5.95, BASE_Y + 0.2, 0);
export const AORTIC_R = 0.64;
export const LA_CENTER = V(-9.5, 4.3, -0.35);
export const LA_R = 1.2;
export const RA_CENTER = V(-3.45, -2.0, -0.25);
export const RA_R = 1.25;

// ---------- Circuito ----------
export type Kind = 'cavidade' | 'aorta' | 'arteria' | 'arteriola' | 'veia' | 'pulmonar';

export interface FlowNode {
    p: THREE.Vector3;
    /** Raio de referência do vaso (diástole, sem placa). */
    r: number;
    kind: Kind;
}

/**
 * Nós do circuito fechado, na ordem do fluxo. A cavidade entra como caminho (invisível) para as
 * hemácias atravessarem o ventrículo; os outros trechos também são a linha média dos tubos.
 */
export const FLOW_NODES: readonly FlowNode[] = [
    // valva aórtica → aorta ascendente → arco
    { p: V(-5.95, 2.7, 0), r: 0.6, kind: 'aorta' },
    { p: V(-5.8, 4.1, -0.1), r: 0.62, kind: 'aorta' },
    { p: V(-5.25, 5.6, -0.15), r: 0.62, kind: 'aorta' },
    { p: V(-4.1, 6.65, -0.15), r: 0.6, kind: 'aorta' },
    { p: V(-2.2, 6.95, -0.1), r: 0.58, kind: 'aorta' },
    { p: V(-0.5, 6.2, 0), r: 0.55, kind: 'aorta' },
    { p: V(0.5, 4.85, 0), r: 0.52, kind: 'aorta' },
    // artéria de condução indo para a direita
    { p: V(1.2, 3.5, 0), r: 0.5, kind: 'arteria' },
    { p: V(2.7, 2.8, 0), r: 0.48, kind: 'arteria' },
    { p: V(4.7, 2.45, 0), r: 0.46, kind: 'arteria' },
    { p: V(6.6, 2.3, 0), r: 0.45, kind: 'arteria' },
    // segmento da placa (x ≈ 7…9)
    { p: V(8.0, 2.2, 0), r: 0.45, kind: 'arteria' },
    { p: V(9.4, 2.05, 0), r: 0.44, kind: 'arteria' },
    // leito de resistência
    { p: V(10.8, 1.4, 0), r: 0.3, kind: 'arteriola' },
    { p: V(11.5, 0.2, 0), r: 0.22, kind: 'arteriola' },
    { p: V(11.1, -1.0, 0), r: 0.22, kind: 'arteriola' },
    { p: V(10.0, -1.95, 0), r: 0.3, kind: 'arteriola' },
    // retorno venoso por baixo
    { p: V(7.8, -2.9, -0.1), r: 0.6, kind: 'veia' },
    { p: V(4.3, -3.45, -0.1), r: 0.62, kind: 'veia' },
    { p: V(0.4, -3.6, -0.1), r: 0.64, kind: 'veia' },
    { p: V(-2.5, -3.1, -0.15), r: 0.62, kind: 'veia' },
    // átrio direito → circulação pulmonar (atrás da cena) → átrio esquerdo
    { p: V(-3.45, -2.0, -0.25), r: 0.6, kind: 'veia' },
    { p: V(-2.4, 0.6, -3.4), r: 0.44, kind: 'pulmonar' },
    { p: V(-3.7, 4.2, -4.0), r: 0.42, kind: 'pulmonar' },
    { p: V(-6.8, 5.7, -3.2), r: 0.42, kind: 'pulmonar' },
    { p: V(-9.3, 4.6, -1.0), r: 0.46, kind: 'pulmonar' },
    // átrio esquerdo → valva mitral → cavidade
    { p: V(-9.1, 2.6, 0), r: 0.6, kind: 'cavidade' },
    { p: V(-9.0, 1.1, 0), r: 0.8, kind: 'cavidade' },
    { p: V(-8.6, -0.7, 0), r: 0.8, kind: 'cavidade' },
    { p: V(-7.8, -1.75, 0), r: 0.7, kind: 'cavidade' },
    { p: V(-7.0, -1.6, 0), r: 0.7, kind: 'cavidade' },
    { p: V(-6.3, -0.2, 0), r: 0.8, kind: 'cavidade' },
    { p: V(-6.05, 1.9, 0), r: 0.6, kind: 'cavidade' },
];

/** Janela da lesão ao longo da artéria, em fração do trecho arterial (0 = início, 1 = fim). */
export const PLAQUE_U = 0.62;
export const PLAQUE_W = 0.17;
/** Centro da lesão no mundo (ancora rótulo, blob e anel de endotélio). */
export const PLAQUE_AT = V(8.0, 2.2, 0);
export const ENDO_AT = V(6.1, 2.36, 0);

/** Quantidade de hemácias desenhadas (o hematócrito acende uma fração delas). */
export const CELL_N = 820;
/** Hematócrito que corresponde a todas as hemácias acesas. */
export const HCT_FULL = 55;

/** Estrias de fibrose no miocárdio (posições-semente em (α, φ) da casca). */
export const FIBROSE_N = 46;
