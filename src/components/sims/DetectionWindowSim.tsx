import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Pause, Play } from 'lucide-react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { DetectionChart, type ChartMode } from './detection/DetectionChart';
import { COLORS } from './detection/lanes';
import {
    formatRelProva, formatSinceInjection, HOURS_PER_DAY, LONG_DOSES, longConc, nandConc, nandMetab,
    STRAT_THRESH, structuralGain, SUSP_DOSES, suspConc, suspConcD, THRESH,
} from './detection/model';
import { dayFromU, hoursFromU, uFromDay, uFromHours } from './detection/scales';
import { StatusPanel, type GainStatus, type StatusItem } from './detection/StatusPanel';
import { linear, useAnimatedValue } from './detection/useAnimatedValue';

/**
 * Slide "Ação vs Detecção": janela de efeito × janela de detecção.
 * Passo 0: suspensão aquosa (some rápido) · Passo 1: decanoato (rastreio até 18 meses)
 * · Passo 2: a estratégia off-season → clearance window → prova limpa, massa retida.
 */

const STEPS = [
    {
        label: 'Ação curta',
        text: 'Suspensão aquosa: pico quase imediato, meia-vida ~10 h — sai da urina em 1–3 dias.',
    },
    {
        label: 'Éster longo',
        text: 'Decanoato: efeito clínico de 4–6 semanas, mas o metabólito 19-Nor segue rastreável por até 18 meses.',
    },
    {
        label: 'A estratégia',
        text: 'Construir no off-season com éster longo; na clearance window, só ação curta — urina limpa no dia da prova, massa retida.',
    },
] as const;

const PLAY_MS = 9000;

const logStatus = (tH: number, withNand: boolean): StatusItem[] => {
    const items: StatusItem[] = [{
        id: 'susp',
        name: 'Testosterona suspensão',
        color: COLORS.short,
        effect: suspConc(tH) >= THRESH.suspEffect ? 'ativo' : 'residual',
        test: suspConc(tH) >= THRESH.suspDetect ? 'detectável' : 'limpo',
    }];
    if (!withNand) return items;
    return [...items, {
        id: 'nand',
        name: 'Nandrolona (decanoato)',
        color: COLORS.long,
        effect: nandConc(tH) >= THRESH.nandEffect ? 'ativo' : 'residual',
        test: nandMetab(tH) >= THRESH.nandDetect ? 'detectável' : 'limpo',
    }];
};

const stratStatus = (d: number): StatusItem[] => [
    {
        id: 'long',
        name: 'Éster longo (off-season)',
        color: COLORS.long,
        effect: d < LONG_DOSES[0] ? 'sem uso' : longConc(d) >= STRAT_THRESH.longEffect ? 'ativo' : 'residual',
        test: longConc(d) >= STRAT_THRESH.longDetect ? 'detectável' : 'limpo',
    },
    {
        id: 'suspD',
        name: 'Suspensão (clearance window)',
        color: COLORS.short,
        effect: d < SUSP_DOSES[0] ? 'sem uso' : suspConcD(d) >= STRAT_THRESH.suspEffect ? 'ativo' : 'residual',
        test: suspConcD(d) >= STRAT_THRESH.suspDetect ? 'detectável' : 'limpo',
    },
];

