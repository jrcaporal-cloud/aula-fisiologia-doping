import { motion, useReducedMotion } from 'framer-motion';
import type { VertexId } from './content';

/**
 * Mini-esquemas de cada vértice. Só desenham o que o texto do cartão diz
 * (2,5 nmol/L; picogramas 10⁻¹² g; 2 horas / minutos / transfusão noturna); escalas qualitativas.
 */

const VW = 600;
const VH = 100;
const EASE = [0.16, 1, 0.3, 1] as const;

const Label = ({ x, y, children, color = '#E5E7EB', anchor = 'start', size = 12.5, weight = 500 }: {
    x: number; y: number; children: React.ReactNode; color?: string; anchor?: 'start' | 'middle' | 'end'; size?: number; weight?: number;
}) => (
    <text x={x} y={y} textAnchor={anchor} fontSize={size} fontWeight={weight} fill={color}>{children}</text>
);

/** 01: a supressão atual (2,5 nmol/L) × o que a puberdade deixou nas fibras. */
const TransVisual = ({ reduce }: { reduce: boolean }) => {
    const nuclei = [0, 1, 2, 3, 4, 5, 6, 7];
    return (
        <g>
            <Label x={0} y={14} color="#C4B5FD" weight={700}>supressão farmacológica atual</Label>
            {/* nível de testosterona descendo até o limite */}
            <rect x={0} y={26} width={226} height={22} rx={11} fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.15)" />
            <motion.rect x={0} y={26} height={22} rx={11} fill="rgba(168,85,247,0.55)"
                initial={reduce ? false : { width: 216 }} animate={{ width: 58 }} transition={{ duration: 1.6, delay: 0.4, ease: EASE }} />
            <line x1={58} x2={58} y1={20} y2={54} stroke="#fff" strokeWidth={2} />
            <Label x={0} y={72} size={12.5}>testosterona ≤ limite da WADA</Label>
            <Label x={0} y={90} size={13} weight={700} color="#fff">2,5 nmol/L</Label>

            <Label x={260} y={14} color="#C4B5FD" weight={700}>vantagem biológica herdada</Label>
            {/* fibra com mionúcleos que permanecem */}
            <rect x={260} y={28} width={336} height={22} rx={11} fill="rgba(244,114,182,0.12)" stroke="rgba(244,114,182,0.45)" />
            {nuclei.map(i => (
                <motion.ellipse key={i} cx={282 + i * 41} cy={39} rx={7} ry={4.5} fill="#C4B5FD"
                    initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }} />
            ))}
            <Label x={260} y={72}>adição permanente de mionúcleos</Label>
            <Label x={260} y={90} size={12.5} color="#D1D5DB">pelve estreita · maior densidade óssea · HVE irreversível</Label>
        </g>
    );
};

const UNITS = ['g', 'mg', 'µg', 'ng', 'pg'] as const;
const POWERS = ['10⁰', '10⁻³', '10⁻⁶', '10⁻⁹', '10⁻¹²'] as const;

/** 02: régua de sensibilidade até picogramas. */
const DiliVisual = ({ reduce }: { reduce: boolean }) => {
    const x0 = 24;
    const step = 112;
    const last = x0 + step * (UNITS.length - 1);
    return (
        <g>
            <Label x={0} y={14} color="#FCD34D" weight={700}>sensibilidade da cromatografia de massa</Label>
            <line x1={x0} x2={last} y1={44} y2={44} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
            {UNITS.map((u, i) => (
                <g key={u}>
                    <line x1={x0 + i * step} x2={x0 + i * step} y1={38} y2={50} stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} />
                    <Label x={x0 + i * step} y={70} anchor="middle" size={14} weight={700} color={i === 4 ? '#FCD34D' : '#E5E7EB'}>{u}</Label>
                    <Label x={x0 + i * step} y={88} anchor="middle" size={12} color="#D1D5DB">{POWERS[i]}</Label>
                </g>
            ))}
            <motion.g initial={reduce ? false : { x: 0 }} animate={{ x: last - x0 }} transition={{ duration: 1.8, delay: 0.3, ease: EASE }}>
                <circle cx={x0} cy={44} r={9} fill="#F59E0B" stroke="#050510" strokeWidth={2} />
                <circle cx={x0} cy={44} r={16} fill="none" stroke="#F59E0B" strokeOpacity={0.5} />
            </motion.g>
            <motion.g initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9, duration: 0.4 }}>
                <rect x={last - 260} y={20} width={226} height={20} rx={6} fill="rgba(245,158,11,0.14)" stroke="rgba(245,158,11,0.5)" />
                <Label x={last - 147} y={34} anchor="middle" size={12.5} color="#FDE68A">resíduos de SARMs e Diuréticos</Label>
            </motion.g>
        </g>
    );
};

/** 03: as janelas que o teste não vê. */
const WadaVisual = ({ reduce }: { reduce: boolean }) => {
    const rows = [
        { label: 'peptídeos secretores', detail: 'atuam em minutos', w: 18 },
        { label: 'insulina ultrarrápida', detail: 'sai do soro em 2 horas', w: 96 },
        { label: 'transfusão autóloga noturna', detail: 'o próprio sangue do atleta', w: 0 },
    ];
    return (
        <g>
            <Label x={0} y={14} color="#FDA4AF" weight={700}>“cegueira seletiva”</Label>
            <Label x={VW} y={14} anchor="end" size={12} color="#D1D5DB">escala qualitativa</Label>
            {rows.map((r, i) => {
                const y = 40 + i * 26;
                return (
                    <g key={r.label}>
                        <Label x={0} y={y + 4} size={13} weight={600} color="#fff">{r.label}</Label>
                        <rect x={222} y={y - 8} width={200} height={16} rx={8} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                        {r.w > 0 ? (
                            <motion.rect x={222} y={y - 8} height={16} rx={8} fill="rgba(225,29,72,0.6)"
                                initial={reduce ? false : { width: 0 }} animate={{ width: r.w }} transition={{ duration: 0.8, delay: 0.3 + i * 0.2, ease: EASE }} />
                        ) : (
                            <motion.circle cx={232} cy={y} r={5} fill="#FDA4AF" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} />
                        )}
                        <Label x={436} y={y + 4} size={12.5} color="#FECDD3">{r.detail}</Label>
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
