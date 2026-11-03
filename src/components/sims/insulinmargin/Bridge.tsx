import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { ZONE_ICONS } from '../insulin/zoneIcons';
import { DOSE_COMA, DOSE_MICRO, DOSE_SATURATION, LABELS, ZONES, type ZoneId } from './content';

const BODY = 'var(--font-body), sans-serif';
const MONO = 'var(--font-mono), monospace';
const DISPLAY = 'var(--font-display), sans-serif';

/** Altura do cartão da cena (px); a largura vem do layout (`width`). */
export const SCENE_H = 366;
/** Largura mínima de desenho: tudo até o abismo cabe em 1100 px. */
export const MIN_W = 1100;

/** Régua esquemática: posição horizontal = dose (UI). Só ~10, ~12 e ~15+ são marcados. */
const PX_PER_UI = 49;
const X_ZERO = 50;
const dx = (dose: number): number => X_ZERO + dose * PX_PER_UI;

const DECK_Y = 204;
const X_MICRO = dx(DOSE_MICRO);
const X_SAT = dx(DOSE_SATURATION);
const X_EDGE = dx(DOSE_COMA);
const X_PLUS4 = dx(DOSE_MICRO + 4);
const EASE = [0.16, 1, 0.3, 1] as const;

const PLATEAU = (h: number): string => `M0 ${DECK_Y} L${X_MICRO + 6} ${DECK_Y} L${X_MICRO + 12} ${DECK_Y + 16} L${X_MICRO - 2} ${DECK_Y + 44} L${X_MICRO + 8} ${DECK_Y + 76} L${X_MICRO - 10} ${DECK_Y + 112} L${X_MICRO - 2} ${DECK_Y + 140} L${X_MICRO - 16} ${h} L0 ${h} Z`;

/** Viga em balanço: grossa junto ao platô, afinando até quebrar na borda (~15+ UI). */
const BEAM = `M${X_MICRO} ${DECK_Y} L${X_EDGE} ${DECK_Y} L${X_EDGE - 4} ${DECK_Y + 4} L${X_EDGE + 3} ${DECK_Y + 7} L${X_EDGE - 6} ${DECK_Y + 9} L${X_MICRO} ${DECK_Y + 22} Z`;

const STRUTS = [
    [X_MICRO + 4, DECK_Y + 50, X_MICRO + 64, DECK_Y + 20],
    [X_MICRO + 2, DECK_Y + 74, X_MICRO + 112, DECK_Y + 18],
] as const;

interface BridgeProps {
    readonly step: number;
    readonly reduced: boolean;
    readonly onZone: (step: number) => void;
    readonly width: number;
}


interface IconAt {
    readonly x: number;
    readonly y: number;
    readonly color: string;
}

const ShieldIcon = ({ x, y, color }: IconAt) => {
    const Icon = ZONE_ICONS.green;
    return <Icon x={x} y={y} width={44} height={44} color={color} strokeWidth={2} aria-hidden />;
};
const AlertIcon = ({ x, y, color }: IconAt) => {
    const Icon = ZONE_ICONS.yellow;
    return <Icon x={x} y={y} width={26} height={26} color={color} strokeWidth={2.2} aria-hidden />;
};
const SkullIcon = ({ x, y, color }: IconAt) => {
    const Icon = ZONE_ICONS.red;
    return <Icon x={x} y={y} width={44} height={44} color={color} strokeWidth={2} aria-hidden />;
};

const zoneForStep = (step: number): ZoneId | null => (step === 1 ? 'green' : step === 2 ? 'yellow' : step >= 3 ? 'red' : null);

