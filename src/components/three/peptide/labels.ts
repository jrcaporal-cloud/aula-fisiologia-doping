import * as THREE from 'three';
import { V } from '../receptor/layout';
import type { Follow, LabelSpec } from '../receptor/Label3D';
import { alphaPos, arrestinPos, peptidePose, receptorPos, trimerFrame } from './choreo';
import {
    CA_CHANNEL, ER_CENTER, GRANULES, MEM_HALF, PKA_POS, RECEPTOR_X, betaLocal, enzymes, extraTrimers,
    ligandOf, type Side,
} from './layout';
import { PC, PEPTIDE_LIGANDS } from './ligands';

/* Rótulos de cada etapa (aparecem quando a etapa assenta). Posições afinadas com capturas. */

const tq = new THREE.Quaternion();
const tv = new THREE.Vector3();
type Spec = Omit<LabelSpec, 'big'>;

const onPeptide = (s: Side): Follow => (T, c, out) => { peptidePose(s, T, c, out, tq); };
const onAlpha = (s: Side, dy = 0): Follow => (T, _c, out) => { alphaPos(s, s, T, out).y += dy; };
const onArrestin = (s: Side): Follow => (T, _c, out) => { arrestinPos(s, T, out); };
const onReceptor = (s: Side, local: THREE.Vector3): Follow => (T, _c, out) => { receptorPos(s, s, T, out).add(local); };
const at = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];

/** Espelha um rótulo do lado esquerdo (escrito para s = −1) para o lado do ligante. */
const side = (s: Side, spec: Spec): Spec => {
    if (s < 0) return spec;
    return { ...spec, dx: -spec.dx, at: spec.at ? [-spec.at[0], spec.at[1], spec.at[2]] : undefined };
};

