import { motion } from 'framer-motion';
import type { SceneProps } from '../types';

const ROWS = [
    { who: 'O relato', text: '"testosterona terapêutica" por hipogonadismo', color: '#F59E0B' },
    { who: 'Os exames', text: 'LH / FSH < 0,2 mUI/mL: hipogonadismo induzido (secundário)', color: '#60A5FA' },
] as const;

/** Passo 3 do powerlifter: o relato confrontado com o que os exames provam (frases do slide). */
export const PowerlifterContrast = ({ revealed }: SceneProps) => {
    if (!revealed) return null;
    return (
        <div className="mt-1 flex flex-col gap-1.5">
            {ROWS.map((r, i) => (
                <motion.div key={r.who} className="rounded-lg px-3 py-2 border"
                    style={{ borderColor: `${r.color}77`, background: `${r.color}14` }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.35 + i * 0.2 }}>
                    <div className="font-mono text-[12px] uppercase tracking-widest" style={{ color: r.color }}>{r.who}</div>
                    <div className="text-[14px] leading-snug text-white">{r.text}</div>
                </motion.div>
            ))}
        </div>
    );
};