const DetectionWindowSim = () => {
    const { step } = useSlideSteps(STEPS.length);
    const reduced = useReducedMotion() ?? false;
    const mode: ChartMode = step < 2 ? 'log' : 'strat';

    const mix = useAnimatedValue(0);
    const logLine = useAnimatedValue(uFromHours(3));
    const stratLine = useAnimatedValue(uFromDay(-42));
    const line = mode === 'log' ? logLine : stratLine;
    const [playing, setPlaying] = useState(false);

    // animateTo é estável (useCallback): seguro como dependência do efeito.
    const mixTo = mix.animateTo;
    const logTo = logLine.animateTo;
    const stratTo = stratLine.animateTo;

    useEffect(() => {
        const k = reduced ? 0 : 1;
        mixTo(step >= 1 ? 1 : 0, { duration: 750 * k });
        if (step === 0) logTo(uFromHours(4 * HOURS_PER_DAY), { from: uFromHours(3), duration: 2600 * k, delay: 700 * k });
        if (step === 1) logTo(uFromHours(91 * HOURS_PER_DAY), { duration: 2600 * k, delay: 900 * k });
        if (step === 2) stratTo(uFromDay(0), { from: uFromDay(-42), duration: 2800 * k, delay: 1300 * k });
        return () => setPlaying(false);
    }, [step, reduced, mixTo, logTo, stratTo]);

    const togglePlay = () => {
        if (playing) {
            line.stop();
            setPlaying(false);
            return;
        }
        const from = line.value > 0.97 ? 0 : line.value;
        setPlaying(true);
        line.animateTo(1, { from, duration: PLAY_MS * (1 - from), ease: linear, onDone: () => setPlaying(false) });
    };

    const handleScrubStart = () => {
        line.stop();
        setPlaying(false);
    };

    const u = line.value;
    const tH = hoursFromU(u);
    const day = dayFromU(u);
    const items = mode === 'log' ? logStatus(tH, step >= 1) : stratStatus(day);
    const gain: GainStatus | null = mode === 'strat'
        ? { value: structuralGain(day), building: longConc(day) >= STRAT_THRESH.longEffect }
        : null;
    const time = mode === 'log' ? formatSinceInjection(tH) : formatRelProva(day);
    const caption = mode === 'log' ? 'após a injeção (dose única)' : 'em relação ao dia da prova';

    return (
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2.5 font-body text-white">
            <div className="flex min-h-[46px] items-center gap-3">
                <span className="shrink-0 rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-[14px] uppercase tracking-[0.1em] text-slate-200">
                    {STEPS[step].label}
                </span>
                <div className="relative min-h-[1.5rem] flex-1">
                    <motion.p key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }} className="text-[16px] leading-snug text-slate-100">
                        {STEPS[step].text}
                    </motion.p>
                </div>
                <span className="shrink-0 rounded-full border border-amber-500/60 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[14px] uppercase tracking-[0.06em] text-amber-300">
                    modelo ilustrativo
                </span>
                <button type="button" onClick={togglePlay}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 font-mono text-[14px] text-white transition-colors hover:bg-white/20"
                    aria-label={playing ? 'Pausar a linha do teste' : 'Animar a linha do teste ao longo do tempo'}>
                    {playing ? <Pause size={16} /> : <Play size={16} />}
                    {playing ? 'pausar' : 'percorrer'}
                </button>
            </div>

            <div className="flex gap-4">
                <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] px-3 pb-1.5 pt-2">
                    <DetectionChart mode={mode} mix={mix.value} u={u} pillText={`TESTE · ${time.toUpperCase()}`}
                        onScrubStart={handleScrubStart} onScrub={line.set} />
                    <Legend mode={mode} withMetabolite={step >= 1} />
                </div>
                <div className="w-[272px] shrink-0">
                    <StatusPanel caption={caption} time={time} items={items} gain={gain} />
                </div>
            </div>
        </div>
    );
};

const LegendSwatch = ({ kind }: { kind: 'line' | 'dash' | 'dot' | 'det' | 'hatch' }) => (
    <svg width="24" height="12" aria-hidden className="shrink-0">
        {kind === 'line' && <line x1="1" x2="25" y1="6" y2="6" stroke="#E5E7EB" strokeWidth="2.4" />}
        {kind === 'dash' && <line x1="1" x2="25" y1="6" y2="6" stroke="#E5E7EB" strokeWidth="2" strokeDasharray="6 4" />}
        {kind === 'dot' && <line x1="1" x2="25" y1="6" y2="6" stroke="#E5E7EB" strokeWidth="1.6" strokeDasharray="2 4" />}
        {kind === 'det' && <line x1="1" x2="25" y1="6" y2="6" stroke="#FDA4AF" strokeWidth="1.6" strokeDasharray="7 4" />}
        {kind === 'hatch' && (
            <g>
                <rect x="1" y="1" width="24" height="10" rx="2" fill="rgba(225,29,72,0.25)" stroke="#E11D48" />
                {[4, 10, 16, 22].map(x => <line key={x} x1={x} y1="11" x2={x + 5} y2="1" stroke="#E11D48" strokeWidth="2" />)}
            </g>
        )}
    </svg>
);

const Legend = ({ mode, withMetabolite }: { mode: ChartMode; withMetabolite: boolean }) => (
    <div className="flex min-h-[46px] flex-wrap content-start items-center gap-x-4 gap-y-0.5 px-1 font-body text-[15px] text-slate-200">
        <span className="flex items-center gap-1.5"><LegendSwatch kind="line" />concentração</span>
        {mode === 'log' && withMetabolite && <span className="flex items-center gap-1.5"><LegendSwatch kind="dash" />metabólito urinário (19-Nor)</span>}
        <span className="flex items-center gap-1.5"><LegendSwatch kind="dot" />limiar de efeito</span>
        <span className="flex items-center gap-1.5"><LegendSwatch kind="det" />limite de detecção</span>
        <span className="flex items-center gap-1.5"><LegendSwatch kind="hatch" />detectável no teste</span>
    </div>
);

export default DetectionWindowSim;
