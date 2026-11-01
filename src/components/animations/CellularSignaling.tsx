import { motion } from 'framer-motion';
import { Activity, Dna, Zap, Target, ShieldAlert } from 'lucide-react';
import { useSlideSteps } from '../../store/useSlideSteps';

/** Passador: 0 = as duas vias; 1 = foco na genômica; 2 = foco na não genômica. */
const focusStyle = (focused: boolean, anyFocus: boolean) => ({
    opacity: !anyFocus || focused ? 1 : 0.28,
    scale: anyFocus && focused ? 1.02 : 1,
    filter: !anyFocus || focused ? 'saturate(1)' : 'saturate(0.3)',
});

export const CellularSignaling = () => {
    const { step } = useSlideSteps(3);
    const anyFocus = step > 0;
    return (
        <div className="w-full mt-4 font-body">
            <div className="grid grid-cols-2 gap-8">
                {/* Genômica */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }} animate={{ x: 0, ...focusStyle(step === 1, anyFocus) }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative bg-slate-900/60 border border-blue-500/20 rounded-2xl p-6 shadow-[0_10px_30px_rgba(59,130,246,0.1)] overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Dna size={80} className="text-blue-400" />
                    </div>
                    <h3 className="font-display text-2xl text-blue-400 font-bold mb-2 flex items-center gap-3">
                        <span className="p-2 bg-blue-500/20 rounded-lg"><Dna size={24} /></span>
                        Via Genômica <span className="text-sm font-normal text-blue-300 ml-2">(Lenta)</span>
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 border-b border-white/5 pb-4">
                        Ação celular profunda focada na <strong>modificação da arquitetura celular</strong> em horas a dias.
                    </p>

                    <div className="space-y-4">
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-xs text-blue-300">1</div>
                                <div className="w-[1px] h-full bg-blue-500/20 my-1"></div>
                            </div>
                            <div className="pb-4">
                                <h4 className="text-white text-sm font-semibold">Infiltração e Ligação</h4>
                                <p className="text-gray-400 text-xs mt-1">EAA atravessa a bicamada lipídica. Dissocia chaperonas (HSP90/70) do Receptor Androgênico (AR) no citosol.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-xs text-blue-300">2</div>
                                <div className="w-[1px] h-full bg-blue-500/20 my-1"></div>
                            </div>
                            <div className="pb-4">
                                <h4 className="text-white text-sm font-semibold">Translocação e ARE</h4>
                                <p className="text-gray-400 text-xs mt-1">O dímero entra no núcleo via transporte ativo e liga-se aos <em>Elementos de Resposta Androgênica</em> no DNA.</p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-xs text-blue-300">3</div>
                            </div>
                            <div>
                                <h4 className="text-white text-sm font-semibold">Resultado Estrutural</h4>
                                <p className="text-gray-400 text-xs mt-1">Transcrição de mRNA que codifica proteínas contráteis (Actina, Miosina) com resultados em <strong className="text-blue-300">24-72 horas</strong>.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Não-Genômica */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }} animate={{ x: 0, ...focusStyle(step === 2, anyFocus) }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="relative bg-rose-950/20 border border-brand-red/30 rounded-2xl p-6 shadow-[0_10px_30px_rgba(225,29,72,0.1)] overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={80} className="text-brand-red" />
                    </div>
                    <h3 className="font-display text-2xl text-brand-red font-bold mb-2 flex items-center gap-3">
                        <span className="p-2 bg-brand-red/20 rounded-lg"><Zap size={24} /></span>
                        Via Não Genômica <span className="text-sm font-normal text-rose-300 ml-2">(Rápida)</span>
                    </h3>
                    <p className="text-gray-400 text-sm mb-6 border-b border-white/5 pb-4">
                        Ação metabólica de choque no <strong>citoplasma e membranas</strong> em segundos a horas.
                    </p>

                    <div className="grid grid-cols-1 gap-3">
                        <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex items-start gap-3">
                            <Target className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-white text-sm font-semibold">Ativação de Membrana</h4>
                                <p className="text-gray-400 text-xs mt-1">Interação direta livre de nucleoide com receptores acoplados à proteína G (GPCRs) engatilhando cascatas MAPK e PI3K/Akt.</p>
                            </div>
                        </div>
                        <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-white text-sm font-semibold">Bloqueio Anticatabólico</h4>
                                <p className="text-gray-400 text-xs mt-1">Inibição imediata de Glucocorticoides: bloqueio competitivo aos sítios dos receptores de cortisol.</p>
                            </div>
                        </div>
                        <div className="bg-black/40 border border-white/5 p-3 rounded-lg flex items-start gap-3">
                            <Activity className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-white text-sm font-semibold">Choque Reticular & SNC</h4>
                                <p className="text-gray-400 text-xs mt-1">Aumento dramático de íons de cálcio intracelular (força em <b>minutos</b>) e facilitação neuromotora da acetilcolina.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
