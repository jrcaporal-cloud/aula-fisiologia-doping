import { useEffect } from 'react';
import { Pin } from 'lucide-react';
import { PANEL_BG } from '../peptide/ui';
import type { CardioVitals } from '../../../data/cardioSteps';
import type { CardioFocus } from './focus';
import { br, signed } from './format';

/*
 * Painel hemodinâmico: os números que o médico veria, a faixa de referência de cada um e quanto
 * mudou em relação ao coração treinado (o ponto de comparação do slide). Cada linha é um botão:
 * passar o mouse, focar com Tab ou clicar acende no desenho a parte que explica aquele número.
 * Os valores chegam já em transição, então o painel conta até o número novo.
 */

type Tone = 'ok' | 'atencao' | 'alterado';

const TONE_COLOR: Record<Tone, string> = { ok: '#67E8F9', atencao: '#FCD34D', alterado: '#FB7185' };
const WORSE = '#FB7185';
const BETTER = '#67E8F9';

interface Row {
    key: CardioFocus;
    label: string;
    value: string;
    unit: string;
    ref: string;
    tone: Tone;
    /** Preenchimento da barra de 0 a 1 (mais cheio = mais longe do normal). */
    fill: number;
    /** Onde a barra cruza o limite de referência, de 0 a 1. */
    mark: number;
    delta: number;
    deltaText: string;
    /** Sentido em que a mudança é pior. */
    worse: 'up' | 'down';
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

const toneBy = (x: number, limite: number, grave: number): Tone =>
    x >= grave ? 'alterado' : x >= limite ? 'atencao' : 'ok';

/** Monta as linhas do painel a partir dos valores atuais e do ponto de comparação. */
const buildRows = (v: CardioVitals, base: CardioVitals): readonly Row[] => [
    {
        key: 'pa', label: 'Pressão arterial',
        value: `${v.paSist.toFixed(0)}/${v.paDiast.toFixed(0)}`, unit: 'mmHg',
        ref: 'limite 130/80', tone: toneBy(v.paSist, 130, 140),
        fill: clamp01((v.paSist - 100) / 70), mark: (130 - 100) / 70,
        delta: v.paSist - base.paSist, deltaText: `${signed(v.paSist - base.paSist)} sist.`, worse: 'up',
    },
    {
        key: 'parede', label: 'Parede do VE',
        value: v.paredeMm.toFixed(0), unit: 'mm',
        ref: 'até 11 mm', tone: toneBy(v.paredeMm, 12, 13),
        fill: clamp01((v.paredeMm - 8) / 9), mark: (11 - 8) / 9,
        delta: v.paredeMm - base.paredeMm, deltaText: `${signed(v.paredeMm - base.paredeMm)} mm`, worse: 'up',
    },
    {
        key: 'fe', label: 'Fração de ejeção',
        value: v.fe.toFixed(0), unit: '%',
        ref: '≥ 55 %', tone: v.fe < 54 ? 'alterado' : v.fe < 57 ? 'atencao' : 'ok',
        fill: clamp01((70 - v.fe) / 20), mark: (70 - 55) / 20,
        delta: v.fe - base.fe, deltaText: `${signed(v.fe - base.fe)} pontos`, worse: 'down',
    },
    {
        // E′ do Doppler tecidual, não a relação E/A: é o índice que se altera nesses pacientes.
        key: 'e', label: 'E′ tecidual',
        value: br(v.eLinha), unit: 'cm/s',
        ref: 'controles ≈ 11', tone: v.eLinha < 9.5 ? 'alterado' : v.eLinha < 10.5 ? 'atencao' : 'ok',
        fill: clamp01((12 - v.eLinha) / 3.5), mark: (12 - 11) / 3.5,
        delta: v.eLinha - base.eLinha, deltaText: `${signed(v.eLinha - base.eLinha, 1)} cm/s`, worse: 'down',
    },
    {
        key: 'hct', label: 'Hematócrito',
        value: v.hct.toFixed(0), unit: '%',
        ref: 'intervir ≥ 54 %', tone: toneBy(v.hct, 51, 54),
        fill: clamp01((v.hct - 40) / 18), mark: (54 - 40) / 18,
        delta: v.hct - base.hct, deltaText: `${signed(v.hct - base.hct)} pontos`, worse: 'up',
    },
    {
        key: 'lip', label: 'HDL / LDL',
        value: `${v.hdl.toFixed(0)} / ${v.ldl.toFixed(0)}`, unit: 'mg/dL',
        ref: 'HDL baixo < 40', tone: v.hdl < 40 ? 'alterado' : v.hdl < 50 ? 'atencao' : 'ok',
        fill: clamp01((54 - v.hdl) / 22), mark: (54 - 40) / 22,
        delta: v.hdl - base.hdl, deltaText: `${signed(v.hdl - base.hdl)} HDL`, worse: 'down',
    },
];

interface VitalsProps {
    vitals: CardioVitals;
    /** Ponto de comparação (coração treinado). */
    baseline: CardioVitals;
    /** Linha em destaque: a sob o mouse ou, na falta dela, a fixada. */
    focus: CardioFocus | null;
    pinned: CardioFocus | null;
    /** Chamado com a linha sob o mouse/teclado e com `null` ao sair. */
    onHover: (key: CardioFocus | null) => void;
    onTogglePin: (key: CardioFocus) => void;
}

const DeltaChip = ({ row }: { row: Row }) => {
    if (Math.abs(row.delta) < 0.05) return null;
    const bad = row.worse === 'up' ? row.delta > 0 : row.delta < 0;
    const color = bad ? WORSE : BETTER;
    return (
        <span className="rounded-md px-1.5 py-px font-mono text-[14px] font-semibold tabular-nums leading-tight"
            style={{ color, background: bad ? 'rgba(251,113,133,0.14)' : 'rgba(103,232,249,0.12)' }}>
            {row.deltaText}
        </span>
    );
};

export const Vitals = ({ vitals, baseline, focus, pinned, onHover, onTogglePin }: VitalsProps) => {
    // Se o painel sai de cena com o mouse em cima (troca de passo), o destaque não pode ficar preso.
    useEffect(() => () => onHover(null), [onHover]);

    return (
        <div className="flex h-full flex-col gap-1 overflow-hidden rounded-2xl border border-white/10 p-3" style={PANEL_BG}>
            <p className="font-mono text-[14px] uppercase tracking-[0.14em] text-rose-300">Painel hemodinâmico</p>
            {buildRows(vitals, baseline).map(row => {
                const active = focus === row.key;
                const dim = focus !== null && !active;
                const color = TONE_COLOR[row.tone];
                return (
                    <button key={row.key} type="button" aria-pressed={pinned === row.key}
                        onMouseEnter={() => onHover(row.key)} onMouseLeave={() => onHover(null)}
                        onFocus={() => onHover(row.key)} onBlur={() => onHover(null)}
                        onClick={() => onTogglePin(row.key)}
                        className="relative flex flex-col gap-0.5 rounded-xl border px-2.5 py-0.5 text-left outline-none transition-[opacity,background-color,border-color] duration-200 focus-visible:ring-2 focus-visible:ring-rose-300/70"
                        style={{
                            opacity: dim ? 0.5 : 1,
                            borderColor: active ? 'rgba(253,164,175,0.55)' : 'transparent',
                            background: active ? 'rgba(225,29,72,0.14)' : 'transparent',
                        }}>
                        <span className="flex items-baseline justify-between gap-2">
                            <span className="flex items-center gap-1.5 text-[15px] leading-tight text-gray-100">
                                {row.label}
                                {pinned === row.key && <Pin size={13} className="text-rose-300" aria-label="fixado" />}
                            </span>
                            <span className="whitespace-nowrap font-mono text-[19px] font-semibold leading-tight tabular-nums transition-colors duration-300" style={{ color }}>
                                {row.value}
                                <span className="ml-1 text-[14px] font-normal text-gray-300">{row.unit}</span>
                            </span>
                        </span>
                        <span className="relative h-[6px] overflow-hidden rounded-full bg-white/10">
                            <span className="absolute inset-y-0 left-0 rounded-full transition-colors duration-300"
                                style={{ background: color, width: `${row.fill * 100}%` }} />
                            <span className="absolute inset-y-0 w-[2px] bg-white/70" style={{ left: `${row.mark * 100}%` }} />
                        </span>
                        <span className="flex min-h-[19px] items-center justify-between gap-2">
                            <span className="font-mono text-[14px] text-gray-400">{row.ref}</span>
                            <DeltaChip row={row} />
                        </span>
                    </button>
                );
            })}
        </div>
    );
};
