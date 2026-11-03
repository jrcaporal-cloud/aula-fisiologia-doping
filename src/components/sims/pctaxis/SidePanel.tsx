import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Syringe, Pill } from 'lucide-react';
import type { ReactNode } from 'react';
import { HCG, IA, MAP_ROWS, NUMBERS, SERM, SUPPRESSED, type ClassCard } from './content';

/** Coluna direita: o cartão do slide (verbatim) + o número que ele traz. */

const CARD = 'rounded-2xl border border-white/10';
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const ClassText = ({ card, size = 16 }: { card: ClassCard; size?: number }) => (
    <div className={`${CARD} px-4 py-3 border-l-4`} style={{ ...CARD_BG, borderLeftColor: card.color }}>
        <div className="font-mono text-[14px] uppercase tracking-wider" style={{ color: card.color }}>{card.tag}</div>
        <div className="font-display text-[19px] font-semibold leading-snug text-white mt-1">{card.name}</div>
        <p className="text-gray-100 mt-2" style={{ fontSize: size, lineHeight: 1.45 }}>{card.text}</p>
    </div>
);

const Chip = ({ icon, color, big, small }: { icon: ReactNode; color: string; big: string; small: string }) => (
    <motion.div className="rounded-2xl border px-4 py-3 flex items-center gap-3 flex-1 min-h-[72px]" style={{ borderColor: `${color}99`, background: `${color}16` }}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.35 }}>
        <span style={{ color }}>{icon}</span>
        <div>
            <div className="font-display text-[24px] font-bold text-white leading-tight">{big}</div>
            <div className="text-[16px] text-gray-100">{small}</div>
        </div>
    </motion.div>
);

const E2Gauge = () => (
    <div className={`${CARD} px-4 py-3 flex-1 min-h-0 flex flex-col justify-center`} style={CARD_BG}>
        <div className="flex items-baseline justify-between">
            <span className="font-mono text-[14px] uppercase tracking-wider text-gray-100">Estradiol (E2)</span>
            <span className="font-display text-[20px] font-bold" style={{ color: IA.color }}>cai até {NUMBERS.e2Drop}%</span>
        </div>
        <div className="relative mt-2 h-4 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div className="absolute left-0 top-0 bottom-0 rounded-full" style={{ background: 'linear-gradient(90deg, #E11D48, #FB7185)' }}
                initial={{ width: '100%' }} animate={{ width: `${100 - NUMBERS.e2Drop}%` }} transition={{ delay: 0.6, duration: 1.6, ease: 'easeInOut' }} />
        </div>
        <div className="flex items-start gap-2 mt-3 text-[16px] text-amber-100 leading-snug">
            <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: IA.color }} />
            <span><strong>Risco:</strong> {NUMBERS.iaRisk}</span>
        </div>
    </div>
);

const Suppressed = () => (
    <div className={`${CARD} px-4 py-3 flex-1 min-h-0 flex flex-col`} style={CARD_BG}>
        <div className="font-mono text-[14px] uppercase tracking-wider text-rose-200">{SUPPRESSED.tag}</div>
        <div className="font-display text-[20px] font-semibold text-white mt-1">{SUPPRESSED.name}</div>
        <div className="mt-2 space-y-2">
            {SUPPRESSED.paras.map(p => <p key={p} className="text-[16.5px] text-gray-100" style={{ lineHeight: 1.45 }}>{p}</p>)}
        </div>
        <div className="mt-auto pt-3 border-t border-white/15">
            <div className="font-mono text-[14px] uppercase tracking-wider text-gray-200">TPC</div>
            <div className="text-[17px] text-white font-semibold mt-0.5 leading-snug">{SUPPRESSED.goal}</div>
        </div>
    </div>
);

const MapPanel = () => (
    <div className={`${CARD} px-4 py-3 flex-1 min-h-0 flex flex-col`} style={CARD_BG}>
        <div className="font-mono text-[14px] uppercase tracking-wider text-gray-100">Onde cada classe age</div>
        <div className="mt-3 flex flex-col gap-2.5 flex-1 justify-center">
            {MAP_ROWS.map((r, i) => (
                <motion.div key={r.tag} className="rounded-xl border px-3 py-2.5" style={{ borderColor: `${r.color}88`, background: `${r.color}14` }}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.2, duration: 0.35 }}>
                    <div className="font-display text-[20px] font-bold" style={{ color: r.color }}>{r.tag}</div>
                    <div className="text-[16.5px] text-gray-100 leading-snug">{r.site}</div>
                </motion.div>
            ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[15px] text-gray-100 leading-snug">
            <div><span className="font-mono text-white text-[16px]">{NUMBERS.sermDose}</span><br />SERM, {NUMBERS.sermWhen}</div>
            <div><span className="font-mono text-white text-[16px]">{NUMBERS.hcgDose}</span><br />hCG, {NUMBERS.hcgWhen}</div>
        </div>
    </div>
);

export const SidePanel = ({ step }: { step: number }) => (
    <AnimatePresence mode="wait">
        <motion.div key={step} className="flex flex-col gap-3 h-full min-h-0"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
            {step === 0 && <Suppressed />}
            {step === 1 && (
                <>
                    <ClassText card={SERM} size={17} />
                    <Chip icon={<Pill size={26} />} color={SERM.color} big={NUMBERS.sermDose} small={NUMBERS.sermWhen} />
                </>
            )}
            {step === 2 && (
                <>
                    <ClassText card={IA} />
                    <E2Gauge />
                </>
            )}
            {step === 3 && (
                <>
                    <ClassText card={HCG} size={17} />
                    <Chip icon={<Syringe size={26} />} color={HCG.color} big={NUMBERS.hcgDose} small={NUMBERS.hcgWhen} />
                </>
            )}
            {step === 4 && <MapPanel />}
        </motion.div>
    </AnimatePresence>
);
