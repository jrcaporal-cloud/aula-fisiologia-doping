import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Motor "ficha de caso clínico": cada caso é um prontuário revelado pelo passador
 * como raciocínio clínico — 0 relato · 1 exames · 2 hipótese · 3 conduta/lição.
 * Todo texto aqui vem do slide (parsedPresentation.json); nada de valor novo.
 */

export const CASE_STEPS = 4;

/** Altura do prontuário (px na largura de desenho): compacta para o slide caber sem rolagem. */
export const CASE_HEIGHT = 520;

/** Trecho de texto. `mark` destaca o trecho a partir de um passo (ex.: o "álibi" no relato). */
export interface TextPart {
    readonly text: string;
    readonly strong?: boolean;
    readonly mark?: { readonly fromStep: number; readonly label: string; readonly color: string };
}

export type Paragraph = readonly TextPart[];

export type Tone = 'red' | 'amber' | 'green' | 'neutral';

export interface Reference {
    /** Limites numéricos para posicionar a faixa na régua. */
    readonly low: number;
    readonly high: number;
    /** Como o slide escreve a referência (ex.: "12,0–16,0"). */
    readonly lowLabel: string;
    readonly highLabel: string;
    readonly unit?: string;
    /** Domínio da régua (escala do desenho, sem significado clínico). */
    readonly domain: readonly [number, number];
}

export interface LabRow {
    readonly id: string;
    readonly label: string;
    /** Valor como o slide escreve (vírgula decimal). */
    readonly value: string;
    readonly unit?: string;
    /** Valor numérico, só quando há referência para posicioná-lo. */
    readonly numeric?: number;
    readonly reference?: Reference;
    /** Marcação textual que o próprio slide usa ("Baixo", "Elevado"...). */
    readonly flag?: string;
    /** Cor que o slide original dá ao valor. */
    readonly tone: Tone;
}

export interface ReasonItem {
    readonly parts: Paragraph;
    /** Linhas de exame que sustentam esta frase (ganham o mesmo número). */
    readonly evidence?: readonly string[];
}

export interface ReasonBlock {
    readonly title: string;
    readonly headline?: string;
    readonly items: readonly ReasonItem[];
}

/** Props das cenas extras (desenho próprio de um caso). */
export interface SceneProps {
    readonly step: number;
    /** false quando o professor escondeu a resposta (passos 2 e 3 ficam velados). */
    readonly revealed: boolean;
}

export interface CaseData {
    readonly caseNumber: string;
    readonly accent: string;
    readonly icon: LucideIcon;
    readonly stepNames: readonly [string, string, string, string];
    readonly stepCaptions: readonly [string, string, string, string];
    readonly profile: {
        readonly headline: string;
        readonly paragraphs: readonly Paragraph[];
        readonly question: string;
    };
    /** Coluna central: painel de exames (com régua) ou uma cena própria do caso. */
    readonly center:
        | { readonly kind: 'labs'; readonly title: string; readonly layout: 'grid' | 'list'; readonly rows: readonly LabRow[] }
        | { readonly kind: 'scene'; readonly title: string; readonly Scene: ComponentType<SceneProps> };
    readonly hypothesis: ReasonBlock;
    readonly lesson: ReasonBlock & { readonly Extra?: ComponentType<SceneProps> };
}

export const TONE_COLOR: Record<Tone, string> = {
    red: '#FB7185',
    amber: '#FBBF24',
    green: '#34D399',
    neutral: '#F3F4F6',
};

export const CARD_BG = { background: 'rgba(8,8,18,0.72)' } as const;
