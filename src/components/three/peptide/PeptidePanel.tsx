import { AnimatePresence, motion } from 'framer-motion';
import { Info } from 'lucide-react';
import type { PeptideLigand } from '../../../data/peptideSteps';
import { PC, PEPTIDE_LIGANDS, PEPTIDE_LIGAND_ORDER, PEPTIDE_SOURCE } from './ligands';

/* Peças do painel lateral do modelo da via de membrana (todo texto com 14 px ou mais). */

interface LigandCardProps { ligand: PeptideLigand; onChange: (l: PeptideLigand) => void }

export const LigandCard = ({ ligand, onChange }: LigandCardProps) => {
    const info = PEPTIDE_LIGANDS[ligand];
    return (
        <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[14px] font-semibold text-gray-200 uppercase tracking-wider">Ligante</span>
                <span className="text-[14px] font-mono text-gray-400">peptídeo · bolas e varetas</span>
            </div>
            <div role="radiogroup" aria-label="Escolher ligante" className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/10">
                {PEPTIDE_LIGAND_ORDER.map(k => {
                    const it = PEPTIDE_LIGANDS[k];
                    const on = k === ligand;
                    return (
                        <button
                            key={k}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            onClick={() => onChange(k)}
                            className={`flex items-center justify-center gap-2 h-10 rounded-lg text-[14px] font-semibold transition-colors ${on ? 'text-white' : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'}`}
                            style={on ? { background: `${it.color}26`, boxShadow: `inset 0 0 0 1px ${it.color}99` } : undefined}
                        >
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: it.color }} />
                            {it.name}
                        </button>
                    );
                })}
            </div>
            <AnimatePresence mode="wait">
                <motion.div
                    key={ligand}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 p-3.5 rounded-xl border"
                    style={{ borderColor: `${info.color}55`, background: `${info.color}0f` }}
                >
                    <p className="text-[14px] font-mono" style={{ color: info.color }}>{info.family}</p>
                    <p className="text-[15px] text-gray-200 leading-snug mt-1.5">{info.text}</p>
                    <div className="mt-3 grid grid-cols-3 gap-1.5 text-[14px] text-center">
                        {[info.gProtein, info.enzyme === 'Fosfolipase C' ? 'PLC' : 'AC', info.messenger === 'IP3' ? 'IP3 → Ca²⁺' : 'AMPc → PKA'].map(t => (
                            <div key={t} className="rounded-lg px-2 py-1.5 border text-gray-100" style={{ borderColor: `${info.color}44`, background: 'rgba(255,255,255,0.03)' }}>{t}</div>
                        ))}
                    </div>
                    <p className="text-[14px] text-gray-400 mt-2.5">Fonte: {PEPTIDE_SOURCE}</p>
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

interface HoverBoxProps { hovered: { name: string; info: string } | null; color: string }

export const HoverBox = ({ hovered, color }: HoverBoxProps) => (
    <div
        className="mt-4 p-3.5 rounded-xl border transition-colors duration-300"
        style={hovered ? { borderColor: `${color}80`, background: `${color}0d` } : { borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
    >
        <div className="flex items-center gap-2 mb-1">
            <Info size={15} style={{ color: hovered ? color : '#9ca3af' }} />
            <span className="text-[14px] font-semibold text-gray-200 uppercase tracking-wider">
                {hovered ? hovered.name : 'Detalhes da estrutura'}
            </span>
        </div>
        <p className="text-[14px] text-gray-300 leading-relaxed">
            {hovered ? hovered.info : 'Passe o mouse sobre uma estrutura 3D para ver sua função.'}
        </p>
    </div>
);

interface LegendItem { color: string; label: string; steps: number[]; ring?: boolean }

const legendFor = (ligand: PeptideLigand): LegendItem[] => {
    const L = PEPTIDE_LIGANDS[ligand];
    const gq = ligand === 'ghrp';
    return [
        { color: PC.heads, label: 'Membrana (cabeças polares)', steps: [0, 1] },
        { color: PC.tails, label: 'Caudas apolares', steps: [1] },
        { color: L.color, label: 'Peptídeo', steps: [0, 1, 2, 7] },
        { color: L.color, label: gq ? 'Receptor de grelina' : 'Receptor de GHRH', steps: [0, 2, 3, 7] },
        { color: PC.gtp, label: 'Hélice 6', steps: [2] },
        { color: gq ? '#67E8F9' : '#FCD34D', label: `Subunidade α (Gα${L.gProtein.slice(1)})`, steps: [0, 3, 5, 7] },
        { color: PC.beta, label: 'Par βγ', steps: [3, 5, 7] },
        { color: PC.gdp, label: 'GDP', steps: [3, 7], ring: true },
        { color: PC.gtp, label: 'GTP', steps: [3, 5, 7] },
        { color: gq ? '#38BDF8' : '#F59E0B', label: L.enzyme, steps: [3, 4, 5] },
        { color: L.messengerColor, label: L.messenger, steps: [4, 5] },
        { color: PC.calcium, label: 'Ca²⁺', steps: [4, 5, 6] },
        ...(gq
            ? [{ color: PC.er, label: 'Retículo endoplasmático', steps: [4] }]
            : [{ color: PC.pka, label: 'PKA', steps: [4] }, { color: PC.channel, label: 'Canal de Ca²⁺', steps: [4] }]),
        { color: PC.granule, label: 'Grânulo de GH', steps: [0, 6] },
        { color: PC.gh, label: 'GH', steps: [6, 7] },
        { color: PC.arrestin, label: 'β-arrestina', steps: [7] },
    ];
};

export const Legend = ({ ligand, step }: { ligand: PeptideLigand; step: number }) => (
    <div className="mt-4 pt-3.5 border-t border-white/10">
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
            {legendFor(ligand).filter(item => item.steps.includes(step)).map(item => (
                <div key={item.label} className="flex items-center gap-2 text-[14px] text-gray-300">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color, boxShadow: item.ring ? '0 0 0 1px #94a3b8' : undefined }} />
                    {item.label}
                </div>
            ))}
        </div>
    </div>
);
