/** Conteúdo do slide "Casos que Mudaram as Regras do Esporte" — verbatim do componente original. */

export type CaseResult = 'win' | 'lose' | 'neutral' | 'lose_for_policy';

export interface SportCase {
    readonly year: number;
    readonly name: string;
    /** O original mostrava a bandeira (emoji); aqui vai o nome do país. */
    readonly country: string;
    readonly sport: string;
    readonly color: string;
    readonly case: string;
    readonly outcome: string;
    readonly regulation: string;
    readonly impact: string;
    readonly twist: string;
    readonly result: CaseResult;
}

export const CASES: readonly SportCase[] = [
    {
        year: 2009,
        name: 'Caster Semenya',
        country: 'África do Sul',
        sport: 'Atletismo 800m',
        color: '#F59E0B',
        case: 'IAAF exige teste de gênero. Semenya é mulher intersexual com hiperandrogenismo congênito (produção natural de T elevada).',
        outcome: 'Obrigada a tomar anticoncepcionais para competir. TEDH negou recurso final em 2023. 3× ré nas regras da WA.',
        regulation: 'World Athletics',
        impact: 'Criou precedente de vigilância biológica coercitiva para atletas femininas com T naturalmente alta.',
        twist: 'Semenya NUNCA fez doping. Suas T elevadas são endógenas — fruto de genética, não de manipulação.',
        result: 'lose',
    },
    {
        year: 2014,
        name: 'Dutee Chand',
        country: 'Índia',
        sport: 'Velocidade 100m',
        color: '#60A5FA',
        case: 'IAAF suspende Chand por hiperandrogenismo. Ela recorre ao CAS (Corte Arbitral do Esporte).',
        outcome: 'CAS suspende temporariamente as regras de hiperandrogenismo da IAAF por falta de evidência científica suficiente.',
        regulation: 'CAS',
        impact: 'Comprou 2 anos de pausa nas regras, gerando pressão por pesquisa científica mais robusta.',
        twist: 'A IAAF teve 2 anos para produzir evidência científica. Voltou com o estudo Bermon & Garnier (2017), posteriormente criticado por falhas metodológicas.',
        result: 'win',
    },
    {
        year: 2021,
        name: 'Laurel Hubbard',
        country: 'Nova Zelândia',
        sport: 'Halterofilia',
        color: '#A855F7',
        case: 'Primeira atleta trans a competir nas Olimpíadas. Tóquio 2020, categoria +87kg feminino.',
        outcome: 'Eliminada sem medalha após falhar 3 tentativas no arranco. Nenhuma performance superior às finalistas cis.',
        regulation: 'COI',
        impact: 'Debacle midiática sem vitória atlética. Abriu espaço para o framework do COI 2021 que aboliu regras universais de T.',
        twist: 'Hubbard era competitiva internacionalmente, mas não alcançou o pódio. O "problema" esperado não aconteceu — mas o debate já estava posto.',
        result: 'neutral',
    },
    {
        year: 2022,
        name: 'Lia Thomas',
        country: 'Estados Unidos',
        sport: 'Natação 500yd',
        color: '#E11D48',
        case: 'Primeira trans campeã nacional NCAA. Competia na equipe masculina de Penn, transitou e foi para a equipe feminina.',
        outcome: 'Campeã dos 500 jardas femininos (NCAA). Tempos pré-transição (masculino) vs pós-transição (feminino): diferença de ~1,5 s em 500yd.',
        regulation: 'NCAA / World Aquatics',
        impact: 'World Aquatics proibiu trans femininas que passaram por puberdade masculina. Gerou a política mais restritiva do esporte olímpico.',
        twist: 'Thomas foi de top-100 (masculino) para top-10 (feminino) na mesma distância — mas não venceu todas as provas. Debate: é uma "vantagem injusta" ou apenas competição normal?',
        result: 'lose_for_policy',
    },
];

export interface Policy {
    readonly org: string;
    readonly year: number;
    readonly rule: string;
    readonly color: string;
    readonly stance: string;
}

/** Políticas das federações, em ordem cronológica (o original listava COI, WA, World Aquatics, NCAA). */
export const POLICIES: readonly Policy[] = [
    { org: 'COI', year: 2021, rule: 'Eliminou limites de T. Delegou às federações. "Presunção de não vantagem."', color: '#10B981', stance: 'inclusivo' },
    { org: 'World Aquatics', year: 2022, rule: 'Exclui trans femininas que passaram por puberdade masculina. Permite transição pré-puberal.', color: '#F59E0B', stance: 'restritivo' },
    { org: 'NCAA', year: 2022, rule: 'Seguiu as regras de cada federação esportiva (caso a caso por modalidade).', color: '#60A5FA', stance: 'neutro' },
    { org: 'World Athletics', year: 2023, rule: 'T < 2,5 nmol/L por 24 meses para provas de 60m–1500m. Trans femininas completamente excluídas.', color: '#E11D48', stance: 'restritivo' },
];

export const FRAGMENTATION = {
    title: 'O Problema da Fragmentação',
    text: 'Com cada federação tendo sua própria política, uma atleta trans pode ser elegível em uma modalidade olímpica e banida em outra dos mesmos Jogos. Isso cria insegurança jurídica e viola o princípio de padronização do movimento olímpico.',
} as const;

export const RESULT_COLOR: Record<CaseResult, string> = {
    win: '#34D399',
    lose: '#FB7185',
    neutral: '#FBBF24',
    lose_for_policy: '#C084FC',
};

export const RESULT_LABEL: Record<CaseResult, string> = {
    win: 'Vitória atlética',
    lose: 'Exclusão regulatória',
    neutral: 'Sem medalha',
    lose_for_policy: 'Gerou proibição',
};

/** Passos: um por caso + políticas. */
export const CASE_STEP_TITLES = [...CASES.map(c => `${c.year} · ${c.name}`), 'Políticas das federações'] as const;
