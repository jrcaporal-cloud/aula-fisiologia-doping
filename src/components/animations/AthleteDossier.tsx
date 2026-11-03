import { useState } from 'react';
import { useSlideSteps } from '../../store/useSlideSteps';
import { CaseFile } from './dossier/CaseFile';
import { CASES } from './dossier/cases';
import type { SectionTab } from './dossier/layout';
import { Timeline } from './dossier/Timeline';

/**
 * "O Dossiê Antidoping" (parsedPresentation.json, id 29): um arquivo de fichas.
 * Em cima, a linha do tempo com os casos nos anos do próprio componente; embaixo, a ficha
 * grande do caso aberto. Cada passo do passador abre o caso seguinte (ordem cronológica);
 * clicar numa ficha da linha do tempo abre direto. As abas da ficha mostram o restante do texto.
 */

interface Selection {
    readonly step: number;
    readonly tab: SectionTab['key'];
}

export const AthleteDossier = () => {
    const { step, setStep } = useSlideSteps(CASES.length);
    const [selection, setSelection] = useState<Selection>({ step, tab: 'ficha' });
    // Trocar de caso volta para a aba "Ficha".
    const tab = selection.step === step ? selection.tab : 'ficha';

    return (
        <div className="not-prose flex w-full select-none flex-col gap-2 font-body text-white pointer-events-auto" style={{ height: 520 }}>
            <div className="shrink-0 rounded-2xl border border-white/10 px-3 pb-1.5 pt-2" style={{ background: 'rgba(8,8,18,0.72)' }}>
                <Timeline active={step} onSelect={setStep} />
            </div>
            <div className="min-h-0 flex-1">
                <CaseFile
                    item={CASES[step]} index={step} total={CASES.length}
                    tab={tab} onTab={t => setSelection({ step, tab: t })}
                />
            </div>
        </div>
    );
};
