import type { CSSProperties } from 'react';
import type { Span } from './content';

interface RichTextProps {
    readonly spans: readonly Span[];
    readonly className?: string;
    readonly style?: CSSProperties;
}

/** Parágrafo com trechos em negrito branco ou itálico (como nos cartões originais). */
export const RichText = ({ spans, className, style }: RichTextProps) => (
    <p className={className} style={style}>
        {spans.map((s, i) =>
            s.b ? (
                <strong key={i} className="font-semibold text-white">{s.t}</strong>
            ) : s.i ? (
                <em key={i}>{s.t}</em>
            ) : (
                <span key={i}>{s.t}</span>
            ),
        )}
    </p>
);
