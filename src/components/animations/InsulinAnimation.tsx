import { motion, useAnimation } from 'framer-motion';
import { useState, useEffect } from 'react';

export const InsulinAnimation = () => {
    const [isHovered, setIsHovered] = useState(false);
    const controls = useAnimation();

    useEffect(() => {
        if (isHovered) {
            controls.start("activated");
        } else {
            controls.start("idle");
        }
    }, [isHovered, controls]);

    return (
        <div className="w-full h-full relative font-mono select-none drop-shadow-xl flex flex-col gap-12"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}>

            {/* Top Row: Blood Vessel & Fuel Tank */}
            <div className="flex gap-4 items-center h-24 relative z-20">
                {/* Blood Vessel */}
                <div className="relative flex-1 h-full rounded-full border-t-2 border-b-2 border-red-500/30 bg-red-900/10 overflow-hidden shadow-[inset_0_0_15px_rgba(220,38,38,0.2)]">
                    {/* RBCs */}
                    {[...Array(5)].map((_, i) => (
                        <motion.div key={`rbc-${i}`} className="absolute w-10 h-5 rounded-full bg-red-600/80 border border-black/40 shadow-inner" style={{ top: `${20 + Math.random() * 40}%` }} animate={{ left: ["-10%", "110%"], rotate: [0, 10, -10, 0] }} transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, delay: i * 1.5, ease: "linear" }} />
                    ))}

                    {/* Insulin Flowing / Binding */}
                    <motion.div
                        className="absolute z-20 text-yellow-500 font-bold drop-shadow-[0_0_10px_rgba(234,179,8,1)] text-2xl"
                        animate={controls}
                        variants={{
                            idle: { top: "35%", left: "45%", opacity: 0.8, y: [0, 5, -5, 0], transition: { y: { repeat: Infinity, duration: 2 } } },
                            activated: { top: "180%", left: "50%", x: "-50%", opacity: 1, scale: 1.2, rotate: 180, transition: { duration: 0.6, ease: "easeOut" } }
                        }}
                    >
                        ⬡
                        <motion.span className="absolute top-0 left-6 text-xs whitespace-nowrap" variants={{ idle: { opacity: 1 }, activated: { opacity: 0 } }}>INSULINA</motion.span>
                    </motion.div>

                    {/* Loose Glucose in blood */}
                    {[...Array(8)].map((_, i) => (
                        <motion.div key={`bgluc-${i}`} className="absolute w-3 h-3 rounded-full bg-green-400 shadow-[0_0_8px_#4ade80]"
                            style={{ top: `${20 + Math.random() * 50}%` }}
                            animate={controls}
                            variants={{
                                idle: { left: ["-10%", "110%"], transition: { duration: 4 + Math.random() * 3, repeat: Infinity, delay: i * 0.8, ease: "linear" } },
                                activated: { opacity: 0, transition: { duration: 2, delay: 1 } }
                            }}
                        />
                    ))}
                </div>

                {/* Blood Glucose Tank */}
                <div className="w-48 h-full bg-slate-800/80 rounded-xl p-3 flex flex-col justify-center border border-white/5 shadow-lg relative overflow-hidden">
                    <div className="flex justify-between items-end mb-2 relative z-10 w-full overflow-hidden">
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">Sangue</span>
                        <span className="text-[10px] text-green-400 font-bold">GLICOSE</span>
                    </div>
                    <div className="w-full h-8 bg-black/60 rounded-md overflow-hidden relative border border-white/10 p-1 z-10">
                        <motion.div className="h-full bg-gradient-to-r from-yellow-500 to-green-500 rounded-sm"
                            variants={{
                                idle: { width: "95%" },
                                activated: { width: ["95%", "20%"], background: "linear-gradient(to right, #ef4444, #f59e0b)", transition: { duration: 4, delay: 1.5, ease: "easeInOut" } }
                            }}
                            animate={controls}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Row: Cell Membrane & Muscle Tank */}
            <div className="flex gap-4 h-[300px] relative z-10">
                {/* Cell */}
                <div className="relative flex-1 h-full rounded-t-[3rem] border-t-[6px] border-blue-500/40 bg-slate-900/60 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)] overflow-hidden">

                    <div className="absolute top-4 left-6 text-blue-400 font-mono text-[10px] tracking-widest uppercase opacity-50">Membrana Celular Muscular</div>

                    {/* Receptor IR-α/β */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <div className="flex gap-2">
                            <motion.div className="w-4 h-10 bg-emerald-600 rounded-t-lg origin-bottom" variants={{ idle: { rotate: -25 }, activated: { rotate: 0, backgroundColor: "#34D399" } }} animate={controls} />
                            <motion.div className="w-4 h-10 bg-emerald-600 rounded-t-lg origin-bottom" variants={{ idle: { rotate: 25 }, activated: { rotate: 0, backgroundColor: "#34D399" } }} animate={controls} />
                        </div>
                        <motion.div className="w-16 h-3 bg-emerald-800 rounded-full mt-1" variants={{ idle: { backgroundColor: "#065f46" }, activated: { backgroundColor: "#10b981", boxShadow: "0 0 15px #34d399" } }} animate={controls} />
                        <span className="text-[9px] text-emerald-500/70 mt-4 text-center leading-tight">RECEPTOR<br />IR-α/β</span>
                    </div>

                    {/* PI3K/Akt Signal pathway */}
                    <motion.div className="absolute left-1/2 -translate-x-1/2 top-4 w-1 bg-gradient-to-b from-emerald-400 to-transparent"
                        variants={{ idle: { height: 0, opacity: 0 }, activated: { height: "100%", opacity: 1, transition: { duration: 1, delay: 0.4 } } }}
                        animate={controls}
                    />

                    {/* GLUT4 Translocation */}
                    {[20, 80].map((leftPos, i) => (
                        <motion.div key={`glut-${i}`} className="absolute w-16 flex flex-col items-center justify-center z-20"
                            style={{ left: `${leftPos}%`, x: "-50%" }}
                            variants={{
                                idle: { top: "70%", opacity: 0.5, y: [0, 5, -5, 0], transition: { y: { repeat: Infinity, duration: 4, delay: i } } },
                                activated: { top: "-6px", opacity: 1, transition: { duration: 1.5, delay: 1, ease: "easeOut" } }
                            }}
                            animate={controls}
                        >
                            {/* Vesicle breaking into channel */}
                            <motion.div className="w-14 h-6 border-2 border-blue-400 bg-blue-500/20 flex gap-1 justify-center items-center overflow-hidden"
                                variants={{
                                    idle: { borderRadius: "100px" },
                                    activated: { borderRadius: "0 0 8px 8px", borderTopColor: "transparent", background: "rgba(59,130,246,0.1)", boxShadow: "inset 0px -10px 20px rgba(59,130,246,0.2)" }
                                }}
                                animate={controls}
                            >
                                <motion.div className="w-1 h-3 bg-blue-400/50 rounded-full" variants={{ idle: { opacity: 0 }, activated: { opacity: 1 } }} />
                                <motion.div className="w-1 h-3 bg-blue-400/50 rounded-full" variants={{ idle: { opacity: 0 }, activated: { opacity: 1 } }} />
                            </motion.div>
                            <motion.span className="text-[9px] text-blue-400/70 mt-1 uppercase whitespace-nowrap font-bold" variants={{ idle: { opacity: 1 }, activated: { opacity: 0 } }}>Vesícula GLUT4</motion.span>
                            <motion.span className="text-[9px] text-blue-400/70 mt-1 uppercase whitespace-nowrap font-bold absolute top-6" variants={{ idle: { opacity: 0 }, activated: { opacity: 1, transition: { delay: 2 } } }}>Canal GLUT4</motion.span>
                        </motion.div>
                    ))}

                    {/* Glucose Entering Cell */}
                    {[20, 80].map((leftPos, i) => (
                        <div key={`entry-${i}`} className="absolute top-0 h-full w-20" style={{ left: `${leftPos}%`, x: "-50%" }}>
                            {[...Array(5)].map((_, g) => (
                                <motion.div key={`cgluc-${g}`} className="absolute w-4 h-4 rounded-full bg-green-400 shadow-[0_0_12px_#4ade80] left-1/2 -translate-x-1/2"
                                    variants={{
                                        idle: { top: "-100px", opacity: 0 },
                                        activated: { top: ["-20%", "110%"], opacity: [0, 1, 1, 0], scale: [0.5, 1, 1.2, 0.5], transition: { duration: 2, repeat: Infinity, delay: 2 + (g * 0.4) + (i * 0.2), ease: "linear" } }
                                    }}
                                    animate={controls}
                                />
                            ))}
                        </div>
                    ))}

                    {/* Instructional CTA */}
                    <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center pointer-events-none"
                        variants={{ idle: { opacity: 1 }, activated: { opacity: 0, y: 20 } }} animate={controls}>
                        <div className="inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full mb-2">
                            <span className="text-blue-400 text-sm font-bold tracking-widest animate-pulse">PASSE O MOUSE NA ÁREA</span>
                        </div>
                        <p className="text-gray-500 text-xs">Ativa a cascata do Receptor de Insulina e transloca os varredores GLUT4.</p>
                    </motion.div>

                </div>

                {/* Muscle Glycogen Tank */}
                <div className="w-48 h-full bg-slate-800/80 rounded-xl p-3 flex flex-col justify-end border border-white/5 shadow-lg relative overflow-hidden">
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 w-full overflow-hidden" style={{ width: 'calc(100% - 24px)' }}>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider leading-tight">Músculo</span>
                        <span className="text-[10px] text-blue-400 font-bold">GLICOGÊNIO</span>
                    </div>
                    <div className="w-full h-[240px] bg-black/60 rounded-md overflow-hidden relative border border-white/10 p-1 flex items-end mt-8 z-10 flex-shrink-0">
                        <motion.div className="w-full bg-gradient-to-t from-blue-700 to-blue-400 rounded-sm relative"
                            variants={{
                                idle: { height: "15%" },
                                activated: { height: ["15%", "95%"], transition: { duration: 4, delay: 1.5, ease: "easeInOut" } }
                            }}
                            animate={controls}
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-white/30" />
                        </motion.div>
                    </div>
                </div>
            </div>

        </div>
    );
};
