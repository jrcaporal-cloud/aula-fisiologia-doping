import { C } from './content';

/** A bolsa de sangue, personagem da linha do tempo: nível de enchimento e estado (fresca/congelada). */

interface BloodBagProps {
    readonly x: number;
    readonly y: number;
    /** 0 = vazia, 1 = cheia. */
    readonly fill: number;
    readonly frozen: number;
    readonly opacity?: number;
}

const BAG_W = 34;
const BAG_H = 46;

export const BloodBag = ({ x, y, fill, frozen, opacity = 1 }: BloodBagProps) => {
    const left = x - BAG_W / 2;
    const top = y - BAG_H / 2;
    const level = Math.max(0, Math.min(1, fill)) * (BAG_H - 8);
    const liquid = frozen > 0.5 ? C.crimson : C.red;
    return (
        <g opacity={opacity}>
            <defs>
                <clipPath id="bag-clip">
                    <rect x={left} y={top} width={BAG_W} height={BAG_H} rx={9} />
                </clipPath>
            </defs>
            {/* tubo e alça */}
            <path d={`M${x} ${top} L${x} ${top - 10} Q${x} ${top - 16} ${x + 7} ${top - 16} L${x + 16} ${top - 16}`} fill="none" stroke="#E5E7EB" strokeWidth={2} strokeLinecap="round" />
            <rect x={x - 6} y={top - 4} width={12} height={6} rx={2} fill="#E5E7EB" />
            <rect x={left} y={top} width={BAG_W} height={BAG_H} rx={9} fill="rgba(255,255,255,0.06)" />
            <g clipPath="url(#bag-clip)">
                <rect x={left} y={top + BAG_H - 4 - level} width={BAG_W} height={level + 4} fill={liquid} />
                <rect x={left + 5} y={top + 6} width={5} height={BAG_H - 14} rx={2.5} fill="#fff" opacity={0.18} />
            </g>
            <rect x={left} y={top} width={BAG_W} height={BAG_H} rx={9} fill="none"
                stroke={frozen > 0.5 ? C.ice : '#F3F4F6'} strokeWidth={frozen > 0.5 ? 2.4 : 1.8} />
            {frozen > 0.01 && (
                <g opacity={frozen} stroke={C.ice} strokeWidth={1.6} strokeLinecap="round">
                    {/* cristal de gelo */}
                    {[0, 60, 120].map(a => {
                        const r = (a * Math.PI) / 180;
                        return <line key={a} x1={x - 8 * Math.cos(r)} y1={y + 4 - 8 * Math.sin(r)} x2={x + 8 * Math.cos(r)} y2={y + 4 + 8 * Math.sin(r)} />;
                    })}
                </g>
            )}
        </g>
    );
};
