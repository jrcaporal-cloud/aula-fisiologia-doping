import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type SteroidData = {
    id: string;
    name: string;
    family: string;
    anabolic: number; // reference Test = 100
    androgenic: number; // reference Test = 100
    halfLifeLabel: string;
    halfLifeScore: number; // 0 to 100 for visual scale (100 = longest, e.g., Deca)
    color: string;
    description: string;
    clinicalUse: string;
    colaterais: string;
};

const STEROIDS: SteroidData[] = [
    {
        id: 'test',
        name: 'Testosterona (Base)',
        family: 'Molde Humano',
        anabolic: 100,
        androgenic: 100,
        halfLifeLabel: '~1 - 8 dias (P/E/C)',
        halfLifeScore: 30,
        color: '#3b82f6', // blue
        description: 'O hormônio endógeno padrão pelo qual todos os outros são medidos (Razão 1:1).',
        clinicalUse: 'TRT universal e base obrigatória de quase todo ciclo para manter função fisiológica.',
        colaterais: 'Aromatiza (Ginecomastia, retenção hídrica) e converte em DHT (Queda de cabelo, próstata).'
    },
    {
        id: 'dianabol',
        name: 'Dianabol (Metandrostenolona)',
        family: 'Derivado 17α-Test',
        anabolic: 210,
        androgenic: 60,
        halfLifeLabel: '3 a 5 horas',
        halfLifeScore: 5,
        color: '#ef4444', // red
        description: 'Primeiro EAA criado especificamente para performance atlética (EUA, anos 50).',
        clinicalUse: 'Usado historicamente como "pontapé inicial" de ganho de volume bruto e força agressiva.',
        colaterais: 'Altamente hepatotóxico. Conversão para metilestradiol (extremamente potente = ginecomastia súbita).'
    },
    {
        id: 'nandrolona',
        name: 'Deca-Durabolin (Nandrolona)',
        family: 'Derivado 19-Nor',
        anabolic: 125,
        androgenic: 37,
        halfLifeLabel: '~15 dias',
        halfLifeScore: 95,
        color: '#10b981', // green
        description: 'Alta afinidade anabólica com baixa conversão androgênica intrínseca. Muito comum clinicamente.',
        clinicalUse: 'Tratamento de osteoporose crônica e ganho de massa magra gradual em caquexia.',
        colaterais: 'Atividade progestínica severa. Supressão implacável do eixo HPG e "Deca Dick" (disfunção erétil).'
    },
    {
        id: 'trembolona',
        name: 'Trembolona',
        family: 'Derivado 19-Nor',
        anabolic: 500,
        androgenic: 500,
        halfLifeLabel: '2 a 3 dias',
        halfLifeScore: 20,
        color: '#f59e0b', // amber
        description: 'O rei dos anabolizantes. Afinidade pelo Receptor Androgênico 3x mais forte que a Testosterona.',
        clinicalUse: 'Uso EXCLUSIVO veterinário (Criação bovina para engorda rápida pré-abate). Nunca aprovado para humanos.',
        colaterais: 'Toxicidade neurológica severa. Insônia crônica, suores noturnos agressivos e estresse cardiovascular massivo.'
    },
    {
        id: 'winstrol',
        name: 'Winstrol (Estanozolol)',
        family: 'Derivado DHT',
        anabolic: 320,
        androgenic: 30,
        halfLifeLabel: '9 a 24 horas',
        halfLifeScore: 10,
        color: '#8b5cf6', // purple
        description: 'Não aromatiza. Famoso no escândalo de Ben Johnson (1988).',
        clinicalUse: 'Droga clássica de "corte" para visual hiperseco e ganho de força explosiva na pista.',
        colaterais: 'Deleta as articulações (ressecamento sinovial) e devasta o perfil lipídico (queda brutal de HDL).'
    },
    {
        id: 'oxandrolona',
        name: 'Oxandrolona',
        family: 'Derivado DHT',
        anabolic: 322,
        androgenic: 24,
        halfLifeLabel: '9 a 10 horas',
        halfLifeScore: 12,
        color: '#ec4899', // pink
        description: 'Criada para mulheres e crianças com déficits de crescimento. Extremamente suave.',
        clinicalUse: 'Tratamento de queimaduras severas, osteoporose e ganho de força com mínimo impacto virilizante.',
        colaterais: 'Toxicidade hepática branda a moderada (17α-alquilado). Inibe o eixo HPG, mas com menor brutalidade que outras drogas orais.'
    },
    {
        id: 'primobolan',
        name: 'Primobolan (Metenolona)',
        family: 'Derivado DHT',
        anabolic: 88,
        androgenic: 44,
        halfLifeLabel: '~10,5 dias (Enantato)',
        halfLifeScore: 70,
        color: '#06b6d4', // cyan
        description: 'Considerado um dos esteroides mais seguros e limpos já produzidos, lendário na era de Arnold.',
        clinicalUse: 'Prevenção de catabolismo em dietas severas. Não aromatiza e tem supressão endógena mais branda.',
        colaterais: 'Alopecia (queda de cabelo) para indivíduos predispostos, por ser derivado do DHT direto.'
    },
    {
        id: 'hemogenin',
        name: 'Hemogenin (Oximetolona)',
        family: 'Derivado DHT',
        anabolic: 320,
        androgenic: 45,
        halfLifeLabel: '8 a 9 horas',
        halfLifeScore: 10,
        color: '#e11d48', // rose
        description: 'O EAA oral mais brutal para ganho de peso rápido, retenção e força bruta.',
        clinicalUse: 'Tratamento de anemias severas (estimula massivamente a eritropoiese, glóbulos vermelhos).',
        colaterais: 'Hepatotoxicidade altíssima. Retenção hídrica extrema (famoso "face de lua cheia") e picos perigosos de pressão arterial.'
    }
];

