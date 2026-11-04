import { useCallback, useEffect, useRef } from 'react';
import { CC } from './colors';
import type { CardioStateRef } from './flow';
import { E_LINHA_REF } from './params';
import { PressureTrace } from './PressureTrace';

/*
 * Painel hemodinâmico: os números que respondem "o que acontece com a dinâmica circulatória".
 * Fica numa faixa no rodapé da cena (a área livre em todas as etapas) e lê o mesmo estado da cena
 * por quadro, escrevendo no DOM direto, sem re-render do React. A pressão arterial leva ao lado a
 * onda de pressão rolando, no ritmo do coração 3D, com a fase (sístole × diástole) embaixo do número.
 */

type State = CardioStateRef['current'];

interface Row {
    key: string;
    label: string;
    unit: string;
    read: (s: State) => string;
    /** 0 = dentro do esperado, 1 = alterado, 2 = no limiar em que se interveria. */
    flag: (s: State) => 0 | 1 | 2;
}

const PA: Row = {
    key: 'pa', label: 'Pressão arterial', unit: 'mmHg',
    read: s => `${Math.round(s.p.v.paSist)}/${Math.round(s.p.v.paDiast)}`,
    flag: s => (s.p.v.paSist >= 140 || s.p.v.paDiast >= 90 ? 2 : s.p.v.paSist >= 130 ? 1 : 0),
};

const OTHERS: Row[] = [
    {
        key: 'fe', label: 'Fração de ejeção', unit: '%',
        read: s => `${Math.round(s.p.v.fe)}`,
        flag: s => (s.p.v.fe < 53 ? 2 : s.p.v.fe < 55 ? 1 : 0),
    },
    {
        key: 'el', label: 'E′ tecidual', unit: 'cm/s',
        read: s => s.p.v.eLinha.toFixed(1),
        flag: s => (s.p.v.eLinha < 9.5 ? 2 : s.p.v.eLinha < E_LINHA_REF ? 1 : 0),
    },
    {
        key: 'hc', label: 'Hematócrito', unit: '%',
        read: s => `${Math.round(s.p.v.hct)}`,
        flag: s => (s.p.v.hct >= 54 ? 2 : s.p.v.hct >= 50 ? 1 : 0),
    },
    {
        key: 'vi', label: 'Viscosidade', unit: '× plasma',
        read: s => s.p.v.viscosidade.toFixed(2),
        flag: s => (s.p.v.viscosidade >= 1.3 ? 2 : s.p.v.viscosidade >= 1.1 ? 1 : 0),
    },
];

const ROWS: Row[] = [PA, ...OTHERS];
const FLAG_COLOR = ['#E2E8F0', '#FBBF24', CC.crimson] as const;

type Register = (key: string, el: HTMLSpanElement | null) => void;

const Value = ({ row, register }: { row: Row; register: Register }) => (
    <p className="flex items-baseline gap-1 leading-tight whitespace-nowrap">
        <span ref={el => register(row.key, el)} className="text-[19px] font-mono font-semibold text-gray-100 tabular-nums">—</span>
        <span className="text-[14px] text-gray-500">{row.unit}</span>
    </p>
);

export const CardioHud = ({ stateRef }: { stateRef: CardioStateRef }) => {
    const vals = useRef<Record<string, HTMLSpanElement | null>>({});
    const phaseName = useRef<HTMLSpanElement>(null);
    const dot = useRef<HTMLSpanElement>(null);
    const register = useCallback<Register>((key, el) => { vals.current[key] = el; }, []);

    useEffect(() => {
        let raf = 0;
        const last: Record<string, string> = {};
        const tick = () => {
            raf = requestAnimationFrame(tick);
            const s = stateRef.current;
            ROWS.forEach(r => {
                const el = vals.current[r.key];
                if (!el) return;
                const txt = r.read(s);
                if (last[r.key] === txt) return;
                last[r.key] = txt;
                el.textContent = txt;
                el.style.color = FLAG_COLOR[r.flag(s)];
            });
            const sys = s.cy.systole;
            if (phaseName.current && last.phase !== String(sys)) {
                last.phase = String(sys);
                phaseName.current.textContent = sys ? 'sístole' : 'diástole';
                phaseName.current.style.color = sys ? CC.crimson : '#93C5FD';
            }
            if (dot.current) {
                const k = sys ? 1 : 0.3 + s.cy.inflow * 0.5;
                dot.current.style.transform = `scale(${0.65 + k * 0.55})`;
                dot.current.style.background = sys ? CC.crimson : '#60A5FA';
            }
        };
        tick();
        return () => cancelAnimationFrame(raf);
    }, [stateRef]);

    return (
        <div
            className="absolute left-4 right-4 bottom-[100px] rounded-xl px-3 py-2 flex items-stretch gap-1.5 font-body pointer-events-none"
            style={{ background: 'rgba(6,4,12,0.9)', border: `1px solid ${CC.crimson}4d` }}
            role="group"
            aria-label="Hemodinâmica"
        >
            <div className="shrink-0 rounded-lg px-2 py-1.5 bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
                <div className="min-w-0">
                    <p className="text-[14px] text-gray-400 leading-tight whitespace-nowrap">{PA.label}</p>
                    <Value row={PA} register={register} />
                    <span className="flex items-center gap-1.5 leading-tight">
                        <span ref={dot} className="w-2.5 h-2.5 rounded-full" style={{ background: CC.crimson }} />
                        <span ref={phaseName} className="text-[14px] font-mono" style={{ color: CC.crimson }}>sístole</span>
                    </span>
                </div>
                <PressureTrace stateRef={stateRef} />
            </div>
            {OTHERS.map(r => (
                <div key={r.key} className="flex-1 min-w-0 rounded-lg px-2 py-1.5 bg-white/[0.04] border border-white/10 flex flex-col justify-between">
                    <p className="text-[14px] text-gray-400 leading-tight">{r.label}</p>
                    <Value row={r} register={register} />
                </div>
            ))}
        </div>
    );
};
