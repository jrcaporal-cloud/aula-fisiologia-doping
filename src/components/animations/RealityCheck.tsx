import { useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { useSlideSteps } from '../../store/useSlideSteps';
import { DataDrawer } from './reality/DataDrawer';
import { StadiumGrid } from './reality/StadiumGrid';
import { StatReadout } from './reality/StatReadout';
import { COLORS, PANELS, REAL, REVEAL_STEP, STEP_LABELS, WADA, WAVE_TOTAL_S, type PanelId } from './reality/data';

/** Palpite da turma fica guardado durante a aula: o slide 26 retoma o mesmo número. */
const useClassGuess = create<{
    guess: number | null;
    /** A revelação completa já aconteceu (slide 2): a reaparição no slide 26 vira recapitulação. */
    revealedOnce: boolean;
    setGuess: (g: number) => void;
    markRevealed: () => void;
}>(set => ({
    guess: null,
    revealedOnce: false,
    setGuess: guess => set({ guess }),
    markRevealed: () => set({ revealedOnce: true }),
}));

const STEP_COUNT = STEP_LABELS.length;
const LAST_STEP = STEP_COUNT - 1;

/**
 * "Estádio" de 100 atletas: a turma chuta (âmbar), o antidoping detecta 2 (azul),
 * os atletas admitem 43 (vermelho) — e o que sobra entre os dois é o abismo.
 */
export const RealityCheck = () => {
    const reduced = useReducedMotion() ?? false;
    const [openPanel, setOpenPanel] = useState<PanelId | null>(null);
    // Decidido na montagem: se já houve revelação, este slide é recapitulação (sem passos).
    const [isRecap] = useState(() => useClassGuess.getState().revealedOnce);
    const { step: rawStep } = useSlideSteps(isRecap ? 1 : STEP_COUNT);
    const step = isRecap ? LAST_STEP : rawStep;
    const guess = useClassGuess(s => s.guess);
    const setGuess = useClassGuess(s => s.setGuess);
    const markRevealed = useClassGuess(s => s.markRevealed);
    const [draft, setDraft] = useState(guess ?? 10);

    useEffect(() => {
        if (step >= LAST_STEP) markRevealed();
    }, [step, markRevealed]);

    const shownGuess = guess ?? draft;
    const isShown = (id: PanelId) => step >= REVEAL_STEP[id];
    // Ao voltar um passo, a gaveta de um painel ainda não revelado some sozinha.
    const activePanel = PANELS.find(p => p.id === openPanel && isShown(p.id)) ?? null;
    const toggle = (id: PanelId) => setOpenPanel(cur => (cur === id ? null : id));

    return (
        <div className="not-prose mx-auto mt-1 w-full max-w-[1080px] font-body">

            {/* Palpite da turma: o professor registra o chute (mãos levantadas) antes da revelação. */}
            <div className="mb-4 flex items-center gap-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] px-6 py-3">
                <div className="flex-shrink-0">
                    <p className="text-[12.5px] font-semibold uppercase tracking-[0.25em] text-amber-300/90">Palpite da turma</p>
                    <p className="mt-0.5 text-[15px] text-gray-200">Quantos % dos atletas de elite usam doping?</p>
                </div>
                <input
                    type="range" min={0} max={100} step={1}
                    value={shownGuess}
                    aria-label="Palpite da turma em porcentagem"
                    onChange={e => { const v = Number(e.target.value); setDraft(v); setGuess(v); }}
                    className="h-2 flex-1 cursor-pointer accent-amber-400"
                />
                <span className="w-24 text-right font-display text-4xl font-bold tabular-nums text-amber-300">{shownGuess}%</span>
            </div>

            <div className="flex items-stretch gap-8 rounded-2xl border border-white/10 px-6 py-4"
                style={{ background: 'rgba(8,8,18,0.72)' }}>
                <div className="relative flex-shrink-0">
                    <StadiumGrid step={step} guess={shownGuess} reduced={reduced} />
                    <DataDrawer panel={activePanel} reduced={reduced} onClose={() => setOpenPanel(null)} />
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-4">
                    <StatReadout panel={WADA} shown={isShown('wada')} open={activePanel?.id === 'wada'} reduced={reduced}
                        countDelay={0.25} countDuration={1.1} onToggle={() => toggle('wada')} />
                    <div className="h-px bg-white/10" />
                    <StatReadout panel={REAL} shown={isShown('real')} open={activePanel?.id === 'real'} reduced={reduced}
                        countDelay={0.05} countDuration={WAVE_TOTAL_S + 0.5} onToggle={() => toggle('real')}
                        footnote={
                            <p className="text-[15px] text-amber-200">
                                A turma chutou <strong className="font-bold" style={{ color: COLORS.amberSoft }}>{shownGuess}%</strong>
                            </p>
                        } />
                </div>
            </div>

            <p className="mt-3 text-center text-[13px] uppercase tracking-[0.2em] text-gray-400">
                {isRecap ? 'Recapitulação' : `Passo ${step + 1} de ${STEP_COUNT} · ${STEP_LABELS[step]}`}
                {' · '}
                {step < LAST_STEP ? 'avance para revelar' : 'clique nos painéis para expandir os dados'}
            </p>
        </div>
    );
};
