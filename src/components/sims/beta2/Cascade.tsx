import { motion } from 'framer-motion';
import { ArrowRight, CornerDownRight, Dumbbell, Flame, Wind } from 'lucide-react';
import type { ReactNode } from 'react';
import { C } from './content';

/**
 * A cascada do slide: β2 → adenilato ciclase (ATP → cAMP) → PKA → broncodilatação / HSL (lipólise);
 * e, acima de 8 mg por via oral, PI3K/Akt → hipertrofia. Acende por passo.
 * Os três desfechos levam um ícone (vento, chama, halter) além da cor.
 */

type NodeId = 'b2' | 'ac' | 'camp' | 'pka' | 'bronco' | 'hsl' | 'pi3k' | 'hyper';

/** Nós acesos em cada passo (0–2). */
const LIT: readonly (readonly NodeId[])[] = [
    ['b2'],
    ['b2', 'ac', 'camp', 'pka', 'bronco'],
    ['b2', 'ac', 'camp', 'pka', 'bronco', 'hsl', 'pi3k', 'hyper'],
];

const ORDER: readonly NodeId[] = LIT[2];
const delayOf = (id: NodeId) => ORDER.indexOf(id) * 0.12;

interface StepNodeProps {
    readonly lit: ReadonlySet<NodeId>;
    readonly id: NodeId;
    readonly color: string;
    readonly mono?: boolean;
    readonly icon?: ReactNode;
    readonly children: ReactNode;
}

const StepNode = ({ lit, id, color, mono, icon, children }: StepNodeProps) => {
    const on = lit.has(id);
    return (
        <motion.div className={`flex items-center gap-1.5 rounded-xl border px-3 py-1 text-[15px] font-bold whitespace-nowrap ${mono ? 'font-mono' : 'font-body'}`}
            initial={false}
            animate={{ opacity: on ? 1 : 0.66, backgroundColor: on ? `${color}2e` : 'rgba(255,255,255,0.04)', borderColor: on ? color : 'rgba(255,255,255,0.32)' }}
            transition={{ duration: 0.4, delay: on ? delayOf(id) : 0 }}
            style={{ color: on ? '#fff' : '#D1D5DB' }}>
            {icon}{children}
        </motion.div>
    );
};

const Link = ({ on, color }: { on: boolean; color: string }) => (
    <motion.span className="shrink-0 flex" initial={false} animate={{ color: on ? color : 'rgba(255,255,255,0.45)' }} transition={{ duration: 0.4 }}>
        <ArrowRight size={18} strokeWidth={2.4} />
    </motion.span>
);

interface CascadeProps {
    readonly step: number;
}

export const Cascade = ({ step }: CascadeProps) => {
    const lit = new Set(LIT[Math.min(step, LIT.length - 1)]);
    const both = (a: NodeId, b: NodeId) => lit.has(a) && lit.has(b);
    return (
        <div className="flex flex-col justify-center gap-2.5 h-full">
            <div className="flex items-center gap-1.5">
                <StepNode lit={lit} id="b2" color={C.cyan} mono>β2</StepNode>
                <Link on={both('b2', 'ac')} color={C.cyan} />
                <StepNode lit={lit} id="ac" color={C.cyan}>adenilato ciclase</StepNode>
                <Link on={both('ac', 'camp')} color={C.cyan} />
                <StepNode lit={lit} id="camp" color={C.cyan} mono>ATP → cAMP</StepNode>
                <Link on={both('camp', 'pka')} color={C.cyan} />
                <StepNode lit={lit} id="pka" color={C.cyan} mono>PKA</StepNode>
                <Link on={both('pka', 'bronco')} color={C.inhaled} />
                <div className="flex flex-col gap-1.5">
                    <StepNode lit={lit} id="bronco" color={C.inhaled} icon={<Wind size={16} />}>broncodilatação</StepNode>
                    <StepNode lit={lit} id="hsl" color={C.amber} icon={<Flame size={16} />}>HSL → lipólise</StepNode>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <motion.span className="shrink-0 flex items-center gap-1.5 font-mono text-[15px] font-bold pr-1" initial={false}
                    animate={{ color: lit.has('pi3k') ? '#FDA4AF' : 'rgba(229,231,235,0.7)' }} transition={{ duration: 0.4 }}>
                    <CornerDownRight size={18} strokeWidth={2.4} />oral &gt;8 mg
                </motion.span>
                <StepNode lit={lit} id="pi3k" color={C.rose} mono>PI3K/Akt</StepNode>
                <Link on={both('pi3k', 'hyper')} color={C.rose} />
                <StepNode lit={lit} id="hyper" color={C.rose} icon={<Dumbbell size={16} />}>hipertrofia · força isométrica pré-competição</StepNode>
            </div>
        </div>
    );
};
