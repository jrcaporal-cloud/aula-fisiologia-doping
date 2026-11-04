/*
 * Paleta do modelo circulatório. Rosa/carmim = músculo e sangue (identidade da aula),
 * âmbar = lipídio/placa, ciano = o que é normal ou de referência (endotélio íntegro),
 * azul-ardósia = sangue venoso.
 */
export const CC = {
    myo: '#BE123C',
    myoDeep: '#7F1D2E',
    fibrose: '#E2E8F0',
    blood: '#9F1239',
    cell: '#F43F5E',
    cellDark: '#BE123C',
    artery: '#FB7185',
    arteriole: '#FDA4AF',
    vein: '#7C93B8',
    pulm: '#64748B',
    valve: '#E2E8F0',
    atrium: '#C2415F',
    plaque: '#F59E0B',
    lipid: '#FBBF24',
    endo: '#22D3EE',
    crimson: '#E11D48',
    slate: '#CBD5E1',
} as const;

/* O painel não cita nada por si: aponta para a lista do slide, para não parecer uma fonte própria. */
export const CARDIO_SOURCE = 'As referências deste modelo estão no slide, atrás da tecla D.';