/** Marcador da dose: anda sobre a régua e, a partir de ~15+ UI, cai no abismo. */
const DoseMarker = ({ step, reduced }: { readonly step: number; readonly reduced: boolean }) => {
    const falling = step >= 3;
    const x = step === 0 ? dx(0) : step === 1 ? X_MICRO : step === 2 ? X_SAT : X_EDGE + 58;
    const zone = zoneForStep(step);
    const color = zone ? ZONES[zone].color : '#E5E7EB';
    return (
        <motion.g initial={false} animate={{ x }} transition={reduced ? { duration: 0 } : { duration: 0.9, ease: EASE }}>
            <motion.g
                initial={false}
                animate={{ y: falling ? 112 : 0, opacity: step === 4 ? 0 : falling ? 0.8 : 1 }}
                transition={reduced ? { duration: 0 } : falling ? { delay: step === 4 ? 0 : 0.8, duration: 0.7, ease: 'easeIn' } : { duration: 0.5, ease: EASE }}
            >
                <circle cx={0} cy={DECK_Y - 17} r={22} fill={color} opacity={0.22} />
                <circle cx={0} cy={DECK_Y - 17} r={14} fill={color} stroke="#fff" strokeWidth={3} />
                <circle cx={0} cy={DECK_Y - 17} r={4} fill="#fff" />
            </motion.g>
        </motion.g>
    );
};

