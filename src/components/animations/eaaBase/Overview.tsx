import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Molecule } from './Molecule';
import { C17, fitMolecule } from './steroidGeometry';
import { EASE, LAYERS, type Layer } from './content';

const CENTER_W = 330;
const CENTER_H = 460;
const FRAME = fitMolecule(16, 106, CENTER_W - 32, 210);
const [c17x, c17y] = FRAME.map(C17);

/** Miniatura de cada camada (sem emoji): o mesmo desenho do passo, em escala de ícone. */
const Glyph = ({ layer }: { layer: Layer }) => {
    const c = layer.color;
    switch (layer.id) {
        case 0:
            return (
                <svg viewBox="0 0 72 44" className="w-[72px] h-[44px]" aria-hidden>
                    <path d="M8 30 L8 18 L19 12 L30 18 L30 30 L19 36 Z M30 18 L41 12 L52 18 L52 30 L41 36 L30 30" fill="none" stroke="#FB7185" strokeWidth={1.8} strokeLinejoin="round" />
                    <path d="M52 18 L60 12" stroke="#FB7185" strokeWidth={1.8} />
                    <circle cx={52} cy={18} r={4.5} fill={c} />
                    <path d="M52 18 L66 22" stroke={c} strokeWidth={2} strokeDasharray="2 2" />
                </svg>
            );
        case 1:
            return (
                <svg viewBox="0 0 72 44" className="w-[72px] h-[44px]" aria-hidden>
                    <rect x={6} y={10} width={18} height={9} rx={3} fill="#9CA3AF" />
                    <rect x={6} y={25} width={60} height={9} rx={3} fill={c} />
                </svg>
            );
        case 2:
            return (
                <svg viewBox="0 0 72 44" className="w-[72px] h-[44px]" aria-hidden>
                    <rect x={4} y={14} width={64} height={24} rx={12} fill="rgba(16,185,129,0.15)" stroke={c} strokeWidth={1.5} />
                    {[16, 34, 54].map(x => <ellipse key={x} cx={x} cy={16} rx={5} ry={2.4} fill="#A78BFA" />)}
                    <ellipse cx={25} cy={16} rx={5} ry={2.4} fill="#fff" />
                    <ellipse cx={36} cy={6} rx={6} ry={3.5} fill="rgba(16,185,129,0.4)" stroke={c} />
                </svg>
            );
        default:
            return (
                <svg viewBox="0 0 72 44" className="w-[72px] h-[44px]" aria-hidden>
                    <circle cx={44} cy={22} r={18} fill="#9F1239" stroke="#FDA4AF" strokeWidth={1} />
                    <circle cx={44} cy={22} r={7} fill="#1A0710" />
                    <path d="M8 8 L8 36 M3 31 L8 36 L13 31" stroke={c} strokeWidth={2} fill="none" strokeLinecap="round" />
                </svg>
            );
    }
};

interface TileProps { layer: Layer; onPick: (id: number) => void; delay: number }

const Tile = ({ layer, onPick, delay }: TileProps) => {
    const still = useReducedMotion();
    return (
        <motion.button
            type="button"
            onClick={() => onPick(layer.id)}
            initial={still ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.6, ease: EASE }}
            whileHover={{ y: -2 }}
            className="group text-left rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)] p-4 cursor-pointer hover:border-white/25 transition-colors flex flex-col gap-2 h-full"
            style={{ boxShadow: `inset 0 2px 0 ${layer.color}55` }}
        >
            <div className="flex items-center justify-between">
                <Glyph layer={layer} />
                <span className="font-mono text-[15px] tracking-widest" style={{ color: layer.ink }}>0{layer.id + 1}</span>
            </div>
            <div className="font-display font-semibold text-[18px] leading-tight text-white">{layer.title}</div>
            <p className="m-0 text-[15px] leading-snug text-slate-200">{layer.summary}</p>
            <span className="mt-auto flex items-center gap-1.5 text-[15px] font-medium opacity-90 group-hover:opacity-100 transition-opacity" style={{ color: layer.ink }}>
                Abrir camada <ArrowRight size={16} />
            </span>
        </motion.button>
    );
};

/** Passo 0 — a molécula no centro, as quatro camadas ao redor. */
export const Overview = ({ onPick }: { onPick: (id: number) => void }) => {
    return (
        <div className="grid h-full gap-3" style={{ gridTemplateColumns: `1fr ${CENTER_W}px 1fr`, gridTemplateRows: '1fr 1fr' }}>
            <div className="row-start-1 col-start-1"><Tile layer={LAYERS[0]} onPick={onPick} delay={0.5} /></div>
            <div className="row-start-2 col-start-1"><Tile layer={LAYERS[2]} onPick={onPick} delay={0.8} /></div>
            <div className="row-start-1 col-start-3"><Tile layer={LAYERS[1]} onPick={onPick} delay={0.65} /></div>
            <div className="row-start-2 col-start-3"><Tile layer={LAYERS[3]} onPick={onPick} delay={0.95} /></div>
            <div className="row-span-2 col-start-2 row-start-1 relative">
                <svg viewBox={`0 0 ${CENTER_W} ${CENTER_H}`} className="w-full h-full" role="img" aria-label="Testosterona: a molécula-base dos EAA">
                    <circle cx={CENTER_W / 2} cy={206} r={150} fill="url(#eaa-ov-halo)" />
                    <defs>
                        <radialGradient id="eaa-ov-halo">
                            <stop offset="0%" stopColor="#E11D48" stopOpacity={0.14} />
                            <stop offset="100%" stopColor="#E11D48" stopOpacity={0} />
                        </radialGradient>
                    </defs>
                    <Molecule frame={FRAME} stroke={2.6} idPrefix="eaa-ov" />
                    <circle cx={c17x} cy={c17y} r={6} fill={LAYERS[0].color} opacity={0.9} />
                    <text x={CENTER_W / 2} y={366} textAnchor="middle" fill="#F3F4F6" fontSize={18} fontWeight={600} className="font-display">Testosterona</text>
                    <text x={CENTER_W / 2} y={390} textAnchor="middle" fill="#CBD5E1" fontSize={15} className="font-body">a base dos derivados sintéticos</text>
                </svg>
            </div>
        </div>
    );
};
