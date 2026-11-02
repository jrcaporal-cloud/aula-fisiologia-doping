import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { Clock } from './Clock';
import { GENOMIC, GENOMIC_COLOR, NONGENOMIC, NONGENOMIC_COLOR, STEP_LABELS, type RouteText } from './content';
import { GENOMIC_TOTAL_S, NONGENOMIC_TOTAL_S } from './useSequence';

/** Voltas do ponteiro: a via lenta gira bem mais que a rápida no mesmo intervalo de tela. */
const GENOMIC_TURNS = 3;
const NONGENOMIC_TURNS = 0.25;

interface RouteMeta {
    text: RouteText;
    color: string;
    soft: string;
    turns: number;
    duration: number;
}

const ROUTES: Record<'g' | 'n', RouteMeta> = {
    g: { text: GENOMIC, color: GENOMIC_COLOR, soft: '#BFDBFE', turns: GENOMIC_TURNS, duration: GENOMIC_TOTAL_S },
    n: { text: NONGENOMIC, color: NONGENOMIC_COLOR, soft: '#FECDD3', turns: NONGENOMIC_TURNS, duration: NONGENOMIC_TOTAL_S },
};

interface StepChipsProps {
    step: number;
    setStep: (s: number) => void;
}

const StepChips = ({ step, setStep }: StepChipsProps) => (
    <div className="flex items-center gap-1.5">
        {STEP_LABELS.map((label, i) => (
            <button
                key={label}
                type="button"
                onClick={() => setStep(i)}
                aria-current={step === i}
                className={`whitespace-nowrap rounded-full border px-2.5 py-1 font-body text-[13px] leading-none transition-colors ${
                    step === i ? 'border-white/40 bg-white/15 text-white' : 'border-white/10 text-gray-400 hover:text-gray-200'
                }`}
            >
                {label}
            </button>
        ))}
    </div>
);

const RouteHeader = ({ meta, runKey, reduced }: { meta: RouteMeta; runKey: string | null; reduced: boolean }) => (
    <div className="flex items-center gap-3">
        <Clock color={meta.color} turns={meta.turns} duration={meta.duration} runKey={runKey} reduced={reduced} />
        <div className="min-w-0">
            <div className="font-display text-[21px] font-bold leading-tight" style={{ color: meta.color }}>
                {meta.text.name} <span className="text-[14px] font-normal" style={{ color: meta.soft }}>({meta.text.speed})</span>
            </div>
            <div className="font-mono text-[13px]" style={{ color: meta.soft }}>
                {meta.text.span} · <strong className="text-white">{meta.text.clock}</strong>
            </div>
        </div>
    </div>
);

interface RouteDetailProps {
    meta: RouteMeta;
    active: number;
    runKey: string | null;
    reduced: boolean;
    onReplay: () => void;
}

const RouteDetail = ({ meta, active, runKey, reduced, onReplay }: RouteDetailProps) => (
    <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
            <RouteHeader meta={meta} runKey={runKey} reduced={reduced} />
            <button
                type="button"
                onClick={onReplay}
                className="mt-1 flex items-center gap-1 rounded-full border border-white/15 px-2 py-1 font-mono text-[13px] text-gray-300 hover:text-white"
                aria-label="Repetir animação"
            >
                <RotateCcw size={13} /> repetir
            </button>
        </div>
        <p className="text-[13px] leading-snug text-gray-300">{meta.text.summary}</p>
        <ol className="flex flex-col gap-1.5">
            {meta.text.items.map((item, i) => (
                <motion.li
                    key={item.title}
                    initial={false}
                    animate={{ opacity: i <= active ? 1 : 0.4 }}
                    transition={{ duration: reduced ? 0 : 0.4 }}
                    className="flex gap-2.5 rounded-lg border px-2.5 py-1"
                    style={{
                        borderColor: i === active ? `${meta.color}99` : 'rgba(255,255,255,0.06)',
                        background: i === active ? `${meta.color}1a` : 'rgba(0,0,0,0.25)',
                    }}
                >
                    <span
                        className="mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full font-mono text-[12px] font-bold"
                        style={{ background: `${meta.color}33`, color: meta.soft }}
                    >
                        {i + 1}
                    </span>
                    <div>
                        <div className="text-[14px] font-semibold leading-tight text-white">{item.title}</div>
                        <div className="text-[13px] leading-[1.3] text-gray-300">{item.text}</div>
                    </div>
                </motion.li>
            ))}
        </ol>
    </div>
);

const RouteSummary = ({ meta, reduced }: { meta: RouteMeta; reduced: boolean }) => (
    <div className="rounded-xl border px-3 py-2.5" style={{ borderColor: `${meta.color}55`, background: `${meta.color}12` }}>
        <RouteHeader meta={meta} runKey={null} reduced={reduced} />
        <p className="mt-2 text-[13.5px] leading-snug text-gray-200">{meta.text.summary}</p>
    </div>
);

interface SidePanelProps {
    step: number;
    setStep: (s: number) => void;
    gPhase: number;
    nPhase: number;
    run: number;
    reduced: boolean;
    onReplay: () => void;
}

const genomicActive = (p: number) => (p <= 1 ? 0 : p <= 4 ? 1 : 2);
const nonGenomicActive = (p: number) => (p <= 1 ? 0 : p === 2 ? 1 : 2);

export const SidePanel = ({ step, setStep, gPhase, nPhase, run, reduced, onReplay }: SidePanelProps) => (
    <div className="flex h-full min-w-0 flex-col gap-3 rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] p-3">
        <div className="flex items-center justify-between gap-2">
            <StepChips step={step} setStep={setStep} />
        </div>
        {/* Sem AnimatePresence: troca imediata de conteúdo (passador rápido não pode travar a saída). */}
            <motion.div
                key={step}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : 0.35 }}
                className="flex min-h-0 flex-1 flex-col gap-2.5"
            >
                {step === 0 && (
                    <>
                        <div className="font-display text-[22px] font-semibold text-white">Duas vias, uma molécula</div>
                        <RouteSummary meta={ROUTES.g} reduced={reduced} />
                        <RouteSummary meta={ROUTES.n} reduced={reduced} />
                        <p className="mt-auto font-mono text-[13px] text-gray-400">Clique numa via no desenho para focar.</p>
                    </>
                )}
                {step === 1 && (
                    <RouteDetail meta={ROUTES.g} active={genomicActive(gPhase)} runKey={`g-${run}`} reduced={reduced} onReplay={onReplay} />
                )}
                {step === 2 && (
                    <RouteDetail meta={ROUTES.n} active={nonGenomicActive(nPhase)} runKey={`n-${run}`} reduced={reduced} onReplay={onReplay} />
                )}
                {step === 3 && (
                    <>
                        <div className="font-display text-[22px] font-semibold text-white">Lado a lado</div>
                        <RouteSummary meta={ROUTES.n} reduced={reduced} />
                        <RouteSummary meta={ROUTES.g} reduced={reduced} />
                    </>
                )}
            </motion.div>
    </div>
);
