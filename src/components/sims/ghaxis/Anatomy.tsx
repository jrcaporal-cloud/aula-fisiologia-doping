import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode, Ref } from 'react';
import { BUBBLE } from './flow';

/** Desenhos estáticos do eixo: silhueta, lupa do encéfalo, fígado, músculo e seringa. */

const SKIN = '#111a2e';
const SKIN_EDGE = 'rgba(148,163,184,0.38)';

/** Partes da silhueta (frente). Desenhadas duas vezes: contorno largo embaixo, preenchimento em cima → contorno unido. */
const BodyParts = () => (
    <>
        <ellipse cx={128} cy={56} rx={29} ry={35} />
        <rect x={116} y={82} width={24} height={36} rx={8} />
        <path d="M78,124 Q128,112 178,124 Q192,128 189,152 L177,250 Q174,288 177,306 L79,306 Q82,288 79,250 L67,152 Q64,128 78,124 Z" />
        <rect x={53} y={126} width={22} height={168} rx={11} transform="rotate(7 64 126)" />
        <rect x={181} y={126} width={22} height={168} rx={11} transform="rotate(-7 192 126)" />
        <rect x={84} y={288} width={41} height={190} rx={18} />
        <rect x={131} y={288} width={41} height={190} rx={18} />
    </>
);

export const Body = () => (
    <g>
        <g fill={SKIN_EDGE} stroke={SKIN_EDGE} strokeWidth={3}><BodyParts /></g>
        <g fill={SKIN}><BodyParts /></g>
        {/* costelas, sutis, para situar o fígado */}
        <g fill="none" stroke="rgba(148,163,184,0.12)" strokeWidth={1.5}>
            <path d="M92,170 Q128,186 164,170" />
            <path d="M90,184 Q128,201 166,184" />
            <path d="M90,198 Q128,215 166,198" />
        </g>
    </g>
);

/** Cone de ampliação: da cabeça até a lupa. */
export const ZoomCone = () => (
    <g>
        <defs>
            <linearGradient id="gh-cone" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity={0.02} />
            </linearGradient>
        </defs>
        <path d="M140,62 L308.7,22.1 L243.9,193.2 Z" fill="url(#gh-cone)" />
        <line x1={140} y1={62} x2={308.7} y2={22.1} stroke="rgba(147,197,253,0.35)" strokeDasharray="3 4" />
        <line x1={140} y1={62} x2={243.9} y2={193.2} stroke="rgba(147,197,253,0.35)" strokeDasharray="3 4" />
        <circle cx={132} cy={64} r={12} fill="none" stroke="rgba(147,197,253,0.7)" strokeWidth={1.4} />
    </g>
);

const GYRI = [
    'M268,100 C 276,84 292,78 300,88',
    'M300,66 C 316,60 330,66 334,78',
    'M344,62 C 360,62 372,72 372,84',
    'M380,84 C 392,92 396,104 390,116',
    'M262,124 C 270,114 284,114 290,122',
    'M316,90 C 326,84 340,88 344,98',
    'M352,100 C 362,96 372,102 374,112',
    'M286,104 C 296,100 306,104 308,112',
];

/** Corte sagital ampliado (de frente para a direita): cérebro, cerebelo, tronco, sela turca. */
export const BrainBubble = ({ children }: { children?: ReactNode }) => (
    <g>
        <defs>
            <clipPath id="gh-bubble-clip"><circle cx={BUBBLE.cx} cy={BUBBLE.cy} r={BUBBLE.r - 1} /></clipPath>
            <radialGradient id="gh-bubble-bg" cx="50%" cy="40%" r="65%">
                <stop offset="0%" stopColor="#14203a" />
                <stop offset="100%" stopColor="#070b18" />
            </radialGradient>
            <radialGradient id="gh-brain" cx="45%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#3b4a6b" />
                <stop offset="100%" stopColor="#222c45" />
            </radialGradient>
        </defs>
        <circle cx={BUBBLE.cx} cy={BUBBLE.cy} r={BUBBLE.r} fill="url(#gh-bubble-bg)" />
        <g clipPath="url(#gh-bubble-clip)">
            {/* tronco encefálico */}
            <path d="M300,150 C 304,176 300,206 292,240 L314,240 C 318,206 322,178 322,152 Z" fill="#26324d" stroke="rgba(148,163,184,0.35)" />
            {/* cerebelo */}
            <ellipse cx={278} cy={166} rx={27} ry={18} fill="#2a3552" stroke="rgba(148,163,184,0.4)" />
            <g fill="none" stroke="rgba(148,163,184,0.28)" strokeWidth={1.2}>
                <path d="M256,162 Q278,154 300,162" /><path d="M258,170 Q278,163 299,170" /><path d="M262,178 Q278,172 294,178" />
            </g>
            {/* cérebro */}
            <path d="M252,124 C 244,82 284,52 328,52 C 372,52 404,78 404,110 C 404,134 392,148 374,154 C 360,158 350,154 340,154 C 322,156 304,156 290,154 C 268,150 256,142 252,124 Z"
                fill="url(#gh-brain)" stroke="rgba(148,163,184,0.5)" strokeWidth={1.4} />
            <g fill="none" stroke="rgba(203,213,225,0.22)" strokeWidth={1.6} strokeLinecap="round">
                {GYRI.map(d => <path key={d} d={d} />)}
            </g>
            {/* corpo caloso */}
            <path d="M290,128 C 304,110 346,108 366,126" fill="none" stroke="rgba(226,232,240,0.35)" strokeWidth={4} strokeLinecap="round" />
            {/* sela turca (osso esfenoide) */}
            <path d="M326,200 Q350,222 374,200" fill="none" stroke="rgba(226,232,240,0.45)" strokeWidth={3} strokeLinecap="round" />
            {children}
        </g>
        <circle cx={BUBBLE.cx} cy={BUBBLE.cy} r={BUBBLE.r} fill="none" stroke="rgba(147,197,253,0.55)" strokeWidth={1.6} />
    </g>
);

