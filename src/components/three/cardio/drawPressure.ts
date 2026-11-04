import type { CardioState } from './flow';
import { SYS } from './params';
import { phaseAgo, pressureMmHg, rawPressure } from './pressureWave';

/*
 * Desenha a onda de pressão rolando num canvas 2D: a ponta direita é o instante atual do ciclo do
 * coração 3D (mesma fase `cy.c`) e o passado corre para a esquerda. Como o formato é função da fase,
 * o traço do passado sai da própria fase (c − hz·Δt), sem guardar histórico.
 */

/** Janela mostrada (s): sempre cabe um batimento inteiro (o mais lento dura 1,18 s). */
const WINDOW_S = 1.35;
const N = 120;
/** Eixo vertical fixo em mmHg: pressão mais alta aparece mais alta, não "esticada". */
const P_MIN = 56;
const P_MAX = 160;
const REFS: readonly number[] = [80, 120];
const PAD = 4;
/** Folga à direita para a cabeça do traço não ser cortada pela borda do canvas. */
const HEAD_X = 8;

const buf = new Float32Array(N);

const CRIMSON = '#E11D48';
const BLUE = '#60A5FA';

export interface PressureCanvas {
    ctx: CanvasRenderingContext2D;
    w: number;
    h: number;
    stroke: CanvasGradient;
}

/** Prepara o canvas para a densidade de pixels da tela e cria o gradiente do traço. */
export const setupPressureCanvas = (cv: HTMLCanvasElement, w: number, h: number): PressureCanvas | null => {
    const ctx = cv.getContext('2d');
    if (!ctx) return null;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const stroke = ctx.createLinearGradient(0, 0, w, 0);
    stroke.addColorStop(0, 'rgba(225,29,72,0)');
    stroke.addColorStop(0.45, 'rgba(225,29,72,0.7)');
    stroke.addColorStop(1, CRIMSON);
    return { ctx, w, h, stroke };
};

const yOf = (p: number, h: number): number => h - PAD - ((p - P_MIN) / (P_MAX - P_MIN)) * (h - 2 * PAD);

export const drawPressure = ({ ctx, w, h, stroke }: PressureCanvas, s: CardioState): void => {
    const { p, cy } = s;
    const rig = p.rigidez;
    ctx.clearRect(0, 0, w, h);

    // referências de 80 e 120 mmHg (o "normal" de consultório), só como régua
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(34,211,238,0.28)';
    REFS.forEach(r => {
        const y = Math.round(yOf(r, h)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    });
    ctx.setLineDash([]);

    // formato normalizado na janela inteira: o mínimo e o máximo da janela são a diastólica e a sistólica
    let lo = Infinity;
    let hi = -Infinity;
    for (let i = 0; i < N; i++) {
        const v = rawPressure(phaseAgo(cy.c, p.hz, ((N - 1 - i) / (N - 1)) * WINDOW_S), rig);
        buf[i] = v;
        if (v < lo) lo = v;
        if (v > hi) hi = v;
    }
    const span = hi - lo || 1;
    const { paDiast, paSist } = p.v;

    ctx.beginPath();
    for (let i = 0; i < N; i++) {
        const mm = pressureMmHg((buf[i] - lo) / span, paDiast, paSist);
        const x = (i / (N - 1)) * (w - HEAD_X);
        if (i === 0) ctx.moveTo(x, yOf(mm, h));
        else ctx.lineTo(x, yOf(mm, h));
    }
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke;
    ctx.stroke();

    // cabeça do traço: o instante atual, colorido pela fase (sístole × diástole)
    const headY = yOf(pressureMmHg((buf[N - 1] - lo) / span, paDiast, paSist), h);
    const color = cy.c < SYS ? CRIMSON : BLUE;
    ctx.fillStyle = `${color}33`;
    ctx.beginPath();
    ctx.arc(w - HEAD_X, headY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(w - HEAD_X, headY, 3, 0, Math.PI * 2);
    ctx.fill();
};
