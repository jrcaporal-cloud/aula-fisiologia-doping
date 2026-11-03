import { Html } from '@react-three/drei';
import { CHANNELS, LABELED_CHANNEL, LABELED_RECEPTOR, RECEPTORS, VESICLE_REST, cascadePoints } from './layout';
import { DOSE_MICRO } from './model';
import type { Telemetry } from './engine';

type Side = 'left' | 'right' | 'top';

interface LabelProps {
    position: [number, number, number];
    text: string;
    color: string;
    visible: boolean;
    side?: Side;
    sub?: string;
}

const OFFSET: Record<Side, string> = {
    right: 'translate(14px, -50%)',
    left: 'translate(calc(-100% - 14px), -50%)',
    top: 'translate(-50%, calc(-100% - 14px))',
};

/** Rótulo curto ancorado num ponto 3D: ponto + traço + etiqueta. */
const Label = ({ position, text, color, visible, side = 'right', sub }: LabelProps) => (
    <Html position={position} zIndexRange={[30, 0]} style={{ pointerEvents: 'none' }}>
        <div
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 450ms ease' }}
            className="relative"
            aria-hidden={!visible}
        >
            <span
                className="absolute rounded-full"
                style={{ width: 7, height: 7, left: -3.5, top: -3.5, background: color, boxShadow: `0 0 10px ${color}` }}
            />
            <div
                className="absolute whitespace-nowrap rounded-md border px-2 py-[3px] font-body text-[15px] font-semibold leading-tight"
                style={{
                    transform: OFFSET[side],
                    color,
                    borderColor: `${color}66`,
                    background: 'rgba(5,5,16,0.82)',
                    top: 0,
                    left: 0,
                }}
            >
                {text}
                {sub && <span className="block text-[14px] font-normal text-gray-100">{sub}</span>}
            </div>
        </div>
    </Html>
);

interface SceneLabelsProps {
    step: number;
    dose: number;
    telemetry: Telemetry;
}

export const SceneLabels = ({ step, dose, telemetry }: SceneLabelsProps) => {
    const r = RECEPTORS[LABELED_RECEPTOR];
    const pts = cascadePoints(r);
    const ch = CHANNELS[3];
    const rest = VESICLE_REST[LABELED_CHANNEL];
    const cascadeOn = step >= 1 && step <= 2 && dose > 0;
    return (
        <group>
            <Label position={[-6.3, 0.42, 2.6]} text="Membrana" sub="bicamada lipídica" color="#93c5fd" visible side="top" />
            <Label position={[r.x - 0.3, 1.35, r.z]} text="Receptor IR-α/β" color="#34D399" visible={step <= 2} side="left" />
            <Label position={[r.x + 0.2, 1.12, r.z]} text="Insulina" color="#FBBF24" visible={step === 1 && telemetry.bound > 0} />
            <Label position={[r.x - 0.3, pts.kinase[1], r.z]} text="Tirosina quinase" color="#34D399" visible={cascadeOn} side="left" />
            <Label position={[pts.pi3k[0] + 0.15, pts.pi3k[1], pts.pi3k[2]]} text="PI3K" color="#c084fc" visible={cascadeOn} />
            <Label position={[pts.akt[0] + 0.15, pts.akt[1], pts.akt[2]]} text="Akt" color="#22D3EE" visible={cascadeOn} />
            <Label position={[rest[0] + 0.45, rest[1], rest[2]]} text="Vesícula GLUT4" sub="guardada no citoplasma" color="#93c5fd" visible={step <= 1} />
            <Label position={[ch.x + 0.05, 0.5, ch.z]} text="Canal GLUT4" sub="glicose entra" color="#93c5fd" visible={step >= 2 && telemetry.open > 1} side="top" />
            <Label position={[-2.0, -2.95, 1.3]} text="Glicogênio" color="#6ee7b7" visible={step >= 2 && telemetry.glycogen > 0.3} />
            <Label
                position={[5.4, 1.95, 0.6]}
                text="Insulina sobrando no sangue"
                sub="receptores já ocupados"
                color="#FBBF24"
                visible={step >= 1 && dose > DOSE_MICRO + 1}
                side="left"
            />
        </group>
    );
};
