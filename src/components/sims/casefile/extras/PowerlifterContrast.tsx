import { motion } from 'framer-motion';
import { DUR, EASE_OUT, stagger } from '../../../../lib/motion';
import { CASE_COLORS } from '../../../../lib/palette';
import type { SceneProps } from '../types';

const ROWS = [
    // O relato é o "álibi" marcado no prontuário: mesma cor do caso. Os exames ficam neutros.
    { who: 'O relato', text: '"testosterona terapêutica" por hipogonadismo', color: CASE_COLORS.powerlifter },
    { who: 'Os exames', text: 'LH / FSH < 0,2 mUI/mL: hipogonadismo induzido (secundário)', color: '#D1D5DB' },
] as const;

/** Passo 3 do powerlifter: o relato confrontado com o que os exames provam (frases do slide). */
export const PowerlifterContrast = ({ revealed }: SceneProps) => {
    if (!revealed) return null;
    return (
        <div className="mt-1 flex flex-col gap-1.5">
            {ROWS.map((r, i) => (
                <motion.div key={r.who} className="rounded-lg px-3 py-2 border"
                    style={{ borderColor: `${r.color}77`, background: `${r.color}14` }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: DUR.enter, delay: stagger(i, 0.35, 0.2), ease: EASE_OUT }}>
                    <div className="font-mono text-[15px] uppercase tracking-wider" style={{ color: r.color }}>{r.who}</div>
                    <div className="text-[17px] leading-snug text-white">{r.text}</div>
                </motion.div>
            ))}
        </div>
    );
};
