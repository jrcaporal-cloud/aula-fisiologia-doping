import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { CARDIO_VITALS, type CardioPhase } from '../../data/cardioSteps';
import { PANEL_BG, StepTabs } from './peptide/ui';
import { Convergence } from './cardio/Convergence';
import { PhaseToggle } from './cardio/PhaseToggle';
import { PressureTrace } from './cardio/PressureTrace';
import { VentricleSvg } from './cardio/VentricleSvg';
import { VesselStrip } from './cardio/VesselStrip';
import { Vitals } from './cardio/Vitals';
import { panelState, type CardioFocus } from './cardio/focus';
import { createHeartClock } from './cardio/heart';
import { useTweenedVitals } from './cardio/useTweenedVitals';

/**
 * "O Coração sob Esteroides" (Ato III). Quatro etapas somam os colaterais cardiovasculares dos
 * EAA sobre o mesmo coração e a quinta mostra onde eles convergem. Os números vêm de
 * `CARDIO_VITALS` — a mesma tabela que o modelo 3D usa, para os dois não divergirem.
 *
 * Ventrículo, onda de pressão e fluxo no vaso batem no mesmo relógio. O seletor "em uso ×
 * depois de parar" (tecla R) troca os números do slide inteiro, em transição.
 */

interface CardioStep {
    tab: string;
    headline: string;
    text: string;
    /** Narração do mesmo passo no estado "depois de parar" (o treinado não tem). */
    afterText?: string;
    /** Índice na tabela de vitais (etapas do modelo 3D). */
    vitals: number;
}

const STEPS: readonly CardioStep[] = [
    {
        tab: 'Treinado',
        headline: 'O ponto de partida',
        text: 'O treino já remodela o coração: a parede engrossa e a cavidade acompanha, de modo que o volume ejetado sobe. É com este coração que o remodelamento induzido precisa ser comparado — não com o de um sedentário.',
        vitals: 1,
    },
    {
        tab: 'Hipertrofia',
        headline: 'A parede cresce para dentro',
        text: 'O miócito cardíaco tem receptor androgênico, e a sobrecarga de pressão soma. A parede engrossa sem que a cavidade acompanhe. O detalhe prático: a relação E/A do Doppler transmitral costuma vir normal — quem mostra o relaxamento prejudicado é o E′ do Doppler tecidual.',
        afterText: 'Em quem para de verdade, a massa regride e a fração de ejeção volta. O relaxamento melhora pouco: o E′ e o strain seguem piores que os dos controles, mesmo anos depois.',
        vitals: 3,
    },
    {
        tab: 'Pressão',
        headline: 'A pós-carga realimenta a hipertrofia',
        text: 'Atividade simpática aumentada, peptídeos natriuréticos suprimidos e aorta mais rígida elevam a pressão — cerca de metade dos usuários tem hipertensão sistólica na medida de 24 horas. Cada sístole vence uma pressão maior, e a sobrecarga alimenta de volta o espessamento.',
        afterText: 'A pressão cai de volta (neste caso, de 142/82 para 128/78), mas a rigidez da aorta não volta: a distensibilidade segue cerca de 21% menor também em ex-usuários.',
        vitals: 4,
    },
    {
        tab: 'Sangue e vaso',
        headline: 'Sangue espesso, vaso que não dilata',
        text: 'A testosterona eleva a eritropoetina e derruba a hepcidina: o hematócrito sobe até a faixa em que a diretriz manda intervir, e a viscosidade sobe mais que proporcionalmente. Ao mesmo tempo o HDL despenca e cresce placa não calcificada — a que o escore de cálcio não enxerga.',
        afterText: 'O hematócrito volta à faixa e os lipídios voltam em cerca de três meses. A placa que já se formou não regride: o volume de placa não difere entre quem usa e quem parou.',
        vitals: 6,
    },
    {
        tab: 'Convergência',
        headline: 'Nenhum mecanismo isolado explica o risco',
        text: 'Quatro mecanismos no mesmo paciente. Numa coorte de registro com cerca de 11 anos de seguimento, os desfechos aparecem todos juntos — e nenhum deles tem um culpado único.',
        vitals: 7,
    },
];

/** Comparação de todos os passos: o coração treinado (etapa 1 da tabela). */
const BASELINE = CARDIO_VITALS.uso[1];

/** Painel do desenho que acende ou apaga conforme a linha do painel hemodinâmico em foco. */
const Frame = ({ state, className = '', children }: { state: 'idle' | 'active' | 'dim'; className?: string; children: ReactNode }) => (
    <div className={`relative overflow-hidden rounded-2xl border transition-[opacity,border-color,box-shadow] duration-300 ${className}`}
        style={{
            ...PANEL_BG,
            borderColor: state === 'active' ? 'rgba(253,164,175,0.7)' : 'rgba(255,255,255,0.1)',
            boxShadow: state === 'active' ? '0 0 0 1px rgba(253,164,175,0.35), 0 0 30px -8px rgba(225,29,72,0.7)' : 'none',
            opacity: state === 'dim' ? 0.55 : 1,
        }}>
        {children}
    </div>
);

