import { motion } from 'framer-motion';
import type { Paragraph } from './types';

interface RichTextProps {
    readonly parts: Paragraph;
    readonly step: number;
    readonly revealed: boolean;
    readonly className?: string;
}

/** Parágrafo do slide; trechos com `mark` ganham sublinhado + rótulo a partir do passo indicado. */
export const RichText = ({ parts, step, revealed, className }: RichTextProps) => (
    <p className={className ?? 'text-[14px] leading-[1.5] text-gray-200'}>
        {parts.map((p, i) => {
            const marked = p.mark !== undefined && revealed && step >= p.mark.fromStep;
            const body = p.strong ? <strong className="text-white font-semibold">{p.text}</strong> : p.text;
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
                            className="ml-1.5 inline-block align-middle font-mono text-[12px] font-bold uppercase tracking-wider px-1.5 py-[1px] rounded"
                            style={{ color: '#0b0b14', background: p.mark.color }}>
                            {p.mark.label}
                        </motion.span>
                    )}
                </span>
            );
        })}
    </p>
);
