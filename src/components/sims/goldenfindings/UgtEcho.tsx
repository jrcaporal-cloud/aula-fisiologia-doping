import { motion, useReducedMotion } from 'framer-motion';
import { TE_LIMIT, TE_RESULT, type Genotype } from '../ugt2b17/content';
import { LIVER_PATH, STEROID_OFFSET, STEROID_PATH } from '../ugt2b17/geometry';
import { EASE, strokeK, type EchoProps } from './echoKit';
import { EchoSvg, Label } from './EchoParts';

/**
 * Eco do slide "O Polimorfismo UGT2B17": o mesmo doping em dois genótipos. Gene normal → rins →
 * urina (T/E 15:1 ou mais); deleção → a testosterona escapa pelas fezes e a urina fica limpa (T/E 0,5:1).
 */

interface Row {
    readonly id: Genotype;
    readonly y: number;
    readonly title: string;
    readonly color: string;
    readonly route: string;
}

const LIVER_SCALE = 0.4;
const LIVER_C = { x: 204, y: 211 } as const;
const LIVER_X = 96;

const rowRoute = (id: Genotype, y: number): string =>
    id === 'normal'
        ? `M${LIVER_X + 46} ${y} C 182 ${y - 14}, 206 ${y - 14}, 232 ${y} C 262 ${y + 16}, 300 ${y + 26}, 352 ${y + 10}`
        : `M${LIVER_X + 46} ${y} C 168 ${y + 26}, 186 ${y + 40}, 212 ${y + 40} C 236 ${y + 40} 236 ${y + 52} 212 ${y + 52} C 188 ${y + 52} 188 ${y + 64} 212 ${y + 64} C 240 ${y + 64} 262 ${y + 66} 300 ${y + 66}`;

const ROWS: readonly Row[] = [
    { id: 'normal', y: 120, title: 'gene normal', color: '#22D3EE', route: rowRoute('normal', 120) },
    { id: 'del', y: 290, title: 'deleção UGT2B17 (del/del)', color: '#FB7185', route: rowRoute('del', 290) },
];

const GAUGE = { x: 440, w: 140, max: 20 } as const;
const gx = (v: number) => GAUGE.x + (Math.min(v, GAUGE.max) / GAUGE.max) * GAUGE.w;

const Molecule = ({ route, delay, k, reduce }: { route: string; delay: number; k: number; reduce: boolean }) => (
    <motion.g
        style={{ offsetPath: `path("${route}")`, offsetRotate: '0deg' }}
        initial={{ offsetDistance: reduce ? '55%' : '0%', opacity: reduce ? 1 : 0 }}
        animate={reduce ? { offsetDistance: '55%', opacity: 1 } : { offsetDistance: ['0%', '100%'], opacity: [0, 1, 1, 0] }}
        transition={reduce ? { duration: 0 } : { duration: 2.6, delay, repeat: Infinity, repeatDelay: 0.3, ease: 'linear' }}
    >
        <g transform={`scale(${k > 1 ? 1.6 : 1}) translate(${STEROID_OFFSET[0]} ${STEROID_OFFSET[1]})`}>
            <path d={STEROID_PATH} fill="rgba(245,158,11,0.25)" stroke="#FCD34D" strokeWidth={1.4} strokeLinejoin="round" />
        </g>
    </motion.g>
);

