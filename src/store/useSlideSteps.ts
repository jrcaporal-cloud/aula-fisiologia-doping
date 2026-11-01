import { useEffect } from 'react';
import { create } from 'zustand';

/**
 * Passos dentro de um slide (estilo "fragmentos"): o passador avança o passo
 * antes de trocar de slide. Um componente declara quantos passos tem com
 * `useSlideSteps(n)` e lê o passo atual — o Deck cuida do teclado/passador.
 */
interface SlideStepState {
    step: number;
    count: number;
    /** Ao voltar para um slide, ele abre já no último passo (como no PowerPoint). */
    enterAtEnd: boolean;
    /** Dono atual: o slide que sai (ainda animando) não pode zerar os passos do que entrou. */
    owner: number;
    register: (count: number) => number;
    unregister: (owner: number) => void;
    setStep: (step: number) => void;
    prepareEntry: (atEnd: boolean) => void;
}

let nextOwner = 1;

export const useSlideStepStore = create<SlideStepState>((set, get) => ({
    step: 0,
    count: 1,
    enterAtEnd: false,
    owner: 0,
    register: (count) => {
        const owner = nextOwner++;
        set(state => ({ count, owner, step: state.enterAtEnd ? count - 1 : 0 }));
        return owner;
    },
    unregister: (owner) => {
        if (get().owner === owner) set({ count: 1, step: 0, owner: 0 });
    },
    setStep: (step) => set(state => ({ step: Math.min(Math.max(step, 0), state.count - 1) })),
    prepareEntry: (atEnd) => set({ enterAtEnd: atEnd, step: 0, count: 1, owner: 0 }),
}));

export interface SlideSteps {
    step: number;
    count: number;
    setStep: (step: number) => void;
}

/** Declara `count` passos para o slide atual e devolve o passo corrente (0…count-1). */
export const useSlideSteps = (count: number): SlideSteps => {
    const step = useSlideStepStore(s => s.step);
    const setStep = useSlideStepStore(s => s.setStep);
    const register = useSlideStepStore(s => s.register);
    const unregister = useSlideStepStore(s => s.unregister);

    useEffect(() => {
        const owner = register(count);
        return () => unregister(owner);
    }, [count, register, unregister]);

    return { step: Math.min(step, count - 1), count, setStep };
};
