import { useEffect, useRef } from 'react';
import { DOPING_STEP, type Genotype } from './content';
import { GLUC_BOND, GLUC_PATH, ROUTES, STEROID_OFFSET, STEROID_PATH, SYRINGE_X, VESSEL, type RouteId } from './geometry';

/**
 * Moléculas de testosterona percorrendo o esquema (motor em requestAnimationFrame,
 * escrevendo direto no DOM: nada de re-render por quadro).
 * Gene normal: na UGT2B17 a molécula pausa, ganha o ácido glucurônico e muda de cor.
 * Deleção: passa reto pelo fígado e sai pelo intestino.
 */

interface MoleculesProps {
    readonly step: number;
    readonly genotype: Genotype;
    readonly reduced: boolean;
}

interface Particle {
    active: boolean;
    route: RouteId;
    seg: number;
    s: number;
    wait: number;
    conj: number;
    age: number;
    speed: number;
    jitter: number;
    /** Rota de outro genótipo (o botão mudou): some rapidamente. */
    fade: number;
}

const POOL = 46;
const BIND_S = 0.55;
const FREE_COLOR = '#93C5FD';
const CONJ_COLOR = '#67E8F9';
const ROUTE_IDS = Object.keys(ROUTES) as RouteId[];

const lastSegment = (route: RouteId, step: number): number => {
    const n = ROUTES[route].length - 1;
    if (route === 'normal') return step <= 1 ? 1 : n;
    return n;
};

const pickRoute = (step: number, genotype: Genotype): RouteId => {
    if (step === 0) return 'blood';
    const r = Math.random();
    if (step >= DOPING_STEP && r < 0.26) return 'muscle';
    if (r < (step >= DOPING_STEP ? 0.34 : 0.22)) return 'blood';
    return genotype;
};

const newParticle = (): Particle => ({ active: false, route: 'blood', seg: 0, s: 0, wait: 0, conj: 0, age: 0, speed: 0, jitter: 0, fade: 1 });

