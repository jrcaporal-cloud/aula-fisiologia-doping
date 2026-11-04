import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { TimeRef } from '../receptor/types';
import { BLOOD, PW, pp } from './layout';
import { PC } from './ligands';

/* Destino do GH na etapa 7 (sangue → fígado → IGF-1), com o traçado de pulsos, ancorado na cena. */

const BOX = 'rgba(5,5,16,0.88)';

/** Traçado esquemático de pulsos (sem escala de tempo). */
const PULSES = 'M0 26 L14 26 L19 6 L24 26 L44 26 L49 10 L54 26 L74 26 L79 4 L84 26 L104 26 L109 12 L114 26 L130 26';

export const BloodTag = ({ timeRef }: { timeRef: TimeRef }) => {
    const root = useRef<HTMLDivElement>(null);
    useFrame(() => {
        const o = pp(timeRef.current.t, [PW.toBlood[0] + 0.1, PW.toBlood[0] + 0.45]);
        if (root.current) {
            root.current.style.opacity = String(o);
            root.current.style.visibility = o > 0.01 ? 'visible' : 'hidden';
        }
    });
    return (
        <group position={BLOOD}>
            <Html center zIndexRange={[40, 10]} style={{ pointerEvents: 'none' }}>
                <div ref={root} className="whitespace-nowrap rounded-lg px-3.5 py-2 font-body" style={{ background: BOX, border: `1px solid ${PC.crimson}88`, borderLeft: `3px solid ${PC.crimson}`, opacity: 0, visibility: 'hidden', transform: 'translateY(-46px)' }}>
                    <div className="text-[17px] font-semibold text-white">GH → sangue → fígado → IGF-1</div>
                    <div className="flex items-center gap-2 mt-1">
                        <svg width={130} height={30} aria-hidden>
                            <path d={PULSES} fill="none" stroke={PC.crimson} strokeWidth={2} strokeLinejoin="round" />
                        </svg>
                        <span className="text-[14px] text-gray-300">secreção em pulsos</span>
                    </div>
                </div>
            </Html>
        </group>
    );
};
