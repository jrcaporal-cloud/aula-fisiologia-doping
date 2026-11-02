/**
 * Textos do slide "O Receptor Androgênico (AR)". Tudo aqui é copiado do componente antigo
 * (CellularSignaling) e dos cartões do slide (parsedPresentation.json, id 3) — não reescrever
 * o conteúdo científico.
 */

export const GENOMIC_COLOR = '#60A5FA';
export const NONGENOMIC_COLOR = '#E11D48';

export interface RouteItem {
    title: string;
    text: string;
}

export interface RouteText {
    name: string;
    speed: string;
    summary: string;
    /** Escala de tempo, tal como está no texto da aula. */
    span: string;
    /** Marca que o relógio mostra ao fim da sequência. */
    clock: string;
    items: RouteItem[];
}

export const GENOMIC: RouteText = {
    name: 'Via Genômica',
    speed: 'Lenta',
    summary: 'Ação celular profunda focada na modificação da arquitetura celular em horas a dias.',
    span: 'horas a dias',
    clock: '24-72 h',
    items: [
        {
            title: 'Infiltração e Ligação',
            text: 'EAA atravessa a bicamada lipídica. Dissocia chaperonas (HSP90/70) do Receptor Androgênico (AR) no citosol.',
        },
        {
            title: 'Translocação e ARE',
            text: 'O dímero entra no núcleo via transporte ativo e liga-se aos Elementos de Resposta Androgênica no DNA.',
        },
        {
            title: 'Resultado Estrutural',
            text: 'Transcrição de mRNA que codifica proteínas contráteis (Actina, Miosina) com resultados em 24-72 horas.',
        },
    ],
};

export const NONGENOMIC: RouteText = {
    name: 'Via Não Genômica',
    speed: 'Rápida',
    summary: 'Ação metabólica de choque no citoplasma e membranas em segundos a horas.',
    span: 'segundos a horas',
    clock: 'minutos',
    items: [
        {
            title: 'Ativação de Membrana',
            text: 'Interação direta livre de nucleoide com receptores acoplados à proteína G (GPCRs) engatilhando cascatas MAPK e PI3K/Akt.',
        },
        {
            title: 'Bloqueio Anticatabólico',
            text: 'Inibição imediata de Glucocorticoides: bloqueio competitivo aos sítios dos receptores de cortisol.',
        },
        {
            title: 'Choque Reticular & SNC',
            text: 'Aumento dramático de íons de cálcio intracelular (força em minutos) e facilitação neuromotora da acetilcolina.',
        },
    ],
};

export const STEP_LABELS = ['Duas vias', 'Genômica', 'Não genômica', 'Lado a lado'] as const;
export const STEP_COUNT = STEP_LABELS.length;
