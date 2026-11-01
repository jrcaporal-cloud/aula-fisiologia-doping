import parsedPresentation from '../../data/parsedPresentation.json';
import type { SlideSchema } from '../presentation/TitleSlide';

export interface DeckSlide {
    slide: SlideSchema;
    /** Seção herdada do último slide que declarou uma (alguns slides vêm sem). */
    section: string;
    /** Título limpo para a visão geral (sem quebras de linha do HTML original). */
    label: string;
}

const clean = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();

const stripHtml = (html: string) => clean(html.replace(/<[^>]+>/g, ' ').replace(/&quot;|"/g, '"'));

const buildDeck = (raw: SlideSchema[]): DeckSlide[] => {
    let section = '';
    return raw.map(slide => {
        section = clean(slide.sectionName) || section;
        const label = clean(slide.title) || stripHtml(slide.content).slice(0, 60);
        return { slide, section, label };
    });
};

export const DECK: DeckSlide[] = buildDeck(parsedPresentation as unknown as SlideSchema[]);

/** Slides que ganham o visualizador 3D do mecanismo genômico (por id do JSON). */
export const SLIDES_WITH_3D = new Set<number>([3]);
