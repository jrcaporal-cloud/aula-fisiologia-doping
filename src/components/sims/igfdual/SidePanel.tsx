import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import type { ReactNode } from 'react';
import { COLORS, STEPS, SYNERGY, TEXT, type SynergyId } from './content';

/** Painel lateral: o texto do cartão original de cada passo. */

const EASE = [0.16, 1, 0.3, 1] as const;

const P = ({ children, strong = false }: { children: ReactNode; strong?: boolean }) => (
    <p className={`text-[14px] leading-[1.5] ${strong ? 'text-white font-semibold' : 'text-gray-200'}`}>{children}</p>
);

const Chip = ({ text, color }: { text: string; color: string }) => (
    <span className="px-2 py-1 rounded-md font-mono text-[13px] font-semibold border whitespace-nowrap"
        style={{ color, borderColor: `${color}88`, background: `${color}1a` }}>{text}</span>
);

const Cascade = () => (
    <div className="flex items-center gap-1 flex-wrap">
        {['IGF-1R', 'PI3K', 'Akt', 'mTORC1'].map((t, i) => (
            <span key={t} className="flex items-center gap-1">
                {i > 0 && <ArrowRight size={14} className="text-gray-300" />}
                <Chip text={t} color={COLORS.igf} />
            </span>
        ))}
    </div>
);

const DualRow = ({ color, title, lines }: { color: string; title: string; lines: readonly string[] }) => (
    <div className="rounded-xl border px-3 py-2" style={{ borderColor: `${color}66`, background: `${color}12` }}>
        <div className="font-display text-[15.5px] font-semibold" style={{ color }}>{title}</div>
        <ul className="mt-1 space-y-0.5">
            {lines.map(l => <li key={l} className="text-[13.5px] text-gray-100 leading-snug">{l}</li>)}
        </ul>
    </div>
);

interface SidePanelProps {
    readonly step: number;
    readonly boost: boolean;
    readonly onBoost: () => void;
    readonly revealed: number;
    readonly focus: SynergyId | null;
    readonly onFocus: (id: SynergyId | null) => void;
}

const bodyFor = ({ step, boost, onBoost, revealed, focus, onFocus }: SidePanelProps): ReactNode => {
    switch (step) {
        case 0:
            return (
                <>
                    <P strong>{TEXT.liver}</P>
                    <Cascade />
                    <P>{TEXT.cascade}</P>
                    <P>{TEXT.systemicResult}</P>
                </>
            );
        case 1:
            return (
                <>
                    <P>{TEXT.mgf}</P>
                    <P strong>{TEXT.satellite}</P>
                    <button type="button" onClick={onBoost} aria-pressed={boost}
                        className="text-left rounded-xl border px-3 py-2 cursor-pointer transition-colors"
                        style={boost
                            ? { borderColor: 'rgba(245,158,11,0.8)', background: 'rgba(245,158,11,0.16)' }
                            : { borderColor: 'rgba(255,255,255,0.18)', background: 'rgba(255,255,255,0.03)' }}>
                        <div className="text-[13.5px] font-semibold" style={{ color: boost ? '#FDE68A' : '#E5E7EB' }}>
                            {boost ? 'Com GH exógeno (clique para tirar)' : '+ GH exógeno (clique)'}
                        </div>
                        <div className="text-[14px] text-gray-100 mt-0.5">{TEXT.ghBoost}</div>
                    </button>
                </>
            );
        case 2:
            return (
                <>
                    <DualRow color={COLORS.igf} title="Sistêmico · fígado" lines={['~70% do IGF-1 circulante', 'pelo sangue, em todas as células-alvo', 'IGF-1R → PI3K → Akt → mTORC1']} />
                    <DualRow color={COLORS.mgf} title="Local · MGF (IGF-1Ec)" lines={['produzido pelo músculo sob tensão', 'células satélite da fibra estimulada', 'novos mionúcleos onde houve dano']} />
                    <P>Os dois chegam à mesma fibra: é a vantagem dupla do eixo GH-IGF-1.</P>
                </>
            );
        case 3:
            return (
                <>
                    <div className="flex flex-col gap-2" onMouseLeave={() => onFocus(null)}>
                        {SYNERGY.map((s, i) => (
                            <motion.button key={s.id} type="button" onMouseEnter={() => onFocus(s.id)} onClick={() => onFocus(focus === s.id ? null : s.id)}
                                className="text-left rounded-xl border px-3 py-1.5 cursor-pointer"
                                animate={{ opacity: i < revealed ? 1 : 0.15 }} transition={{ duration: 0.35 }}
                                style={{ borderColor: focus === s.id ? s.color : `${s.color}55`, background: focus === s.id ? `${s.color}22` : `${s.color}0d` }}>
                                <span className="font-display text-[15px] font-semibold" style={{ color: s.color }}>{s.name}</span>
                                <span className="text-[13.5px] text-gray-100 leading-snug"> {s.role}</span>
                            </motion.button>
                        ))}
                    </div>
                    <div className="text-[13px] text-gray-300">EAA = Esteroides Androgênicos Anabolizantes (slide “A Base do Doping Moderno”).</div>
                </>
            );
        default:
            return (
                <>
                    <P>{TEXT.diabetogenic}</P>
                    <P strong>{TEXT.stackRisk}</P>
                    <div className="rounded-xl border border-rose-500/50 px-3 py-2 flex items-start gap-2.5" style={{ background: 'rgba(225,29,72,0.14)' }}>
                        <AlertTriangle size={18} className="text-rose-300 shrink-0 mt-0.5" />
                        <span className="text-[14px] text-rose-100 leading-snug">{TEXT.documented}</span>
                    </div>
                </>
            );
    }
};

export const SidePanel = (props: SidePanelProps) => {
    const info = STEPS[props.step];
    return (
        <div className="relative h-full rounded-2xl border overflow-hidden"
            style={{ borderColor: `${info.color}55`, background: `linear-gradient(165deg, ${info.color}1c, rgba(8,8,18,0.86) 55%)` }}>
            <AnimatePresence initial={false}>
                <motion.div key={props.step} className="absolute inset-0 p-4 flex flex-col gap-2.5"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.35, delay: 0.12, ease: EASE } }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}>
                    <span className="font-display text-[19px] font-semibold leading-tight" style={{ color: info.color }}>{info.title}</span>
                    {bodyFor(props)}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};
