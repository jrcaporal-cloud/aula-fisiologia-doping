import { takeArmed, useSelection } from './selection';

/**
 * Decide o que o gesto de clique faz. `discard` só limpa a armação (ponteiro descendo ou cancelado);
 * senão, `dragged` indica que o ponteiro andou entre descer e subir (foi a câmera): nada é fixado.
 * Sem arrasto: estrutura armada → fixa; vazio → solta o que estava fixado.
 */
export const pinOrRelease = (discard: boolean, dragged: boolean): void => {
    const armed = takeArmed();
    if (discard || dragged) return;
    const s = useSelection.getState();
    if (armed) s.pinStructure(armed.id, armed.point);
    else s.release();
};
