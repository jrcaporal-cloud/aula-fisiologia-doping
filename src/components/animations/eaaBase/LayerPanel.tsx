import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { EASE, TABS, type Layer, type TabKey } from './content';

/** Texto da camada (verbatim): resumo + abas Química / Mecanismo / Risco Real. */
export const LayerPanel = ({ layer }: { layer: Layer }) => {
    const [tab, setTab] = useState<TabKey>('detail');
    return (
        <div className="h-full rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] p-5 flex flex-col gap-3 overflow-hidden"
            style={{ boxShadow: `inset 0 2px 0 ${layer.color}66` }}>
            <div className="font-mono text-[12px] tracking-[0.2em] uppercase" style={{ color: layer.ink }}>Camada {layer.id + 1} de 4</div>
            <h3 className="m-0 font-display font-semibold text-[23px] leading-tight text-white">{layer.title}</h3>
            <p className="m-0 text-[15px] leading-snug text-gray-100">{layer.summary}</p>
            <div className="flex gap-1.5 pt-1" role="tablist">
                {TABS.map(t => {
                    const on = t.key === tab;
                    return (
                        <button
                            key={t.key}
                            type="button"
                            role="tab"
                            aria-selected={on}
                            onClick={() => setTab(t.key)}
                            className="text-[13px] px-3 py-1 rounded-full border cursor-pointer transition-colors"
                            style={on
                                ? { borderColor: layer.color, color: '#fff', background: `${layer.color}30` }
                                : { borderColor: 'rgba(255,255,255,0.14)', color: '#9CA3AF' }}
                        >{t.label}</button>
                    );
                })}
            </div>
            <AnimatePresence mode="wait">
                <motion.p
                    key={tab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="m-0 text-[14px] leading-relaxed text-gray-300"
                >
                    {layer[tab]}
                </motion.p>
            </AnimatePresence>
        </div>
    );
};
