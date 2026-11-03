import { CASES, marksOf, type SectionKey } from './cases';

/** Escala da linha do tempo (em % da largura) e rótulos das seções da ficha. */

const YEAR_MIN = 1985;
const YEAR_MAX = 2026;
const PAD = 3;
/** Folga (em %) para tratar trechos horizontais quase encostados como sobrepostos. */
const GAP = 1;

export const yearPct = (year: number): number => PAD + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (100 - 2 * PAD);

/** Centro (em %) da vaga de cada caso na fileira de fichas, igualmente espaçadas. */
export const slotPct = (index: number): number => ((index + 0.5) / CASES.length) * 100;

export const AXIS_TICKS = [1990, 2000, 2010, 2020] as const;

/**
 * Faixa (0 = mais perto do eixo) do conector de cada caso. Cada conector desce da ficha, anda na
 * horizontal até o ano e desce até o eixo; se dois conectores têm trechos horizontais que se
 * sobrepõem, o de ficha mais à direita fica numa faixa mais alta — assim nenhuma linha se cruza.
 * Calculado a partir dos dados (ordem cronológica das fichas × posição dos anos).
 */
const computeLanes = (): readonly number[] => {
    const spans = CASES.map((_, i) => {
        const a = slotPct(i);
        const b = yearPct(marksOf(CASES[i].year)[0] ?? YEAR_MIN);
        return { lo: Math.min(a, b) - GAP, hi: Math.max(a, b) + GAP };
    });
    const lanes: number[] = [];
    spans.forEach((s, i) => {
        const above = spans
            .slice(0, i)
            .map((o, j) => (o.lo < s.hi && s.lo < o.hi ? lanes[j] : -1));
        lanes.push(Math.max(-1, ...above) + 1);
    });
    return lanes;
};

export const LANES = computeLanes();


export const caseMarks = CASES.map(c => marksOf(c.year));

export interface SectionTab {
    readonly key: 'ficha' | Exclude<SectionKey, 'detection' | 'outcome'>;
    readonly label: string;
}

/** "Ficha" = como foi pego + consequência; as outras abas mostram o restante do texto original. */
export const SECTION_TABS: readonly SectionTab[] = [
    { key: 'ficha', label: 'Ficha' },
    { key: 'pharmacology', label: 'Farmacologia' },
    { key: 'mechanism', label: 'Mecanismo' },
    { key: 'trivia', label: 'O que poucos sabem' },
];

export const SECTION_TITLE: Record<SectionKey, string> = {
    detection: 'Como foi pego',
    outcome: 'Consequência',
    pharmacology: 'Farmacologia detalhada',
    mechanism: 'Mecanismo molecular',
    trivia: 'O que poucos sabem',
};

/** Número do caso com dois dígitos ("03"). */
export const caseNo = (index: number): string => String(index + 1).padStart(2, '0');
