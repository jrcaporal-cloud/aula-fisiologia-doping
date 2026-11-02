import { motion } from 'framer-motion';
import { ACCENT, FAMILIES, ROSE, type FamilyId } from './content';
import { H5_END, RING_CENTERS, C19_END, VIEWBOX, place, toScene, type Pt } from './geometry';
import { Caption, CurvedArrow, Halo } from './SceneParts';
import { BODY, MONO, arrowHead } from './svgUtil';
import { Steroid } from './Steroid';

const W = 440;
const H = 330;
const SCENE_VIEWBOX = `0 0 ${W} ${H}`;

interface SceneProps {
    readonly still: boolean;
}

const svgProps = {
    viewBox: SCENE_VIEWBOX,
    preserveAspectRatio: 'xMidYMid meet',
    className: 'w-full h-full block overflow-visible',
    role: 'img' as const,
};

/* ---------- Família 1: aromatização → estradiol; 5α-redutase → DHT ---------- */

const F1 = {
    t: { x: 220, y: 78, k: 0.62 },
    e2: { x: 112, y: 254, k: 0.56 },
    dht: { x: 328, y: 254, k: 0.56 },
} as const;

const TestosteroneScene = ({ still }: SceneProps) => {
    const color = FAMILIES[0].color;
    const ringT = toScene(RING_CENTERS.A, F1.t.x, F1.t.y, F1.t.k);
    return (
        <svg {...svgProps} aria-label="Testosterona sofre aromatização em estradiol e redução 5-alfa em DHT">
            <Halo c={ringT} r={30} color={ACCENT} at={0.8} still={still} pulse />
            <g transform={place(F1.t.x, F1.t.y, F1.t.k)}>
                <Steroid color={color} accent={ACCENT} delay={0.05} still={still} />
            </g>
            <Caption x={F1.t.x} y={170} text="Testosterona" at={0.5} still={still} />

            <CurvedArrow from={[156, 156]} ctrl={[104, 160]} to={[96, 198]} color={ACCENT} label="aromatização" labelAt={[62, 164]} at={1.1} still={still} />
            <g transform={place(F1.e2.x, F1.e2.y, F1.e2.k)}>
                <Steroid color={color} ringA="aromatic" c19="off" accent={ACCENT} delay={1.55} still={still} />
            </g>
            <Caption x={F1.e2.x} y={H - 2} text="Estradiol (E2)" at={2.2} still={still} />

            <CurvedArrow from={[284, 156]} ctrl={[336, 160]} to={[344, 198]} color={ACCENT} label="5α-redutase" labelAt={[384, 164]} at={2.0} still={still} />
            <g transform={place(F1.dht.x, F1.dht.y, F1.dht.k)}>
                <Steroid color={color} ringA="saturated" accent={ACCENT} delay={2.45} still={still} />
            </g>
            <Caption x={F1.dht.x} y={H - 2} text="DHT" at={3.0} still={still} />
        </svg>
    );
};

/* ---------- Família 2: aromatização bloqueada ---------- */

const F2 = { x: 270, y: 196, k: 0.86 } as const;
const PILL = { x: 2, y: 202, w: 126, h: 36 } as const;
const BOUNCE = 14;

