import { useEffect, type KeyboardEvent, type RefObject } from 'react';

const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Diálogo modal: Tab e Shift+Tab giram dentro dele — o foco nunca cai no slide escondido atrás.
 * Use em `onKeyDown` do elemento com `role="dialog"`.
 */
export const trapTab = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Tab') return;
    const box = e.currentTarget;
    const focusables = Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(el => el.offsetParent !== null);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    const outside = !box.contains(active) || active === box;
    if (e.shiftKey && (active === first || outside)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && (active === last || outside)) { e.preventDefault(); first.focus(); }
};

/**
 * Ao abrir, põe o foco dentro do diálogo (no próprio contêiner, `tabIndex={-1}`: Enter não aciona nada por engano);
 * ao fechar, devolve o foco para onde estava (o botão que abriu ou o corpo da aula).
 */
export const useDialogFocus = (ref: RefObject<HTMLElement | null>) => {
    useEffect(() => {
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        ref.current?.focus({ preventScroll: true });
        return () => previous?.focus({ preventScroll: true });
    }, [ref]);
};