const stepLabels = (step: number, s: Side): Spec[] => {
    const L = PEPTIDE_LIGANDS[ligandOf(s)];
    const enz = enzymes(s);
    const tm6Bottom: [number, number, number] = [-(RECEPTOR_X + 1.45), -1.8, 0.4];
    switch (step) {
        case 0:
            return [
                { id: 'pep', text: `Peptídeo (${L.name})`, sub: 'meio extracelular', color: L.color, follow: onPeptide(s), dx: 50 * -s, dy: -20 },
                side(s, { id: 'mem', text: 'Membrana plasmática', color: PC.slate, at: [12.5, MEM_HALF, 1.1], dx: -10, dy: -40 }),
                { id: 'r1', text: 'Receptor de grelina', color: PEPTIDE_LIGANDS.ghrp.color, at: [-RECEPTOR_X, -2.1, 0], dx: -40, dy: 90 },
                { id: 'r2', text: 'Receptor de GHRH', color: PEPTIDE_LIGANDS.ghrh.color, at: [RECEPTOR_X, -2.1, 0], dx: 40, dy: 90 },
                { id: 'gran', text: 'Grânulos de GH', sub: 'citosol', color: PC.crimson, at: at(GRANULES[0].rest), dx: 70, dy: 56 },
            ];
        case 1:
            return [
                side(s, { id: 'pep', text: `Peptídeo (${L.name})`, sub: 'hidrossolúvel, com cargas', color: L.color, at: undefined, dx: -90, dy: 10 }),
                side(s, { id: 'bar', text: 'Barrado na bicamada', sub: 'não atravessa', color: PC.crimson, at: [-0.75, MEM_HALF + 0.3, 1.7], dx: 80, dy: 40 }),
                side(s, { id: 'heads', text: 'Cabeças polares', color: PC.heads, at: [-3.0, MEM_HALF, 1.1], dx: -60, dy: -36 }),
                side(s, { id: 'tails', text: 'Caudas apolares', color: PC.tails, at: [-0.6, -0.2, 1.1], dx: 80, dy: 44 }),
            ].map((l, i) => (i === 0 ? { ...l, follow: onPeptide(s) } : l));
        case 2:
            return [
                side(s, { id: 'pep', text: 'Peptídeo encaixado', sub: 'face de fora', color: L.color, at: [-RECEPTOR_X, 2.2, 0], dx: 90, dy: 30 }),
                side(s, { id: 'tm', text: L.receptor, sub: 'sete hélices transmembrana', color: L.color, at: [-(RECEPTOR_X + 0.9), 0.9, 0.9], dx: -70, dy: -40 }),
                side(s, { id: 'h6', text: 'Hélice 6 se afasta', color: PC.gtp, at: tm6Bottom, dx: -70, dy: 30 }),
                side(s, { id: 'site', text: 'Sítio da proteína G', sub: 'face de dentro', color: L.color, at: [-RECEPTOR_X, -2.5, 0], dx: 70, dy: 50 }),
            ];
        case 3:
            return [
                { id: 'a', text: `Gα${L.gProtein.slice(1)} + GTP`, sub: s < 0 ? 'chega à fosfolipase C' : 'chega à adenilato ciclase', color: L.color, follow: onAlpha(s, 0.6), dx: 50 * -s, dy: -70 },
                side(s, { id: 'bg', text: 'Par βγ', color: PC.beta, at: at(trimerFrame(-1, -1, 3, tv).add(betaLocal(-1))), dx: 40, dy: 60 }),
                side(s, { id: 'enz', text: L.enzyme, color: s < 0 ? '#38BDF8' : '#F59E0B', at: at(enzymes(-1)[0].clone().add(V(-0.3, -0.7, 0.4))), dx: -40, dy: 60 }),
            ];
        case 4:
            return s < 0 ? [
                { id: 'enz', text: 'Fosfolipase C', color: '#38BDF8', at: at(enz[0].clone().add(V(0.4, -0.2, 0.6))), dx: 70, dy: -40 },
                { id: 'ip3', text: 'IP3', sub: 'segundo mensageiro', color: L.messengerColor, at: [-9.6, -4.6, 1.0], dx: -80, dy: 0 },
                { id: 'er', text: 'Retículo endoplasmático', sub: 'canais abertos pelo IP3', color: PC.er, at: at(ER_CENTER.clone().add(V(0.8, -1.0, 1.4))), dx: 90, dy: 40 },
                { id: 'ca', text: 'Ca²⁺ inunda o citosol', color: PC.calcium, at: [-4.2, -5.6, 1.6], dx: 80, dy: 10 },
            ] : [
                { id: 'enz', text: 'Adenilato ciclase', color: '#F59E0B', at: at(enz[0].clone().add(V(-0.4, -0.2, 0.6))), dx: -70, dy: -40 },
                { id: 'camp', text: 'AMPc', sub: 'segundo mensageiro', color: L.messengerColor, at: [9.4, -3.9, 1.6], dx: -90, dy: 20 },
                { id: 'pka', text: 'PKA', sub: 'abre canais de Ca²⁺ · síntese de GH', color: PC.pka, at: at(PKA_POS[0].clone().add(V(-0.4, -0.5, 0.4))), dx: -60, dy: 60 },
                { id: 'ch', text: 'Canal de Ca²⁺', sub: 'o cálcio de fora entra', color: PC.channel, at: at(CA_CHANNEL.clone().add(V(0, -MEM_HALF - 0.3, 0))), dx: -40, dy: 56 },
            ];
        case 5:
            return [
                side(s, { id: 'g', text: `Várias proteínas ${L.gProtein}`, sub: 'o mesmo receptor ativa todas', color: L.color, at: at(extraTrimers(-1)[0].clone().add(V(0, -2.3, 0))), dx: 40, dy: -100 }),
                side(s, { id: 'enz', text: 'Mais enzimas ativas', color: s < 0 ? '#38BDF8' : '#F59E0B', at: at(enzymes(-1)[2].clone().add(V(0, -0.6, 0))), dx: 30, dy: -96 }),
            ];
        case 6:
            return [
                { id: 'fuse', text: 'Grânulo funde à membrana', sub: 'disparado pelo Ca²⁺', color: PC.granule, at: at(GRANULES[0].fuse ?? GRANULES[0].rest), dx: 90, dy: 40 },
                { id: 'gh', text: 'GH sai da célula', sub: 'de uma vez: um pulso', color: PC.crimson, at: [0.6, 2.8, 0.5], dx: 90, dy: 16 },
                { id: 'ca', text: 'Ca²⁺ no citosol', color: PC.calcium, at: [-3.2, -3.6, 1.8], dx: -60, dy: 30 },
            ];
        default:
            return [
                { id: 'arr', text: 'β-arrestina', sub: 'retira o receptor da superfície', color: PC.arrestin, follow: onArrestin(s), dx: 90 * -s, dy: -6 },
                { id: 'rec', text: 'Receptor internalizado', sub: 'sinal apagado', color: L.color, follow: onReceptor(s, V(0, 1.6, 0)), dx: 90 * -s, dy: -30 },
                side(s, { id: 'a', text: 'α hidrolisa o GTP', sub: 'volta a se unir ao βγ', color: L.color, at: [-(RECEPTOR_X + 2.6), -3.2, 1.0], dx: -40, dy: 60 }),
            ];
    }
};

export const peptideLabelsForStep = (step: number, s: Side): LabelSpec[] =>
    stepLabels(step, s).map(l => ({ ...l, big: true }));