export const Hypothalamus = ({ color }: { color: string }) => (
    <g>
        <ellipse cx={340} cy={159} rx={16} ry={9.5} fill={color} fillOpacity={0.85} stroke="#DBEAFE" strokeWidth={1.2} />
    </g>
);

export const Pituitary = ({ color }: { color: string }) => (
    <g>
        <path d="M341,166 C 343,174 345,180 348,186" fill="none" stroke={color} strokeWidth={3.2} strokeLinecap="round" />
        <ellipse cx={351} cy={194} rx={14.5} ry={9.5} fill={color} fillOpacity={0.9} stroke="#D1FAE5" strokeWidth={1.2} />
    </g>
);

export const Liver = () => (
    <g>
        <defs>
            <linearGradient id="gh-liver" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#c2413a" />
                <stop offset="100%" stopColor="#6b1420" />
            </linearGradient>
        </defs>
        <path d="M88,214 C 92,196 132,194 162,203 C 175,207 173,219 162,225 C 142,237 112,247 96,241 C 85,236 83,225 88,214 Z"
            fill="url(#gh-liver)" stroke="#fca5a5" strokeOpacity={0.55} strokeWidth={1.2} />
        <path d="M124,201 C 126,214 130,226 136,236" fill="none" stroke="rgba(254,202,202,0.35)" strokeWidth={1.4} />
        <path d="M98,214 C 104,208 114,206 120,208" fill="none" stroke="rgba(254,226,226,0.35)" strokeWidth={2.4} strokeLinecap="round" />
    </g>
);

const STRIATIONS = [334, 346, 358, 370, 382, 394, 406, 418];

/** Quadríceps (músculo-alvo) com receptores IGF-1R na superfície. */
export const Muscle = () => (
    <g>
        <defs>
            <linearGradient id="gh-muscle" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#9f1239" />
                <stop offset="55%" stopColor="#e11d48" />
                <stop offset="100%" stopColor="#881337" />
            </linearGradient>
            <clipPath id="gh-muscle-clip"><path d="M152,322 C 172,344 172,402 154,432 C 136,402 134,346 152,322 Z" /></clipPath>
        </defs>
        <path d="M152,322 C 172,344 172,402 154,432 C 136,402 134,346 152,322 Z" fill="url(#gh-muscle)" stroke="#fda4af" strokeOpacity={0.6} strokeWidth={1.2} />
        <g clipPath="url(#gh-muscle-clip)" stroke="rgba(255,228,230,0.32)" strokeWidth={1.1}>
            {STRIATIONS.map(y => <line key={y} x1={130} x2={176} y1={y} y2={y + 6} />)}
        </g>
    </g>
);

/** Receptores em Y ao longo da borda do músculo. */
export const Receptors = ({ color, glowRef }: { color: string; glowRef?: Ref<SVGGElement> }) => {
    const pts = [[144, 352, -50], [141, 372, -75], [143, 392, -100], [164, 352, 50], [166, 372, 75]] as const;
    return (
        <g>
            {pts.map(([x, y, a]) => (
                <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${a})`} stroke={color} strokeWidth={1.6} strokeLinecap="round" fill="none">
                    <path d="M0,0 L0,-6 M0,-6 L-3,-10 M0,-6 L3,-10" />
                </g>
            ))}
            <g ref={glowRef} opacity={0}>
                <ellipse cx={153} cy={376} rx={30} ry={58} fill={color} fillOpacity={0.22} filter="url(#gh-soft)" />
            </g>
        </g>
    );
};

interface SyringeProps {
    x: number;
    y: number;
    angle: number;
    color: string;
    scale?: number;
}

/** Seringa desenhada com a ponta da agulha em (x, y); o êmbolo pressiona em laço. */
export const Syringe = ({ x, y, angle, color, scale = 1 }: SyringeProps) => {
    const still = useReducedMotion();
    return (
        <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale})`}>
            <line x1={-16} y1={0} x2={0} y2={0} stroke="#E5E7EB" strokeWidth={1.6} strokeLinecap="round" />
            <rect x={-20} y={-3} width={5} height={6} rx={1} fill="#9CA3AF" />
            <rect x={-62} y={-8} width={42} height={16} rx={3} fill="rgba(226,232,240,0.10)" stroke="#E5E7EB" strokeWidth={1.4} />
            <motion.rect
                y={-6} height={12} rx={2} fill={color} fillOpacity={0.85}
                initial={{ x: -48, width: 27 }}
                animate={still ? { x: -48, width: 27 } : { x: [-58, -40, -58], width: [37, 19, 37] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            />
            {[-52, -44, -36, -28].map(t => <line key={t} x1={t} x2={t} y1={-8} y2={-4} stroke="#E5E7EB" strokeWidth={1} />)}
            <rect x={-65} y={-12} width={3} height={24} rx={1} fill="#CBD5E1" />
            <motion.g
                initial={{ x: 0 }}
                animate={still ? { x: 0 } : { x: [0, 18, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            >
                <rect x={-86} y={-2} width={28} height={4} fill="#CBD5E1" />
                <rect x={-90} y={-9} width={4} height={18} rx={1.5} fill="#E5E7EB" />
            </motion.g>
        </g>
    );
};
