import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { DUR, EASE_OUT, stagger } from '../../../lib/motion';
import { IllustrativeTag } from '../../deck/IllustrativeTag';
import { STEPS } from './content';

/** Painel lateral: o cartão do slide original correspondente ao passo, com o texto verbatim. */

interface TextPanelProps {
    readonly step: number;
    /** Presente quando o passo tem animação que pode ser repetida. */
    readonly onReplay?: () => void;
}

export const TextPanel = ({ step, onReplay }: TextPanelProps) => {
    const info = STEPS[step];
    // Passos 1 e 2 têm pouco texto: letra maior para o painel não ficar vazio.
    const roomy = info.bullets.length === 0;
    return (
        <div className="relative rounded-2xl border border-white/10 overflow-hidden" style={{ background: 'rgba(8,8,18,0.72)' }}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: info.color }} />
            <motion.div key={step} className="p-4 pl-5 pb-14 h-full flex flex-col"
                initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: DUR.enter, ease: EASE_OUT }}>
                <div className={`font-semibold leading-tight text-white ${roomy ? 'text-[24px]' : 'text-[22px]'}`}>{info.card}</div>
                <p className={`text-gray-100 ${roomy ? 'mt-3 text-[18px] leading-[1.5]' : 'mt-2 text-[16px] leading-[1.45]'}`}>
                    {info.paragraph.map((p, i) => (p.strong
                        ? <strong key={i} className="font-semibold" style={{ color: '#fff' }}>{p.text}</strong>
                        : <span key={i}>{p.text}</span>))}
                </p>
                {info.bullets.length > 0 && (
                    <ul className="mt-2.5 space-y-2">
                        {info.bullets.map((b, i) => (
                            <motion.li key={b.label} className="flex gap-2.5 text-[16px] leading-[1.4] text-gray-100"
                                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stagger(i, 0.15, 0.12), duration: DUR.enter, ease: EASE_OUT }}>
                                <span className="mt-[7px] w-2 h-2 shrink-0 rounded-[2px]" style={{ background: info.color }} />
                                <span><strong className="text-white font-semibold">{b.label}</strong> {b.text}</span>
                            </motion.li>
                        ))}
                    </ul>
                )}
                {step === 1 && (
                    <p className="mt-5 text-[15px] leading-[1.45] text-gray-200 border-t border-white/10 pt-3">
                        A série completa, coleta a coleta, aparece adiante no simulador do Passaporte Biológico.
                    </p>
                )}
            </motion.div>
            <div className="absolute flex items-center justify-between gap-2" style={{ left: 20, right: 16, bottom: 14 }}>
                <IllustrativeTag>modelo ilustrativo</IllustrativeTag>
                {onReplay && (
                    <button type="button" onClick={onReplay}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[14.5px] font-semibold cursor-pointer border border-white/15 text-gray-100 hover:bg-white/5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--act-color,#E11D48)]">
                        <RotateCcw size={15} /> Repetir
                    </button>
                )}
            </div>
        </div>
    );
};
