import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { DECK } from './slides';
import { DUR, EASE_OUT } from '../../lib/motion';
import { actColor } from '../../lib/palette';
import { trapTab } from './dialogFocus';

interface OverviewProps {
    current: number;
    onSelect: (index: number) => void;
    onClose: () => void;
}

const SHORTCUTS: [string, string][] = [
    ['→ / Espaço / PgDn', 'avançar'],
    ['← / PgUp', 'voltar'],
    ['G', 'visão geral'],
    ['F', 'tela cheia'],
    ['P', 'modo apresentador'],
    ['D', 'detalhamento'],
    ['3', 'modelo 3D (quando houver)'],
    ['Home / End', 'início / fim'],
];

/** Grade com todos os slides — útil para saltar durante perguntas da turma. */
export const Overview = ({ current, onSelect, onClose }: OverviewProps) => {
    const activeRef = useRef<HTMLButtonElement>(null);

    // Ao fechar, o foco volta para onde estava (o botão da barra ou o corpo da aula).
    useEffect(() => {
        const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        return () => previous?.focus({ preventScroll: true });
    }, []);

    useEffect(() => {
        activeRef.current?.scrollIntoView({ block: 'center' });
        activeRef.current?.focus({ preventScroll: true });
    }, []);

    return (
        <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Visão geral dos slides"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.text, ease: EASE_OUT }}
            className="absolute inset-0 z-40 bg-[#05050d]/92 backdrop-blur-xl overflow-y-auto"
            onClick={onClose}
            onKeyDown={trapTab}
        >
            <div className="max-w-7xl mx-auto px-10 py-12" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display text-3xl font-semibold text-white">Visão geral</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar visão geral (Esc)"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--act-color,#E11D48)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                    {DECK.map((item, i) => {
                        const isCurrent = i === current;
                        return (
                            <button
                                key={i}
                                ref={isCurrent ? activeRef : undefined}
                                type="button"
                                onClick={() => onSelect(i)}
                                className={`text-left rounded-xl p-4 border transition-[transform,background-color,border-color] duration-180 ease-(--ease-out) motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--act-color,#E11D48)] ${isCurrent
                                    ? 'bg-white/[0.07]'
                                    : 'bg-white/[0.03] border-white/10 hover:border-white/30 hover:bg-white/[0.06]'}`}
                                // Cartão ativo: borda na cor do ato daquele slide (só a casca usa a cor do ato).
                                style={isCurrent ? { borderColor: actColor(item.section), boxShadow: `inset 0 0 0 1px ${actColor(item.section)}` } : undefined}
                            >
                                <div className="flex items-center gap-2 mb-2 text-[12px] uppercase tracking-[0.18em] text-gray-300">
                                    <span className="font-mono text-gray-300">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="truncate">{item.section}</span>
                                </div>
                                <div className="font-body text-[16px] font-semibold leading-snug text-white line-clamp-2">
                                    {item.label}
                                </div>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-gray-300">
                    {SHORTCUTS.map(([keys, what]) => (
                        <span key={keys}><kbd className="deck-kbd">{keys}</kbd> {what}</span>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
