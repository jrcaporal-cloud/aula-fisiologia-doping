/**
 * Texto das quatro camadas do slide "A Base do Doping Moderno".
 * Copiado VERBATIM do componente anterior (EAAInteractive) — não editar o conteúdo científico.
 */
export interface Layer {
    id: number;
    /** Rótulo curto do passador. */
    short: string;
    title: string;
    color: string;
    /** Cor de texto com contraste alto no fundo escuro. */
    ink: string;
    summary: string;
    detail: string;
    mechanism: string;
    risk: string;
}

export const LAYERS: Layer[] = [
    {
        id: 0,
        short: 'Base sintética',
        title: 'Base Transcricional Sintética',
        color: '#60A5FA',
        ink: '#93C5FD',
        summary: 'Derivados 17α-alquilados e compostos esterificados de Testosterona criando farmacocinéticas exclusivas.',
        detail: '17α-alquilação substitui o H no C17 por um grupo alquila (geralmente –CH₃), impedindo o metabolismo de primeira passagem hepática. Resultado: biodisponibilidade oral de 95–100% vs. ~1% da testosterona base. Exemplos: Oximetolona, Oxandrolona, Estanozolol. Custo: hepatotoxicidade significativa por acúmulo hepático.',
        mechanism: 'A esterificação do C17 (ex.: Cipionato, Decanoato) cria um pró-fármaco lipofílico que é lentamente hidrolisado por esterases teciduais — prolongando a meia-vida de horas para dias/semanas. Isso reduz a frequência de aplicação e mantém níveis séricos mais estáveis.',
        risk: 'Dislipidemia severa (HDL –60%, LDL +30%), hepatotoxicidade (colestase, peliose hepática, adenoma), hipertensão arterial sistêmica.',
    },
    {
        id: 1,
        short: 'Razão A/A',
        title: 'Razão Anabólica/Androgênica',
        color: '#A855F7',
        ink: '#D8B4FE',
        summary: 'Química manipulada para hipertrofia sem virilização excessiva. Trembolona: afinidade 3× superior ao AR.',
        detail: 'A Razão AA (Anabolismo:Androgênio) compara a capacidade de promover crescimento muscular vs. efeitos masculinizantes. Testosterona = 1:1 (razão de referência). Trembolona = 1:10+ em modelos animais murinos. Oxandrolona ≈ 10:1 em humanos — altamente seletiva para músculo.',
        mechanism: 'A seletividade tecidual é mediada pela expressão diferencial de 5α-redutase (converte T em DHT — 3× mais androgênica) e 11β-HSD2. Músculos têm baixa 5α-redutase; próstata e couro cabeludo têm alta. Compostos que resistem à 5α-redução (ex.: Trembolona, Nandrolona) têm efeitos androgênicos periféricos reduzidos.',
        risk: 'Apesar da "seletividade", todos os EAA suprimem o eixo HPG — parar T endógena = atrofia testicular e infertilidade dose-dependente. Reversibilidade: ~80% dos usuários recuperam a função em 12 meses; ~20% necessitam TRT vitalícia.',
    },
    {
        id: 2,
        short: 'Satélites',
        title: 'Remodelagem dos Satélites',
        color: '#10B981',
        ink: '#6EE7B7',
        summary: 'Hipertrofia via acréscimo massivo de mionúcleos — células satélite ativadas por androgênios.',
        detail: 'Células satélite musculares expressam receptores androgênicos (RA). Androgênios → proliferação e diferenciação de satélites → fusão à fibra existente → novos mionúcleos. Resultado: razão mionúcleos/volume de fibra aumentada, permitindo síntese proteica local mais eficiente.',
        mechanism: 'Os mionúcleos extras são PERMANENTES mesmo após cessação dos androgênios (memória muscular). Estudos de Staron, Schwartz et al. usando biópsias longitudinais demonstram manutenção do número de mionúcleos por 15+ anos após o uso. Isso explica por que ex-usuários retreinam 3–5× mais rápido.',
        risk: '[Bhasin et al., NEJM]: em 16 semanas, T suprafisiológica + treino → +6,1 kg de massa magra vs. +1,9kg treino limpo. Em 6–8 meses de ciclo típico, o aumento pode chegar a +10–15kg de tecido contrátil funcional.',
    },
    {
        id: 3,
        short: 'Colaterais',
        title: 'Colaterais Biológicos Críticos',
        color: '#E11D48',
        ink: '#FDA4AF',
        summary: 'Supressão irreversível do eixo HPG. Hipertrofia ventricular concêntrica letal.',
        detail: 'O eixo HPG (Hipotálamo–Hipófise–Gônadas) é suprimido por feedback negativo: T exógena → hipotálamo detecta T alta → para GnRH → Hipófise para LH/FSH → testículos param de produzir T e espermatozoides. Sem LH, células de Leydig atrofiam — produção endógena nula em semanas.',
        mechanism: 'Cardiomiopatia: androgênios promovem hipertrofia de cardiomiócitos via RA cardíaco → parede do VE engrossa → função diastólica prejudicada → risco de morte súbita. Estudos de ecocardiografia: espessura do septo interventricular em fisiculturistas: 13,2mm vs. 9,8mm controles. Fibrose miocárdica detectada em RNM em 50% dos usuários de longa data.',
        risk: 'Análise de mortalidade (Pope et al., Biol Psychiatry): usuários de EAA têm mortalidade 4,6× maior que controles. Principais causas: cardiomiopatia, suicídio (efeito de abstinência), hepatocarcinoma. Expectativa de vida reduzida em 8–12 anos versus população geral nos estudos de fisiculturistas profissionais.',
    },
];

export type TabKey = 'detail' | 'mechanism' | 'risk';

export const TABS: { key: TabKey; label: string }[] = [
    { key: 'detail', label: 'Química' },
    { key: 'mechanism', label: 'Mecanismo' },
    { key: 'risk', label: 'Risco Real' },
];

/** Altura do palco das ilustrações (unidades do viewBox = px no palco de 1280). */
export const STAGE_W = 600;
export const STAGE_H = 420;

export const EASE = [0.16, 1, 0.3, 1] as const;
