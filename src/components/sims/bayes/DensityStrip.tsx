import { motion } from 'framer-motion';
import { PRIOR, Y_MAX, density, type Predictive } from './model';
import { BOTTOM, STRIP_X0, STRIP_X1, TOP, yOf } from './layout';

/**
 * Faixa do Teorema de Bayes, no mesmo eixo vertical do gráfico: priori (população),
 * exame novo (verossimilhança) e posteriori (o que se espera do próximo exame deste atleta).
 */

const BASE_X = STRIP_X0 + 10;
const MAX_W = STRIP_X1 - BASE_X - 4;
/** Escala horizontal fixa: assim, uma distribuição mais estreita fica visivelmente mais alta. */
const K = MAX_W / 2.15;
const SAMPLES = 120;

const bell = (p: Predictive): string => {
    const pts: string[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
        const v = 0.02 + (i / SAMPLES) * (Y_MAX - 0.02);
        const w = Math.min(MAX_W, K * density(p, v));
        pts.push(`${i === 0 ? 'M' : 'L'}${(BASE_X + w).toFixed(1)} ${yOf(v).toFixed(1)}`);
    }
    return pts.join(' ');
};

const closed = (p: Predictive): string => `${bell(p)} L${BASE_X} ${yOf(Y_MAX)} L${BASE_X} ${yOf(0.02)} Z`;

export interface DensityStripProps {
    readonly visible: boolean;
    readonly showPosterior: boolean;
    readonly posterior: Predictive;
    /** Exame mais recente (verossimilhança), quando houver. */
    readonly likelihood: Predictive | null;
    readonly likelihoodKey: string;
    readonly flagged: boolean;
}

export const DensityStrip = ({ visible, showPosterior, posterior, likelihood, likelihoodKey, flagged }: DensityStripProps) => (
    <g>
        <rect x={STRIP_X0} y={TOP} width={STRIP_X1 - STRIP_X0} height={BOTTOM - TOP} rx={8} fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.08)" />
        <text x={(STRIP_X0 + STRIP_X1) / 2} y={TOP - 10} textAnchor="middle" fontSize={12.5} fontWeight={700} letterSpacing="0.1em" fill="#E5E7EB" style={{ fontFamily: 'var(--font-mono)' }}>
            TEOREMA DE BAYES
        </text>
        <line x1={BASE_X} x2={BASE_X} y1={TOP + 6} y2={BOTTOM - 6} stroke="rgba(255,255,255,0.35)" />

        {!visible && (
            <text x={(STRIP_X0 + STRIP_X1) / 2} y={(TOP + BOTTOM) / 2} textAnchor="middle" fontSize={13} fill="#E5E7EB">
                <tspan x={(STRIP_X0 + STRIP_X1) / 2}>sem perfil</tspan>
                <tspan x={(STRIP_X0 + STRIP_X1) / 2} dy={18}>individual</tspan>
            </text>
        )}
        {visible && (
            <>
                {/* Priori: a população (fixa) */}
                <path d={closed(PRIOR)} fill="rgba(203,213,225,0.08)" />
                <path d={bell(PRIOR)} fill="none" stroke="#CBD5E1" strokeWidth={1.8} strokeDasharray="5 4" />

                {/* Posteriori: o perfil atualizado deste atleta */}
                {showPosterior && (
                    <>
                        <path d={closed(posterior)} fill="rgba(96,165,250,0.30)" />
                        <path d={bell(posterior)} fill="none" stroke="#60A5FA" strokeWidth={2.4} />
                    </>
                )}

                {/* Exame novo: entra como verossimilhança */}
                {likelihood && (
                    <motion.g key={likelihoodKey} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
                        <path d={bell(likelihood)} fill="none" stroke={flagged ? '#E11D48' : '#F59E0B'} strokeWidth={2} />
                        <circle cx={BASE_X} cy={yOf(Math.exp(likelihood.m))} r={4.5} fill={flagged ? '#E11D48' : '#F59E0B'} stroke="#050510" strokeWidth={1.5} />
                    </motion.g>
                )}
            </>
        )}

        {/* Legenda */}
        <g style={{ fontFamily: 'var(--font-body)', opacity: visible ? 1 : 0.35, transition: 'opacity 0.6s ease' }} fontSize={12.5}>
            <line x1={STRIP_X0 + 4} x2={STRIP_X0 + 22} y1={BOTTOM + 18} y2={BOTTOM + 18} stroke="#CBD5E1" strokeWidth={2} strokeDasharray="5 3" />
            <text x={STRIP_X0 + 28} y={BOTTOM + 22} fill="#E5E7EB">priori (população)</text>
            <line x1={STRIP_X0 + 4} x2={STRIP_X0 + 22} y1={BOTTOM + 36} y2={BOTTOM + 36} stroke="#F59E0B" strokeWidth={2} />
            <text x={STRIP_X0 + 28} y={BOTTOM + 40} fill="#E5E7EB">exame novo</text>
            <rect x={STRIP_X0 + 4} y={BOTTOM + 47} width={18} height={9} rx={2} fill="rgba(96,165,250,0.45)" stroke="#60A5FA" />
            <text x={STRIP_X0 + 28} y={BOTTOM + 56} fill="#E5E7EB">posteriori (atleta)</text>
        </g>
    </g>
);
