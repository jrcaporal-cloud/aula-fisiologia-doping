import { motion } from 'framer-motion';
import { TONE_STYLES, type FamilyTone } from './map';
import { SvgText } from './ui';

/**
 * Abertura do mapa: onde cada família age no corpo. Esquema simplificado (não anatômico):
 * hipófise → GH → fígado → IGF-1 → músculo e tendão; hipófise → LH → testículo; pâncreas e cérebro.
 */

const VIEW = { w: 1080, h: 252 } as const;
const NODE = { w: 196, h: 50 } as const;

interface OrganNode { id: string; name: string; x: number; y: number }
const NODES: readonly OrganNode[] = [
    { id: 'hipofise', name: 'Hipófise', x: 150, y: 74 },
    { id: 'figado', name: 'Fígado', x: 520, y: 74 },
    { id: 'musculo', name: 'Músculo e tendão', x: 900, y: 74 },
    { id: 'testiculo', name: 'Testículo', x: 150, y: 200 },
    { id: 'pancreas', name: 'Pâncreas e cérebro', x: 900, y: 200 },
];

interface Link { from: string; to: string; label: string }
const LINKS: readonly Link[] = [
    { from: 'hipofise', to: 'figado', label: 'GH' },
    { from: 'figado', to: 'musculo', label: 'IGF-1' },
    { from: 'hipofise', to: 'testiculo', label: 'LH' },
];

interface Chip { node: string; text: string; tone: FamilyTone; dx: number; dy: number }
const CHIPS: readonly Chip[] = [
    { node: 'hipofise', text: 'Secretagogos de GH', tone: 'amber', dx: 0, dy: -52 },
    { node: 'musculo', text: 'Fatores de crescimento', tone: 'violet', dx: -40, dy: -52 },
    { node: 'musculo', text: 'BPC-157', tone: 'red', dx: 0, dy: 50 },
    { node: 'testiculo', text: 'hCG, LH', tone: 'sky', dx: 180, dy: 0 },
    { node: 'pancreas', text: 'GLP-1', tone: 'slate', dx: -165, dy: 0 },
];

const byId = (id: string): OrganNode => NODES.find(n => n.id === id) ?? NODES[0];

export const AxisDiagram = () => (
    <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} className="w-full h-full" role="img" aria-label="Onde cada família de peptídeos age">
        <defs>
            <marker id="axis-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="rgba(226,232,240,0.7)" />
            </marker>
        </defs>
        {LINKS.map((l, i) => {
            const a = byId(l.from);
            const b = byId(l.to);
            const vertical = a.x === b.x;
            const x1 = vertical ? a.x : a.x + NODE.w / 2;
            const y1 = vertical ? a.y + NODE.h / 2 : a.y;
            const x2 = vertical ? b.x : b.x - NODE.w / 2 - 4;
            const y2 = vertical ? b.y - NODE.h / 2 - 4 : b.y;
            return (
                <g key={l.label}>
                    <motion.line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(226,232,240,0.55)" strokeWidth={2} markerEnd="url(#axis-arrow)"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.3 + i * 0.25 }} />
                    <motion.circle r={4.5} fill="#F8FAFC" cx={x1} cy={y1}
                        initial={{ cx: x1, cy: y1, opacity: 0 }}
                        animate={{ cx: [x1, x2], cy: [y1, y2], opacity: [0, 1, 0] }}
                        transition={{ duration: 1.8, repeat: Infinity, delay: 1.2 + i * 0.5, ease: 'easeInOut' }} />
                    <SvgText x={(x1 + x2) / 2 + (vertical ? 14 : 0)} y={(y1 + y2) / 2 - (vertical ? 0 : 10)} text={l.label}
                        anchor={vertical ? 'start' : 'middle'} size={16} color="#F1F5F9" weight={700} />
                </g>
            );
        })}
        {CHIPS.map((c, i) => {
            const n = byId(c.node);
            return (
                <motion.line key={`link-${c.text}`} x1={n.x + c.dx} y1={n.y + c.dy} x2={n.x} y2={n.y}
                    stroke={TONE_STYLES[c.tone].border} strokeWidth={1.5} strokeDasharray="4 5"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ duration: 0.4, delay: 1.0 + i * 0.18 }} />
            );
        })}
        {NODES.map((n, i) => (
            <motion.g key={n.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35, delay: i * 0.08 }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}>
                <rect x={n.x - NODE.w / 2} y={n.y - NODE.h / 2} width={NODE.w} height={NODE.h} rx={14}
                    fill="#16161f" stroke="rgba(255,255,255,0.28)" />
                <SvgText x={n.x} y={n.y + 6} text={n.name} anchor="middle" size={17} color="#F8FAFC" weight={700} />
            </motion.g>
        ))}
        {CHIPS.map((c, i) => {
            const n = byId(c.node);
            const tone = TONE_STYLES[c.tone];
            const w = c.text.length * 9.2 + 28;
            const cx = n.x + c.dx;
            const cy = n.y + c.dy;
            return (
                <motion.g key={c.text} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 1.0 + i * 0.18 }}>
                    <rect x={cx - w / 2} y={cy - 16} width={w} height={32} rx={16} fill={tone.bg} stroke={tone.border} strokeWidth={1.5} />
                    <SvgText x={cx} y={cy + 5.5} text={c.text} anchor="middle" size={15.5} color={tone.text} weight={700} />
                </motion.g>
            );
        })}
    </svg>
);
