import React, { useState } from 'react';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { Dna, FlaskConical, AlertTriangle, Zap, Shield, Activity, ChevronDown } from 'lucide-react';
import type { SlideSchema } from './TitleSlide';
import { cn } from '../../lib/utils';
import { renderSlideContent } from './slideContent';

// Map card index to a contextual icon and accent color
const CARD_THEMES = [
    { Icon: Dna, accent: '#3b82f6', glow: 'rgba(59,130,246,0.25)', bg: 'rgba(59,130,246,0.08)' },
    { Icon: FlaskConical, accent: '#a855f7', glow: 'rgba(168,85,247,0.25)', bg: 'rgba(168,85,247,0.08)' },
    { Icon: Activity, accent: '#10b981', glow: 'rgba(16,185,129,0.25)', bg: 'rgba(16,185,129,0.08)' },
    { Icon: AlertTriangle, accent: '#e11d48', glow: 'rgba(225,29,72,0.30)', bg: 'rgba(225,29,72,0.10)' },
    { Icon: Zap, accent: '#f59e0b', glow: 'rgba(245,158,11,0.25)', bg: 'rgba(245,158,11,0.08)' },
    { Icon: Shield, accent: '#06b6d4', glow: 'rgba(6,182,212,0.25)', bg: 'rgba(6,182,212,0.08)' },
];

// Alternating entrance directions for cards
const DIRECTIONS = [
    { x: -60, y: 40 },
    { x: 60, y: 40 },
    { x: -60, y: 60 },
    { x: 60, y: 60 },
    { x: -40, y: 50 },
    { x: 40, y: 50 },
];

interface CardProps {
    card: { title: string; attributes: string[]; rawHtml: string };
    idx: number;
}

