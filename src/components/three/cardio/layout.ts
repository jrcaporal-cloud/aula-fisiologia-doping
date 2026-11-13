import * as THREE from 'three';
import { V } from '../receptor/layout';

/*
 * Layout do circuito (unidades do mundo). Linguagem visual: uma PEÇA ANATÔMICA EM CORTE CORONAL.
 * Tudo — coração e vasos — está cortado no mesmo plano frontal e só a metade de trás é desenhada,
 * como na bancada de anatomia: a espessura da parede aparece em cada borda de corte, e o sangue
 * corre à vista dentro das câmaras e da luz dos vasos.
 *
 * Coração: corte de quatro câmaras (o mesmo plano do ecocardiograma apical), com o eixo longo
 * inclinado como no tórax (ápice para a esquerda do paciente = direita da tela). Ventrículo
 * esquerdo à direita, septo, ventrículo direito à esquerda, átrios em cima. A aorta sai do VE entre
 * os átrios, faz o arco e vira a artéria que segue para a direita até o leito de resistência; o
 * retorno venoso volta por baixo e sobe pela veia cava até o átrio direito. A circulação pulmonar
 * passa por trás do coração (esquemática, ao fundo).
 *
 * As câmaras são desenhadas num referencial próprio do coração ("local", eixo longo = +y) dentro de
 * um grupo inclinado; `toWorld` converte.
 */

/** Milímetro do laudo → unidade do mundo (parede de 10 mm ≈ 0,85). */
export const MM = 0.085;

// ---------- coração (referencial local) ----------
export const HEART_POS = V(-5.5, 0, 0);
/** Inclinação do eixo longo (rad): o ápice aponta para a direita e para baixo. */
export const HEART_TILT = 0.38;
/** O coração é o protagonista: desenhado maior que a escala dos vasos (a peça é esquemática). */
export const HEART_SCALE = 1.2;
const COS_T = Math.cos(HEART_TILT) * HEART_SCALE;
const SIN_T = Math.sin(HEART_TILT) * HEART_SCALE;

/** Referencial local do coração → mundo. */
export const toWorld = (x: number, y: number, z: number, out: THREE.Vector3): THREE.Vector3 =>
    out.set(x * COS_T - y * SIN_T + HEART_POS.x, x * SIN_T + y * COS_T + HEART_POS.y, z * HEART_SCALE + HEART_POS.z);

/** Mundo → referencial local do coração. */
export const toLocal = (p: THREE.Vector3, out: THREE.Vector3): THREE.Vector3 => {
    const k = HEART_SCALE * HEART_SCALE;
    const x = p.x - HEART_POS.x;
    const y = p.y - HEART_POS.y;
    return out.set((x * COS_T + y * SIN_T) / k, (-x * SIN_T + y * COS_T) / k, (p.z - HEART_POS.z) / HEART_SCALE);
};

/** Atalho para posições fixas definidas no referencial local. */
export const W = (x: number, y: number, z = 0): THREE.Vector3 => toWorld(x, y, z, new THREE.Vector3());

// ---------- ventrículo esquerdo (local) ----------
/** Plano das valvas atrioventriculares: fica parado no ciclo (só o ápice se move). */
export const BASE_Y = 2.2;
/** Semi-eixo vertical / raio equatorial da cavidade (o VE é um elipsoide prolato). */
export const APEX_RATIO = 1.5;
/** Quanto o plano basal fica acima do centro do elipsoide, em fração do semi-eixo diastólico. */
export const BASE_FRAC = 0.35;

// ---------- ventrículo direito (local): crescente encostado no septo ----------
/** Largura máxima da cavidade (na base) e espessura da parede livre. */
export const RV_W = 2.3;
export const RV_WALL = 0.4;
/** O ápice do VD fica acima do ápice do VE. */
export const RV_APEX_LIFT = 1.6;
/** Profundidade da metade de trás em relação ao raio (o VD é achatado). */
export const RV_ZS = 0.8;
/** Septo, aproximado, para o caminho das hemácias contrair em direção a ele. */
export const RV_SEPTUM_X = -3.1;

// ---------- átrios (local) ----------
export interface AtriumDef { x: number; y: number; rx: number; ry: number; wall: number; floor: number }
export const LA: AtriumDef = { x: 1.25, y: 3.4, rx: 1.55, ry: 1.25, wall: 0.17, floor: BASE_Y + 0.08 };
export const RA: AtriumDef = { x: -4.35, y: 3.3, rx: 1.4, ry: 1.2, wall: 0.15, floor: BASE_Y + 0.08 };

// ---------- valvas (local) ----------
export interface ValveDef { x: number; y: number; r: number }
export const MITRAL: ValveDef = { x: 1.2, y: BASE_Y + 0.04, r: 0.82 };
export const TRICUSPID: ValveDef = { x: -4.2, y: BASE_Y + 0.04, r: 0.8 };
export const AORTIC: ValveDef = { x: -1.3, y: BASE_Y + 0.18, r: 0.6 };

// ---------- circuito ----------
export type Kind = 'aorta' | 'arteria' | 'arteriola' | 'veia' | 'atrioD' | 'vd' | 'pulmonar' | 'atrioE' | 'cavidade';

/** Trechos que vivem dentro do coração: o caminho acompanha a câmara que bate. */
export const HEART_KINDS: ReadonlySet<Kind> = new Set<Kind>(['atrioD', 'vd', 'atrioE', 'cavidade']);

export interface FlowNode {
    p: THREE.Vector3;
    /** Raio da luz de referência (diástole, sem placa). */
    r: number;
    kind: Kind;
}

const N = (p: THREE.Vector3, r: number, kind: Kind): FlowNode => ({ p, r, kind });

