import { useCallback, useEffect, useRef } from 'react';
import { IllustrativeTag } from '../../deck/IllustrativeTag';
import type { CardioStateRef } from './flow';
import { E_LINHA_REF } from './params';
import { seriesIndex, type Series, type SeriesKey } from './series';

/*
 * Monitor hemodinâmico: os números da ficha ao vivo (cartões) e três séries rolando no tempo — pressão
 * arterial, volume do VE e velocidade do sangue na placa —, cada uma com o coração treinado tracejado
 * por trás, no mesmo instante. Tudo escrito direto no DOM e no canvas por rAF (zero re-render).
 * Os números vêm da ficha (cardioSteps.ts); o formato das curvas entre eles é modelo didático.
 */

type State = CardioStateRef['current'];

interface Card {
    key: string;
    label: string;
    unit: string;
    read: (s: State) => string;
    /** 0 = dentro do esperado, 1 = alterado, 2 = no limiar em que se interviria. */
    flag: (s: State) => 0 | 1 | 2;
}

const pt = (v: number, d: number) => v.toFixed(d).replace('.', ',');

const CARDS: readonly Card[] = [
    {
        key: 'pa', label: 'Pressão arterial', unit: 'mmHg',
        read: s => `${Math.round(s.p.v.paSist)}/${Math.round(s.p.v.paDiast)}`,
        flag: s => (s.p.v.paSist >= 140 || s.p.v.paDiast >= 90 ? 2 : s.p.v.paSist >= 130 ? 1 : 0),
    },
    {
        key: 'pd', label: 'Parede do VE', unit: 'mm',
        read: s => pt(s.p.v.paredeMm, 1),
        flag: s => (s.p.v.paredeMm >= 13 ? 2 : s.p.v.paredeMm > 11.5 ? 1 : 0),
    },
    {
        key: 'fe', label: 'Fração de ejeção', unit: '%',
        read: s => `${Math.round(s.p.v.fe)}`,
        flag: s => (s.p.v.fe < 53 ? 2 : s.p.v.fe < 55 ? 1 : 0),
    },
    {
        key: 'el', label: 'E′ tecidual', unit: 'cm/s',
        read: s => pt(s.p.v.eLinha, 1),
        flag: s => (s.p.v.eLinha < 9.5 ? 2 : s.p.v.eLinha < E_LINHA_REF ? 1 : 0),
    },
    {
        key: 'hc', label: 'Hematócrito', unit: '%',
        read: s => `${Math.round(s.p.v.hct)}`,
        flag: s => (s.p.v.hct >= 54 ? 2 : s.p.v.hct >= 50 ? 1 : 0),
    },
    {
        key: 'vi', label: 'Viscosidade', unit: '× plasma',
        read: s => pt(s.p.v.viscosidade, 2),
        flag: s => (s.p.v.viscosidade >= 1.3 ? 2 : s.p.v.viscosidade >= 1.1 ? 1 : 0),
    },
];

const FLAG_COLOR = ['#F3F4F6', '#FBBF24', '#FB7185'] as const;

// ------------------------------------------------------------------ séries

/** Janela mostrada (s). */
const WINDOW_S = 6;
const LANE_H = 44;
const LANES = 3;
export const SERIES_H = LANE_H * LANES;
const REF_COLOR = 'rgba(125,211,252,0.75)';

interface Lane {
    key: SeriesKey;
    ref: SeriesKey;
    label: string;
    color: string;
    /** Faixa fixa (mmHg, volume) ou automática (velocidade). */
    range: [number, number] | null;
    /** Linhas de referência com rótulo. */
    marks: readonly { v: number; text: string; color: string }[];
}

const LANE_DEFS: readonly Lane[] = [
    { key: 'pa', ref: 'paRef', label: 'Pressão arterial', color: '#FB7185', range: [55, 170], marks: [{ v: 130, text: '130', color: '#FBBF24' }] },
    { key: 'vol', ref: 'volRef', label: 'Volume do VE', color: '#F43F5E', range: [0, 118], marks: [{ v: 100, text: 'treinado = 100', color: 'rgba(125,211,252,0.8)' }] },
    { key: 'vel', ref: 'velRef', label: 'Velocidade na placa', color: '#FBBF24', range: null, marks: [] },
];