export default function CardioSim() {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const reduce = useReducedMotion() ?? false;
    const [phase, setPhase] = useState<CardioPhase>('uso');
    const [hover, setHover] = useState<CardioFocus | null>(null);
    const [pinned, setPinned] = useState<CardioFocus | null>(null);
    const focus = hover ?? pinned;

    const plan = STEPS[step];
    const last = step === STEPS.length - 1;
    const afterStopping = phase === 'apos';
    const showAfterText = afterStopping && plan.afterText !== undefined;
    const tabs = useMemo(() => STEPS.map(s => s.tab), []);

    const { display, ref: vitalsRef } = useTweenedVitals(CARDIO_VITALS[phase][plan.vitals], reduce);

    // Um relógio só: ventrículo, pulso e vaso leem a mesma fase do batimento.
    const clock = useMemo(() => createHeartClock(), []);
    useEffect(() => {
        clock.configure(vitalsRef, reduce);
    }, [clock, vitalsRef, reduce]);

    const togglePin = useCallback((key: CardioFocus) => setPinned(p => (p === key ? null : key)), []);

    // R alterna o estado sem tirar a mão do passador. O modal 3D tem o seu próprio R.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if ((e.key !== 'r' && e.key !== 'R') || e.metaKey || e.ctrlKey || e.altKey) return;
            if (document.querySelector('[role="dialog"]')) return;
            setPhase(p => (p === 'uso' ? 'apos' : 'uso'));
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    return (
        <div className="not-prose flex w-full select-none flex-col gap-3 font-body text-white" style={{ height: 516 }}>
            <div className="flex items-center justify-between gap-3">
                <StepTabs labels={tabs} step={step} onSelect={setStep} layoutId="cardio-tabs" />
                <div className="flex items-center gap-3">
                    <PhaseToggle phase={phase} onChange={setPhase} />
                    <span className="shrink-0 whitespace-nowrap rounded-md border border-amber-400/50 px-2.5 py-1 font-mono text-[14px] text-amber-200" style={PANEL_BG}>
                        valores ilustrativos
                    </span>
                </div>
            </div>

            <div className="flex min-h-0 flex-1 gap-3">
                {last ? (
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                        <Frame state="idle" className="min-h-0 flex-1">
                            <Convergence phase={phase} />
                        </Frame>
                        <p className="rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-2.5 text-[15px] leading-snug text-sky-50">
                            {afterStopping
                                ? <><strong className="font-semibold">Depois de parar:</strong> o que volta e o que fica em cada mecanismo. Os riscos à direita são de usuários sancionados, sem dose nem tipo de substância, e não medem o risco depois de parar.</>
                                : <><strong className="font-semibold">Passe o mouse num item para isolar as ligações; clique para fixar.</strong> Riscos: razões de risco ajustadas da coorte dinamarquesa (cerca de 11 anos); barras em escala logarítmica, de 1 a 10.</>}
                        </p>
                    </div>
                ) : (
                    <>
                        <Frame state={panelState(focus, 'ventricle')} className="min-w-0 basis-[34%]">
                            <VentricleSvg clock={clock} vitalsRef={vitalsRef} vitals={display} baseline={BASELINE} />
                        </Frame>

                        <div className="flex min-w-0 flex-1 flex-col gap-3">
                            {/* Sem AnimatePresence: trocas rápidas de passo nunca deixam texto antigo na tela. */}
                            <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                                className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 px-5 py-3" style={PANEL_BG}>
                                <h3 className="flex items-center gap-2 font-display text-[1.22rem] font-semibold leading-tight text-white">
                                    <HeartPulse size={22} className="shrink-0 text-rose-300" aria-hidden />
                                    {plan.headline}
                                </h3>
                                <motion.p key={showAfterText ? 'apos' : 'uso'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}
                                    className="mt-1.5 text-[1.02rem] leading-snug"
                                    style={{ color: showAfterText ? '#CFFAFE' : '#F3F4F6' }}>
                                    {showAfterText && (
                                        <span className="mr-2 rounded-full border border-cyan-300/50 bg-cyan-400/15 px-2 py-px font-mono text-[14px] uppercase tracking-wide text-cyan-200">
                                            depois de parar
                                        </span>
                                    )}
                                    {showAfterText ? plan.afterText : plan.text}
                                </motion.p>
                            </motion.div>

                            <Frame state={panelState(focus, 'pressure')} className="h-[100px] shrink-0">
                                <PressureTrace clock={clock} vitalsRef={vitalsRef} vitals={display} baseline={BASELINE} />
                            </Frame>
                            <Frame state={panelState(focus, 'vessel')} className="h-[124px] shrink-0">
                                <VesselStrip clock={clock} vitalsRef={vitalsRef} vitals={display} />
                            </Frame>
                        </div>

                        <div className="w-[282px] shrink-0">
                            <Vitals vitals={display} baseline={BASELINE} focus={focus} pinned={pinned}
                                onHover={setHover} onTogglePin={togglePin} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
