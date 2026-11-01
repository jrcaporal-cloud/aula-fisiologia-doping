import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ComparisonTable = () => {
    const [openRow, setOpenRow] = useState<number | null>(null);

    const toggleRow = (index: number) => {
        setOpenRow(openRow === index ? null : index);
    };

    const data = [
        {
            name: "EAA (Testo)", action: "Receptor Androgênico", effect: "Massa/Força", magnitude: "+10-20% força", hidden: "Não*", color: "text-brand-red", bgColor: "bg-brand-red/10", border: "border-brand-red",
            detail: "<b>Oculto/Colaterais:</b> Supressão do Eixo HPG obrigatória, hipertrofia ventricular esquerda (cardiopatia) irreversível, e dislipidemia severa (redução drástica do HDL bom). O exame antidoping tradicional utiliza a relação T/E para flagrar o composto exógeno."
        },
        {
            name: "rhEPO", action: "Via JAK/STAT", effect: "Eritrócitos / VO₂máx", magnitude: "+3-7% VO₂máx", hidden: "Não", color: "text-brand-red", bgColor: "bg-brand-red/10", border: "border-brand-red",
            detail: "<b>Oculto/Colaterais:</b> Aumenta massivamente o hematócrito (volume de glóbulos vermelhos). Risco letal de hiperviscosidade sanguínea (sangue de lodo), predispondo a tromboses e paradas cardíacas noturnas. Foi o pesadelo do ciclismo nos anos 90."
        },
        {
            name: "GH / IGF-1", action: "Via mTOR", effect: "Massa / Lipólise", magnitude: "Sinergia Alta", hidden: "Quase", color: "text-emerald-500", bgColor: "bg-emerald-500/10", border: "border-emerald-500",
            detail: "<b>Oculto/Colaterais:</b> Potencia a síntese colagênica e óssea, reduzindo a gordura corporal. Uso abusivo gera 'Palumboísmo' (crescimento das vísceras/alargamento de extremidades) e resistência insulínica maciça. É dificílimo flagrar o GH recombinante por sua meia-vida em plasma de meros ~20 minutos."
        },
        {
            name: "Insulina", action: "Receptor IR", effect: "Anabolismo Máximo", magnitude: "+5-8kg (Stack)", hidden: "Sim", color: "text-emerald-500", bgColor: "bg-emerald-500/10", border: "border-emerald-500", bold: true,
            detail: "<b>Oculto/Colaterais:</b> O hormônio mais mortífero do esporte. Como é um peptídeo natural sem limite superior definido pela WADA, é clinicamente impossível punir um atleta por 'uso de Insulina'. Um erro na dosagem causa coma hipoglicêmico cerebral letal."
        },
        {
            name: "Transfusão Auto.", action: "Expansão Direta", effect: "VO₂máx / Endurance", magnitude: "+3-5% VO₂máx", hidden: "Sim", color: "text-emerald-500", bgColor: "bg-emerald-500/10", border: "border-emerald-500", bold: true,
            detail: "<b>Oculto/Colaterais:</b> O próprio sangue reinfundido. O Calcanhar de Aquiles do Passaporte Biológico. O atleta retira sua bolsa de sangue num dia 'alto' em montanha, guarda e a devolve ao corpo um dia antes da prova de endurance. Pode causar sobrecarga de ferro ou choque hemolítico por erro de armazenagem."
        },
        {
            name: "SARMs", action: "AR (Seletivo)", effect: "Massa", magnitude: "Moderada", hidden: "Não", color: "text-brand-red", bgColor: "bg-brand-red/10", border: "border-brand-red",
            detail: "<b>Oculto/Colaterais:</b> Prometem ação anabólica limpa bloqueada na próstata (Ostarina, RAD-140), mas a realidade empírica demonstra lesão biliar/hepática profunda (DILI) e supressão severa do eixo testicular, sem oferecer as janelas monstruosas de hipertrofia dos EAAs. Cai muito em doping cruzado na suplementação."
        }
    ];

    return (
        <div className="w-full overflow-x-auto pb-4 mt-8">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="border-b-2 border-white/20 text-gray-400 font-display">
                        <th className="p-4 font-semibold text-lg">Fármaco</th>
                        <th className="p-4 font-semibold text-lg">Via de Ação</th>
                        <th className="p-4 font-semibold text-lg">Efeito Principal</th>
                        <th className="p-4 font-semibold text-lg">Magnitude</th>
                        <th className="p-4 font-semibold text-lg">Indetectável?</th>
                    </tr>
                </thead>
                <tbody className="text-gray-200">
                    {data.map((row, idx) => {
                        const isOpen = openRow === idx;
                        return (
                            <React.Fragment key={idx}>
                                <tr
                                    className={`group cursor-pointer transition-colors duration-300 border-b border-white/5 hover:bg-white/5 ${isOpen ? 'bg-white/5' : ''}`}
                                    onClick={() => toggleRow(idx)}
                                >
                                    <td className="p-4 font-medium flex items-center gap-3">
                                        <motion.div
                                            animate={{ rotate: isOpen ? 90 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className={`text-sm ${row.color}`}
                                        >
                                            ▶
                                        </motion.div>
                                        {row.name}
                                    </td>
                                    <td className="p-4 text-gray-400">{row.action}</td>
                                    <td className="p-4 text-gray-300">{row.effect}</td>
                                    <td className="p-4 text-gray-400">{row.magnitude}</td>
                                    <td className={`p-4 ${row.color} ${row.bold ? 'font-bold' : ''}`}>
                                        {row.hidden}
                                    </td>
                                </tr>
                                <AnimatePresence>
                                    {isOpen && (
                                        <tr>
                                            <td colSpan={5} className="p-0 border-0">
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div
                                                        className={`m-4 p-5 rounded-lg border-l-4 ${row.border} bg-black/40 backdrop-blur shadow-inner text-sm leading-relaxed`}
                                                        dangerouslySetInnerHTML={{ __html: row.detail.replace(/Oculto\/Colaterais:/, `<span class="${row.color} font-bold mr-1">Oculto/Colaterais:</span>`) }}
                                                    />
                                                </motion.div>
                                            </td>
                                        </tr>
                                    )}
                                </AnimatePresence>
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
            <p className="text-sm mt-4 text-brand-red">* Exceto em casos de deleção do gene UGT2B17.</p>
        </div>
    );
};
