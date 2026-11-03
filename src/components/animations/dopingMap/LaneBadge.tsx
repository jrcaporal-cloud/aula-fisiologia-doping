import { CircleCheck, CircleDashed, CircleX } from 'lucide-react';
import type { LaneId } from './data';

const ICONS = { detectavel: CircleCheck, quase: CircleDashed, indetectavel: CircleX } as const;

interface LaneIconProps {
    lane: LaneId;
    color: string;
    size?: number;
}

/** Ícone da faixa (✓ detectável · ◌ quase · ✕ não detectável): a forma carrega o sentido, não só a cor. */
export const LaneIcon = ({ lane, color, size = 20 }: LaneIconProps) => {
    const Icon = ICONS[lane];
    return <Icon size={size} strokeWidth={2.4} color={color} aria-hidden className="flex-shrink-0" />;
};