interface Canvas2D { ctx: CanvasRenderingContext2D; w: number; h: number }

const setup = (cv: HTMLCanvasElement, w: number, h: number): Canvas2D | null => {
    const ctx = cv.getContext('2d');
    if (!ctx) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
};

/** Faixa automática da velocidade, suavizada para não pular a cada batimento. */
const autoRange = { hi: 20 };

const drawLane = (c: Canvas2D, s: Series, lane: Lane, li: number) => {
    const { ctx, w } = c;
    const top = li * LANE_H;
    const pad = 6;
    const now = s.count ? s.t[seriesIndex(s, s.count - 1)] : 0;
    let lo = 0;
    let hi = 1;
    if (lane.range) [lo, hi] = lane.range;
    else {
        let m = 0;
        for (let i = 0; i < s.count; i++) {
            const k = seriesIndex(s, i);
            if (now - s.t[k] > WINDOW_S) continue;
            m = Math.max(m, s.v[lane.key][k], s.v[lane.ref][k]);
        }
        autoRange.hi += (Math.max(m * 1.15, 8) - autoRange.hi) * 0.06;
        hi = autoRange.hi;
    }
    const y = (v: number) => top + LANE_H - pad - ((v - lo) / (hi - lo)) * (LANE_H - pad * 2);
    const x = (t: number) => w - 10 - ((now - t) / WINDOW_S) * (w - 10);

    if (li > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, top + 0.5);
        ctx.lineTo(w, top + 0.5);
        ctx.stroke();
    }
    for (const m of lane.marks) {
        const yy = Math.round(y(m.v)) + 0.5;
        ctx.setLineDash([3, 4]);
        ctx.strokeStyle = m.color;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.moveTo(0, yy);
        ctx.lineTo(w, yy);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.setLineDash([]);
    }

    const trace = (key: SeriesKey, color: string, dashed: boolean, width: number) => {
        ctx.beginPath();
        let started = false;
        for (let i = 0; i < s.count; i++) {
            const k = seriesIndex(s, i);
            if (now - s.t[k] > WINDOW_S) continue;
            const px = x(s.t[k]);
            const py = y(s.v[key][k]);
            if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
        }
        ctx.setLineDash(dashed ? [5, 4] : []);
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineJoin = 'round';
        ctx.stroke();
        ctx.setLineDash([]);
    };
    trace(lane.ref, REF_COLOR, true, 1.6);
    trace(lane.key, lane.color, false, 2.2);
    if (s.count) {
        const k = seriesIndex(s, s.count - 1);
        ctx.fillStyle = lane.color;
        ctx.beginPath();
        ctx.arc(x(s.t[k]), y(s.v[lane.key][k]), 3.2, 0, Math.PI * 2);
        ctx.fill();
    }

    // rótulo da faixa (14 px) sobre um fundo para não brigar com o traço
    ctx.font = '600 14px Satoshi, system-ui, sans-serif';
    const tw = ctx.measureText(lane.label).width;
    ctx.fillStyle = 'rgba(8,6,12,0.78)';
    ctx.fillRect(4, top + 3, tw + 10, 18);
    ctx.fillStyle = lane.color;
    ctx.fillText(lane.label, 9, top + 17);
    for (const m of lane.marks) {
        ctx.font = '500 14px "JetBrains Mono", ui-monospace, monospace';
        const mw = ctx.measureText(m.text).width;
        const yy = y(m.v);
        ctx.fillStyle = 'rgba(8,6,12,0.78)';
        ctx.fillRect(w - mw - 14, yy - 9, mw + 8, 17);
        ctx.fillStyle = m.color;
        ctx.fillText(m.text, w - mw - 10, yy + 5);
    }
};

interface MonitorProps {
    stateRef: CardioStateRef;
    series: Series;
    /** Distância do rodapé da área da cena (a linha de etapas ocupa o rodapé no roteiro). */
    bottom: number;
    /** Roteiro: só a fileira de números (a cena precisa da altura); laboratório: números + séries. */
    compact: boolean;
}