// Helper to animate numbers dynamically
const AnimatedNumber = ({ value, color }: { value: number; color: string }) => {
    return (
        <motion.span
            className="text-xl font-mono font-bold"
            animate={{ color }}
            transition={{ duration: 0.5 }}
        >
            <motion.span>{value}</motion.span>
        </motion.span>
    );
};

export const SteroidProfileVisualizer = () => {
    const [activeId, setActiveId] = useState<string>(STEROIDS[0].id);

    const activeSteroid = STEROIDS.find(s => s.id === activeId) || STEROIDS[0];

    // Reference max values for scaling the bars
    const MAX_POWER = 500;

    return (
        <div className="w-full h-full flex flex-col gap-6 font-body pointer-events-auto mt-2">

            {/* Nav Tabs */}
            <div className="flex flex-wrap gap-2 justify-center mb-2">
                {STEROIDS.map((steroid) => {
                    const isActive = steroid.id === activeId;
                    return (
                        <button
                            key={steroid.id}
                            onClick={() => setActiveId(steroid.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 border backdrop-blur-sm cursor-pointer ${isActive
                                ? 'text-white shadow-lg'
                                : 'text-gray-400 border-white/5 bg-white/5 hover:bg-white/10 hover:text-gray-200'
                                }`}
                            style={isActive ? {
                                background: `linear-gradient(135deg, ${steroid.color}44, rgba(0,0,0,0.8))`,
                                borderColor: `${steroid.color}88`,
                                boxShadow: `0 4px 20px -5px ${steroid.color}55`
                            } : {}}
                        >
                            {steroid.name.split(' (')[0]}
                        </button>
                    );
                })}
            </div>

            {/* Dashboard Display - Stays mounted to allow smooth transitions inside */}
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto rounded-2xl border border-white/10 p-8 shadow-2xl relative overflow-hidden"
                style={{ background: 'rgba(5, 10, 20, 0.65)', backdropFilter: 'blur(20px)' }}
            >
                {/* Background Glow */}
                <motion.div
                    className="absolute -top-32 -left-32 w-64 h-64 rounded-full opacity-20 blur-[80px] pointer-events-none"
                    animate={{ background: activeSteroid.color }}
                    transition={{ duration: 1 }}
                />

                {/* Left Column: Data & Info */}
                <div className="flex flex-col gap-6 relative z-10 min-h-[300px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-6 h-full"
                        >
                            <div>
                                <span className="text-xs font-mono tracking-widest uppercase mb-1 block" style={{ color: activeSteroid.color }}>
                                    {activeSteroid.family}
                                </span>
                                <h3 className="text-3xl font-display font-bold text-white mb-2 leading-tight">
                                    {activeSteroid.name}
                                </h3>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {activeSteroid.description}
                                </p>
                            </div>

                            <div className="space-y-4">
                                {/* Clinical Use */}
                                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">
                                        <span className="text-base">⚕️</span> Perfil de Uso
                                    </h4>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {activeSteroid.clinicalUse}
                                    </p>
                                </div>

                                {/* Side Effects */}
                                <div className="bg-red-900/10 border border-red-500/20 rounded-xl p-4">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                                        <span className="text-base">⚠️</span> Assinatura Tóxica
                                    </h4>
                                    <p className="text-sm text-gray-300 leading-relaxed">
                                        {activeSteroid.colaterais}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Right Column: Dynamic Bars (Stays mounted, values simply animate) */}
                <div className="flex flex-col justify-center gap-8 relative z-10 py-4">

                    {/* Anabolic Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">💪</span>
                                <span className="text-sm font-bold text-gray-200">Potência Anabólica</span>
                            </div>
                            <AnimatedNumber value={activeSteroid.anabolic} color={activeSteroid.color} />
                        </div>
                        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-white/5 relative">
                            {/* Base Test Mark */}
                            <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-white/30 z-20" title="Base Testosterona (100)" />

                            <motion.div
                                className="h-full rounded-full relative z-10 origin-left"
                                animate={{
                                    width: `${Math.min((activeSteroid.anabolic / MAX_POWER) * 100, 100)}%`,
                                    backgroundColor: activeSteroid.color
                                }}
                                transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase font-mono">
                            <span>0</span>
                            <span>Ref: Test (100)</span>
                            <span>500+</span>
                        </div>
                    </div>

                    {/* Androgenic Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🦁</span>
                                <span className="text-sm font-bold text-gray-200">Potência Androgênica</span>
                            </div>
                            <AnimatedNumber value={activeSteroid.androgenic} color={activeSteroid.color} />
                        </div>
                        <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden border border-white/5 relative">
                            {/* Base Test Mark */}
                            <div className="absolute top-0 bottom-0 left-[20%] w-[1px] bg-white/30 z-20" />

                            <motion.div
                                className="h-full rounded-full relative z-10 origin-left"
                                animate={{
                                    width: `${Math.min((activeSteroid.androgenic / MAX_POWER) * 100, 100)}%`,
                                    backgroundColor: '#94a3b8'
                                }}
                                transition={{ duration: 0.6, type: "spring", bounce: 0.2, delay: 0.05 }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-500 uppercase font-mono">
                            <span>0</span>
                            <span>Virilização</span>
                            <span>500+</span>
                        </div>
                    </div>

                    {/* Half-Life Time indicator */}
                    <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">⏱️</span>
                            <span className="text-sm font-bold text-gray-200">Duração / Meia-vida</span>
                        </div>

                        <div className="relative h-12 w-full flex items-center bg-gray-800/50 rounded-xl border border-white/5 p-4">
                            <div className="absolute left-0 w-full h-[2px] bg-gray-700 mx-4 px-8 z-0" />

                            <motion.div
                                className="absolute h-8 w-32 rounded-lg flex items-center justify-center z-10 font-mono text-xs font-bold text-white shadow-lg border"
                                animate={{
                                    left: `calc(${activeSteroid.halfLifeScore}% - ${activeSteroid.halfLifeScore > 50 ? '128px' : '0px'})`,
                                    backgroundColor: activeSteroid.color,
                                    borderColor: 'rgba(255,255,255,0.2)'
                                }}
                                transition={{ duration: 0.8, type: "spring", bounce: 0.15 }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={activeId}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                    >
                                        {activeSteroid.halfLifeLabel}
                                    </motion.span>
                                </AnimatePresence>
                            </motion.div>

                            {/* Markers */}
                            <div className="w-full flex justify-between absolute px-4 z-0 text-[10px] text-gray-500 top-1.5 opacity-50">
                                <span>Horas</span>
                                <span>Dias</span>
                                <span>Semanas</span>
                            </div>
                        </div>
                    </div>

                </div>
            </motion.div>

        </div>
    );
};

