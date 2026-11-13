import { create } from 'zustand';
import gsap from 'gsap';
import {
    LAB_KEYS, LAB_PRESETS, clampControl, controlsOf, matchPreset, presetById,
    type LabControls, type LabKey, type LabPresetId,
} from './labModel';

/*
 * Estado do modo do modal (roteiro × laboratório) e dos controles do laboratório. Muda só com gesto do
 * usuário (deslizador, cenário, tecla) — a cena lê com `getState()` por quadro, sem re-render.
 * Cenário: os controles andam animados até a linha da ficha (como no CardioHydraulics), e o aluno
 * pode mexer a partir dali.
 */

export type CardioMode = 'roteiro' | 'lab';

interface LabState {
    mode: CardioMode;
    controls: LabControls;
    /** Cenário cujos controles estão exatamente na tela (ou null depois de mexer). */
    preset: LabPresetId | null;
    /** Cenário para onde os controles estão andando. */
    target: LabPresetId | null;
    paused: boolean;
    /** Controle sob o ponteiro ou sendo arrastado: a cena destaca a estrutura que ele move. */
    focus: LabKey | null;
    /** Sobrepor o contorno do coração treinado. */
    contour: boolean;
    setMode: (m: CardioMode) => void;
    setControl: (key: LabKey, value: number) => void;
    applyPreset: (id: LabPresetId, reduced: boolean) => void;
    stepPreset: (dir: 1 | -1, reduced: boolean) => void;
    setFocus: (key: LabKey | null) => void;
    togglePause: () => void;
    setContour: (on: boolean) => void;
    reset: () => void;
}

const TRAINED = controlsOf(presetById('treinado').vitals);

let tween: gsap.core.Tween | null = null;
const stopTween = () => { tween?.kill(); tween = null; };

export const useLab = create<LabState>((set, get) => ({
    mode: 'roteiro',
    controls: TRAINED,
    preset: 'treinado',
    target: null,
    paused: false,
    focus: null,
    contour: true,
    setMode: mode => set(s => (s.mode === mode ? s : { mode })),
    setControl: (key, value) => {
        stopTween();
        const controls = { ...get().controls, [key]: clampControl(key, value) };
        set({ controls, preset: matchPreset(controls), target: null });
    },
    applyPreset: (id, reduced) => {
        stopTween();
        const to = controlsOf(presetById(id).vitals);
        const from = { ...get().controls };
        const proxy = { k: 0 };
        set({ target: id });
        tween = gsap.to(proxy, {
            k: 1,
            duration: reduced ? 0.25 : 1.6,
            ease: 'power2.inOut',
            onUpdate: () => {
                const c = { ...from };
                for (const key of LAB_KEYS) c[key] = from[key] + (to[key] - from[key]) * proxy.k;
                set({ controls: c, preset: null });
            },
            // a chegada é a linha da ficha, sem resíduo de arredondamento do tween
            onComplete: () => { tween = null; set({ controls: to, preset: id, target: null }); },
        });
    },
    stepPreset: (dir, reduced) => {
        const s = get();
        const cur = s.target ?? s.preset;
        const i = cur ? LAB_PRESETS.findIndex(p => p.id === cur) : dir > 0 ? -1 : LAB_PRESETS.length;
        const next = LAB_PRESETS[Math.min(Math.max(i + dir, 0), LAB_PRESETS.length - 1)];
        if (next.id !== cur) s.applyPreset(next.id, reduced);
    },
    setFocus: focus => set(s => (s.focus === focus ? s : { focus })),
    togglePause: () => set(s => ({ paused: !s.paused })),
    setContour: contour => set({ contour }),
    reset: () => {
        stopTween();
        set({ mode: 'roteiro', controls: TRAINED, preset: 'treinado', target: null, paused: false, focus: null, contour: true });
    },
}));
