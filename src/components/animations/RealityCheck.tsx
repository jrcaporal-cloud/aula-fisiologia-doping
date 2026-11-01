import { motion, AnimatePresence, animate, useMotionValue, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { useSlideSteps } from '../../store/useSlideSteps';

/** Palpite da turma fica guardado durante a aula: o slide 26 retoma o mesmo número. */
const useClassGuess = create<{
    guess: number | null;
    /** A revelação completa já aconteceu (slide 2): a reaparição no slide 26 vira recapitulação. */
    revealedOnce: boolean;
    setGuess: (g: number) => void;
    markRevealed: () => void;
}>(set => ({
    guess: null,
    revealedOnce: false,
    setGuess: guess => set({ guess }),
    markRevealed: () => set({ revealedOnce: true }),
}));

const RING_SIZE = 132;
const RING_STROKE = 12;

/** Anel que enche junto com o número contando — dispara quando `shown` vira true. */
const RevealRing = ({ pct, color, shown }: { pct: number; color: string; shown: boolean }) => {
    const progress = useMotionValue(0);
    const label = useTransform(progress, v => `${Math.round(v)}%`);
    const r = (RING_SIZE - RING_STROKE) / 2;
    const circumference = 2 * Math.PI * r;
    const dash = useTransform(progress, v => `${(v / 100) * circumference} ${circumference}`);
    const ringOpacity = useTransform(progress, v => (v > 0.3 ? 1 : 0));

    useEffect(() => {
        const controls = animate(progress, shown ? pct : 0, { duration: shown ? 1.6 : 0.3, ease: [0.16, 1, 0.3, 1] });
        return () => controls.stop();
    }, [shown, pct, progress]);

    return (
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
            <svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90">
                <circle cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={RING_STROKE} />
                <motion.circle
                    cx={RING_SIZE / 2} cy={RING_SIZE / 2} r={r} fill="none"
                    stroke={color} strokeWidth={RING_STROKE} strokeLinecap="round"
                    style={{ strokeDasharray: dash, opacity: ringOpacity, filter: `drop-shadow(0 0 10px ${color})` }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {shown
                    ? <motion.span className="font-black font-display text-[2.6rem] tabular-nums" style={{ color }}>{label}</motion.span>
                    : <span className="font-display text-5xl font-bold text-white/25">?</span>}
            </div>
        </div>
    );
};

const DATA = [
    {
        id: 'wada',
        pct: 2,
        title: 'Detectado pela WADA',
        subtitle: '📊 Dados Oficiais Abertos',
        color: '#3b82f6',
        bg: 'rgba(30,58,138,0.2)',
        border: 'rgba(59,130,246,0.3)',
        glow: 'rgba(59,130,246,0.15)',
        question: 'Como funcionam os testes oficiais?',
        bullets: [
            'Dos ~300.000 testes/ano realizados pela WADA, apenas 1-2% resultam em AAF (Achados Analíticos Adversos).',
            'Isso equivale a cerca de 4.000 atletas pegos por ano em todo o mundo esportivo.',
            'Muitos destes casos positivos são de substâncias sociais/recreativas, não ergogênicas (doping intencional de performance).',
            'O teste é altamente específico (poucos falsos positivos), mas possui baixa sensibilidade real nas janelas off-season.'
        ]
    },
    {
        id: 'real',
        pct: 43,
        title: 'Prevalência Real',
        subtitle: '🔬 Metodologia Científica Anônima',
        color: '#e11d48',
        bg: 'rgba(127,29,29,0.2)',
        border: 'rgba(225,29,72,0.35)',
        glow: 'rgba(225,29,72,0.15)',
        question: 'Qual é a verdadeira extensão?',
        bullets: [
            'Pesquisa anônima de Ulrich et al. (2018) em eventos da IAAF usando a técnica do "Randomized Response Model".',
            '43,6% dos atletas de elite admitiram anonimamente uso de substâncias proibidas nos últimos 12 meses.',
            'Em Jogos Pan-Árabes e Pan-Americanos o número variou de 30% a 57% dependendo da modalidade avaliada.',
            'Isso indica que o sistema antidoping atual captura apenas uma fração mínima (aprox. 1 em cada 20) dos usuários crônicos.'
        ]
    }
];

const STEP_LABELS = ['Palpite da turma', 'O que o antidoping detecta', 'O que os atletas admitem'];

export const RealityCheck = () => {
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    // Decidido na montagem: se já houve revelação, este slide é recapitulação (sem passos).
    const [isRecap] = useState(() => useClassGuess.getState().revealedOnce);
    const { step: rawStep } = useSlideSteps(isRecap ? 1 : 3);
    const step = isRecap ? 2 : rawStep;
    const guess = useClassGuess(s => s.guess);
    const setGuess = useClassGuess(s => s.setGuess);
    const markRevealed = useClassGuess(s => s.markRevealed);
    const [draft, setDraft] = useState(guess ?? 10);
    const revealed = (id: string) => (id === 'wada' ? step >= 1 : step >= 2);

    useEffect(() => {
        if (step >= 2) markRevealed();
    }, [step, markRevealed]);
    const shownGuess = guess ?? draft;

    return (
        <div className="w-full max-w-4xl mx-auto mt-2 font-body">

            {/* Palpite da turma: o professor registra o chute (mãos levantadas) antes da revelação. */}
            <div className="mb-6 rounded-2xl border border-amber-400/25 bg-amber-400/[0.05] px-6 py-4 flex items-center gap-6">
                <div className="flex-shrink-0">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-amber-300/90 font-semibold">Palpite da turma</p>
                    <p className="text-sm text-gray-300 mt-1">Quantos % dos atletas de elite usam doping?</p>
                </div>
                <input
                    type="range" min={0} max={100} step={1}
                    value={shownGuess}
                    aria-label="Palpite da turma em porcentagem"
                    onChange={e => { const v = Number(e.target.value); setDraft(v); setGuess(v); }}
                    className="flex-1 accent-amber-400 h-2 cursor-pointer"
                />
                <span className="w-24 text-right font-display text-4xl font-bold text-amber-300 tabular-nums">{shownGuess}%</span>
            </div>

            <div className="flex flex-row gap-6">
                {DATA.map((col) => {
                    const isAct = expandedRow === col.id;
                    const shown = revealed(col.id);
                    return (
                        <motion.div
                            key={col.id}
                            layout
                            className="relative rounded-2xl border p-6 flex flex-col transition-colors cursor-pointer"
                            style={{
                                background: shown ? col.bg : 'rgba(255,255,255,0.02)',
                                borderColor: isAct ? col.color : shown ? col.border : 'rgba(255,255,255,0.08)',
                                boxShadow: isAct ? `0 0 30px ${col.glow}` : 'none',
                                flex: isAct ? '5 0 0' : '4 0 0'
                            }}
                            transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                            onClick={() => shown && setExpandedRow(isAct ? null : col.id)}
                            whileHover={{ y: isAct || !shown ? 0 : -4 }}
                        >
                            <motion.div className="absolute inset-0 pointer-events-none rounded-2xl"
                                animate={{ opacity: shown ? 1 : 0 }}
                                style={{ background: `radial-gradient(ellipse at top, ${col.glow} 0%, transparent 60%)` }} />

                            <div className="flex justify-center mb-5">
                                <RevealRing pct={col.pct} color={col.color} shown={shown} />
                            </div>

                            <motion.h3 layout className="text-center font-display text-xl font-bold text-white mb-2">{col.title}</motion.h3>
                            <motion.p layout className="text-center text-xs font-semibold uppercase tracking-wide opacity-80 mb-4" style={{ color: col.color }}>{col.subtitle}</motion.p>

                            {/* Comparação com o palpite, quando o número real aparece */}
                            <AnimatePresence>
                                {shown && col.id === 'real' && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        transition={{ delay: 1.2 }}
                                        className="text-center text-sm text-amber-200 mb-4"
                                    >
                                        A turma chutou <strong className="text-amber-300">{shownGuess}%</strong>
                                    </motion.p>
                                )}
                            </AnimatePresence>

                            <div className={`mt-auto pt-4 border-t border-white/10 transition-opacity duration-500 ${shown ? 'opacity-100' : 'opacity-30'}`}>
                                <div className="flex items-center justify-between group">
                                    <span className="text-sm font-semibold flex items-center gap-2" style={{ color: isAct ? 'white' : '#fbbf24' }}>
                                        <motion.span animate={{ rotate: isAct ? 90 : 0 }} className="text-xs">▶</motion.span>
                                        {col.question}
                                    </span>
                                </div>

                                <AnimatePresence mode="wait">
                                    {isAct && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pt-4 pb-2">
                                                <ul className="space-y-3">
                                                    {col.bullets.map((b, i) => (
                                                        <motion.li
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.1 + (i * 0.05) }}
                                                            className="flex items-start gap-2 text-sm text-gray-300"
                                                        >
                                                            <span className="text-xs mt-1" style={{ color: col.color }}>●</span>
                                                            <span className="leading-relaxed">{b}</span>
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <p className="text-center text-[11px] text-gray-400 mt-6 tracking-widest uppercase">
                {STEP_LABELS[step]} · {step < 2 ? 'avance para revelar' : 'clique nos painéis para expandir os dados'}
            </p>
        </div>
    );
};
