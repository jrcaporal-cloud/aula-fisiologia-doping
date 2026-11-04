/**
 * Slide "O caso Essendon" (AFL, futebol australiano). Fontes: decisão do CAS de 11/01/2016 (recurso da WADA,
 * 34 jogadores, 2 anos a partir de 31/03/2015); sanções da AFL ao clube em 27/08/2013; Código Mundial Antidopagem, art. 3.1
 * (padrão de prova "satisfação confortável").
 */

export type PlayersState = 'program' | 'investigated' | 'cleared' | 'banned';

export interface EssendonStep {
    date: string;
    tab: string;
    title: string;
    text: string;
    players: PlayersState;
}

export const ESSENDON_STEPS: readonly EssendonStep[] = [
    {
        date: '2012',
        tab: 'O programa',
        title: 'Um programa de injeções dentro do clube',
        text: 'O Essendon monta um programa de suplementos com injeções em série nos jogadores. Os registros do que foi aplicado, em quem e quando, são incompletos.',
        players: 'program',
    },
    {
        date: '2013',
        tab: 'A investigação',
        title: 'A liga pune o clube',
        text: 'A agência antidoping australiana investiga. A AFL pune o clube por falha de governança: multa de A$ 2 milhões, exclusão das finais, perda de escolhas no draft e técnico suspenso por 12 meses.',
        players: 'investigated',
    },
    {
        date: 'mar 2015',
        tab: 'A absolvição',
        title: 'O tribunal da liga absolve os 34',
        text: 'O tribunal antidoping da AFL conclui que não ficou provado que a substância aplicada era timosina β4.',
        players: 'cleared',
    },
    {
        date: 'jan 2016',
        tab: 'O CAS',
        title: 'A WADA recorre e o CAS condena',
        text: 'O Tribunal Arbitral do Esporte fica "confortavelmente satisfeito" de que os jogadores receberam timosina β4. Os 34 pegam 2 anos de suspensão.',
        players: 'banned',
    },
];

export const LESSONS: readonly string[] = [
    'Responsabilidade objetiva: o atleta responde pelo que entra no corpo, mesmo quando o clube garante que é permitido.',
    'Sem registro do que foi aplicado, não há defesa, nem para o atleta nem para o clube.',
    'O pessoal de apoio responde junto (art. 2.8 e 2.9 do Código). Voltamos a isso no Ato V.',
    'A família da timosina β4 é a mesma do TB-500 que hoje se vende como "pesquisa".',
];

export const PLAYER_COUNT = 34;

export const PLAYER_STATES: Record<PlayersState, { label: string; fill: string; stroke: string; text: string }> = {
    program: { label: 'no programa', fill: 'rgba(203,213,225,0.25)', stroke: 'rgba(203,213,225,0.6)', text: '#E2E8F0' },
    investigated: { label: 'investigados', fill: 'rgba(245,158,11,0.3)', stroke: 'rgba(245,158,11,0.8)', text: '#FDE68A' },
    cleared: { label: 'absolvidos', fill: 'rgba(56,189,248,0.3)', stroke: 'rgba(56,189,248,0.85)', text: '#BAE6FD' },
    banned: { label: 'suspensos por 2 anos', fill: 'rgba(225,29,72,0.45)', stroke: '#FB7185', text: '#FDA4AF' },
};
