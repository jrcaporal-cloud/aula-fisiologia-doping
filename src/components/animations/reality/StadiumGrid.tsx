import { AnimatePresence, motion } from 'framer-motion';
import { useId } from 'react';
import { COLORS, REAL, WADA, WAVE_MS, WAVE_TOTAL_S } from './data';
import {
    CELL_H, CELL_W, GRID_H, ICON_H, ICON_W, PAD_TOP, PAD_X, SVG_H, SVG_W, TOTAL,
    cellPos, prefixPath, prefixRightEdge,
} from './geometry';

interface StadiumGridProps {
    step: number;
    guess: number;
    reduced: boolean;
}


const ease = [0.16, 1, 0.3, 1] as const;

const cellFill = (i: number, step: number, guess: number): string => {
    if (step === 0) return i < guess ? COLORS.amber : COLORS.neutral;
    if (i < WADA.pct) return COLORS.blue;
    if (step >= 2 && i < REAL.pct) return COLORS.red;
    return COLORS.neutral;
};

const cellDelay = (i: number, step: number, reduced: boolean): number => {
    if (reduced || step < 2 || i < WADA.pct || i >= REAL.pct) return 0;
    return (i - WADA.pct) * WAVE_MS;
};

/** Pictograma de atleta (cabeça, tronco, braços, pernas) — herda o `fill` do <use>. */
const AthleteSymbol = ({ id }: { id: string }) => (
    <symbol id={id} viewBox={`0 0 ${ICON_W} ${ICON_H}`}>
        <circle cx={11} cy={5.2} r={4.6} />
        <rect x={5.2} y={11.6} width={11.6} height={15.4} rx={3.6} />
        <rect x={1.4} y={12.4} width={3} height={13.6} rx={1.5} />
        <rect x={17.6} y={12.4} width={3} height={13.6} rx={1.5} />
        <rect x={5.7} y={25.2} width={4.9} height={18.6} rx={2.3} />
        <rect x={11.4} y={25.2} width={4.9} height={18.6} rx={2.3} />
    </symbol>
);