const DhtScene = ({ still }: SceneProps) => {
    const color = FAMILIES[1].color;
    const ringA = toScene(RING_CENTERS.A, F2.x, F2.y, F2.k);
    const hLabel = toScene([H5_END[0], H5_END[1] + 21], F2.x, F2.y, F2.k);
    const tipRest: Pt = [PILL.x + PILL.w + 22, PILL.y + PILL.h / 2];
    const hit: Pt = [tipRest[0] + BOUNCE + 8, tipRest[1]];
    return (
        <svg {...svgProps} aria-label="DHT: a aromatização é bloqueada">
            <Halo c={ringA} r={40} color={ACCENT} at={0.9} still={still} />
            <g transform={place(F2.x, F2.y, F2.k)}>
                <Steroid color={color} ringA="saturated" accent={ACCENT} delay={0.05} still={still} />
            </g>
            <motion.text x={4} y={40} fill={color} fontFamily="var(--font-display), sans-serif" fontSize={30} fontWeight={600}
                initial={still ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.45 }}>DHT</motion.text>
            <Caption x={4} y={66} text="Moléculas quimicamente" color="#E9D5FF" at={0.6} still={still} anchor="start" />
            <Caption x={4} y={86} text="rígidas" color="#E9D5FF" at={0.6} still={still} anchor="start" />
            <Caption x={hLabel[0] + 16} y={hLabel[1]} text="já reduzida" color={ACCENT} at={1.0} still={still} size={14} anchor="start" />

            {/* A aromatização tenta chegar ao anel A e volta. */}
            <motion.g
                initial={still ? false : { opacity: 0, x: -16 }}
                animate={still ? { opacity: 1, x: 0 } : { opacity: 1, x: [0, 0, BOUNCE, 0] }}
                transition={still ? { duration: 0 } : {
                    opacity: { delay: 0.9, duration: 0.3 },
                    x: { delay: 1.0, duration: 1.2, times: [0, 0.1, 0.45, 1], ease: 'easeInOut', repeat: Infinity, repeatDelay: 1.6 },
                }}
            >
                <rect x={PILL.x} y={PILL.y} width={PILL.w} height={PILL.h} rx={PILL.h / 2} fill="rgba(245,158,11,0.12)" stroke={ACCENT} strokeWidth={2} />
                <text x={PILL.x + PILL.w / 2} y={PILL.y + PILL.h / 2 + 5} textAnchor="middle" fill="#FDE68A" fontFamily={MONO} fontSize={14} fontWeight={600}>aromatização</text>
                <path d={`M${PILL.x + PILL.w + 3} ${tipRest[1]} L${tipRest[0] - 4} ${tipRest[1]}`} stroke={ACCENT} strokeWidth={2.6} strokeLinecap="round" />
                <path d={arrowHead([PILL.x + PILL.w, tipRest[1]], tipRest, 10)} fill={ACCENT} />
            </motion.g>
            <motion.g
                initial={still ? false : { opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.3, type: 'spring', stiffness: 400, damping: 18 }}
                style={{ transformOrigin: `${hit[0]}px ${hit[1]}px` }}
            >
                <circle cx={hit[0]} cy={hit[1]} r={12} fill="rgba(5,5,16,0.9)" stroke="#E11D48" strokeWidth={2} />
                <path d={`M${hit[0] - 5} ${hit[1] - 5} L${hit[0] + 5} ${hit[1] + 5} M${hit[0] + 5} ${hit[1] - 5} L${hit[0] - 5} ${hit[1] + 5}`} stroke="#FDA4AF" strokeWidth={2.6} strokeLinecap="round" />
            </motion.g>
            <Caption x={4} y={270} text="nunca viram" color={ROSE} at={1.9} still={still} size={16} anchor="start" />
            <Caption x={4} y={291} text="estrogênio" color={ROSE} at={1.9} still={still} size={16} anchor="start" />
        </svg>
    );
};

/* ---------- Família 3: sem o C19; Receptor Androgênico + atividade Progestínica ---------- */

const F3 = { x: 206, y: 126, k: 0.86 } as const;
const BOXES = {
    ar: { x: 6, y: 262, w: 206, h: 48 },
    pg: { x: 228, y: 262, w: 206, h: 48 },
} as const;

interface LinkProps {
    readonly from: Pt;
    readonly to: Pt;
    readonly color: string;
    readonly width: number;
    readonly at: number;
    readonly still: boolean;
    readonly period: number;
}

const Link = ({ from, to, color, width, at, still, period }: LinkProps) => (
    <g>
        <motion.path
            d={`M${from.join(' ')} L${to.join(' ')}`} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none"
            initial={still ? false : { pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.85 }}
            transition={{ pathLength: { delay: at, duration: 0.6, ease: 'easeOut' }, opacity: { delay: at, duration: 0.1 } }}
        />
        {!still && (
            <motion.circle
                r={width * 0.6 + 2} fill="#fff"
                initial={{ opacity: 0, cx: from[0], cy: from[1] }}
                animate={{ opacity: [0, 1, 1, 0], cx: [from[0], to[0]], cy: [from[1], to[1]] }}
                transition={{ delay: at + 0.8, duration: period, ease: 'easeIn', repeat: Infinity, repeatDelay: 0.6 }}
            />
        )}
    </g>
);

