import { motion } from 'framer-motion';
import { DUR } from '../../../lib/motion';
import { EASE, TABS, type Layer, type TabKey } from './content';

interface LayerPanelProps {
    layer: Layer;
    /** Aba mostrada: avança pelo passador (setas), uma aba por passo. */
    tab: TabKey;
    onTab: (tab: TabKey) => void;
}

/** Texto da camada (verbatim): resumo + abas Química / Mecanismo / Risco Real. */
export const LayerPanel = ({ layer, tab, onTab }: LayerPanelProps) => (
    <div className="h-full rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] px-5 py-4 flex flex-col gap-2.5 overflow-hidden"
        style={{ boxShadow: `inset 0 2px 0 ${layer.color}66` }}>
        <div className="font-mono text-[15px] tracking-[0.12em] uppercase" style={{ color: layer.ink }}>Camada {layer.id + 1} de 4</div>
        <h3 className="m-0 font-body font-semibold text-[24px] leading-tight text-white">{layer.title}</h3>
        <p className="m-0 text-[17.5px] leading-snug text-slate-100">{layer.summary}</p>
        <div className="flex gap-1.5 pt-0.5" role="tablist">
            {TABS.map(t => {
                const on = t.key === tab;
                return (
                    <button
                        key={t.key}
                        type="button"
                        role="tab"
                        aria-selected={on}
                        onClick={() => onTab(t.key)}
                        className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--act-color,#E11D48)] text-[15px] px-3.5 py-1 rounded-full border cursor-pointer transition-colors"
                        style={on
                            ? { borderColor: layer.color, color: '#fff', background: `${layer.color}30` }
                            : { borderColor: 'rgba(255,255,255,0.2)', color: '#CBD5E1' }}
                    >{t.label}</button>
                );
            })}
        </div>
        {/* Sem esperar a saída: o texto da aba nova entra na hora, o velho não fica preso. */}
        <motion.p
            key={tab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: DUR.text, ease: EASE }}
            className="m-0 text-[18.5px] leading-[1.45] text-slate-100"
        >
            {layer[tab]}
        </motion.p>
    </div>
);
