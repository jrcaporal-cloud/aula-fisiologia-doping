import { useEffect, useRef } from 'react';
import type { PeptideLigand } from '../../../data/peptideSteps';
import { phase } from '../receptor/layout';
import type { TimeRef } from '../receptor/types';
import { bornFraction, extraGtp, nucleotide } from './choreo';
import { sideOf } from './layout';
import { PC, PEPTIDE_LIGANDS } from './ligands';

/*
 * "Escada" de amplificação (etapa 5), sobre a área da cena: cresce junto com as partículas porque lê o
 * mesmo tempo T da coreografia (atualiza o DOM direto, sem re-render do React).
 */

const DOTS = 24;

interface AmplifierHudProps { ligand: PeptideLigand; timeRef: TimeRef }

export const AmplifierHud = ({ ligand, timeRef }: AmplifierHudProps) => {
    const root = useRef<HTMLDivElement>(null);
    const gDots = useRef<(HTMLSpanElement | null)[]>([]);
    const mDots = useRef<(HTMLSpanElement | null)[]>([]);
    const word = useRef<HTMLSpanElement>(null);
    const info = PEPTIDE_LIGANDS[ligand];

    useEffect(() => {
        const s = sideOf(ligand);
        let raf = 0;
        const tick = () => {
            raf = requestAnimationFrame(tick);
            const T = timeRef.current.t;
            const o = phase(T, 4.0, 4.3) * (1 - phase(T, 5.25, 5.6));
            const el = root.current;
            if (el) {
                el.style.opacity = String(o);
                el.style.visibility = o > 0.01 ? 'visible' : 'hidden';
            }
            if (o <= 0.01) return;
            const lit = [nucleotide(s, s, T).gtp, extraGtp(s, s, 0, T), extraGtp(s, s, 1, T)];
            gDots.current.forEach((d, i) => { if (d) d.style.opacity = String(0.2 + 0.8 * lit[i]); });
            const n = Math.round(bornFraction(T) * DOTS);
            mDots.current.forEach((d, i) => { if (d) d.style.opacity = i < n ? '1' : '0.15'; });
            if (word.current) word.current.style.opacity = String(phase(T, 4.6, 4.85));
        };
        tick();
        return () => cancelAnimationFrame(raf);
    }, [ligand, timeRef]);

    const row = 'flex items-center justify-between gap-4';
    return (
        // fica do lado oposto ao receptor ativo (a câmera enquadra o lado ativo)
        <div ref={root} className="absolute bottom-[104px] w-[300px] rounded-xl px-4 py-3 font-body pointer-events-none"
            style={{ ...(ligand === 'ghrp' ? { right: 24 } : { left: 32 }), background: 'rgba(5,5,16,0.88)', border: `1px solid ${info.color}55`, opacity: 0, visibility: 'hidden' }}>
            <p className="text-[14px] font-semibold uppercase tracking-wider mb-2" style={{ color: info.color }}>Amplificação</p>
            <div className="space-y-2 text-[15px] text-gray-100">
                <div className={row}>
                    <span>1 peptídeo · 1 receptor</span>
                    <span className="w-3 h-3 rounded-full" style={{ background: info.color }} />
                </div>
                <div className={row}>
                    <span>várias proteínas {info.gProtein}</span>
                    <span className="flex gap-1.5">
                        {[0, 1, 2].map(i => <span key={i} ref={el => { gDots.current[i] = el; }} className="w-3 h-3 rounded-full" style={{ background: PC.gtp, opacity: 0.2 }} />)}
                    </span>
                </div>
                <div>
                    <span>cada enzima → muitos {info.messenger}</span>
                    <div className="mt-1.5 grid gap-1" style={{ gridTemplateColumns: `repeat(${DOTS / 2}, 1fr)` }}>
                        {Array.from({ length: DOTS }, (_, i) => <span key={i} ref={el => { mDots.current[i] = el; }} className="h-2.5 rounded-full" style={{ background: info.messengerColor, opacity: 0.15 }} />)}
                    </div>
                </div>
                <p className="text-[15px] font-semibold text-white pt-0.5"><span ref={word} style={{ opacity: 0 }}>→ milhares de mensageiros</span></p>
            </div>
        </div>
    );
};
