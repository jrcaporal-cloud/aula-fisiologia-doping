import { motion, useReducedMotion } from 'framer-motion';
import { C, FINDINGS, type Finding } from './content';
import { Echo } from './Echo';
import { slideRef } from './slideRefs';
import { SourceTag } from './SourceTag';

/** Passos 1–5: um achado por vez — o desenho-eco à esquerda e o texto da aula à direita. */

const CARD = 'relative rounded-2xl border border-white/10 overflow-hidden';
const EASE = [0.16, 1, 0.3, 1] as const;

interface FocusViewProps {
    readonly finding: Finding;
}

export const FocusView = ({ finding }: FocusViewProps) => {
    const reduce = useReducedMotion() ?? false;
    const main = slideRef(finding.sources[0]);
    return (
        <div className="grid h-full gap-3" style={{ gridTemplateColumns: '640px minmax(0,1fr)' }}>
            <motion.div
                className={`${CARD} flex flex-col px-4 pb-3 pt-3`} style={{ background: C.card }}
                initial={reduce ? false : { opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: EASE }}
            >
                <div className="flex items-center justify-between gap-3">
                    <span className="font-body text-[15px] font-semibold leading-tight text-gray-200">
                        Slide {main.number}{main.label ? ` · ${main.label}` : ''}
                    </span>
                    {finding.illustrative && (
                        <span className="shrink-0 rounded-md border border-white/20 px-2 py-0.5 font-mono text-[14px] text-gray-100">modelo ilustrativo</span>
                    )}
                </div>
                <div className="min-h-0 flex-1 px-1 pt-2">
                    <Echo id={finding.echo} compact={false} />
                </div>
            </motion.div>

            <motion.div
                className={`${CARD} flex flex-col px-6 py-5`}
                style={{ background: C.card, borderColor: `${finding.color}55` }}
                initial={reduce ? false : { opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
            >
                <div className="pointer-events-none absolute bottom-14 right-5 font-display text-[150px] font-bold leading-none" style={{ color: finding.color, opacity: 0.08 }}>
                    {finding.n}
                </div>
                <div className="font-mono text-[14px] font-semibold uppercase tracking-[0.14em]" style={{ color: finding.color }}>
                    Achado {finding.n} de {FINDINGS.length}
                </div>
                <h3 className="mt-2 font-display text-[36px] font-bold leading-[1.1] text-white">{finding.title}</h3>
                <motion.div className="mt-4 h-[3px] rounded-full" style={{ background: finding.color, originX: 0 }}
                    initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.35, ease: EASE }}
                    aria-hidden />
                <p className="mt-5 font-body text-[22px] leading-[1.5] text-gray-100">{finding.text}</p>
                <div className="mt-auto flex items-center gap-1.5 pt-4" aria-hidden>
                    {FINDINGS.map(f => (
                        <span key={f.n} className="h-[5px] flex-1 rounded-full"
                            style={{ background: f.n <= finding.n ? f.color : 'rgba(255,255,255,0.12)', opacity: f.n === finding.n ? 1 : 0.55 }} />
                    ))}
                </div>
                <div className="pt-3">
                    <SourceTag finding={finding} full />
                </div>
            </motion.div>
        </div>
    );
};
