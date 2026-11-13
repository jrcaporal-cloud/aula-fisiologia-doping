import { useRef } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { IllustrativeTag } from '../../../deck/IllustrativeTag';
import { ContourToggle } from '../CardioPanel';
import {
    LAB_CONTROLS, LAB_PRESETS, controlsOf, type LabControlDef, type LabPresetId,
} from './labModel';
import { useLab } from './labStore';

/*
 * Painel do laboratório: cenários (levam os controles animados até a linha da ficha) e um deslizador
 * por colateral. "Mais dose" fica sempre à direita — no E′, que piora para baixo, a régua é invertida.
 * Cada régua marca onde ficam os três cenários medidos. Passar o mouse ou arrastar acende, na peça,
 * a estrutura que o controle mexe.
 */

const PRESET_TICKS = LAB_PRESETS.map(p => ({ id: p.id, color: p.color, c: controlsOf(p.vitals) }));

/** Posição (0…1) do valor na régua, já com o sentido "mais dose → direita". */
const frac = (d: LabControlDef, v: number) => {
    const f = (v - d.min) / (d.max - d.min);
    return d.worse > 0 ? f : 1 - f;
};

const ROSE = '#FB7185';

const DoseSlider = ({ d }: { d: LabControlDef }) => {
    const value = useLab(s => s.controls[d.key]);
    const setControl = useLab(s => s.setControl);
    const setFocus = useLab(s => s.setFocus);
    const dragging = useRef(false);
    const pct = frac(d, value) * 100;
    const id = `lab-${d.key}`;
    return (
        <div
            className="group py-2"
            onPointerEnter={() => setFocus(d.key)}
            onPointerLeave={() => { if (!dragging.current) setFocus(null); }}
        >
            <div className="flex items-baseline justify-between gap-2">
                <label htmlFor={id} className="text-[15px] font-semibold text-gray-100">{d.label}</label>
                <span className="font-mono text-[17px] font-semibold tabular-nums text-white">
                    {d.format(value)}{d.unit && <span className="ml-1 text-[14px] font-normal text-gray-400">{d.unit}</span>}
                </span>
            </div>
            <div className="relative mt-1.5 h-7">
                {/* trilho: a parte "dosada" acende */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${ROSE}55, ${ROSE})` }} />
                </div>
                {/* onde ficam os cenários medidos */}
                {PRESET_TICKS.map(t => (
                    <span
                        key={t.id}
                        aria-hidden
                        className="absolute top-1/2 w-[3px] h-4 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{ left: `${frac(d, t.c[d.key]) * 100}%`, background: t.color, opacity: 0.9 }}
                    />
                ))}
                <input
                    id={id}
                    type="range"
                    min={d.min}
                    max={d.max}
                    step={d.step}
                    value={value}
                    aria-valuetext={`${d.format(value)} ${d.unit}`}
                    onChange={e => setControl(d.key, Number(e.target.value))}
                    onPointerDown={() => { dragging.current = true; setFocus(d.key); }}
                    onPointerUp={() => { dragging.current = false; }}
                    onFocus={() => setFocus(d.key)}
                    onBlur={() => { dragging.current = false; setFocus(null); }}
                    style={{ direction: d.worse < 0 ? 'rtl' : 'ltr' }}
                    className={`absolute inset-0 w-full appearance-none bg-transparent cursor-pointer
                        [&::-webkit-slider-runnable-track]:h-7 [&::-webkit-slider-runnable-track]:bg-transparent
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:mt-[4px] [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[3px]
                        [&::-webkit-slider-thumb]:border-rose-400 [&::-webkit-slider-thumb]:shadow-[0_0_0_4px_rgba(251,113,133,0.18)]
                        [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 active:[&::-webkit-slider-thumb]:scale-110
                        [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
                        [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-rose-400
                        focus-visible:outline-none focus-visible:[&::-webkit-slider-thumb]:shadow-[0_0_0_5px_rgba(251,113,133,0.45)]`}
                />
            </div>
            <p className="text-[14px] text-gray-400 leading-tight">{d.hint}{d.worse < 0 ? ' · régua invertida: mais lento à direita' : ''}</p>
        </div>
    );
};

const PresetButton = ({ id, reduced }: { id: LabPresetId; reduced: boolean }) => {
    const p = LAB_PRESETS.find(x => x.id === id) as (typeof LAB_PRESETS)[number];
    const on = useLab(s => s.preset === id);
    const going = useLab(s => s.target === id);
    const apply = useLab(s => s.applyPreset);
    return (
        <button
            type="button"
            onClick={() => apply(id, reduced)}
            aria-pressed={on}
            className="relative min-w-0 flex flex-col items-start gap-0.5 px-2.5 py-2 rounded-xl border text-left transition-[background-color,border-color,transform] duration-150 active:scale-[0.97]"
            style={on || going
                ? { borderColor: `${p.color}b3`, background: `${p.color}1f` }
                : { borderColor: 'rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.03)' }}
        >
            <span className="flex items-start gap-1.5 text-[14px] font-semibold text-gray-100 leading-tight">
                <span className={`mt-[3px] w-2.5 h-2.5 rounded-full shrink-0 ${going ? 'animate-pulse' : ''}`} style={{ background: p.color }} />
                {p.label}
            </span>
            <span className="text-[14px] text-gray-400 leading-tight">{p.sub}</span>
        </button>
    );
};

export const LabPanel = ({ reduced }: { reduced: boolean }) => {
    const paused = useLab(s => s.paused);
    const togglePause = useLab(s => s.togglePause);
    const contour = useLab(s => s.contour);
    const setContour = useLab(s => s.setContour);
    const apply = useLab(s => s.applyPreset);
    return (
        <div>
            <div className="flex items-center justify-between mt-1 mb-2">
                <span className="text-[14px] font-semibold text-gray-200 uppercase tracking-wider">Cenários da ficha</span>
                <span className="text-[14px] font-mono text-gray-400">← → no passador</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
                {LAB_PRESETS.map(p => <PresetButton key={p.id} id={p.id} reduced={reduced} />)}
            </div>

            <div className="flex items-center justify-between mt-5 mb-0.5">
                <span className="text-[14px] font-semibold text-gray-200 uppercase tracking-wider">Dose dos colaterais</span>
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={togglePause}
                        aria-label={paused ? 'Continuar a simulação (espaço)' : 'Pausar a simulação (espaço)'}
                        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-200 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 active:scale-[0.95] transition-transform duration-150"
                    >
                        {paused ? <Play size={16} /> : <Pause size={16} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => apply('treinado', reduced)}
                        aria-label="Voltar ao coração treinado"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-200 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 active:scale-[0.95] transition-transform duration-150"
                    >
                        <RotateCcw size={16} />
                    </button>
                </div>
            </div>
            {LAB_CONTROLS.map(d => <DoseSlider key={d.key} d={d} />)}
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[14px] text-gray-400">
                {LAB_PRESETS.map(p => (
                    <span key={p.id} className="inline-flex items-center gap-1.5">
                        <span className="w-[3px] h-3.5 rounded-full" style={{ background: p.color }} />{p.label}
                    </span>
                ))}
            </p>

            <ContourToggle on={contour} onChange={setContour} />

            <div className="mt-4 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
                <IllustrativeTag>modelo didático</IllustrativeTag>
                <p className="mt-2 text-[14px] text-gray-300 leading-relaxed">
                    Os três cenários reproduzem exatamente os números da ficha do slide. Entre eles, a física é um
                    modelo de ensino: mostra a direção e a ordem de grandeza, não prevê um paciente.
                </p>
            </div>
        </div>
    );
};