/** Estádio de 100 atletas: palpite (âmbar), detectado (azul), admitido (vermelho) e o abismo entre eles. */
export const StadiumGrid = ({ step, guess, reduced }: StadiumGridProps) => {
    const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
    const ids = { athlete: `ath${uid}`, hatch: `hatch${uid}`, mask: `gap${uid}` };

    const guessPath = prefixPath(guess);
    const wadaPath = prefixPath(WADA.pct);
    const realPath = prefixPath(REAL.pct);
    const guessEdge = prefixRightEdge(guess);
    const realEdge = prefixRightEdge(REAL.pct);
    const after = (s: number) => (reduced ? 0 : s);
    const bracketY = PAD_TOP + GRID_H + 10;

    return (
        <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="block overflow-visible" role="img"
            aria-label="Grade de 100 atletas: palpite da turma, detectados pela WADA e prevalência real">
            <defs>
                <AthleteSymbol id={ids.athlete} />
                <pattern id={ids.hatch} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                    <line x1={0} y1={0} x2={0} y2={7} stroke={COLORS.red} strokeWidth={1.4} strokeOpacity={0.45} />
                </pattern>
                {wadaPath && realPath && (
                    <mask id={ids.mask}>
                        <path d={realPath} fill="white" />
                        <path d={wadaPath} fill="black" />
                    </mask>
                )}
            </defs>

            {/* O abismo: admitidos que o antidoping não detecta (hachura atrás das figuras) */}
            <motion.g
                initial={false}
                animate={{ opacity: step >= 2 ? 1 : 0 }}
                transition={{ duration: reduced ? 0 : 0.7, delay: step >= 2 ? after(WAVE_TOTAL_S * 0.6) : 0 }}
            >
                <rect x={PAD_X} y={PAD_TOP} width={SVG_W} height={GRID_H} fill="rgba(225,29,72,0.10)" mask={`url(#${ids.mask})`} />
                <rect x={PAD_X} y={PAD_TOP} width={SVG_W} height={GRID_H} fill={`url(#${ids.hatch})`} mask={`url(#${ids.mask})`} />
            </motion.g>

            {/* Pulso dos 2 detectados */}
            {step >= 1 && !reduced && Array.from({ length: WADA.pct }, (_, i) => {
                const p = cellPos(i);
                return (
                    <motion.circle key={`halo${i}`} cx={p.cx} cy={p.cy} r={19} fill={COLORS.blueDeep}
                        style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: [0.6, 1.55], opacity: [0.55, 0] }}
                        transition={{ duration: 1.9, repeat: Infinity, ease: 'easeOut', delay: 0.35 + i * 0.25 }} />
                );
            })}

            {/* 100 atletas */}
            {Array.from({ length: TOTAL }, (_, i) => {
                const p = cellPos(i);
                const isBlue = step >= 1 && i < WADA.pct;
                return (
                    <use key={i} href={`#${ids.athlete}`}
                        x={p.x + (CELL_W - ICON_W) / 2} y={p.y + (CELL_H - ICON_H) / 2}
                        width={ICON_W} height={ICON_H}
                        style={{
                            fill: cellFill(i, step, guess),
                            filter: isBlue ? `drop-shadow(0 0 6px ${COLORS.blueDeep})` : undefined,
                            transition: reduced ? 'none' : 'fill 420ms cubic-bezier(0.16,1,0.3,1)',
                            transitionDelay: `${cellDelay(i, step, reduced)}ms`,
                        }} />
                );
            })}

            {/* Contorno dos admitidos (desenha-se depois da onda) */}
            <AnimatePresence>
                {step >= 2 && realPath && (
                    <motion.path key="real" d={realPath} fill="none" stroke={COLORS.red} strokeWidth={2} strokeLinejoin="round"
                        initial={{ pathLength: reduced ? 1 : 0, opacity: 1 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0, transition: { duration: 0.2 } }}
                        transition={{ duration: reduced ? 0 : 0.9, delay: after(WAVE_TOTAL_S * 0.7), ease }} />
                )}
            </AnimatePresence>

            {/* Contorno dos detectados */}
            {wadaPath && (
                <motion.path d={wadaPath} fill="none" stroke={COLORS.blue} strokeWidth={2} strokeLinejoin="round"
                    initial={false} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.4 }} />
            )}

            {/* Palpite da turma: depois do passo 0, vira só uma marca tracejada */}
            {guessPath && (
                <motion.g initial={false} animate={{ opacity: step >= 1 ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.4 }}>
                    <path d={guessPath} fill="none" stroke={COLORS.amber} strokeWidth={1.8} strokeDasharray="6 5" strokeLinejoin="round" />
                    <line x1={guessEdge} y1={PAD_TOP} x2={guessEdge} y2={PAD_TOP - 12} stroke={COLORS.amber} strokeWidth={1.4} />
                    <text x={guessEdge} y={PAD_TOP - 16} textAnchor={guessEdge < 150 ? 'start' : 'end'}
                        dx={guessEdge < 150 ? -4 : 4}
                        className="font-mono" fontSize={15} fontWeight={600} fill={COLORS.amberSoft} letterSpacing="0.02em">
                        palpite da turma · {guess}%
                    </text>
                </motion.g>
            )}

            {/* Colchete do abismo */}
            <motion.g initial={false} animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : -6 }}
                transition={{ duration: reduced ? 0 : 0.6, delay: step >= 2 ? after(WAVE_TOTAL_S + 0.35) : 0, ease }}>
                <path d={`M${PAD_X + 1} ${bracketY} V${bracketY + 9} H${realEdge - 1} V${bracketY}`}
                    fill="none" stroke={COLORS.redSoft} strokeWidth={1.5} strokeOpacity={0.85} />
                <line x1={(PAD_X + realEdge) / 2} y1={bracketY + 9} x2={(PAD_X + realEdge) / 2} y2={bracketY + 15}
                    stroke={COLORS.redSoft} strokeWidth={1.5} strokeOpacity={0.85} />
                <text x={(PAD_X + realEdge) / 2} y={bracketY + 34} textAnchor="middle" className="font-display"
                    fontSize={20} fontWeight={600} fill={COLORS.redSoft} letterSpacing="0.04em">
                    o abismo
                </text>
            </motion.g>

            {/* Escala */}
            <text x={SVG_W - PAD_X} y={PAD_TOP + GRID_H + 26} textAnchor="end" className="font-mono" fontSize={15} fill="#CBD5E1">
                1 figura = 1 atleta · 100 atletas
            </text>
        </svg>
    );
};
