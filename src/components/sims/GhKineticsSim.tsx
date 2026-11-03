import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { COLORS, STEPS } from './ghkinetics/content';
import { CONTROL_T, INJ_T, T_MAX, clockLabel, type Route } from './ghkinetics/model';
import { SidePanel } from './ghkinetics/SidePanel';
import { AcromegalyStage } from './ghkinetics/Acromegaly';
import { TimelineChart } from './ghkinetics/TimelineChart';

/**
 * Slide "A Farmacocinética do GH Exógeno — por que o hGH é quase impossível de detectar".
 * Uma noite em gráfico (22h → 23h do dia seguinte).
 * Passos: 0 pulsos naturais (N3) · 1 injeção às 23h que se disfarça · 2 meia-vida e controle às 6h
 * · 3 isoformas 20/22 kDa (janela < 12 h, coleta móvel) · 4 IGF-1 como proxy (t½ ~15 h, ABP > 3 DP) · 5 acromegalia.
 */

const CARD_BG = { background: 'rgba(8,8,18,0.72)' };
const ROUTES: readonly { id: Route; label: string }[] = [{ id: 'sc', label: 'SC' }, { id: 'iv', label: 'IV' }];

const GhKineticsSim = () => {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const [route, setRoute] = useState<Route>('sc');
    const [collectT, setCollectT] = useState(CONTROL_T);
    const info = STEPS[step];

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: 488 }}>
            <div className="flex items-center justify-between gap-4 h-[42px] mb-1.5">
                <div className="flex items-center gap-3 min-w-0">
                    <motion.span key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                        className="font-display text-[18px] font-semibold truncate" style={{ color: info.color }}>
                        {info.title}
                    </motion.span>
                </div>
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 p-1 shrink-0" style={CARD_BG} role="tablist" aria-label="Passos">
                    {STEPS.map((s, i) => {
                        const active = i === step;
                        return (
                            <button key={s.label} type="button" role="tab" aria-selected={active} onClick={() => setStep(i)}
                                className="relative px-2.5 py-1.5 rounded-xl text-[15px] font-semibold cursor-pointer transition-colors"
                                style={{ color: active ? '#fff' : '#D1D5DB' }}>
                                {active && (
                                    <motion.span layoutId="ghk-step" className="absolute inset-0 rounded-xl"
                                        style={{ background: `${s.color}22`, border: `1px solid ${s.color}99` }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                                )}
                                <span className="relative flex items-center gap-1.5">
                                    <span className="font-mono text-[14px]" style={{ color: s.color }}>{i + 1}</span>
                                    {s.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 360px', height: 440 }}>
                <div className="rounded-2xl border border-white/10 px-3.5 pt-2 pb-1.5 flex flex-col min-h-0" style={CARD_BG}>
                    <div className="flex items-center justify-between gap-3 min-h-[30px]">
                        <motion.span key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
                            className="text-[15px] leading-tight text-gray-100">{info.caption}</motion.span>
                        <div className="flex items-center gap-2 shrink-0">
                            {(step === 1 || step === 2) && (
                                <div className="flex items-center gap-0.5 rounded-lg border border-white/15 p-0.5" role="radiogroup" aria-label="Via de aplicação">
                                    {ROUTES.map(r => (
                                        <button key={r.id} type="button" role="radio" aria-checked={route === r.id} onClick={() => setRoute(r.id)}
                                            className="px-2.5 py-0.5 rounded-md text-[14px] font-semibold cursor-pointer transition-colors"
                                            style={route === r.id ? { background: 'rgba(245,158,11,0.22)', color: '#FDE68A' } : { color: '#D1D5DB' }}>
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                            <span className="text-[14px] font-mono uppercase tracking-wide px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                                modelo ilustrativo
                            </span>
                        </div>
                    </div>
                    <div className="relative flex-1 min-h-0">
                        {step === 5 ? <AcromegalyStage /> : <TimelineChart step={step} route={route} collectT={collectT} />}
                    </div>
                    {step === 3 && (
                        <label className="flex items-center gap-3 h-[28px] text-[15px] text-gray-100">
                            <span className="shrink-0 font-semibold" style={{ color: COLORS.iso20 }}>Hora da coleta</span>
                            <input type="range" min={INJ_T + 0.5} max={T_MAX - 0.5} step={0.25} value={collectT}
                                onChange={e => setCollectT(Number(e.target.value))}
                                className="flex-1 cursor-pointer" style={{ accentColor: COLORS.iso20 }} aria-label="Hora da coleta" />
                            <span className="shrink-0 w-[60px] text-right font-mono">{clockLabel(collectT)}</span>
                        </label>
                    )}
                </div>
                <SidePanel step={step} collectT={collectT} />
            </div>
        </div>
    );
};

export default GhKineticsSim;
