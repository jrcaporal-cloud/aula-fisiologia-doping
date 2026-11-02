import { AnimatePresence, motion } from 'framer-motion';
import { VERTICES, type TextPart, type Vertex } from './content';
import { VertexVisual } from './Visuals';

/** Painel do passo: visão geral (0), um vértice com texto verbatim (1–3) ou a síntese dos embates (4). */

const EASE = [0.16, 1, 0.3, 1] as const;

const Rich = ({ parts }: { parts: readonly TextPart[] }) => (
    <>
        {parts.map((p, i) => (p.em ? <em key={i} className="text-white not-italic font-semibold">{p.text}</em> : <span key={i}>{p.text}</span>))}
    </>
);

const RowLabel = ({ children, color }: { children: string; color: string }) => (
    <div className="font-mono text-[12px] uppercase tracking-[0.14em] mb-1" style={{ color }}>{children}</div>
);

const VertexDetail = ({ v }: { v: Vertex }) => (
    <div className="flex flex-col h-full">
        <div className="flex items-baseline gap-3">
            <span className="font-display text-[26px] font-extrabold leading-none" style={{ color: v.color }}>{v.num}</span>
            <span className="font-display text-[20px] font-semibold text-white leading-tight">{v.title}</span>
        </div>
        <div className="mt-1 font-display text-[15px] font-semibold" style={{ color: v.soft }}>{v.label}</div>

        <motion.div className="mt-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}>
            <RowLabel color={v.soft}>Premissa</RowLabel>
            <p className="text-[14px] leading-[1.45] text-gray-100"><Rich parts={v.premise} /></p>
        </motion.div>
        <motion.div className="mt-2" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.35 }}>
            <RowLabel color={v.soft}>Contraponto</RowLabel>
            <p className="text-[14px] leading-[1.45] text-gray-100"><Rich parts={v.counter} /></p>
        </motion.div>

        <div className="mt-2 rounded-xl border border-white/10 px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.025)' }}>
            <VertexVisual id={v.id} />
        </div>

        <motion.div className="mt-auto rounded-xl border-l-[3px] px-3 py-1.5" style={{ borderColor: v.color, background: `${v.color}14` }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.4, ease: EASE }}>
            <RowLabel color={v.soft}>▶ O Embate</RowLabel>
            <p className="text-[14.5px] leading-[1.45] text-white">{v.embate}</p>
        </motion.div>

    </div>
);

const Overview = ({ onSelect }: { onSelect: (i: number) => void }) => (
    <div className="flex flex-col h-full">
        <div className="font-display text-[20px] font-semibold text-white">Três vértices, a mesma estrutura</div>
        <div className="mt-1 text-[14px] text-gray-200">premissa → contraponto → <span className="text-white font-semibold">▶ O Embate</span></div>
        <div className="mt-4 flex flex-col gap-2.5">
            {VERTICES.map((v, i) => (
                <motion.button key={v.id} type="button" onClick={() => onSelect(i)}
                    className="text-left rounded-xl border px-4 py-3 cursor-pointer transition-colors hover:bg-white/5"
                    style={{ borderColor: `${v.color}55`, background: `${v.color}0d` }}
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12, duration: 0.4, ease: EASE }}>
                    <div className="flex items-baseline gap-3">
                        <span className="font-display text-[20px] font-extrabold" style={{ color: v.color }}>{v.num}</span>
                        <span className="font-display text-[17px] font-semibold text-white">{v.title}</span>
                    </div>
                    <div className="mt-0.5 pl-[42px] text-[14px]" style={{ color: v.soft }}>{v.label}</div>
                </motion.button>
            ))}
        </div>
        <div className="mt-auto text-[13px] text-gray-300">O passador abre um vértice por vez.</div>
    </div>
);

const Synthesis = () => (
    <div className="flex flex-col h-full">
        <div className="font-display text-[20px] font-semibold text-white">▶ O Embate, nos três vértices</div>
        <div className="mt-3 flex flex-col gap-2.5 flex-1">
            {VERTICES.map((v, i) => (
                <motion.div key={v.id} className="rounded-xl border-l-[3px] px-4 py-2.5 flex-1 flex flex-col justify-center"
                    style={{ borderColor: v.color, background: `${v.color}12` }}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.15, duration: 0.4, ease: EASE }}>
                    <div className="flex items-baseline gap-2.5">
                        <span className="font-display text-[16px] font-extrabold" style={{ color: v.color }}>{v.num}</span>
                        <span className="font-display text-[15px] font-semibold" style={{ color: v.soft }}>{v.title}</span>
                    </div>
                    <p className="mt-1 text-[15px] leading-[1.45] text-white">{v.embateShort}</p>
                </motion.div>
            ))}
        </div>
    </div>
);

export interface VertexPanelProps {
    readonly step: number;
    readonly onSelect: (i: number) => void;
}

export const VertexPanel = ({ step, onSelect }: VertexPanelProps) => {
    const v = step >= 1 && step <= 3 ? VERTICES[step - 1] : null;
    return (
        <div className="relative rounded-2xl border border-white/10 overflow-hidden h-full" style={{ background: 'rgba(8,8,18,0.72)' }}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px] transition-colors duration-500" style={{ background: v ? v.color : 'rgba(255,255,255,0.25)' }} />
            <AnimatePresence mode="wait">
                <motion.div key={step} className="h-full p-4 pl-5"
                    initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3, ease: EASE }}>
                    {step === 0 && <Overview onSelect={i => onSelect(i + 1)} />}
                    {v && <VertexDetail v={v} />}
                    {step === 4 && <Synthesis />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
