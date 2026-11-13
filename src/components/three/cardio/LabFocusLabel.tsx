import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { CardioVitals } from '../../../data/cardioSteps';
import { V } from '../receptor/layout';
import type { CardioStateRef } from './flow';
import { W } from './layout';
import { controlDef, type LabKey } from './lab/labModel';
import { useLab } from './lab/labStore';
import { useSelection } from './selection';
import type { StructureId } from './structures';

/*
 * No laboratório, o controle sob o ponteiro (ou sendo arrastado) aponta para o que ele mexe na peça:
 * um único rótulo, ancorado na estrutura, com o valor ao vivo — e a estrutura acende. Nada de
 * rótulos fixos espalhados pela cena.
 */

interface Target {
    at: [number, number, number];
    structure: StructureId;
    title: string;
    read: (v: CardioVitals) => number;
    dx: number;
    dy: number;
}

const p3 = (v: { x: number; y: number; z: number }): [number, number, number] => [v.x, v.y, v.z];

const TARGETS: Record<LabKey, Target> = {
    parede: { at: p3(W(2.65, 0.6, 0.05)), structure: 'miocardio', title: 'Parede do VE', read: v => v.paredeMm, dx: 70, dy: 40 },
    eLinha: { at: p3(W(1.2, 1.5, 0.05)), structure: 'mitral', title: 'Enchimento (E′)', read: v => v.eLinha, dx: 80, dy: -60 },
    paSist: { at: p3(V(-4.2, 7.6, 0)), structure: 'aorta', title: 'Pressão sistólica', read: v => v.paSist, dx: 60, dy: -36 },
    hct: { at: p3(V(5.6, 3.5, 0)), structure: 'hemacia', title: 'Hematócrito', read: v => v.hct, dx: 30, dy: -70 },
    placa: { at: p3(V(3.2, 3.6, 0.1)), structure: 'placa', title: 'Placa', read: v => v.placa, dx: -40, dy: 80 },
};

const COLOR = '#FB7185';

export const LabFocusLabel = ({ stateRef }: { stateRef: CardioStateRef }) => {
    const focus = useLab(s => s.focus);
    const value = useRef<HTMLSpanElement>(null);
    const lastTxt = useRef('');

    // a estrutura que o controle mexe acende (o mesmo destaque do hover na peça)
    useEffect(() => {
        lastTxt.current = '';
        if (!focus) return;
        const sel = useSelection.getState();
        sel.setHover(TARGETS[focus].structure);
        return () => {
            const s = useSelection.getState();
            if (s.hoverId === TARGETS[focus].structure) s.setHover(null);
        };
    }, [focus]);

    useFrame(() => {
        if (!focus || !value.current) return;
        const d = controlDef(focus);
        const txt = `${d.format(TARGETS[focus].read(stateRef.current.p.v))}${d.unit ? ` ${d.unit}` : ''}`;
        if (txt === lastTxt.current) return;
        lastTxt.current = txt;
        value.current.textContent = txt;
    });

    if (!focus) return null;
    const t = TARGETS[focus];
    const left = t.dx < 0;
    return (
        <group position={t.at}>
            <Html zIndexRange={[40, 10]} style={{ pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', left: 0, top: 0 }}>
                    <svg width={1} height={1} style={{ position: 'absolute', overflow: 'visible' }}>
                        <line x1={0} y1={0} x2={t.dx} y2={t.dy} stroke={COLOR} strokeWidth={1.6} />
                        <circle r={4} fill={COLOR} />
                        <circle r={9} fill="none" stroke={COLOR} strokeOpacity={0.5} />
                    </svg>
                    <div
                        className="absolute whitespace-nowrap rounded-lg px-3 py-1.5 font-body"
                        style={{
                            left: t.dx + (left ? -4 : 4),
                            top: t.dy,
                            transform: `translate(${left ? '-100%' : '0'}, -50%)`,
                            background: 'rgba(8,6,12,0.9)',
                            border: `1px solid ${COLOR}66`,
                            borderLeft: left ? undefined : `3px solid ${COLOR}`,
                            borderRight: left ? `3px solid ${COLOR}` : undefined,
                        }}
                    >
                        <div className="text-[14px] text-gray-300 leading-tight">{t.title}</div>
                        <span ref={value} className="text-[19px] font-mono font-semibold text-white tabular-nums">—</span>
                    </div>
                </div>
            </Html>
        </group>
    );
};
