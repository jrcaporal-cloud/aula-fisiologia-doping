import type { ReactNode } from 'react';
import { COLORS } from './content';
import { useTween } from './useTween';

/**
 * Passos 2 e 3: os dois módulos do ABP como painéis de instrumentos.
 * Ponteiros sem números: o centro verde é a faixa do próprio atleta (modelo ilustrativo).
 * Os únicos números são os do slide: T/E 1:1 natural e alarme WADA >4:1.
 */

const W = 770;
/** Deslocamento dos instrumentos para a direita da coluna de títulos. */
const INSTR_DX = 30;
const H = 470;
const PANEL_H = 224;
const DIAL_R = 56;

/** Ângulo do ponteiro: −90° (mínimo) … 0° (centro) … +90° (máximo). */
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};

const arc = (cx: number, cy: number, r: number, from: number, to: number): string => {
    const [x0, y0] = polar(cx, cy, r, from);
    const [x1, y1] = polar(cx, cy, r, to);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
};

interface Zone {
    readonly from: number;
    readonly to: number;
    readonly color: string;
}

const SYMMETRIC_ZONES: readonly Zone[] = [
    { from: -90, to: -52, color: COLORS.red },
    { from: -52, to: -24, color: COLORS.amber },
    { from: -24, to: 24, color: COLORS.ok },
    { from: 24, to: 52, color: COLORS.amber },
    { from: 52, to: 90, color: COLORS.red },
];

interface DialProps {
    readonly cx: number;
    readonly cy: number;
    readonly angle: number;
    readonly zones: readonly Zone[];
    readonly ticks?: readonly { deg: number; label: string }[];
}

