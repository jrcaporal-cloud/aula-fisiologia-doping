import { Droplets, Syringe, Target, TrendingUp } from 'lucide-react';
import type { DrugIcon, SystemId } from './data';

const hexPoints = (cx: number, cy: number, r: number): string => {
    const dx = 0.866 * r;
    return [
        [cx, cy - r], [cx + dx, cy - r / 2], [cx + dx, cy + r / 2],
        [cx, cy + r], [cx - dx, cy + r / 2], [cx - dx, cy - r / 2],
    ].map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
};

/** Esqueleto esteroide (anéis A, B, C e D): o núcleo comum dos EAA. */
const SteroidIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round">
        <polygon points={hexPoints(5.2, 14.6, 3.4)} />
        <polygon points={hexPoints(11.09, 14.6, 3.4)} />
        <polygon points={hexPoints(14.03, 9.5, 3.4)} />
        <polygon points="16.97,7.8 16.97,11.2 19.9,12.2 21.7,9.5 19.9,6.8" />
    </svg>
);

/** Bolsa de sangue: o próprio sangue guardado e reinfundido. */
const BloodBagIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5V2.5" />
        <path d="M9.5 2.5h5" />
        <rect x="6" y="5" width="12" height="15.5" rx="3" />
        <path d="M6 12.5h12" />
        <path d="M6.6 12.5h10.8v5a2.4 2.4 0 0 1-2.4 2.4H9a2.4 2.4 0 0 1-2.4-2.4z" fill="currentColor" fillOpacity={0.35} stroke="none" />
    </svg>
);

export const DrugGlyph = ({ icon, size = 18 }: { icon: DrugIcon; size?: number }) => {
    switch (icon) {
        case 'steroid': return <SteroidIcon size={size} />;
        case 'bag': return <BloodBagIcon size={size} />;
        case 'target': return <Target size={size} strokeWidth={1.8} />;
        case 'droplets': return <Droplets size={size} strokeWidth={1.8} />;
        case 'growth': return <TrendingUp size={size} strokeWidth={1.9} />;
        case 'syringe': return <Syringe size={size} strokeWidth={1.8} />;
    }
};

/** Contorno do marcador: hexágono (androgênico), círculo (O₂), losango (metabólico). */
export const SystemShape = ({ system, color, size, filled = 0.16 }: { system: SystemId; color: string; size: number; filled?: number }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" className="absolute inset-0" aria-hidden>
        {system === 'androgenico' && (
            <polygon points={hexPoints(20, 20, 18.5)} fill={color} fillOpacity={filled} stroke={color} strokeWidth={1.6} strokeLinejoin="round" />
        )}
        {system === 'oxigenio' && (
            <circle cx={20} cy={20} r={18.2} fill={color} fillOpacity={filled} stroke={color} strokeWidth={1.6} />
        )}
        {system === 'metabolico' && (
            <rect x={7.5} y={7.5} width={25} height={25} rx={4} transform="rotate(45 20 20)" fill={color} fillOpacity={filled} stroke={color} strokeWidth={1.6} />
        )}
    </svg>
);

interface MarkerProps {
    system: SystemId;
    icon: DrugIcon;
    color: string;
    size?: number;
}

/** Marcador do mapa: forma = sistema, ícone = fármaco. */
export const Marker = ({ system, icon, color, size = 40 }: MarkerProps) => (
    <div className="relative flex-shrink-0 flex items-center justify-center" style={{ width: size, height: size, color }}>
        <SystemShape system={system} color={color} size={size} />
        <span className="relative" style={{ color: '#fff' }}>
            <DrugGlyph icon={icon} size={Math.round(size * 0.46)} />
        </span>
    </div>
);
