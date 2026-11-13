import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
import { Dna, FlaskConical, AlertTriangle, Zap, Shield, Activity } from 'lucide-react';
import type { SlideSchema } from './TitleSlide';
import { cn } from '../../lib/utils';
import { renderSlideContent } from './slideContent';
import { SlideHeader } from './SlideHeader';
import { useDetailsToggle } from '../../lib/detailsEvent';
import { useDetailsStore } from '../../lib/detailsStore';
import { DUR, EASE_OUT, stagger } from '../../lib/motion';

// Map card index to a contextual icon and accent color
const CARD_THEMES = [
    { Icon: Dna, accent: '#3b82f6', glow: 'rgba(59,130,246,0.25)', bg: 'rgba(59,130,246,0.08)' },
    { Icon: FlaskConical, accent: '#a855f7', glow: 'rgba(168,85,247,0.25)', bg: 'rgba(168,85,247,0.08)' },
    { Icon: Activity, accent: '#10b981', glow: 'rgba(16,185,129,0.25)', bg: 'rgba(16,185,129,0.08)' },
    { Icon: AlertTriangle, accent: '#e11d48', glow: 'rgba(225,29,72,0.30)', bg: 'rgba(225,29,72,0.10)' },
    { Icon: Zap, accent: '#f59e0b', glow: 'rgba(245,158,11,0.25)', bg: 'rgba(245,158,11,0.08)' },
    { Icon: Shield, accent: '#06b6d4', glow: 'rgba(6,182,212,0.25)', bg: 'rgba(6,182,212,0.08)' },
];

interface CardProps {
    card: { title: string; attributes: string[]; rawHtml: string };
    idx: number;
}

