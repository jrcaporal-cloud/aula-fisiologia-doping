import { motion, MotionConfig } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSlideSteps } from '../../../store/useSlideSteps';
import { LabPanel } from './LabPanel';
import { ProfileCard } from './ProfileCard';
import { ReasoningColumn } from './ReasoningColumn';
import { CARD_BG, CASE_HEIGHT, CASE_STEPS, type CaseData } from './types';

interface CaseFileProps {
    readonly data: CaseData;
}

const buildEvidence = (data: CaseData, active: boolean): ReadonlyMap<string, readonly number[]> => {
    const map = new Map<string, number[]>();
    if (!active) return map;
    data.hypothesis.items.forEach((item, i) => {
        item.evidence?.forEach(id => map.set(id, [...(map.get(id) ?? []), i]));
    });
    return map;
};

/**
 * Ficha de caso clínico em três colunas: relato → exames → raciocínio.
 * O passador revela: 0 relato e pergunta · 1 exames · 2 hipótese · 3 conduta/lição.
 * "Esconder resposta" vela os passos 2 e 3 até o professor revelar.
 */
export const CaseFile = ({ data }: CaseFileProps) => {
    const { step, setStep } = useSlideSteps(CASE_STEPS);
    const [hidden, setHidden] = useState(false);
    const revealed = !hidden;
    const evidence = useMemo(() => buildEvidence(data, step >= 2 && revealed), [data, step, revealed]);
    const center = data.center;

    return (
        <MotionConfig reducedMotion="user">
            <div className="w-full font-body text-white pointer-events-auto select-none flex flex-col" style={{ height: CASE_HEIGHT }}>
                <div className="flex items-center justify-between gap-4 h-[36px] mb-2 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0 truncate">
                            <span className="font-display text-[18px] font-semibold" style={{ color: data.accent }}>{data.stepNames[step]}</span>
                            <span className="text-[15px] text-gray-200"> · {data.stepCaptions[step]}</span>
                        </motion.div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                        <div className="flex items-center gap-1 rounded-xl border border-white/10 p-1" style={{ background: 'rgba(255,255,255,0.03)' }}>
                            {data.stepNames.map((name, i) => {
                                const active = i === step;
                                return (
                                    <button key={name} type="button" onClick={() => setStep(i)}
                                        className="relative px-2.5 py-1 rounded-lg text-[14px] font-semibold cursor-pointer transition-colors"
                                        style={{ color: active ? '#fff' : i < step ? '#E5E7EB' : '#C4C9D2' }}>
                                        {active && (
                                            <motion.span layoutId={`cf-step-${data.caseNumber}`} className="absolute inset-0 rounded-lg"
                                                style={{ background: `${data.accent}26`, border: `1px solid ${data.accent}99` }}
                                                transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                                        )}
                                        <span className="relative">{i + 1}. {name}</span>
                                    </button>
                                );
                            })}
                        </div>
                        <button type="button" onClick={() => setHidden(h => !h)} aria-pressed={hidden}
                            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[14px] font-semibold cursor-pointer border transition-colors"
                            style={hidden
                                ? { borderColor: 'rgba(245,158,11,0.7)', background: 'rgba(245,158,11,0.14)', color: '#FDE68A' }
                                : { borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)', color: '#E5E7EB' }}>
                            {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
                            {hidden ? 'Resposta oculta' : 'Esconder resposta'}
                        </button>
                    </div>
                </div>

                <div className="grid gap-3 flex-1 min-h-0" style={{ gridTemplateColumns: '280px minmax(0,1fr) 370px' }}>
                    <ProfileCard data={data} step={step} revealed={revealed} />
                    <div className="rounded-2xl border border-white/10 p-3 flex flex-col min-h-0" style={CARD_BG}>
                        <div className="font-mono text-[14px] uppercase tracking-tight text-gray-200 mb-1.5">{center.title}</div>
                        <div className="flex-1 min-h-0">
                            {center.kind === 'labs'
                                ? <LabPanel rows={center.rows} layout={center.layout} step={step} evidence={evidence} />
                                : <center.Scene step={step} revealed={revealed} />}
                        </div>
                    </div>
                    <ReasoningColumn hypothesis={data.hypothesis} lesson={data.lesson} step={step} revealed={revealed}
                        accent={data.accent} onReveal={() => setHidden(false)} />
                </div>
            </div>
        </MotionConfig>
    );
};