/** Nós do circuito fechado, na ordem do fluxo, começando na valva aórtica. */
export const FLOW_NODES: readonly FlowNode[] = [
    // aorta ascendente (sai do VE entre os átrios) → arco
    N(W(-1.3, 2.55), 0.6, 'aorta'),
    N(W(-1.35, 3.6), 0.62, 'aorta'),
    N(W(-1.25, 4.7), 0.62, 'aorta'),
    N(V(-8.7, 5.9, 0), 0.62, 'aorta'),
    N(V(-7.6, 7.25, 0), 0.6, 'aorta'),
    N(V(-5.8, 7.95, 0), 0.58, 'aorta'),
    N(V(-3.7, 7.85, 0), 0.56, 'aorta'),
    N(V(-1.9, 7.1, 0), 0.54, 'aorta'),
    N(V(-0.55, 5.95, 0), 0.52, 'aorta'),
    // artéria de condução (com o segmento da placa no meio)
    N(V(0.6, 5.0, 0), 0.48, 'arteria'),
    N(V(2.0, 4.4, 0), 0.47, 'arteria'),
    N(V(3.4, 4.0, 0), 0.46, 'arteria'),
    N(V(4.7, 3.7, 0), 0.45, 'arteria'),
    N(V(5.9, 3.35, 0), 0.44, 'arteria'),
    N(V(6.85, 2.85, 0), 0.4, 'arteria'),
    // leito de resistência
    N(V(7.7, 2.1, 0), 0.24, 'arteriola'),
    N(V(8.2, 0.9, 0), 0.2, 'arteriola'),
    N(V(8.3, -0.4, 0), 0.2, 'arteriola'),
    N(V(7.9, -1.6, 0), 0.22, 'arteriola'),
    N(V(7.1, -2.65, 0), 0.26, 'arteriola'),
    // retorno venoso por baixo do coração → veia cava → átrio direito
    N(V(5.8, -3.7, 0), 0.5, 'veia'),
    N(V(3.3, -4.6, 0), 0.56, 'veia'),
    N(V(0.3, -5.2, 0), 0.58, 'veia'),
    N(V(-2.8, -5.5, 0), 0.6, 'veia'),
    N(V(-6.0, -5.55, 0), 0.6, 'veia'),
    N(V(-9.2, -5.35, 0), 0.62, 'veia'),
    N(V(-12.1, -4.6, 0), 0.62, 'veia'),
    N(V(-14.0, -3.0, 0), 0.62, 'veia'),
    N(V(-14.65, -1.1, 0), 0.62, 'veia'),
    N(V(-14.45, 0.55, 0), 0.6, 'veia'),
    N(V(-13.75, 1.3, 0), 0.58, 'veia'),
    // átrio direito → valva tricúspide → ventrículo direito
    N(W(-4.75, 3.2), 0.62, 'atrioD'),
    N(W(-4.35, 2.6), 0.6, 'atrioD'),
    N(W(-4.4, 1.7), 0.55, 'vd'),
    N(W(-4.3, 0.6), 0.5, 'vd'),
    N(W(-3.75, -0.3), 0.42, 'vd'),
    N(W(-3.4, -0.85), 0.36, 'vd'),
    N(W(-3.25, -0.2), 0.4, 'vd'),
    N(W(-3.35, 0.9), 0.48, 'vd'),
    N(W(-3.45, 1.95), 0.5, 'vd'),
    // via de saída do VD → tronco pulmonar → pulmões (por trás) → veias pulmonares → átrio esquerdo
    N(W(-3.6, 2.7, -0.4), 0.42, 'pulmonar'),
    N(V(-10.0, 3.3, -2.4), 0.42, 'pulmonar'),
    N(V(-9.4, 5.5, -4.2), 0.42, 'pulmonar'),
    N(V(-7.2, 6.8, -4.6), 0.42, 'pulmonar'),
    N(V(-5.0, 6.4, -4.0), 0.42, 'pulmonar'),
    N(V(-4.5, 5.4, -2.4), 0.42, 'pulmonar'),
    N(W(1.4, 4.25, -0.7), 0.6, 'atrioE'),
    N(W(1.25, 3.2), 0.62, 'atrioE'),
    // valva mitral → cavidade do VE (desce pela parede livre, contorna o ápice, sobe pelo septo)
    N(W(1.2, 2.0), 0.6, 'cavidade'),
    N(W(1.35, 0.9), 0.7, 'cavidade'),
    N(W(1.35, -0.6), 0.7, 'cavidade'),
    N(W(0.9, -1.75), 0.62, 'cavidade'),
    N(W(0.0, -2.0), 0.55, 'cavidade'),
    N(W(-0.8, -1.55), 0.62, 'cavidade'),
    N(W(-1.25, -0.1), 0.7, 'cavidade'),
    N(W(-1.35, 1.4), 0.65, 'cavidade'),
    N(W(-1.3, 2.15), 0.55, 'cavidade'),
];

/** Espessura da parede de cada trecho de vaso (o corte mostra a parede). */
export const WALL: Record<Kind, number> = {
    aorta: 0.17, arteria: 0.13, arteriola: 0.09, veia: 0.06, pulmonar: 0.08,
    atrioD: 0, vd: 0, atrioE: 0, cavidade: 0,
};

/** Janela da lesão ao longo da artéria, em fração do trecho arterial (0 = início, 1 = fim). */
export const PLAQUE_U = 0.42;
export const PLAQUE_W = 0.16;

/** Quantidade de hemácias desenhadas (o hematócrito acende uma fração delas). */
export const CELL_N = 1400;
/** Hematócrito que corresponde a todas as hemácias acesas (topo do deslizador). */
export const HCT_FULL = 60;
