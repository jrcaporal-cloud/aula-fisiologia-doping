import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { LANES, verdictLabel, type Drug } from './data';
import { LaneIcon } from './LaneBadge';
import { EASE } from './DrugCard';
import { Marker } from './Marker';
import { DUR } from '../../../lib/motion';

interface DetailPanelProps {
    drug: Drug;
    reduced: boolean;
    onClose: () => void;
}

/** Painel aberto pelo clique num marcador: o texto "Oculto/Colaterais" da tabela original. */
export const DetailPanel = ({ drug, reduced, onClose }: DetailPanelProps) => {
    const lane = LANES[drug.lane];
    const t = { duration: reduced ? 0 : DUR.enter, ease: EASE };

    return (
        <motion.div
            className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl"
            style={{ background: 'rgba(5,5,16,0.72)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={t}
            onClick={onClose}
        >
            <motion.div
                role="dialog"
                aria-label={`${drug.name}: colaterais`}
                className="relative w-[660px] rounded-2xl border px-7 py-6 backdrop-blur-xl"
                style={{ borderColor: `${drug.color}80`, background: `linear-gradient(150deg, ${drug.color}22, rgba(8,8,18,0.96) 45%)` }}
                initial={{ y: 18, scale: 0.97 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 10, scale: 0.98 }}
                transition={t}
                onClick={e => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fechar"
                    className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--act-color,#E11D48)] absolute top-4 right-4 p-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                    <X size={18} />
                </button>
                <div className="flex items-center gap-3.5 mb-4 pr-10">
                    <Marker system={drug.system} icon={drug.icon} color={drug.color} size={46} />
                    <div className="min-w-0">
                        <div className="font-body font-semibold text-[24px] text-white leading-tight">{drug.name}</div>
                        <div className="mt-0.5 flex items-center gap-2 font-mono text-[15px] text-slate-200">
                            {drug.magnitude} <span className="text-slate-400">·</span>
                            <LaneIcon lane={drug.lane} color={lane.color} size={18} />
                            <b style={{ color: lane.color }}>{verdictLabel(drug)}</b>
                        </div>
                    </div>
                </div>
                <p className="text-[18px] leading-relaxed text-slate-100">
                    <b className="mr-1" style={{ color: drug.color }}>Oculto/Colaterais:</b>
                    {drug.detail}
                </p>
            </motion.div>
        </motion.div>
    );
};
