import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { DUR, EASE_OUT, stagger } from '../../../../lib/motion';
import { CASE_COLORS, SUBSTANCE } from '../../../../lib/palette';
import type { SceneProps } from '../types';

/** Cadeia do "crash" (frases do slide 27): EPO interrompida → produção natural desligada → reticulócitos. */
const LINKS = [
    // Marcador do caso na cor do caso; o elo do meio é neutro; o "crash" é dano (vermelho de risco).
    { text: 'EPO interrompida', sub: 'limpar a janela', color: CASE_COLORS.cyclist, note: '#FDA4AF' },
    { text: 'Produção natural desligada', sub: 'feedback excessivo anterior', color: '#9CA3AF', note: '#D1D5DB' },
    { text: 'Reticulócitos 0,2%', sub: '"crash" paradoxal', color: SUBSTANCE.risk, note: '#FDA4AF' },
] as const;

export const EpoChain = ({ revealed }: SceneProps) => {
    if (!revealed) return null;
    return (
        <div className="mt-0.5 flex flex-col">
            {LINKS.map((l, i) => (
                <div key={l.text} className="flex flex-col">
                    {i > 0 && (
                        <motion.span className="pl-[9px] h-[12px] flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: stagger(i, 0.33, 0.15), duration: DUR.text, ease: EASE_OUT }}>
                            <ArrowDown size={12} className="text-gray-300" />
                        </motion.span>
                    )}
                    <motion.div className="rounded-lg border px-3 py-1 flex flex-col leading-tight"
                        style={{ borderColor: `${l.color}99`, background: `${l.color}1f` }}
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: DUR.enter, delay: stagger(i, 0.4, 0.15), ease: EASE_OUT }}>
                        <span className="text-[16px] font-semibold text-white">{l.text}</span>
                        <span className="text-[15px]" style={{ color: l.note }}>{l.sub}</span>
                    </motion.div>
                </div>
            ))}
        </div>
    );
};
