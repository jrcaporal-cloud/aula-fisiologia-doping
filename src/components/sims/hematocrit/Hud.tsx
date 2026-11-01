import { useEffect, useRef, type Ref } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Droplets, HeartPulse, Moon } from 'lucide-react';
import {
    FLOW_SCALE_MAX, HCT_EPO_HIGH, HCT_EPO_LOW, HCT_MAX, HCT_MIN, HCT_NORMAL, SLEEP_HR,
    clamp01, flowWord, viscosityFill, type FlowState,
} from './model';
import type { LiveStore } from './liveStore';

const CARD = 'rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] backdrop-blur-xl';

const STATE_META: Record<FlowState, { label: string; color: string; text: string }> = {
    normal: { label: 'Normal', color: '#10B981', text: 'Fluxo e viscosidade ideais para o débito cardíaco.' },
    hiper: { label: 'Hiperviscosidade', color: '#F59E0B', text: 'Sangue “tipo iogurte”: derruba o retorno venoso e sobrecarrega o ventrículo esquerdo.' },
    trombose: { label: 'Risco de trombose', color: '#E11D48', text: 'No sono, com FC ~30 bpm, a estase severa deflagra microtromboses e infarto agudo.' },
};

const pct = (h: number) => ((h - HCT_MIN) / (HCT_MAX - HCT_MIN)) * 100;

interface HctCardProps {
    hct: number;
    color: string;
    onHct: (v: number) => void;
}

