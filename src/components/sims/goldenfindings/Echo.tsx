import type { EchoId } from './content';
import { DoseEcho } from './DoseEcho';
import { ShelfEcho } from './ShelfEcho';
import { StackEcho } from './StackEcho';
import { TransfusionEcho } from './TransfusionEcho';
import { UgtEcho } from './UgtEcho';

interface EchoSwitchProps {
    readonly id: EchoId;
    readonly compact: boolean;
}

/** Desenho-eco de cada achado (mesma linguagem visual do simulador de origem). */
export const Echo = ({ id, compact }: EchoSwitchProps) => {
    switch (id) {
        case 'dose': return <DoseEcho compact={compact} />;
        case 'stack': return <StackEcho compact={compact} />;
        case 'transfusion': return <TransfusionEcho compact={compact} />;
        case 'shelf': return <ShelfEcho compact={compact} />;
        case 'ugt': return <UgtEcho compact={compact} />;
    }
};