const BentoCard: React.FC<CardProps> = ({ card, idx }) => {
    const theme = CARD_THEMES[idx % CARD_THEMES.length];
    const { Icon } = theme;
    const reduce = useReducedMotion();

    // Cartão: fade curto subindo 8 px, escalonado com teto (sem blur, sem mola).
    const cardVariant: Variants = {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: DUR.enter, ease: EASE_OUT, delay: stagger(idx, 0.05) } },
    };

    // Itens da lista: pior caso termina em 0,15 + 0,4 + 0,25 + 0,25 = 1,05 s.
    const listItem: Variants = {
        hidden: { opacity: 0 },
        show: (i: number) => ({ opacity: 1, transition: { delay: stagger(idx, 0.15) + Math.min(i * 0.05, 0.25), duration: DUR.text, ease: EASE_OUT } }),
    };

    return (
        <motion.div
            variants={cardVariant}
            className="group relative overflow-hidden rounded-2xl flex flex-col p-7 backdrop-blur-2xl shadow-2xl pointer-events-auto cursor-default"
            style={{
                background: 'rgba(8,8,18,0.72)',
                border: '1px solid rgba(255,255,255,0.08)',
            }}
            whileHover={{
                y: -6,
                boxShadow: `0 20px 50px -16px rgba(0,0,0,0.7), 0 0 0 1px ${theme.accent}55`,
                borderColor: `${theme.accent}66`,
                transition: { duration: DUR.exit, ease: EASE_OUT }
            }}
        >
            {/* Shimmer top border */}
            <motion.div
                className="absolute top-0 left-0 w-full h-[2px]"
                style={{
                    background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
                    opacity: 0.3,
                }}
                animate={reduce ? undefined : { backgroundPosition: ['200% 0', '-200% 0'] }}
                // Atraso negativo: o brilho já começa em fase, sem pausa (único loop do cartão).
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: -idx * 0.4 }}
            />

            {/* Corner accent (estático) */}
            <div
                className="absolute bottom-0 right-0 w-24 h-24 opacity-5 pointer-events-none"
                style={{ background: `radial-gradient(circle at bottom right, ${theme.accent}, transparent 70%)` }}
            />

            {/* Header */}
            <div className="flex items-start gap-4 mb-5 relative z-10">
                <div className="flex-shrink-0 p-3 rounded-xl border border-white/8" style={{ background: theme.bg }}>
                    <Icon className="w-6 h-6" style={{ color: theme.accent }} />
                </div>

                <h3 className="text-xl font-body font-semibold leading-tight whitespace-pre-line transition-colors duration-300 ease-(--ease-out) pt-0.5"
                    style={{ color: 'white' }}
                >
                    {card.title}
                </h3>
            </div>

            {/* HTML content */}
            {card.rawHtml && (
                <div
                    className="flex-1 text-gray-300 text-sm leading-relaxed relative z-10"
                    dangerouslySetInnerHTML={{ __html: card.rawHtml }}
                />
            )}

            {/* Attribute list with staggered entrance */}
            {card.attributes && card.attributes.length > 0 && !card.rawHtml && (
                <ul className="mt-4 space-y-2.5 relative z-10">
                    {card.attributes.map((attr, i) => (
                        <motion.li
                            key={i}
                            custom={i}
                            variants={listItem}
                            className="flex gap-3 text-sm text-gray-300 items-start"
                        >
                            <span className="flex-shrink-0 mt-[5px] w-1.5 h-1.5 rounded-full" style={{ background: theme.accent }} />
                            <span>{attr}</span>
                        </motion.li>
                    ))}
                </ul>
            )}

            {/* Bottom separator glow line */}
            <div
                className="absolute bottom-0 left-0 h-[1px] w-full origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-450 ease-(--ease-out)"
                style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}44, transparent)` }}
            />
        </motion.div>
    );
};

/**
 * Slides em que o componente interativo já ocupa a tela: os cartões de detalhamento
 * ficam atrás de um botão, senão o slide inteiro encolhe até o texto ficar ilegível.
 */
const COLLAPSED_CARD_SLIDES = new Set<number>([3, 6, 7, 11, 14, 16, 18, 19, 20, 22, 24, 26, 27, 28, 35, 36, 191]);

const gridColumns = (count: number) =>
    count === 1 ? 'grid-cols-1 max-w-4xl mx-auto' :
        count === 2 ? 'grid-cols-2 max-w-5xl mx-auto' :
            count === 4 ? 'grid-cols-2 max-w-6xl mx-auto' :
                'grid-cols-3';

export const BentoSlide = ({ slide }: { slide: SlideSchema }) => {
    const collapsible = COLLAPSED_CARD_SLIDES.has(slide.id) && Boolean(slide.content);
    const [showCards, setShowCards] = useState(!collapsible);
    useDetailsToggle(() => setShowCards(v => !v), collapsible);
    const hasCards = collapsible && slide.cards.length > 0;
    useEffect(() => {
        if (!hasCards) return;
        const { addAvailable } = useDetailsStore.getState();
        addAvailable(1);
        return () => addAvailable(-1);
    }, [hasCards]);
    useEffect(() => {
        if (hasCards) useDetailsStore.getState().setOpen(showCards);
    }, [hasCards, showCards]);

    // Sem staggerChildren: cada cartão já tem o próprio stagger(idx, 0.05).
    const container = { hidden: { opacity: 1 }, show: { opacity: 1 } };

    return (
        <div className="w-full flex flex-col justify-center py-4 px-8 relative z-10 max-w-[1200px] mx-auto pointer-events-auto">

            <div className="flex flex-col w-full justify-center">

                <SlideHeader title={slide.title} subtitle={slide.subtitle} />

                {/* Custom component content (sem entrada própria: o slide inteiro já esmaece) */}
                {slide.content && (
                    <div className="prose prose-invert prose-lg max-w-none mb-6 text-gray-200 drop-shadow-md pointer-events-auto">
                        {renderSlideContent(slide.content, { collapseAfter: collapsible })}
                    </div>
                )}

                {/* Cards grid */}
                <AnimatePresence initial={false}>
                    {showCards && slide.cards.length > 0 && (
                        <motion.div
                            key="cards"
                            variants={container}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, transition: { duration: DUR.exit } }}
                            className={cn('grid gap-5 w-full', gridColumns(slide.cards.length))}
                        >
                            {slide.cards.map((card, idx) => (
                                <BentoCard key={idx} card={card} idx={idx} />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
