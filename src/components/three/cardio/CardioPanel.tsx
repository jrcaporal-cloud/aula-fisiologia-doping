import { motion } from 'framer-motion';
import { cardioVitalsAt, type CardioPhase } from '../../../data/cardioSteps';
import { CARDIO_SOURCE, CC } from './colors';
import { CARDIO_PHASES } from './phases';
import type { StructureId } from './structures';

/* Peças do painel lateral do modelo circulatório (todo texto com 14 px ou mais). */

const ORDER: CardioPhase[] = ['uso', 'apos'];

interface PhaseSwitchProps { phase: CardioPhase; onChange: (p: CardioPhase) => void }

/** Seletor "Em uso" × "Depois de parar", fixo no topo do painel (ao lado do fechar): a tecla R faz o mesmo. */
export const PhaseSwitch = ({ phase, onChange }: PhaseSwitchProps) => (
    <div className="flex-1 min-w-0 flex items-center gap-2">
        <div role="radiogroup" aria-label="Em uso ou depois de parar" className="flex-1 min-w-0 grid grid-cols-[auto_1fr] gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10">
            {ORDER.map(k => {
                const it = CARDIO_PHASES[k];
                const on = k === phase;
                return (
                    <button
                        key={k}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => onChange(k)}
                        className={`flex items-center justify-center gap-1.5 px-3 h-9 rounded-lg text-[14px] font-semibold whitespace-nowrap transition-colors ${on ? 'text-white' : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'}`}
                        style={on ? { background: `${it.color}26`, boxShadow: `inset 0 0 0 1px ${it.color}99` } : undefined}
                    >
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: it.color }} />
                        {it.name}
                    </button>
                );
            })}
        </div>
        <kbd
            title="A tecla R alterna entre Em uso e Depois de parar"
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md border border-white/20 bg-white/10 text-[14px] font-mono text-gray-100"
        >
            R
        </kbd>
    </div>
);

interface PhaseCardProps { phase: CardioPhase; step: number }

