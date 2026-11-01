import type { ChangeEvent } from 'react';
import {
    DOSE_COMA,
    DOSE_MAX,
    DOSE_MICRO,
    DOSE_SATURATION,
    GLUCOSE_BANDS,
    STEPS,
    STEP_COUNT,
    doseLabel,
    glucoseBandColor,
    zoneForDose,
} from './model';

const CARD = 'rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)]';

export const StepCard = ({ step }: { step: number }) => {
    const info = STEPS[step];
    return (
        <div className={`${CARD} px-4 py-3`}>
            <div className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.14em] text-gray-300">
                <span className="rounded bg-white/10 px-1.5 py-0.5 text-white">
                    {step + 1}/{STEP_COUNT}
                </span>
                <span>{info.kicker}</span>
            </div>
            <h3 className="mt-1.5 font-display text-[22px] font-semibold leading-tight text-white">{info.title}</h3>
            <p className="mt-1 font-body text-[14px] leading-snug text-gray-200">{info.text}</p>
        </div>
    );
};

interface MetersProps {
    glucose: number;
    glycogen: number;
}

export const Meters = ({ glucose, glycogen }: MetersProps) => {
    const gColor = glucoseBandColor(glucose);
    return (
        <div className={`${CARD} flex flex-1 flex-col px-4 py-3`}>
            <div className="flex items-end justify-between font-mono text-[13px] uppercase tracking-[0.08em] text-gray-100">
                <span>Glicose no sangue</span>
                <span className="text-right leading-tight text-emerald-200">
                    Glicogênio
                    <br />
                    muscular
                </span>
            </div>
            <div className="mt-2.5 flex min-h-0 flex-1 items-stretch gap-3">
                {/* Medidor de glicemia com faixas qualitativas ligadas à régua */}
                <div className="relative w-12 flex-none overflow-hidden rounded-lg border border-white/15 bg-black/50">
                    {GLUCOSE_BANDS.map(b => (
                        <div
                            key={b.label}
                            className="absolute inset-x-0"
                            style={{ bottom: `${b.from * 100}%`, height: `${(b.to - b.from) * 100}%`, background: `${b.color}24` }}
                        />
                    ))}
                    <div
                        className="absolute inset-1 origin-bottom rounded-md transition-[transform,background-color] duration-150 ease-linear"
                        style={{
                            transform: `scaleY(${Math.max(glucose, 0.02)})`,
                            background: `linear-gradient(to top, ${gColor}, ${gColor}aa)`,
                            boxShadow: `0 0 18px ${gColor}88`,
                        }}
                    />
                </div>
                <div className="relative flex-1">
                    {GLUCOSE_BANDS.map(b => {
                        const active = gColor === b.color;
                        return (
                            <div
                                key={b.label}
                                className="absolute left-0 right-0 flex items-center gap-2"
                                style={{ bottom: `${((b.from + b.to) / 2) * 100}%`, transform: 'translateY(50%)' }}
                            >
                                <span className="h-[2px] w-3 flex-none" style={{ background: b.color }} />
                                <span
                                    className="font-body text-[13px] leading-tight transition-colors"
                                    style={{ color: active ? '#fff' : '#cbd5e1', fontWeight: active ? 700 : 400 }}
                                >
                                    {b.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
                {/* Glicogênio muscular */}
                <div className="relative w-10 flex-none overflow-hidden rounded-lg border border-white/15 bg-black/50">
                    <div
                        className="absolute inset-1 origin-bottom rounded-md transition-transform duration-150 ease-linear"
                        style={{
                            transform: `scaleY(${Math.max(glycogen, 0.02)})`,
                            background: 'linear-gradient(to top, #047857, #6ee7b7)',
                            boxShadow: '0 0 16px rgba(110,231,183,0.45)',
                        }}
                    />
                </div>
            </div>
            <div className="mt-auto flex items-center pt-2">
                <span className="whitespace-nowrap rounded-full border border-amber-400/50 bg-amber-400/10 px-2 py-0.5 font-mono text-[12px] text-amber-200">
                    modelo ilustrativo · sem mg/dL
                </span>
            </div>
        </div>
    );
};

const pct = (d: number) => `${(d / DOSE_MAX) * 100}%`;

interface DoseControlProps {
    dose: number;
    onDose: (dose: number) => void;
}

export const DoseControl = ({ dose, onDose }: DoseControlProps) => {
    const zone = zoneForDose(dose);
    const onChange = (e: ChangeEvent<HTMLInputElement>) => onDose(Number(e.target.value));
    const microP = (DOSE_MICRO / DOSE_MAX) * 100;
    const comaP = (DOSE_COMA / DOSE_MAX) * 100;
    return (
        <div className={`${CARD} grid grid-cols-[176px_1fr_372px] items-center gap-5 px-5 py-3`}>
            <div>
                <div className="font-mono text-[13px] uppercase tracking-[0.12em] text-gray-300">Dose de insulina</div>
                <div className="font-display text-[40px] font-semibold leading-none transition-colors duration-300" style={{ color: zone.color }}>
                    {doseLabel(dose)}
                </div>
            </div>

            <div className="relative pb-7 pt-6">
                <div className="absolute top-0 -translate-x-1/2 whitespace-nowrap font-mono text-[12px] text-amber-200" style={{ left: pct(DOSE_SATURATION) }}>
                    ~12 UI · saturação de receptores IR
                </div>
                <div className="relative h-4 rounded-full border border-white/15">
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `linear-gradient(90deg, #10B981 0%, #10B981 ${microP}%, #F59E0B ${comaP}%, #E11D48 ${comaP}%, #E11D48 100%)`,
                        }}
                    />
                    {[DOSE_MICRO, DOSE_SATURATION, DOSE_COMA].map(d => (
                        <span key={d} className="absolute -bottom-1.5 -top-1.5 w-[3px] -translate-x-1/2 rounded bg-white/90" style={{ left: pct(d) }} />
                    ))}
                    <div
                        className="pointer-events-none absolute top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white transition-[left] duration-150"
                        style={{ left: pct(dose), background: zone.color, boxShadow: `0 0 0 4px ${zone.color}44, 0 0 18px ${zone.color}` }}
                    />
                    <input
                        type="range"
                        min={0}
                        max={DOSE_MAX}
                        step={1}
                        value={dose}
                        onChange={onChange}
                        onPointerUp={e => e.currentTarget.blur()}
                        aria-label="Dose de insulina"
                        className="absolute -inset-y-3 inset-x-0 w-full cursor-pointer opacity-0"
                    />
                </div>
                <div className="absolute bottom-0 left-0 font-mono text-[12px] text-gray-300">0</div>
                <div className="absolute bottom-0 -translate-x-full whitespace-nowrap pr-1 font-mono text-[12px] text-emerald-300" style={{ left: pct(DOSE_MICRO) }}>
                    ~10 UI · microdose (stack)
                </div>
                <div className="absolute bottom-0 whitespace-nowrap pl-1 font-mono text-[12px] text-rose-300" style={{ left: pct(DOSE_COMA) }}>
                    ~15+ UI · coma
                </div>
            </div>

            <div className="border-l-[3px] pl-4" style={{ borderColor: zone.color }}>
                <div className="font-display text-[17px] font-semibold uppercase tracking-wide" style={{ color: zone.color }}>
                    {zone.title}
                </div>
                <p className="mt-0.5 font-body text-[13.5px] leading-snug text-gray-100">{zone.text}</p>
            </div>
        </div>
    );
};