const BentoCard: React.FC<CardProps> = ({ card, idx }) => {
    const theme = CARD_THEMES[idx % CARD_THEMES.length];
    const dir = DIRECTIONS[idx % DIRECTIONS.length];
    const { Icon } = theme;

    const cardVariant: Variants = {
        hidden: { opacity: 0, x: dir.x, y: dir.y, filter: 'blur(12px)', scale: 0.92 },
        show: {
            opacity: 1, x: 0, y: 0, filter: 'blur(0px)', scale: 1,
            transition: { type: 'spring', stiffness: 160, damping: 22, delay: idx * 0.1 }
        }
    };

    const listItem: Variants = {
        hidden: { opacity: 0, x: -16 },
        show: (i: number) => ({
            opacity: 1, x: 0,
            transition: { delay: 0.3 + idx * 0.1 + i * 0.07, duration: 0.45, ease: 'easeOut' }
        })
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
                boxShadow: `0 20px 60px -10px ${theme.glow}, 0 0 0 1px ${theme.accent}55`,
                borderColor: `${theme.accent}66`,
                transition: { type: 'spring', stiffness: 300, damping: 24 }
            }}
        >
            {/* Shimmer top border */}
            <motion.div
                className="absolute top-0 left-0 w-full h-[2px]"
                style={{
                    background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
                    opacity: 0.3,
                }}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: idx * 0.4 }}
            />

            {/* Glow blob on hover */}
            <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${theme.glow} 0%, transparent 70%)` }}
            />

            {/* Animated corner accent */}
            <motion.div
                className="absolute bottom-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at bottom right, ${theme.accent}, transparent 70%)` }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.3 }}
            />

            {/* Header */}
            <div className="flex items-start gap-4 mb-5 relative z-10">
                <motion.div
                    className="flex-shrink-0 p-3 rounded-xl border border-white/8"
                    style={{ background: theme.bg }}
                    whileHover={{ scale: 1.12, rotate: 6 }}
                    animate={{
                        boxShadow: [`0 0 0px ${theme.accent}00`, `0 0 12px ${theme.accent}55`, `0 0 0px ${theme.accent}00`]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.5 }}
                >
                    <Icon className="w-6 h-6" style={{ color: theme.accent }} />
                </motion.div>

                <h3 className="text-xl font-display font-semibold leading-tight whitespace-pre-line transition-colors duration-300 pt-0.5"
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
                            <motion.span
                                className="flex-shrink-0 mt-[5px] w-1.5 h-1.5 rounded-full"
                                style={{ background: theme.accent }}
                                animate={{ scale: [1, 1.4, 1], opacity: [0.7, 1, 0.7] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                            />
                            <span>{attr}</span>
                        </motion.li>
                    ))}
                </ul>
            )}

            {/* Bottom separator glow line */}
            <motion.div
                className="absolute bottom-0 left-0 h-[1px] w-0 group-hover:w-full transition-all duration-700"
                style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}44, transparent)` }}
            />
        </motion.div>
    );
};

/**
 * Slides em que o componente interativo já ocupa a tela: os cartões de detalhamento
 * ficam atrás de um botão, senão o slide inteiro encolhe até o texto ficar ilegível.
 */
const COLLAPSED_CARD_SLIDES = new Set<number>([3, 6, 22]);

const gridColumns = (count: number) =>
    count === 1 ? 'grid-cols-1 max-w-4xl mx-auto' :
        count === 2 ? 'grid-cols-2 max-w-5xl mx-auto' :
            count === 4 ? 'grid-cols-2 max-w-6xl mx-auto' :
                'grid-cols-3';

export const BentoSlide = ({ slide }: { slide: SlideSchema }) => {
    const collapsible = COLLAPSED_CARD_SLIDES.has(slide.id) && Boolean(slide.content);
    const [showCards, setShowCards] = useState(!collapsible);

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.15 }
        }
    };

    return (
        <div className="w-full flex flex-col justify-center py-4 px-8 relative z-10 max-w-[1200px] mx-auto pointer-events-auto">

            <div className="flex flex-col w-full justify-center">

                {/* Header */}
                <div className="mb-10 pointer-events-none">
                    <motion.div
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="h-[3px] w-20 mb-5 rounded-full origin-left"
                        style={{ background: 'linear-gradient(90deg, #e11d48, #9c27b0)' }}
                    />
                    <motion.h2
                        initial={{ opacity: 0, x: -40, filter: 'blur(8px)' }}
                        whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        className="text-4xl md:text-6xl font-display font-semibold mb-4 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                    >
                        {slide.title}
                    </motion.h2>
                    {slide.subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 12 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ delay: 0.25, duration: 0.6 }}
                            className="text-xl md:text-2xl text-brand-red font-light drop-shadow-md max-w-3xl"
                        >
                            {slide.subtitle}
                        </motion.p>
                    )}
                </div>

                {/* Custom component content */}
                {slide.content && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: false, amount: 0.3 }}
                        transition={{ duration: 0.7 }}
                        className="prose prose-invert prose-lg max-w-none mb-10 text-gray-200 drop-shadow-md pointer-events-auto"
                    >
                        {renderSlideContent(slide.content)}
                    </motion.div>
                )}

                {collapsible && slide.cards.length > 0 && (
                    <button
                        type="button"
                        onClick={() => setShowCards(v => !v)}
                        aria-expanded={showCards}
                        className="self-center -mt-4 mb-6 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium text-gray-200 bg-white/[0.05] border border-white/15 hover:border-brand-red/60 hover:text-white hover:bg-brand-red/10 transition-colors"
                    >
                        {showCards ? 'Ocultar detalhamento' : `Mostrar detalhamento (${slide.cards.length} cartões)`}
                        <ChevronDown size={16} className={`transition-transform duration-300 ${showCards ? 'rotate-180' : ''}`} />
                    </button>
                )}

                {/* Cards grid */}
                <AnimatePresence initial={false}>
                    {showCards && slide.cards.length > 0 && (
                        <motion.div
                            key="cards"
                            variants={container}
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
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