const HctCard = ({ hct, color, onHct }: HctCardProps) => (
    <div className={`${CARD} px-5 pb-4 pt-3.5`}>
        <div className="flex items-center justify-between">
            <span className="font-mono text-[13px] uppercase tracking-[0.16em] text-gray-300">Hematócrito</span>
            <Droplets size={18} style={{ color }} />
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
            <span className="font-display text-[46px] font-semibold leading-none tabular-nums" style={{ color }}>
                {Math.round(hct)}%
            </span>
            <span className="font-body text-[14px] text-gray-300">
                {hct < HCT_EPO_LOW ? 'faixa fisiológica' : 'faixa rhEPO abusiva'}
            </span>
        </div>

        <div className="relative mt-3 h-8">
            {/* Trilho com as faixas da aula */}
            <div className="absolute inset-x-0 top-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="absolute inset-y-0 bg-emerald-500/50" style={{ left: `${pct(43)}%`, width: `${pct(47) - pct(43)}%` }} />
                <div className="absolute inset-y-0 bg-gradient-to-r from-brand-red/60 to-brand-red" style={{ left: `${pct(HCT_EPO_LOW)}%`, right: 0 }} />
            </div>
            <div className="absolute top-0 h-8 w-px bg-white/70" style={{ left: `${pct(HCT_NORMAL)}%` }} />
            <input
                type="range"
                min={HCT_MIN}
                max={HCT_MAX}
                step={0.5}
                value={hct}
                aria-label="Hematócrito"
                onChange={e => onHct(Number(e.target.value))}
                className="absolute inset-x-0 top-0 h-8 w-full cursor-pointer appearance-none bg-transparent
                    [&::-webkit-slider-runnable-track]:h-8 [&::-webkit-slider-runnable-track]:bg-transparent
                    [&::-webkit-slider-thumb]:mt-[7px] [&::-webkit-slider-thumb]:h-[18px] [&::-webkit-slider-thumb]:w-[18px]
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white
                    [&::-webkit-slider-thumb]:bg-brand-red [&::-webkit-slider-thumb]:shadow-[0_0_14px_rgba(225,29,72,0.8)]
                    [&::-moz-range-thumb]:h-[14px] [&::-moz-range-thumb]:w-[14px] [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-brand-red"
            />
        </div>
        <div className="relative mt-1 h-9 font-mono text-[12px] leading-tight">
            <span className="absolute left-0 text-gray-400">{HCT_MIN}%</span>
            <span className="absolute -translate-x-1/2 text-center text-emerald-300" style={{ left: `${pct(HCT_NORMAL)}%` }}>
                ~45%<br />normal
            </span>
            <span className="absolute -translate-x-1/2 text-center text-rose-300" style={{ left: `${(pct(HCT_EPO_LOW) + pct(HCT_EPO_HIGH)) / 2}%` }}>
                &gt;55–60%<br />rhEPO
            </span>
            <span className="absolute right-0 text-gray-400">{HCT_MAX}%</span>
        </div>
    </div>
);

const Meter = ({ fill, gradient, markerAt, barRef }: { fill?: number; gradient: string; markerAt?: number; barRef?: Ref<HTMLDivElement> }) => (
    <div className="relative mt-1.5 h-3 overflow-hidden rounded-full bg-white/10">
        <div
            ref={barRef}
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: fill === undefined ? undefined : `${clamp01(fill) * 100}%`, background: gradient, transition: fill === undefined ? undefined : 'width 400ms ease-out' }}
        />
        {markerAt !== undefined && <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${markerAt * 100}%` }} />}
    </div>
);

const RheologyCard = ({ hct, live }: { hct: number; live: LiveStore }) => {
    const flowBar = useRef<HTMLDivElement>(null);
    const flowLabel = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        let raf = 0;
        let shown = 1;
        const tick = () => {
            const { flow } = live.read();
            shown += (flow - shown) * 0.25;
            if (flowBar.current) flowBar.current.style.width = `${clamp01(shown / FLOW_SCALE_MAX) * 100}%`;
            if (flowLabel.current) flowLabel.current.textContent = flowWord(shown);
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [live]);

    return (
        <div className={`${CARD} px-5 py-3.5`}>
            <div className="flex items-center justify-between">
                <span className="font-mono text-[13px] uppercase tracking-[0.16em] text-gray-300">Reologia</span>
                <span className="rounded-md border border-amber-400/50 bg-amber-400/10 px-2 py-0.5 font-mono text-[12px] text-amber-200">modelo ilustrativo</span>
            </div>
            <div className="mt-2.5 flex items-baseline justify-between font-body text-[14px] text-gray-100">
                <span>Viscosidade relativa</span>
                <span className="font-mono text-[12px] text-gray-400">| = normal</span>
            </div>
            <Meter fill={viscosityFill(hct)} gradient="linear-gradient(90deg,#10B981,#F59E0B 55%,#E11D48)" markerAt={viscosityFill(HCT_NORMAL)} />
            <div className="mt-3 flex items-baseline justify-between font-body text-[14px] text-gray-100">
                <span>Velocidade de fluxo</span>
                <span ref={flowLabel} className="font-mono text-[13px] text-sky-200">Adequado</span>
            </div>
            <Meter gradient="linear-gradient(90deg,#1d4ed8,#60A5FA 60%,#22D3EE)" barRef={flowBar} markerAt={1 / FLOW_SCALE_MAX} />
        </div>
    );
};

const StateCard = ({ state, alert }: { state: FlowState; alert: boolean }) => {
    const meta = STATE_META[state];
    return (
        <div className={`${CARD} relative overflow-hidden px-5 py-3.5`} style={{ borderColor: alert ? 'rgba(225,29,72,0.7)' : undefined }}>
            {alert && <div className="pointer-events-none absolute inset-0 animate-pulse bg-brand-red/10" />}
            <div className="relative flex items-center justify-between">
                <span className="font-mono text-[13px] uppercase tracking-[0.16em] text-gray-300">Estado</span>
                <span className="flex items-center gap-2 rounded-full px-3 py-0.5 font-body text-[14px] font-bold" style={{ background: `${meta.color}26`, color: meta.color, border: `1px solid ${meta.color}80` }}>
                    <span className="h-2 w-2 rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                </span>
            </div>
            <AnimatePresence mode="wait">
                {alert ? (
                    <motion.div key="alert" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative mt-2.5 flex items-start gap-2.5">
                        <AlertTriangle size={22} className="mt-0.5 shrink-0 text-brand-red" />
                        <div>
                            <div className="font-display text-[19px] font-semibold uppercase leading-tight tracking-wide text-rose-200">Microtrombose</div>
                            <div className="font-body text-[14px] leading-snug text-gray-100">Estase no sono → risco de <strong className="text-white">infarto agudo</strong>.</div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.p key={state} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative mt-2.5 font-body text-[14px] leading-snug text-gray-100">
                        {meta.text}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
};

const SleepToggle = ({ sleep, onToggle }: { sleep: boolean; onToggle: () => void }) => (
    <button
        type="button"
        onClick={onToggle}
        aria-pressed={sleep}
        className="flex items-center justify-between rounded-2xl border px-5 py-3 text-left transition-colors duration-300"
        style={{
            background: sleep ? 'rgba(88,28,135,0.35)' : 'rgba(8,8,18,0.72)',
            borderColor: sleep ? 'rgba(168,85,247,0.75)' : 'rgba(255,255,255,0.1)',
            boxShadow: sleep ? '0 0 28px -6px rgba(168,85,247,0.6)' : undefined,
        }}
    >
        <span className="flex items-center gap-3">
            <Moon size={20} className={sleep ? 'text-purple-300' : 'text-gray-400'} />
            <span className="font-body text-[15px] font-bold text-white">Sono — FC ~{SLEEP_HR} bpm</span>
        </span>
        <span className="flex items-center gap-2">
            {sleep && (
                <motion.span animate={{ scale: [1, 1.3, 1, 1] }} transition={{ duration: 60 / SLEEP_HR, repeat: Infinity, times: [0, 0.1, 0.25, 1] }}>
                    <HeartPulse size={20} className="text-rose-400" />
                </motion.span>
            )}
            <span className={`relative h-6 w-11 rounded-full transition-colors ${sleep ? 'bg-purple-500' : 'bg-white/15'}`}>
                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${sleep ? 'left-6' : 'left-1'}`} />
            </span>
        </span>
    </button>
);

export interface HudProps {
    hct: number;
    onHct: (v: number) => void;
    sleep: boolean;
    onToggleSleep: () => void;
    state: FlowState;
    alert: boolean;
    live: LiveStore;
}

export const Hud = ({ hct, onHct, sleep, onToggleSleep, state, alert, live }: HudProps) => (
    <div className="flex w-[340px] shrink-0 flex-col gap-2.5">
        <HctCard hct={hct} onHct={onHct} color={STATE_META[state].color} />
        <RheologyCard hct={hct} live={live} />
        <StateCard state={state} alert={alert} />
        <SleepToggle sleep={sleep} onToggle={onToggleSleep} />
    </div>
);
