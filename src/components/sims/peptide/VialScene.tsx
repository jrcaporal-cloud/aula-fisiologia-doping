import { motion } from 'framer-motion';
import { SvgText } from './ui';

/** Passo 4: o frasco "só para pesquisa" e as quatro perguntas que ninguém responde. */

const VIEW = { w: 700, h: 420 } as const;
const VIAL = { x: 250, top: 70, w: 170, h: 290 } as const;

interface Question { text: string; x: number; y: number }
const QUESTIONS: readonly Question[] = [
    { text: 'Conteúdo?', x: 520, y: 92 },
    { text: 'Dose?', x: 540, y: 172 },
    { text: 'Esterilidade?', x: 530, y: 252 },
    { text: 'Origem?', x: 520, y: 332 },
];

export const VialScene = () => {
    const cx = VIAL.x + VIAL.w / 2;
    const bodyTop = VIAL.top + 70;
    return (
        <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="w-full h-full" role="img" aria-label="Frasco vendido como uso em pesquisa">
            <motion.g animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
            {/* Tampa e gargalo */}
            <rect x={cx - 52} y={VIAL.top} width={104} height={36} rx={6} fill="#9F1239" stroke="#FDA4AF" strokeWidth={1.5} />
            <rect x={cx - 38} y={VIAL.top + 36} width={76} height={34} fill="rgba(226,232,240,0.12)" stroke="rgba(226,232,240,0.5)" strokeWidth={1.5} />
            {/* Corpo de vidro */}
            <rect x={VIAL.x} y={bodyTop} width={VIAL.w} height={VIAL.h - 70} rx={22} fill="rgba(226,232,240,0.08)" stroke="rgba(226,232,240,0.55)" strokeWidth={2} />
            <rect x={VIAL.x + 8} y={VIAL.top + VIAL.h - 70} width={VIAL.w - 16} height={62} rx={16} fill="rgba(241,245,249,0.16)" />
            {/* Rótulo */}
            <rect x={VIAL.x - 6} y={bodyTop + 34} width={VIAL.w + 12} height={128} rx={6} fill="#F8FAFC" />
            <text x={cx} y={bodyTop + 66} textAnchor="middle" fontSize={22} fontWeight={800} fill="#0F172A" style={{ fontFamily: 'var(--font-display)' }}>BPC-157</text>
            <text x={cx} y={bodyTop + 98} textAnchor="middle" fontSize={14.5} fontWeight={700} fill="#9F1239" style={{ fontFamily: 'var(--font-body)' }}>RESEARCH USE ONLY</text>
            <text x={cx} y={bodyTop + 121} textAnchor="middle" fontSize={15} fontWeight={600} fill="#334155" style={{ fontFamily: 'var(--font-body)' }}>Not for human</text>
            <text x={cx} y={bodyTop + 141} textAnchor="middle" fontSize={15} fontWeight={600} fill="#334155" style={{ fontFamily: 'var(--font-body)' }}>consumption</text>
            <rect x={VIAL.x + 14} y={bodyTop + 10} width={10} height={VIAL.h - 100} rx={5} fill="rgba(255,255,255,0.18)" />
            </motion.g>

            {QUESTIONS.map((q, i) => (
                <motion.g key={q.text} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, delay: 0.5 + i * 0.45 }}>
                    <line x1={VIAL.x + VIAL.w + 14} x2={q.x - 12} y1={bodyTop + 98} y2={q.y - 6} stroke="rgba(253,164,175,0.35)" strokeDasharray="4 5" />
                    <SvgText x={q.x} y={q.y} text={q.text} size={21} color="#FDA4AF" weight={700} />
                </motion.g>
            ))}
        </svg>
    );
};
