import { motion, useReducedMotion } from 'framer-motion';
import { BOND_OH, BOUNDS, KETONE, OH, SKELETON, type Frame } from './steroidGeometry';

interface MoleculeProps {
    frame: Frame;
    /** Espessura do traço em px do SVG externo. */
    stroke?: number;
    /** Opacidade do esqueleto (para pôr outra coisa em evidência). */
    dim?: boolean;
    /** Rótulos O / OH. */
    labels?: boolean;
    idPrefix: string;
}

/** Esqueleto da testosterona em traço, desenhado ligação por ligação. Vive dentro de um <svg>. */
export const Molecule = ({ frame, stroke = 3, dim = false, labels = true, idPrefix }: MoleculeProps) => {
    const still = useReducedMotion();
    const sw = stroke / frame.scale;
    const [ox, oy] = frame.map(OH);
    const [kx, ky] = frame.map(KETONE);
    const grad = `${idPrefix}-stroke`;
    return (
        <g>
            <defs>
                <linearGradient
                    id={grad} gradientUnits="userSpaceOnUse"
                    x1={BOUNDS.x} y1={BOUNDS.y + BOUNDS.h} x2={BOUNDS.x + BOUNDS.w} y2={BOUNDS.y}
                >
                    <stop offset="0%" stopColor="#9F1239" />
                    <stop offset="55%" stopColor="#E11D48" />
                    <stop offset="100%" stopColor="#FB7185" />
                </linearGradient>
            </defs>
            <motion.g
                transform={frame.transform}
                fill="none" stroke={`url(#${grad})`} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"
                animate={{ opacity: dim ? 0.35 : 1 }}
                transition={{ duration: 0.5 }}
            >
                {[...SKELETON, BOND_OH].map((d, i) => (
                    <motion.path
                        key={i}
                        d={d}
                        initial={still ? false : { pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ pathLength: { delay: 0.1 + i * 0.09, duration: 0.6, ease: 'easeInOut' }, opacity: { delay: 0.1 + i * 0.09, duration: 0.15 } }}
                    />
                ))}
            </motion.g>
            {labels && (
                <motion.g
                    fill="#FB7185" fontSize={15} fontWeight={600} className="font-body"
                    initial={still ? false : { opacity: 0 }}
                    animate={{ opacity: dim ? 0.5 : 1 }}
                    transition={{ delay: still ? 0 : 1.1, duration: 0.5 }}
                >
                    <text x={kx - 6} y={ky + 9} textAnchor="end">O</text>
                    <text x={ox + 4} y={oy - 4}>OH</text>
                </motion.g>
            )}
        </g>
    );
};