export const UgtEcho = ({ compact }: EchoProps) => {
    const reduce = useReducedMotion() ?? false;
    const k = strokeK(compact);
    const d = (s: number) => (reduce ? 0 : s);

    return (
        <EchoSvg label="Mesmo doping, dois genótipos: com o gene normal a testosterona vai para a urina; com a deleção, sai pelas fezes e a urina fica limpa">
            <defs>
                <radialGradient id="gf-liver" cx="35%" cy="30%" r="80%">
                    <stop offset="0%" stopColor="#b4533a" />
                    <stop offset="55%" stopColor="#7c2d22" />
                    <stop offset="100%" stopColor="#3f1410" />
                </radialGradient>
            </defs>
            <line x1={20} x2={580} y1={205} y2={205} stroke="#fff" strokeOpacity={0.12} strokeDasharray="4 6" />

            {ROWS.map((row, ri) => {
                const del = row.id === 'del';
                const res = TE_RESULT[row.id];
                const y = row.y;
                const enzyme = { x: LIVER_X + (192 - LIVER_C.x) * LIVER_SCALE, y: y + (206 - LIVER_C.y) * LIVER_SCALE };
                const base = ri * 0.5;
                return (
                    <g key={row.id}>
                        <Label compact={compact} x={20} y={y - 62} size={15} weight={700} fill={row.color} delay={base}>{row.title}</Label>

                        {/* fígado + enzima */}
                        <path d={LIVER_PATH} fill="url(#gf-liver)" stroke="#fdba74" strokeOpacity={0.35}
                            transform={`translate(${LIVER_X - LIVER_C.x * LIVER_SCALE} ${y - LIVER_C.y * LIVER_SCALE}) scale(${LIVER_SCALE})`} />
                        {del ? (
                            <path d={`M${enzyme.x - 8} ${enzyme.y - 8} l16 16 M${enzyme.x + 8} ${enzyme.y - 8} l-16 16`} stroke="#FB7185" strokeWidth={3 * k} strokeLinecap="round" />
                        ) : (
                            <circle cx={enzyme.x} cy={enzyme.y} r={9 * Math.min(k, 1.6)} fill="#10B981" stroke="#A7F3D0" strokeWidth={1.2 * k} />
                        )}
                        <Label compact={compact} x={LIVER_X} y={y + 46} anchor="middle" size={13} mono fill={del ? '#FDA4AF' : '#6EE7B7'} delay={base + 0.2}>
                            {del ? 'sem UGT2B17' : 'UGT2B17'}
                        </Label>

                        {/* rota */}
                        <path d={row.route} fill="none" stroke={del ? '#A16207' : '#FCD34D'} strokeOpacity={0.45} strokeWidth={5 * k} strokeLinecap="round" />
                        {!del && (
                            <g>
                                <ellipse cx={232} cy={y} rx={14} ry={22} fill="#7f1d2d" stroke="#fecdd3" strokeOpacity={0.45} />
                                <Label compact={compact} x={232} y={y - 32} anchor="middle" size={13} mono fill="#FECDD3">rins</Label>
                            </g>
                        )}
                        {del && <Label compact={compact} x={306} y={y + 71} size={14} weight={600} fill="#FDE68A" delay={base + 0.6}>fezes</Label>}
                        {[0, 0.9, 1.8].map(t => <Molecule key={t} route={row.route} delay={base + t} k={k} reduce={reduce} />)}

                        {/* frasco de urina */}
                        <g transform={`translate(346 ${y - 4})`}>
                            <rect x={-3} y={0} width={60} height={11} rx={3} fill="#E5E7EB" />
                            <path d="M2 11 L52 11 L49 70 Q48 76 42 76 L12 76 Q6 76 5 70 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.5)" strokeWidth={1.2 * k} />
                            <motion.path d="M4 40 L50 40 L49 70 Q48 76 42 76 L12 76 Q6 76 5 70 Z" fill="#F59E0B"
                                initial={reduce ? false : { fillOpacity: 0.15 }} animate={{ fillOpacity: del ? 0.25 : 0.75 }}
                                transition={{ duration: d(1.2), delay: d(base + 1.6) }} />
                        </g>
                        <Label compact={compact} x={373} y={y + 92} anchor="middle" size={13} mono fill="#FDE68A">urina</Label>

                        {/* medidor T/E */}
                        <rect x={GAUGE.x} y={y + 8} width={GAUGE.w} height={16} rx={8} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.3)" />
                        <motion.rect x={GAUGE.x} y={y + 8} height={16} rx={8} fill={del ? '#FB7185' : '#22D3EE'}
                            initial={reduce ? false : { width: 0 }} animate={{ width: Math.max(gx(res.value) - GAUGE.x, 8) }}
                            transition={{ duration: d(1.1), delay: d(base + 1.9), ease: EASE }} />
                        <line x1={gx(TE_LIMIT)} x2={gx(TE_LIMIT)} y1={y + 2} y2={y + 30} stroke="#fff" strokeWidth={2 * k} />
                        {ri === 0 && <Label compact={compact} x={gx(TE_LIMIT)} y={y - 5} anchor="middle" size={15} mono fill="#E5E7EB">limite {TE_LIMIT}:1</Label>}
                        <Label compact={compact} x={GAUGE.x} y={y - 29} size={19} weight={800} fill={row.color} delay={base + 2.4}>T/E {res.label}</Label>
                        <Label compact={compact} x={GAUGE.x} y={y + 50} size={15} weight={600} fill={del ? '#FDA4AF' : '#A5F3FC'} delay={base + 2.6}>{res.verdict}</Label>
                    </g>
                );
            })}
        </EchoSvg>
    );
};