export const Monitor = ({ stateRef, series, bottom, compact }: MonitorProps) => {
    const vals = useRef<Record<string, HTMLSpanElement | null>>({});
    const canvas = useRef<HTMLCanvasElement>(null);
    const box = useRef<HTMLDivElement>(null);
    const register = useCallback((key: string, el: HTMLSpanElement | null) => { vals.current[key] = el; }, []);

    useEffect(() => {
        const cv = canvas.current;
        const holder = box.current;
        let c2d: Canvas2D | null = null;
        const fit = () => { if (cv && holder) c2d = setup(cv, Math.max(holder.clientWidth, 120), SERIES_H); };
        fit();
        const ro = new ResizeObserver(fit);
        if (holder) ro.observe(holder);
        let raf = 0;
        const last: Record<string, string> = {};
        const tick = () => {
            raf = requestAnimationFrame(tick);
            const s = stateRef.current;
            for (const card of CARDS) {
                const el = vals.current[card.key];
                if (!el) continue;
                const txt = card.read(s);
                if (last[card.key] === txt) continue;
                last[card.key] = txt;
                el.textContent = txt;
                el.style.color = FLAG_COLOR[card.flag(s)];
            }
            if (!c2d) return;
            c2d.ctx.clearRect(0, 0, c2d.w, c2d.h);
            LANE_DEFS.forEach((lane, i) => drawLane(c2d as Canvas2D, series, lane, i));
        };
        tick();
        return () => { cancelAnimationFrame(raf); ro.disconnect(); };
    }, [stateRef, series, compact]);

    return (
        <div
            className="absolute left-4 right-4 z-[46] rounded-2xl p-2.5 flex items-stretch gap-2.5 font-body pointer-events-none"
            style={{ bottom, background: 'rgba(8,6,12,0.88)', border: '1px solid rgba(251,113,133,0.22)' }}
            role="group"
            aria-label="Monitor hemodinâmico"
        >
            <div className={compact ? 'flex-1 min-w-0 grid grid-cols-6 gap-1.5' : 'shrink-0 grid grid-cols-3 gap-1.5 w-[330px] min-[1180px]:w-[430px]'}>
                {CARDS.map(c => (
                    <div key={c.key} className={`min-w-0 rounded-lg ${compact ? 'px-2' : 'px-2.5'} py-1.5 bg-white/[0.04] border border-white/10`}>
                        <p className="text-[14px] text-gray-400 leading-tight truncate">{c.label}</p>
                        <p className="flex items-baseline gap-1 leading-tight whitespace-nowrap">
                            <span ref={el => register(c.key, el)} className="text-[19px] font-mono font-semibold text-gray-100 tabular-nums">—</span>
                            <span className="text-[14px] text-gray-500">{c.unit}</span>
                        </p>
                    </div>
                ))}
            </div>
            {!compact && <div className="flex-1 min-w-0 flex flex-col gap-1">
                <div ref={box} className="relative w-full rounded-lg bg-black/30 overflow-hidden" style={{ height: SERIES_H }}>
                    <canvas
                        ref={canvas}
                        role="img"
                        aria-label="Séries ao vivo: pressão arterial, volume do ventrículo esquerdo e velocidade do sangue na placa, com o coração treinado tracejado"
                        style={{ width: '100%', height: SERIES_H, display: 'block' }}
                    />
                </div>
            </div>}
            {!compact && <div className="absolute -top-3.5 right-4 flex items-center gap-2">
                <span className="hidden min-[1180px]:inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[14px] font-mono text-sky-200 bg-[#08060c] border border-sky-300/30">
                    <svg width="20" height="6" aria-hidden><line x1="0" y1="3" x2="20" y2="3" stroke="#7DD3FC" strokeWidth="2" strokeDasharray="5 3" /></svg>
                    treinado
                </span>
                <span className="rounded-md bg-[#08060c]"><IllustrativeTag>curvas: modelo didático</IllustrativeTag></span>
            </div>}
        </div>
    );
};
