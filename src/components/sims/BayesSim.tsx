import { motion } from 'framer-motion';
import { Plus, RotateCcw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { BayesChart } from './bayes/BayesChart';
import { STEPS, STEP_COUNT } from './bayes/content';
import { MIN_BASELINE, SCRIPT, analyze } from './bayes/model';
import { TextPanel } from './bayes/TextPanel';

/**
 * Slide "Como Funciona o Algoritmo Bayesiano?": a mecânica da atualização, exame a exame.
 * 0 limite universal estático · 1 priori · 2–3 atualização · 4 corredor adaptativo (3 exames) · 5 ATF.
 * O professor pode arrastar qualquer exame (ou o próximo) para ver o corredor se recalcular.
 */

const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const BayesSim = () => {
    const { step, setStep } = useSlideSteps(STEP_COUNT);
    const [values, setValues] = useState<readonly number[]>(SCRIPT);
    const info = STEPS[step];
    const visible = info.exams;
    const fixedOnly = step === 0;

    const analysis = useMemo(() => analyze(values, visible), [values, visible]);
    const onChange = useCallback((k: number, v: number) => {
        setValues(prev => prev.map((x, i) => (i === k ? v : x)));
    }, []);

    const lastFlagged = visible > 0 && analysis.slots[visible - 1].flagged;
    const lastInside = step === STEP_COUNT - 1 && !lastFlagged;
    const title = lastInside ? 'Dentro do túnel' : info.title;
    const caption = lastInside ? 'Arraste o exame 4 para fora do corredor azul.' : info.caption;
    const color = lastInside ? '#6EE7B7' : info.color;
    const canCollect = step < STEP_COUNT - 1;

    const status = fixedOnly ? 'régua fixa'
        : analysis.currentN === 0 ? 'base: 0 exames'
            : `base: ${analysis.currentN} ${analysis.currentN === 1 ? 'exame' : 'exames'}${analysis.currentN >= MIN_BASELINE ? ' · túnel ativo' : ''}`;

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ height: 512 }}>
            <div className="flex items-center justify-between gap-4 h-[38px] mb-2">
                <motion.div key={`${step}-${title}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0">
                    <span className="font-display text-[17px] font-semibold" style={{ color }}>{title}</span>
                    <span className="text-[15px] text-gray-200"> · {caption}</span>
                </motion.div>
                <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[14px] text-gray-100 px-2.5 py-1 rounded-lg border border-white/10 whitespace-nowrap" style={CARD_BG}>{status}</span>
                    <button type="button" onClick={() => setStep(step + 1)} disabled={!canCollect}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[14px] font-semibold cursor-pointer border transition-colors hover:brightness-125 whitespace-nowrap disabled:opacity-40 disabled:cursor-default"
                        style={{ background: 'rgba(96,165,250,0.16)', borderColor: 'rgba(96,165,250,0.6)', color: '#DBEAFE' }}>
                        <Plus size={15} /> {step === 0 ? 'Iniciar modelo' : 'Coletar exame'}
                    </button>
                    <button type="button" onClick={() => { setValues(SCRIPT); setStep(0); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[14px] font-semibold cursor-pointer border border-white/15 text-gray-200 hover:bg-white/5 transition-colors"
                        style={CARD_BG}>
                        <RotateCcw size={14} /> Reiniciar
                    </button>
                </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 344px', height: 466 }}>
                <div className="rounded-2xl border border-white/10 px-3 pt-3 pb-1" style={CARD_BG}>
                    <BayesChart values={values} analysis={analysis} visibleCount={visible} fixedOnly={fixedOnly}
                        showLikelihood={step >= 2} onChange={onChange} />
                </div>
                <TextPanel step={step} />
            </div>
        </div>
    );
};

export default BayesSim;
