import { motion } from 'framer-motion';
import type { Paragraph } from './types';

interface RichTextProps {
    readonly parts: Paragraph;
    readonly step: number;
    readonly revealed: boolean;
    readonly className?: string;
}

/** Troca o "₂" Unicode (minúsculo na fonte do deck) por um subscrito proporcional ao texto. */
const withSubscript = (text: string) =>
    text.split('₂').flatMap((chunk, i) => (i === 0 ? [chunk] : [<sub key={i} className="text-[0.72em] leading-none">2</sub>, chunk]));

/** Parágrafo do slide; trechos com `mark` ganham sublinhado + rótulo a partir do passo indicado. */
export const RichText = ({ parts, step, revealed, className }: RichTextProps) => (
    <p className={className ?? 'text-[15px] leading-[1.5] text-gray-200'}>
        {parts.map((p, i) => {
            const marked = p.mark !== undefined && revealed && step >= p.mark.fromStep;
            const text = withSubscript(p.text);
            const body = p.strong ? <strong className="text-white font-semibold">{text}</strong> : text;
            if (!p.mark) return <span key={i}>{body}</span>;
            return (
                <span key={i} className="relative">
                    <motion.span className="rounded-[3px] px-0.5 -mx-0.5"
                        animate={{ backgroundColor: marked ? `${p.mark.color}33` : 'rgba(0,0,0,0)', boxShadow: marked ? `inset 0 -2px 0 ${p.mark.color}` : 'inset 0 0px 0 rgba(0,0,0,0)' }}
                        transition={{ duration: 0.5 }}>
                        {body}
                    </motion.span>
                    {marked && (
                        <motion.span initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.25 }}
                            className="ml-1.5 inline-block align-middle font-mono text-[14px] font-bold uppercase tracking-wide px-1.5 py-[1px] rounded"
                            style={{ color: '#0b0b14', background: p.mark.color }}>
                            {p.mark.label}
                        </motion.span>
                    )}
                </span>
            );
        })}
    </p>
);
