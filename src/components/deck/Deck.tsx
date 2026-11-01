import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../../store/useStore';
import { TitleSlide } from '../presentation/TitleSlide';
import { BentoSlide } from '../presentation/BentoSlide';
import { ProseSlide } from '../presentation/ProseSlide';
import { QuoteSlide } from '../presentation/QuoteSlide';
import { FitStage } from './FitStage';
import { DeckChrome } from './DeckChrome';
import { Overview } from './Overview';
import { DECK, SLIDES_WITH_3D, type DeckSlide } from './slides';
import { useDeckNavigation } from './useDeckNavigation';
import { useSlideStepStore } from '../../store/useSlideSteps';
import { PRESENTER_CHANNEL, openPresenterWindow, type PresenterMessage } from './presenterChannel';

const renderSlide = ({ slide }: DeckSlide) => {
    if (slide.id === 0) return <TitleSlide slide={slide} />;
    if (!slide.title.trim()) return <QuoteSlide slide={slide} />;
    if (slide.layout === 'bento' || slide.cards?.length > 0) return <BentoSlide slide={slide} />;
    return <ProseSlide slide={slide} />;
};

const IDLE_MS = 2600;

// O modelo 3D (cena + pós-processamento) só é baixado quando alguém o abre.
const Mechanism3DModal = lazy(() =>
    import('../three/Mechanism3DModal').then(m => ({ default: m.Mechanism3DModal }))
);

export const Deck = () => {
    const rootRef = useRef<HTMLDivElement>(null);
    const setSlide = useStore(s => s.setSlide);
    const modalOpen = useStore(s => s.modalOpen);
    const setModalOpen = useStore(s => s.setModalOpen);
    const [overview, setOverview] = useState(false);
    const [show3D, setShow3D] = useState(false);
    const [idle, setIdle] = useState(false);

    const toggleOverview = useCallback(() => setOverview(o => !o), []);
    const closeOverlays = useCallback(() => setOverview(false), []);

    const { index, direction, goTo, next, prev } = useDeckNavigation({
        total: DECK.length,
        paused: modalOpen,
        rootRef,
        onToggleOverview: toggleOverview,
        onCloseOverlays: closeOverlays,
    });

    const current = DECK[index];
    const has3D = SLIDES_WITH_3D.has(current.slide.id);

    useEffect(() => setSlide(index), [index, setSlide]);

    // Sincroniza com a janela do apresentador (P): envia estado, recebe comandos.
    const step = useSlideStepStore(st => st.step);
    const stepCount = useSlideStepStore(st => st.count);
    const channelRef = useRef<BroadcastChannel | null>(null);
    const navRef = useRef({ next, prev, goTo });
    useEffect(() => { navRef.current = { next, prev, goTo }; }, [next, prev, goTo]);
    const stateRef = useRef({ index, step, stepCount });

    useEffect(() => {
        stateRef.current = { index, step, stepCount };
        channelRef.current?.postMessage({ type: 'state', index, step, stepCount } satisfies PresenterMessage);
    }, [index, step, stepCount]);

    useEffect(() => {
        const channel = new BroadcastChannel(PRESENTER_CHANNEL);
        channelRef.current = channel;
        channel.onmessage = (e: MessageEvent<PresenterMessage>) => {
            const msg = e.data;
            if (msg.type === 'next') navRef.current.next();
            else if (msg.type === 'prev') navRef.current.prev();
            else if (msg.type === 'goto') navRef.current.goTo(msg.index);
            else if (msg.type === 'hello') channel.postMessage({ type: 'state', ...stateRef.current } satisfies PresenterMessage);
        };
        return () => { channel.close(); channelRef.current = null; };
    }, []);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (modalOpen || e.metaKey || e.ctrlKey || e.altKey) return;
            if (e.key === 'p' || e.key === 'P') openPresenterWindow(stateRef.current.index);
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [modalOpen]);
    useEffect(() => setModalOpen(show3D), [show3D, setModalOpen]);

    // Atalho "3" abre o modelo 3D quando o slide tem um.
    useEffect(() => {
        if (!has3D || modalOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === '3') setShow3D(true); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [has3D, modalOpen]);

    // Controles e cursor somem quando o mouse fica parado (projeção limpa).
    useEffect(() => {
        let timer = window.setTimeout(() => setIdle(true), IDLE_MS);
        const wake = () => {
            setIdle(false);
            window.clearTimeout(timer);
            timer = window.setTimeout(() => setIdle(true), IDLE_MS);
        };
        window.addEventListener('mousemove', wake);
        window.addEventListener('mousedown', wake);
        return () => {
            window.clearTimeout(timer);
            window.removeEventListener('mousemove', wake);
            window.removeEventListener('mousedown', wake);
        };
    }, []);

    return (
        <div
            ref={rootRef}
            className={`absolute inset-0 z-10 overflow-hidden font-body selection:bg-brand-crimson selection:text-white ${idle && !overview ? 'cursor-none' : ''}`}
        >
            <AnimatePresence initial={false} custom={direction}>
                <motion.section
                    key={index}
                    custom={direction}
                    className="absolute inset-0"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} de ${DECK.length}: ${current.label}`}
                    variants={{
                        enter: (d: number) => ({ opacity: 0, y: d * 40 }),
                        center: { opacity: 1, y: 0 },
                        exit: (d: number) => ({ opacity: 0, y: d * -40 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                    <FitStage>{renderSlide(current)}</FitStage>
                </motion.section>
            </AnimatePresence>

            <DeckChrome
                index={index}
                total={DECK.length}
                section={current.section}
                number={current.slide.number}
                idle={idle}
                has3D={has3D}
                onPrev={prev}
                onNext={next}
                onOverview={toggleOverview}
                on3D={() => setShow3D(true)}
                onPresenter={() => openPresenterWindow(index)}
            />

            <AnimatePresence>
                {overview && (
                    <Overview
                        current={index}
                        onSelect={i => { goTo(i); setOverview(false); }}
                        onClose={() => setOverview(false)}
                    />
                )}
            </AnimatePresence>

            <Suspense fallback={null}>
                <AnimatePresence>
                    {show3D && <Mechanism3DModal onClose={() => setShow3D(false)} />}
                </AnimatePresence>
            </Suspense>
        </div>
    );
};
