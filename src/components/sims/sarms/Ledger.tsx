import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { HpgGlyph, LiverGlyph } from './BillGlyphs';
import { COLORS, HPG, LIVER, MOA, MUSCLE, PROSTATE, VASCULAR } from './content';
import { ReceptorGlyph, SarmMolecule } from './ReceptorGlyph';

/**
 * Passos 1–2: "a promessa" (seletividade músculo × próstata) à esquerda e "a conta"
 * (fígado + eixo HPG) à direita, quatro cartões em fileira. No passo 1 a conta fica
 * esmaecida (mas legível); no 2, a promessa recua.
 */

interface LedgerProps {
    readonly step: number;
}

const CARD_BG = 'rgba(8,8,18,0.72)';
const DIM = 0.62;
const GLYPH_H = 166;

interface TileProps {
    readonly glyph: ReactNode;
    readonly kicker: string;
    readonly verb: string;
    /** Cor da borda e do desenho. */
    readonly color: string;
    /** Cor do texto de destaque (clara o bastante para continuar legível esmaecida). */
    readonly ink: string;
    readonly lines: readonly string[];
    readonly note?: string;
}

const Tile = ({ glyph, kicker, verb, color, ink, lines, note }: TileProps) => (
    <div className="rounded-2xl border flex flex-col min-h-0 p-1.5" style={{ background: CARD_BG, borderColor: `${color}66` }}>
        <div className="shrink-0 w-full" style={{ height: GLYPH_H }}>{glyph}</div>
        <div className="flex flex-col min-w-0 px-2 pb-1.5 pt-0.5">
            <div className="flex flex-wrap items-baseline gap-x-2.5">
                <span className="font-mono text-[14px] uppercase tracking-wider" style={{ color: ink }}>{kicker}</span>
                <span className="font-display font-bold leading-tight text-white text-[21px]">{verb}</span>
            </div>
            <span className="text-[15px] leading-snug text-gray-100 mt-0.5">{lines.join(' ')}</span>
            {note && <span className="mt-1.5 text-[14px] leading-snug text-gray-200 border-t border-white/15 pt-1.5">{note}</span>}
        </div>
    </div>
);

const Column = ({ on, children }: { on: boolean; children: ReactNode }) => (
    <motion.div className="flex flex-col gap-2 min-h-0" initial={false} animate={{ opacity: on ? 1 : DIM, filter: on ? 'saturate(1)' : 'saturate(0.7)' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}>
        {children}
    </motion.div>
);

/** Chave das abreviações do desenho do receptor (mesma altura da faixa vascular à direita). */
const GlyphLegend = () => (
    <div className="flex items-center gap-4 px-3 h-[34px] rounded-xl border border-white/15 text-[14px] text-gray-100" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <span className="flex items-center gap-1.5">
            <svg width="32" height="18" viewBox="-20 -9 40 18" aria-hidden><SarmMolecule x={0} y={0} /></svg> SARM
        </span>
        <span><b className="font-mono text-cyan-300">H12</b> hélice 12</span>
        <span><b className="font-mono text-emerald-300">coat.</b> coativador</span>
        <span><b className="font-mono text-blue-300">LBD</b> domínio de ligação</span>
    </div>
);

const ColumnHead = ({ title, color, text }: { title: string; color: string; text: string }) => (
    <div className="h-[60px] flex flex-col justify-center px-1">
        <span className="font-display text-[17px] font-semibold leading-tight" style={{ color }}>{title}</span>
        <span className="text-[14px] leading-snug text-gray-100">{text}</span>
    </div>
);

export const Ledger = ({ step }: LedgerProps) => {
    const bill = step >= 2;
    return (
        <div className="grid gap-3 h-full" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
            <Column on={!bill}>
                <ColumnHead title="A promessa: seletividade" color="#67E8F9" text={MOA} />
                <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
                    <Tile glyph={<ReceptorGlyph mode="agonist" active />} kicker={MUSCLE.tissue} verb={MUSCLE.verb} color={COLORS.cyan} ink="#67E8F9" lines={MUSCLE.lines} />
                    <Tile glyph={<ReceptorGlyph mode="antagonist" active />} kicker={PROSTATE.tissue} verb={PROSTATE.verb} color={COLORS.rose} ink="#FDA4AF" lines={PROSTATE.lines} note={PROSTATE.note} />
                </div>
                <GlyphLegend />
            </Column>
            <Column on={bill}>
                <ColumnHead title="A conta: realidade clínica" color="#FDA4AF" text="Quem paga: o fígado e o eixo hipotálamo-hipófise-gônadas." />
                <div className="grid grid-cols-2 gap-2 flex-1 min-h-0">
                    <Tile glyph={<LiverGlyph active={bill} />} kicker="Fígado" verb={LIVER.title} color={COLORS.red} ink="#FDA4AF" lines={LIVER.lines} />
                    <Tile glyph={<HpgGlyph active={bill} />} kicker={HPG.title} verb={HPG.verb} color={COLORS.red} ink="#FDA4AF" lines={HPG.lines} />
                </div>
                <div className="flex items-center gap-2 px-3 h-[34px] rounded-xl border text-[14px] text-rose-100"
                    style={{ borderColor: 'rgba(225,29,72,0.55)', background: 'rgba(225,29,72,0.12)' }}>
                    <AlertTriangle size={17} className="shrink-0 text-rose-300" /> {VASCULAR}
                </div>
            </Column>
        </div>
    );
};
