import * as THREE from 'three';
import { MRNA_N, arPose, dimerFrame, finalRiboPose, ligandPose, makePose, mrnaBeads, rnapPose } from './choreo';
import { ARE_Z, DNA_CENTER, NUCLEUS_CENTER, NUCLEUS_R, SARC_CENTER, SARC_HALF, V, porePoint } from './layout';
import { LIGANDS } from './ligandInfo';
import type { LigandKind } from './molecules';
import type { Follow, LabelSpec } from './Label3D';

/* Rótulos de cada etapa (aparecem quando a etapa assenta). Posições afinadas com capturas. */

const pose = makePose();
const tmp = new THREE.Vector3();
const beads = Array.from({ length: MRNA_N }, () => new THREE.Vector3());

const onLigand = (i: number): Follow => (T, c, out) => { out.copy(ligandPose(i, T, c, pose).p); };
const onAR = (i: number, local: THREE.Vector3): Follow => (T, c, out) => {
    arPose(i, T, c, pose);
    out.copy(local).applyQuaternion(pose.q).add(pose.p);
};
const onDimer = (local: THREE.Vector3): Follow => (T, _c, out) => {
    dimerFrame(T, pose);
    out.copy(local).applyQuaternion(pose.q).add(pose.p);
};
const at = (v: THREE.Vector3): [number, number, number] => [v.x, v.y, v.z];

const C = {
    cyan: '#22D3EE', amber: '#FBBF24', orange: '#FB923C', violet: '#A78BFA', blue: '#60A5FA',
    pink: '#F472B6', teal: '#2DD4BF', magenta: '#E879F9', yellow: '#FDE047', red: '#F87171', slate: '#CBD5E1',
};

