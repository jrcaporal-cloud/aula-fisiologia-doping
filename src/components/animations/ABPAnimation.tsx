import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Simulated longitudinal biomarker data for one athlete
// Over 24 months of measurements
const generateData = (seed: number, mean: number, std: number, doped?: { start: number; boost: number }) => {
    const rng = (i: number) => {
        const x = Math.sin(seed * 100 + i * 37.3) * 10000;
        return x - Math.floor(x);
    };
    return Array.from({ length: 24 }, (_, i) => {
        const noise = (rng(i) - 0.5) * std * 2;
        const base = mean + noise;
        if (doped && i >= doped.start && i < doped.start + 3) {
            return Math.round((base + doped.boost) * 10) / 10;
        }
        return Math.round(base * 10) / 10;
    });
};

const HB_NORMAL_MEAN = 14.8;
const HB_NORMAL_STD = 0.6;
const HB_LOWER = HB_NORMAL_MEAN - 2 * HB_NORMAL_STD;
const HB_UPPER = HB_NORMAL_MEAN + 2 * HB_NORMAL_STD;

const hbData = generateData(42, HB_NORMAL_MEAN, HB_NORMAL_STD, { start: 12, boost: 2.4 });
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const CHART_W = 580;
const CHART_H = 160;
const PAD_L = 38;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 28;
const DATA_W = CHART_W - PAD_L - PAD_R;
const DATA_H = CHART_H - PAD_T - PAD_B;

const MIN_VAL = 12.5;
const MAX_VAL = 18.5;

const toX = (i: number) => PAD_L + (i / (hbData.length - 1)) * DATA_W;
const toY = (v: number) => PAD_T + DATA_H - ((v - MIN_VAL) / (MAX_VAL - MIN_VAL)) * DATA_H;

const HOW_WORKS = [
    { icon: '📊', title: 'Linha de Base Individual', desc: 'A WADA coleta amostras ao longo de meses para estabelecer valores de referência únicos para CADA atleta — não comparações com médias populacionais.' },
    { icon: '📐', title: 'Modelo Bayesiano', desc: 'O algoritmo ABPS calcula a probabilidade de que cada nova medição pertença à distribuição histórica do atleta. Valor > 99,9% de improbabilidade = alerta.' },
    { icon: '🩸', title: 'Marcadores Monitorados', desc: 'Hemoglobina (Hb), Hematócrito (Hct), reticulócitos (%ret), OFF-Score (Hb − 60·√%ret), ABPS Score. Manipulação de um marcador distorce o padrão geral.' },
    { icon: '⏱️', title: 'Janela de Detecção Ampliada', desc: 'O ABP detecta o efeito, não a substância. EPO e transfusões deixam assinatura no sangue por semanas após clearance do composto. Isso burla a "janela de detecção" química.' },
];

