import type { ReactNode } from 'react';

/** Coordenadas do corte da célula (viewBox 680×390, 1 unidade ≈ 1 px no palco de 1280). */
export const VIEW_W = 680;
export const VIEW_H = 390;
export const MEM_TOP = 60;
export const MEM_BOT = 88;
export const NUCLEUS = { cx: 175, cy: 308, rx: 152, ry: 70 } as const;
export const PORE = { x: 175, y: NUCLEUS.cy - NUCLEUS.ry } as const;
export const DNA_Y = 322;
export const ARE_X = [152, 198] as const;
export const GPCR_X = 410;
export const CHANNEL_X = 600;

export const EASE = [0.45, 0, 0.2, 1] as const;
export const LABEL = '#CBD5E1';
export const EAA_COLOR = '#FBBF24';
export const CORTISOL_COLOR = '#10B981';
export const CA_COLOR = '#22D3EE';
export const SRC_COLOR = '#A855F7';
export const MRNA_COLOR = '#F0ABFC';

const SQ3 = Math.sqrt(3);

/** Hexágono de vértice para cima (lado `s`) centrado em (x, y). */
const hex = (x: number, y: number, s: number) =>
    [-90, -30, 30, 90, 150, 210]
        .map(a => {
            const r = (a * Math.PI) / 180;
            return `${(x + s * Math.cos(r)).toFixed(2)},${(y + s * Math.sin(r)).toFixed(2)}`;
        })
        .join(' ');

/** Esqueleto esteroide estilizado: anéis A, B, C (hexágonos) + D (pentágono), centrado na origem. */
const steroidRings = (s: number) => {
    const a = { x: 0, y: 0 };
    const b = { x: s * SQ3, y: 0 };
    const c = { x: b.x + (s * SQ3) / 2, y: -1.5 * s };
    const x0 = c.x + (s * SQ3) / 2;
    const d = [
        [x0, c.y - s / 2],
        [x0 + 0.951 * s, c.y - 0.809 * s],
        [x0 + 1.539 * s, c.y],
        [x0 + 0.951 * s, c.y + 0.809 * s],
        [x0, c.y + s / 2],
    ];
    // Recentra o desenho (largura ≈ x0 + 1,54 s + s√3/2, altura ≈ 2,5 s).
    const ox = (x0 + 1.539 * s - (s * SQ3) / 2) / 2;
    const oy = -0.75 * s;
    return {
        hexes: [a, b, c].map(p => hex(p.x - ox, p.y - oy, s)),
        pent: d.map(([x, y]) => `${(x - ox).toFixed(2)},${(y - oy).toFixed(2)}`).join(' '),
    };
};

interface SteroidProps {
    s?: number;
    color?: string;
}

export const Steroid = ({ s = 5, color = EAA_COLOR }: SteroidProps) => {
    const { hexes, pent } = steroidRings(s);
    return (
        <g stroke={color} strokeWidth={1.7} strokeLinejoin="round" fill={`${color}2e`}>
            {hexes.map(p => (
                <polygon key={p} points={p} />
            ))}
            <polygon points={pent} />
        </g>
    );
};

/** Receptor em forma de "concha" que recebe o esteroide por cima. */
export const Receptor = ({ color }: { color: string }) => (
    <path
        d="M -20,-6 A 20 18 0 0 0 20,-6 L 13,-6 A 13 11 0 0 1 -13,-6 Z"
        fill={`${color}55`}
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
    />
);

interface PillProps {
    x: number;
    y: number;
    w: number;
    color: string;
    children: ReactNode;
    fontSize?: number;
}

/** Etiqueta arredondada (proteína/cascata) com texto centralizado. */
export const Pill = ({ x, y, w, color, children, fontSize = 13 }: PillProps) => (
    <g>
        <rect x={x - w / 2} y={y - 12} width={w} height={24} rx={12} fill={`${color}33`} stroke={color} strokeWidth={1.4} />
        <text x={x} y={y + 4.5} textAnchor="middle" fontSize={fontSize} fill="#F8FAFC" className="font-mono" fontWeight={600}>
            {children}
        </text>
    </g>
);

interface LabelProps {
    x: number;
    y: number;
    children: ReactNode;
    anchor?: 'start' | 'middle' | 'end';
    color?: string;
    size?: number;
    weight?: number;
}

export const Label = ({ x, y, children, anchor = 'start', color = LABEL, size = 13, weight = 500 }: LabelProps) => (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fill={color} fontWeight={weight} className="font-mono">
        {children}
    </text>
);
