import { bubbleState, ligandPose, makePose } from './choreo';
import { DNA_CENTER, W, memX, ph, seg, sg, smooth } from './layout';
import { RC_U } from './shaders';

/*
 * Sinais da coreografia para os shaders: tudo derivado do tempo da aula T (as mesmas janelas W da
 * coreografia) e escrito uma vez por quadro nas uniformes compartilhadas RC_U. Sem alocação.
 */

const pose = makePose();
const bubble = { z: 0, open: 0 };
const bump = (T: number, a: number, b: number): number => Math.sin(Math.PI * seg(T, a, b));

export const updateShaderSignals = (T: number, clock: number, reduced: boolean): void => {
    RC_U.uTime.value = reduced ? 0 : clock;

    // ligante atravessando a bicamada (mesma medida de "dentro" do empurrão dos lipídios)
    for (let i = 0; i < 2; i++) {
        const out = RC_U.uLig.value[i];
        if (T > 1.3) { out.w = 0; continue; }
        const p = ligandPose(i, T, clock, pose).p;
        const inside = 1 - Math.min(Math.abs(p.x - memX(p.y, p.z)) / 2.2, 1);
        out.set(p.x, p.y, p.z, inside > 0 ? smooth(inside) : 0);
    }

    RC_U.uBind.value = ph(T, W.h12);
    RC_U.uWave.value = 1 - seg(T, 1.45, 2.1);
    RC_U.uWaveAmp.value = bump(T, 1.45, 2.1);

    RC_U.uImport.value = bump(T, 3.2, 3.9);
    RC_U.uExport.value = bump(T, W.export[0], W.export[1]);

    RC_U.uDock.value = ph(T, W.dock);
    bubbleState(T, bubble);
    RC_U.uRead.value = bubble.open;
    RC_U.uRnapZ.value = DNA_CENTER.z + bubble.z;

    // incorporação: a frente acompanha o crescimento; depois, um brilho lento e fraco nos filamentos novos
    const grow = sg(T, W.grow);
    const done = ph(T, W.grow);
    RC_U.uGrowFront.value = grow < 1 ? grow : (RC_U.uTime.value * 0.22) % 1.3;
    RC_U.uGrowAmp.value = Math.max(bump(T, W.grow[0], W.grow[1]), 0.3 * done);
};
