import { create } from 'zustand';
import { STEPS } from '../data/steps';

type StoreState = {
    currentStep: number;
    currentSlide: number;
    isAnimating: boolean;
    hoveredObject: { name: string; info: string } | null;
    loaded: boolean;
    /** Um modal (ex.: visualizador 3D) capturou o teclado — a navegação de slides pausa. */
    modalOpen: boolean;
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;
    setAnimating: (animating: boolean) => void;
    setHoveredObject: (obj: { name: string; info: string } | null) => void;
    setLoaded: (loaded: boolean) => void;
    setSlide: (slide: number) => void;
    setModalOpen: (open: boolean) => void;
};

export const useStore = create<StoreState>((set) => ({
    currentStep: 0,
    currentSlide: 0,
    isAnimating: false,
    hoveredObject: null,
    loaded: false,
    modalOpen: false,
    setStep: (step) => set({ currentStep: step }),
    nextStep: () => set((state) => ({
        currentStep: Math.min(state.currentStep + 1, STEPS.length - 1)
    })),
    prevStep: () => set((state) => ({
        currentStep: Math.max(state.currentStep - 1, 0)
    })),
    setAnimating: (isAnimating) => set({ isAnimating }),
    setHoveredObject: (hoveredObject) => set({ hoveredObject }),
    setLoaded: (loaded) => set({ loaded }),
    setSlide: (slide) => set({ currentSlide: slide }),
    setModalOpen: (modalOpen) => set({ modalOpen }),
}));
