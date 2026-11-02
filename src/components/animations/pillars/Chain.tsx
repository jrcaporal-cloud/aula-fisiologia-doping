import { motion } from 'framer-motion';
import type { ChainLink } from './data';

interface ChainProps {
    links: ChainLink[];
    color: string;
    /** Atraso inicial (s): a segunda cadeia começa depois da primeira. */
    delay?: number;
}

const STEP_DELAY = 0.38;

/** Cadeia causal que acende elo por elo, com um pulso percorrendo cada seta. */
export const Chain = ({ links, color, delay = 0 }: ChainProps) => (
    <div className="flex items-stretch w-full">
        {links.map((link, i) => {
            const at = delay + 0.25 + i * STEP_DELAY;
            return (
                <div key={link.title} className="flex items-center flex-1 min-w-0">
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.94 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: at, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex-1 min-w-0 rounded-xl px-3 py-2.5 border text-center"
                        style={{
                            borderColor: i === links.length - 1 ? color : `${color}55`,
                            background: i === links.length - 1 ? `${color}26` : 'rgba(255,255,255,0.035)',
                            boxShadow: i === links.length - 1 ? `0 0 22px -6px ${color}` : 'none',
                        }}
                    >
                        <div className="font-display font-semibold text-[15px] leading-tight text-white">{link.title}</div>
                        {link.note && <div className="text-[12.5px] leading-snug mt-0.5" style={{ color }}>{link.note}</div>}
                    </motion.div>

                    {i < links.length - 1 && (
                        <div className="relative w-7 flex-shrink-0 h-[2px] mx-0.5" style={{ background: `${color}40` }}>
                            <motion.span
                                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                                style={{ background: color, boxShadow: `0 0 10px ${color}` }}
                                initial={{ left: '-10%', opacity: 0 }}
                                animate={{ left: ['-10%', '100%'], opacity: [0, 1, 0] }}
                                transition={{ delay: at + 0.25, duration: 0.6, repeat: Infinity, repeatDelay: links.length * STEP_DELAY + 0.6 }}
                            />
                            <span
                                className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-l-[7px]"
                                style={{ borderLeftColor: `${color}aa` }}
                            />
                        </div>
                    )}
                </div>
            );
        })}
    </div>
);
