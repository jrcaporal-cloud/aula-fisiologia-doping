import { useEffect, useRef } from 'react';

/** O que cada tecla do modal faz. */
export interface CardioKeyActions {
    next: () => void;
    prev: () => void;
    togglePlay: () => void;
    togglePhase: () => void;
    /** Esc: solta a estrutura fixada; sem nada fixado, fecha o modal. */
    escape: () => void;
    close: () => void;
}

/**
 * Teclado do modal: setas / PageUp / PageDown trocam de etapa, espaço reproduz, R alterna
 * "Em uso" × "Depois de parar", Esc solta ou fecha, 3 fecha. Com Ctrl, Cmd ou Alt apertados nada
 * é capturado (Cmd+R recarrega a página, Alt+← volta o navegador).
 */
export const useCardioKeys = (actions: CardioKeyActions): void => {
    // sempre a versão mais recente das ações, sem reassinar o listener a cada render
    const latest = useRef(actions);
    useEffect(() => { latest.current = actions; });

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey || e.altKey) return;
            const a = latest.current;
            if (['ArrowRight', 'PageDown', 'ArrowDown'].includes(e.key)) { e.preventDefault(); a.next(); }
            else if (['ArrowLeft', 'PageUp', 'ArrowUp'].includes(e.key)) { e.preventDefault(); a.prev(); }
            else if (e.key === ' ') { e.preventDefault(); a.togglePlay(); }
            else if (e.key === 'r' || e.key === 'R') { e.preventDefault(); a.togglePhase(); }
            else if (e.key === 'Escape') a.escape();
            else if (e.key === '3') a.close();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
};
