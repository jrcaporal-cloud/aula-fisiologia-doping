import { motion } from 'framer-motion';
import { Clock3, ScanSearch } from 'lucide-react';
import { DUR, EASE_OUT, stagger } from '../../../lib/motion';
import { SUBSTANCE } from '../../../lib/palette';
import type { Piece } from './content';
import { RichText } from './RichText';

interface PiecePanelProps {
    readonly piece: Piece;
    readonly index: number;
}

/** Detalhe da peça que acabou de encaixar: texto do cartão + perfil de rastro. */
export const PiecePanel = ({ piece, index }: PiecePanelProps) => {
    const c = piece.color;
    const hidden = piece.id === 'ins';
    return (
        <div className="flex h-full flex-col px-7 py-4">
            <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[14px] uppercase tracking-[0.12em] text-gray-300">
                    Peça {index + 1}/3 · {piece.role}
                </span>
                <span className="rounded-md border px-2.5 py-1 font-mono text-[14px] uppercase tracking-wide" style={{ color: piece.soft, borderColor: `${c}66`, background: `${c}1f` }}>
                    {piece.badge}
                </span>
            </div>

            <div className="mt-2 flex items-baseline gap-4">
                <div className="font-display font-bold leading-none" style={{ color: c, fontSize: 42 }}>{piece.name}</div>
                <span className="text-[22px] font-semibold leading-tight text-white">{piece.cardTitle}</span>
            </div>

            <p className="mt-3 border-l-[3px] pl-3 font-body text-[18px] font-medium leading-snug" style={{ borderColor: c, color: piece.soft, marginBottom: 14 }}>
                {piece.summary}
            </p>

            <div className="space-y-3">
                {piece.paragraphs.map((p, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stagger(i, 0.15, 0.12), duration: DUR.enter, ease: EASE_OUT }}>
                        <RichText spans={p} className="font-body text-gray-200" style={{ fontSize: 17, lineHeight: 1.5 }} />
                    </motion.div>
                ))}
            </div>

            <div className="mt-auto grid grid-cols-2 gap-3 pt-3">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5">
                    <Clock3 size={20} style={{ color: piece.soft }} aria-hidden />
                    <div>
                        <div className="font-mono text-[14px] uppercase tracking-[0.06em] text-gray-300">Meia-vida (T½)</div>
                        <div className="text-[22px] font-semibold leading-tight text-white">{piece.half}</div>
                    </div>
                </div>
                <div
                    className="flex items-center gap-3 rounded-xl border px-4 py-2.5"
                    style={{ borderColor: hidden ? `${SUBSTANCE.insulin}99` : 'rgba(255,255,255,0.1)', background: hidden ? `${SUBSTANCE.insulin}1f` : 'rgba(0,0,0,0.3)' }}
                >
                    <ScanSearch size={20} style={{ color: piece.soft }} aria-hidden />
                    <div>
                        <div className="font-mono text-[14px] uppercase tracking-[0.06em] text-gray-300">Janela de detecção</div>
                        <div className="text-[22px] font-semibold leading-tight" style={{ color: hidden ? '#A5F3FC' : '#fff' }}>{piece.detect}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
