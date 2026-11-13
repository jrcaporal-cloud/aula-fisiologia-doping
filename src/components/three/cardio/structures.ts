/*
 * Registro das estruturas que se deixam apontar e fixar no modelo: nome e função (o texto do cartão
 * "Detalhes da estrutura") e a pose de close-up da câmera quando a estrutura é fixada. Os textos são
 * os mesmos que antes ficavam soltos em cada componente.
 */

export type Vec3 = readonly [number, number, number];

export type StructureId =
    | 'miocardio' | 'vd' | 'mitral' | 'aortica' | 'atrioE' | 'atrioD'
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
        'Músculo do ventrículo esquerdo, em corte. O miócito cardíaco tem receptor androgênico, e a parede também responde à pós-carga: por isso ela engrossa para dentro, e a cavidade não acompanha. Na sístole a parede espessa ainda mais — é o músculo encurtando.',
        [-5.0, 1.0, 13.5], [-5.6, 0.3, 0],
    ),
    vd: S(
        'vd', 'Ventrículo direito',
        'Bombeia para o pulmão, em pressão baixa: parede fina. Está aqui para o corte ficar inteiro — o septo, entre os dois ventrículos, é parede do VE e engrossa com ela.',
        [-9.6, -0.4, 12.5], [-10.0, -1.4, 0],
    ),
    mitral: S(
        'mitral', 'Valva mitral',
        'Entrada do ventrículo esquerdo, presa por cordas tendíneas aos músculos papilares. Abre na diástole; com o ventrículo rígido, o enchimento passivo cai e o átrio precisa empurrar no fim da diástole para completar o volume.',
        [-5.4, 3.3, 9.5], [-5.05, 2.75, 0],
    ),
    aortica: S(
        'aortica', 'Valva aórtica',
        'Saída do ventrículo. Abre quando a pressão do ventrículo vence a da aorta — com a pós-carga alta, abre mais tarde e contra uma resistência maior.',
        [-7.6, 2.9, 9.5], [-8.0, 2.2, 0],
    ),
    atrioE: S(
        'atrioE', 'Átrio esquerdo',
        'Recebe o sangue dos pulmões e o entrega ao ventrículo. Com o ventrículo rígido, assume parte do enchimento e dilata — átrio dilatado é substrato de fibrilação atrial.',
        [-5.2, 5.0, 10.5], [-5.6, 4.3, 0],
    ),
    atrioD: S(
        'atrioD', 'Átrio direito',
        'Fim do retorno venoso: a veia cava chega aqui e fecha o circuito. Daqui o sangue passa ao ventrículo direito e segue para o pulmão (trecho esquemático, por trás do coração).',
        [-11.2, 2.3, 10.5], [-11.8, 1.7, 0],
    ),
    aorta: S(
        'aorta', 'Aorta',
        'Primeiro vaso depois da valva, a parede mais grossa do circuito (no corte, as lâminas elásticas da média). Amortece o jato da sístole; rígida, amortece menos — a mesma ejeção gera um pico de pressão maior.',
        [-5.1, 7.4, 13.5], [-5.6, 7.2, 0],
    ),
    arteria: S(
        'arteria', 'Artéria de condução',
        'Leva o sangue até o leito de resistência. Pulsa com a sístole; quanto mais pressão e mais rigidez, menos ela distende a cada batimento. No corte: íntima, média muscular e adventícia.',
        [3.0, 4.5, 11.5], [3.0, 4.1, 0],
    ),
    endotelio: S(
        'endotelio', 'Endotélio',
        'Camada que reveste o vaso por dentro e comanda a vasodilatação. Disfuncional, o vaso deixa de dilatar justamente quando precisaria compensar o sangue mais espesso.',
        [2.0, 4.9, 7.5], [1.9, 4.4, 0],
    ),
    placa: S(
        'placa', 'Placa de ateroma',
        'Núcleo lipídico (amarelo) sob uma capa fibrosa, entre a íntima e a média. Com HDL baixo, LDL alto e endotélio disfuncional, ela cresce, estreita a luz, e o fluxo acelera e se desorganiza depois do estreitamento.',
        [3.5, 4.5, 7.2], [3.3, 4.0, 0],
    ),
    hemacia: S(
        'hemacia', 'Hemácia',
        'A testosterona estimula a eritropoese: sobem o hematócrito e, de forma desproporcional, a viscosidade. Sangue mais espesso precisa de mais pressão para manter o mesmo fluxo e se arrasta nos vasos pequenos.',
        [5.2, 4.2, 8], [4.7, 3.65, 0],
    ),
    arteriola: S(
        'arteriola', 'Arteríola',
        'Leito de resistência: é aqui que a pressão arterial é regulada. Vaso pequeno é o que mais sofre com sangue espesso — as hemácias se amontoam e passam com dificuldade.',
        [7.5, 0.4, 10], [8.1, 0, 0],
    ),
    veia: S(
        'veia', 'Retorno venoso',
        'Traz o sangue de volta ao átrio direito, em pressão baixa e fluxo lento, numa parede fina. Sangue viscoso e fluxo lento é o terreno da trombose venosa.',
        [-1, -4.0, 12], [-1, -5.3, 0],
    ),
    pulmonar: S(
        'pulmonar', 'Circulação pulmonar',
        'Trecho desenhado de forma esquemática, por trás do coração, só para o circuito fechar: do ventrículo direito o sangue vai aos pulmões e volta ao átrio esquerdo.',
        [-6.4, 10, 6], [-7.2, 6.0, -4],
    ),
};
