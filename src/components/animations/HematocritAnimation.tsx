import { motion, useAnimationFrame } from 'framer-motion';
import { useRef, useState } from 'react';

// Individual blood cell
interface Cell {
    id: number;
    x: number;
    y: number;
    speed: number;
    size: number;
    color: string;
}

const VESSEL_WIDTH = 280;
const VESSEL_HEIGHT = 80;

function useCells(count: number, spread: number, speedMult: number) {
    const cellsRef = useRef<Cell[]>(
        Array.from({ length: count }, (_, i) => ({
            id: i,
            x: Math.random() * VESSEL_WIDTH,
            y: spread * 0.2 + Math.random() * (spread * 0.6),
            speed: (0.4 + Math.random() * 0.6) * speedMult,
            size: 7 + Math.random() * 5,
            color: i % 6 === 0 ? '#ffffff' : '#e11d48',
        }))
    );
    const [, forceUpdate] = useState(0);

    useAnimationFrame(() => {
        cellsRef.current = cellsRef.current.map(c => ({
            ...c,
            x: c.x > VESSEL_WIDTH + 20 ? -20 : c.x + c.speed,
        }));
        forceUpdate(n => n + 1);
    });

    return cellsRef.current;
}

const Vessel = ({
    label, hct, speedMult, cellCount, spread, accentColor, danger
}: {
    label: string; hct: string; speedMult: number; cellCount: number;
    spread: number; accentColor: string; danger?: boolean;
}) => {
    const cells = useCells(cellCount, spread, speedMult);

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Label */}
            <div className="text-center">
                <div className="text-xs uppercase tracking-widest mb-1" style={{ color: accentColor }}>{label}</div>
                <motion.div
                    className="text-2xl font-display font-bold"
                    style={{ color: danger ? '#e11d48' : '#ffffff' }}
                    animate={{ scale: danger ? [1, 1.04, 1] : 1 }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                >
                    {hct}
                </motion.div>
            </div>

            {/* Vessel tube */}
            <div
                className="relative rounded-full overflow-hidden"
                style={{
                    width: VESSEL_WIDTH,
                    height: spread,
                    background: 'rgba(5,5,20,0.8)',
                    border: `1.5px solid ${accentColor}44`,
                    boxShadow: danger
                        ? `0 0 18px ${accentColor}33, inset 0 0 20px rgba(0,0,0,0.6)`
                        : `inset 0 0 20px rgba(0,0,0,0.6)`,
                }}
            >
                {/* Inner glow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `radial-gradient(ellipse at 50% -10%, ${accentColor}18 0%, transparent 70%)`,
                    }}
                />

                {/* Cells */}
                {cells.map(cell => (
                    <div
                        key={cell.id}
                        className="absolute rounded-full"
                        style={{
                            left: cell.x,
                            top: cell.y,
                            width: cell.size,
                            height: cell.size * 0.65,
                            background: cell.color === '#ffffff'
                                ? 'radial-gradient(circle at 35% 35%, #ffffff, #aaaacc)'
                                : `radial-gradient(circle at 35% 35%, ${accentColor}, #7f1d1d)`,
                            opacity: 0.85,
                            transform: 'translateY(-50%)',
                        }}
                    />
                ))}

                {/* Vessel wall sheen */}
                <div
                    className="absolute top-0 left-0 right-0 h-1/4 pointer-events-none"
                    style={{
                        background: `linear-gradient(to bottom, ${accentColor}15, transparent)`,
                    }}
                />
            </div>

            {/* Flow speed indicator */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>Velocidade:</span>
                <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                        <motion.div
                            key={i}
                            className="w-3 h-1 rounded-full"
                            style={{ background: i < Math.round(speedMult * 5) ? accentColor : 'rgba(255,255,255,0.1)' }}
                            animate={i < Math.round(speedMult * 5) ? { opacity: [0.5, 1, 0.5] } : {}}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const HematocritAnimation = () => {
    return (
        <motion.div
            className="w-full flex flex-col items-center gap-6 py-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7 }}
        >
            {/* Title */}
            <div className="text-center mb-2">
                <p className="text-xs uppercase tracking-[0.25em] text-gray-400">Comparação de Fluxo Sanguíneo</p>
            </div>

            {/* Side-by-side vessels */}
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                <Vessel
                    label="Fisiologia Normal"
                    hct="HCT ~45%"
                    speedMult={2.5}
                    cellCount={18}
                    spread={VESSEL_HEIGHT}
                    accentColor="#60a5fa"
                />

                {/* Divider */}
                <div className="flex flex-col items-center gap-2 pointer-events-none select-none">
                    <motion.div
                        className="text-3xl text-gray-600"
                        animate={{ x: [-4, 4, -4] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        VS
                    </motion.div>
                </div>

                <Vessel
                    label="rhEPO Abusiva"
                    hct="HCT >55-60%"
                    speedMult={0.25}
                    cellCount={40}
                    spread={VESSEL_HEIGHT}
                    accentColor="#e11d48"
                    danger
                />
            </div>

            {/* Warning */}
            <motion.div
                className="mt-2 px-5 py-2 rounded-xl border border-red-900/40 bg-red-950/20 text-center max-w-lg"
                animate={{ borderColor: ['rgba(127,29,29,0.4)', 'rgba(225,29,72,0.5)', 'rgba(127,29,29,0.4)'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
            >
                <p className="text-xs text-red-300 leading-relaxed">
                    ⚠️ Hiperviscosidade → redução do retorno venoso → no sono com FC ~30bpm:{' '}
                    <strong className="text-white">microtrombose + infarto agudo</strong>
                </p>
            </motion.div>
        </motion.div>
    );
};
