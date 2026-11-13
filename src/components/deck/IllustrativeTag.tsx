import type { ReactNode } from 'react';
import { CAUTION } from '../../lib/palette';

/**
 * Etiqueta de ressalva metodológica ("modelo ilustrativo", "esquema", "sem escala").
 * Neutra e idêntica na aula toda: é rodapé de honestidade, não alerta — nunca na cor de uma substância.
 * Em SVG, use `CAUTION.text` como fill do <text>.
 */
export const IllustrativeTag = ({ children = 'modelo ilustrativo', className = '' }: { children?: ReactNode; className?: string }) => (
    <span
        className={`inline-block rounded-md px-2 py-0.5 font-mono text-[14px] leading-snug ${className}`}
        style={{ color: CAUTION.text, border: `1px solid ${CAUTION.border}`, background: CAUTION.bg }}
    >
        {children}
    </span>
);
