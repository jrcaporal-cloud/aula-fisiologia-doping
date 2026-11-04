/*
 * Registro das estruturas que se deixam apontar e fixar no modelo: nome e função (o texto do cartão
 * "Detalhes da estrutura") e a pose de close-up da câmera quando a estrutura é fixada. Os textos são
 * os mesmos que antes ficavam soltos em cada componente.
 */

export type Vec3 = readonly [number, number, number];

export type StructureId =
    | 'miocardio' | 'cavidade' | 'mitral' | 'aortica' | 'atrioE' | 'atrioD'
    | 'aorta' | 'arteria' | 'endotelio' | 'placa' | 'hemacia' | 'arteriola' | 'veia' | 'pulmonar';

/** Pose de câmera: posição e ponto para onde ela olha. */
export interface Pose { pos: Vec3; tgt: Vec3 }

export interface Structure {
    id: StructureId;
    name: string;
    info: string;
    /** Close-up ao fixar. Para a hemácia é só o padrão: o clique define o ponto (ver `poseOfPin`). */
    pose: Pose;
}

const S = (id: StructureId, name: string, info: string, pos: Vec3, tgt: Vec3): Structure => ({ id, name, info, pose: { pos, tgt } });

export const STRUCTURES: Record<StructureId, Structure> = {
    miocardio: S(
        'miocardio', 'Miocárdio do VE',
        'Músculo do ventrículo esquerdo, em corte. O miócito cardíaco tem receptor androgênico, e a parede também responde à pós-carga: por isso ela engrossa para dentro, sem a cavidade acompanhar.',
        [-11, 1.6, 21], [-7.5, -0.4, 0],
    ),
    cavidade: S(
        'cavidade', 'Cavidade do VE',
        'Espaço que se enche na diástole e é ejetado na sístole. Quando a parede cresce para dentro, cabe menos sangue — e cada batimento ejeta um volume menor, mesmo com fração de ejeção parecida.',
        [-7.4, 0.9, 16.5], [-7.5, 0.3, 0],
    ),
    mitral: S(
        'mitral', 'Valva mitral',
        'Entrada do ventrículo esquerdo. Abre na diástole; com o ventrículo rígido, o enchimento passivo cai e o átrio precisa empurrar no fim da diástole para completar o volume.',
        [-10.4, 4.4, 9], [-9.05, 2.3, 0],
    ),
    aortica: S(
        'aortica', 'Valva aórtica',
        'Saída do ventrículo. Abre quando a pressão do ventrículo vence a da aorta — com a pós-carga alta, abre mais tarde e contra uma resistência maior.',
        [-4.4, 4.3, 9], [-5.95, 2.4, 0],
    ),
    atrioE: S(
        'atrioE', 'Átrio esquerdo',
        'Recebe o sangue dos pulmões e o entrega ao ventrículo. Com o ventrículo rígido, assume parte do enchimento e dilata — átrio dilatado é substrato de fibrilação atrial.',
        [-11, 5.6, 10], [-9.5, 4.3, -0.3],
    ),
    atrioD: S(
        'atrioD', 'Átrio direito',
        'Fim do retorno venoso: fecha o circuito. Daqui o sangue segue para o pulmão e volta ao átrio esquerdo (trecho desenhado de forma esquemática, ao fundo).',
        [-3.2, -0.9, 10], [-3.45, -2.0, -0.25],
    ),
    aorta: S(
        'aorta', 'Aorta',
        'Primeiro vaso depois da valva: amortece o jato da sístole. Rígida, amortece menos — a mesma ejeção gera um pico de pressão maior.',
        [-2.4, 6.6, 15], [-3.6, 5.9, 0],
    ),
    arteria: S(
        'arteria', 'Artéria de condução',
        'Conduz o sangue até o leito de resistência. Pulsa com a sístole; quanto mais pressão e mais rigidez, menos ela distende a cada batimento.',
        [3.8, 3.4, 12.5], [4.7, 2.45, 0],
    ),
    endotelio: S(
        'endotelio', 'Endotélio',
        'Camada que reveste o vaso por dentro e comanda a vasodilatação. Disfuncional, o vaso deixa de dilatar justamente quando precisaria compensar o sangue mais espesso.',
        [8.6, 3.6, 7.2], [6.1, 2.36, 0],
    ),
    placa: S(
        'placa', 'Placa de ateroma',
        'Núcleo lipídico na parede da artéria. Com HDL baixo, LDL alto e endotélio disfuncional, ela cresce, estreita o lúmen e o fluxo acelera e se desorganiza depois do estreitamento.',
        [8.2, 3.4, 8.6], [8.0, 2.2, 0],
    ),
    hemacia: S(
        'hemacia', 'Hemácia',
        'A testosterona estimula a eritropoese: sobem o hematócrito e, de forma desproporcional, a viscosidade. Sangue mais espesso precisa de mais pressão para manter o mesmo fluxo e se arrasta nos vasos pequenos.',
        [5.2, 3.5, 8], [4.7, 2.45, 0],
    ),
    arteriola: S(
        'arteriola', 'Arteríola',
        'Leito de resistência: é aqui que a pressão arterial é regulada. Vaso pequeno é o que mais sofre com sangue espesso — as hemácias se amontoam e passam com dificuldade.',
        [12.8, 0.9, 9.5], [11.3, 0.2, 0],
    ),
    veia: S(
        'veia', 'Retorno venoso',
        'Traz o sangue de volta ao átrio direito, em pressão baixa e fluxo lento. Sangue viscoso e fluxo lento é o terreno da trombose venosa.',
        [2, -2.2, 13], [2, -3.5, 0],
    ),
    pulmonar: S(
        'pulmonar', 'Circulação pulmonar',
        'Trecho desenhado de forma esquemática, ao fundo, só para o circuito fechar: aqui o sangue passaria pelo ventrículo direito e pelos pulmões antes de voltar ao átrio esquerdo.',
        [-4.5, 4.6, 9.5], [-5.5, 4, -3.6],
    ),
};