const NorScene = ({ still }: SceneProps) => {
    const color = FAMILIES[2].color;
    const c19 = toScene(C19_END, F3.x, F3.y, F3.k);
    const arIn: Pt = [BOXES.ar.x + BOXES.ar.w / 2, BOXES.ar.y];
    const pgIn: Pt = [BOXES.pg.x + BOXES.pg.w / 2, BOXES.pg.y];
    return (
        <svg {...svgProps} aria-label="19-nortestosterona: sem o carbono 19; liga-se ao Receptor Androgênico, com atividade Progestínica">
            <Halo c={c19} r={24} color={ACCENT} at={1.0} still={still} pulse />
            <g transform={place(F3.x, F3.y, F3.k)}>
                <Steroid color={color} c19="ghost" ghostDelay={1.1} accent={ACCENT} delay={0.05} still={still} />
            </g>
            <motion.path
                d={`M${70} ${32} L${c19[0] - 30} ${c19[1] - 14}`} stroke={ACCENT} strokeWidth={1.6} strokeDasharray="2 4" fill="none"
                initial={still ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 0.5 }}
            />
            <Caption x={2} y={22} text="Sem o carbono na posição 19" color={ACCENT} at={1.7} still={still} size={16} anchor="start" />

            <Link from={[192, 204]} to={arIn} color={color} width={8} at={2.3} still={still} period={0.8} />
            <Link from={[222, 204]} to={pgIn} color={ROSE} width={3.5} at={2.7} still={still} period={1.2} />
            <Caption x={130} y={232} text="massivamente" color="#6EE7B7" at={2.6} still={still} size={14} anchor="end" />
            <Caption x={290} y={232} text="periférica" color="#FDA4AF" at={3.0} still={still} size={14} anchor="start" />

            {([
                { box: BOXES.ar, text: 'Receptor Androgênico', stroke: color, fill: 'rgba(16,185,129,0.14)', ink: '#ECFDF5', at: 2.6 },
                { box: BOXES.pg, text: 'atividade Progestínica', stroke: ROSE, fill: 'rgba(251,113,133,0.12)', ink: '#FFE4E6', at: 3.0 },
            ] as const).map(({ box, text, stroke, fill, ink, at }) => (
                <motion.g key={text} initial={still ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: at, duration: 0.45 }}>
                    <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={14} fill={fill} stroke={stroke} strokeWidth={2} />
                    <text x={box.x + box.w / 2} y={box.y + box.h / 2 + 6} textAnchor="middle" fill={ink} fontFamily={BODY} fontSize={16} fontWeight={700}>{text}</text>
                </motion.g>
            ))}
        </svg>
    );
};

export const FullScene = ({ id, still }: { id: FamilyId; still: boolean }) => {
    if (id === 'testo') return <TestosteroneScene still={still} />;
    if (id === 'dht') return <DhtScene still={still} />;
    return <NorScene still={still} />;
};

/* ---------- Assinatura compacta (cartões recolhidos e comparação) ---------- */

export const CompactMolecule = ({ id, still }: { id: FamilyId; still: boolean }) => {
    const color = FAMILIES.find(f => f.id === id)?.color ?? '#fff';
    return (
        <svg viewBox={VIEWBOX} preserveAspectRatio="xMidYMid meet" className="w-full h-full block overflow-visible" aria-hidden>
            {id === 'testo' && <Steroid color={color} accent={ACCENT} font={26} stroke={5} still={still} />}
            {id === 'dht' && <Steroid color={color} ringA="saturated" accent={ACCENT} font={26} stroke={5} still={still} />}
            {id === 'nor' && <Steroid color={color} c19="ghost" ghostDelay={0.7} accent={ACCENT} font={26} stroke={5} still={still} />}
        </svg>
    );
};
