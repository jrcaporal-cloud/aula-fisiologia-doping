import type { ChangeEvent } from 'react';
import {
    DOSE_COMA,
    DOSE_MAX,
    DOSE_MICRO,
    DOSE_SATURATION,
    GLUCOSE_BANDS,
    ZONES,
    STEPS,
    doseLabel,
    glucoseBandColor,
    zoneForDose,
} from './model';
import { ZONE_ICONS } from './zoneIcons';

const CARD = 'rounded-2xl border border-white/10 bg-[rgba(8,8,18,0.72)]';

export const StepCard = ({ step }: { step: number }) => {
    const info = STEPS[step];
    return (
        <div className={`${CARD} px-4 py-2.5`}>
            <div className="font-mono text-[14px] uppercase tracking-[0.1em] text-gray-300">{info.kicker}</div>
            <h3 className="mt-1 font-display text-[22px] font-semibold leading-tight text-white">{info.title}</h3>
            <p className="mt-1 font-body text-[15.5px] leading-snug text-gray-200">{info.text}</p>
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
        <div className={`${CARD} flex min-h-0 flex-1 flex-col px-4 py-2.5`}>
            <div className="flex items-end justify-between font-mono text-[14px] uppercase tracking-[0.04em] text-gray-100">
                <span>Glicose no sangue</span>
                <span className="text-right leading-tight text-cyan-200">
                    Glicogênio
                    <br />
                    muscular
                </span>
            </div>
            <div className="mt-2 flex min-h-0 flex-1 items-stretch gap-3">
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
                                    className="font-body text-[14.5px] leading-tight transition-colors"
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
                            background: 'linear-gradient(to top, #0E7490, #67E8F9)',
                            boxShadow: '0 0 16px rgba(103,232,249,0.45)',
                        }}
                    />
                </div>
            </div>
            <div className="mt-auto flex items-center pt-1.5">
                <span className="whitespace-nowrap rounded-full border border-amber-400/50 bg-amber-400/10 px-2 py-0.5 font-mono text-[14px] text-amber-200">
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
    const ZoneIcon = ZONE_ICONS[zone.id];
    const onChange = (e: ChangeEvent<HTMLInputElement>) => onDose(Number(e.target.value));
    const microP = (DOSE_MICRO / DOSE_MAX) * 100;
    const comaP = (DOSE_COMA / DOSE_MAX) * 100;
    return (
        <div className={`${CARD} grid grid-cols-[148px_1fr_384px] items-center gap-4 px-4 py-2`} style={{ height: 124 }}>
            <div>
                <div className="font-mono text-[14px] uppercase tracking-[0.06em] text-gray-300">Dose de insulina</div>
                <div className="font-display text-[40px] font-semibold leading-none transition-colors duration-300" style={{ color: zone.color }}>
                    {doseLabel(dose)}
                </div>
            </div>

            <div className="relative px-1 pb-7 pt-7">
                <div className="absolute top-0 -translate-x-1/2 whitespace-nowrap font-body text-[15px] text-amber-200" style={{ left: pct(DOSE_SATURATION) }}>
                    ~12 UI · saturação de receptores IR
                </div>
                <div className="relative h-4 rounded-full border border-white/15">
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            background: `linear-gradient(90deg, ${ZONES.green.color} 0%, ${ZONES.green.color} ${microP}%, ${ZONES.yellow.color} ${comaP}%, ${ZONES.red.color} ${comaP}%, ${ZONES.red.color} 100%)`,
                        }}
                    />
                    {[DOSE_MICRO, DOSE_SATURATION, DOSE_COMA].map(d => (
                        <span key={d} className="absolute -bottom-1.5 -top-1.5 w-[3px] -translate-x-1/2 rounded bg-white/90" style={{ left: pct(d) }} />
                    ))}
                    <div
                        className="pointer-events-none absolute top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white text-[#050510] transition-[left] duration-150"
                        style={{ left: pct(dose), background: zone.color, boxShadow: `0 0 0 4px ${zone.color}44, 0 0 18px ${zone.color}` }}
                    >
                        <ZoneIcon size={16} strokeWidth={2.6} aria-hidden />
                    </div>
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
                <div className="absolute bottom-0 left-1 font-body text-[15px] text-gray-300">0</div>
                <div className="absolute bottom-0 -translate-x-full whitespace-nowrap pr-1 font-body text-[15px] text-cyan-300" style={{ left: pct(DOSE_MICRO) }}>
                    ~10 UI · microdose (stack)
                </div>
                <div className="absolute bottom-0 -translate-x-1/2 whitespace-nowrap font-body text-[15px] text-rose-300" style={{ left: pct(DOSE_COMA) }}>
                    ~15+ UI · coma
                </div>
            </div>

            <div className="border-l-[3px] pl-3" style={{ borderColor: zone.color }}>
                <div className="flex items-center gap-2 font-display text-[18px] font-semibold uppercase leading-tight tracking-wide" style={{ color: zone.color }}>
                    <ZoneIcon size={20} strokeWidth={2.2} className="flex-none" aria-hidden />
                    {zone.title}
                </div>
                <p className="mt-0.5 font-body text-[14.5px] leading-snug text-gray-100">{zone.text}</p>
            </div>
        </div>
    );
};
