import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { HpgGlyph, LiverGlyph } from './BillGlyphs';
import { COLORS, HPG, LIVER, MOA, MUSCLE, PROSTATE, VASCULAR } from './content';
import { ReceptorGlyph, SarmMolecule } from './ReceptorGlyph';

/**
 * Passos 1–2: "a promessa" (seletividade músculo × próstata) à esquerda e "a conta"
 * (fígado + eixo HPG) à direita. No passo 1 a conta está apagada; no 2, a promessa recua.
 */

interface LedgerProps {
    readonly step: number;
}

const CARD_BG = 'rgba(8,8,18,0.72)';

interface TileProps {
    readonly glyph: ReactNode;
    readonly kicker: string;
    readonly verb: string;
    readonly color: string;
    readonly lines: readonly string[];
    readonly note?: string;
}

const Tile = ({ glyph, kicker, verb, color, lines, note }: TileProps) => (
    <div className="rounded-2xl border flex items-stretch gap-2 pl-1 pr-3 py-1.5 min-h-0" style={{ background: CARD_BG, borderColor: `${color}55` }}>
        <div className="shrink-0 h-full" style={{ width: 268 }}>{glyph}</div>
        <div className="flex flex-col justify-center min-w-0 py-1">
            <span className="font-mono text-[12px] uppercase tracking-widest" style={{ color }}>{kicker}</span>
            <span className="font-display font-bold leading-tight text-white" style={{ fontSize: 25 }}>{verb}</span>
            {lines.map(l => <span key={l} className="text-[14px] leading-snug text-gray-200">{l}</span>)}
            {note && <span className="mt-1.5 text-[13px] leading-snug text-gray-300 border-t border-white/10" style={{ paddingTop: 6 }}>{note}</span>}
        </div>
    </div>
);

const Column = ({ on, dim, children }: { on: boolean; dim: number; children: ReactNode }) => (
    <motion.div className="flex flex-col gap-2.5 min-h-0" initial={false} animate={{ opacity: on ? 1 : dim, filter: on ? 'saturate(1)' : 'saturate(0.3)' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}>
        {children}
    </motion.div>
);

/** Chave das abreviações do desenho do receptor (mesma altura da faixa vascular à direita). */
const GlyphLegend = () => (
    <div className="flex items-center gap-4 px-3 py-2 rounded-xl border border-white/10 text-[13px] text-gray-200" style={{ background: 'rgba(255,255,255,0.03)' }}>
        <span className="flex items-center gap-1.5">
            <svg width="30" height="16" viewBox="-20 -9 40 18" aria-hidden><SarmMolecule x={0} y={0} /></svg> SARM
        </span>
        <span><b className="font-mono text-cyan-300">H12</b> hélice 12</span>
        <span><b className="font-mono text-emerald-300">coat.</b> coativador</span>
        <span><b className="font-mono text-blue-300">LBD</b> domínio de ligação</span>
    </div>
);

export const Ledger = ({ step }: LedgerProps) => {
    const bill = step >= 2;
    return (
        <div className="grid gap-3 h-full" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' }}>
            <Column on={!bill} dim={0.42}>
                <div className="h-[44px] flex flex-col justify-center px-1">
                    <span className="font-display text-[16px] font-semibold" style={{ color: COLORS.cyan }}>A promessa: seletividade</span>
                    <span className="text-[13px] leading-tight text-gray-200">{MOA}</span>
                </div>
                <div className="grid gap-2.5 flex-1 min-h-0" style={{ gridTemplateRows: '1fr 1fr' }}>
                    <Tile glyph={<ReceptorGlyph mode="agonist" active />} kicker={MUSCLE.tissue} verb={MUSCLE.verb} color={COLORS.green} lines={MUSCLE.lines} />
                    <Tile glyph={<ReceptorGlyph mode="antagonist" active />} kicker={PROSTATE.tissue} verb={PROSTATE.verb} color={COLORS.rose} lines={PROSTATE.lines} note={PROSTATE.note} />
                </div>
                <GlyphLegend />
            </Column>
            <Column on={bill} dim={0.22}>
                <div className="h-[44px] flex flex-col justify-center px-1">
                    <span className="font-display text-[16px] font-semibold" style={{ color: COLORS.rose }}>A conta: realidade clínica</span>
                    <span className="text-[13px] leading-tight text-gray-200">Quem paga: o fígado e o eixo hipotálamo-hipófise-gônadas.</span>
                </div>
                <div className="grid gap-2.5 flex-1 min-h-0" style={{ gridTemplateRows: '1fr 1fr' }}>
                    <Tile glyph={<LiverGlyph active={bill} />} kicker="Fígado" verb={LIVER.title} color={COLORS.red} lines={LIVER.lines} />
                    <Tile glyph={<HpgGlyph active={bill} />} kicker={HPG.title} verb={HPG.verb} color={COLORS.red} lines={HPG.lines} />
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[13.5px] text-rose-100"
                    style={{ borderColor: 'rgba(225,29,72,0.45)', background: 'rgba(225,29,72,0.10)' }}>
                    <AlertTriangle size={15} className="shrink-0 text-rose-300" /> {VASCULAR}
                </div>
            </Column>
        </div>
    );
};
