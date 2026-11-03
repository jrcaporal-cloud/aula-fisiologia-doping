import { motion, useReducedMotion } from 'framer-motion';
import type { VertexId } from './content';

/**
 * Mini-esquemas de cada vértice. Só desenham o que o texto do cartão diz
 * (2,5 nmol/L; picogramas 10⁻¹² g; 2 horas / minutos / transfusão noturna); escalas qualitativas.
 */

const VW = 620;
const VH = 122;
const EASE = [0.16, 1, 0.3, 1] as const;
/** Tamanho dos textos dos esquemas (escala de exibição ≈ 1,0 na largura de desenho 1280). */
const FS = 17;

const Label = ({ x, y, children, color = '#E5E7EB', anchor = 'start', size = FS, weight = 500 }: {
    x: number; y: number; children: React.ReactNode; color?: string; anchor?: 'start' | 'middle' | 'end'; size?: number; weight?: number;
}) => (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color}>{children}</text>
);

/** 01: a supressão atual (2,5 nmol/L) × o que a puberdade deixou nas fibras. */
const TransVisual = ({ reduce }: { reduce: boolean }) => {
    const nuclei = [0, 1, 2, 3, 4, 5, 6, 7];
    return (
        <g>
            <Label x={0} y={16} color="#C4B5FD" weight={700}>supressão farmacológica atual</Label>
            {/* nível de testosterona descendo até o limite */}
            <rect x={0} y={26} width={250} height={22} rx={11} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" />
            <motion.rect x={0} y={26} height={22} rx={11} fill="rgba(168,85,247,0.55)"
                initial={reduce ? false : { width: 240 }} animate={{ width: 64 }} transition={{ duration: 1.6, delay: 0.4, ease: EASE }} />
            <line x1={64} x2={64} y1={20} y2={54} stroke="#fff" strokeWidth={2} />
            <Label x={0} y={74}>testosterona ≤ limite da WADA</Label>
            <Label x={0} y={98} size={20} weight={700} color="#fff">2,5 nmol/L</Label>

            <Label x={290} y={16} color="#C4B5FD" weight={700}>vantagem biológica herdada</Label>
            {/* fibra com mionúcleos que permanecem */}
            <rect x={290} y={26} width={330} height={22} rx={11} fill="rgba(244,114,182,0.12)" stroke="rgba(244,114,182,0.45)" />
            {nuclei.map(i => (
                <motion.ellipse key={i} cx={312 + i * 42} cy={37} rx={7} ry={4.5} fill="#C4B5FD"
                    initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }} />
            ))}
            <Label x={290} y={74}>adição permanente de mionúcleos</Label>
            <Label x={290} y={96} color="#E5E7EB">pelve estreita · maior densidade óssea</Label>
            <Label x={290} y={118} color="#E5E7EB">HVE irreversível</Label>
        </g>
    );
};

const UNITS = ['g', 'mg', 'µg', 'ng', 'pg'] as const;
/** Expoentes em tspan (os caracteres sobrescritos Unicode saem minúsculos no projetor). */
const POWERS = ['0', '−3', '−6', '−9', '−12'] as const;

/** 02: régua de sensibilidade até picogramas. */
const DiliVisual = ({ reduce }: { reduce: boolean }) => {
    const x0 = 30;
    const step = 118;
    const last = x0 + step * (UNITS.length - 1);
    return (
        <g>
            <Label x={0} y={16} color="#FCD34D" weight={700}>sensibilidade da cromatografia de massa</Label>
            <line x1={x0} x2={last} y1={58} y2={58} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
            {UNITS.map((u, i) => (
                <g key={u}>
                    <line x1={x0 + i * step} x2={x0 + i * step} y1={52} y2={64} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                    <Label x={x0 + i * step} y={90} anchor="middle" size={18} weight={700} color={i === 4 ? '#FCD34D' : '#F3F4F6'}>{u}</Label>
                    <text x={x0 + i * step} y={113} textAnchor="middle" fontSize={FS} fill="#E5E7EB">
                        10<tspan dy={-7} fontSize={15}>{POWERS[i]}</tspan>
                    </text>
                </g>
            ))}
            <motion.g initial={reduce ? false : { x: 0 }} animate={{ x: last - x0 }} transition={{ duration: 1.8, delay: 0.3, ease: EASE }}>
                <circle cx={x0} cy={58} r={9} fill="#F59E0B" stroke="#050510" strokeWidth={2} />
                <circle cx={x0} cy={58} r={16} fill="none" stroke="#F59E0B" strokeOpacity={0.5} />
            </motion.g>
            <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9, duration: 0.4 }}>
                <rect x={last - 340} y={24} width={310} height={24} rx={8} fill="rgba(245,158,11,0.22)" stroke="rgba(245,158,11,0.6)" />
                <Label x={last - 185} y={42} anchor="middle" color="#FEF3C7" weight={600}>resíduos de SARMs e Diuréticos</Label>
            </motion.g>
        </g>
    );
};

/** 03: as janelas que o teste não vê. */
const WadaVisual = ({ reduce }: { reduce: boolean }) => {
    const rows = [
        { label: 'peptídeos secretores', detail: 'atuam em minutos', w: 15 },
        { label: 'insulina ultrarrápida', detail: 'sai do soro em 2 horas', w: 80 },
        { label: 'transfusão autóloga noturna', detail: 'o próprio sangue do atleta', w: 0 },
    ];
    return (
        <g>
            <Label x={0} y={16} color="#FDA4AF" weight={700}>“cegueira seletiva”</Label>
            <Label x={VW} y={16} anchor="end" color="#E5E7EB">escala qualitativa</Label>
            {rows.map((r, i) => {
                const y = 46 + i * 32;
                return (
                    <g key={r.label}>
                        <Label x={0} y={y + 6} weight={600} color="#fff">{r.label}</Label>
                        <rect x={262} y={y - 8} width={120} height={16} rx={8} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                        {r.w > 0 ? (
                            <motion.rect x={262} y={y - 8} height={16} rx={8} fill="rgba(225,29,72,0.6)"
                                initial={reduce ? false : { width: 0 }} animate={{ width: r.w }} transition={{ duration: 0.8, delay: 0.3 + i * 0.2, ease: EASE }} />
                        ) : (
                            <motion.circle cx={272} cy={y} r={5} fill="#FDA4AF" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
                        )}
                        <Label x={396} y={y + 6} color="#FFE4E6">{r.detail}</Label>
                    </g>
                );
            })}
        </g>
    );
};

export const VertexVisual = ({ id }: { id: VertexId }) => {
    const reduce = useReducedMotion() ?? false;
    return (
        <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-auto block" role="img" aria-label="Esquema do vértice">
            {id === 'trans' && <TransVisual reduce={reduce} />}
            {id === 'dili' && <DiliVisual reduce={reduce} />}
            {id === 'wada' && <WadaVisual reduce={reduce} />}
        </svg>
    );
};
