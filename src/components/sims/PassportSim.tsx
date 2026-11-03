import { motion } from 'framer-motion';
import { Play, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { MANIP_START, PROTOCOLS, analyze, type ProtocolId } from './passport/model';
import { PassportChart } from './passport/PassportChart';
import { SidePanel } from './passport/SidePanel';

const STEPS = [
    { title: 'Priori populacional', caption: 'Sem histórico, o corredor do atleta é o próprio limite populacional.' },
    { title: 'Atualização bayesiana', caption: 'Cada exame recalibra o centro do atleta; após 3 exames, nasce o túnel individual.' },
    { title: 'Começa a manipulação', caption: 'O valor sobe, mas continua dentro do limite populacional fixo.' },
    { title: 'Achado Atípico', caption: 'Fora do túnel individual → ATF. O limite fixo não detecta; o túnel detecta.' },
] as const;

/** Quantas coletas aparecem em cada passo (passo 1 = sem histórico: só o limite populacional). */
const STEP_TARGETS = [0, 6, 8, 9] as const;
const ARRIVAL_MS = 220;
const FIRST_ARRIVAL_MS = 120;
const CARD_BG = { background: 'rgba(8,8,18,0.72)' };

const PassportSim = () => {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const [protocolId, setProtocolId] = useState<ProtocolId>('transfusao');
    const [shown, setShown] = useState(0);
    const [hovered, setHovered] = useState<number | null>(null);

    const protocol = PROTOCOLS.find(p => p.id === protocolId) ?? PROTOCOLS[2];
    const target = STEP_TARGETS[step];
    const visible = Math.min(shown, target);

    // As coletas chegam uma a uma (rápido) até o alvo do passo atual.
    useEffect(() => {
        if (shown === target) return;
        const delay = shown > target ? 0 : shown === 0 ? FIRST_ARRIVAL_MS : ARRIVAL_MS;
        const id = window.setTimeout(() => setShown(s => (s > target ? target : s + 1)), delay);
        return () => window.clearTimeout(id);
    }, [shown, target]);

    const analysis = useMemo(() => analyze(protocol.samples, visible), [protocol, visible]);

    const verdictOn = step >= 3;
    const dimTunnel = step === 2;
    const showPhases = step >= 2 && visible > MANIP_START;
    // No último passo o cartão descreve a 1ª coleta com ATF — a mesma do painel de achado.
    const defaultFocus = verdictOn && analysis.firstFlag !== null ? analysis.firstFlag : visible - 1;
    const focus = hovered !== null && hovered < visible ? hovered : defaultFocus;

    const play = () => { setShown(0); setStep(STEPS.length - 1); };
    const reset = () => { setShown(0); setStep(0); };
    const choose = (id: ProtocolId) => { setProtocolId(id); setShown(s => Math.min(s, MANIP_START)); };

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none">
            {/* Controles */}
            <div className="flex items-center justify-between gap-4 mb-2.5">
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 p-1" style={CARD_BG} role="radiogroup" aria-label="Protocolo do atleta">
                    <span className="px-2.5 text-[14px] font-mono uppercase tracking-widest text-gray-300">Atleta</span>
                    {PROTOCOLS.map(p => {
                        const active = p.id === protocolId;
                        return (
                            <button key={p.id} type="button" role="radio" aria-checked={active} onClick={() => choose(p.id)}
                                className="relative px-3.5 py-1.5 rounded-xl text-[15px] font-semibold cursor-pointer transition-colors"
                                style={{ color: active ? '#fff' : '#D1D5DB' }}>
                                {active && (
                                    <motion.span layoutId="pp-proto" className="absolute inset-0 rounded-xl"
                                        style={{ background: `${p.color}26`, border: `1px solid ${p.color}99`, boxShadow: `0 0 18px ${p.color}33` }}
                                        transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                                )}
                                <span className="relative flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                                    {p.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[14px] font-mono uppercase tracking-wider px-2.5 py-1.5 rounded-lg text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                        modelo ilustrativo
                    </span>
                    <button type="button" onClick={play} aria-label="Reproduzir"
                        className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-[14px] font-semibold cursor-pointer border transition-colors hover:brightness-125"
                        style={{ background: 'rgba(225,29,72,0.18)', borderColor: 'rgba(225,29,72,0.6)', color: '#FFE4E6' }}>
                        <Play size={14} fill="currentColor" /> Reproduzir
                    </button>
                    <button type="button" onClick={reset} aria-label="Reiniciar"
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[14px] font-semibold cursor-pointer border border-white/15 text-gray-200 hover:bg-white/5 transition-colors"
                        style={CARD_BG}>
                        <RotateCcw size={14} /> Reiniciar
                    </button>
                </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 296px' }}>
                {/* Gráfico */}
                <div className="rounded-2xl border border-white/10 px-4 pt-2.5 pb-2" style={CARD_BG}>
                    <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
                        className="min-h-[26px] leading-snug">
                        <span className="font-display text-[17px] font-semibold" style={{ color: step === 3 ? '#FDA4AF' : '#fff' }}>{STEPS[step].title}</span>
                        <span className="text-[15px] text-gray-200"> · {STEPS[step].caption}</span>
                    </motion.div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-1 mb-1 text-[14px] text-gray-200">
                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> coleta</span>
                        <span className="flex items-center gap-2"><span className="w-6 h-3 rounded-sm border border-blue-400/80" style={{ background: 'rgba(96,165,250,0.25)' }} /> corredor individual (99,9%)</span>
                        <span className="flex items-center gap-2"><span className="w-6 border-t-2 border-dashed border-white/70" /> limite populacional fixo</span>
                        <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#E11D48', boxShadow: '0 0 8px #E11D48' }} /> ATF</span>
                    </div>
                    <PassportChart protocol={protocol} analysis={analysis} visibleCount={visible} verdictOn={verdictOn}
                        dimTunnel={dimTunnel} showPhases={showPhases} hovered={hovered} onHover={setHovered} />
                </div>

                <SidePanel protocol={protocol} analysis={analysis} visibleCount={visible} focus={focus} step={step} verdictOn={verdictOn} />
            </div>
        </div>
    );
};

export default PassportSim;