/** A margem: platô seguro até ~10 UI, viga estreita até ~15+ UI e o abismo da hipoglicemia. */
export const Bridge = ({ step, reduced, onZone, width }: BridgeProps) => {
    const VIEW = { w: Math.max(width, MIN_W), h: SCENE_H };
    const brainX = VIEW.w - 104;
    const zone = zoneForStep(step);
    const fell = step >= 3;
    const pulse = !reduced && fell;

    return (
        <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="h-full w-full" preserveAspectRatio="xMinYMid meet" role="img" aria-label="Régua de dose da insulina como uma ponte estreita sobre o abismo da hipoglicemia">
            <defs>
                <linearGradient id="im-risk" x1={20} x2={VIEW.w - 30} y1={0} y2={0} gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="55%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
                <linearGradient id="im-beam" x1={X_MICRO} x2={X_EDGE} y1={0} y2={0} gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stopColor="#22D3EE" />
                    <stop offset="45%" stopColor="#F59E0B" />
                    <stop offset="85%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#E11D48" />
                </linearGradient>
                <linearGradient id="im-rock" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#13213a" />
                    <stop offset="100%" stopColor="#060812" />
                </linearGradient>
                <radialGradient id="im-abyss" cx="50%" cy="100%" r="85%">
                    <stop offset="0%" stopColor="#E11D48" stopOpacity={0.75} />
                    <stop offset="45%" stopColor="#9F1239" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#050510" stopOpacity={0} />
                </radialGradient>
            </defs>

            {/* Eixo: risco de hipoglicemia cresce para a direita */}
            <text x={20} y={26} fontFamily={MONO} fontSize={15.6} letterSpacing="0.1em" fill="#E5E7EB">{LABELS.risk.toUpperCase()}</text>
            <text x={VIEW.w - 20} y={26} textAnchor="end" fontFamily={MONO} fontSize={15.6} fill="#CBD5E1">régua esquemática · sem escala</text>
            <line x1={20} x2={VIEW.w - 30} y1={38} y2={38} stroke="url(#im-risk)" strokeWidth={3} strokeLinecap="round" />
            <path d={`M${VIEW.w - 20} 38 L${VIEW.w - 34} 31 L${VIEW.w - 34} 45 Z`} fill="#E11D48" />

            {/* Abismo */}
            <motion.rect
                x={X_EDGE} y={DECK_Y} width={VIEW.w - X_EDGE} height={VIEW.h - DECK_Y} fill="url(#im-abyss)"
                initial={false}
                animate={pulse ? { opacity: [0.65, 1, 0.65] } : { opacity: fell ? 0.9 : 0.45 }}
                transition={pulse ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.6 }}
            />
            {[0.25, 0.5, 0.75].map(f => (
                <line key={f} x1={X_EDGE + 10} x2={VIEW.w - 10} y1={DECK_Y + f * (VIEW.h - DECK_Y)} y2={DECK_Y + f * (VIEW.h - DECK_Y)} stroke="#E11D48" strokeOpacity={0.12 + f * 0.1} strokeDasharray="2 10" />
            ))}
            <line x1={X_EDGE} x2={X_EDGE} y1={DECK_Y - 92} y2={VIEW.h} stroke="#E11D48" strokeWidth={2} strokeDasharray="4 6" opacity={0.85} />

            {/* SNC sem glicose */}
            <motion.g
                initial={false}
                animate={{ opacity: fell ? 1 : 0.55 }}
                transition={{ duration: 0.6 }}
            >
                <motion.g initial={false} animate={{ opacity: fell ? 0.35 : 1 }} transition={{ delay: fell && !reduced ? 1.4 : 0, duration: 1.2 }}>
                    <Brain x={brainX - 30} y={DECK_Y + 22} width={60} height={60} color="#FDA4AF" strokeWidth={1.6} />
                </motion.g>
                {LABELS.cnsLines.map((l, i) => (
                    <text key={l} x={brainX} y={DECK_Y + 108 + i * 20} textAnchor="middle" fontFamily={MONO} fontSize={15.6} fontWeight={600} fill="#FECDD3">{l}</text>
                ))}
            </motion.g>

            {/* Platô seguro e viga */}
            <path d={PLATEAU(VIEW.h)} fill="url(#im-rock)" stroke="rgba(255,255,255,0.08)" />
            <rect x={0} y={DECK_Y - 3} width={X_MICRO + 6} height={7} rx={2} fill="#22D3EE" opacity={zone === 'green' ? 1 : 0.7} style={{ filter: zone === 'green' ? 'drop-shadow(0 0 10px #22D3EE)' : undefined }} />
            {STRUTS.map(([x1, y1, x2, y2]) => (
                <line key={x2} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth={3} strokeLinecap="round" />
            ))}
            <motion.g
                initial={false}
                animate={step === 2 && !reduced ? { y: [0, 1.6, -1.2, 0.8, 0] } : { y: 0 }}
                transition={step === 2 && !reduced ? { duration: 0.55, repeat: Infinity, repeatDelay: 0.6 } : { duration: 0.2 }}
            >
                <path d={BEAM} fill="url(#im-beam)" opacity={zone === 'yellow' || zone === 'red' ? 1 : 0.78} style={{ filter: zone === 'yellow' ? 'drop-shadow(0 0 10px #F59E0B)' : undefined }} />
            </motion.g>

            {/* Marcas da régua */}
            {[X_MICRO, X_SAT, X_EDGE].map(x => (
                <rect key={x} x={x - 1.5} y={DECK_Y - 13} width={3} height={13} fill="#fff" />
            ))}

            {/* Âncoras */}
            <line x1={X_MICRO} x2={X_MICRO} y1={DECK_Y - 92} y2={DECK_Y - 14} stroke="#22D3EE" strokeWidth={1.5} strokeDasharray="4 6" />
            <text x={X_MICRO - 12} y={96} textAnchor="end" fontFamily={DISPLAY} fontSize={56} fontWeight={700} fill="#22D3EE">{LABELS.micro}</text>
            <text x={X_MICRO - 12} y={122} textAnchor="end" fontFamily={MONO} fontSize={15.6} letterSpacing="0.08em" fill="#E5E7EB">{LABELS.microSub.toUpperCase()}</text>
            <ShieldIcon x={X_MICRO - 12 - 212} y={50} color="#22D3EE" />
            <text x={X_EDGE + 14} y={98} fontFamily={DISPLAY} fontSize={56} fontWeight={700} fill="#E11D48" style={{ filter: 'drop-shadow(0 0 14px rgba(225,29,72,0.55))' }}>{LABELS.coma}</text>
            <text x={X_EDGE + 16} y={122} fontFamily={MONO} fontSize={15.6} letterSpacing="0.02em" fill="#E5E7EB">{LABELS.comaSub.toUpperCase()}</text>
            <SkullIcon x={X_EDGE + 14 + 214} y={54} color="#FB7185" />

            {/* Sob a viga: saturação e captação de CHO */}
            <AlertIcon x={X_SAT + 40 - 118} y={DECK_Y + 36} color="#F59E0B" />
            <text x={X_SAT + 40} y={DECK_Y + 54} textAnchor="middle" fontFamily={DISPLAY} fontSize={24} fontWeight={700} fill="#F59E0B">{LABELS.sat}</text>
            <text x={X_SAT + 40} y={DECK_Y + 76} textAnchor="middle" fontFamily={BODY} fontSize={15.6} fill="#FDE68A">{LABELS.satSub}</text>
            {LABELS.uptake.map((l, i) => (
                <text key={l} x={X_SAT + 40} y={DECK_Y + 106 + i * 19} textAnchor="middle" fontFamily={BODY} fontSize={15.6} fill="#E2E8F0">{l}</text>
            ))}

            {/* A margem: 2 a 4 unidades extras */}
            <motion.g initial={false} animate={{ opacity: fell ? 1 : 0 }} transition={{ delay: fell && !reduced ? 0.4 : 0, duration: 0.5 }}>
                <text x={(X_MICRO + X_PLUS4) / 2} y={DECK_Y - 104} textAnchor="middle" fontFamily={DISPLAY} fontSize={20} fontWeight={700} fill="#fff">{LABELS.margin.toUpperCase()}</text>
                <text x={(X_MICRO + X_PLUS4) / 2} y={DECK_Y - 82} textAnchor="middle" fontFamily={BODY} fontSize={16} fontWeight={600} fill="#FDA4AF">{LABELS.marginSub}</text>
                <path d={`M${X_MICRO} ${DECK_Y - 58} L${X_MICRO} ${DECK_Y - 70} L${X_PLUS4} ${DECK_Y - 70} L${X_PLUS4} ${DECK_Y - 58}`} fill="none" stroke="#FDA4AF" strokeWidth={2} />
                <line x1={X_SAT} x2={X_SAT} y1={DECK_Y - 70} y2={DECK_Y - 60} stroke="#FDA4AF" strokeWidth={2} />
                <text x={X_SAT} y={DECK_Y - 38} textAnchor="middle" fontFamily={MONO} fontSize={15.6} fill="#FECDD3">+2</text>
                <text x={X_PLUS4} y={DECK_Y - 38} textAnchor="middle" fontFamily={MONO} fontSize={15.6} fill="#FECDD3">+4</text>
            </motion.g>

            <DoseMarker step={step} reduced={reduced} />

            {/* Rastro que some (passo 4) */}
            <motion.g initial={false} animate={{ opacity: step === 4 ? 1 : 0 }} transition={{ delay: step === 4 && !reduced ? 0.3 : 0, duration: 0.8 }}>
                <circle cx={X_EDGE + 58} cy={DECK_Y + 95} r={18} fill="none" stroke="#C084FC" strokeWidth={2} strokeDasharray="4 5" />
                <text x={X_EDGE + 18} y={DECK_Y + 138} textAnchor="start" fontFamily={MONO} fontSize={15.6} fontWeight={600} fill="#E9D5FF">oculta</text>
            </motion.g>

            {/* Áreas clicáveis: cada faixa leva ao passo correspondente */}
            <rect x={0} y={DECK_Y - 40} width={X_MICRO} height={50} fill="transparent" style={{ cursor: 'pointer' }} onClick={() => onZone(1)} />
            <rect x={X_MICRO} y={DECK_Y - 40} width={X_EDGE - X_MICRO} height={70} fill="transparent" style={{ cursor: 'pointer' }} onClick={() => onZone(2)} />
            <rect x={X_EDGE} y={DECK_Y - 40} width={VIEW.w - X_EDGE} height={VIEW.h - DECK_Y + 40} fill="transparent" style={{ cursor: 'pointer' }} onClick={() => onZone(3)} />
        </svg>
    );
};
