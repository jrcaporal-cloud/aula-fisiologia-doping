interface SlideHeaderProps {
    title: string;
    subtitle?: string | null;
}

const tidy = (text: string) => text.replace(/\s+/g, ' ').trim();

/**
 * Cabeçalho único de todos os slides: régua na cor do ato à esquerda (CSS var --act-color, definida pelo
 * Deck por slide a partir de DECK[i].section), título e subtítulo em cinza claro (o vermelho dava 4,1–4,3:1).
 */
export const SlideHeader = ({ title, subtitle }: SlideHeaderProps) => {
    const sub = subtitle ? tidy(subtitle) : '';
    return (
        <div className="mb-6 border-l-4 border-[var(--act-color,#9F1239)] pl-7 pointer-events-none">
            {/* Sem entrada própria: o slide inteiro já esmaece na troca (uma camada só). */}
            <h2 className="text-[2.9rem] leading-[1.06] font-display font-semibold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                {tidy(title)}
            </h2>
            {sub && (
                <p className="mt-2 text-[1.45rem] leading-snug text-gray-300 font-light max-w-4xl drop-shadow-md">
                    {sub}
                </p>
            )}
        </div>
    );
};
