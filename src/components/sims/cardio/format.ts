/** Número com vírgula decimal: o slide é lido em português. */
export const br = (n: number, casas = 1): string => n.toFixed(casas).replace('.', ',');

/** Diferença com sinal explícito (usa o sinal de menos tipográfico). Zero não leva sinal. */
export const signed = (n: number, casas = 0): string => {
    const rounded = Number(n.toFixed(casas));
    if (rounded === 0) return br(0, casas);
    return `${rounded > 0 ? '+' : '−'}${br(Math.abs(rounded), casas)}`;
};
