import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { FlaskConical, Gavel, Microscope, Search, Sparkles, Atom } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AthletePhoto } from './AthletePhoto';
import type { DossierCase, SectionKey } from './cases';
import { SECTION_TABS, SECTION_TITLE, caseNo, type SectionTab } from './layout';

/** Ficha grande do caso selecionado: foto, substância, como foi pego e consequência. */

const EASE = [0.16, 1, 0.3, 1] as const;

const ICON: Record<SectionKey, LucideIcon> = {
    detection: Search,
    outcome: Gavel,
    pharmacology: FlaskConical,
    mechanism: Atom,
    trivia: Sparkles,
};

interface CaseFileProps {
    readonly item: DossierCase;
    readonly index: number;
    readonly total: number;
    readonly tab: SectionTab['key'];
    readonly onTab: (tab: SectionTab['key']) => void;
}

const Section = ({ k, text, color, wide }: { k: SectionKey; text: string; color: string; wide: boolean }) => {
    const Icon = ICON[k];
    return (
        <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 font-mono text-[15px] font-semibold uppercase tracking-[0.08em]" style={{ color }}>
                <Icon size={15} aria-hidden /> {SECTION_TITLE[k]}
            </div>
            <p className={`${wide ? 'text-[19px] leading-[1.55]' : 'text-[17px] leading-[1.4]'} text-gray-100`}>{text}</p>
        </div>
    );
};

export const CaseFile = ({ item, index, total, tab, onTab }: CaseFileProps) => {
    const reduce = useReducedMotion() ?? false;
    const c = item.substanceColor;
    return (
        <div className="grid h-full gap-3" style={{ gridTemplateColumns: '176px minmax(0,1fr)' }}>
            {/* foto, como um retrato preso à pasta */}
            <motion.div
                key={`photo-${item.id}`}
                className="relative overflow-hidden rounded-2xl border bg-black/40"
                style={{ borderColor: `${c}66` }}
                initial={reduce ? false : { opacity: 0, x: -28, rotate: -2.5 }} animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
            >
                <AthletePhoto src={item.image} name={item.name} className="absolute inset-0 h-full w-full" initialsSize={56} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(5,5,16,0) 45%, rgba(5,5,16,0.8) 75%, rgba(5,5,16,0.96) 100%)' }} />
                <div className="absolute left-3 top-3 rounded-md border px-2 py-0.5 font-mono text-[15px] font-bold tracking-[0.1em]"
                    style={{ borderColor: `${c}aa`, color: '#fff', background: 'rgba(5,5,16,0.78)' }}>
                    CASO {caseNo(index)}/{String(total).padStart(2, '0')}
                </div>
                <div className="absolute inset-x-3 bottom-3">
                    <div className="font-mono text-[15px] uppercase tracking-[0.1em] text-gray-200">{item.sport}</div>
                    <div className="font-display text-[24px] font-bold leading-none whitespace-nowrap" style={{ color: c }}>{item.year}</div>
                </div>
            </motion.div>

            {/* conteúdo da ficha */}
            <div className="relative flex min-w-0 flex-col overflow-hidden rounded-2xl border px-5 pb-2.5 pt-3"
                style={{ background: 'rgba(8,8,18,0.72)', borderColor: `${c}55` }}>
                <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: c }} aria-hidden />
                <motion.div key={`head-${item.id}`} className="flex min-w-0 items-center gap-3"
                    initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
                    <h3 className="shrink-0 font-display text-[28px] font-bold leading-tight text-white">{item.name}</h3>
                    <div className="inline-flex min-w-0 items-center gap-2 rounded-full border px-3 py-1 text-[15px] font-semibold"
                        style={{ color: c, borderColor: `${c}66`, background: `${c}14` }}>
                        <Microscope size={15} aria-hidden className="shrink-0" />
                        <span className="truncate">{item.substance}</span>
                    </div>
                </motion.div>

                <motion.p key={`lead-${item.id}`} className="mt-1 text-[17px] leading-[1.4] text-gray-200"
                    initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }}>
                    {item.headline}
                </motion.p>

                <div className="my-1 flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" aria-hidden />
                    <div className="flex shrink-0 items-center gap-1 rounded-xl border border-white/10 p-1" role="tablist" aria-label="Seções da ficha">
                        {SECTION_TABS.map(t => {
                            const on = t.key === tab;
                            return (
                                <button key={t.key} type="button" role="tab" aria-selected={on} onClick={() => onTab(t.key)}
                                    className="relative cursor-pointer rounded-lg px-2.5 py-0.5 text-[15px] font-semibold transition-colors"
                                    style={{ color: on ? '#fff' : '#D1D5DB' }}>
                                    {on && <motion.span layoutId="dossier-tab" className="absolute inset-0 rounded-lg"
                                        style={{ background: `${c}22`, border: `1px solid ${c}99` }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                                    <span className="relative">{t.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="relative min-h-0 flex-1">
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div key={`${item.id}-${tab}`}
                            className={tab === 'ficha' ? 'grid gap-5' : 'block'}
                            style={tab === 'ficha' ? { gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)' } : undefined}
                            initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.3, delay: 0.05 }}>
                            {tab === 'ficha' ? (
                                <>
                                    <Section k="detection" text={item.expandedContent.detection} color={c} wide={false} />
                                    <Section k="outcome" text={item.expandedContent.outcome} color={c} wide={false} />
                                </>
                            ) : (
                                <Section k={tab} text={item.expandedContent[tab]} color={c} wide />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
