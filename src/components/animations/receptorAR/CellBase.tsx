import { CHANNEL_X, DNA_Y, GPCR_X, Label, MEM_BOT, MEM_TOP, NUCLEUS, PORE, VIEW_H, VIEW_W } from './shapes';

const HEAD_GAP = 11;
const HEAD_R = 4.2;
/** Onde a bicamada abre espaço para as proteínas de membrana. */
const isProteinSlot = (x: number) => Math.abs(x - GPCR_X) < 17 || Math.abs(x - CHANNEL_X) < 15;

const HEADS = Array.from({ length: Math.floor(VIEW_W / HEAD_GAP) + 1 }, (_, i) => 4 + i * HEAD_GAP).filter(
    x => !isProteinSlot(x)
);

/** Dupla hélice: duas senoides defasadas e os "degraus" entre elas. */
const DNA_X0 = 58;
const DNA_X1 = 296;
const helix = (phase: number) => {
    const pts: string[] = [];
    for (let x = DNA_X0; x <= DNA_X1; x += 4) {
        const y = DNA_Y + 8 * Math.sin(((x - DNA_X0) / 38) * Math.PI * 2 + phase);
        pts.push(`${x},${y.toFixed(2)}`);
    }
    return `M ${pts.join(' L ')}`;
};
const RUNGS = Array.from({ length: Math.floor((DNA_X1 - DNA_X0) / 9.5) }, (_, i) => DNA_X0 + 5 + i * 9.5).map(x => {
    const t = ((x - DNA_X0) / 38) * Math.PI * 2;
    return { x, y1: DNA_Y + 8 * Math.sin(t), y2: DNA_Y + 8 * Math.sin(t + Math.PI) };
});

/** Bicamada lipídica: duas fileiras de cabeças polares com caudas voltadas para o meio. */
const Bilayer = () => (
    <g>
        <rect x={0} y={MEM_TOP} width={VIEW_W} height={MEM_BOT - MEM_TOP} fill="#F59E0B" opacity={0.07} />
        {HEADS.map(x => (
            <g key={x}>
                <path
                    d={`M ${x - 1.6},${MEM_TOP + 4} L ${x - 1.6},${MEM_TOP + 12} M ${x + 1.6},${MEM_TOP + 4} L ${x + 1.6},${MEM_TOP + 12}
                        M ${x - 1.6},${MEM_BOT - 4} L ${x - 1.6},${MEM_BOT - 12} M ${x + 1.6},${MEM_BOT - 4} L ${x + 1.6},${MEM_BOT - 12}`}
                    stroke="#B45309"
                    strokeWidth={1.1}
                    strokeLinecap="round"
                />
                <circle cx={x} cy={MEM_TOP + 2} r={HEAD_R} fill="#FCD34D" opacity={0.85} />
                <circle cx={x} cy={MEM_BOT - 2} r={HEAD_R} fill="#FCD34D" opacity={0.85} />
            </g>
        ))}
    </g>
);

const NuclearEnvelope = () => (
    <g>
        <defs>
            <mask id="rar-pore-mask">
                <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="white" />
                <circle cx={PORE.x} cy={PORE.y} r={13} fill="black" />
            </mask>
            <radialGradient id="rar-nucleo" cx="50%" cy="45%" r="60%">
                <stop offset="0%" stopColor="#1E1B4B" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#120F2E" stopOpacity={0.95} />
            </radialGradient>
        </defs>
        <ellipse {...NUCLEUS} fill="url(#rar-nucleo)" />
        <g mask="url(#rar-pore-mask)" fill="none" stroke="#A5B4FC" strokeOpacity={0.7}>
            <ellipse cx={NUCLEUS.cx} cy={NUCLEUS.cy} rx={NUCLEUS.rx} ry={NUCLEUS.ry} strokeWidth={2} />
            <ellipse cx={NUCLEUS.cx} cy={NUCLEUS.cy} rx={NUCLEUS.rx - 6} ry={NUCLEUS.ry - 6} strokeWidth={1.2} />
        </g>
        {/* Complexo do poro: dois anéis nas bordas da abertura */}
        <rect x={PORE.x - 17} y={PORE.y - 4} width={6} height={11} rx={3} fill="#A5B4FC" />
        <rect x={PORE.x + 11} y={PORE.y - 4} width={6} height={11} rx={3} fill="#A5B4FC" />
    </g>
);

const Dna = () => (
    <g>
        {RUNGS.map(r => (
            <line key={r.x} x1={r.x} x2={r.x} y1={r.y1} y2={r.y2} stroke="#C4B5FD" strokeOpacity={0.45} strokeWidth={1.4} />
        ))}
        <path d={helix(0)} fill="none" stroke="#C4B5FD" strokeWidth={2.2} strokeLinecap="round" />
        <path d={helix(Math.PI)} fill="none" stroke="#8B5CF6" strokeWidth={2.2} strokeLinecap="round" />
    </g>
);

/** Corte fixo da fibra: meio extracelular, bicamada, citosol, núcleo com poro e DNA. */
export const CellBase = () => (
    <g>
        <defs>
            <linearGradient id="rar-fora" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0B1020" />
                <stop offset="100%" stopColor="#0E1428" />
            </linearGradient>
            <radialGradient id="rar-citosol" cx="55%" cy="55%" r="75%">
                <stop offset="0%" stopColor="#13213F" />
                <stop offset="100%" stopColor="#0A1124" />
            </radialGradient>
        </defs>
        <rect x={0} y={0} width={VIEW_W} height={MEM_TOP} fill="url(#rar-fora)" />
        <rect x={0} y={MEM_BOT} width={VIEW_W} height={VIEW_H - MEM_BOT} fill="url(#rar-citosol)" />
        <Bilayer />
        <NuclearEnvelope />
        <Dna />

        <Label x={10} y={17} color="#CBD5E1" size={15}>
            MEIO EXTRACELULAR
        </Label>
        <Label x={10} y={107} color="#FCD34D" size={15}>
            bicamada lipídica
        </Label>
        <Label x={10} y={127} color="#CBD5E1" size={15}>
            CITOSOL
        </Label>
        <Label x={78} y={288} color="#C7D2FE" size={15}>
            NÚCLEO
        </Label>
        <Label x={156} y={234} anchor="end" color="#C7D2FE" size={15}>
            poro nuclear
        </Label>
        <Label x={DNA_X0 + 26} y={DNA_Y + 32} color="#C4B5FD" size={15}>
            DNA
        </Label>
    </g>
);
