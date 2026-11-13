import { motion } from 'framer-motion';
import { cardioVitalsAt, type CardioPhase } from '../../../data/cardioSteps';
import { CARDIO_SOURCE } from './colors';
import { CARDIO_PHASES } from './phases';

/* Peças do painel lateral do modelo circulatório (todo texto com 14 px ou mais). */

const ORDER: CardioPhase[] = ['uso', 'apos'];
const TRAINED = '#7DD3FC';

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
        {/* Em 4:3 (< 1180 px) o painel estreita: a dica da tecla R sai para o seletor caber (a tecla continua valendo). */}
        <kbd
            title="A tecla R alterna entre Em uso e Depois de parar"
            className="shrink-0 w-8 h-8 hidden min-[1180px]:flex items-center justify-center rounded-md border border-white/20 bg-white/10 text-[14px] font-mono text-gray-100"
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

/** "Contorno do treinado": tracejado do VE treinado por cima do corte (como no slide 2D). */
export const ContourToggle = ({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) => (
    <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className="w-full mt-4 flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-left active:scale-[0.99] transition-[background-color,transform] duration-150"
    >
        <svg width="34" height="18" aria-hidden className="shrink-0">
            <line x1="2" y1="9" x2="32" y2="9" stroke={TRAINED} strokeWidth="2.4" strokeDasharray="6 4" />
        </svg>
        <span className="flex-1 min-w-0">
            <span className="block text-[14px] font-semibold text-gray-100">Contorno do treinado</span>
            <span className="block text-[14px] text-gray-400 leading-snug">parede e cavidade do ponto de partida</span>
        </span>
        <span className={`shrink-0 w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ${on ? 'bg-sky-400/80' : 'bg-white/15'}`}>
            <span className={`block w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${on ? 'translate-x-5' : ''}`} />
        </span>
    </button>
);

