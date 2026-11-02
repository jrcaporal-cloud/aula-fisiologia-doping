import { DECK } from '../../deck/slides';
import type { SourceSlide } from './content';

export interface SlideRef {
    readonly number: number;
    readonly label: string;
}

/** Número (1-based) e título do slide que usa o componente — segue a ordem atual do deck. */
export const slideRef = (source: SourceSlide): SlideRef => {
    const token = `[[COMP:${source.comp}]]`;
    const index = DECK.findIndex(item => item.slide.content.includes(token));
    if (index < 0) return { number: source.fallback, label: '' };
    return { number: index + 1, label: DECK[index].label };
};

/** "slide 10" ou "slides 20 e 21" (ordem crescente). */
export const slidesPhrase = (refs: readonly SlideRef[]): string => {
    const nums = [...new Set(refs.map(r => r.number))].sort((a, b) => a - b);
    if (nums.length === 1) return `slide ${nums[0]}`;
    return `slides ${nums.slice(0, -1).join(', ')} e ${nums[nums.length - 1]}`;
};

/** "visto no slide 10" ou "vistos nos slides 20 e 21". */
export const seenPhrase = (refs: readonly SlideRef[]): string =>
    `${new Set(refs.map(r => r.number)).size > 1 ? 'vistos nos' : 'visto no'} ${slidesPhrase(refs)}`;

/** Leva o deck ao slide indicado (o deck escuta o #hash). */
export const goToSlide = (n: number): void => {
    window.location.hash = `#/${n}`;
};
