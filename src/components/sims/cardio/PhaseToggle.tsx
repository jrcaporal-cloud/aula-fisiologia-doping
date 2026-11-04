import { motion } from 'framer-motion';
import type { CardioPhase } from '../../../data/cardioSteps';
import { PANEL_BG } from '../peptide/ui';

/*
 * Seletor "Em uso" × "Depois de parar". Troca os números de todo o slide (os valores chegam
 * em transição) e a narração de cada passo. A tecla R faz o mesmo sem tirar a mão do passador (dica no title).
 */

interface Option { id: CardioPhase; label: string; dot: string; bg: string; border: string }

const OPTIONS: readonly Option[] = [
    { id: 'uso', label: 'Em uso', dot: '#FB7185', bg: 'rgba(159,18,57,0.45)', border: 'rgba(225,29,72,0.7)' },
    { id: 'apos', label: 'Depois de parar', dot: '#67E8F9', bg: 'rgba(14,116,144,0.4)', border: 'rgba(103,232,249,0.6)' },
];

interface PhaseToggleProps {
    phase: CardioPhase;
    onChange: (phase: CardioPhase) => void;
}

export const PhaseToggle = ({ phase, onChange }: PhaseToggleProps) => (
    <div role="radiogroup" aria-label="Em uso ou depois de parar" title="Atalho: tecla R"
        className="flex shrink-0 items-center gap-1 rounded-2xl border border-white/10 p-1" style={PANEL_BG}>
        {OPTIONS.map(option => {
            const active = option.id === phase;
            return (
                <button key={option.id} type="button" role="radio" aria-checked={active} onClick={() => onChange(option.id)}
                    className="relative cursor-pointer whitespace-nowrap rounded-xl px-3 py-1.5 text-[15px] font-semibold transition-colors"
                    style={{ color: active ? '#FFFFFF' : '#D1D5DB' }}>
                    {active && (
                        <motion.span layoutId="cardio-phase" className="absolute inset-0 rounded-xl border"
                            style={{ background: option.bg, borderColor: option.border }}
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                    )}
                    <span className="relative flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: option.dot }} />
                        {option.label}
                    </span>
                </button>
            );
        })}
    </div>
);
