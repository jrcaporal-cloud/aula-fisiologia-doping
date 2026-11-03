import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
import {
    BLADDER, BLADDER_PATH, DUCTS, ENZYME, KIDNEY_PATHS, KIDNEYS, LIVER_PATH, SUGAR_PATH, SYRINGE_X, VESSEL,
} from './geometry';

/** Desenho dos órgãos do esquema (SVG puro). `on` = órgão em foco no passo atual. */

const LABEL = 'font-body';
const DIM = 0.8;

export const Fade = ({ on, children, dim = DIM }: { on: boolean; children: ReactNode; dim?: number }) => (
    <motion.g initial={false} animate={{ opacity: on ? 1 : dim }} transition={{ duration: 0.6, ease: 'easeOut' }}>
        {children}
    </motion.g>
);

export const OrganDefs = () => (
    <defs>
        <linearGradient id="ug-vessel" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#4c0519" />
            <stop offset="45%" stopColor="#9f1239" />
            <stop offset="100%" stopColor="#4c0519" />
        </linearGradient>
        <radialGradient id="ug-liver" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#b4533a" />
            <stop offset="55%" stopColor="#7c2d22" />
            <stop offset="100%" stopColor="#3f1410" />
        </radialGradient>
        <radialGradient id="ug-kidney" cx="40%" cy="35%" r="75%">
            <stop offset="0%" stopColor="#c2414f" />
            <stop offset="100%" stopColor="#5b1222" />
        </radialGradient>
        <radialGradient id="ug-enzyme" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="60%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#065f46" />
        </radialGradient>
        <linearGradient id="ug-urine" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fde68a" stopOpacity={0.75} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.55} />
        </linearGradient>
        <filter id="ug-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <clipPath id="ug-bladder-clip"><path d={BLADDER_PATH} /></clipPath>
    </defs>
);

export const Vessel = () => (
    <g>
        <rect x={VESSEL.x0} y={VESSEL.y - VESSEL.half} width={VESSEL.x1 - VESSEL.x0} height={VESSEL.half * 2} rx={VESSEL.half}
            fill="url(#ug-vessel)" stroke="#fb7185" strokeOpacity={0.45} strokeWidth={1.2} />
        <line x1={VESSEL.x0 + 14} x2={VESSEL.x1 - 14} y1={VESSEL.y - 8} y2={VESSEL.y - 8} stroke="#fda4af" strokeOpacity={0.18} strokeWidth={2} strokeLinecap="round" />
        <text x={VESSEL.x1} y={VESSEL.y - VESSEL.half - 10} textAnchor="end" className={LABEL} fontSize={15} fontWeight={600} fill="#FDA4AF">
            Corrente sanguínea
        </text>
    </g>
);

/** Seringa da testosterona exógena (Cipionato), só com doping. */
export const Syringe = ({ on }: { on: boolean }) => {
    const still = useReducedMotion();
    const x = SYRINGE_X;
    return (
        <motion.g initial={false} animate={{ opacity: on ? 1 : 0, y: on ? 0 : -10 }} transition={{ duration: 0.5 }}>
            <line x1={x} x2={x} y1={52} y2={VESSEL.y - 2} stroke="#E5E7EB" strokeWidth={1.6} />
            <rect x={x - 9} y={14} width={18} height={38} rx={3} fill="rgba(245,158,11,0.18)" stroke="#FCD34D" strokeWidth={1.4} />
            <motion.rect x={x - 7} width={14} rx={2} fill="#F59E0B" fillOpacity={0.65}
                initial={false} animate={still || !on ? { y: 30, height: 20 } : { y: [22, 40], height: [28, 10] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }} />
            <rect x={x - 13} y={10} width={26} height={4} rx={1.5} fill="#E5E7EB" />
            <text x={x + 18} y={30} className={LABEL} fontSize={15} fontWeight={700} fill="#FCD34D">Cipionato</text>
            <text x={x + 18} y={47} className={LABEL} fontSize={15} fill="#E5E7EB">testosterona exógena</text>
        </motion.g>
    );
};

const Sugar = ({ x, y, delay, active }: { x: number; y: number; delay: number; active: boolean }) => {
    const still = useReducedMotion();
    return (
        <motion.g initial={false} transform={`translate(${x} ${y})`}
            animate={still || !active ? undefined : { opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2.2, repeat: Infinity, delay }}>
            <path d={SUGAR_PATH} fill="#F59E0B" fillOpacity={0.7} stroke="#FDE68A" strokeWidth={1.2} strokeLinejoin="round" />
        </motion.g>
    );
};

