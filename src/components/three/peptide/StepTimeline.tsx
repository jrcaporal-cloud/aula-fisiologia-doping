import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { StepData } from '../../../data/steps';

/*
 * Linha do tempo das etapas (rodapé do modal), com ▶ Reproduzir. Usada pelos 3 modelos 3D.
 * Em tela estreita (< 1180 px, projetor 4:3) encolhe — sem os traços entre etapas, botões menores e ▶ só com
 * ícone — e, se ainda faltar espaço, rola de lado dentro da área da cena (nunca passa por baixo do painel).
 */

interface StepTimelineProps {
    steps: StepData[];
    step: number;
    playing: boolean;
    accent: string;
    onGo: (i: number) => void;
    onTogglePlay: () => void;
}

export const StepTimeline = ({ steps, step, playing, accent, onGo, onTogglePlay }: StepTimelineProps) => {
    const last = steps.length - 1;
    return (
        <div className="pointer-events-auto max-w-full overflow-x-auto flex items-center gap-1.5 min-[1180px]:gap-2 px-3 py-2.5 rounded-full bg-black/80 border border-white/10">
            <button type="button" aria-label="Etapa anterior" onClick={() => onGo(step - 1)} disabled={step === 0}
                className="shrink-0 w-8 h-8 min-[1180px]:w-9 min-[1180px]:h-9 flex items-center justify-center rounded-full text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-25">
                <ChevronLeft size={18} />
            </button>
            {steps.map((s, i) => (
                <div key={s.id} className="shrink-0 flex items-center gap-1.5 min-[1180px]:gap-2">
                    {i > 0 && (
                        <div className="hidden min-[1180px]:block w-4 h-px bg-white/15 relative overflow-hidden">
                            <div className={`absolute inset-0 transition-transform duration-700 ${i <= step ? 'translate-x-0' : '-translate-x-full'}`} style={{ background: accent }} />
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => onGo(i)}
                        title={s.short}
                        aria-label={`${s.badge}: ${s.title}`}
                        aria-current={i === step ? 'step' : undefined}
                        className={`w-8 h-8 min-[1180px]:w-9 min-[1180px]:h-9 rounded-full text-[14px] font-semibold transition-[background-color,border-color,color] duration-300 ${i === step
                            ? 'text-white border-2'
                            : i < step
                                ? 'bg-white/5 border hover:bg-white/10'
                                : 'bg-white/5 border border-white/15 text-gray-400 hover:border-white/30 hover:text-gray-100'}`}
                        style={i === step
                            ? { background: `${accent}33`, borderColor: accent }
                            : i < step ? { borderColor: `${accent}66`, color: accent } : undefined}
                    >
                        {i === 0 ? '●' : i}
                    </button>
                </div>
            ))}
            <button type="button" aria-label="Próxima etapa" onClick={() => onGo(step + 1)} disabled={step === last}
                className="shrink-0 w-8 h-8 min-[1180px]:w-9 min-[1180px]:h-9 flex items-center justify-center rounded-full text-gray-300 hover:text-white hover:bg-white/10 disabled:opacity-25">
                <ChevronRight size={18} />
            </button>
            <span className="shrink-0 w-px h-6 bg-white/10" />
            <button type="button" onClick={onTogglePlay}
                aria-label={playing ? 'Pausar sequência automática (Espaço)' : 'Reproduzir sequência automática (Espaço)'}
                className="shrink-0 flex items-center gap-2 px-2.5 min-[1180px]:pl-3 min-[1180px]:pr-4 h-8 min-[1180px]:h-9 rounded-full text-[14px] text-gray-200 hover:text-white hover:bg-white/10">
                {playing ? <Pause size={15} aria-hidden /> : <Play size={15} aria-hidden />}
                <span className="hidden min-[1180px]:inline">{playing ? 'Pausar' : 'Reproduzir'}</span>
            </button>
        </div>
    );
};
