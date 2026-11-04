import { useState, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { SvgText } from '../peptide/ui';
import type { CardioPhase } from '../../../data/cardioSteps';
import { br } from './format';

/*
 * Convergência: quatro mecanismos à esquerda, os desfechos à direita e as ligações entre eles.
 * O ponto do slide é que nenhum mecanismo isolado explica o risco — a soma explica. Passar o
 * mouse (ou focar com Tab) num item isola as ligações dele; clicar fixa a seleção.
 *
 * Os riscos vêm da coorte de registro dinamarquesa (Circulation 2025): 1.189 homens sancionados
 * por uso de EAA contra 59.450 controles, cerca de 11 anos de seguimento. São razões de risco
 * ajustadas, de quem foi sancionado, sem dose nem tipo de substância. Não há risco publicado só
 * para fibrilação atrial: o átrio entra como substrato dentro de "arritmias".
 */

type Side = 'driver' | 'outcome';
interface Selection { side: Side; id: string }

type Reversal = 'volta' | 'parcial' | 'fica';

interface Driver { id: string; label: string; detail: string; reversal: Reversal; reversalText: string }
interface Outcome { id: string; label: string; hr: number }

const DRIVERS: readonly Driver[] = [
    { id: 'hvi', label: 'Hipertrofia concêntrica', detail: 'parede espessa, relaxamento lento', reversal: 'parcial', reversalText: 'massa e FE voltam; E′ não' },
    { id: 'pa', label: 'Pressão arterial ↑', detail: 'pós-carga e aorta rígida', reversal: 'parcial', reversalText: 'pressão volta; rigidez fica' },
    { id: 'hct', label: 'Hematócrito ↑', detail: 'viscosidade acima do fluxo', reversal: 'volta', reversalText: 'volta à faixa normal' },
    { id: 'lip', label: 'Lipídios + endotélio', detail: 'HDL ↓, LDL ↑, placa não calcificada', reversal: 'parcial', reversalText: 'lipídios voltam; placa fica' },
];

const OUTCOMES: readonly Outcome[] = [
    { id: 'cardio', label: 'Cardiomiopatia', hr: 8.9 },
    { id: 'ic', label: 'Insuficiência cardíaca', hr: 3.63 },
    { id: 'iam', label: 'Infarto do miocárdio', hr: 3.0 },
    { id: 'tev', label: 'Tromboembolismo venoso', hr: 2.42 },
    { id: 'arr', label: 'Arritmias', hr: 2.26 },
];

/** Quem alimenta o quê. A espessura indica o peso do mecanismo, não uma medida. */
const LINKS: readonly { from: string; to: string; weight: number }[] = [
    { from: 'hvi', to: 'cardio', weight: 3 },
    { from: 'hvi', to: 'ic', weight: 2.6 },
    { from: 'hvi', to: 'arr', weight: 2 },
    { from: 'pa', to: 'ic', weight: 2.2 },
    { from: 'pa', to: 'cardio', weight: 1.6 },
    { from: 'pa', to: 'iam', weight: 1.4 },
    { from: 'hct', to: 'tev', weight: 3 },
    { from: 'hct', to: 'iam', weight: 1.8 },
    { from: 'lip', to: 'iam', weight: 2.8 },
    { from: 'lip', to: 'tev', weight: 1.2 },
];

const REVERSAL_STYLE: Record<Reversal, { label: string; color: string }> = {
    volta: { label: 'VOLTA', color: '#67E8F9' },
    parcial: { label: 'PARCIAL', color: '#FCD34D' },
    fica: { label: 'FICA', color: '#FB7185' },
};

/* A caixa do slide é larga e baixa: o viewBox segue essa proporção para o desenho não sobrar nas laterais. */
const W = 1180;
const H = 360;
const BOX_W = 340;
const BOX_H = 54;
const LEFT_X = 28;
const RIGHT_X = W - BOX_W - 28;
const TOP = 44;
const BAR_W = BOX_W - 30;
/** Barras de risco em escala logarítmica, de 1 a 10. */
const hrWidth = (hr: number) => (Math.log(hr) / Math.log(10)) * BAR_W;

/** Cada coluna centraliza as suas caixas, porque os dois lados têm contagens diferentes. */
const rowY = (i: number, total: number, gap: number) => {
    const span = total * BOX_H + (total - 1) * gap;
    return TOP + (H - TOP - span) / 2 + i * (BOX_H + gap);
};
const driverY = (i: number) => rowY(i, DRIVERS.length, 16);
const outcomeY = (i: number) => rowY(i, OUTCOMES.length, 10);

const linkPath = (from: string, to: string) => {
    const y1 = driverY(DRIVERS.findIndex(d => d.id === from)) + BOX_H / 2;
    const y2 = outcomeY(OUTCOMES.findIndex(o => o.id === to)) + BOX_H / 2;
    const x1 = LEFT_X + BOX_W;
    const mid = (x1 + RIGHT_X) / 2;
    return `M ${x1} ${y1} C ${mid} ${y1} ${mid} ${y2} ${RIGHT_X} ${y2}`;
};

const sameSelection = (a: Selection | null, b: Selection | null) => a?.side === b?.side && a?.id === b?.id;

interface ConvergenceProps {
    phase: CardioPhase;
}

export const Convergence = ({ phase }: ConvergenceProps) => {
    const reduce = useReducedMotion();
    const [hover, setHover] = useState<Selection | null>(null);
    const [pinned, setPinned] = useState<Selection | null>(null);
    const selection = hover ?? pinned;
    const afterStopping = phase === 'apos';

    const isActiveLink = (l: { from: string; to: string }) =>
        selection === null || (selection.side === 'driver' ? l.from === selection.id : l.to === selection.id);
    const isLit = (side: Side, id: string) =>
        selection === null || (selection.side === side && selection.id === id) ||
        LINKS.some(l => isActiveLink(l) && (side === 'driver' ? l.from === id : l.to === id));

    const handlers = (side: Side, id: string) => {
        const me: Selection = { side, id };
        return {
            role: 'button' as const,
            tabIndex: 0,
            'aria-pressed': sameSelection(pinned, me),
            onMouseEnter: () => setHover(me),
            onMouseLeave: () => setHover(null),
            onFocus: () => setHover(me),
            onBlur: () => setHover(null),
            onClick: () => setPinned(p => (sameSelection(p, me) ? null : me)),
            onKeyDown: (e: KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    e.stopPropagation();
                    setPinned(p => (sameSelection(p, me) ? null : me));
                }
            },
            style: { cursor: 'pointer', outline: 'none' },
        };
    };

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="group"
            aria-label="Quatro mecanismos cardiovasculares convergindo em cardiomiopatia, insuficiência cardíaca, infarto, tromboembolismo e arritmias">
            <SvgText x={LEFT_X + 2} y={28} size={16} color="#FCA5A5" text="MECANISMO" />
            <SvgText x={RIGHT_X + 2} y={28} size={16} color="#FDE68A" text="DESFECHO · risco vs. controles" />

            {LINKS.map((link, i) => {
                const d = linkPath(link.from, link.to);
                const active = isActiveLink(link);
                const focused = selection !== null && active;
                return (
                    <g key={`${link.from}-${link.to}`}>
                        <motion.path d={d} fill="none" stroke="#E11D48" strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0, strokeWidth: link.weight }}
                            animate={{
                                pathLength: 1,
                                opacity: selection === null ? 0.42 + link.weight * 0.1 : active ? 0.95 : 0.08,
                                strokeWidth: link.weight + (focused ? 1.5 : 0),
                            }}
                            transition={{ pathLength: { duration: 0.7, delay: 0.5 + i * 0.09 }, opacity: { duration: 0.25 }, strokeWidth: { duration: 0.25 } }} />
                        {!reduce && [0, 1].map(k => (
                            <circle key={k} r={focused ? 4.5 : 3.2} fill="#FECDD3" opacity={selection === null ? 0.55 : active ? 1 : 0}>
                                <animateMotion path={d} dur={`${3.4 + (i % 3) * 0.5}s`} repeatCount="indefinite"
                                    begin={`-${((i * 0.43 + k * 1.7) % 3.4).toFixed(2)}s`} />
                            </circle>
                        ))}
                    </g>
                );
            })}

            {DRIVERS.map((d, i) => {
                const y = driverY(i);
                const lit = isLit('driver', d.id);
                const picked = selection?.side === 'driver' && selection.id === d.id;
                const style = REVERSAL_STYLE[d.reversal];
                return (
                    <motion.g key={d.id} {...handlers('driver', d.id)}
                        initial={{ opacity: 0 }} animate={{ opacity: lit ? 1 : 0.3 }} transition={{ duration: 0.3, delay: selection === null ? i * 0.1 : 0 }}>
                        <rect x={LEFT_X} y={y} width={BOX_W} height={BOX_H} rx={12} fill={picked ? '#2a1019' : '#12121c'}
                            stroke="#E11D48" strokeWidth={picked ? 2.6 : 1.6} />
                        <SvgText x={LEFT_X + 15} y={y + 23} size={18} color="#FFFFFF" text={d.label} />
                        <motion.g key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                            <SvgText x={LEFT_X + 15} y={y + 44} size={16} color={afterStopping ? style.color : '#B6BCC8'}
                                text={afterStopping ? d.reversalText : d.detail} />
                            {afterStopping && (
                                <g>
                                    <rect x={LEFT_X + BOX_W - 82} y={y + 7} width={68} height={24} rx={12}
                                        fill={style.color} fillOpacity={0.16} stroke={style.color} strokeWidth={1.4} />
                                    <text x={LEFT_X + BOX_W - 48} y={y + 24} textAnchor="middle" fontSize={15} fontWeight={700}
                                        fill={style.color} style={{ fontFamily: 'var(--font-body)' }}>{style.label}</text>
                                </g>
                            )}
                        </motion.g>
                    </motion.g>
                );
            })}

            {OUTCOMES.map((o, i) => {
                const y = outcomeY(i);
                const lit = isLit('outcome', o.id);
                const picked = selection?.side === 'outcome' && selection.id === o.id;
                return (
                    <motion.g key={o.id} {...handlers('outcome', o.id)}
                        initial={{ opacity: 0 }} animate={{ opacity: lit ? 1 : 0.3 }} transition={{ duration: 0.3, delay: selection === null ? 0.25 + i * 0.1 : 0 }}>
                        <rect x={RIGHT_X} y={y} width={BOX_W} height={BOX_H} rx={12} fill={picked ? '#2a2110' : '#12121c'}
                            stroke="#F59E0B" strokeWidth={picked ? 2.6 : 1.6} />
                        <SvgText x={RIGHT_X + 15} y={y + 24} size={18} color="#FFFFFF" text={o.label} />
                        <SvgText x={RIGHT_X + BOX_W - 14} y={y + 25} anchor="end" size={20} color="#FCD34D" weight={700} text={`HR ${br(o.hr)}`} />
                        <rect x={RIGHT_X + 15} y={y + 36} width={BAR_W} height={6} rx={3} fill="rgba(255,255,255,0.1)" />
                        <motion.rect x={RIGHT_X + 15} y={y + 36} height={6} rx={3} fill="#F59E0B"
                            initial={{ width: 0 }} animate={{ width: hrWidth(o.hr) }}
                            transition={{ duration: 0.8, delay: 0.7 + i * 0.1, ease: 'easeOut' }} />
                    </motion.g>
                );
            })}
        </svg>
    );
};