export const labelsForStep = (step: number, ligand: LigandKind): LabelSpec[] => {
    const L = LIGANDS[ligand];
    switch (step) {
        case 0:
            return [
                { id: 'mem', text: 'Membrana plasmática', color: C.slate, at: [14.0, 7.6, 0], dx: -30, dy: -44 },
                { id: 'lig', text: L.name, sub: 'meio extracelular', color: L.color, follow: onLigand(0), dx: -50, dy: -64 },
                { id: 'ar', text: 'Receptor androgênico + HSP90', sub: 'citosol', color: C.orange, follow: onAR(0, V(0, 2.4, 0)), dx: -30, dy: -78 },
                { id: 'nuc', text: 'Núcleo', sub: 'envelope nuclear em corte', color: C.violet, at: at(V(0.55, -0.62, 0.56).normalize().multiplyScalar(NUCLEUS_R).add(NUCLEUS_CENTER)), dx: -40, dy: 50 },
                { id: 'dna', text: 'DNA', color: C.blue, at: [DNA_CENTER.x, DNA_CENTER.y - 1.2, 7.5], dx: -60, dy: 40 },
                { id: 'sarc', text: 'Miofibrila (sarcômero)', color: C.red, at: [SARC_CENTER.x - 3, SARC_CENTER.y - 3.2, SARC_CENTER.z], dx: -40, dy: 40 },
            ];
        case 1:
            return [
                { id: 'lig', text: L.name, sub: 'apolar → atravessa por difusão simples', color: L.color, follow: onLigand(0), dx: -40, dy: -84 },
                { id: 'heads', text: 'Cabeças polares', color: C.blue, at: [15.55, 3.3, 2.9], dx: 60, dy: -50 },
                { id: 'tails', text: 'Caudas apolares (lipofílicas)', color: C.amber, at: [14.85, -1.6, 2.9], dx: 70, dy: 46 },
                { id: 'cyt', text: 'Citosol', color: C.slate, at: [12.3, -3.4, 2.4], dx: -40, dy: 40 },
            ];
        case 2:
            return [
                { id: 'lig', text: `${L.short} no bolsão`, sub: L.relative === 3 ? 'liga-se ao AR 3x mais forte' : L.relative === 1 ? 'ligante de referência' : 'conformação diferente do LBD', color: L.color, follow: onAR(0, V(0.4, 0.1, 0)), dx: 140, dy: 20 },
                { id: 'h12', text: ligand === 'sarm' ? 'Hélice 12 em outra conformação' : 'Hélice 12 fecha (tampa)', color: C.cyan, follow: onAR(0, V(2.0, 0.9, -0.3)), dx: 110, dy: -70 },
                { id: 'lbd', text: 'Domínio de ligação (LBD)', color: C.orange, follow: onAR(0, V(-0.4, 1.7, 1.6)), dx: -60, dy: -40 },
                { id: 'hsp', text: 'HSP90 / HSP70 se dissociam', color: C.violet, follow: onAR(0, V(-4.4, 1.0, 2.2)), dx: 40, dy: 110 },
            ];
        case 3:
            return [
                { id: 'dim', text: 'Dímero AR–ligante', sub: 'dimerização homóloga', color: C.orange, follow: onDimer(V(0, 2.4, 0)), dx: -40, dy: -80 },
                { id: 'nls', text: 'NLS exposto', sub: 'sinal de localização nuclear', color: C.cyan, follow: onDimer(V(0.8, -1.7, 2.2)), dx: 70, dy: 50 },
            ];
        case 4:
            return [
                { id: 'pore', text: 'Complexo do poro nuclear', color: C.violet, at: at(porePoint(0, NUCLEUS_R).add(V(0.3, 3.1, 0))), dx: 50, dy: -60 },
                { id: 'dim', text: 'Dímero entra no núcleo', sub: 'transporte ativo', color: C.orange, follow: onDimer(V(0, -1.6, 0)), dx: -70, dy: 70 },
                { id: 'cyt', text: 'Citoplasma', color: C.slate, at: at(porePoint(0, NUCLEUS_R + 4).add(V(0, -3.5, 3))), dx: 40, dy: 40 },
                { id: 'np', text: 'Nucleoplasma', color: C.slate, at: at(porePoint(0, NUCLEUS_R - 4).add(V(0, -3.5, 3))), dx: -40, dy: 40 },
            ];
        case 5: {
            rnapPose(5, tmp);
            return [
                { id: 'are', text: 'ARE', sub: 'elemento de resposta androgênica', color: C.magenta, at: [DNA_CENTER.x + 0.6, DNA_CENTER.y - 1.1, ARE_Z + 1.2], dx: -70, dy: 64 },
                { id: 'dim', text: 'Dímero AR–ligante', color: C.orange, follow: onDimer(V(0, 1.4, -2.2)), dx: -80, dy: -40 },
                { id: 'src', text: 'Coativador SRC-1', color: C.teal, follow: onDimer(V(0.3, 3.1, 0)), dx: 40, dy: -60 },
                { id: 'pol', text: 'RNA polimerase II', color: C.slate, at: at(tmp.clone().add(V(0.6, 1.7, 1.2))), dx: 70, dy: -30 },
            ];
        }
        case 6: {
            rnapPose(6, tmp);
            mrnaBeads(6, beads);
            return [
                { id: 'pol', text: 'RNA polimerase II', sub: 'desliza sobre a fita-molde', color: C.slate, at: at(tmp.clone().add(V(-0.6, 1.6, 0.6))), dx: 50, dy: -70 },
                { id: 'bub', text: 'Bolha de transcrição', sub: 'dupla-hélice aberta localmente', color: C.blue, at: at(tmp.clone().add(V(1.2, 0.4, -1.6))), dx: 90, dy: -10 },
                { id: 'mrna', text: 'mRNA', sub: 'actina · miosina pesada', color: C.pink, at: at(beads[6]), dx: 60, dy: -50 },
                { id: 'are', text: 'ARE + dímero', color: C.magenta, at: [DNA_CENTER.x, DNA_CENTER.y - 1.2, ARE_Z], dx: -60, dy: 50 },
            ];
        }
        case 7: {
            const rp = finalRiboPose.p;
            return [
                { id: 'pore', text: 'Poro nuclear: saída do mRNA', color: C.violet, at: at(porePoint(1, NUCLEUS_R + 0.3)), dx: 40, dy: 70 },
                { id: 'ribo', text: 'Ribossomo', sub: 'subunidades maior e menor', color: C.blue, at: at(rp.clone().add(V(0.6, 2.2, 0.6))), dx: 60, dy: -64 },
                { id: 'pep', text: 'Cadeia polipeptídica', sub: 'cresce e se dobra', color: C.yellow, at: at(rp.clone().add(V(-1.4, 3.6, 0.6))), dx: -70, dy: -50 },
                { id: 'mrna', text: 'mRNA', color: C.pink, at: [9.0, -4.3, 4.6], dx: 40, dy: 50 },
            ];
        }
        default:
            return [
                { id: 'z', text: 'Linha Z', color: C.slate, at: [SARC_CENTER.x - SARC_HALF, SARC_CENTER.y + 2.6, SARC_CENTER.z], dx: -50, dy: -40 },
                { id: 'act', text: 'Actina', sub: 'filamento fino', color: C.red, at: [SARC_CENTER.x + 3.6, SARC_CENTER.y - 1.4, SARC_CENTER.z + 1.6], dx: 60, dy: 60 },
                { id: 'myo', text: 'Miosina pesada', sub: 'filamento grosso', color: C.slate, at: [SARC_CENTER.x - 1.2, SARC_CENTER.y + 0.3, SARC_CENTER.z + 1.4], dx: -60, dy: 70 },
                { id: 'new', text: 'Novos filamentos', sub: 'fibra mais espessa = hipertrofia', color: C.yellow, at: [SARC_CENTER.x - 2, SARC_CENTER.y + 2.6, SARC_CENTER.z + 0.6], dx: -50, dy: -70 },
                { id: 'ring', text: 'Diâmetro inicial', color: C.cyan, at: [SARC_CENTER.x + SARC_HALF + 0.12, SARC_CENTER.y - 1.5, SARC_CENTER.z + 1.0], dx: 60, dy: 40 },
            ];
    }
};