/** Fígado com a enzima UGT2B17 (ou o vazio deixado pela deleção). */
export const Liver = ({ deleted }: { deleted: boolean }) => {
    const still = useReducedMotion();
    return (
        <g>
            <path d={DUCTS.hepaticIn} fill="none" stroke="#9f1239" strokeWidth={10} strokeLinecap="round" />
            <path d={LIVER_PATH} fill="url(#ug-liver)" stroke="#fdba74" strokeOpacity={0.35} strokeWidth={1.2} />
            <path d="M96 170 C 120 156 160 152 196 154" fill="none" stroke="#fed7aa" strokeOpacity={0.22} strokeWidth={3} strokeLinecap="round" />
            <text x={86} y={190} className={LABEL} fontSize={16} fontWeight={700} fill="#FED7AA">Fígado</text>

            {deleted ? (
                <g>
                    <circle cx={ENZYME.x} cy={ENZYME.y} r={18} fill="rgba(0,0,0,0.25)" stroke="#FDA4AF" strokeWidth={1.4} strokeDasharray="4 4" />
                    <path d={`M${ENZYME.x - 8} ${ENZYME.y - 8} L ${ENZYME.x + 8} ${ENZYME.y + 8} M${ENZYME.x + 8} ${ENZYME.y - 8} L ${ENZYME.x - 8} ${ENZYME.y + 8}`}
                        stroke="#FB7185" strokeWidth={2.6} strokeLinecap="round" />
                    <text x={ENZYME.x - 26} y={ENZYME.y + 24} textAnchor="end" className="font-mono" fontSize={15} fontWeight={700} fill="#FDA4AF">UGT2B17</text>
                    <text x={ENZYME.x - 26} y={ENZYME.y + 40} textAnchor="end" className={LABEL} fontSize={15} fill="#FECDD3">gene deletado</text>
                </g>
            ) : (
                <g>
                    <motion.g style={{ transformOrigin: `${ENZYME.x}px ${ENZYME.y}px` }}
                        animate={still ? undefined : { scale: [1, 1.06, 1] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}>
                        <circle cx={ENZYME.x} cy={ENZYME.y} r={24} fill="#10B981" opacity={0.18} filter="url(#ug-glow)" />
                        {/* Proteína com fenda catalítica voltada para cima */}
                        <path d={`M${ENZYME.x - 6} ${ENZYME.y - 17} A 18 18 0 1 0 ${ENZYME.x + 6} ${ENZYME.y - 17} L ${ENZYME.x} ${ENZYME.y - 4} Z`}
                            fill="url(#ug-enzyme)" stroke="#A7F3D0" strokeWidth={1.2} />
                    </motion.g>
                    <text x={ENZYME.x} y={ENZYME.y + 38} textAnchor="middle" className="font-mono" fontSize={15} fontWeight={700} fill="#6EE7B7">UGT2B17</text>
                    <Sugar x={232} y={166} delay={0} active />
                    <Sugar x={252} y={180} delay={0.5} active />
                    <Sugar x={214} y={176} delay={1} active />
                    <text x={256} y={157} className={LABEL} fontSize={15} fill="#FCD34D" stroke="#2a0d0a" strokeWidth={3} paintOrder="stroke">ácido</text>
                    <text x={256} y={173} className={LABEL} fontSize={15} fill="#FCD34D" stroke="#2a0d0a" strokeWidth={3} paintOrder="stroke">glucurônico</text>
                </g>
            )}
        </g>
    );
};

export const Kidneys = () => (
    <g>
        <path d={DUCTS.liverOut} fill="none" stroke="#9f1239" strokeWidth={9} strokeLinecap="round" />
        <path d={DUCTS.ureterL} fill="none" stroke="#fcd34d" strokeOpacity={0.55} strokeWidth={6} strokeLinecap="round" />
        <path d={DUCTS.ureterR} fill="none" stroke="#fcd34d" strokeOpacity={0.55} strokeWidth={6} strokeLinecap="round" />
        {KIDNEY_PATHS.map((d, i) => (
            <path key={i} d={d} fill="url(#ug-kidney)" stroke="#fecdd3" strokeOpacity={0.4} strokeWidth={1.2} />
        ))}
        <text x={(KIDNEYS[0].x + KIDNEYS[1].x) / 2} y={KIDNEYS[0].y - 52} textAnchor="middle" className={LABEL} fontSize={16} fontWeight={700} fill="#FECDD3">Rins</text>
    </g>
);

export const Bladder = ({ urine }: { urine: boolean }) => (
    <g>
        <path d={BLADDER_PATH} fill="rgba(253,230,138,0.06)" stroke="#fde68a" strokeOpacity={0.55} strokeWidth={1.4} />
        <g clipPath="url(#ug-bladder-clip)">
            <motion.rect x={BLADDER.x - 40} y={0} width={80} height={60} fill="url(#ug-urine)"
                initial={false} animate={{ y: urine ? BLADDER.y - 6 : BLADDER.y + 32 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
        </g>
        <path d={DUCTS.urethra} stroke="#fde68a" strokeOpacity={0.6} strokeWidth={5} strokeLinecap="round" />
        <path d={DUCTS.collect} fill="none" stroke="#fde68a" strokeOpacity={0.6} strokeWidth={1.6} strokeDasharray="5 5" />
        <text x={BLADDER.x - 42} y={BLADDER.y + 2} textAnchor="end" className={LABEL} fontSize={16} fontWeight={700} fill="#FDE68A">Bexiga</text>
    </g>
);

export const Intestine = ({ highlight }: { highlight: boolean }) => (
    <g>
        <path d={DUCTS.bile} fill="none" stroke="#a16207" strokeWidth={7} strokeLinecap="round" />
        <path d={DUCTS.gut} fill="none" stroke="#7c3a2d" strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
        <path d={DUCTS.gut} fill="none" stroke="#c2795f" strokeOpacity={0.55} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <text x={312} y={414} className={LABEL} fontSize={16} fontWeight={700} fill="#FED7AA">Intestino</text>
        <path d="M44 446 L 26 455 M26 455 L 36 443 M26 455 L 40 456" stroke={highlight ? '#FB7185' : '#FDBA74'} strokeWidth={2.4} strokeLinecap="round" fill="none" />
        <text x={14} y={420} className={LABEL} fontSize={16} fontWeight={700} fill={highlight ? '#FDA4AF' : '#FED7AA'}>Fezes</text>
    </g>
);
