import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

const NODES = [
    {
        step: 1,
        icon: '🧠',
        title: 'Hipotálamo',
        subtitle: 'Peptídeos Secretagogos (GHRP)',
        summary: 'Estimulam a liberação pulsátil de GH da hipófise, simulando o sinal natural do organismo.',
        color: '#60a5fa',
        border: 'rgba(96,165,250,0.35)',
        bg: 'rgba(30,58,138,0.3)',
        glow: 'rgba(96,165,250,0.2)',
        sections: [
            {
                label: '💊 Mecanismo',
                content: 'GHRP-2, GHRP-6 e Ipamorelina são peptídeos sintéticos que agonizam o receptor de Grelina (GHS-R1a) no hipotálamo e hipófise. Induzem pico de GH em 15–30 min. Janela de ação: ~60–90 min. Costumam ser combinados com GHRH (CJC-1295) para sinergismo de 4–10× no pico de GH.',
            },
            {
                label: '🔬 Detecção',
                content: 'GHRP são indetectáveis pelos testes padrão de GH (isoeletrofocalização). A janela urinária é de 4–8h. O Passaporte Biológico pode sinalizar pelo pico de IGF-1 persistentemente elevado, mas a evidência é indireta.',
            },
            {
                label: '⚠️ Colaterais',
                content: 'Retenção hídrica, aumento do apetite (efeito grelina), elevação de prolactina e cortisol. Com uso crônico: acromegalia subclínica (mãos, pés, mandíbula). Resistência insulínica progressiva.',
            },
        ],
    },
    {
        step: 2,
        icon: '⚗️',
        title: 'Hipófise',
        subtitle: 'GH Recombinante (somatropina)',
        summary: 'Substitui ou supre o pulso endógeno de GH com molécula de 191 aminoácidos idêntica à humana.',
        color: '#34d399',
        border: 'rgba(52,211,153,0.35)',
        bg: 'rgba(6,78,59,0.3)',
        glow: 'rgba(52,211,153,0.2)',
        sections: [
            {
                label: '💊 Farmacocinética',
                content: 'Meia-vida plasmática IV: ~15–20 min. SC: ~3–4h. Injeção às 23h → eliminado antes do controle matinal às 6h. O hGH endógeno e exógeno são molecularmente idênticos — o teste diferencial compara isoformas 20kDa vs 22kDa, detectável em janela <12h após uso.',
            },
            {
                label: '📈 Efeitos Anabólicos',
                content: 'Estimula IGF-1 hepático → ativa PI3K/Akt/mTOR → síntese proteica. Promove lipólise (mobilização de ácidos graxos livres). Mantém nitrogênio muscular positivo. Aumenta densidade mineral óssea e espessura dos tendões.',
            },
            {
                label: '⚠️ Risco: Acromegalia',
                content: 'Uso crônico em doses suprafisiológicas → hipertrofia progressiva de tecidos: mandíbula, arcadas supraorbitais, mãos, pés — Palumboísmo. Órgãos internos (coração, fígado, intestino) também hipertrofiam. Cardiomegalia documentada como causa de morte prematura em fisiculturistas.',
            },
        ],
    },
    {
        step: 3,
        icon: '🔴',
        title: 'Fígado',
        subtitle: 'IGF-1 Exógeno (Mecasermina)',
        summary: 'Bypass completo do eixo GH. Ativa diretamente receptores IGF-1R sem passar pela hipófise.',
        color: '#f87171',
        border: 'rgba(248,113,113,0.35)',
        bg: 'rgba(127,29,29,0.3)',
        glow: 'rgba(248,113,113,0.2)',
        sections: [
            {
                label: '💊 Mecanismo Direto',
                content: 'IGF-1 liga-se ao IGF-1R → autofosforilação → IRS-1 → PI3K/Akt/mTOR e RAS/MAPK. Resultado: síntese proteica máxima + inibição de apoptose celular. Meia-vida livre: ~10 min. Ligado a IGFBP-3: ~15 horas — biologicamente ativo por horas após injeção.',
            },
            {
                label: '⚡ Combinação com Insulina',
                content: 'IGF-1 + Insulina = stack hipoglicêmico extremo. Ambos reduzem glicemia: IGF-1 via IGF-1R (similar à insulina), Insulina via GLUT4. A supressão combinada da glicose pode causar hipoglicemia fatal. Atletas monitoram glicemia capilar e mantêm dextrose disponível.',
            },
            {
                label: '⚠️ Colaterais Críticos',
                content: 'Hipoglicemia severa (principal causa de morte). Hipertrofia de órgãos internos. Possível proliferação de células pré-malignas (IGF-1 é mitogênico — estudos associam uso elevado a câncer de próstata e cólon). Edema e síndrome do túnel do carpo.',
            },
        ],
    },
];

