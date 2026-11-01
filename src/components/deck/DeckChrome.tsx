import { ChevronLeft, ChevronRight, LayoutGrid, Maximize, Minimize, Box, MonitorSpeaker } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSlideStepStore } from '../../store/useSlideSteps';

interface DeckChromeProps {
    index: number;
    total: number;
    section: string;
    number: string | null;
    idle: boolean;
    has3D: boolean;
    onPrev: () => void;
    onNext: () => void;
    onOverview: () => void;
    on3D: () => void;
    onPresenter: () => void;
}

const useFullscreen = () => {
    const [isFull, setIsFull] = useState(Boolean(document.fullscreenElement));
    useEffect(() => {
        const sync = () => setIsFull(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', sync);
        return () => document.removeEventListener('fullscreenchange', sync);
    }, []);
    const toggle = () => {
        if (document.fullscreenElement) void document.exitFullscreen();
        else void document.documentElement.requestFullscreen?.();
    };
    return { isFull, toggle };
};

const pad = (n: number) => String(n).padStart(2, '0');

const IconButton = ({ label, onClick, disabled, children }: {
    label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode;
}) => (
    <button
        type="button"
        aria-label={label}
        title={label}
        onClick={onClick}
        disabled={disabled}
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:pointer-events-none transition-colors focus-visible:outline-2 focus-visible:outline-brand-red"
    >
        {children}
    </button>
);

/** Barra de progresso, seção atual, contador e controles — somem com o mouse parado. */
export const DeckChrome = ({ index, total, section, number, idle, has3D, onPrev, onNext, onOverview, on3D, onPresenter }: DeckChromeProps) => {
    const { isFull, toggle } = useFullscreen();
    const step = useSlideStepStore(s => s.step);
    const stepCount = useSlideStepStore(s => s.count);
    const progress = total > 1 ? index / (total - 1) : 1;
    const fade = idle ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0';

    return (
        <>
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/5 z-30" aria-hidden>
                <div
                    className="h-full bg-gradient-to-r from-brand-crimson via-brand-red to-fuchsia-500 transition-[width] duration-500 ease-out"
                    style={{ width: `${progress * 100}%` }}
                />
            </div>

            {section && (
                <div className={`absolute top-5 left-7 z-30 flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-gray-400 pointer-events-none transition-all duration-500 ${idle ? 'opacity-40' : 'opacity-80'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-red shadow-[0_0_8px_#e11d48]" />
                    {number && <span className="font-mono text-gray-500">{number}</span>}
                    <span>{section}</span>
                </div>
            )}

            {has3D && (
                <button
                    type="button"
                    onClick={on3D}
                    className={`absolute bottom-6 left-7 z-30 flex items-center gap-2 pl-3 pr-4 py-2 rounded-full text-sm text-white bg-gradient-to-r from-cyan-500/25 to-fuchsia-500/25 border border-cyan-300/30 hover:border-cyan-200/70 shadow-[0_0_30px_-6px_rgba(34,211,238,0.6)] backdrop-blur-md transition-all duration-500 ${idle ? 'opacity-60' : 'opacity-100'}`}
                >
                    <Box size={16} className="text-cyan-300" />
                    Ver mecanismo em 3D
                    <kbd className="deck-kbd ml-1">3</kbd>
                </button>
            )}

            <nav
                aria-label="Navegação dos slides"
                className={`absolute bottom-5 right-6 z-30 flex items-center gap-1 px-2 py-1.5 rounded-full bg-black/55 border border-white/10 backdrop-blur-md transition-all duration-500 ${fade}`}
            >
                <IconButton label="Slide anterior (←)" onClick={onPrev} disabled={index === 0}>
                    <ChevronLeft size={18} />
                </IconButton>
                {stepCount > 1 && (
                    <span className="flex items-center gap-1 pl-1" aria-label={`Passo ${step + 1} de ${stepCount}`}>
                        {Array.from({ length: stepCount }, (_, i) => (
                            <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-4 bg-brand-red' : i < step ? 'w-1.5 bg-brand-red/60' : 'w-1.5 bg-white/20'}`} />
                        ))}
                    </span>
                )}
                <span className="px-2 font-mono text-xs text-gray-300 tabular-nums select-none">
                    {pad(index + 1)}<span className="text-gray-600"> / {pad(total)}</span>
                </span>
                <IconButton label="Próximo slide (→)" onClick={onNext} disabled={index === total - 1}>
                    <ChevronRight size={18} />
                </IconButton>
                <span className="w-px h-5 bg-white/10 mx-1" />
                <IconButton label="Modo apresentador (P)" onClick={onPresenter}>
                    <MonitorSpeaker size={16} />
                </IconButton>
                <IconButton label="Visão geral (G)" onClick={onOverview}>
                    <LayoutGrid size={16} />
                </IconButton>
                <IconButton label={isFull ? 'Sair da tela cheia (F)' : 'Tela cheia (F)'} onClick={toggle}>
                    {isFull ? <Minimize size={16} /> : <Maximize size={16} />}
                </IconButton>
            </nav>
        </>
    );
};
