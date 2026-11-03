import { shapeOf, type MarkerShape } from './markerShapes';

/**
 * Marcadores por composto: a identidade não depende só da cor (daltonismo, projetor).
 * Cada composto tem uma forma própria, usada no mapa, nos chips e na régua de meia-vida.
 */

const polygon = (n: number, r: number, rotate = -90, inner?: number): string =>
    Array.from({ length: inner ? n * 2 : n }, (_, i) => {
        const radius = inner && i % 2 === 1 ? r * inner : r;
        const ang = ((rotate + (360 / (inner ? n * 2 : n)) * i) * Math.PI) / 180;
        return `${(radius * Math.cos(ang)).toFixed(2)},${(radius * Math.sin(ang)).toFixed(2)}`;
    }).join(' ');

const crossPoints = (r: number): string => {
    const a = r * 1.15;
    const t = r * 0.42;
    return [[-t, -a], [t, -a], [t, -t], [a, -t], [a, t], [t, t], [t, a], [-t, a], [-t, t], [-a, t], [-a, -t], [-t, -t]]
        .map(p => p.join(',')).join(' ');
};

interface ShapeProps {
    shape: MarkerShape;
    r: number;
    fill: string;
    stroke?: string;
    strokeWidth?: number;
}

/** Forma centrada em (0,0); `r` é o "raio" visual (a área é equivalente entre as formas). */
export const Shape = ({ shape, r, fill, stroke, strokeWidth }: ShapeProps) => {
    const common = { fill, stroke, strokeWidth, strokeLinejoin: 'round' as const };
    switch (shape) {
        case 'square': return <rect x={-r * 0.88} y={-r * 0.88} width={r * 1.76} height={r * 1.76} rx={r * 0.12} {...common} />;
        case 'triangle': return <polygon points={polygon(3, r * 1.28)} {...common} />;
        case 'triangleDown': return <polygon points={polygon(3, r * 1.28, 90)} {...common} />;
        case 'diamond': return <polygon points={polygon(4, r * 1.3)} {...common} />;
        case 'pentagon': return <polygon points={polygon(5, r * 1.14)} {...common} />;
        case 'cross': return <polygon points={crossPoints(r)} {...common} />;
        case 'star': return <polygon points={polygon(5, r * 1.38, -90, 0.5)} {...common} />;
        default: return <circle r={r} {...common} />;
    }
};

/** Ícone inline (HTML) com a forma do composto. */
export const MarkerIcon = ({ id, color, size = 12, dim = false }: { id: string; color: string; size?: number; dim?: boolean }) => (
    <svg width={size} height={size} viewBox="-8 -8 16 16" aria-hidden className="shrink-0" style={{ opacity: dim ? 0.6 : 1 }}>
        <Shape shape={shapeOf(id)} r={5.6} fill={color} />
    </svg>
);