export const HPGAxis = () => {
    const [activeNode, setActiveNode] = useState<number | null>(null);
    const [activeSection, setActiveSection] = useState<number>(0);

    return (
        <div className="w-full font-body mt-4">
            {/* Cards row */}
            <div className="flex flex-col md:flex-row gap-4">
                {NODES.map((node, i) => {
                    const isAct = activeNode === i;
                    return (
                        <motion.div
                            key={node.step}
                            layout
                            className="rounded-2xl border overflow-hidden cursor-pointer"
                            style={{
                                borderColor: isAct ? node.border : 'rgba(255,255,255,0.08)',
                                background: isAct ? node.bg : 'rgba(8,8,18,0.6)',
                                flex: isAct ? '2 0 0' : '1 0 0',
                                boxShadow: isAct ? `0 0 32px ${node.glow}` : 'none',
                            }}
                            transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
                            onClick={() => setActiveNode(isAct ? null : i)}
                            whileHover={{ y: isAct ? 0 : -3 }}
                        >
                            {/* Header */}
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border"
                                            style={{ borderColor: node.border, color: node.color, background: `${node.glow}` }}
                                        >
                                            {node.step}
                                        </div>
                                        <span className="text-xl">{node.icon}</span>
                                    </div>
                                    <motion.div
                                        animate={{ rotate: isAct ? 45 : 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-gray-500 text-lg font-light"
                                    >+</motion.div>
                                </div>

                                <h3 className="font-display font-bold text-xl mb-1 leading-tight" style={{ color: node.color }}>
                                    {node.title}
                                </h3>
                                <p className="text-xs font-semibold text-white/70 mb-2">{node.subtitle}</p>
                                <p className="text-xs text-gray-400 leading-relaxed">{node.summary}</p>
                            </div>

                            {/* Expanded content */}
                            <AnimatePresence>
                                {isAct && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div className="px-5 pb-5 border-t border-white/6 pt-4 space-y-3">
                                            {/* Section tabs */}
                                            <div className="flex gap-2 flex-wrap">
                                                {node.sections.map((sec, si) => (
                                                    <button
                                                        key={si}
                                                        onClick={e => { e.stopPropagation(); setActiveSection(si); }}
                                                        className="text-[10px] px-2.5 py-1 rounded-full border cursor-pointer transition-all"
                                                        style={activeSection === si
                                                            ? { borderColor: node.border, color: node.color, background: `${node.glow}` }
                                                            : { borderColor: 'rgba(255,255,255,0.1)', color: '#6b7280' }
                                                        }
                                                    >
                                                        {sec.label}
                                                    </button>
                                                ))}
                                            </div>
                                            <AnimatePresence mode="wait">
                                                <motion.p
                                                    key={activeSection}
                                                    initial={{ opacity: 0, y: 6 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -6 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="text-xs text-gray-300 leading-relaxed"
                                                >
                                                    {node.sections[activeSection].content}
                                                </motion.p>
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Bottom accent line */}
                            <motion.div
                                className="h-[2px] w-full"
                                style={{ background: `linear-gradient(90deg, transparent, ${node.color}, transparent)` }}
                                animate={{ opacity: isAct ? 1 : 0.2 }}
                            />
                        </motion.div>
                    );
                })}
            </div>

            {/* Connecting signal line */}
            <div className="relative h-1 my-1 hidden md:block">
                <div className="absolute inset-y-0 left-[12%] right-[12%] bg-white/5 rounded-full" />
                <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-red-500 to-red-500 rounded-full"
                    animate={{ left: ['12%', '88%', '12%'], width: ['0%', '20%', '0%'], opacity: [0, 1, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ width: '0%' }}
                />
            </div>

            <p className="text-center text-[10px] text-gray-600 mt-1">Clique em cada nó para expandir os detalhes moleculares</p>
        </div>
    );
};
