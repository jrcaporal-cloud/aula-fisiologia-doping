import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { ACCENT, type Family } from './content';
import type { ColumnMode } from './layout';
import { CompactMolecule, FullScene } from './Scenes';

const EASE = [0.22, 1, 0.36, 1] as const;
/** Átomos das miniaturas (unidades do desenho; escala real ≈ 0,44 no recolhido, 0,57 na comparação → ≥ 14 px). */
const COLLAPSED_ATOM_FONT = 36;
const COMPARE_ATOM_FONT = 30;

interface FamilyColumnProps {
    readonly family: Family;
    readonly mode: ColumnMode;
    readonly width: number;
    readonly focused: boolean;
    readonly still: boolean;
    readonly onSelect: () => void;
}

const Header = ({ family, size = 'lg' }: { family: Family; size?: 'lg' | 'md' | 'sm' }) => (
    <div className={size === 'sm' ? 'flex flex-col items-start gap-1.5' : 'flex items-start gap-2.5'}>
        <span
            className="shrink-0 grid place-items-center rounded-full font-mono font-bold text-[15px] w-6 h-6 mt-0.5"
            style={{ background: `${family.color}26`, color: family.color, border: `1px solid ${family.color}99` }}
        >
            {family.n}
        </span>
        <span
            className={`font-display font-semibold leading-tight ${size === 'lg' ? 'text-[19px]' : size === 'md' ? 'text-[17px]' : 'text-[17px] break-words'}`}
            style={{ color: family.color }}
        >
            {family.title}
        </span>
    </div>
);

/** Parágrafo literal com o trecho que o cartão original destacava em negrito. */
const Lead = ({ family }: { family: Family }) => {
    const { lead, leadStrong } = family;
    const at = leadStrong ? lead.indexOf(leadStrong) : -1;
    const body: ReactNode = at < 0 || !leadStrong ? lead : (
        <>
            {lead.slice(0, at)}
            <strong className="text-white font-bold">{leadStrong}</strong>
            {lead.slice(at + leadStrong.length)}
        </>
    );
    return <p className="text-[17px] leading-snug text-gray-100">{body}</p>;
};

const Chips = ({ family, note = false }: { family: Family; note?: boolean }) => (
    <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[15px] font-mono uppercase tracking-wider text-gray-200 mr-1">Principais</span>
        {family.principais.map(p => (
            <span key={p} className="rounded-full px-2.5 py-px text-[15px] font-semibold text-white"
                style={{ background: `${family.color}1F`, border: `1px solid ${family.color}66` }}>
                {p}
            </span>
        ))}
        {note && family.principaisNota && <span className="text-[15px] text-gray-200 italic">({family.principaisNota})</span>}
    </div>
);

const Focus = ({ text }: { text: string }) => (
    <p className="text-[17px] leading-snug text-gray-100">
        <span className="font-mono text-[15px] uppercase tracking-wider text-gray-200 mr-1.5">Foco Clínico</span>
        {text}
    </p>
);

const Tag = ({ text }: { text: string }) => (
    <div className="flex items-start gap-2 text-[16px] font-semibold leading-snug" style={{ color: '#FDE68A' }}>
        <span className="w-2 h-2 rounded-full shrink-0 mt-[8px]" style={{ background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        {text}
    </div>
);

const Body = ({ family, mode, still }: { family: Family; mode: ColumnMode; still: boolean }) => {
    if (mode === 'bud') {
        return (
            <div className="h-full flex flex-col justify-center gap-2">
                <Header family={family} size="md" />
            </div>
        );
    }
    if (mode === 'collapsed') {
        return (
            <div className="h-full flex flex-col justify-center gap-3">
                <Header family={family} size="sm" />
                <div className="h-[96px] shrink-0"><CompactMolecule id={family.id} still={still} font={COLLAPSED_ATOM_FONT} /></div>
                <Tag text={family.tag} />
            </div>
        );
    }
    if (mode === 'compare') {
        return (
            <div className="h-full flex flex-col gap-2.5">
                <Header family={family} />
                <div className="h-[118px] shrink-0 px-6 py-1"><CompactMolecule id={family.id} still={still} font={COMPARE_ATOM_FONT} /></div>
                <Tag text={family.tag} />
                <Chips family={family} />
                <div className="mt-auto"><Focus text={family.focoCurto} /></div>
            </div>
        );
    }
    return (
        <div className="h-full grid gap-x-4 gap-y-2" style={{ gridTemplateColumns: '310px minmax(0,1fr)', gridTemplateRows: 'minmax(0,1fr) auto' }}>
            <div className="flex flex-col gap-2 min-h-0">
                <Header family={family} />
                <Lead family={family} />
                <div className="mt-auto"><Focus text={family.foco} /></div>
            </div>
            <div className="min-h-0 min-w-0"><FullScene id={family.id} still={still} /></div>
            <div className="col-span-2"><Chips family={family} note /></div>
        </div>
    );
};

export const FamilyColumn = ({ family, mode, width, focused, still, onSelect }: FamilyColumnProps) => {
    const dim = mode === 'collapsed' || mode === 'bud';
    return (
        <motion.div
            role="button" tabIndex={0} onClick={onSelect}
            onKeyDown={e => { if (e.key === 'Enter') onSelect(); }}
            aria-label={`Abrir família ${family.n}: ${family.title}`}
            className="relative h-full shrink-0 rounded-2xl border cursor-pointer overflow-hidden px-4 py-3.5"
            initial={false}
            animate={{
                width,
                opacity: dim ? 0.8 : 1,
                borderColor: focused ? `${family.color}AA` : 'rgba(255,255,255,0.10)',
                boxShadow: focused ? `0 0 32px ${family.color}2E` : '0 0 0 rgba(0,0,0,0)',
            }}
                        transition={{ duration: still ? 0 : 0.6, ease: EASE }}
            style={{ background: 'rgba(8,8,18,0.72)' }}
        >
            <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: family.color, opacity: focused ? 1 : 0.5 }} />
            <motion.div
                key={mode} className="h-full"
                initial={still ? false : { opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.22, duration: 0.35 }}
            >
                <Body family={family} mode={mode} still={still} />
            </motion.div>
        </motion.div>
    );
};