export const ABPAnimation = () => {
    const [activePoint, setActivePoint] = useState<number | null>(null);
    const [revealed, setRevealed] = useState(false);

    const linePath = hbData.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');

    const bandTopY = toY(HB_UPPER);
    const bandBotY = toY(HB_LOWER);

    return (
        <div className="w-full space-y-5 font-body pointer-events-auto">

            {/* Header explanation */}
            <div className="text-xs uppercase tracking-widest text-gray-500 flex items-center justify-between">
                <span>Passaporte Biológico — simulação de rastreio longitudinal de Hb (g/dL)</span>
                <button
                    onClick={() => setRevealed(r => !r)}
                    className="text-[10px] px-3 py-1 rounded-full border cursor-pointer transition-all"
                    style={revealed
                        ? { borderColor: '#e11d48', color: '#e11d48', background: 'rgba(225,29,72,0.1)' }
                        : { borderColor: 'rgba(255,255,255,0.15)', color: '#9ca3af', background: 'transparent' }
                    }
                >
                    {revealed ? '🚨 Ocultar doping' : '👁 Revelar doping'}
                </button>
            </div>

            {/* SVG Chart */}
            <div
                className="w-full rounded-2xl border border-white/8 p-4 overflow-hidden"
                style={{ background: 'rgba(5,5,18,0.85)' }}
            >
                <svg
                    viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                    className="w-full"
                    style={{ overflow: 'visible' }}
                >
                    {/* Normal band */}
                    <rect
                        x={PAD_L} y={bandTopY}
                        width={DATA_W} height={bandBotY - bandTopY}
                        fill="rgba(96,165,250,0.08)"
                        rx={3}
                    />
                    <line x1={PAD_L} y1={bandTopY} x2={PAD_L + DATA_W} y2={bandTopY}
                        stroke="rgba(96,165,250,0.25)" strokeWidth={1} strokeDasharray="4 3" />
                    <line x1={PAD_L} y1={bandBotY} x2={PAD_L + DATA_W} y2={bandBotY}
                        stroke="rgba(96,165,250,0.25)" strokeWidth={1} strokeDasharray="4 3" />
                    <text x={PAD_L + 4} y={bandTopY - 4} fill="rgba(96,165,250,0.75)" fontSize="9.5">Limite superior (IC 95%)</text>
                    <text x={PAD_L + 4} y={bandBotY + 9} fill="rgba(96,165,250,0.75)" fontSize="9.5">Limite inferior</text>

                    {/* EPO period highlight */}
                    {revealed && (
                        <rect
                            x={toX(12)} y={PAD_T}
                            width={toX(14) - toX(12)} height={DATA_H}
                            fill="rgba(225,29,72,0.08)"
                            rx={4}
                        />
                    )}
                    {revealed && (
                        <text x={(toX(12) + toX(14)) / 2} y={PAD_T + 10} textAnchor="middle" fill="#e11d48" fontSize="9.5" fontWeight="bold">USO rhEPO</text>
                    )}

                    {/* Y axis labels */}
                    {[13, 14, 15, 16, 17, 18].map(v => (
                        <g key={v}>
                            <text x={PAD_L - 4} y={toY(v) + 3} fill="rgba(255,255,255,0.55)" fontSize="9.5" textAnchor="end">{v}</text>
                            <line x1={PAD_L} y1={toY(v)} x2={PAD_L + DATA_W} y2={toY(v)} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
                        </g>
                    ))}

                    {/* X axis month labels (every 3 months) */}
                    {MONTHS.map((m, i) => i % 3 === 0 && (
                        <text key={i} x={toX(i)} y={CHART_H - 4} fill="rgba(255,255,255,0.5)" fontSize="9.5" textAnchor="middle">{m} {i < 12 ? "'23" : "'24"}</text>
                    ))}

                    {/* Line */}
                    <path d={linePath} fill="none" stroke="#60a5fa" strokeWidth={2} strokeLinejoin="round" />

                    {/* Anomaly points */}
                    {hbData.map((v, i) => {
                        const isAnomaly = v > HB_UPPER || v < HB_LOWER;
                        const isHov = activePoint === i;
                        return (
                            <g key={i}>
                                <circle
                                    cx={toX(i)} cy={toY(v)} r={isHov ? 7 : isAnomaly ? 5 : 3.5}
                                    fill={isAnomaly && revealed ? '#e11d48' : isHov ? '#ffffff' : '#60a5fa'}
                                    stroke={isAnomaly && revealed ? 'rgba(225,29,72,0.4)' : 'rgba(96,165,250,0.3)'}
                                    strokeWidth={isAnomaly ? 2 : 1}
                                    style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                                    onMouseEnter={() => setActivePoint(i)}
                                    onMouseLeave={() => setActivePoint(null)}
                                />
                                {isAnomaly && revealed && (
                                    <text x={toX(i)} y={toY(v) - 9} textAnchor="middle" fill="#e11d48" fontSize="10" fontWeight="bold">⚠</text>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Tooltip */}
                <div className="h-5 flex items-center justify-center mt-1">
                    <AnimatePresence mode="wait">
                        {activePoint !== null && (
                            <motion.div
                                key={activePoint}
                                initial={{ opacity: 0, y: 4 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -4 }}
                                transition={{ duration: 0.12 }}
                                className="text-[10px] px-3 py-1 rounded-full border"
                                style={{
                                    borderColor: (hbData[activePoint] > HB_UPPER && revealed) ? '#e11d4888' : 'rgba(255,255,255,0.1)',
                                    color: (hbData[activePoint] > HB_UPPER && revealed) ? '#e11d48' : '#9ca3af',
                                    background: 'rgba(5,5,18,0.9)',
                                }}
                            >
                                {MONTHS[activePoint]} — Hb: <strong>{hbData[activePoint].toLocaleString('pt-BR')} g/dL</strong>
                                {(hbData[activePoint] > HB_UPPER && revealed) && ' — 🚨 FORA DA ZONA NORMAL'}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* How it works grid */}
            <div className="grid grid-cols-2 gap-3">
                {HOW_WORKS.map((item, i) => (
                    <motion.div
                        key={i}
                        className="rounded-xl border border-white/7 p-4 hover:border-purple-500/30 hover:bg-purple-900/5 transition-colors cursor-default"
                        style={{ background: 'rgba(8,8,18,0.6)' }}
                        whileHover={{ y: -2 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                        <div className="text-xl mb-2">{item.icon}</div>
                        <div className="text-xs font-semibold text-white mb-1">{item.title}</div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{item.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
