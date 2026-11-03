import { ArrowUpRight } from 'lucide-react';
import type { Finding } from './content';
import { goToSlide, seenPhrase, slideRef, slidesPhrase } from './slideRefs';

interface SourceTagProps {
    readonly finding: Finding;
    /** Versão longa: "visto no slide N · título"; curta: "slide N". */
    readonly full: boolean;
}

/** Etiqueta do slide de origem — clicar leva o deck ao slide do simulador. */
export const SourceTag = ({ finding, full }: SourceTagProps) => {
    const refs = finding.sources.map(slideRef);
    const main = refs[0];
    const titles = refs.map(r => r.label).filter(Boolean);
    return (
        <div className="max-w-full">
            <button
                type="button"
                onClick={e => { e.stopPropagation(); goToSlide(main.number); }}
                title={`Ir ao slide ${main.number}`}
                className="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-left font-mono text-[15px] font-semibold leading-snug transition-colors hover:bg-white/10"
                style={{ borderColor: `${finding.color}88`, color: '#F3F4F6', background: `${finding.color}14` }}
            >
                <span>{full ? seenPhrase(refs) : slidesPhrase(refs)}</span>
                <ArrowUpRight size={14} aria-hidden className="shrink-0" style={{ color: finding.color }} />
            </button>
            {full && titles.length > 0 && (
                <div className="mt-1.5 font-body text-[14px] leading-snug text-gray-200">
                    {titles.map(t => <div key={t}>{t}</div>)}
                </div>
            )}
        </div>
    );
};
