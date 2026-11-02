import { motion, useReducedMotion } from 'framer-motion';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Beta2Glyph } from './Beta2Glyph';
import { C, CARCINOGEN, CARCINOGEN_NOTE } from './content';

/**
 * Passo 4: GW1516 à parte. Não se liga ao β2; entra no núcleo, ativa PPARδ → PGC-1α
 * e o feixe muda de fibras rápidas para lentas oxidativas. Esquema qualitativo.
 */

const Hex = ({ cx, cy, r, color }: { cx: number; cy: number; r: number; color: string }) => {
    const d = Array.from({ length: 6 }, (_, k) => {
        const a = (Math.PI / 3) * k + Math.PI / 6;
        return `${k === 0 ? 'M' : 'L'} ${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
    }).join(' ');
    return <path d={`${d} Z`} fill={`${color}44`} stroke={color} strokeWidth={2} />;
};

const GwMolecule = ({ x, y }: { x: number; y: number }) => (
    <g transform={`translate(${x} ${y})`}>
        <Hex cx={-10} cy={0} r={8.5} color={C.purple} />
        <line x1={-1.5} x2={1.5} y1={0} y2={0} stroke={C.purple} strokeWidth={2} />
        <Hex cx={10} cy={0} r={8.5} color={C.purple} />
    </g>
);

/** Feixe muscular em corte: células em grade hexagonal dentro de uma elipse. */
const FIBERS = (() => {
    const out: { x: number; y: number; k: number }[] = [];
    const r = 17;
    for (let row = -3; row <= 3; row += 1) {
        for (let col = -7; col <= 7; col += 1) {
            const x = col * r * 2 + (row % 2 ? r : 0);
            const y = row * r * 1.72;
            if ((x / 250) ** 2 + (y / 68) ** 2 <= 1) out.push({ x, y, k: out.length });
        }
    }
    return out;
})();
/** Ordem pseudoaleatória de conversão (determinística). */
const convertDelay = (k: number) => ((k * 37) % FIBERS.length) / FIBERS.length;

const FAST = '#FBCFE8';
const SLOW = '#B91C1C';

const Scene = ({ reduced, run }: { reduced: boolean; run: number }) => (
    <svg viewBox="0 0 700 420" className="absolute inset-0 w-full h-full block" role="img"
        aria-label="GW1516 não se liga ao beta-2; ativa PPAR delta no núcleo, PGC-1 alfa, e fibras rápidas viram lentas oxidativas">
        {/* Membrana com β2: o GW1516 passa direto */}
        <rect x={20} y={66} width={210} height={20} rx={4} fill="rgba(252,211,77,0.12)" stroke="rgba(252,211,77,0.4)" />
        <Beta2Glyph x={92} y={70} on={false} color={C.cyan} scale={1.6} />
        <text x={92} y={112} textAnchor="middle" className="font-mono" fontSize={13} fontWeight={700} fill="#A5F3FC">β2</text>
        <g transform="translate(92 34)">
            <path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke={C.red} strokeWidth={5} strokeLinecap="round" />
        </g>
        <text x={20} y={140} className="font-body" fontSize={15} fontWeight={700} fill="#FDA4AF">Não é Beta-2</text>

        {/* trajeto até o núcleo */}
        <path d="M 170 30 C 230 30, 300 60, 360 96" fill="none" stroke="rgba(168,85,247,0.6)" strokeWidth={2} strokeDasharray="5 5" />
        <motion.g initial={{ offsetDistance: '0%' }} animate={{ offsetDistance: reduced ? '100%' : ['0%', '100%'] }}
            transition={{ duration: reduced ? 0 : 2.2, repeat: reduced ? 0 : Infinity, repeatDelay: 0.8, ease: 'easeInOut' }}
            style={{ offsetPath: 'path("M 170 30 C 230 30, 300 60, 360 96")', offsetRotate: '0deg' }}>
            <GwMolecule x={0} y={0} />
        </motion.g>
        <text x={176} y={58} className="font-mono" fontSize={13} fontWeight={700} fill="#E9D5FF">GW1516</text>

        {/* Núcleo: PPARδ → PGC-1α → expressão gênica */}
        <circle cx={500} cy={110} r={100} fill="rgba(168,85,247,0.07)" stroke="#C084FC" strokeDasharray="6 5" strokeWidth={1.4} />
        <text x={500} y={28} textAnchor="middle" className="font-mono" fontSize={12} fill="#E9D5FF">núcleo</text>
        <path d="M 404 112 q 18 -30 52 -22 q 30 10 22 40 q -12 26 -46 20 q -30 -8 -28 -38 Z" fill="rgba(168,85,247,0.6)" stroke="#E9D5FF" />
        <text x={441} y={124} textAnchor="middle" className="font-mono" fontSize={14} fontWeight={700} fill="#fff">PPARδ</text>
        <GwMolecule x={432} y={86} />
        <path d="M 486 116 L 520 116" stroke="#E9D5FF" strokeWidth={2} />
        <path d="M 514 110 L 522 116 L 514 122" fill="none" stroke="#E9D5FF" strokeWidth={2} />
        <rect x={526} y={100} width={74} height={32} rx={9} fill="rgba(34,211,238,0.18)" stroke={C.cyan} />
        <text x={563} y={121} textAnchor="middle" className="font-mono" fontSize={14} fontWeight={700} fill="#CFFAFE">PGC-1α</text>
        <text x={500} y={170} textAnchor="middle" className="font-body" fontSize={13.5} fill="#E5E7EB">reprograma a expressão</text>
        <text x={500} y={187} textAnchor="middle" className="font-body" fontSize={13.5} fill="#E5E7EB">genética</text>

        {/* Feixe: rápidas → lentas oxidativas */}
        <path d="M 500 212 C 490 222, 470 228, 440 234" fill="none" stroke="rgba(207,250,254,0.5)" strokeWidth={1.6} strokeDasharray="4 5" />
        <g key={run} transform="translate(350 318)">
            <ellipse cx={0} cy={0} rx={268} ry={86} fill="rgba(127,29,29,0.12)" stroke="#FCA5A5" strokeOpacity={0.4} />
            {FIBERS.map(f => (
                <g key={f.k}>
                    <motion.circle cx={f.x} cy={f.y} r={15.5} stroke="#fff" strokeOpacity={0.25} initial={{ fill: FAST }} animate={{ fill: SLOW }}
                        transition={{ delay: reduced ? 0 : 1.2 + convertDelay(f.k) * 2.4, duration: reduced ? 0 : 0.6 }} />
                    <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: reduced ? 0 : 1.5 + convertDelay(f.k) * 2.4, duration: 0.5 }}>
                        <circle cx={f.x - 5} cy={f.y - 4} r={2.2} fill="#FDE68A" />
                        <circle cx={f.x + 5} cy={f.y + 3} r={2.2} fill="#FDE68A" />
                    </motion.g>
                </g>
            ))}
        </g>
        <g className="font-body" fontSize={13.5} fontWeight={700}>
            <rect x={20} y={226} width={14} height={14} rx={7} fill={FAST} />
            <text x={40} y={238} fill="#FBCFE8">contração rápida</text>
            <rect x={540} y={226} width={14} height={14} rx={7} fill={SLOW} stroke="#FCA5A5" />
            <text x={560} y={238} fill="#FCA5A5">lenta oxidativa</text>
            <circle cx={547} cy={252} r={2.4} fill="#FDE68A" />
            <text x={560} y={256} fontWeight={400} fontSize={12} fill="#FDE68A">mitocôndrias</text>
        </g>
    </svg>
);

export const Gw1516Scene = () => {
    const reduced = useReducedMotion() ?? false;
    const [run, setRun] = useState(0);
    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-1">
                <span className="font-display text-[16px] font-semibold text-white">Outra via: PPARδ, não β2</span>
                <button type="button" onClick={() => setRun(r => r + 1)}
                    className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-[13px] font-semibold border border-white/20 text-gray-100 cursor-pointer hover:bg-white/5">
                    <RotateCcw size={14} /> repetir a conversão
                </button>
                <span style={{ width: 12 }} />
                <span className="text-[12px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md text-amber-200 border border-amber-400/40" style={{ background: 'rgba(245,158,11,0.10)' }}>
                    esquema
                </span>
            </div>
            <div className="flex-1 min-h-0 relative mt-1"><Scene reduced={reduced} run={run} /></div>
        </div>
    );
};

export const CarcinogenBox = () => (
    <motion.div className="rounded-2xl border p-4" style={{ borderColor: 'rgba(225,29,72,0.6)', background: 'linear-gradient(160deg, rgba(225,29,72,0.22), rgba(8,8,18,0.7) 75%)' }}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.4 }}>
        <div className="flex items-center gap-2 text-rose-200">
            <AlertOctagon size={20} />
            <span className="font-display text-[22px] font-bold">{CARCINOGEN}</span>
        </div>
        <p className="text-[14px] leading-snug mt-1.5" style={{ color: '#FFF1F2' }}>{CARCINOGEN_NOTE}</p>
        <p className="font-mono text-[12px] text-gray-300 mt-1.5">detalhe do slide dos pilares (o caso GW501516)</p>
    </motion.div>
);
