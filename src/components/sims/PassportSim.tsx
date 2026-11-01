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

/** Quantas coletas aparecem em cada passo. */
const STEP_TARGETS = [2, 6, 8, 9] as const;
const ARRIVAL_MS = 600;
const FIRST_ARRIVAL_MS = 350;

const PassportSim = () => {
    const { step, setStep } = useSlideSteps(STEPS.length);
    const [protocolId, setProtocolId] = useState<ProtocolId>('transfusao');
    const [shown, setShown] = useState(0);
    const [hovered, setHovered] = useState<number | null>(null);

    const protocol = PROTOCOLS.find(p => p.id === protocolId) ?? PROTOCOLS[2];
    const target = STEP_TARGETS[step];
    const visible = Math.min(shown, target);

    // As coletas chegam uma a uma até o alvo do passo atual.
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
    const focus = hovered !== null && hovered < visible ? hovered : visible - 1;

    const play = () => { setShown(0); setStep(STEPS.length - 1); };
    const reset = () => { setShown(0); setStep(0); };
    const choose = (id: ProtocolId) => { setProtocolId(id); setShown(s => Math.min(s, MANIP_START)); };

    return (
        <div className="w-full font-body text-white pointer-events-auto select-none" style={{ minHeight: 500 }}>
            {/* Controles */}
            <div className="flex items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-1 rounded-2xl border border-white/10 p-1" style={{ background: 'rgba(8,8,18,0.72)' }} role="radiogroup" aria-label="Protocolo do atleta">
                    <span className="px-2.5 text-[12px] font-mono uppercase tracking-widest text-gray-300">Atleta</span>
                    {PROTOCOLS.map(p => {
                        const active = p.id === protocolId;
                        return (
                            <button key={p.id} type="button" role="radio" aria-checked={active} onClick={() => choose(p.id)}
                                className="relative px-3.5 py-1.5 rounded-xl text-[14px] font-semibold cursor-pointer transition-colors"
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
                    <button type="button" onClick={play}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-semibold cursor-pointer border transition-colors hover:brightness-125"
                        style={{ background: 'rgba(225,29,72,0.18)', borderColor: 'rgba(225,29,72,0.6)', color: '#FFE4E6' }}>
                        <Play size={15} fill="currentColor" /> Reproduzir
                    </button>
                    <button type="button" onClick={reset}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[14px] font-semibold cursor-pointer border border-white/15 text-gray-200 hover:bg-white/5 transition-colors"
                        style={{ background: 'rgba(8,8,18,0.72)' }}>
                        <RotateCcw size={15} /> Reiniciar
                    </button>
                </div>
            </div>

            <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0,1fr) 300px' }}>
                {/* Gráfico */}
                <div className="rounded-2xl border border-white/10 px-4 pt-3 pb-2" style={{ background: 'rgba(8,8,18,0.72)' }}>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="shrink-0 font-mono text-[12px] tracking-widest uppercase px-2 py-1 rounded-md border border-white/15 text-gray-200">
                                Passo {step + 1}/{STEPS.length}
                            </span>
                            <motion.div key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="min-w-0">
                                    <span className="font-display text-[15px] font-semibold" style={{ color: step === 3 ? '#FDA4AF' : '#fff' }}>{STEPS[step].title}</span>
                                    <span className="text-[14px] text-gray-200"> · {STEPS[step].caption}</span>
                            </motion.div>
                        </div>
                        <span className="shrink-0 text-[12px] font-mono uppercase tracking-wider px-2 py-1 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                            modelo ilustrativo
                        </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2 mb-1 text-[13px] text-gray-200">
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
