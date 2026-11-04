import { motion } from 'framer-motion';
import { FlaskConical, Medal, ScanSearch, Stethoscope, type LucideIcon } from 'lucide-react';
import { TONE_STYLES } from './map';

/**
 * Pérola clínica do eixo gonadal (passo do mapa). Fontes: casos noticiados de atletas diagnosticados pelo controle
 * antidoping (Thomas Van der Plaetsen, decatlo, 2014; ouro no Campeonato Europeu de 2016) e Vecchiato et al. 2024.
 */

interface Beat { icon: LucideIcon; when: string; text: string }
const BEATS: readonly Beat[] = [
    { icon: FlaskConical, when: '2014', text: 'Controle antidoping: hCG alto na urina de um decatleta belga' },
    { icon: ScanSearch, when: 'logo depois', text: 'Não era doping: investigação com ultrassom e marcadores' },
    { icon: Stethoscope, when: 'tratamento', text: 'Câncer de testículo, diagnosticado cedo e tratado' },
    { icon: Medal, when: '2016', text: 'Thomas Van der Plaetsen é campeão europeu do decatlo' },
];

export const HcgPearl = () => {
    const tone = TONE_STYLES.sky;
    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex items-baseline gap-3">
                <h3 className="font-display text-[1.6rem] font-semibold leading-tight" style={{ color: tone.text }}>Pérola clínica: o positivo que salvou a vida</h3>
            </div>
            <div className="relative grid grid-cols-4 gap-3 flex-1 min-h-0">
                <div className="absolute left-[12%] right-[12%] top-[42px] h-[2px] bg-sky-300/25" />
                {BEATS.map((b, i) => {
                    const Icon = b.icon;
                    return (
                        <motion.div key={b.text} className="relative flex flex-col items-center text-center gap-2"
                            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 + i * 0.45 }}>
                            <span className="w-[84px] h-[84px] rounded-full flex items-center justify-center border-2"
                                style={{ borderColor: tone.border, background: '#0b1a26', boxShadow: `0 0 22px ${tone.bg}` }}>
                                <Icon size={38} color={tone.text} aria-hidden />
                            </span>
                            <span className="font-mono text-[15px] text-sky-200">{b.when}</span>
                            <p className="text-[1.2rem] leading-snug text-gray-100">{b.text}</p>
                        </motion.div>
                    );
                })}
            </div>
            <motion.p className="rounded-xl border px-5 py-3 text-[1.12rem] leading-snug text-white"
                style={{ borderColor: tone.border, background: tone.bg }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 2.2 }}>
                hCG alto na urina de um homem é sinal clínico antes de ser suspeita de doping. Nos casos publicados, eram atletas com menos de 35 anos, quase todos em estágio inicial.
            </motion.p>
        </div>
    );
};