const Dial = ({ cx, cy, angle, zones, ticks = [] }: DialProps) => {
    const [nx, ny] = polar(cx, cy, DIAL_R - 10, angle);
    return (
        <g>
            <path d={arc(cx, cy, DIAL_R, -90, 90)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={14} />
            {zones.map(z => (
                <path key={`${z.from}`} d={arc(cx, cy, DIAL_R, z.from + 1, z.to - 1)} fill="none" stroke={z.color} strokeOpacity={0.9} strokeWidth={8}
                    strokeDasharray={z.color === COLORS.red ? '5 3' : undefined} />
            ))}
            {ticks.map(t => {
                const [a, b] = polar(cx, cy, DIAL_R + 6, t.deg);
                const [c, d] = polar(cx, cy, DIAL_R - 8, t.deg);
                const [lx, ly] = polar(cx, cy, DIAL_R + 18, t.deg);
                return (
                    <g key={t.label}>
                        <line x1={a} y1={b} x2={c} y2={d} stroke="#fff" strokeWidth={2} />
                        <text x={lx} y={ly + 4} textAnchor="middle" className="font-mono" fontSize={18} fontWeight={700} fill="#fff">{t.label}</text>
                    </g>
                );
            })}
            <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="#fff" strokeWidth={3.2} strokeLinecap="round" />
            <circle cx={cx} cy={cy} r={6} fill="#fff" />
        </g>
    );
};

const LINE_H = 21;

const asLines = (v: string | readonly string[]): readonly string[] => (typeof v === 'string' ? [v] : v);

const InstrumentLabel = ({ x, y, name, status, color }: { x: number; y: number; name: string | readonly string[]; status: string | readonly string[]; color: string }) => {
    const names = asLines(name);
    const statuses = asLines(status);
    const yStatus = y + (names.length - 1) * LINE_H + 24;
    return (
        <g>
            {names.map((l, i) => (
                <text key={l} x={x} y={y + i * LINE_H} textAnchor="middle" className="font-body" fontSize={18.5} fontWeight={700} fill="#fff">{l}</text>
            ))}
            {statuses.map((l, i) => (
                <text key={l} x={x} y={yStatus + i * LINE_H} textAnchor="middle" className="font-body" fontSize={18} fontWeight={600} fill={color}>{l}</text>
            ))}
        </g>
    );
};

interface PanelFrameProps {
    readonly y: number;
    readonly active: boolean;
    readonly color: string;
    readonly tint: string;
    readonly kicker: string;
    readonly title: string;
    readonly since: string;
    readonly onSelect: () => void;
    readonly children: ReactNode;
}

const PanelFrame = ({ y, active, color, tint, kicker, title, since, onSelect, children }: PanelFrameProps) => (
    <g opacity={active ? 1 : 0.62} style={{ transition: 'opacity 0.5s', cursor: active ? 'default' : 'pointer' }} onClick={onSelect}>
        <rect x={2} y={y} width={W - 4} height={PANEL_H} rx={16} fill={active ? `${color}12` : 'rgba(255,255,255,0.02)'}
            stroke={active ? color : 'rgba(255,255,255,0.14)'} strokeOpacity={active ? 0.75 : 1} strokeWidth={1.5} />
        <text x={22} y={y + 34} className="font-mono" fontSize={18} letterSpacing="0.05em" fill={tint}>{kicker}</text>
        <text x={22} y={y + 68} className="font-display" fontSize={28} fontWeight={600} fill="#fff">{title}</text>
        <text x={22} y={y + 94} className="font-body" fontSize={18} fill="#E2E8F0">{since}</text>
        <g transform={`translate(${INSTR_DX} 0)`}>{children}</g>
    </g>
);

/* ---------- Módulo hematológico ---------- */

const HEMA_X = [262, 450, 638] as const;

const HematoPanel = ({ y, active, onSelect }: { y: number; active: boolean; onSelect: () => void }) => {
    const hb = useTween(active ? 56 : 0, 1100, active ? 300 : 0);
    const ret = useTween(active ? -64 : 0, 1100, active ? 700 : 0);
    const off = useTween(active ? 72 : 0, 1100, active ? 1500 : 0);
    const cy = y + 120;
    const merged = Math.min(1, Math.max(0, off / 72));
    return (
        <PanelFrame y={y} active={active} color={COLORS.red} tint="#FDA4AF" kicker="MÓDULO HEMATOLÓGICO" title="Sangue" since="introduzido em 2009" onSelect={onSelect}>
            {/* Hb alta + %Ret baixa convergem no OFF-Score */}
            <g opacity={merged}>
                <path d={`M${HEMA_X[0]} ${y + 50} L${HEMA_X[0]} ${y + 40} L${HEMA_X[2] - 14} ${y + 40}`} fill="none" stroke="#FDA4AF" strokeWidth={1.8} />
                <path d={`M${HEMA_X[1]} ${y + 50} L${HEMA_X[1]} ${y + 40}`} fill="none" stroke="#FDA4AF" strokeWidth={1.8} />
                <path d={`M${HEMA_X[2] - 14} ${y + 40} L${HEMA_X[2]} ${y + 40} L${HEMA_X[2]} ${y + 50}`} fill="none" stroke="#FDA4AF" strokeWidth={1.8} />
                <path d={`M${HEMA_X[2] - 5} ${y + 44} L${HEMA_X[2]} ${y + 52} L${HEMA_X[2] + 5} ${y + 44}`} fill="none" stroke="#FDA4AF" strokeWidth={1.8} />
                <text x={(HEMA_X[0] + HEMA_X[2]) / 2} y={y + 28} textAnchor="middle" className="font-body" fontSize={18} fontWeight={600} fill="#FDA4AF">
                    mescla Hb alta com %Ret baixa
                </text>
            </g>
            <Dial cx={HEMA_X[0]} cy={cy} angle={hb} zones={SYMMETRIC_ZONES} />
            <Dial cx={HEMA_X[1]} cy={cy} angle={ret} zones={SYMMETRIC_ZONES} />
            <Dial cx={HEMA_X[2]} cy={cy} angle={off} zones={SYMMETRIC_ZONES} />
            <InstrumentLabel x={HEMA_X[0]} y={cy + 34} name="Hb / Hematócrito" status={hb > 30 ? 'alta' : 'na faixa'} color={hb > 30 ? '#FCD34D' : '#A5F3FC'} />
            <InstrumentLabel x={HEMA_X[1]} y={cy + 34} name="Reticulócitos (%Ret)" status={ret < -30 ? 'afundamento súbito' : 'na faixa'} color={ret < -30 ? '#FDA4AF' : '#A5F3FC'} />
            <InstrumentLabel x={HEMA_X[2]} y={cy + 34} name="OFF-Score" status={off > 40 ? 'assinatura do doping' : 'na faixa'} color={off > 40 ? '#FB7185' : '#A5F3FC'} />
        </PanelFrame>
    );
};

/* ---------- Módulo esteroide ---------- */

/** T/E no mostrador: 1:1 à esquerda do centro, 4:1 é o limite de alarme. */
const TE_ZONES: readonly Zone[] = [
    { from: -90, to: 30, color: COLORS.ok },
    { from: 30, to: 90, color: COLORS.red },
];
const TE_TICKS = [{ deg: -40, label: '1:1' }, { deg: 30, label: '4:1' }];
const TE_NATURAL = -40;
const TE_DOPED = 66;
const TE_DELETION = -66;

interface SteroidProps {
    readonly y: number;
    readonly active: boolean;
    readonly deletion: boolean;
    readonly onSelect: () => void;
    readonly onToggleDeletion: () => void;
}

const SteroidPanel = ({ y, active, deletion, onSelect, onToggleDeletion }: SteroidProps) => {
    const doped = active ? 1 : 0;
    const teTarget = !active ? TE_NATURAL : deletion ? TE_DELETION : TE_DOPED;
    const te = useTween(teTarget, 1200, active ? 500 : 0);
    const dose = useTween(doped, 1200, active ? 500 : 0);
    const cy = y + 120;
    // Com a deleção, a T urinária some (T/E ~0,5:1 no slide 11), mesmo com a dose.
    const tH = useTween(!active ? 26 : deletion ? 13 : 88, 1100, active ? 500 : 0);
    const eH = 26;
    const alarm = te > 30;
    const teStatus: string | readonly string[] = alarm ? ['acima de 4:1', 'alarme'] : deletion && active ? 'falso negativo' : '1:1 natural';
    const teColor = alarm ? '#FB7185' : deletion && active ? '#FCD34D' : '#A5F3FC';
    const barBase = cy + 6;

    return (
        <PanelFrame y={y} active={active} color={COLORS.blue} tint="#BFDBFE" kicker="MÓDULO ESTEROIDE" title="Urina" since="introduzido em 2014" onSelect={onSelect}>
            {/* barras T e E + mostrador da relação */}
            <g>
                <rect x={196} y={barBase - tH} width={20} height={tH} rx={3} fill={COLORS.blue} />
                <rect x={224} y={barBase - eH} width={20} height={eH} rx={3} fill="#A5B4FC" />
                <text x={206} y={barBase + 22} textAnchor="middle" className="font-mono" fontSize={18} fontWeight={700} fill="#fff">T</text>
                <text x={234} y={barBase + 22} textAnchor="middle" className="font-mono" fontSize={18} fontWeight={700} fill="#fff">E</text>
            </g>
            <Dial cx={322} cy={cy} angle={te} zones={TE_ZONES} ticks={TE_TICKS} />
            <InstrumentLabel x={300} y={cy + 34} name="Relação T/E" status={teStatus} color={teColor} />
            {active && !deletion && dose > 0.5 && (
                <text x={232} y={y + 28} textAnchor="start" className="font-body" fontSize={18} fontWeight={600} fill="#BFDBFE">dose sintética: T sobe, E não</text>
            )}

            {/* Androsterona / Etiocolanolona: o "mapa" ao longo do tempo */}
            <g>
                <rect x={428} y={cy - 54} width={124} height={58} rx={8} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.18)" />
                <rect x={428} y={cy - 36} width={124} height={22} fill={COLORS.blue} fillOpacity={0.16} />
                {[0, 1, 2, 3, 4, 5].map(i => (
                    <circle key={i} cx={442 + i * 19} cy={cy - 25 + (i % 2 === 0 ? -3 : 3)} r={4} fill={COLORS.blue} />
                ))}
                <text x={490} y={cy - 62} textAnchor="middle" className="font-mono" fontSize={17} fill="#BFDBFE">ao longo do tempo</text>
            </g>
            <InstrumentLabel x={490} y={cy + 34} name={['Androsterona /', 'Etiocolanolona']} status={['metabólitos', 'terminais']} color="#BFDBFE" />

            {/* Deleção UGT2B17: contexto, com chave */}
            <g style={{ cursor: active ? 'pointer' : undefined }}
                onClick={e => { if (active) { e.stopPropagation(); onToggleDeletion(); } }}>
                <rect x={574} y={cy - 54} width={156} height={58} rx={8} fill={deletion ? 'rgba(225,29,72,0.14)' : 'rgba(255,255,255,0.03)'}
                    stroke={deletion ? COLORS.red : 'rgba(255,255,255,0.18)'} />
                {[0, 1, 2, 3, 4].map(i => (
                    <rect key={i} x={596 + i * 23} y={cy - 46} width={19} height={12} rx={2}
                        fill={i === 2 ? (deletion ? 'none' : COLORS.cyan) : '#64748B'} stroke={i === 2 && deletion ? COLORS.red : 'none'} strokeDasharray="3 3" />
                ))}
                <rect x={584} y={cy - 28} width={136} height={24} rx={12} fill={deletion ? COLORS.red : 'rgba(255,255,255,0.14)'} />
                <circle cx={deletion ? 708 : 596} cy={cy - 16} r={9} fill="#fff" style={{ transition: 'cx 0.3s' }} />
                <text x={deletion ? 641 : 662} y={cy - 10} textAnchor="middle" className="font-mono" fontSize={16.5} fontWeight={700} fill="#fff">{deletion ? 'deleção' : 'gene normal'}</text>
            </g>
            <InstrumentLabel x={652} y={cy + 34} name="Deleção UGT2B17" status={['contexto ·', 'ver UGT2B17']} color="#BFDBFE" />
        </PanelFrame>
    );
};

interface InstrumentPanelsProps {
    readonly step: number;
    readonly deletion: boolean;
    readonly onSelect: (step: number) => void;
    readonly onToggleDeletion: () => void;
}

export const InstrumentPanels = ({ step, deletion, onSelect, onToggleDeletion }: InstrumentPanelsProps) => (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" role="img" aria-label="Painéis dos módulos hematológico e esteroide do passaporte biológico">
        <HematoPanel y={4} active={step === 2} onSelect={() => onSelect(2)} />
        <SteroidPanel y={H - PANEL_H - 4} active={step === 3} deletion={deletion} onSelect={() => onSelect(3)} onToggleDeletion={onToggleDeletion} />
    </svg>
);
