import { motion } from 'framer-motion';
import { Ban, EyeOff, TrendingUp, type LucideIcon } from 'lucide-react';
import { FACTS, type FactIcon } from './content';

const ICONS: Record<FactIcon, LucideIcon> = { anabolic: TrendingUp, hidden: EyeOff, antidote: Ban };

/** As três frases do slide como três fatos; cada um acende no passo em que entra na história. */
export const Facts = ({ step }: { readonly step: number }) => (
    <div className="grid h-full gap-3" style={{ gridTemplateColumns: '1fr 1.4fr 1fr' }}>
        {FACTS.map(f => {
            const lit = step >= f.from;
            const Icon = ICONS[f.icon];
            return (
                <motion.div
                    key={f.icon}
                    className="flex items-center gap-3 rounded-2xl border px-3.5 py-1.5"
                    initial={false}
                    animate={{
                        borderColor: lit ? `${f.color}aa` : 'rgba(255,255,255,0.10)',
                        backgroundColor: lit ? `${f.color}1c` : 'rgba(8,8,18,0.72)',
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.span
                        className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border"
                        initial={false}
                        animate={{ borderColor: lit ? f.color : 'rgba(255,255,255,0.18)', color: lit ? f.color : '#CBD5E1', scale: lit ? 1 : 0.92 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Icon size={21} strokeWidth={2.2} aria-hidden />
                    </motion.span>
                    <p className="font-body text-[16px] leading-snug transition-colors duration-500" style={{ color: lit ? '#F3F4F6' : '#CBD5E1' }}>
                        {f.pre}
                        <strong className="font-semibold transition-colors duration-500" style={{ color: lit ? '#fff' : '#D1D5DB' }}>{f.hi}</strong>
                        {f.post}
                    </p>
                </motion.div>
            );
        })}
    </div>
);
