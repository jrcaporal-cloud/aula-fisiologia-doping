import { motion } from 'framer-motion';
import { ChevronsRight, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { T_GROUPS, WA_LIMIT, fmt } from './biologyData';
import { CARD, CARD_BG } from './StepHeader';

const COLS = '330px minmax(0,1fr) 132px';
const EASE = [0.16, 1, 0.3, 1] as const;

const SCALES = {
    full: { max: 30, ticks: [0, 5, 10, 15, 20, 25, 30] },
    zoom: { max: 4, ticks: [0, 1, 2, 3, 4] },
} as const;

const pct = (v: number, max: number): number => Math.min(Math.max(v / max, 0), 1) * 100;

/** Passo 0: faixas de referência de testosterona por grupo, com o limiar do World Athletics. */
export const TestosteroneChart = () => {
    const [zoomed, setZoomed] = useState(false);
    const [active, setActive] = useState<number | null>(null);
    const { max, ticks } = zoomed ? SCALES.zoom : SCALES.full;
    const waX = pct(WA_LIMIT, max);

    return (
        <div className={`${CARD} h-full px-5 pt-3 pb-2 flex flex-col`} style={CARD_BG}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="font-mono text-[14px] uppercase tracking-wider text-gray-300">Níveis séricos de testosterona (nmol/L)</div>
                    <div className="text-[17px] text-white font-medium mt-0.5">Comparação entre grupos — valores de referência clínica</div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex items-center gap-4 text-[15px] text-gray-200">
                        <span className="flex items-center gap-2"><span className="w-7 h-2.5 rounded-full bg-gray-300/60" />faixa normal</span>
                        <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded-full bg-gray-100 border-2 border-black/50" />média</span>
                    </div>
                    <button type="button" onClick={() => setZoomed(z => !z)}
                        className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[15px] font-semibold cursor-pointer transition-colors"
                        style={{ borderColor: zoomed ? '#E879F999' : 'rgba(255,255,255,0.15)', color: zoomed ? '#F5D0FE' : '#E5E7EB', background: zoomed ? 'rgba(232,121,249,0.12)' : 'transparent' }}>
                        {zoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
                        {zoomed ? 'Escala 0–30' : 'Ampliar 0–4'}
                    </button>
                </div>
            </div>

            <div className="relative flex-1 mt-2 flex flex-col">
                {/* grade + limiar do WA */}
                <div className="absolute inset-0 grid pointer-events-none" style={{ gridTemplateColumns: COLS }}>
                    <div />
                    <div className="relative">
                        {ticks.map(t => (
                            <motion.div key={`${max}-${t}`} className="absolute top-0 bottom-6 w-px bg-white/[0.07]"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ left: `${pct(t, max)}%` }} />
                        ))}
                        <motion.div className="absolute top-0 bottom-6 border-l-2 border-dashed" style={{ borderColor: '#E879F9AA' }}
                            animate={{ left: `${waX}%` }} transition={{ duration: 0.8, ease: EASE }}>
                            <span className="absolute -top-1 left-1.5 whitespace-nowrap font-mono text-[15px] font-semibold" style={{ color: '#F0ABFC' }}>
                                {fmt(WA_LIMIT)} nmol/L
                            </span>
                        </motion.div>
                    </div>
                    <div />
                </div>

                <div className="relative flex-1 flex flex-col justify-around pt-6">
                    {T_GROUPS.map((g, i) => {
                        const offScale = g.range[0] >= max;
                        const left = pct(g.range[0], max);
                        const width = pct(g.range[1], max) - left;
                        const dim = active !== null && active !== i;
                        return (
                            <button key={g.label} type="button" onClick={() => setActive(active === i ? null : i)}
                                className="grid items-center text-left cursor-pointer transition-opacity duration-300"
                                style={{ gridTemplateColumns: COLS, opacity: dim ? 0.6 : 1 }}>
                                <div className="pr-3">
                                    <div className="text-[16px] font-semibold leading-tight" style={{ color: active === i ? g.color : '#F3F4F6' }}>{g.label}</div>
                                    {g.note && <div className="text-[15px] text-gray-300 leading-tight mt-0.5">{g.note}</div>}
                                </div>
                                <div className="relative h-[30px]">
                                    <div className="absolute inset-x-0 top-[9px] h-3 rounded-full bg-white/[0.06]" />
                                    {!offScale && (
                                        <>
                                            <motion.div className="absolute top-[9px] h-3 rounded-full"
                                                style={{ background: g.color, opacity: 0.55 }}
                                                initial={{ left: `${left}%`, width: 0 }}
                                                animate={{ left: `${left}%`, width: `${width}%` }}
                                                transition={{ duration: 0.9, delay: 0.15 + i * 0.12, ease: EASE }} />
                                            <motion.div className="absolute top-[6px] w-[18px] h-[18px] -ml-[9px] rounded-full border-2"
                                                style={{ background: g.color, borderColor: 'rgba(0,0,0,0.55)', boxShadow: `0 0 14px ${g.color}88` }}
                                                initial={{ left: `${pct(g.mean, max)}%`, scale: 0 }}
                                                animate={{ left: `${pct(g.mean, max)}%`, scale: 1 }}
                                                transition={{ duration: 0.6, delay: 0.5 + i * 0.12, ease: EASE }} />
                                        </>
                                    )}
                                    {offScale && (
                                        <motion.div className="absolute right-1 top-[3px] flex items-center gap-1 font-mono text-[15px]" style={{ color: g.color }}
                                            initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                                            <ChevronsRight size={20} />
                                        </motion.div>
                                    )}
                                </div>
                                <div className="text-right pl-2">
                                    <div className="font-mono text-[15px] text-gray-100">{fmt(g.range[0])}–{fmt(g.range[1])}</div>
                                    <div className="font-mono text-[15px]" style={{ color: g.color }}>média {fmt(g.mean)}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* eixo */}
                <div className="grid h-6 items-end" style={{ gridTemplateColumns: COLS }}>
                    <div className="font-mono text-[15px] text-gray-300 pb-0.5">nmol/L</div>
                    <div className="relative h-full">
                        {ticks.map(t => (
                            <span key={`${max}-${t}`} className="absolute bottom-0 -translate-x-1/2 font-mono text-[15px] text-gray-300" style={{ left: `${pct(t, max)}%` }}>
                                {fmt(t)}
                            </span>
                        ))}
                    </div>
                    <div />
                </div>
            </div>
        </div>
    );
};
