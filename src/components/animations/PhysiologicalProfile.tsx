import { motion } from 'framer-motion';

export const PhysiologicalProfile = () => {

    const items = [
        {
            title: "Base Transcricional Sintética",
            desc: "Combinações de derivados 17α-alquilados e compostos esterificados de Testosterona, criando farmacocinéticas exclusivas.",
            icon: "🧬",
            color: "border-blue-500/30",
            bg: "bg-blue-900/10"
        },
        {
            title: "Razão Anabólica/Androgênica",
            desc: "A química é manipulada para hipertrofia sem virilização excessiva. Ex: a Trembolona tem afinidade ao AR 3x mais violenta que a testosterona base.",
            icon: "🔬",
            color: "border-purple-500/30",
            bg: "bg-purple-900/10"
        },
        {
            title: "Remodelagem dos Satélites",
            desc: "Gera hipertrofia dose-dependente sustentada primariamente pelo acréscimo massivo e persistente de núcleos mionucleares na fibra muscular [Bhasin et al].",
            icon: "💪",
            color: "border-emerald-500/30",
            bg: "bg-emerald-900/10"
        },
        {
            title: "Colaterais Biológicos Críticos",
            desc: "Supressão irreversível do eixo HPG por down-regulation sistêmico de Leydig. Consequências estruturais: colapso do perfil lipídico (HDL) e hipertrofia ventricular concêntrica letal.",
            icon: "⚠️",
            color: "border-brand-red/30",
            bg: "bg-brand-red/10"
        }
    ];

    return (
        <div className="w-full mt-8 font-body">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.15 }}
                        className={`flex gap-4 p-5 rounded-2xl border ${item.color} ${item.bg} backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 flex-col sm:flex-row items-start sm:items-center`}
                    >
                        <div className="text-4xl bg-black/40 p-3 rounded-xl border border-white/5 shrink-0">
                            {item.icon}
                        </div>
                        <div>
                            <h4 className="text-white font-display font-semibold text-lg mb-1">{item.title}</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