/** Descrição do estado escolhido, com os três valores da ficha. */
export const PhaseCard = ({ phase, step }: PhaseCardProps) => {
    const info = CARDIO_PHASES[phase];
    const v = cardioVitalsAt(step, phase);
    return (
        <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-semibold text-gray-200 uppercase tracking-wider">Estado</span>
                <span className="text-[14px] font-mono text-gray-400">caso composto · ilustrativo</span>
            </div>
            <motion.div
                key={phase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="p-3.5 rounded-xl border"
                style={{ borderColor: `${info.color}55`, background: `${info.color}0f` }}
            >
                <p className="text-[15px] text-gray-200 leading-snug">{info.text}</p>
                <div className="mt-3 grid grid-cols-3 gap-1.5 text-[14px] text-center">
                    {[
                        `parede ${v.paredeMm.toFixed(0)} mm`,
                        `HDL ${v.hdl.toFixed(0)}`,
                        `LDL ${v.ldl.toFixed(0)}`,
                    ].map(t => (
                        <div key={t} className="rounded-lg px-2 py-1.5 border text-gray-100" style={{ borderColor: `${info.color}44`, background: 'rgba(255,255,255,0.03)' }}>{t}</div>
                    ))}
                </div>
                <p className="text-[14px] text-gray-400 mt-2.5">{CARDIO_SOURCE}</p>
            </motion.div>
        </div>
    );
};

/** `pin`: estrutura que o clique no item fixa (pode depender da etapa); sem `pin`, o item só informa. */
interface LegendItem { color: string; label: string; steps: number[]; pin?: StructureId | ((step: number) => StructureId) }

const LEGEND: LegendItem[] = [
    { color: CC.myo, label: 'Miocárdio do VE', steps: [0, 1, 2, 3, 4, 7], pin: 'miocardio' },
    { color: CC.blood, label: 'Cavidade do VE', steps: [0, 1, 2, 3], pin: 'cavidade' },
    { color: CC.fibrose, label: 'Fibrose', steps: [2, 3, 7] },
    { color: CC.valve, label: 'Valvas mitral e aórtica', steps: [0, 1, 3, 4], pin: step => (step === 4 ? 'aortica' : 'mitral') },
    { color: CC.atrium, label: 'Átrio esquerdo', steps: [1, 3, 7], pin: 'atrioE' },
    { color: CC.artery, label: 'Aorta e artéria', steps: [0, 4, 5, 6, 7], pin: step => (step <= 4 ? 'aorta' : 'arteria') },
    { color: CC.endo, label: 'Endotélio', steps: [6], pin: 'endotelio' },
    { color: CC.plaque, label: 'Placa (núcleo lipídico)', steps: [6, 7], pin: 'placa' },
    { color: CC.cell, label: 'Hemácia', steps: [0, 5, 6, 7], pin: 'hemacia' },
    { color: CC.arteriole, label: 'Arteríola', steps: [0, 4, 5], pin: 'arteriola' },
    { color: CC.vein, label: 'Retorno venoso e átrio direito', steps: [0, 5, 7], pin: 'veia' },
    { color: CC.pulm, label: 'Circulação pulmonar (esquemática)', steps: [0], pin: 'pulmonar' },
];

const TRAINED_ITEM = { color: CARDIO_PHASES.apos.color, label: 'Coração treinado (contorno)' };

interface LegendProps {
    step: number;
    overlay: boolean;
    pinnedId: StructureId | null;
    onPin: (id: StructureId) => void;
}

/** Legenda por etapa. Cada item com estrutura vira botão: é o caminho por teclado (e o seguro, para a hemácia que corre) até o close-up. */
export const Legend = ({ step, overlay, pinnedId, onPin }: LegendProps) => (
    <div className="mt-4 pt-3.5 border-t border-white/10">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {LEGEND.filter(item => item.steps.includes(step)).map(item => {
                const target = typeof item.pin === 'function' ? item.pin(step) : item.pin;
                const dot = <span className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />;
                if (!target) {
                    return <div key={item.label} className="flex items-center gap-2 min-h-7 text-[14px] text-gray-300">{dot}{item.label}</div>;
                }
                const on = pinnedId === target;
                return (
                    <button
                        key={item.label}
                        type="button"
                        onClick={() => onPin(target)}
                        aria-pressed={on}
                        aria-label={`Fixar e aproximar: ${item.label}`}
                        className={`flex items-center gap-2 min-h-7 -mx-1.5 px-1.5 rounded-md text-left text-[14px] transition-colors ${on ? 'text-white bg-white/10' : 'text-gray-300 hover:text-white hover:bg-white/[0.07]'}`}
                    >
                        {dot}{item.label}
                    </button>
                );
            })}
            {overlay && (
                <div className="flex items-center gap-2 min-h-7 text-[14px] text-cyan-100">
                    <span className="w-3 h-3 rounded-full shrink-0 border-2" style={{ borderColor: TRAINED_ITEM.color }} />
                    {TRAINED_ITEM.label}
                </div>
            )}
        </div>
    </div>
);

interface OverlayToggleProps { on: boolean; onChange: (on: boolean) => void }

/** Interruptor do fantasma do coração treinado (desligado por padrão). */
export const OverlayToggle = ({ on, onChange }: OverlayToggleProps) => {
    const cyan = CARDIO_PHASES.apos.color;
    return (
        <div className="mt-5 flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-gray-200 uppercase tracking-wider">Sobrepor o treinado</p>
                <p className="text-[14px] text-gray-400 leading-snug mt-0.5">Contorno da cavidade e da parede do coração da etapa 1, sobre o estado atual.</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label="Sobrepor o coração treinado"
                onClick={() => onChange(!on)}
                className="relative shrink-0 w-12 h-7 rounded-full border transition-colors duration-300"
                style={on ? { background: `${cyan}40`, borderColor: `${cyan}cc` } : { background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.2)' }}
            >
                <span
                    className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full transition-transform duration-300"
                    style={{ background: on ? cyan : '#9CA3AF', transform: on ? 'translateX(20px)' : 'translateX(0)' }}
                />
            </button>
        </div>
    );
};
