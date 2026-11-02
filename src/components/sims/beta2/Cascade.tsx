import { motion, useReducedMotion } from 'framer-motion';
import { C } from './content';

/**
 * A cascada do slide: β2 → adenilato ciclase (ATP → cAMP) → PKA → broncodilatação / HSL (lipólise);
 * e, acima de 8 mg por via oral, PI3K/Akt → hipertrofia. Acende por passo.
 */

type NodeId = 'b2' | 'ac' | 'camp' | 'pka' | 'bronco' | 'hsl' | 'pi3k' | 'hyper';

interface Node {
    readonly id: NodeId;
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly label: string;
    readonly color: string;
}

const H = 34;
const NODES: readonly Node[] = [
    { id: 'b2', x: 12, y: 44, w: 58, label: 'β2', color: C.cyan },
    { id: 'ac', x: 98, y: 44, w: 150, label: 'adenilato ciclase', color: C.cyan },
    { id: 'camp', x: 276, y: 44, w: 116, label: 'ATP → cAMP', color: C.cyan },
    { id: 'pka', x: 420, y: 44, w: 62, label: 'PKA', color: C.cyan },
    { id: 'bronco', x: 512, y: 14, w: 176, label: 'broncodilatação', color: C.green },
    { id: 'hsl', x: 512, y: 74, w: 176, label: 'HSL → lipólise', color: C.amber },
    { id: 'pi3k', x: 98, y: 118, w: 150, label: 'PI3K/Akt', color: C.rose },
    { id: 'hyper', x: 276, y: 118, w: 412, label: 'hipertrofia · força isométrica pré-competição', color: C.rose },
];

const byId = (id: NodeId) => NODES.find(n => n.id === id) as Node;
const right = (n: Node) => ({ x: n.x + n.w, y: n.y + H / 2 });
const left = (n: Node) => ({ x: n.x, y: n.y + H / 2 });

interface Edge {
    readonly from: NodeId;
    readonly to: NodeId;
    readonly d: string;
}

const straight = (a: NodeId, b: NodeId): Edge => {
    const p = right(byId(a));
    const q = left(byId(b));
    const mx = (p.x + q.x) / 2;
    return { from: a, to: b, d: `M ${p.x} ${p.y} C ${mx} ${p.y}, ${mx} ${q.y}, ${q.x} ${q.y}` };
};

const b2 = byId('b2');
const EDGES: readonly Edge[] = [
    straight('b2', 'ac'),
    straight('ac', 'camp'),
    straight('camp', 'pka'),
    straight('pka', 'bronco'),
    straight('pka', 'hsl'),
    { from: 'b2', to: 'pi3k', d: `M ${b2.x + b2.w / 2} ${b2.y + H} L ${b2.x + b2.w / 2} ${byId('pi3k').y + H / 2} L ${byId('pi3k').x} ${byId('pi3k').y + H / 2}` },
    straight('pi3k', 'hyper'),
];

/** Nós acesos em cada passo (0–2). */
const LIT: readonly (readonly NodeId[])[] = [
    ['b2'],
    ['b2', 'ac', 'camp', 'pka', 'bronco'],
    ['b2', 'ac', 'camp', 'pka', 'bronco', 'hsl', 'pi3k', 'hyper'],
];

interface CascadeProps {
    readonly step: number;
}

export const Cascade = ({ step }: CascadeProps) => {
    const reduced = useReducedMotion() ?? false;
    const lit = new Set(LIT[Math.min(step, LIT.length - 1)]);
    const order = (id: NodeId) => LIT[2].indexOf(id);
    return (
        <svg viewBox="0 0 700 160" className="absolute inset-0 w-full h-full block" role="img"
            aria-label="Cascata: beta-2, adenilato ciclase, cAMP, PKA, broncodilatação e lipólise; acima de 8 mg oral, PI3K/Akt e hipertrofia">
            {EDGES.map(e => {
                const on = lit.has(e.from) && lit.has(e.to);
                const color = byId(e.to).color;
                return (
                    <g key={`${e.from}-${e.to}`}>
                        <motion.path d={e.d} fill="none" strokeWidth={2} initial={false}
                            animate={{ stroke: on ? color : 'rgba(255,255,255,0.22)' }} transition={{ duration: 0.4, delay: on ? order(e.to) * 0.15 : 0 }} />
                        {on && !reduced && (
                            <motion.circle r={3.2} fill={color} initial={{ offsetDistance: '0%' }} animate={{ offsetDistance: '100%' }}
                                transition={{ duration: 1.1, repeat: Infinity, ease: 'linear', delay: order(e.to) * 0.15 }}
                                style={{ offsetPath: `path("${e.d}")` }} />
                        )}
                    </g>
                );
            })}
            <motion.text x={b2.x + b2.w / 2 + 8} y={104} className="font-mono" fontSize={12} fontWeight={700} initial={false}
                animate={{ fill: lit.has('pi3k') ? '#FDA4AF' : 'rgba(229,231,235,0.55)' }}>oral &gt;8 mg</motion.text>
            {NODES.map(n => {
                const on = lit.has(n.id);
                return (
                    <motion.g key={n.id} initial={false} animate={{ opacity: on ? 1 : 0.5 }} transition={{ duration: 0.4, delay: on ? order(n.id) * 0.15 : 0 }}>
                        <motion.rect x={n.x} y={n.y} width={n.w} height={H} rx={10} strokeWidth={1.4} initial={false}
                            animate={{ fill: on ? `${n.color}2e` : 'rgba(255,255,255,0.03)', stroke: on ? n.color : 'rgba(255,255,255,0.25)' }}
                            transition={{ duration: 0.4, delay: on ? order(n.id) * 0.15 : 0 }} />
                        <text x={n.x + n.w / 2} y={n.y + 22} textAnchor="middle" className={n.id === 'b2' || n.id === 'pka' || n.id === 'pi3k' || n.id === 'camp' ? 'font-mono' : 'font-body'}
                            fontSize={14} fontWeight={700} fill={on ? '#fff' : '#D1D5DB'}>{n.label}</text>
                    </motion.g>
                );
            })}
        </svg>
    );
};
