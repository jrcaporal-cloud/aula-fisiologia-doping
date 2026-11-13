import { motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE_OUT } from '../../../lib/motion';
import type { ChainLink } from './data';

interface ChainProps {
    links: ChainLink[];
    color: string;
    /** Atraso inicial (s): a segunda cadeia segue um elo atrás da primeira. */
    delay?: number;
}

/** Intervalo entre um elo e o seguinte (s): acende um por um, sem fazer o passador esperar. */
export const LINK_STEP = 0.15;

/** Ritmo do pulso nas setas (loop ambiente: o período é conteúdo, não muda). */
const PULSE_STEP = 0.38;

/** Cadeia causal que acende elo por elo, com um pulso percorrendo cada seta. */
export const Chain = ({ links, color, delay = 0 }: ChainProps) => {
    const reduce = useReducedMotion();
    return (
        <div className="flex items-stretch w-full">
            {links.map((link, i) => {
                const at = delay + i * LINK_STEP;
                return (
                    <div key={link.title} className="flex items-center flex-1 min-w-0">
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.94 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ delay: at, duration: DUR.enter, ease: EASE_OUT }}
                            className="relative flex-1 min-w-0 rounded-xl px-1.5 py-1.5 border text-center"
                            style={{
                                borderColor: i === links.length - 1 ? color : `${color}55`,
                                background: i === links.length - 1 ? `${color}26` : 'rgba(255,255,255,0.035)',
                            }}
                        >
                            <div className="font-body font-semibold text-[17px] leading-tight text-white">{link.title}</div>
                            {link.note && <div className="text-[16px] leading-snug mt-0.5" style={{ color }}>{link.note}</div>}
                        </motion.div>

                        {i < links.length - 1 && (
                            <div className="relative w-5 flex-shrink-0 h-[2px] mx-0.5 [container-type:inline-size]" style={{ background: `${color}40` }}>
                                {/* Pulso em x (cqw da seta), não em left: só composição. Some com movimento reduzido. */}
                                {!reduce && (
                                    <motion.span
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                                        style={{ background: color, boxShadow: `0 0 10px ${color}` }}
                                        initial={{ x: '-10cqw', opacity: 0 }}
                                        animate={{ x: ['-10cqw', '100cqw'], opacity: [0, 1, 0] }}
                                        transition={{ delay: at + DUR.enter, duration: 0.6, repeat: Infinity, repeatDelay: links.length * PULSE_STEP + 0.6 }}
                                    />
                                )}
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
};
