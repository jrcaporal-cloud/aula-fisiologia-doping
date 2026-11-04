/**
 * Slide "Peptídeos: o sinal que bate na porta". Quatro passos: tamanho, onde age, por que é injetável, o rótulo.
 * Números de aminoácidos: sequências publicadas de cada molécula (TB-500 = fragmento LKKTETQ da timosina β4).
 */

export interface BasicsStep {
    tab: string;
    title: string;
    paragraphs: readonly string[];
    source: string;
}

export const BASICS_STEPS: readonly BasicsStep[] = [
    {
        tab: 'Tamanho',
        title: 'Uma cadeia curta de aminoácidos',
        paragraphs: [
            'Peptídeo é uma cadeia de aminoácidos curta, até cerca de 50. Acima disso, em geral, chamamos de proteína.',
            'A lista da WADA não separa os dois: GH e hCG, que são proteínas, estão na mesma classe dos peptídeos de 5 a 15 aminoácidos.',
        ],
        source: 'Cada bolinha é um aminoácido. TB-500 é um fragmento sintético da timosina β4.',
    },
    {
        tab: 'Onde age',
        title: 'O peptídeo para na membrana',
        paragraphs: [
            'O esteroide é lipossolúvel: atravessa a membrana e liga o receptor androgênico dentro da célula.',
            'O peptídeo é hidrossolúvel e não atravessa. Liga um receptor na superfície (acoplado à proteína G no GHRH, na grelina e no GLP-1; tirosina-quinase na insulina e no IGF-1), e o sinal segue por segundos mensageiros.',
        ],
        source: 'Compare com o receptor androgênico do início do ato. Tecla 3: esta via em 3D.',
    },
    {
        tab: 'Por que injeção',
        title: 'O estômago desmonta a cadeia',
        paragraphs: [
            'Por via oral, as proteases do estômago e do intestino quebram as ligações entre os aminoácidos. Por isso quase todos são injetáveis.',
            'A semaglutida oral é a exceção que confirma a regra: precisa de um promotor de absorção. No sangue, a meia-vida costuma ser curta, de minutos a horas.',
        ],
        source: 'Meia-vida curta não quer dizer efeito curto: lembre do slide "Ação vs Detecção".',
    },
    {
        tab: 'O rótulo',
        title: '"Uso exclusivo em pesquisa"',
        paragraphs: [
            'É assim que se vende remédio sem registro de remédio. Ninguém garante conteúdo, dose, esterilidade nem origem.',
            'Em julho de 2026, a Anvisa alertou que BPC-157, TB-500, CJC-1295, ipamorelina e GHK-Cu não são regularizados no Brasil em nenhuma categoria: nem medicamento, nem suplemento, nem cosmético.',
        ],
        source: 'Anvisa, alerta de 07/2026 sobre peptídeos injetáveis vendidos pela internet.',
    },
];

export interface ChainRow {
    name: string;
    aminoAcids: number;
}

/** Ordenado do menor para o maior; o corte de ~50 separa peptídeo de proteína. */
export const CHAIN_ROWS: readonly ChainRow[] = [
    { name: 'Ipamorelina', aminoAcids: 5 },
    { name: 'GHRP-6', aminoAcids: 6 },
    { name: 'TB-500', aminoAcids: 7 },
    { name: 'BPC-157', aminoAcids: 15 },
    { name: 'Sermorelina', aminoAcids: 29 },
    { name: 'Semaglutida', aminoAcids: 31 },
    { name: 'Timosina β4', aminoAcids: 43 },
    { name: 'Insulina', aminoAcids: 51 },
    { name: 'GH', aminoAcids: 191 },
];

export const PEPTIDE_LIMIT = 50;