export const Molecules = ({ step, genotype, reduced }: MoleculesProps) => {
    const pathRefs = useRef<Record<string, SVGPathElement | null>>({});
    const dotRefs = useRef<(SVGGElement | null)[]>([]);
    const glucRefs = useRef<(SVGGElement | null)[]>([]);
    const stateRef = useRef({ step, genotype });
    // Animado: o motor nunca reinicia (as moléculas continuam). Estático: refaz o retrato a cada passo.
    const staticKey = reduced ? `${step}-${genotype}` : 'live';

    useEffect(() => {
        stateRef.current = { step, genotype };
    }, [step, genotype]);

    useEffect(() => {
        const lengths = Object.fromEntries(ROUTE_IDS.map(id => [
            id, ROUTES[id].map((_, i) => pathRefs.current[`${id}-${i}`]?.getTotalLength() ?? 0),
        ])) as Record<RouteId, number[]>;
        const particles = Array.from({ length: POOL }, newParticle);

        const draw = (i: number, p: Particle) => {
            const el = dotRefs.current[i];
            const gl = glucRefs.current[i];
            if (!el || !gl) return;
            if (!p.active) { el.setAttribute('opacity', '0'); return; }
            const path = pathRefs.current[`${p.route}-${p.seg}`];
            if (!path) return;
            const pt = path.getPointAtLength(p.s);
            const len = lengths[p.route][p.seg];
            const isLast = p.seg === lastSegment(p.route, stateRef.current.step);
            const fadeOut = isLast ? Math.min(1, (len - p.s) / 34) : 1;
            const fadeIn = Math.min(1, p.age / 0.3);
            el.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${(pt.y + p.jitter).toFixed(1)})`);
            el.setAttribute('opacity', Math.max(0, Math.min(fadeIn, fadeOut, p.fade)).toFixed(2));
            el.style.color = p.conj > 0.5 ? CONJ_COLOR : FREE_COLOR;
            const k = 1 - p.conj;
            gl.setAttribute('opacity', p.conj.toFixed(2));
            gl.setAttribute('transform', `translate(${(k * 16).toFixed(1)} ${(k * -22).toFixed(1)})`);
        };

        const spawn = (now: { step: number; genotype: Genotype }) => {
            const p = particles.find(q => !q.active);
            if (!p) return;
            const doping = now.step >= DOPING_STEP;
            const route = pickRoute(now.step, now.genotype);
            const fromSyringe = doping && Math.random() < 0.7;
            Object.assign(p, {
                active: true, route, seg: 0, wait: 0, conj: 0, age: 0, fade: 1,
                s: fromSyringe ? SYRINGE_X - VESSEL.x0 : 0,
                speed: (route === 'blood' ? 175 : 140) * (0.9 + Math.random() * 0.2),
                jitter: (Math.random() - 0.5) * (route === 'blood' ? 13 : 6),
            });
        };

        if (reduced) {
            // Sem animação: um retrato estático das moléculas ao longo do caminho ativo.
            const { step: st, genotype: gt } = stateRef.current;
            const route: RouteId = st === 0 ? 'blood' : gt;
            const last = lastSegment(route, st);
            let i = 0;
            for (let seg = 0; seg <= last; seg++) {
                for (const f of [0.25, 0.6, 0.9]) {
                    const p = particles[i++];
                    Object.assign(p, { active: true, route, seg, s: lengths[route][seg] * f, age: 1, fade: 1, conj: route === 'normal' && seg > 0 ? 1 : 0, jitter: 0 });
                }
            }
            particles.forEach((p, idx) => draw(idx, p));
            return;
        }

        let raf = 0;
        let last = performance.now();
        let acc = 0.6;
        const tick = (t: number) => {
            const dt = Math.min((t - last) / 1000, 0.05);
            last = t;
            const now = stateRef.current;
            const interval = now.step >= DOPING_STEP ? 0.19 : 0.7;
            acc += dt;
            while (acc >= interval) { acc -= interval; spawn(now); }

            particles.forEach((p, i) => {
                if (p.active) {
                    p.age += dt;
                    const lastSeg = lastSegment(p.route, now.step);
                    const mismatch = (p.route === 'normal' || p.route === 'del') && p.route !== now.genotype;
                    // Ainda no trecho comum (sangue → fígado): segue o novo genótipo. Já depois do fígado: some.
                    if (mismatch && p.seg === 0 && p.wait <= 0 && p.conj === 0) p.route = now.genotype;
                    else if (mismatch) p.fade -= dt * 2.5;
                    if (p.seg > lastSeg || p.fade <= 0) p.active = false;
                    else if (p.wait > 0) {
                        p.wait -= dt;
                        p.conj = Math.min(1, 1 - p.wait / BIND_S);
                        if (p.wait <= 0) { p.conj = 1; p.seg += 1; p.s = 0; }
                    } else {
                        p.s += p.speed * dt;
                        const len = lengths[p.route][p.seg];
                        if (p.s >= len) {
                            if (p.route === 'normal' && p.seg === 0 && p.seg < lastSeg) { p.s = len; p.wait = BIND_S; }
                            else if (p.seg < lastSeg) { p.s -= len; p.seg += 1; }
                            else p.active = false;
                        }
                    }
                }
                draw(i, p);
            });
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [reduced, staticKey]);

    return (
        <g aria-hidden>
            {ROUTE_IDS.flatMap(id => ROUTES[id].map((d, i) => (
                <path key={`${id}-${i}`} ref={el => { pathRefs.current[`${id}-${i}`] = el; }} d={d} fill="none" stroke="none" />
            )))}
            {Array.from({ length: POOL }, (_, i) => (
                <g key={i} ref={el => { dotRefs.current[i] = el; }} opacity={0} style={{ color: FREE_COLOR }}>
                    <g transform={`translate(${STEROID_OFFSET[0]} ${STEROID_OFFSET[1]})`}>
                        <path d={STEROID_PATH} fill="currentColor" fillOpacity={0.3} stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
                        <g ref={el => { glucRefs.current[i] = el; }} opacity={0}>
                            <path d={GLUC_BOND} stroke="#FCD34D" strokeWidth={1.6} />
                            <path d={GLUC_PATH} fill="#F59E0B" fillOpacity={0.75} stroke="#FDE68A" strokeWidth={1.3} strokeLinejoin="round" />
                        </g>
                    </g>
                </g>
            ))}
        </g>
    );
};
