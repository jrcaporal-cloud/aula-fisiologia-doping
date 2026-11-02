import { CASES, marksOf, type SectionKey } from './cases';

/** Escala da linha do tempo (em % da largura) e rótulos das seções da ficha. */

const YEAR_MIN = 1985;
const YEAR_MAX = 2026;
const PAD = 3;

export const yearPct = (year: number): number => PAD + ((year - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * (100 - 2 * PAD);

/** Centro (em %) da vaga de cada caso na fileira de fichas, igualmente espaçadas. */
export const slotPct = (index: number): number => ((index + 0.5) / CASES.length) * 100;

export const AXIS_TICKS = [1990, 2000, 2010, 2020] as const;

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
