import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import type { SceneProps } from '../types';

/** Cadeia do "crash" (frases do slide 27): EPO interrompida → produção natural desligada → reticulócitos. */
const LINKS = [
    { text: 'EPO interrompida', sub: 'limpar a janela', color: '#F59E0B', note: '#FCD34D' },
    { text: 'Produção natural desligada', sub: 'feedback excessivo anterior', color: '#A855F7', note: '#D8B4FE' },
    { text: 'Reticulócitos 0,2%', sub: '"crash" paradoxal', color: '#E11D48', note: '#FDA4AF' },
] as const;

export const EpoChain = ({ revealed }: SceneProps) => {
    if (!revealed) return null;
    return (
        <div className="mt-0.5 flex flex-col">
            {LINKS.map((l, i) => (
                <div key={l.text} className="flex flex-col">
                    {i > 0 && (
                        <motion.span className="pl-[9px] h-[12px] flex items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.35 }}>
                            <ArrowDown size={12} className="text-gray-300" />
                        </motion.span>
                    )}
                    <motion.div className="rounded-lg border px-3 py-1 flex flex-col leading-tight"
                        style={{ borderColor: `${l.color}99`, background: `${l.color}1f` }}
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, delay: 0.4 + i * 0.35 }}>
                        <span className="text-[16px] font-semibold text-white">{l.text}</span>
                        <span className="text-[15px]" style={{ color: l.note }}>{l.sub}</span>
                    </motion.div>
                </div>
            ))}
        </div>
    );
};
