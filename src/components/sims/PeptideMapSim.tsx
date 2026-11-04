import { AnimatePresence, motion } from 'framer-motion';
import { useSlideSteps } from '../../store/useSlideSteps';
import { ALREADY_SEEN, FAMILIES, TONE_STYLES, type PeptideFamily } from './peptide/map';
import { AxisDiagram } from './peptide/AxisDiagram';
import { HcgPearl } from './peptide/HcgPearl';
import { PANEL_BG } from './peptide/ui';

/**
 * Slide "O mapa dos peptídeos". Passo 0: onde cada família age no corpo. Depois, uma família por vez
 * (exemplos, como age, evidência, uso médico legítimo); logo após o eixo gonadal, a pérola clínica do hCG.
 */

const FIELDS: readonly { key: keyof Pick<PeptideFamily, 'examples' | 'action' | 'evidence' | 'medical'>; label: string }[] = [
    { key: 'examples', label: 'Quem são' },
    { key: 'action', label: 'Como age' },
    { key: 'evidence', label: 'O que a evidência mostra' },
    { key: 'medical', label: 'Uso médico legítimo' },
];

const FamilyTile = ({ family, active, dimmed, onClick }: { family: PeptideFamily; active: boolean; dimmed: boolean; onClick: () => void }) => {
    const tone = TONE_STYLES[family.tone];
    const Icon = family.icon;
    return (
        <button type="button" onClick={onClick} aria-pressed={active}
            className="text-left rounded-2xl border p-3.5 flex flex-col gap-1.5 cursor-pointer transition-all duration-300"
            style={{
                borderColor: active ? tone.border : 'rgba(255,255,255,0.12)',
                background: active ? tone.bg : 'rgba(8,8,18,0.72)',
                opacity: dimmed ? 0.62 : 1,
                boxShadow: active ? `0 0 0 1px ${tone.border}` : 'none',
            }}>
            <span className="flex items-center gap-2 font-display text-[1.12rem] font-semibold leading-tight" style={{ color: tone.text }}>
                <Icon size={19} aria-hidden /> {family.name}
            </span>
            <span className={`self-start mt-auto px-2 py-0.5 rounded-md border text-[14px] font-semibold ${tone.badge}`}>{family.tag}</span>
        </button>
    );
};

const Overview = () => (
    <div className="h-full flex flex-col gap-2">
        <p className="font-display text-[1.6rem] leading-tight text-white">
            A lista não pergunta se é peptídeo. Pergunta <span className="text-rose-300">o que ele faz</span> e <span className="text-rose-300">se foi aprovado</span>.
        </p>
        <div className="flex-1 min-h-0">
            <AxisDiagram />
        </div>
        <div className="flex items-center flex-wrap gap-3">
            <span className="text-[15px] uppercase tracking-wider text-gray-300">Já vistos na aula</span>
            {ALREADY_SEEN.map(p => (
                <span key={p.name} className="px-3 py-1 rounded-full border border-white/20 bg-white/[0.06] text-[15px] text-gray-100">
                    <strong className="text-white">{p.name}</strong> · {p.wada} · {p.where}
                </span>
            ))}
        </div>
    </div>
);

const FamilyDetail = ({ family }: { family: PeptideFamily }) => {
    const tone = TONE_STYLES[family.tone];
    return (
        <div className="h-full flex flex-col gap-3">
            <div className="flex items-baseline gap-3">
                <h3 className="font-display text-[1.6rem] font-semibold leading-tight" style={{ color: tone.text }}>{family.name}</h3>
                <motion.span className={`px-2.5 py-0.5 rounded-md border text-[15px] font-semibold ${tone.badge}`}
                    initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.15 }}>
                    {family.wada}
                </motion.span>
            </div>
            <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                {FIELDS.map((f, i) => (
                    <motion.div key={f.key} className="rounded-xl border bg-white/[0.04] p-4 flex flex-col gap-1.5"
                        style={{ borderColor: i === 2 ? tone.border : 'rgba(255,255,255,0.1)' }}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 + i * 0.12 }}>
                        <span className="text-[14px] font-semibold uppercase tracking-wider" style={{ color: tone.text }}>{f.label}</span>
                        <p className="text-[1.02rem] leading-snug text-gray-100">{family[f.key]}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

type View = { kind: 'overview' } | { kind: 'family'; family: PeptideFamily } | { kind: 'pearl'; family: PeptideFamily };

/** Ordem dos passos: abertura, as famílias e, logo depois do eixo gonadal, a pérola do hCG. */
const VIEWS: readonly View[] = [
    { kind: 'overview' },
    ...FAMILIES.flatMap((family): View[] => family.id === 'gonadal'
        ? [{ kind: 'family', family }, { kind: 'pearl', family }]
        : [{ kind: 'family', family }]),
];

const PeptideMapSim = () => {
    const { step, setStep } = useSlideSteps(VIEWS.length);
    const view = VIEWS[step];
    const focus = view.kind === 'overview' ? null : view.family;

    return (
        <div className="not-prose w-full font-body text-white select-none flex flex-col gap-2.5" style={{ height: 528 }}>
            <div className="grid grid-cols-5 gap-2.5" style={{ height: 104 }}>
                {FAMILIES.map(f => (
                    <FamilyTile key={f.id} family={f} active={focus?.id === f.id} dimmed={focus != null && focus.id !== f.id}
                        onClick={() => setStep(focus?.id === f.id ? 0 : VIEWS.findIndex(v => v.kind === 'family' && v.family.id === f.id))} />
                ))}
            </div>
            <div className="relative flex-1 min-h-0 rounded-2xl border border-white/10 p-5" style={PANEL_BG}>
                <AnimatePresence mode="wait">
                    <motion.div key={step} className="h-full"
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                        {view.kind === 'overview' && <Overview />}
                        {view.kind === 'family' && <FamilyDetail family={view.family} />}
                        {view.kind === 'pearl' && <HcgPearl />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PeptideMapSim;
