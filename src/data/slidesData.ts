export interface SlideData {
  id: number;
  classes: string;
  content: string;
}

export const slidesData: SlideData[] = [
  {
    id: 0,
    classes: `bg-dark`,
    content: `<div class="geometric-accent circle-accent"></div>
        <div class="slide-content flex-center">
            <h1 class="reveal">Fisiologia do Doping<br>no Esporte</h1>
            <p class="subtitle reveal delay-1" style="margin-top: var(--element-gap);">O que a fisiologia sabe — e o
                antidoping ainda não consegue provar.</p>
            <p class="reveal delay-2"
                style="position: absolute; bottom: var(--slide-padding); right: var(--slide-padding); font-size: var(--small-size);">
                Prof. Mestre das Keide</p>
        </div>`
  },
  {
    id: 1,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>Abertura</span>
            <span>01</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">O Dado que Muda o Enquadramento</h2>

            <style>
                .stat-circle {
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    cursor: pointer;
                    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }

                .stat-circle:hover {
                    transform: scale(1.08);
                    border-radius: 20px !important;
                }

                .stat-circle .circle-number {
                    transition: all 0.4s ease;
                }

                .stat-circle:hover .circle-number {
                    font-size: 2rem !important;
                    margin-bottom: 0.3rem;
                }

                .stat-circle .circle-details {
                    opacity: 0;
                    max-height: 0;
                    overflow: hidden;
                    transition: all 0.4s ease;
                    text-align: center;
                    padding: 0 1rem;
                }

                .stat-circle:hover .circle-details {
                    opacity: 1;
                    max-height: 300px;
                    padding: 0 1.2rem;
                }

                /* Anel Animado no Circulo WADA */
                .stat-circle-wada {
                    width: 18vw;
                    height: 18vw;
                    border: 2px solid var(--text-secondary);
                    background: rgba(255, 255, 255, 0.03);
                }

                .stat-circle-wada:hover {
                    width: 22vw;
                    height: auto;
                    min-height: 22vw;
                    border-color: #60A5FA;
                    box-shadow: 0 0 40px rgba(96, 165, 250, 0.3), inset 0 0 30px rgba(96, 165, 250, 0.05);
                    background: rgba(30, 58, 138, 0.3);
                }

                /* Anel Animado no Circulo Vermelho */
                .stat-circle-real {
                    width: 32vw;
                    height: 32vw;
                    background: rgba(220, 38, 38, 0.08);
                    border: 2px solid var(--accent-main);
                    animation: danger-pulse-ring 3s ease-in-out infinite;
                }

                .stat-circle-real:hover {
                    width: 34vw;
                    height: auto;
                    min-height: 30vw;
                    animation: none;
                    box-shadow: 0 0 60px rgba(220, 38, 38, 0.4), inset 0 0 40px rgba(220, 38, 38, 0.08);
                    background: rgba(127, 29, 29, 0.4);
                }

                @keyframes danger-pulse-ring {

                    0%,
                    100% {
                        box-shadow: 0 0 0px rgba(220, 38, 38, 0);
                    }

                    50% {
                        box-shadow: 0 0 35px rgba(220, 38, 38, 0.25);
                    }
                }

                /* Ao focar em um, esmaecer o outro */
                .stat-circles-grid:has(.stat-circle:hover) .stat-circle:not(:hover) {
                    opacity: 0.3;
                    filter: blur(2px) grayscale(50%);
                    transform: scale(0.92);
                }
            </style>

            <div class="stat-circles-grid grid-2" style="margin-top: var(--content-gap); align-items: center;">
                <!-- Circulo 1: WADA Oficial -->
                <div class="reveal-scale delay-1 flex-center">
                    <div class="stat-circle stat-circle-wada">
                        <span class="circle-number"
                            style="font-size: var(--h2-size); font-family: var(--font-display);">1-2%</span>
                        <div class="circle-details">
                            <p
                                style="font-size: 0.78rem; color: #93C5FD; font-family: var(--font-display); margin-bottom: 0.5rem; border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 0.5rem;">
                                📊 Dados Oficiais</p>
                            <p style="font-size: 0.75rem; color: #D1D5DB; line-height: 1.5; margin-bottom: 0.4rem;">Dos
                                <strong style="color:white;">~300.000 testes/ano</strong> realizados pela WADA, apenas
                                1-2% resultam em AAF (Achado Analítico Adverso).
                            </p>
                            <p style="font-size: 0.75rem; color: #9CA3AF; line-height: 1.5; margin-bottom: 0.4rem;">Isso
                                equivale a <strong style="color: #93C5FD;">~4.000 atletas pegos</strong> por ano em todo
                                o mundo.</p>
                            <p style="font-size: 0.7rem; color: #6B7280; line-height: 1.4; font-style: italic;">Muitos
                                destes são de substâncias recreativas, não ergogênicas.</p>
                        </div>
                    </div>
                    <p style="margin-top: 1rem; transition: all 0.3s;">Detectado pela WADA</p>
                </div>
                <!-- Circulo 2: Prevalência Real -->
                <div class="reveal-scale delay-2 flex-center">
                    <div class="stat-circle stat-circle-real">
                        <span class="circle-number"
                            style="font-size: clamp(3rem, 8vw, 6rem); font-family: var(--font-display); color: var(--accent-main);">~43%</span>
                        <div class="circle-details">
                            <p
                                style="font-size: 0.85rem; color: #FCA5A5; font-family: var(--font-display); margin-bottom: 0.5rem; border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 0.5rem;">
                                🔬 Metodologia Anônima</p>
                            <p style="font-size: 0.8rem; color: #E5E7EB; line-height: 1.5; margin-bottom: 0.5rem;">
                                Pesquisa de <strong style="color:white;">Ulrich et al. (2018)</strong> usando a técnica
                                do <em>Randomized Response</em> — onde é matematicamente impossível identificar quem
                                respondeu "sim" — em eventos da IAAF.</p>
                            <p style="font-size: 0.8rem; color: #FCA5A5; line-height: 1.5; margin-bottom: 0.5rem;">
                                Resultado: <strong style="color:white;">43.6%</strong> dos atletas de elite admitiram
                                uso de substâncias proibidas nos últimos 12 meses.</p>
                            <p style="font-size: 0.75rem; color: #9CA3AF; line-height: 1.4;">Em Pan-Árabes e
                                Pan-Americanos o número variou de <strong style="color: #FCA5A5;">30% a 57%</strong>
                                dependendo da modalidade.</p>
                            <p style="font-size: 0.65rem; color: #6B7280; margin-top: 0.5rem; font-style: italic;">
                                Fonte: Br J Sports Med. 2018;52(7):439-444</p>
                        </div>
                    </div>
                    <p style="margin-top: 1rem;" class="highlight-white">Prevalência Real (Pesquisa Anônima)</p>
                </div>
            </div>
        </div>`
  },
  {
    id: 2,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>Fundamentos Fisiológicos</span>
            <span>02</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">Os Três Pilares do Desempenho</h2>
            <p class="subtitle reveal delay-1" style="margin-bottom: var(--element-gap);">Eixos de atuação sistêmica na
                otimização de performance</p>

            <div class="reveal-scale delay-2"
                style="width: 100%; max-width: 900px; margin-top: 4vh; position: relative;">

                <style>
                    /* Animações e Expansões para o Triângulo */
                    .triangle-node {
                        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                        position: relative;
                        overflow: hidden;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        cursor: pointer;
                        z-index: 2;
                    }

                    /* Conteúdo padrão vs expandido */
                    .node-basic-info {
                        transition: all 0.3s ease;
                        opacity: 1;
                        height: auto;
                    }

                    .node-expanded-info {
                        opacity: 0;
                        height: 0;
                        transition: all 0.4s ease;
                        text-align: left;
                        margin-top: 0;
                        font-size: 0.85rem;
                        line-height: 1.5;
                        color: #E5E7EB;
                    }

                    /* HOVER STATE PARA OS NODOS */
                    .triangle-node:hover {
                        transform: scale(1.1) translateY(-10px) translateZ(30px) !important;
                        z-index: 20 !important;
                        border-radius: 16px !important;
                        /* Perde o formato arredondado assimetrico ao expandir */
                        width: 400px !important;
                        /* Expande a largura */
                        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), inset 0 0 0 1px rgba(255, 255, 255, 0.2) !important;
                    }

                    /* Oculta subtitulo mono basico */
                    .triangle-node:hover .node-basic-info p {
                        display: none;
                    }

                    /* Revela conteudo profundo */
                    .triangle-node:hover .node-expanded-info {
                        opacity: 1;
                        height: auto;
                        margin-top: 1rem;
                        border-top: 1px dashed rgba(255, 255, 255, 0.2);
                        padding-top: 1rem;
                    }

                    /* Esmaece as outras caixas e o centro quando focado em uma */
                    .triangle-container:has(.triangle-node:hover) .triangle-node:not(:hover),
                    .triangle-container:has(.triangle-node:hover) .center-node {
                        opacity: 0.3;
                        filter: blur(2px) grayscale(50%);
                        transform: scale(0.95);
                    }

                    /* Animações suaves globais para TODOS os details da apresentação */
                    details {
                        transition: all 0.3s ease;
                    }

                    details summary {
                        cursor: pointer;
                        user-select: none;
                    }

                    details .detail-content,
                    details>div:not(.detail-content) {
                        animation: none;
                    }

                    details[open] .detail-content,
                    details[open]>div:not(.detail-content) {
                        animation: detail-slide-in 0.35s ease-out;
                    }

                    @keyframes detail-slide-in {
                        from {
                            opacity: 0;
                            max-height: 0;
                            transform: translateY(-8px);
                        }

                        to {
                            opacity: 1;
                            max-height: 500px;
                            transform: translateY(0);
                        }
                    }

                    /* Details dentro dos nós do triângulo */
                    .triangle-details summary {
                        font-size: 0.72rem;
                        font-family: var(--font-display);
                        cursor: pointer;
                        padding: 4px 0;
                        list-style: none;
                        display: flex;
                        align-items: center;
                        gap: 5px;
                    }

                    .triangle-details summary::before {
                        content: '▶';
                        font-size: 0.55rem;
                        transition: transform 0.25s ease;
                        display: inline-block;
                    }

                    .triangle-details[open] summary::before {
                        transform: rotate(90deg);
                    }

                    .triangle-details .tri-detail-content {
                        font-size: 0.68rem;
                        line-height: 1.5;
                        padding: 6px 8px;
                        margin-top: 3px;
                        background: rgba(0, 0, 0, 0.3);
                        border-radius: 5px;
                    }
                </style>

                <div class="triangle-container" style="position: relative; z-index: 2;">
                    <!-- SVG Conexões (Mesmo anterior, movido pra dentro do container pra z-index flow) -->
                    <svg width="100%" height="400"
                        style="position: absolute; top: -50px; left: 0; z-index: 0; pointer-events: none;"
                        viewBox="0 0 900 400">
                        <line x1="450" y1="80" x2="250" y2="280" stroke="rgba(255,255,255,0.2)" stroke-width="2"
                            stroke-dasharray="5,5" />
                        <line x1="450" y1="80" x2="650" y2="280" stroke="rgba(255,255,255,0.2)" stroke-width="2"
                            stroke-dasharray="5,5" />
                        <line x1="250" y1="280" x2="650" y2="280" stroke="rgba(255,255,255,0.2)" stroke-width="2"
                            stroke-dasharray="5,5" />
                        <!-- Pulsos -->
                        <circle cx="450" cy="80" r="4" fill="var(--accent-main)">
                            <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite" />
                            <animateMotion path="M 0 0 L -200 200" dur="3s" repeatCount="indefinite" />
                        </circle>
                        <circle cx="450" cy="80" r="4" fill="#10B981">
                            <animate attributeName="opacity" values="1;0" dur="2s" repeatCount="indefinite" />
                            <animateMotion path="M 0 0 L 200 200" dur="3s" repeatCount="indefinite" />
                        </circle>
                    </svg>

                    <!-- TOP (VO2 Max) -->
                    <div style="display: flex; justify-content: center; position: relative;">
                        <div class="diagram-box floating triangle-node"
                            style="width: 350px; border-color: var(--accent-main); background: rgba(153, 27, 27, 0.4); padding: 1.5rem; border-radius: 50% 50% 16px 16px; backdrop-filter: blur(10px);">

                            <div class="node-basic-info">
                                <span
                                    style="font-size: 2rem; display: block; margin-bottom: 0.5rem; animation: pulse-glow 2s infinite;">🫀</span>
                                <h3 class="highlight-red" style="font-size: 1.2rem; margin-bottom: 0.5rem;">Coração &
                                    Sangue
                                    <span style="font-size: 0.6em; color: white; display: block;">(Capacidade O2)</span>
                                </h3>
                                <p style="font-size: 0.8rem; color: #D1D5DB; font-family: var(--font-mono); margin:0;">
                                    Alvos: EPO, Transfusões</p>
                            </div>

                            <div class="node-expanded-info">
                                <strong>Mecanismo de Otimização:</strong><br>
                                Aumento direto do Débito Cardíaco (DC = Volume Sistólico x Frequência Cardíaca) e da
                                Concentração de Hemoglobina (Hb). O doping sanguíneo busca elevar o transporte massivo
                                de O² (VO2Máx).<br><br>
                                <ul style="padding-left: 1rem; color: #FCA5A5; margin:0;">
                                    <li><strong>rhEPO:</strong> Promove diferenciação de CFU-E na medula para hemácias
                                        jovens.</li>
                                    <li><strong>Transfusão H/A:</strong> Bypass total da maquinaria orgânica, fornecendo
                                        O² sintético ou estocado diretamente na via.</li>
                                </ul>
                                <details class="triangle-details" style="margin-top: 6px;">
                                    <summary style="color: #FCA5A5;">Riscos da Policitemia</summary>
                                    <div class="tri-detail-content"
                                        style="color: #E5E7EB; border-left: 2px solid rgba(220,38,38,0.4);">
                                        Hematócrito >55% aumenta a viscosidade sanguínea exponencialmente. <strong
                                            style="color:white;">Mortes documentadas em ciclistas</strong> nos anos 90
                                        (Holanda/Bélgica) estão associadas a AVC e tromboembolismo pulmonar por EPO sem
                                        monitoramento.
                                    </div>
                                </details>
                                <details class="triangle-details" style="margin-top: 4px;">
                                    <summary style="color: #FCA5A5;">Como detectam?</summary>
                                    <div class="tri-detail-content"
                                        style="color: #E5E7EB; border-left: 2px solid rgba(220,38,38,0.4);">
                                        <strong style="color:white;">Eletroforese IEF</strong> separa EPO endógena (mais
                                        ácida) da recombinante (mais básica). Transfusões homólogas são detectadas por
                                        citometria de fluxo de antígenos menores (anti-c, anti-E) no sangue.
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>

                    <!-- BOTTOM ROW -->
                    <div
                        style="display: flex; justify-content: space-between; align-items: stretch; margin-top: 1rem; position: relative;">
                        <!-- LEFT (Lactato) -->
                        <div class="diagram-box floating triangle-node"
                            style="width: 300px; border-color: var(--accent-info); background: rgba(30, 58, 95, 0.6); padding: 1.5rem; animation-delay: 1s; border-radius: 16px 50% 16px 16px; backdrop-filter: blur(10px);">

                            <div class="node-basic-info">
                                <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">⚡</span>
                                <h3 style="color: #60A5FA; font-size: 1.2rem; margin-bottom: 0.5rem;">Mitocôndrias <span
                                        style="font-size: 0.6em; color: white; display: block;">(Eficiência de
                                        Substrato)</span></h3>
                                <p style="font-size: 0.8rem; color: #D1D5DB; font-family: var(--font-mono); margin:0;">
                                    Alvos: Beta-2 Agonistas, AICAR</p>
                            </div>

                            <div class="node-expanded-info">
                                <strong>Fábrica de Energia (ATP):</strong><br>
                                A biogênese mitocondrial e o aumento da densidade capilar redefinem o Limiar de Lactato.
                                O corpo aprende a queimar ácidos graxos poupando glicogênio muscular.<br><br>
                                <ul style="padding-left: 1rem; color: #93C5FD; margin:0;">
                                    <li><strong>Cardarine/AICAR:</strong> Agonistas PPARδ e ativadores AMPK que enganam
                                        a célula simulando jejum e exercício exaustivo.</li>
                                    <li><strong>Beta-Adrenérgicos:</strong> Estimulam o AMPc e a lipólise severa via
                                        receptor B2.</li>
                                </ul>
                                <details class="triangle-details" style="margin-top: 6px;">
                                    <summary style="color: #93C5FD;">O caso GW501516 (Cardarine)</summary>
                                    <div class="tri-detail-content"
                                        style="color: #E5E7EB; border-left: 2px solid rgba(96,165,250,0.4);">
                                        Desenvolvida pela GlaxoSmithKline, foi abandonada na Fase II após causar <strong
                                            style="color:white;">câncer multiórgão em ratos</strong> em doses
                                        prolongadas. Ainda assim, é amplamente vendida no mercado negro fitness como
                                        "queimador de gordura".
                                    </div>
                                </details>
                                <details class="triangle-details" style="margin-top: 4px;">
                                    <summary style="color: #93C5FD;">Efeitos na resistência</summary>
                                    <div class="tri-detail-content"
                                        style="color: #E5E7EB; border-left: 2px solid rgba(96,165,250,0.4);">
                                        AICAR ativa AMPK sem exercício — estudos em camundongos mostraram <strong
                                            style="color:white;">aumento de 44% de resistência</strong> em esteira sem
                                        nenhum treino. Por isso chamada de "exercise-in-a-pill".
                                    </div>
                                </details>
                            </div>
                        </div>

                        <!-- CENTER (O CORPO) -->
                        <div class="center-node"
                            style="display: flex; align-items: center; justify-content: center; width: 140px; height: 140px; background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0.8) 80%); border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); align-self: flex-end; margin-bottom: 2rem; box-shadow: 0 0 30px rgba(255,255,255,0.1); transition: all 0.3s ease;">
                            <span
                                style="font-family: var(--font-display); font-size: 0.9rem; text-align: center; line-height: 1.2; color: white; text-transform: uppercase; letter-spacing: 0.1em;"
                                class="glow-text">
                                Performance<br>Total
                            </span>
                        </div>

                        <!-- RIGHT (Fibra Muscular) -->
                        <div class="diagram-box floating triangle-node"
                            style="width: 300px; border-color: #10B981; background: rgba(16, 185, 129, 0.25); padding: 1.5rem; animation-delay: 2s; border-radius: 50% 16px 16px 16px; backdrop-filter: blur(10px);">

                            <div class="node-basic-info">
                                <span style="font-size: 2rem; display: block; margin-bottom: 0.5rem;">💪</span>
                                <h3 style="color: #10B981; font-size: 1.2rem; margin-bottom: 0.5rem;">Fibra Muscular
                                    <span style="font-size: 0.6em; color: white; display: block;">(Output
                                        Neuromotor)</span>
                                </h3>
                                <p style="font-size: 0.8rem; color: #D1D5DB; font-family: var(--font-mono); margin:0;">
                                    Alvos: EAA, hGH, Insulina</p>
                            </div>

                            <div class="node-expanded-info">
                                <strong>Arquitetura Celular:</strong><br>
                                Adição de mionúcleos permanentes (via Células Satélites) permitindo hipertrofia
                                dramática e recrutamento neural agressivo da placa motora.<br><br>
                                <ul style="padding-left: 1rem; color: #6EE7B7; margin:0;">
                                    <li><strong>Acoplamento EAA:</strong> Receptores androgênicos na via genômica
                                        empilham fibras de actina-miosina pura (MCT).</li>
                                    <li><strong>O Stack:</strong> Insulina e GH garantem que substratos e aminoácidos
                                        não faltem na célula hiper-saturada.</li>
                                </ul>
                                <details class="triangle-details" style="margin-top: 6px;">
                                    <summary style="color: #6EE7B7;">Memória Muscular e Mionúcleos</summary>
                                    <div class="tri-detail-content"
                                        style="color: #E5E7EB; border-left: 2px solid rgba(16,185,129,0.4);">
                                        Mionúcleos adquiridos via EAA <strong style="color:white;">não desaparecem após
                                            cessar o uso</strong>. Estudos de Egner et al. (2013) mostram que a "memória
                                        muscular" é permanente — o atleta que usou uma vez terá <strong
                                            style="color:#6EE7B7;">vantagem vitalicia</strong> na capacidade de
                                        hipertrofia.
                                    </div>
                                </details>
                                <details class="triangle-details" style="margin-top: 4px;">
                                    <summary style="color: #6EE7B7;">Miostatina: o freio biológico</summary>
                                    <div class="tri-detail-content"
                                        style="color: #E5E7EB; border-left: 2px solid rgba(16,185,129,0.4);">
                                        A miostatina limita o crescimento muscular. <strong
                                            style="color:white;">Inibidores de miostatina (Follistatina,
                                            ACE-031)</strong> são a próxima geração de doping genético — já na lista de
                                        Vigilância da WADA, mas sem teste validado.
                                    </div>
                                </details>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>`
  },
  {
    id: 3,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>Fundamentos Fisiológicos</span>
            <span>03</span>
        </div>
        <div class="slide-content">
            <h2 class="reveal">O Receptor Androgênico (AR)</h2>
            <p class="subtitle reveal delay-1">A dupla via: Genômica e Não-Genômica</p>

            <div class="grid-2 reveal delay-2">
                <div class="card reveal-left delay-3">
                    <h3 style="border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">Via Genômica
                        (Lenta)</h3>
                    <p style="font-size: var(--small-size); margin-bottom: 1rem; color: #9CA3AF;">Ação profunda de
                        modificação da arquitetura celular.</p>
                    <ul>
                        <li><span class="highlight-white">Infiltração:</span> EAA atravessa bicamada lipídica
                            passivamente por lipofilia pura.</li>
                        <li><span class="highlight-white">Ligação AR:</span> Dissociação de proteínas chaperonas
                            inibitórias (HSP90 / HSP70) no citosol.</li>
                        <li><span class="highlight-white">Translocação:</span> Dimerização homóloga e entrada ativa no
                            núcleo celular (via complexo do poro).</li>
                        <li><span class="highlight-white">ARE:</span> Ligação aos Elementos de Resposta Androgênica no
                            DNA recruta coativadores (SRC-1).</li>
                        <li><span class="highlight-white">Resultado:</span> Transcrição de transcritos (mRNA)
                            codificando proteínas estruturais (Actina, Miosina pesada) atestado em
                            <strong>24-72h</strong>.
                        </li>
                    </ul>
                </div>
                <div class="card reveal-right delay-4" style="border-left-color: var(--accent-highlight);">
                    <h3
                        style="color: var(--accent-highlight); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
                        Via Não-Genômica (Rápida)</h3>
                    <p style="font-size: var(--small-size); margin-bottom: 1rem; color: #9CA3AF;">Ação emergencial no
                        citoplasma e membranas.</p>
                    <ul>
                        <li><span class="highlight-white">Ativação Periférica:</span> Interação com receptores acoplados
                            à proteína G (GPCRs) e canais iônicos (cálcio intra).</li>
                        <li><span class="highlight-white">Cascatas:</span> Rápida fosforilação e engajamento das vias
                            MAPK, ERK e PI3K/Akt independentes de DNA.</li>
                        <li><span class="highlight-white">Inibição de Glucocorticoides:</span> Bloqueio competitivo
                            imediato por <em>down-regulation</em> dos receptores de cortisol.</li>
                        <li><span class="highlight-white">Ação Parácrina:</span> Aumento de IGF-1Ea e MGF (Fator de
                            Crescimento Mecanocrescente) local.</li>
                        <li><span class="highlight-white">SNA & SNC:</span> Aumento drástico de output neuromotor pela
                            facilitação de acetilcolina em <strong>minutos a horas</strong>.</li>
                    </ul>
                </div>
            </div>
        </div>`
  },
  {
    id: 4,
    classes: `bg-dark`,
    content: `<div class="geometric-accent circle-accent"
            style="left: -10vw; top: -10vw; background: radial-gradient(circle, var(--accent-info) 0%, transparent 70%);">
        </div>
        <div class="slide-content flex-center">
            <p class="quote-text reveal">"O receptor não tem ética — <br><span class="highlight-red">apenas
                    afinidade.</span>"</p>
            <p class="reveal delay-1" style="margin-top: var(--content-gap); max-width: 800px;">
                O organismo responde ao sinal químico, não à fonte. O corpo não diferencia a testosterona endógena do
                EAA sintético se a molécula "abrir a fechadura" celular de forma eficiente.
            </p>
        </div>`
  },
  {
    id: 5,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>Mapa do Doping</span>
            <span>04</span>
        </div>
        <div class="slide-content">
            <h2 class="reveal">O Mapa do Doping de Elite</h2>
            <div class="reveal delay-1" style="overflow-x: auto; padding-bottom: 1rem;">
                <style>
                    /* Tabelas Colapsáveis (Gavetas) */
                    .anchor-table tbody tr.main-row {
                        cursor: pointer;
                        transition: background 0.2s;
                    }

                    .anchor-table tbody tr.main-row:hover {
                        background: rgba(255, 255, 255, 0.05);
                    }

                    .anchor-table tbody tr.detail-row td {
                        padding: 0;
                        border: none;
                        transition: all 0.3s ease;
                    }

                    .anchor-table tbody tr.detail-row .detail-content {
                        max-height: 0;
                        overflow: hidden;
                        transition: max-height 0.4s ease-out, padding 0.4s ease-out;
                        background: rgba(0, 0, 0, 0.3);
                        border-left: 3px solid var(--accent-main);
                        box-shadow: inset 0 5px 10px rgba(0, 0, 0, 0.2);
                    }

                    .anchor-table tbody tr.main-row.active+tr.detail-row .detail-content {
                        max-height: 250px;
                        padding: 1rem;
                        border-bottom: 1px solid var(--card-bg);
                    }

                    .row-icon {
                        font-size: 0.8rem;
                        display: inline-block;
                        transition: transform 0.3s;
                        margin-right: 8px;
                        color: var(--accent-main);
                    }

                    .anchor-table tbody tr.main-row.active .row-icon {
                        transform: rotate(90deg);
                    }
                </style>
                <script>
                    function toggleDetailRow(element) {
                        element.classList.toggle('active');
                    }
                </script>
                <table class="anchor-table">
                    <thead>
                        <tr>
                            <th>Fármaco</th>
                            <th>Via de Ação</th>
                            <th>Efeito Principal</th>
                            <th>Magnitude</th>
                            <th>Indetectável?</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr class="main-row" onclick="toggleDetailRow(this)">
                            <td><span class="row-icon">▶</span>EAA (Testo)</td>
                            <td>Receptor Androgênico</td>
                            <td>Massa/Força</td>
                            <td>+10-20% força</td>
                            <td><span style="color: var(--accent-main)">Não*</span></td>
                        </tr>
                        <tr class="detail-row">
                            <td colspan="5">
                                <div class="detail-content">
                                    <strong style="color: var(--accent-main);">Oculto/Colaterais:</strong> Supressão do
                                    Eixo HPG obrigatória, hipertrofia ventricular esquerda (cardiopatia) irreversível, e
                                    dislipidemia severa (redução drástica do HDL bom). O exame antidoping tradicional
                                    utiliza a relação T/E para flagrar o composto exógeno.
                                </div>
                            </td>
                        </tr>

                        <tr class="main-row" onclick="toggleDetailRow(this)">
                            <td><span class="row-icon">▶</span>rhEPO</td>
                            <td>Via JAK/STAT</td>
                            <td>Eritrócitos / VO2Máx</td>
                            <td>+3-7% VO2Máx</td>
                            <td><span style="color: var(--accent-main)">Não</span></td>
                        </tr>
                        <tr class="detail-row">
                            <td colspan="5">
                                <div class="detail-content">
                                    <strong style="color: var(--accent-main);">Oculto/Colaterais:</strong> Aumenta
                                    massivamente o hematócrito (volume de glóbulos vermelhos). Risco letal de
                                    hiperviscosidade sanguínea (sangue de lodo), predispondo a tromboses e paradas
                                    cardíacas noturnas. Foi o pesadelo do ciclismo nos anos 90.
                                </div>
                            </td>
                        </tr>

                        <tr class="main-row" onclick="toggleDetailRow(this)">
                            <td><span class="row-icon">▶</span>GH / IGF-1</td>
                            <td>Via mTOR</td>
                            <td>Massa / Lipólise</td>
                            <td>Sinergia Alta</td>
                            <td><span style="color: #10B981">Quase</span></td>
                        </tr>
                        <tr class="detail-row">
                            <td colspan="5">
                                <div class="detail-content">
                                    <strong style="color: #10B981;">Oculto/Colaterais:</strong> Potencia a síntese
                                    colagênica e óssea, reduzindo BF (Body Fat). Uso abusivo gera "Palumboísmo"
                                    (crescimento das vísceras/alargamento de extremidades) e resistência insulínica
                                    maciça. É dificílimo flagrar o GH recombinante por sua meia-vida em plasma de meros
                                    ~20 minutos.
                                </div>
                            </td>
                        </tr>

                        <tr class="main-row" onclick="toggleDetailRow(this)">
                            <td><span class="row-icon">▶</span>Insulina</td>
                            <td>Receptor IR</td>
                            <td>Anabolismo Máximo</td>
                            <td>+5-8kg (Stack)</td>
                            <td><span style="color: #10B981; font-weight: bold;">Sim</span></td>
                        </tr>
                        <tr class="detail-row">
                            <td colspan="5">
                                <div class="detail-content">
                                    <strong style="color: #10B981;">Oculto/Colaterais:</strong> O hormônio mais
                                    mortífero do esporte. Como é um peptídeo natural sem limite superior definido pela
                                    WADA, é clinicamente impossível punir um atleta por "uso de Insulina". Um erro na
                                    dosagem causa coma hipoglicêmico cerebral letal.
                                </div>
                            </td>
                        </tr>

                        <tr class="main-row" onclick="toggleDetailRow(this)">
                            <td><span class="row-icon">▶</span>Transfusão Auto.</td>
                            <td>Expansão Direta</td>
                            <td>VO2Máx / Endurance</td>
                            <td>+3-5% VO2Máx</td>
                            <td><span style="color: #10B981; font-weight: bold;">Sim</span></td>
                        </tr>
                        <tr class="detail-row">
                            <td colspan="5">
                                <div class="detail-content">
                                    <strong style="color: #10B981;">Oculto/Colaterais:</strong> O próprio sangue
                                    reinfundido. O Calcanhar de Aquiles do Passaporte Biológico. O atleta retira sua
                                    bolsa de sangue num dia 'alto' em montanha, guarda, e volta ela ao corpo um dia
                                    antes do endurance. Pode causar sobrecarga de ferro ou choque hemolítico por erro de
                                    armazenagem.
                                </div>
                            </td>
                        </tr>

                        <tr class="main-row" onclick="toggleDetailRow(this)">
                            <td><span class="row-icon">▶</span>SARMs</td>
                            <td>AR (Seletivo)</td>
                            <td>Massa</td>
                            <td>Moderada</td>
                            <td><span style="color: var(--accent-main)">Não</span></td>
                        </tr>
                        <tr class="detail-row">
                            <td colspan="5">
                                <div class="detail-content">
                                    <strong style="color: var(--accent-main);">Oculto/Colaterais:</strong> Prometem ação
                                    anabólica limpa bloqueada na próstata (Ostarine, RAD-140), mas a realidade empírica
                                    demonstra lesão biliar/hepática profunda (DILI) e supressão severa do eixo
                                    testicular, sem oferecer as janelas monstruosas de hipertrofia dos EAAs. Cai muito
                                    em doping cruzado na suplementação.
                                </div>
                            </td>
                        </tr>

                    </tbody>
                </table>
            </div>
            <p class="reveal delay-2 highlight-red" style="font-size: var(--small-size); margin-top: 1rem;">* Exceto em
                casos de deleção do gene UGT2B17.</p>
        </div>`
  },
  {
    id: 6,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>EAA</span>
            <span>05</span>
        </div>
        <div class="slide-content">
            <h2 class="reveal">A Base do Doping Moderno</h2>
            <p class="subtitle reveal delay-1"
                style="color: var(--accent-main); font-weight: bold; font-family: var(--font-display);">Esteroides
                Androgênicos Anabolizantes (EAA)</p>

            <div class="card reveal-scale delay-2"
                style="background: rgba(17, 24, 39, 0.8); padding: 2.5rem; margin-top: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); border-left: 5px solid var(--accent-main); width: 100%; max-width: 1000px; text-align: left; margin-left: auto; margin-right: auto; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                <p style="margin-bottom: 2rem; font-size: 1.3rem; font-weight: bold; color: white;">Perfil Fisiológico:
                </p>
                <ul style="gap: 1.5rem; list-style-type: none; padding-left: 0; display: flex; flex-direction: column;">
                    <li
                        style="display: flex; align-items: flex-start; gap: 15px; font-size: 0.95rem; color: #D1D5DB; line-height: 1.6;">
                        <span
                            style="color: var(--accent-main); font-weight: bold; font-size: 1.2rem; transform: translateY(-2px);">→</span>
                        <span>Base transcricional (derivados 17α-alquilados e esterificados de Testosterona).</span>
                    </li>
                    <li
                        style="display: flex; align-items: flex-start; gap: 15px; font-size: 0.95rem; color: #D1D5DB; line-height: 1.6;">
                        <span
                            style="color: var(--accent-main); font-weight: bold; font-size: 1.2rem; transform: translateY(-2px);">→</span>
                        <span>Química sintética maximizada para Razão Anabólica/Androgênica (Ex: <em
                                style="color: white;">Trembolona liga-se ao AR 3x mais forte que a Testosterona
                                basal</em>).</span>
                    </li>
                    <li
                        style="display: flex; align-items: flex-start; gap: 15px; font-size: 0.95rem; color: #D1D5DB; line-height: 1.6;">
                        <span
                            style="color: var(--accent-main); font-weight: bold; font-size: 1.2rem; transform: translateY(-2px);">→</span>
                        <span>Hipertrofia dose-dependente mediada primariamente pelo acréscimo massivo de núcleos
                            mionucleares (Satélites) ao longo de 12 a 20 semanas (Bhasin et al).</span>
                    </li>
                    <li
                        style="display: flex; align-items: flex-start; gap: 15px; font-size: 0.95rem; color: #D1D5DB; line-height: 1.6;">
                        <span
                            style="color: var(--accent-main); font-weight: bold; font-size: 1.2rem; transform: translateY(-2px);">→</span>
                        <span><strong style="color: white; font-weight: bold;">Colaterais Estruturais:</strong>
                            Supressão Eixo HPG permanente (induzida por falha nas células de Leydig), colapso do HDL
                            colesterol, e hipertrofia ventricular concêntrica.</span>
                    </li>
                </ul>
            </div>
        </div>`
  },
  {
    id: 7,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>EAA - Aprofundamento</span>
            <span>05.1</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">As Famílias de Esteroides</h2>
            <p class="subtitle reveal delay-1" style="margin-bottom: var(--content-gap);">Derivações estruturais e suas
                assinaturas biológicas</p>

            <div class="reveal-scale delay-2"
                style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; width: 100%; max-width: 1250px;">

                <!-- Família 1: Testosterona e Derivados -->
                <div class="card"
                    style="border-top: 4px solid #60A5FA; background: rgba(30, 58, 95, 0.2); padding: 1.5rem; text-align: left;">
                    <h3 style="color: #60A5FA; margin-bottom: 1rem; font-size: 1.2rem;">1. Derivados da Testosterona
                    </h3>
                    <p style="font-size: 0.85rem; color: #D1D5DB; margin-bottom: 1rem; line-height: 1.5;">O molde
                        original humano. Sofrem aromatização ampla (conversão enzimática em estradiol) e redução via
                        5-alpha-redutase (conversão orgânica em DHT).</p>
                    <ul style="padding-left: 1rem; font-size: 0.8rem; color: #9CA3AF; line-height: 1.5;">
                        <li style="margin-bottom: 0.5rem;"><strong style="color: white;">Principais:</strong> Cipionato,
                            Enantato, Propionato, Dianabol (Metandrostenolona), Equipoise (Boldenona).</li>
                        <li><strong style="color: white;">Foco Clínico:</strong> Base mandatória para TRT ou ciclos
                            (bulk). Risco altíssimo de retenção hídrica aguda subcutânea, pressão alta e ginecomastia
                            (por conversão em E2).</li>
                    </ul>
                </div>

                <!-- Família 2: Derivados do DHT -->
                <div class="card"
                    style="border-top: 4px solid #F59E0B; background: rgba(245, 158, 11, 0.1); padding: 1.5rem; text-align: left;">
                    <h3 style="color: #F59E0B; margin-bottom: 1rem; font-size: 1.2rem;">2. Derivados do DHT</h3>
                    <p style="font-size: 0.85rem; color: #D1D5DB; margin-bottom: 1rem; line-height: 1.5;">Testosterona
                        já reduzida ao seu metabólito mais potente. Moléculas quimicamente rígidas que <strong>não
                            sofrem aromatização</strong> e nunca viram estrogênio.</p>
                    <ul style="padding-left: 1rem; font-size: 0.8rem; color: #9CA3AF; line-height: 1.5;">
                        <li style="margin-bottom: 0.5rem;"><strong style="color: white;">Principais:</strong> Winstrol
                            (Estanozolol), Oxandrolona, Hemogenin (Oximetolona), Masteron, Primobolan.</li>
                        <li><strong style="color: white;">Foco Clínico:</strong> Conhecidas como "drogas de
                            corte/finalização". Causam visual muscular hiper-seco. Severamente deletérias para queda de
                            cabelo e lipídios (abismo no HDL bom).</li>
                    </ul>
                </div>

                <!-- Família 3: 19-Nor (Nandrolonas) -->
                <div class="card"
                    style="border-top: 4px solid var(--accent-main); background: rgba(220, 38, 38, 0.1); padding: 1.5rem; text-align: left;">
                    <h3 style="color: var(--accent-main); margin-bottom: 1rem; font-size: 1.2rem;">3. Derivados
                        19-Nortestosterona</h3>
                    <p style="font-size: 0.85rem; color: #D1D5DB; margin-bottom: 1rem; line-height: 1.5;">Sem o carbono
                        na posição 19. Essas moléculas ligam-se ao Receptor Androgênico massivamente, somado à mortal
                        <strong>atividade Progestínica</strong> periférica.
                    </p>
                    <ul style="padding-left: 1rem; font-size: 0.8rem; color: #9CA3AF; line-height: 1.5;">
                        <li style="margin-bottom: 0.5rem;"><strong style="color: white;">Principais:</strong>
                            Deca-Durabolin (Nandrolona) e Trembolona (o rei absoluto dos EAAs sintéticos de criação
                            bovina).</li>
                        <li><strong style="color: white;">Foco Clínico:</strong> Hipertrofia monstruosa e força bruta.
                            Efeito rebote cruel: toxidade neurológica agressiva, supressão implacável e permanente da
                            libido por picos irreversíveis de prolactina no córtex.</li>
                    </ul>
                </div>

            </div>
        </div>`
  },
  {
    id: 8,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>EAA - Aprofundamento</span>
            <span>05.2</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">O Paradoxo da Dose</h2>
            <p class="subtitle reveal delay-1">Retornos decrescentes de ação limpa</p>
            <div class="reveal-scale delay-2">
                <div class="diagram-box">
                    <h3 style="margin-bottom: 1.5rem; color: var(--accent-main);">Curva Dose-Resposta da Testosterona
                    </h3>
                    <p style="font-size: var(--small-size); margin-bottom: 1rem; color: var(--text-secondary);">Ação
                        sigmoidal do volume exógeno sobre a massa magra</p>

                    <div
                        style="height: 250px; border-bottom: 3px solid rgba(255,255,255,0.5); border-left: 3px solid rgba(255,255,255,0.5); position: relative; display: flex; align-items: flex-end; padding-left: 10px; margin-bottom: 50px;">

                        <!-- Linhas guias horizontais -->
                        <div
                            style="position: absolute; width: 100%; top: 25%; border-top: 1px dashed rgba(255,255,255,0.1); z-index: 0;">
                        </div>
                        <div
                            style="position: absolute; width: 100%; top: 50%; border-top: 1px dashed rgba(255,255,255,0.1); z-index: 0;">
                        </div>
                        <div
                            style="position: absolute; width: 100%; top: 75%; border-top: 1px dashed rgba(255,255,255,0.1); z-index: 0;">
                        </div>

                        <!-- Gráfico de barras estilizado com tooltip hover -->
                        <div style="width: 22%; height: 12%; background: rgba(156, 163, 175, 0.4); margin: 0 4%; border-radius: 6px 6px 0 0; position: relative; z-index: 1; transition: 0.3s; cursor: pointer;"
                            title="Níveis fisiológicos basais. Sem ganho significativo.">
                            <span
                                style="position: absolute; top: -25px; width: 100%; text-align: center; font-family: var(--font-display); font-size: 0.8rem;">~0kg</span>
                        </div>
                        <div style="width: 22%; height: 35%; background: rgba(59, 130, 246, 0.6); margin: 0 4%; border-radius: 6px 6px 0 0; position: relative; z-index: 1; transition: 0.3s; cursor: pointer;"
                            title="Doses de reposição (TRT). Otimização e recomposição corporal leve.">
                            <span
                                style="position: absolute; top: -25px; width: 100%; text-align: center; font-family: var(--font-display); font-size: 0.8rem; color: #60A5FA;">+1.2kg</span>
                        </div>
                        <div style="width: 22%; height: 65%; background: rgba(220, 38, 38, 0.8); margin: 0 4%; border-radius: 6px 6px 0 0; position: relative; z-index: 1; transition: 0.3s; cursor: pointer;"
                            title="Doses suprafisiológicas iniciais (Ciclo comum). Ganho drástico.">
                            <span
                                style="position: absolute; top: -25px; width: 100%; text-align: center; font-family: var(--font-display); font-size: 0.8rem; color: #F87171;">+3.5kg</span>
                        </div>
                        <div style="width: 22%; height: 98%; background: linear-gradient(180deg, #991B1B 0%, #DC2626 100%); margin: 0 4%; border-radius: 6px 6px 0 0; position: relative; z-index: 1; box-shadow: 0 0 15px rgba(220, 38, 38, 0.5); transition: 0.3s; cursor: pointer;"
                            title="Doses abusivas. Altíssimo risco hepático/cardio e retornos decrescentes de ação limpa.">
                            <span
                                style="position: absolute; top: -25px; width: 100%; text-align: center; font-family: var(--font-display); font-size: 0.8rem; color: #DC2626; font-weight: bold;">+6.0kg+</span>
                        </div>

                        <span
                            style="position: absolute; bottom: -35px; left: 6%; font-size: 0.75rem; color: var(--text-secondary);">Fisiol.</span>
                        <span
                            style="position: absolute; bottom: -35px; left: 35%; font-size: 0.75rem; color: var(--text-secondary);">TRT
                            <br>(100mg)</span>
                        <span
                            style="position: absolute; bottom: -35px; left: 65%; font-size: 0.75rem; color: #F87171;">Supra
                            <br>(300mg)</span>
                        <span
                            style="position: absolute; bottom: -35px; right: -5%; font-size: 0.75rem; color: var(--accent-critical);">Abuso
                            <br>(600mg+)</span>
                    </div>
                </div>
            </div>
        </div>`
  },
  {
    id: 9,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>EAA - Genética & Detecção</span>
            <span>06</span>
        </div>
        <div class="slide-content">
            <h2 class="reveal">O Polimorfismo UGT2B17</h2>
            <p class="subtitle reveal delay-1">Como a genética cega o Teste Antidoping Padrão</p>

            <div class="reveal delay-2" style="display: flex; gap: 2rem; margin-top: 2rem; align-items: stretch;">

                <!-- Diagrama Fisiológico -->
                <div
                    style="flex: 1; background: var(--card-bg); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); text-align: center; position: relative;">
                    <h3
                        style="color: white; font-size: 1.1rem; margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.5rem;">
                        Caminho de Excreção Renal (Glucuronidação)</h3>

                    <div
                        style="display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 350px;">
                        <!-- Bloco 1 -->
                        <div class="diagram-box"
                            style="width: 150px; padding: 10px; background: rgba(59, 130, 246, 0.2); border-color: #3B82F6;">
                            <span style="font-weight: bold; color: #60A5FA;">Testosterona</span><br>
                            <span style="font-size: 0.7rem; color: #D1D5DB;">(Livre no Sangue)</span>
                        </div>

                        <!-- Seta -->
                        <div style="height: 40px; border-left: 2px dashed rgba(255,255,255,0.3); position: relative;">
                            <span
                                style="position: absolute; bottom: -5px; left: -6px; color: rgba(255,255,255,0.5);">▼</span>
                        </div>

                        <!-- Bloco 2: Fígado e Enzima -->
                        <div class="diagram-box floating"
                            style="width: 250px; padding: 15px; background: rgba(16, 185, 129, 0.1); border-color: #10B981; border-radius: 50% 10px 10px 10px;">
                            <h4 style="color: #10B981; margin: 0 0 5px 0;">Fígado</h4>
                            <p style="font-size: 0.8rem; color: #D1D5DB; margin-bottom: 10px;">Enzima UGT2B17 anexa
                                Ácido Glucurônico à Testo, tornando-a solúvel em água.</p>
                            <div
                                style="background: rgba(16, 185, 129, 0.3); color: white; padding: 5px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.8rem;">
                                Testosterona-Glucuronídica</div>
                        </div>

                        <!-- Conectores CSS Perfeitos (Bifurcação Genética) -->
                        <div
                            style="display: flex; width: 100%; justify-content: center; position: relative; height: 30px;">
                            <!-- Linha central descendo do figado -->
                            <div
                                style="position: absolute; top: -10px; left: 50%; width: 2px; height: 20px; background: rgba(255,255,255,0.3); transform: translateX(-50%);">
                            </div>

                            <!-- Linha horizontal -->
                            <div
                                style="position: absolute; top: 10px; left: 35%; right: 35%; height: 2px; display: flex;">
                                <div style="flex: 1; background: rgba(255,255,255,0.3);"></div>
                                <div style="flex: 1; background: var(--accent-main);"></div>
                            </div>

                            <!-- Linha descendo pra esquerda (Normal) -->
                            <div
                                style="position: absolute; top: 10px; left: 35%; width: 2px; height: 20px; background: rgba(255,255,255,0.3);">
                            </div>
                            <span
                                style="position: absolute; top: 25px; left: calc(35% - 4px); font-size: 10px; color: rgba(255,255,255,0.5);">▼</span>

                            <!-- Linha descendo pra direita (Mutação) -->
                            <div
                                style="position: absolute; top: 10px; right: 35%; width: 2px; height: 20px; background: var(--accent-main);">
                            </div>
                            <span
                                style="position: absolute; top: 25px; right: calc(35% - 5px); font-size: 10px; color: var(--accent-main);">▼</span>
                        </div>

                        <div
                            style="display: flex; width: 100%; justify-content: space-around; position: relative; z-index: 2; margin-top: 50px;">
                            <div style="width: 120px; text-align: center;">
                                <div
                                    style="width: 20px; height: 20px; background: white; border-radius: 50%; margin: 0 auto 5px;">
                                </div>
                                <span style="font-size: 0.75rem; color: #D1D5DB;">Gene Normal:<br>Excreção
                                    Urinária</span>
                            </div>
                            <div style="width: 120px; text-align: center;">
                                <div style="font-size: 1.5rem; color: var(--accent-main); margin-bottom: 0px;">🚫</div>
                                <span style="font-size: 0.75rem; color: #FCA5A5;">Deleção (del/del):<br>0 Excreção
                                    Urinária</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Textos Explicativos Vertical -->
                <div style="flex: 1; display: flex; flex-direction: column; gap: 1rem;">

                    <div class="card"
                        style="border-left-color: #3B82F6; padding: 1.5rem; background: rgba(30, 58, 95, 0.4);">
                        <h3 style="color: #60A5FA; font-size: 1.2rem; margin-bottom: 0.5rem;">O Teste Clássico (Razão
                            T/E)</h3>
                        <p style="font-size: 0.85rem; color: #E5E7EB; line-height: 1.6;">
                            A WADA historicamente mede a proporção de Testosterona para Epitestosterona na urina. Em
                            humanos normais, a razão é de ~1:1. A WADA estabeleceu o limite em <strong>4:1</strong> para
                            sinalizar doping (uso exógeno de Testo).
                        </p>
                    </div>

                    <div class="card"
                        style="border-left-color: var(--accent-highlight); padding: 1.5rem; background: rgba(245, 158, 11, 0.1);">
                        <h3 style="color: var(--accent-highlight); font-size: 1.2rem; margin-bottom: 0.5rem;">A Deleção
                            Homozigótica</h3>
                        <p style="font-size: 0.85rem; color: #E5E7EB; line-height: 1.6;">
                            Cerca de <strong>66% dos Asiáticos</strong> e 10% dos Caucasianos sofrem deleção completa
                            (del/del) do gene UGT2B17. Sem a enzima hepática primária, a testosterona exógena injetada
                            simplesmente <span class="highlight-white">não entra na urina</span> na forma testável,
                            sendo eliminada primariamente nas fezes ou por vias secundárias menores.
                        </p>
                    </div>

                    <div class="card"
                        style="border-left-color: var(--accent-main); padding: 1.5rem; background: rgba(220, 38, 38, 0.1);">
                        <h3
                            style="color: var(--text-primary); font-size: 1.2rem; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 1.5rem; color: var(--accent-main);">⚠️</span>
                            Falsa Negatividade Garantida
                        </h3>
                        <p style="font-size: 0.85rem; color: #E5E7EB; line-height: 1.6;">
                            Um atleta com deleção celular UGT2B17 pode injetar até <strong>500mg de Cipionato de
                                Testosterona</strong> por semana (níveis astronômicos no sangue) e sua razão urinária
                            T/E permanecerá inalterada e legal (ex: 0.5:1). Este "bug" forçou a criação do módulo
                            esteroide do Passaporte Biológico em 2014.
                        </p>
                    </div>

                </div>
            </div>
        </div>`
  },
  {
    id: 10,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>GH & Peptídeos</span>
            <span>07</span>
        </div>
        <div class="slide-content">
            <h2 class="reveal">Eixo GH-IGF-1</h2>
            <p class="subtitle reveal delay-1">Os pontos de Hackeamento Fisiológico</p>

            <div class="reveal delay-2"
                style="position: relative; width: 100%; max-width: 1000px; margin: 2rem auto; height: 350px;">
                <!-- Conector Central (Linha Animada de Sangue/Sinalização) -->
                <div
                    style="position: absolute; top: 50%; left: 15%; width: 70%; height: 4px; background: rgba(255,255,255,0.1); z-index: 0; transform: translateY(-50%); border-radius: 2px;">
                    <div
                        style="position: absolute; top: 0; left: 0; height: 100%; width: 20%; background: var(--accent-main); box-shadow: 0 0 10px var(--accent-main); animation: pulse-flow 3s ease-in-out infinite; border-radius: 2px;">
                    </div>
                </div>
                <style>
                    @keyframes pulse-flow {
                        0% {
                            left: 0;
                            opacity: 0;
                        }

                        50% {
                            opacity: 1;
                        }

                        100% {
                            left: 80%;
                            opacity: 0;
                        }
                    }
                </style>

                <div
                    style="display: flex; justify-content: space-between; align-items: center; height: 100%; position: relative; z-index: 2;">

                    <!-- Nó 1: Hipotálamo -->
                    <div class="diagram-box floating"
                        style="width: 250px; background: rgba(30, 58, 95, 0.9); border-color: var(--accent-info); border-radius: 50%; height: 250px; display: flex; flex-direction: column; justify-content: center; transform-style: preserve-3d; perspective: 1000px;">
                        <div
                            style="width: 50px; height: 50px; background: rgba(96, 165, 250, 0.2); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.5rem; color: #60A5FA;">
                            1</div>
                        <h3 style="color: #60A5FA; font-size: 1.2rem; margin-bottom: 5px;">Hipotálamo</h3>
                        <p class="highlight-white" style="font-size: 0.9rem; margin-bottom: 5px;">Peptídeos (GHRP)</p>
                        <p style="font-size: 0.75rem; color: #9CA3AF; padding: 0 10px;">Estimulam pulso natural ghrh.
                            Janela de 1h.</p>
                    </div>

                    <!-- Nó 2: Hipófise -->
                    <div class="diagram-box floating"
                        style="width: 280px; background: rgba(16, 185, 129, 0.15); border-color: #10B981; border-radius: 16px; height: 300px; display: flex; flex-direction: column; justify-content: center; backdrop-filter: blur(10px); animation-delay: 1s; transform-style: preserve-3d; perspective: 1000px; position: relative;">
                        <!-- Glow effect -->
                        <div
                            style="position: absolute; top: -20px; right: -20px; width: 60px; height: 60px; background: radial-gradient(circle, rgba(16,185,129,0.8) 0%, transparent 70%); border-radius: 50%; animation: pulse-glow 2s infinite;">
                        </div>

                        <div
                            style="width: 50px; height: 50px; background: rgba(16, 185, 129, 0.2); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.5rem; color: #10B981;">
                            2</div>
                        <h3 style="color: #10B981; font-size: 1.4rem; margin-bottom: 5px;">Hipófise</h3>
                        <p class="highlight-white" style="font-size: 1rem; font-weight: bold; margin-bottom: 10px;">GH
                            Recombinante</p>
                        <p style="font-size: 0.8rem; color: #D1D5DB; padding: 0 15px;">Substitui pulso endógeno 191AA.
                            Risco de Acromegalia sub-clínica.</p>
                    </div>

                    <!-- Nó 3: Fígado -->
                    <div class="diagram-box floating"
                        style="width: 260px; background: rgba(153, 27, 27, 0.2); border-color: var(--accent-main); clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); height: 280px; display: flex; flex-direction: column; justify-content: center; animation-delay: 2s; transform-style: preserve-3d; perspective: 1000px;">
                        <div
                            style="width: 50px; height: 50px; background: rgba(220, 38, 38, 0.2); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.5rem; color: var(--accent-main);">
                            3</div>
                        <h3 style="color: var(--accent-main); font-size: 1.2rem; margin-bottom: 5px;">Fígado</h3>
                        <p class="highlight-white" style="font-size: 1rem; font-weight: bold; margin-bottom: 5px;">IGF-1
                            Exógeno</p>
                        <p style="font-size: 0.75rem; color: #FCA5A5; padding: 0 30px;">Bypass agressivo do eixo. Alta
                            potência celular, risco hipoglicêmico.</p>
                    </div>

                </div>
            </div>
        </div>`
  },
  {
    id: 11,
    classes: `bg-primary`,
    content: `<!-- OVERRIDE SPECIFIC FOR IMPACT SLIDE -->
        <div
            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(var(--accent-main) 1px, transparent 1px); background-size: 30px 30px; z-index: 0; animation: float 15s infinite linear;">
        </div>

        <div class="slide-content flex-center" style="z-index: 2;">
            <p class="reveal delay-1"
                style="font-family: var(--font-display); font-size: var(--h3-size); margin-bottom: 0px; letter-spacing: 0.2rem; color: #9CA3AF;">
                A ARMA ABSOLUTA</p>

            <!-- Título com Tooltip Expandível -->
            <div class="reveal glow-text"
                style="position: relative; display: inline-block; margin-bottom: 2.5rem; border-bottom: 2px solid rgba(220, 38, 38, 0.4); padding-bottom: 0.5rem; cursor: help;">
                <h2
                    style="font-size: clamp(3rem, 7vw, 6rem); color: var(--accent-main); text-shadow: 0 0 20px rgba(220, 38, 38, 0.4); line-height: 1; margin: 0;">
                    O STACK OLÍMPICO</h2>

                <!-- Conteúdo Expandível no Hover -->
                <div class="title-tooltip" style="
                    position: absolute;
                    top: 100%;
                    left: 50%;
                    transform: translateX(-50%) translateY(10px);
                    background: rgba(10, 15, 25, 0.95);
                    border: 1px solid var(--accent-main);
                    padding: 1rem;
                    border-radius: 8px;
                    width: max-content;
                    max-width: 500px;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    z-index: 50;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
                    text-align: center;
                ">
                    <div
                        style="font-size: 0.95rem; color: #E5E7EB; line-height: 1.6; margin: 0; font-family: var(--font-body); font-weight: normal; text-transform: none; text-shadow: none; text-align: left;">
                        <h4
                            style="color: var(--accent-main); font-family: var(--font-display); font-size: 1.1rem; margin-bottom: 0.5rem; border-bottom: 1px solid rgba(220,38,38,0.3); padding-bottom: 0.3rem;">
                            A Origem do Termo</h4>
                        <p style="margin-bottom: 0.8rem;">O termo <strong>"Stack"</strong> vem da palavra em inglês
                            empilhar. Na década de 90, médicos esportivos no bloco de leste perceberam que não adiantava
                            dar doses maciças de um único hormônio (monociclo) para os atletas.</p>
                        <p style="margin-bottom: 0.8rem;">O corpo regula receptores para baixo
                            (<em>down-regulation</em>) e surgem colaterais severos. A solução? Empilhar drogas que agem
                            em <strong>sistemas e receptores completamente diferentes</strong> simultaneamente.</p>
                        <p style="margin-bottom: 0;"><strong style="color: #60A5FA;">Resultado Prático:</strong> Nasceu
                            o <span style="color: var(--accent-main);">O Stack Olímpico</span>: A sinergia blindada
                            entre as 3 classes hormonais mais anabólicas conhecidas (EAA, hGH e Insulina), forçando
                            hipertrofia absurda sem saturar um único eixo.</p>
                    </div>
                </div>
            </div>

            <style>
                .glow-text:hover .title-tooltip {
                    opacity: 1;
                    visibility: visible;
                    transform: translateX(-50%) translateY(5px);
                }
            </style>

            <div class="reveal-scale delay-2"
                style="display: flex; flex-direction: column; width: 100%; max-width: 1000px; margin: 0 auto;">

                <!-- EAAS Expand Card -->
                <div class="expand-card" style="border-left-color: var(--accent-highlight);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3
                                style="color: white; font-size: 2.5rem; margin-bottom: 0.5rem; font-family: var(--font-display); font-weight: 800; letter-spacing: -0.05em;">
                                EAA</h3>
                            <p
                                style="font-family: var(--font-display); color: var(--accent-highlight); font-size: 1.2rem; font-weight: bold; margin: 0;">
                                A Base de Retenção</p>
                        </div>
                        <span
                            style="background: rgba(96, 165, 250, 0.2); color: #60A5FA; font-size: 0.8rem; padding: 4px 12px; border-radius: 4px; border: 1px solid rgba(96, 165, 250, 0.3);">
                            Ação Lenta / Genômica
                        </span>
                    </div>

                    <div class="expand-content">
                        <p style="font-size: 0.95rem; color: #D1D5DB; line-height: 1.6; margin-bottom: 1rem;">
                            Aumenta drasticamente o número de mionúcleos via doação de células satélite sob estresse
                            mecânico. O núcleo adicional é <strong>eterno</strong> (permanece após o fim do uso),
                            criando o conceito de <span class="highlight-white">"memória muscular dopada"</span>.
                        </p>
                        <p style="font-size: 0.95rem; color: #D1D5DB; line-height: 1.6;">
                            Atua no Receptor Androgênico bloqueando sinalização catabólica via <em>down-regulation</em>
                            da miostatina e superexpressão de folistatina. No empilhamento olímpico, atua como o
                            "chassi" do carro: suporta todas as outras modificações.
                        </p>
                    </div>
                </div>

                <!-- GH/IGF1 Expand Card -->
                <div class="expand-card" style="border-left-color: #10B981;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3
                                style="color: white; font-size: 2.5rem; margin-bottom: 0.5rem; font-family: var(--font-display); font-weight: 800; letter-spacing: -0.05em;">
                                hGH / IGF-1</h3>
                            <p
                                style="font-family: var(--font-display); color: #10B981; font-size: 1.2rem; font-weight: bold; margin: 0;">
                                A Chaveta Celular / Parácrina</p>
                        </div>
                        <span
                            style="background: rgba(16, 185, 129, 0.2); color: #10B981; font-size: 0.8rem; padding: 4px 12px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3);">
                            Sinergia Pura
                        </span>
                    </div>

                    <div class="expand-content">
                        <p style="font-size: 0.95rem; color: #D1D5DB; line-height: 1.6; margin-bottom: 1rem;">
                            Induz <strong class="highlight-white">hiperplasia celular</strong> (divisão de novas fibras
                            musculares, não apenas crescimento das existentes) via GHR e síntese hepática/local de IGF-1
                            em cascata. Um processo que o corpo adulto naturalmente limita severamente.
                        </p>
                        <p style="font-size: 0.95rem; color: #D1D5DB; line-height: 1.6;">
                            Ao mesmo tempo, ativa uma lipólise brutal via inibição total da <em>LPL (Lipoproteína
                                Lipase)</em>, secando o tecido adiposo subcutâneo e criando a pele hiper-fina
                            "granítica" moderna pré-contest.
                        </p>
                    </div>
                </div>

                <!-- INSULINA Expand Card -->
                <div class="expand-card" style="border-left-color: var(--accent-main);">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                        <div>
                            <h3
                                style="color: white; font-size: 2.5rem; margin-bottom: 0.5rem; font-family: var(--font-display); font-weight: 800; letter-spacing: -0.05em;">
                                INSULINA</h3>
                            <p
                                style="font-family: var(--font-display); color: var(--accent-main); font-size: 1.2rem; font-weight: bold; margin: 0;">
                                O Gatilho Master Indetectável</p>
                        </div>
                        <span
                            style="background: rgba(220, 38, 38, 0.2); color: #FCA5A5; font-size: 0.8rem; padding: 4px 12px; border-radius: 4px; border: 1px solid rgba(220, 38, 38, 0.3);">
                            O Risco Final
                        </span>
                    </div>

                    <div class="expand-content">
                        <p style="font-size: 0.95rem; color: #D1D5DB; line-height: 1.6; margin-bottom: 1rem;">
                            Satura os receptores IR (Tirosina Quinase), arrastando brutalmente os transportadores GLUT4
                            para a membrana celular em poucos minutos. Transforma células musculares em esponjas
                            gigantes de glicogênio e aminoácidos intra-treino.
                        </p>
                        <p style="font-size: 0.95rem; color: #D1D5DB; line-height: 1.6;">
                            Blinda a cascata mTORC1 através da <strong class="highlight-white">inibição completa da
                                degradação proteica</strong> (via Ubiquitina-Proteassoma). Todo EAA/GH construído é
                            retido 100%. Meia-vida no sangue indetectável em horas após a injeção pós-treino.
                        </p>
                    </div>
                </div>

            </div>

            <div class="reveal delay-4"
                style="margin-top: 2rem; text-align: center; background: rgba(220, 38, 38, 0.05); padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(220, 38, 38, 0.2); max-width: 900px; width: 100%;">
                <p class="highlight-white" style="font-size: var(--h3-size); font-weight: bold; margin-bottom: 0.5rem;">
                    RESULTADO PRÁTICO:</p>
                <p style="font-size: var(--body-size); color: #FCA5A5;">Aumento estimado e documentado de <span
                        style="color: white; font-weight: bold; background: rgba(220,38,38,0.5); padding: 0 4px; border-radius: 4px;">+5.0kg
                        a +8.0kg de massa funcional limpa</span> em um bloco isolado de 8-12 semanas de preparação na
                    elite.</p>
                <div style="width: 50%; height: 1px; background: rgba(255,255,255,0.1); margin: 1rem auto;"></div>
                <p
                    style="font-size: var(--small-size); color: var(--accent-main); text-transform: uppercase; letter-spacing: 0.1rem; font-family: var(--font-display);">
                    Risco extremo cruzado de hiperglicemia reativa aguda compensada via indução fatal celular.</p>
            </div>
        </div>`
  },
  {
    id: 12,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>Insulina</span>
            <span>09</span>
        </div>
        <div class="slide-content split-layout">
            <div class="reveal">
                <h2>A Margem que Mata</h2>
                <p class="subtitle">Anabolismo vs Hipoglicemia</p>
                <ul>
                    <li>Insulina é o agente anabolizante mais potente do corpo humano.</li>
                    <li>Por ser idêntica à forma endógena, a insulina humana injetada é <span
                            class="highlight-white">completamente indetectável</span> em 2-4 horas.</li>
                    <li>Não há antídoto oral eficaz para doses maciças incorretas.</li>
                </ul>
            </div>
            <div class="reveal-scale delay-1 flex-center">
                <div
                    style="width: 100%; padding: 2.5rem; background: var(--card-bg); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); position: relative; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.6);">

                    <!-- Radar/Pulse background -->
                    <div
                        style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(220, 38, 38, 0.05) 0%, transparent 60%); animation: spin 10s linear infinite;">
                    </div>

                    <div style="position: relative; z-index: 2;">
                        <!-- Medidor Infográfico -->
                        <div
                            style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem;">
                            <div style="text-align: left;">
                                <div
                                    style="font-size: 2.5rem; font-family: var(--font-display); color: #10B981; font-weight: bold; line-height: 1;">
                                    ~10 UI</div>
                                <span class="highlight-white"
                                    style="font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;">Microdose
                                    (Stack)</span>
                            </div>

                            <div
                                style="text-align: center; font-family: var(--font-mono); color: #9CA3AF; font-size: 0.8rem; padding-bottom: 0.5rem;">
                                <span>▲ Aumento Exponencial de Captação CHO ▲</span>
                            </div>

                            <div style="text-align: right;">
                                <div
                                    style="font-size: 3.5rem; font-family: var(--font-display); color: var(--accent-main); font-weight: bold; line-height: 1; text-shadow: 0 0 15px rgba(220,38,38,0.5);">
                                    ~15+ UI</div>
                                <span class="highlight-white"
                                    style="font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase;">Gatilho
                                    de Coma Hipoglicêmico</span>
                            </div>
                        </div>

                        <!-- Barra Segmentada (Tracker Flexível) -->
                        <div
                            style="width: 100%; height: 20px; background: rgba(0,0,0,0.5); border-radius: 10px; display: flex; border: 1px solid rgba(255,255,255,0.1); position: relative; z-index: 10;">

                            <!-- SEGMENTO 1: VERDE -->
                            <div class="segment green-seg"
                                style="width: 30%; background: #10B981; cursor: pointer; position: relative; border-radius: 10px 0 0 10px; transition: all 0.3s ease;">
                                <div class="hover-tip"
                                    style="position: absolute; top: calc(100% + 15px); left: 0; width: 300px; opacity: 0; visibility: hidden; transition: all 0.3s ease; text-align: left; background: rgba(16, 185, 129, 0.15); border: 1px solid #10B981; border-radius: 8px; padding: 1rem; backdrop-filter: blur(10px); z-index: 50; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                                    <div
                                        style="width: 15px; height: 15px; background: rgba(16, 185, 129, 0.15); border-top: 1px solid #10B981; border-left: 1px solid #10B981; position: absolute; top: -8px; left: 15%; transform: rotate(45deg);">
                                    </div>
                                    <strong
                                        style="color: #10B981; font-family: var(--font-display); font-size: 1.1rem; display: block; margin-bottom: 5px;">MÁXIMO
                                        ANABOLISMO</strong>
                                    <p style="font-size: 0.85rem; color: #D1D5DB; margin: 0; line-height: 1.5;">A dose
                                        ideal (~10 UI) pós-treino satura os receptores celulares, garantindo captação
                                        total de nutrientes sem esvaziar a glicose central agudamente.</p>
                                </div>
                            </div>

                            <!-- SEGMENTO 2: AMARELO -->
                            <div class="segment yellow-seg"
                                style="width: 40%; background: linear-gradient(90deg, #10B981 0%, #F59E0B 100%); cursor: pointer; position: relative; transition: all 0.3s ease;">
                                <div class="hover-tip"
                                    style="position: absolute; top: calc(100% + 15px); left: 50%; transform: translateX(-50%); width: 320px; opacity: 0; visibility: hidden; transition: all 0.3s ease; text-align: left; background: rgba(245, 158, 11, 0.15); border: 1px solid #F59E0B; border-radius: 8px; padding: 1rem; backdrop-filter: blur(10px); z-index: 50; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                                    <div
                                        style="width: 15px; height: 15px; background: rgba(245, 158, 11, 0.15); border-top: 1px solid #F59E0B; border-left: 1px solid #F59E0B; position: absolute; top: -8px; left: calc(50% - 7px); transform: rotate(45deg);">
                                    </div>
                                    <strong
                                        style="color: #F59E0B; font-family: var(--font-display); font-size: 1.1rem; display: block; margin-bottom: 5px;">RECEPTORES
                                        SATURADOS</strong>
                                    <p style="font-size: 0.85rem; color: #D1D5DB; margin: 0; line-height: 1.5;">Acima de
                                        ~12 UI não há mais receptores musculares disponíveis. A insulina extra sobra no
                                        sangue derrubando violentamente a glicemia.</p>
                                </div>
                            </div>

                            <!-- SEGMENTO 3: VERMELHO -->
                            <div class="segment red-seg"
                                style="width: 30%; background: var(--accent-main); cursor: pointer; position: relative; border-radius: 0 10px 10px 0; transition: all 0.3s ease;">
                                <div
                                    style="position: absolute; left: 20%; top: -5px; bottom: -5px; width: 4px; background: white; box-shadow: 0 0 10px white; z-index: 2;">
                                </div>
                                <div class="hover-tip"
                                    style="position: absolute; top: calc(100% + 15px); right: 0; width: 300px; opacity: 0; visibility: hidden; transition: all 0.3s ease; text-align: left; background: rgba(220, 38, 38, 0.15); border: 1px solid var(--accent-main); border-radius: 8px; padding: 1rem; backdrop-filter: blur(10px); z-index: 50; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                                    <div
                                        style="width: 15px; height: 15px; background: rgba(220, 38, 38, 0.15); border-top: 1px solid var(--accent-main); border-left: 1px solid var(--accent-main); position: absolute; top: -8px; right: 15%; transform: rotate(45deg);">
                                    </div>
                                    <strong
                                        style="color: var(--accent-main); font-family: var(--font-display); font-size: 1.1rem; display: block; margin-bottom: 5px; animation: pulse-glow 2s infinite;">COMA
                                        HIPOGLICÊMICO</strong>
                                    <p style="font-size: 0.85rem; color: #FCA5A5; margin: 0; line-height: 1.5;">A margem
                                        de erro terapêutico é de apenas 2 a 4 unidades extras. O cérebro desliga por
                                        falta de glicose antes que o corpo exiba letargia profunda.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Textos Estáticos (Visíveis por padrão) -->
                        <div
                            style="display: flex; justify-content: space-between; margin-top: 0.8rem; font-size: 0.75rem; color: #6B7280; font-family: var(--font-mono);">
                            <span style="flex:1; text-align: left;">Risco de Hipoglicemia</span>
                            <span style="flex:1; text-align: center;">Saturação de Receptores IR</span>
                            <span style="flex:1; text-align: right;">Depleção Critica de Glicose SNC</span>
                        </div>

                        <!-- Guia Base (Texto grande inferior) -->
                        <div class="guide-text" style="margin-top: 2.5rem; transition: opacity 0.3s ease;">
                            <p
                                style="text-align: center; font-size: 0.95rem; color: #9CA3AF; background: rgba(0,0,0,0.4); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); border-left: 3px solid var(--text-secondary);">
                                Passe o mouse sobre os <strong>segmentos da régua (verde, amarelo e vermelho)</strong>
                                acima para visualizar os desdobramentos fisiológicos de cada dose da Insulina.
                            </p>
                        </div>

                    </div>

                    <!-- CSS Lógica de Interação da Régua Baseado em Parent/Child clássico -->
                    <style>
                        .insulin-tracker {
                            height: 230px;
                        }

                        /* Altura fixa para os tooltips nao pularem a pagina */

                        /* Aparecimento do Tooltip */
                        .segment:hover .hover-tip {
                            opacity: 1 !important;
                            visibility: visible !important;
                            transform: translateY(5px) scale(1.02);
                        }

                        /* Exceção especial para tooltip do centro */
                        .segment.yellow-seg:hover .hover-tip {
                            transform: translateX(-50%) translateY(5px) scale(1.02);
                        }

                        /* Diminuindo foco dos vizinhos */
                        .insulin-tracker:hover .segment:not(:hover) {
                            opacity: 0.3;
                            filter: grayscale(100%);
                        }

                        /* Ocultar guia base no hover geral */
                        .insulin-tracker:hover .guide-text {
                            opacity: 0;
                        }
                    </style>
                </div>
            </div>
        </div>
        </div>`
  },
  {
    id: 13,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>Insulina</span>
            <span>09.1</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">Translocação Massiva do GLUT4</h2>
            <p class="subtitle reveal delay-1" style="margin-bottom: 2rem;">A mágica molecular do anabolismo extremo
                induzido pela insulina.</p>

            <div class="reveal-scale delay-2"
                style="position: relative; width: 100%; max-width: 900px; height: 510px; perspective: 1000px; padding: 20px; padding-top: 70px;">

                <!-- Estilos específicos para a animação da célula -->
                <style>
                    .cell-container {
                        width: 100%;
                        height: 100%;
                        background: radial-gradient(circle at 50% 120%, rgba(30, 41, 59, 1), rgba(15, 23, 42, 1));
                        border: 2px solid rgba(255, 255, 255, 0.1);
                        border-radius: 20px;
                        position: relative;
                        overflow: visible;
                        box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.8);
                        /* Superfície da Membrana (Topo) */
                        border-top: 22px solid rgba(96, 165, 250, 0.4);
                        padding-top: 8px;
                    }

                    /* Insulina Moléculas */
                    .insulin-mol {
                        position: absolute;
                        width: 18px;
                        height: 16px;
                        background: linear-gradient(135deg, #FBBF24, #F59E0B);
                        clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
                        box-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
                        z-index: 10;
                        top: -30px;
                        opacity: 0;
                    }

                    /* Receptor de Insulina (IR) */
                    .insulin-receptor {
                        position: absolute;
                        top: 0;
                        /* Colado na borda superior (membrana) */
                        left: 50%;
                        transform: translateX(-50%);
                        width: 70px;
                        height: 60px;
                        background: transparent;
                        display: flex;
                        justify-content: center;
                        z-index: 5;
                        cursor: pointer;
                        transition: all 0.3s;
                    }

                    /* Hastes do receptor */
                    .insulin-receptor::before,
                    .insulin-receptor::after {
                        content: '';
                        position: absolute;
                        top: -10px;
                        width: 15px;
                        height: 40px;
                        background: #10B981;
                        border-radius: 8px 8px 0 0;
                        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .insulin-receptor::before {
                        left: 15px;
                        transform: rotate(-15deg);
                    }

                    .insulin-receptor::after {
                        right: 15px;
                        transform: rotate(15deg);
                    }

                    /* Base intra celular (Tirosina Quinase) */
                    .receptor-base {
                        position: absolute;
                        bottom: -10px;
                        width: 50px;
                        height: 25px;
                        background: #047857;
                        border-radius: 8px;
                        transition: background 0.5s;
                        box-shadow: 0 0 10px rgba(16, 185, 129, 0.2);
                    }

                    /* Vesículas GLUT4 */
                    .glut4-vesicle {
                        position: absolute;
                        bottom: 40px;
                        width: 60px;
                        height: 60px;
                        border: 2px dashed rgba(96, 165, 250, 0.5);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: rgba(96, 165, 250, 0.05);
                        transition: all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                        animation: float-vesicle 4s ease-in-out infinite;
                    }

                    @keyframes float-vesicle {

                        0%,
                        100% {
                            transform: translateY(0);
                        }

                        50% {
                            transform: translateY(-15px);
                        }
                    }

                    .glut4-v1 {
                        left: 20%;
                        animation-delay: 0s;
                    }

                    .glut4-v2 {
                        left: 50%;
                        transform: translateX(-50%);
                        bottom: 20px;
                        animation-delay: 1s;
                    }

                    .glut4-v3 {
                        right: 20%;
                        animation-delay: 2s;
                    }

                    /* Proteina GLUT4 dentro da vesicula */
                    .glut4-protein {
                        width: 30px;
                        height: 15px;
                        background: #3B82F6;
                        border-radius: 4px;
                        box-shadow: 0 0 10px #3B82F6;
                    }

                    /* ESTADOS ATIVADOS (Quando o cursor passa por cima da célula) */
                    .cell-container:hover .receptor-base {
                        background: #34D399;
                        /* Fosforilou */
                        box-shadow: 0 0 25px #34D399;
                    }

                    .cell-container:hover .insulin-receptor::before {
                        transform: rotate(0deg) translateY(10px);
                        /* Fecha ao redor da insulina */
                    }

                    .cell-container:hover .insulin-receptor::after {
                        transform: rotate(0deg) translateY(10px);
                    }

                    /* Cai a insulina (Bind) */
                    .cell-container:hover .insulin-mol {
                        animation: insulin-bind 0.5s forwards ease-out;
                    }

                    @keyframes insulin-bind {
                        0% {
                            top: -40px;
                            opacity: 0;
                        }

                        50% {
                            opacity: 1;
                        }

                        100% {
                            top: 10px;
                            opacity: 1;
                            transform: scale(1.2);
                        }
                    }

                    /* Translocação do GLUT4 pra Membrana (Topo) */
                    .cell-container:hover .glut4-vesicle {
                        animation: none;
                        /* Para de flutuar localmente ao amarrar na membrana */
                    }

                    .cell-container:hover .glut4-v1 {
                        bottom: calc(100% - 30px);
                        /* Toca a membrana */
                        background: rgba(96, 165, 250, 0.3);
                        border-style: solid;
                        transform: rotate(-10deg);
                    }

                    .cell-container:hover .glut4-v2 {
                        bottom: calc(100% - 30px);
                        background: rgba(96, 165, 250, 0.3);
                        border-style: solid;
                        transform: translateX(-50%);
                    }

                    .cell-container:hover .glut4-v3 {
                        bottom: calc(100% - 30px);
                        background: rgba(96, 165, 250, 0.3);
                        border-style: solid;
                        transform: rotate(10deg);
                    }

                    .cell-container:hover .pathway-ray {
                        opacity: 1;
                        height: 100%;
                    }

                    /* Brilho da Membrana ao Abrir Canais GLUT4 */
                    .membrane-glow {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 20px;
                        background: rgba(59, 130, 246, 0.4);
                        filter: blur(8px);
                        opacity: 0;
                        transition: opacity 0.5s;
                        transition-delay: 1.2s;
                    }

                    .cell-container:hover .membrane-glow {
                        opacity: 1;
                        animation: pulse-glow 2s infinite;
                    }

                    /* Moleculas de Glicose Célula afora entrando */
                    .glucose-mol {
                        position: absolute;
                        width: 14px;
                        height: 14px;
                        background: #10B981;
                        border-radius: 50%;
                        box-shadow: 0 0 12px #10B981;
                        opacity: 0;
                        z-index: 15;
                    }

                    .cell-container:hover .glucose-mol {
                        animation: glucose-enter 1.5s forwards infinite ease-out;
                    }

                    .cell-container:hover .glucose-1 {
                        animation-delay: 1.5s;
                        left: 22%;
                        top: -20px;
                    }

                    .cell-container:hover .glucose-2 {
                        animation-delay: 2.1s;
                        left: 45%;
                        top: -20px;
                    }

                    .cell-container:hover .glucose-3 {
                        animation-delay: 1.8s;
                        right: 22%;
                        top: -20px;
                    }

                    .cell-container:hover .glucose-4 {
                        animation-delay: 2.5s;
                        left: 55%;
                        top: -20px;
                    }

                    .cell-container:hover .glucose-5 {
                        animation-delay: 2.8s;
                        right: 40%;
                        top: -20px;
                    }

                    @keyframes glucose-enter {
                        0% {
                            top: -20px;
                            opacity: 1;
                            transform: scale(1);
                        }

                        40% {
                            opacity: 1;
                        }

                        100% {
                            top: 300px;
                            opacity: 0;
                            transform: scale(0.4);
                        }
                    }

                    /* Sinalização cascata */
                    .pathway-ray {
                        position: absolute;
                        top: 25px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 4px;
                        height: 0%;
                        background: linear-gradient(180deg, #34D399, transparent);
                        opacity: 0;
                        transition: height 0.8s ease-in-out, opacity 0.5s;
                        z-index: 1;
                        pointer-events: none;
                    }

                    /* Feedback Text */
                    .cell-feedback {
                        position: absolute;
                        bottom: 20px;
                        width: 100%;
                        text-align: center;
                        font-family: var(--font-display);
                        color: #6B7280;
                        transition: 0.3s;
                        z-index: 20;
                    }

                    .cell-container:hover .cell-feedback {
                        color: #10B981;
                        text-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
                    }
                </style>

                <div class="cell-container">

                    <!-- VASO SANGUÍNEO (acima da membrana) -->
                    <style>
                        .blood-vessel {
                            position: absolute;
                            top: -85px;
                            left: 5%;
                            width: 90%;
                            height: 50px;
                            background: linear-gradient(180deg, rgba(127, 29, 29, 0.6) 0%, rgba(185, 28, 28, 0.4) 40%, rgba(220, 38, 38, 0.2) 100%);
                            border-radius: 30px;
                            border: 1.5px solid rgba(220, 38, 38, 0.3);
                            overflow: hidden;
                            z-index: 25;
                            box-shadow: 0 4px 20px rgba(220, 38, 38, 0.15), inset 0 0 15px rgba(0, 0, 0, 0.4);
                        }

                        /* Parede superior do vaso (endotelio) */
                        .blood-vessel::before {
                            content: '';
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 4px;
                            background: linear-gradient(90deg, rgba(185, 28, 28, 0.6), rgba(239, 68, 68, 0.4), rgba(185, 28, 28, 0.6));
                        }

                        .blood-vessel::after {
                            content: '';
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            width: 100%;
                            height: 4px;
                            background: linear-gradient(90deg, rgba(185, 28, 28, 0.6), rgba(239, 68, 68, 0.4), rgba(185, 28, 28, 0.6));
                        }

                        /* Hemácias animadas */
                        .rbc {
                            position: absolute;
                            width: 22px;
                            height: 10px;
                            background: radial-gradient(ellipse, #DC2626 30%, #991B1B 80%);
                            border-radius: 50%;
                            box-shadow: inset 2px 0 4px rgba(0, 0, 0, 0.4), inset -2px 0 4px rgba(0, 0, 0, 0.4), 0 0 6px rgba(220, 38, 38, 0.3);
                            animation: rbc-flow 4s linear infinite;
                        }

                        .rbc::after {
                            content: '';
                            position: absolute;
                            top: 3px;
                            left: 5px;
                            width: 12px;
                            height: 4px;
                            background: rgba(0, 0, 0, 0.2);
                            border-radius: 50%;
                        }

                        @keyframes rbc-flow {
                            0% {
                                transform: translateX(-40px) rotate(-5deg);
                                opacity: 0;
                            }

                            10% {
                                opacity: 1;
                            }

                            90% {
                                opacity: 1;
                            }

                            100% {
                                transform: translateX(calc(90vw)) rotate(5deg);
                                opacity: 0;
                            }
                        }

                        .rbc-1 {
                            top: 8px;
                            animation-delay: 0s;
                            animation-duration: 5s;
                        }

                        .rbc-2 {
                            top: 20px;
                            animation-delay: 0.8s;
                            animation-duration: 4.5s;
                        }

                        .rbc-3 {
                            top: 12px;
                            animation-delay: 1.6s;
                            animation-duration: 5.2s;
                        }

                        .rbc-4 {
                            top: 28px;
                            animation-delay: 2.4s;
                            animation-duration: 4.8s;
                        }

                        .rbc-5 {
                            top: 16px;
                            animation-delay: 3.2s;
                            animation-duration: 5.5s;
                        }

                        .rbc-6 {
                            top: 24px;
                            animation-delay: 4s;
                            animation-duration: 4.2s;
                        }

                        .rbc-7 {
                            top: 10px;
                            animation-delay: 0.4s;
                            animation-duration: 6s;
                        }

                        .rbc-8 {
                            top: 32px;
                            animation-delay: 1.2s;
                            animation-duration: 4.6s;
                        }

                        /* Glicose circulando DENTRO do vaso */
                        .vessel-glucose-inside {
                            position: absolute;
                            width: 8px;
                            height: 8px;
                            background: #10B981;
                            border-radius: 50%;
                            box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
                            animation: rbc-flow 5s linear infinite;
                        }

                        .vgi-1 {
                            top: 12px;
                            animation-delay: 0.5s;
                            animation-duration: 6s;
                        }

                        .vgi-2 {
                            top: 25px;
                            animation-delay: 2s;
                            animation-duration: 5s;
                        }

                        .vgi-3 {
                            top: 18px;
                            animation-delay: 3.5s;
                            animation-duration: 5.5s;
                        }

                        .vgi-4 {
                            top: 30px;
                            animation-delay: 1s;
                            animation-duration: 4.5s;
                        }

                        /* Glicose saindo do vaso */
                        .vessel-glucose {
                            position: absolute;
                            width: 8px;
                            height: 8px;
                            background: #10B981;
                            border-radius: 50%;
                            box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
                            opacity: 0;
                            z-index: 26;
                        }

                        .cell-container:hover .vessel-glucose {
                            animation: glucose-from-vessel 2.5s ease-in-out infinite;
                        }

                        @keyframes glucose-from-vessel {
                            0% {
                                opacity: 0;
                                transform: translateY(0);
                            }

                            15% {
                                opacity: 1;
                            }

                            100% {
                                opacity: 0;
                                transform: translateY(120px);
                            }
                        }

                        .vg-1 {
                            left: 18%;
                            top: -15px;
                            animation-delay: 1.8s !important;
                        }

                        .vg-2 {
                            left: 35%;
                            top: -15px;
                            animation-delay: 2.2s !important;
                        }

                        .vg-3 {
                            left: 55%;
                            top: -15px;
                            animation-delay: 2.6s !important;
                        }

                        .vg-4 {
                            left: 72%;
                            top: -15px;
                            animation-delay: 3s !important;
                        }

                        /* Labels anatômicos do vaso */
                        .vessel-label {
                            position: absolute;
                            font-size: 0.5rem;
                            font-family: var(--font-mono);
                            letter-spacing: 0.08em;
                            z-index: 27;
                            pointer-events: none;
                        }
                    </style>

                    <!-- Estrutura do Vaso -->
                    <div class="blood-vessel">
                        <div class="rbc rbc-1"></div>
                        <div class="rbc rbc-2"></div>
                        <div class="rbc rbc-3"></div>
                        <div class="rbc rbc-4"></div>
                        <div class="rbc rbc-5"></div>
                        <div class="rbc rbc-6"></div>
                        <div class="rbc rbc-7"></div>
                        <div class="rbc rbc-8"></div>
                        <!-- Glicose dentro do vaso -->
                        <div class="vessel-glucose-inside vgi-1"></div>
                        <div class="vessel-glucose-inside vgi-2"></div>
                        <div class="vessel-glucose-inside vgi-3"></div>
                        <div class="vessel-glucose-inside vgi-4"></div>
                        <span class="vessel-label" style="top: -12px; left: 10px; color: #F87171;">LÚMEN DO VASO</span>
                        <span class="vessel-label" style="bottom: -14px; right: 10px; color: #FCA5A5;">ENDOTÉLIO</span>
                        <span class="vessel-label"
                            style="top: 50%; left: 50%; transform: translate(-50%, -50%); color: rgba(255,255,255,0.25); font-size: 0.45rem;">←
                            HEMÁCIAS →</span>
                    </div>

                    <!-- Glicose saindo do vaso para a célula -->
                    <div class="vessel-glucose vg-1"></div>
                    <div class="vessel-glucose vg-2"></div>
                    <div class="vessel-glucose vg-3"></div>
                    <div class="vessel-glucose vg-4"></div>

                    <div class="membrane-glow"></div>

                    <!-- Membrana Texto -->
                    <div
                        style="position: absolute; top: 6px; left: 10px; font-size: 0.7rem; color: #60A5FA; font-family: var(--font-mono); letter-spacing: 0.1em; z-index: 5;">
                        MEMBRANA CELULAR
                    </div>

                    <!-- Glicose entrando via GLUT4 -->
                    <div class="glucose-mol glucose-1"></div>
                    <div class="glucose-mol glucose-2"></div>
                    <div class="glucose-mol glucose-3"></div>
                    <div class="glucose-mol glucose-4"></div>
                    <div class="glucose-mol glucose-5"></div>

                    <!-- Receptor de Insulina e Cascatas -->
                    <div class="insulin-receptor">
                        <div class="insulin-mol"></div>
                        <div class="receptor-base"></div>
                        <!-- Label Insulina -->
                        <span
                            style="position: absolute; top: -45px; left: 50%; transform: translateX(-50%); font-size: 0.55rem; font-family: var(--font-mono); color: #FBBF24; white-space: nowrap; pointer-events: none; z-index: 30; letter-spacing: 0.05em;">⬡
                            INSULINA</span>
                        <!-- Label Receptor -->
                        <span
                            style="position: absolute; top: 55px; left: 50%; transform: translateX(-50%); font-size: 0.5rem; font-family: var(--font-mono); color: #34D399; white-space: nowrap; pointer-events: none; z-index: 30; letter-spacing: 0.05em;">RECEPTOR
                            IR-α/β</span>
                    </div>

                    <!-- Raio de Sinalização (PI3K -> Akt) -->
                    <div class="pathway-ray"></div>
                    <!-- Vesículas GLUT4 -->
                    <div class="glut4-vesicle glut4-v1">
                        <div class="glut4-protein"></div>
                    </div>
                    <div class="glut4-vesicle glut4-v2">
                        <div class="glut4-protein"></div>
                    </div>
                    <div class="glut4-vesicle glut4-v3">
                        <div class="glut4-protein"></div>
                    </div>

                    <!-- Labels das Vesículas -->
                    <span
                        style="position: absolute; top: 38%; left: 15%; font-size: 0.5rem; font-family: var(--font-mono); color: #60A5FA; pointer-events: none; z-index: 30; opacity: 0.8;">←
                        GLUT4</span>
                    <span
                        style="position: absolute; top: 50%; right: 12%; font-size: 0.5rem; font-family: var(--font-mono); color: #60A5FA; pointer-events: none; z-index: 30; opacity: 0.8;">GLUT4
                        →</span>

                    <!-- Label Glicose -->
                    <span
                        style="position: absolute; top: 30%; left: 25%; font-size: 0.48rem; font-family: var(--font-mono); color: #10B981; pointer-events: none; z-index: 30; opacity: 0.7;">●
                        GLICOSE</span>

                    <!-- Legenda de Referência -->
                    <div
                        style="position: absolute; bottom: 60px; right: 10px; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 10px; z-index: 30; pointer-events: none;">
                        <div
                            style="font-size: 0.5rem; font-family: var(--font-display); color: #9CA3AF; margin-bottom: 4px; letter-spacing: 0.1em;">
                            LEGENDA</div>
                        <div
                            style="font-size: 0.45rem; font-family: var(--font-mono); color: #FBBF24; margin-bottom: 2px;">
                            ⬡ Insulina</div>
                        <div
                            style="font-size: 0.45rem; font-family: var(--font-mono); color: #34D399; margin-bottom: 2px;">
                            ■ Receptor IR-α/β</div>
                        <div
                            style="font-size: 0.45rem; font-family: var(--font-mono); color: #10B981; margin-bottom: 2px;">
                            ● Glicose</div>
                        <div
                            style="font-size: 0.45rem; font-family: var(--font-mono); color: #60A5FA; margin-bottom: 2px;">
                            ◉ Vesícula GLUT4</div>
                        <div
                            style="font-size: 0.45rem; font-family: var(--font-mono); color: #DC2626; margin-bottom: 2px;">
                            ⊖ Hemácia</div>
                        <div style="font-size: 0.45rem; font-family: var(--font-mono); color: #60A5FA;">━ Membrana
                            Celular</div>
                    </div>

                    <!-- Texto Dinâmico -->
                    <div class="cell-feedback">
                        <span style="font-size: 1.2rem;">PASSE O MOUSE NA CÉLULA</span><br>
                        <span style="font-size: 0.8rem; font-family: var(--font-body);">Para amarrar a Insulina e
                            engatilhar a translocação dos canais GLUT4.</span>
                    </div>

                </div>

            </div>
        </div>`
  },
  {
    id: 14,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>EPO & Endurance</span>
            <span>10</span>
        </div>
        <div class="slide-content">
            <h2 class="reveal">O Hematócrito que Mata</h2>
            <p class="subtitle reveal delay-1">Riscos do aumento da viscosidade sanguínea</p>

            <div class="grid-2 reveal delay-2">
                <div class="card" style="border-left-color: #10B981;">
                    <h3 style="color: #10B981">Fisiologia Normal (Hematócrito ~45%)</h3>
                    <p>Produzida nas células intersticiais peritubulares renais (Fibroblastos) em resposta ao HIF-1α
                        (Fator Induzido por Hipóxia). Liga-se ao receptor homodimérico EPOR nos progenitores eritroides
                        da medula óssea induzindo via JAK2/STAT5. Fluxo e viscosidade ideais para DC (Débito Cardíaco).
                    </p>
                </div>
                <div class="card" style="border-left-color: var(--accent-main);">
                    <h3 class="highlight-red">rhEPO Abusiva (Hematócrito >55-60%)</h3>
                    <p>Cria-se um volume sanguíneo similar a "iogurte" (policitemia secundária aguda). A força de
                        cisalhamento endotelial subverte a oxigenação: a hiperviscosidade derruba o retorno venoso e
                        sobrecarrega a câmara ventricular esquerda.<br><br><em>(No sono, com FC ~30bpm em atletas, esse
                            estase severo deflagra microtromboses e infarto agudo - "A maldição dos ciclistas dos anos
                            90")</em></p>
                </div>
            </div>
        </div>`
  },
  {
    id: 15,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>Passaporte Biológico</span>
            <span>11</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">Ação vs Detecção</h2>
            <p class="subtitle reveal delay-1">O segredo da microdosagem estratégica</p>

            <div class="reveal-scale delay-2"
                style="width: 100%; max-width: 1000px; padding: 2rem; background: var(--card-bg); border-radius: 12px; margin-top: var(--content-gap); box-shadow: inset 0 0 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05);">

                <div
                    style="display: flex; justify-content: space-between; font-family: var(--font-mono); font-size: 0.75rem; color: #9CA3AF; margin-bottom: 0.5rem; padding: 0 10px;">
                    <span>DIA 0 (Injeção)</span>
                    <span>LIMIAR DE COMPETIÇÃO (DIA X)</span>
                    <span>MESES/ANOS (Rastreio)</span>
                </div>

                <!-- LINHA 1: TESTOSTERONA EM SUSPENSÃO (Aquosa) -->
                <div style="margin-bottom: 2.5rem; position: relative;">
                    <div
                        style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
                        <p
                            style="font-family: var(--font-display); color: white; display: flex; align-items: center; gap: 10px;">
                            <span
                                style="width: 10px; height: 10px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
                            Testosterona Suspensão (Aquosa)
                        </p>
                        <span
                            style="font-size: 0.8rem; color: #10B981; background: rgba(16,185,129,0.2); padding: 2px 8px; border-radius: 4px;">Uso
                            pré-prova</span>
                    </div>

                    <div
                        style="position: relative; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); overflow: hidden; display: flex;">
                        <!-- Ação (Verde) -->
                        <div style="width: 15%; background: linear-gradient(90deg, rgba(16,185,129,0.8), #10B981); position: relative; z-index: 2; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px;"
                            title="Pico plasmático imediato. Depuração completa ultra-rápida.">
                            <span
                                style="font-size: 0.7rem; color: black; font-weight: bold; font-family: var(--font-mono);">Meia-vida:
                                ~10h</span>
                        </div>
                        <!-- Detecção (Vermelho translúcido para mostrar sobreposição) -->
                        <div style="position: absolute; top: 0; left: 0; height: 100%; width: 25%; background: repeating-linear-gradient(45deg, rgba(220, 38, 38, 0.4), rgba(220, 38, 38, 0.4) 10px, rgba(0,0,0,0) 10px, rgba(0,0,0,0) 20px); z-index: 3;"
                            title="Janela de Detecção Urinária WADA: 1 a 3 dias">
                            <span
                                style="position: absolute; right: 5px; top: 2px; font-size: 0.6rem; color: #FCA5A5;">Excreção:
                                1-3 dias</span>
                        </div>
                    </div>
                </div>

                <!-- LINHA 2: ESTER LONGO (Decanoato de Nandrolona) -->
                <div style="margin-bottom: 2rem; position: relative;">
                    <div
                        style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 0.5rem;">
                        <p
                            style="font-family: var(--font-display); color: white; display: flex; align-items: center; gap: 10px;">
                            <span
                                style="width: 10px; height: 10px; border-radius: 50%; background: var(--accent-main); display: inline-block;"></span>
                            Nandrolona (Decanoato)
                        </p>
                        <span
                            style="font-size: 0.8rem; color: var(--accent-main); background: rgba(220,38,38,0.2); padding: 2px 8px; border-radius: 4px;">Uso
                            Base (Off-Season)</span>
                    </div>

                    <div
                        style="position: relative; height: 32px; border-radius: 6px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); display: flex;">
                        <!-- Ação (Verde) -->
                        <div
                            style="width: 45%; background: linear-gradient(90deg, rgba(16,185,129,0.4), rgba(16,185,129,0.8)); position: relative; z-index: 2; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; border-right: 2px solid white;">
                            <span
                                style="font-size: 0.7rem; color: white; font-weight: bold; font-family: var(--font-mono); text-shadow: 0px 0px 5px black;">Efeito
                                Clínico: 4-6 Semanas</span>
                        </div>

                        <!-- Rastreio Espectrometria de Massa (Vermelho) -->
                        <div
                            style="position: absolute; top: -2px; left: 0; height: calc(100% + 4px); width: 95%; border: 2px dashed rgba(220,38,38,0.8); z-index: 1; pointer-events: none;">
                            <span
                                style="position: absolute; right: 10px; top: 8px; font-size: 0.75rem; color: #FCA5A5; font-family: var(--font-mono); background: var(--bg-primary); padding: 0 5px;">Rastreio
                                Metabólito (19-Nor): **Até 18 Meses**</span>
                        </div>
                    </div>
                </div>

                <!-- LINHA TEMPO MARCADOR -->
                <div
                    style="position: relative; width: 100%; height: 2px; background: rgba(255,255,255,0.2); margin: 3rem 0 1rem; border-radius: 2px;">
                    <!-- Playhead -->
                    <div
                        style="position: absolute; left: 60%; top: -10px; width: 4px; height: 22px; background: var(--accent-info); box-shadow: 0 0 10px var(--accent-info); z-index: 5;">
                        <span
                            style="position: absolute; top: -25px; left: -50px; width: 100px; text-align: center; color: var(--accent-info); font-size: 0.7rem; font-weight: bold; text-transform: uppercase;">Dia
                            da Prova</span>
                    </div>
                </div>

                <div
                    style="background: linear-gradient(90deg, rgba(31, 41, 55, 0.8) 0%, rgba(31, 41, 55, 0.2) 100%); border-left: 5px solid var(--accent-info); padding: 2rem; border-radius: 8px; margin-top: 2rem; max-width: 800px; text-align: left; position: relative;">
                    <!-- Decoração abstrata de tempo -->
                    <div style="position: absolute; right: 2rem; top: 2rem; opacity: 0.1; pointer-events: none;">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.5"
                            stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                    </div>

                    <h3
                        style="color: var(--accent-info); font-family: var(--font-display); font-size: 1.8rem; margin-bottom: 1rem;">
                        O Clearance Rate & "Gap Temporal"</h3>

                    <p style="font-size: 1rem; color: #E5E7EB; line-height: 1.6; margin-bottom: 1rem;">
                        A arte do doping moderno baseia-se na maestria da farmacocinética. Na <strong>Fase de Construção
                            (Off-Season)</strong> aguda e distante das competições, empilham-se drogas de meia-vida
                        extremamente longa (Ésteres Pesados como <span class="highlight-red">Decanoato, Enantato,
                            Cipionato</span>). Estas criam permanentemente a base de mionúcleos - uma vantagem que nunca
                        se perde.
                    </p>
                    <p style="font-size: 1rem; color: #E5E7EB; line-height: 1.6; margin: 0;">
                        À medida que a competição e os testes se aproximam - entrando na <strong>Clearance
                            Window</strong> -, as moléculas pesadas são descartadas. Entram no lugar as moléculas
                        "In/Out" (Ésteres Curtos, como <span style="color:#10B981">Suspensão, Propionato, Peptídeos, e
                            Insulina Rápida</span>). Estas mantêm o ambiente celular 100% saturado e androgênico, mas
                        com uma <span
                            style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; border: 1px dotted rgba(255,255,255,0.3);">excreção
                            urinária de horas a dias</span>, garantindo urina limpa no dia da prova enquanto a
                        hipertrofia gerada meses antes é retida.
                    </p>
                </div>
            </div>
        </div>`
  },
  {
    id: 16,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>Antidoping</span>
            <span>12</span>
        </div>
        <div class="slide-content">
            <h2 class="reveal">Passaporte Biológico (ABP)</h2>
            <p class="subtitle reveal delay-1" style="margin-bottom: 2rem;">Análise Forense Longitudinal</p>

            <div class="reveal-scale delay-2"
                style="display: flex; flex-direction: column; width: 100%; max-width: 1000px; margin: 0 auto; text-align: left;">

                <!-- Ponto 1: Distorção do Sistema -->
                <div class="expand-card" style="border-left-color: var(--accent-info);"
                    onclick="this.classList.toggle('active')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="color: white; font-size: 1.5rem; margin: 0;">1. Distorção do Sistema</h3>
                        <span style="color: var(--accent-info); font-size: 1.2rem; transition: transform 0.3s;"
                            class="chevron">👁️</span>
                    </div>
                    <div class="expand-content">
                        <p style="font-size: 0.95rem; color: #D1D5DB; line-height: 1.6; margin-bottom: 0;">
                            Não flagra a molécula intrusa diretamente; analisa a <strong>distorção do sistema
                                fisiológico</strong>. Em vez de procurar a "agulha no palheiro", o ABP verifica se o
                            "palheiro" mudou de forma.
                        </p>
                    </div>
                </div>

                <!-- Ponto 2: Comparação Histórica -->
                <div class="expand-card" style="border-left-color: #F59E0B;" onclick="this.classList.toggle('active')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="color: white; font-size: 1.5rem; margin: 0;">2. O Atleta contra Ele Mesmo</h3>
                        <span style="color: #F59E0B; font-size: 1.2rem; transition: transform 0.3s;"
                            class="chevron">👤</span>
                    </div>
                    <div class="expand-content">
                        <p style="font-size: 0.95rem; color: #D1D5DB; line-height: 1.6; margin-bottom: 0;">
                            A maior revolução do antidoping: limites populacionais fixos foram abandonados. O atleta é
                            comparado <span class="highlight-white">exclusivamente com seu próprio histórico genético e
                                fisiológico</span>, utilizando inferência Bayesiana para calcular a probabilidade de um
                            desvio natural.
                        </p>
                    </div>
                </div>

                <!-- Ponto 3: Módulo Hematológico -->
                <div class="expand-card" style="border-left-color: var(--accent-main);"
                    onclick="this.classList.toggle('active')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="color: white; font-size: 1.5rem; margin: 0;">3. Módulo Hematológico</h3>
                        <span style="color: var(--accent-main); font-size: 1.2rem; transition: transform 0.3s;"
                            class="chevron">🩸</span>
                    </div>
                    <div class="expand-content">
                        <p style="font-size: 0.95rem; color: #D1D5DB; line-height: 1.6; margin-bottom: 0.8rem;">
                            Introduzido em 2009. Analisa biomarcadores do transporte de oxigênio para caçar manipulação
                            sanguínea, reinfusões e abuso de EPO.
                        </p>
                        <ul
                            style="padding-left: 1.5rem; color: #9CA3AF; font-size: 0.85rem; line-height: 1.6; list-style-type: square;">
                            <li><strong style="color: white;">Hemoglobina (Hb) / Hematócrito:</strong> Quantidade
                                absoluta de carreadores de O².</li>
                            <li><strong style="color: white;">Reticulócitos (%Ret):</strong> Células vermelhas "bebês"
                                na medula. Seu afundamento sub-súbito denuncia injeção de sangue maduro (Transfusão).
                            </li>
                            <li><strong style="color: white;">OFF-Score:</strong> Um índice matemático que mescla Hb
                                alta com %Ret baixa, a assinatura inconfundível do doping sanguíneo.</li>
                        </ul>
                    </div>
                </div>

                <!-- Ponto 4: Módulo Esteroide -->
                <div class="expand-card" style="border-left-color: #60A5FA;" onclick="this.classList.toggle('active')">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="color: white; font-size: 1.5rem; margin: 0;">4. Módulo Esteroide</h3>
                        <span style="color: #60A5FA; font-size: 1.2rem; transition: transform 0.3s;"
                            class="chevron">💉</span>
                    </div>
                    <div class="expand-content">
                        <p style="font-size: 0.95rem; color: #D1D5DB; line-height: 1.6; margin-bottom: 0.8rem;">
                            Introduzido em 2014. Cria um "mapa" da produção natural de testosterona e seus precursores
                            na urina ao longo do tempo.
                        </p>
                        <ul
                            style="padding-left: 1.5rem; color: #9CA3AF; font-size: 0.85rem; line-height: 1.6; list-style-type: square;">
                            <li><strong style="color: white;">Relação T/E (Testosterona/Epitest):</strong> O corpo
                                produz em razão de 1:1. Doses sintéticas elevam T, mas não E. Limite de alarme da WADA é
                                >4:1.</li>
                            <li><strong style="color: white;">Androsterona / Etiocolanolona:</strong> Metabólitos
                                terminais intracelulares.</li>
                            <li><strong style="color: white;">Deleção UGT2B17:</strong> Analisado contextualmente.
                                Populações têm deleção genética que apaga grande parte das marcas de excreção.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>`
  },
  {
    id: 17,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>Antidoping</span>
            <span>12.1</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">Transfusão Autóloga Homóloga</h2>
            <p class="subtitle reveal delay-1" style="margin-bottom: var(--content-gap);">O Calcanhar de Aquiles do
                Passaporte Biológico (ABP)</p>

            <div class="reveal-scale delay-2"
                style="width: 100%; max-width: 1100px; display: flex; flex-direction: column; gap: 2rem; background: rgba(31, 41, 55, 0.4); padding: 2rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">

                <div
                    style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; align-items: center; position: relative;">
                    <!-- Phase 1 -->
                    <div
                        style="background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 12px; border-top: 3px solid var(--accent-info); text-align: center; position: relative; z-index: 2;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem;">🩸 <i style="font-size: 1.5rem;">❄️</i>
                        </div>
                        <h4
                            style="color: var(--text-primary); margin-bottom: 0.5rem; font-family: var(--font-display);">
                            Fase 1: Extração</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">O atleta retira e
                            congela o próprio sangue (ricos em hemácias) semanas antes, muitas vezes logo após
                            microdoses de EPO que impulsionaram o hematócrito (criopreservação).</p>
                    </div>

                    <!-- Arrow -->
                    <div
                        style="text-align: center; color: var(--accent-main); font-size: 2rem; position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; opacity: 0.5;">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </div>

                    <!-- Phase 2 -->
                    <div
                        style="background: rgba(0,0,0,0.3); padding: 1.5rem; border-radius: 12px; border-top: 3px solid var(--accent-main); text-align: center; position: relative; z-index: 2;">
                        <div style="font-size: 2.5rem; margin-bottom: 1rem; position: relative; display: inline-block;">
                            💉 <div style="position:absolute; bottom: -5px; right: -5px; font-size: 1rem;">🏆</div>
                        </div>
                        <h4
                            style="color: var(--text-primary); margin-bottom: 0.5rem; font-family: var(--font-display);">
                            Fase 2: Reinfusão</h4>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5;">No dia da prova,
                            a bolsa é reinfundida. O corpo recebe uma enxurrada massiva do seu próprio O² e células
                            vermelhas. Aumenta-se o Hb artificialmente sem uso de molécula exógena detectável.</p>
                    </div>
                </div>

                <div
                    style="background: rgba(220, 38, 38, 0.1); border-left: 4px solid var(--accent-main); padding: 1.5rem; border-radius: 8px;">
                    <h3
                        style="color: var(--accent-main); font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 1rem;">
                        Por que burla o Passaporte (ABP)?
                    </h3>

                    <ul
                        style="color: #E5E7EB; font-size: 0.95rem; line-height: 1.6; margin-bottom: 1.5rem; padding-left: 1.5rem; list-style-type: disc;">
                        <li style="margin-bottom: 0.5rem;">O ABP avalia <strong>especificamente a proporção</strong>
                            entre Hemácias maduras (Hb) e recém-nascidas (Reticulócitos).</li>
                        <li style="margin-bottom: 0.5rem;">Atualmente, a WADA procura por vestígios de <strong>plásticos
                                e ftalatos</strong> de bolsas de sangue na urina.</li>
                        <li style="margin-bottom: 0.5rem;">Contudo, um sangue "próprio", sem aditivos detectáveis e com
                            manejo térmico perfeito, consegue ocultar o <i>OFF-Score</i>.</li>
                        <li>A evasão ocorre quando a reinfusão mantém o visual hematológico <strong>"dentro da
                                tolerância genética normal"</strong>, calculando com exatidão a janela do <em>Clearance
                                Rate</em> hematológico.</li>
                    </ul>

                    <div style="display: flex; gap: 1rem; align-items: center;">
                        <span
                            style="font-size: 0.85rem; font-family: var(--font-mono); font-weight: bold; background: rgba(220, 38, 38, 0.3); padding: 6px 12px; border-radius: 4px; border: 1px solid rgba(220,38,38,0.5); color: #FCA5A5;">
                            ⚠️ Taxa Estimada de Falsa Segurança: 50% a 70% de evasão em testes.
                        </span>
                    </div>
                </div>

            </div>
        </div>`
  },
  {
    id: 18,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>Fronteiras Atuais</span>
            <span>BLOCO 3.1</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">SARMs: A Zona Cinzenta Molecular</h2>
            <p class="subtitle reveal delay-1" style="margin-bottom: var(--content-gap);">Moduladores Seletivos de
                Receptores Androgênicos - vendidos como suplemento, detectados como doping.</p>

            <div class="reveal-scale delay-2"
                style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--content-gap); width: 100%; max-width: 1000px; margin-top: 2vh;">
                <div class="card" style="text-align: left; padding: 2rem;">
                    <h3 class="highlight-red" style="font-size: 1.4rem; margin-bottom: 1rem;">A Falsa Promessa de
                        Segurança</h3>
                    <ul
                        style="padding-left: 1rem; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; display: block;">
                        <li style="margin-bottom: 0.8rem;"><strong>Mecanismo de Ação (MoA):</strong> Ligantes
                            não-esteroidais que ativam o receptor
                            androgênico (AR) alterando diferencialmente a conformação do domínio de ligação (LBD),
                            recrutando coativadores específicos no músculo esquelético e antagonizando a transcrição na
                            próstata.</li>
                        <li style="margin-bottom: 0.8rem;"><strong>A realidade clínica (Hepatotoxicidade DILI):</strong>
                            Elevação severa de ALT/AST
                            induzida por dano colestático mitocondrial, além de profunda supressão do eixo HPG (LH/FSH
                            zerados) em doses >5mg/dia.</li>
                        <li style="margin-bottom: 0.8rem;"><strong>Fronteiras Moleculares:</strong> Interagem
                            primariamente com a enzima
                            5-alpha-redutase de forma limitada, o que previne a hiperplasia prostática benigna, mas
                            falha em proteger contra toxicidade vascular.</li>
                    </ul>
                </div>

                <div class="card"
                    style="border-color: var(--accent-info); display: flex; flex-direction: column; height: 100%; justify-content: flex-start; gap: 1rem;">
                    <h3 style="color: #60A5FA; margin-bottom: 0;">Compostos em Destaque</h3>

                    <div
                        style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; border-left: 3px solid #60A5FA;">
                        <strong style="color: #93C5FD; font-size: 1.1rem; font-family: var(--font-mono);">1. Ostarine
                            (MK-2866)</strong>
                        <p style="font-size: 0.85rem; color: #D1D5DB; margin-top: 0.5rem; line-height: 1.4;">
                            <strong>Ação:</strong> Moderada (Efeito focado em preservação de massa e osso).<br>
                            <strong>Aparência Clínica:</strong> Caquexia e sarcopenia (Nunca aprovado humanamente).<br>
                            <span style="color: #F87171;"><strong>Colateral Subestimado:</strong> Derruba o perfil
                                lipídico (HDL desaba) drasticamente nas primeiras semanas.</span>
                        </p>
                    </div>

                    <div
                        style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; border-left: 3px solid #3B82F6;">
                        <strong style="color: #60A5FA; font-size: 1.1rem; font-family: var(--font-mono);">2. LGD-4033
                            (Ligandrol)</strong>
                        <p style="font-size: 0.85rem; color: #D1D5DB; margin-top: 0.5rem; line-height: 1.4;">
                            <strong>Ação:</strong> Alta (Forte anabolismo comparável a doses leves de EAA).<br>
                            <strong>Aparência Clínica:</strong> Distrofia muscular e osteoporose severa.<br>
                            <span style="color: #F87171;"><strong>Colateral Subestimado:</strong> Supressão
                                <strong>total</strong> da produção endógena de testosterona (Crash HTP) em testes de
                                apenas 5mg.</span>
                        </p>
                    </div>

                    <div
                        style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; border-left: 3px solid #2563EB;">
                        <strong style="color: #3B82F6; font-size: 1.1rem; font-family: var(--font-mono);">3. RAD-140
                            (Testolone)</strong>
                        <p style="font-size: 0.85rem; color: #D1D5DB; margin-top: 0.5rem; line-height: 1.4;">
                            <strong>Ação:</strong> Muito Alta (Potência neurotrópica e androgênica forte).<br>
                            <strong>Aparência Clínica:</strong> TRT experimental e Câncer de Mama Receptor+.<br>
                            <span style="color: #F87171;"><strong>Colateral Subestimado:</strong> Hepatotoxicidade
                                massiva severa (DILI de origem biliar colestática).</span>
                        </p>
                    </div>
                </div>
            </div>
            <p class="reveal-scale delay-3"
                style="text-align: center; color: var(--accent-main); margin-top: var(--element-gap); font-weight: bold; font-family: var(--font-display);">
                ⚠️ 10–15% das amostras suspeitas em laboratórios da WADA contêm SARMs.</p>
        </div>`
  },
  {
    id: 19,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>Fronteiras Atuais</span>
            <span>BLOCO 3.2</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">Beta-2 Agonistas: A Zona Cinzenta Clínica</h2>
            <div class="reveal-scale delay-1"
                style="width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: var(--content-gap); margin-top: 2vh;">
                <div class="diagram-box floating"
                    style="background: rgba(30, 58, 95, 0.3); border-color: var(--accent-info);">
                    <h3 style="color: #60A5FA; margin-bottom: 0.5rem;">De medicamente para asma a anabolizante</h3>
                    <p style="font-size: var(--body-size); color: var(--text-secondary);">Receptores beta-2 adrenérgicos
                        existem no músculo liso bronquial <strong>E no músculo esquelético</strong>. Doses
                        supraterapêuticas sistêmicas (não-inalatórias) ativam hipertrofia e oxidação de gordura.</p>
                </div>

                <div style="display: flex; gap: var(--element-gap);">
                    <div class="card" style="flex: 1; border-color: #10B981;">
                        <h3 style="color: #10B981;">Salbutamol / Formoterol</h3>
                        <p style="font-size: var(--small-size);"><strong>Via PKA/cAMP:</strong> Ativação da adenilato
                            ciclase converte ATP em cAMP, ativando PKA que induz broncodilatação e fosforila a lipase
                            hormônio sensível (HSL) para lipólise. Limiar WADA: 1600 mcg/24h (inalatório). Acima (via
                            oral >8mg), ativa a via PI3K/Akt para hipertrofia, aumentando a força isométrica
                            pré-competição.</p>
                    </div>
                    <div class="card" style="flex: 1; border-color: var(--accent-main);">
                        <h3 class="highlight-red">Clembuterol e GW1516</h3>
                        <p style="font-size: var(--small-size);"><strong>Clembuterol:</strong> Alta afinidade β2
                            sistêmica (Meia-vida: ~35h). Down-regulation de receptores ocorre em 14 dias
                            (taquifilaxia).<br><br><strong>Cardarine (GW1516):</strong> Não é Beta-2, é agonista PPARδ.
                            Reprograma a expressão genética (PGC-1α) transformando fibras de contração rápida em lentas
                            oxidativas. Carcinogênico.</p>
                    </div>
                </div>
            </div>
        </div>`
  },
  {
    id: 20,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>Fronteiras Atuais</span>
            <span>BLOCO 3.3</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">TPC e Moduladores Hormonais</h2>
            <p class="subtitle reveal delay-1">Farmacologia de recuperação para burlar o hipogonadismo pós-ciclo</p>

            <div class="reveal-scale delay-2" style="width: 100%; max-width: 800px; margin-top: var(--content-gap);">
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                    <div class="card" style="flex-direction: row; align-items: center; border-left-color: #A78BFA;">
                        <div style="width: 120px; font-weight: bold; color: #A78BFA;">SERMs</div>
                        <div style="flex: 1;">
                            <strong>Tamoxifeno / Clomifeno (Antagonistas Genômicos)</strong><br>
                            <span style="font-size: var(--small-size); color: var(--text-secondary);">Agem por
                                competição estérica (AF-2 domain) bloqueando o receptor de estrogênio (ERα e ERβ) no
                                hipotálamo/hipófise. Isso cega os quimiorreceptores ao <em>feedback</em> negativo do
                                Estradiol (E2), forçando pulsações de GnRH (até 150mg/dia nas primeiras semanas de
                                crash).</span>
                        </div>
                    </div>

                    <div class="card" style="flex-direction: row; align-items: center; border-left-color: #FBBF24;">
                        <div style="width: 120px; font-weight: bold; color: #FBBF24;">Inibidores Aromatase (IA)</div>
                        <div style="flex: 1;">
                            <strong>Anastrozol / Letrozol / Exemestano</strong><br>
                            <span style="font-size: var(--small-size); color: var(--text-secondary);">Anastrozol
                                (competitivo não-esteroidal) e Exemestano (suicida esteroidal irreversível). Bloqueiam
                                ativamente o Citocromo P450 enzima CYP19A1, derrubando severamente a aromatização
                                periférica (E2 cai até 98%). Risco: Osteopenia vascular e disfunção endotelial.</span>
                        </div>
                    </div>

                    <div class="card" style="flex-direction: row; align-items: center; border-left-color: #34D399;">
                        <div style="width: 120px; font-weight: bold; color: #34D399;">hCG e rhFSH</div>
                        <div style="flex: 1;">
                            <strong>Gonadotrofina Coriônica Humana e FSH Recombinante</strong><br>
                            <span style="font-size: var(--small-size); color: var(--text-secondary);">Estrutura
                                glicoproteica alfa idêntica ao LH humano. Liga-se aos receptores LHR nas células de
                                Leydig induzindo ativação do cAMP/PKA mitocondrial via proteína StAR (Steroidogenic
                                Acute Regulatory protein), mantendo o volume testicular sob forte supressão (uso
                                intra-ciclo 250-500 UI 2x/sem).</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`
  },
  {
    id: 21,
    classes: `bg-secondary`,
    content: `<div class="geometric-accent circle-accent"></div>
        <div class="slide-header">
            <span>O Futuro do Antidoping</span>
            <span>BLOCO 4.0</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">O Paradoxo da Detecção</h2>

            <div class="reveal-scale delay-1"
                style="display: flex; width: 100%; max-width: 900px; gap: 2rem; align-items: stretch; margin-top: 3vh;">
                <!-- Current Reality -->
                <div class="card"
                    style="flex: 1; text-align: center; border-color: var(--accent-main); background: rgba(153, 27, 27, 0.2);">
                    <h3 style="font-size: clamp(3rem, 5vw, 4rem); font-weight: 800; color: var(--accent-main);">1–3%
                    </h3>
                    <p style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: white;">Testes
                        Positivos (WADA)</p>
                    <p style="font-size: var(--small-size); margin-top: 1rem; color: #D1D5DB;">A agulha no palheiro
                        revelada por amostras de urina e sangue com janelas ultra limitadas.</p>
                </div>

                <div
                    style="display: flex; align-items: center; font-size: 2rem; font-weight: bold; color: rgba(255,255,255,0.2);">
                    VS</div>

                <!-- True Prevalence -->
                <div class="card"
                    style="flex: 1; text-align: center; border-color: #10B981; background: rgba(16, 185, 129, 0.2);">
                    <h3 style="font-size: clamp(3rem, 5vw, 4rem); font-weight: 800; color: #10B981;">~43%</h3>
                    <p style="font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: white;">
                        Prevalência Real Estimada</p>
                    <p style="font-size: var(--small-size); margin-top: 1rem; color: #D1D5DB;">Dados de enquetes
                        epidemiológicas secretas em campeonatos de atletismo de elite (2018).</p>
                </div>
            </div>

            <div class="reveal delay-2 card" style="margin-top: var(--content-gap); width: 100%; max-width: 900px;">
                <h3 style="color: #F87171;">Como essa falha acontece?</h3>
                <ol
                    style="padding-left: 1.5rem; font-size: var(--body-size); color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.6;">
                    <li><strong>Microdosagem Estratégica:</strong> Doses frações diárias (e.g., EPO) mantêm os ganhos
                        sem explodir os desvios bayesianos do Passaporte Biológico.</li>
                    <li><strong>Transfusão Autóloga:</strong> Sangue do próprio atleta é praticamente invisível ao
                        laboratório sem rastreio de polímeros das bolsas.</li>
                    <li><strong>Furo Genético:</strong> Deleção homozigótica do gene <em>UGT2B17</em> esconde usuários
                        graves de testosterona no teste T/E.</li>
                </ol>
            </div>
        </div>`
  },
  {
    id: 22,
    classes: `bg-dark`,
    content: `<!-- Base Scanner Grid Background -->
        <div
            style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(0deg, transparent 24%, rgba(30, 58, 95, 0.05) 25%, rgba(30, 58, 95, 0.05) 26%, transparent 27%, transparent 74%, rgba(30, 58, 95, 0.05) 75%, rgba(30, 58, 95, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(30, 58, 95, 0.05) 25%, rgba(30, 58, 95, 0.05) 26%, transparent 27%, transparent 74%, rgba(30, 58, 95, 0.05) 75%, rgba(30, 58, 95, 0.05) 76%, transparent 77%, transparent); background-size: 50px 50px;">
        </div>

        <!-- Scanner Line Animation -->
        <div
            style="position: absolute; width: 100%; height: 2px; background: rgba(37, 99, 235, 0.5); box-shadow: 0 0 15px 2px rgba(37, 99, 235, 0.2); animation: scan-line 8s linear infinite; z-index: 0;">
        </div>
        <style>
            @keyframes scan-line {
                0% {
                    top: -10%;
                }

                100% {
                    top: 110%;
                }
            }
        </style>

        <div class="slide-header" style="z-index: 10;">
            <span>O Futuro do Antidoping</span>
            <span>BLOCO 4.1</span>
        </div>

        <div class="slide-content flex-center" style="z-index: 10;">
            <p class="subtitle reveal"
                style="margin-bottom: 0px; font-family: var(--font-mono); font-size: 0.9rem; letter-spacing: 0.2rem; color: #60A5FA;">
                ALGORITMO BAYESIANO ADAPTATIVO</p>
            <h2 class="reveal glow-text"
                style="font-size: clamp(2rem, 5vw, 4rem); border-bottom: 1px dashed rgba(255,255,255,0.2); padding-bottom: 0.5rem; margin-bottom: var(--content-gap);">
                Raio-X do Passaporte Biológico</h2>

            <div class="reveal-scale delay-1"
                style="display: flex; gap: var(--content-gap); width: 100%; max-width: 1100px; position: relative;">

                <!-- MÓDULO HEMATOLÓGICO -->
                <div class="card diagram-box"
                    style="flex: 1; border: 1px solid var(--accent-main); background: rgba(153, 27, 27, 0.1); text-align: left; padding: 1.5rem; box-shadow: 0 0 30px rgba(220, 38, 38, 0.15); transform-style: preserve-3d; perspective: 1000px;">
                    <div
                        style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(220, 38, 38, 0.3); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        <h3 class="highlight-red" style="font-size: 1.3rem;">Módulo Hematológico</h3>
                        <span style="font-size: 0.7rem; color: #9CA3AF; font-family: var(--font-mono);">Rastreio: EPO /
                            Transfusão</span>
                    </div>

                    <!-- HUD Data -->
                    <div
                        style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 1rem; border-left: 3px solid var(--accent-main);">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #9CA3AF;">Hemoglobina (Hb):</span>
                            <span style="color: white; font-weight: bold;">17.4 g/dL <span
                                    style="color: var(--accent-main); animation: pulse-glow 2s infinite;">[ERRO_1]</span></span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #9CA3AF;">Reticulócitos (Ret%):</span>
                            <span style="color: white; font-weight: bold;">0.2% <span
                                    style="color: var(--accent-main); animation: pulse-glow 2s infinite;">[ERRO_2]</span></span>
                        </div>
                        <div
                            style="display: flex; justify-content: space-between; padding-top: 5px; border-top: 1px dashed rgba(255,255,255,0.2);">
                            <span style="color: #FBBF24;">OFF-SCORE CALC:</span>
                            <span style="color: #FBBF24; font-weight: bold;">125.4 (Alerta!)</span>
                        </div>
                    </div>

                    <p style="font-size: var(--small-size); color: #D1D5DB; line-height: 1.5;">O OFF-score cruza Hb alta
                        com Retic baixo. É a "imagem fantasma" pós-ciclo de EPO, revelando o "crash" eritropoiético
                        quando o atleta para de usar a droga para tentar limpar o sangue a tempo da prova.</p>

                    <style>
                        .abp-details {
                            margin-top: 0.5rem;
                        }

                        .abp-details summary {
                            font-size: 0.78rem;
                            font-family: var(--font-display);
                            cursor: pointer;
                            color: #FBBF24;
                            padding: 5px 0;
                            list-style: none;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                        }

                        .abp-details summary::before {
                            content: '▶';
                            font-size: 0.6rem;
                            transition: transform 0.2s;
                            display: inline-block;
                        }

                        .abp-details[open] summary::before {
                            transform: rotate(90deg);
                        }

                        .abp-details .detail-content {
                            font-size: 0.72rem;
                            color: #D1D5DB;
                            line-height: 1.5;
                            padding: 8px;
                            margin-top: 4px;
                            background: rgba(0, 0, 0, 0.4);
                            border-radius: 6px;
                            border-left: 2px solid rgba(251, 191, 36, 0.4);
                        }

                        .abp-details .detail-content strong {
                            color: white;
                        }

                        .abp-details .detail-content em {
                            color: #FCA5A5;
                            font-style: normal;
                        }
                    </style>

                    <details class="abp-details">
                        <summary>O que é o OFF-Score?</summary>
                        <div class="detail-content">
                            <strong>OFF-Score = Hb (g/L) − 60 × √Ret%</strong><br>
                            Valores acima de <em>85</em> são suspeitos. Acima de <em>130</em> significam probabilidade
                            >99.9% de manipulação sanguínea. O atleta simulado aqui marca <em>125.4</em> — gatilho de
                            investigação IRMS imediata.
                        </div>
                    </details>
                    <details class="abp-details">
                        <summary>Por que o Reticulócito cai?</summary>
                        <div class="detail-content">
                            Quando o atleta <strong>interrompe</strong> o ciclo de EPO antes da competição para "limpar"
                            o sangue, a medula óssea sofre um <em>crash de feedback negativo</em>. A produção de
                            reticulócitos despenca para ~0.2%, mas a hemoglobina permanece alta por até 120 dias (vida
                            útil da hemácia). Essa <strong>dissociação Hb↑ + Ret%↓</strong> é a assinatura forense
                            clássica.
                        </div>
                    </details>
                    <details class="abp-details">
                        <summary>Outros Marcadores Rastreados</summary>
                        <div class="detail-content">
                            • <strong>Hematócrito (Hct%)</strong> — Limiar UCI: 50% em homens<br>
                            • <strong>Hemoglobina total (tHb-mass)</strong> — Volume absoluto de Hb por
                            CO-rebreathing<br>
                            • <strong>Índice de Estimulação (IRF)</strong> — Fração de reticulócitos imaturos (marca EPO
                            ativa)<br>
                            • <strong>Volume plasmático</strong> — Diferencia hemoconcentração de doping real
                        </div>
                    </details>
                </div>

                <!-- ALGORITMO CORE -->
                <div class="card reveal-scale delay-2"
                    style="flex: 0.8; background: transparent; border: none; box-shadow: none; align-items: center; justify-content: center; transform: translateZ(30px);">
                    <div
                        style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid rgba(255,255,255,0.1); border-top-color: #FBBF24; border-bottom-color: #60A5FA; border-left-color: var(--accent-main); animation: spin 4s linear infinite; display: flex; align-items: center; justify-content: center; position: relative;">
                        <style>
                            @keyframes spin {
                                100% {
                                    transform: rotate(360deg);
                                }
                            }

                            .reverse-spin {
                                animation: spin 4s linear infinite reverse;
                            }
                        </style>
                        <div class="reverse-spin"
                            style="font-family: var(--font-display); font-size: 1.2rem; color: white;">ABP</div>
                    </div>
                    <p style="text-align: center; font-size: 0.8rem; margin-top: 1rem; color: #9CA3AF;">O Atleta é
                        comparado<br><strong style="color: white;">consigo mesmo.</strong></p>
                </div>

                <!-- MÓDULO ESTERÓIDE -->
                <div class="card diagram-box delay-3"
                    style="flex: 1; border: 1px solid var(--accent-info); background: rgba(30, 58, 95, 0.15); text-align: left; padding: 1.5rem; box-shadow: 0 0 30px rgba(30, 58, 95, 0.3); transform-style: preserve-3d; perspective: 1000px;">
                    <div
                        style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(96, 165, 250, 0.3); padding-bottom: 0.5rem; margin-bottom: 1rem;">
                        <h3 style="color: #60A5FA; font-size: 1.3rem;">Módulo Esteroide</h3>
                        <span style="font-size: 0.7rem; color: #9CA3AF; font-family: var(--font-mono);">Rastreio: EAA
                            Sintético</span>
                    </div>

                    <!-- HUD Data -->
                    <div
                        style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.8rem; margin-bottom: 1rem; border-left: 3px solid #60A5FA;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #9CA3AF;">Testo/Epitesto (T/E):</span>
                            <span style="color: white; font-weight: bold;">11.2 <span
                                    style="color: #F87171; animation: pulse-glow 2s infinite;">[ERRO_1]</span></span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span style="color: #9CA3AF;">Androsterona (A):</span>
                            <span style="color: white; font-weight: bold;">Elevação de 314%</span>
                        </div>
                        <div
                            style="display: flex; justify-content: space-between; padding-top: 5px; border-top: 1px dashed rgba(255,255,255,0.2);">
                            <span style="color: #10B981;">LIMIT PREDITIVO:</span>
                            <span style="color: #10B981;">T/E. max 4.0</span>
                        </div>
                    </div>

                    <p style="font-size: var(--small-size); color: #D1D5DB; line-height: 1.5;">O bayesiano cria um
                        "corredor estatístico" preditivo. Não busca a Testosterona em si, mas as distorções brutais na
                        proporção entre os metabólitos de excreção. Pontos fora da reta viram gatilhos de investigação
                        IRMS.</p>

                    <details class="abp-details">
                        <summary>O que significa T/E = 11.2?</summary>
                        <div class="detail-content">
                            A razão <strong>Testosterona/Epitestosterona</strong> natural varia de <em>0.5 a 2.0</em> na
                            maioria dos humanos. O limite da WADA é <em>4.0</em>. Um valor de <em>11.2</em> é ~5x acima
                            do limite, indicando administração exógena. No entanto, ~5% da população asiática tem
                            polimorfismo genético (UGT2B17 del/del) que causa T/E naturalmente <0.1 — por isso o ABP usa
                                o corredor individual, não o fixo. </div>
                    </details>
                    <details class="abp-details">
                        <summary>Como funciona a confirmação IRMS?</summary>
                        <div class="detail-content">
                            O <strong>IRMS (Isotope Ratio Mass Spectrometry)</strong> mede a razão <em>¹³C/¹²C</em> dos
                            esteroides urinários. Testosterona sintética vem de precursores vegetais (soja/inhame), que
                            possuem assinatura isotópica diferente da produção endógena humana. Resultado: <strong>δ¹³C
                                mais negativo = origem exógena confirmada</strong>. É a prova definitiva.
                        </div>
                    </details>
                    <details class="abp-details">
                        <summary>Metabólitos-Alvo Monitorados</summary>
                        <div class="detail-content">
                            • <strong>Androsterona (A)</strong> — Metabólito principal da testosterona<br>
                            • <strong>Etiocolanolona (Etio)</strong> — Marcador de metabolismo 5β<br>
                            • <strong>5α-Androstano-3α,17β-diol (5αAdiol)</strong> — Alta sensibilidade para T
                            exógena<br>
                            • <strong>5β-Androstano-3α,17β-diol (5βAdiol)</strong> — Referência endógena estável<br>
                            • <strong>DHEA</strong> — Precursor adrenal (distingue fonte gonadal vs. adrenal)
                        </div>
                    </details>
                </div>
            </div>
            <p class="reveal-scale delay-4"
                style="text-align: center; font-size: 0.85rem; color: var(--text-secondary); margin-top: 2rem;">A
                Detecção não requer Substância Proibida; requer Modulação Incompatível com o Bio-Marcador Histórico.</p>
        </div>`
  },
  {
    id: 23,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>O Futuro do Antidoping</span>
            <span>BLOCO 4.1b</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">Como Funciona o Algoritmo Bayesiano?</h2>
            <p class="subtitle reveal delay-1" style="margin-bottom: var(--content-gap);">Estatística de Probabilidade
                Adaptativa em Tempo Real</p>

            <div class="reveal-scale delay-2"
                style="width: 100%; max-width: 1000px; display: flex; gap: 2rem; align-items: stretch; background: rgba(31, 41, 55, 0.4); padding: 2rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); transform-style: preserve-3d;">

                <div style="flex: 1; text-align: left;">
                    <h3 style="color: #60A5FA; margin-bottom: 1rem; font-size: 1.5rem;">Cálculo Dinâmico (Teorema de
                        Bayes)</h3>
                    <p style="font-size: 0.95rem; color: #D1D5DB; line-height: 1.6; margin-bottom: 1rem;">
                        O modelo Bayesiano no antidoping não usa um <strong>"limite universal estático"</strong> fixo
                        (como "T/E máximo de 4.0 para humanos"). Em vez disso, ele usa a teoria da probabilidade
                        condicional para atualizar constantemente o perfil do atleta.
                    </p>
                    <ul style="padding-left: 1rem; font-size: 0.9rem; color: #9CA3AF; line-height: 1.6;">
                        <li style="margin-bottom: 0.5rem;"><strong style="color: white;">Priori:</strong> O modelo
                            começa com a média populacional base daquele esporte/raça.</li>
                        <li style="margin-bottom: 0.5rem;"><strong style="color: white;">Atualização:</strong> A cada
                            novo exame de sangue/urina coletado, o algoritmo recalibra o centro genético daquele atleta
                            exato.</li>
                        <li><strong style="color: white;">Corredor Adaptativo:</strong> Após 3 exames, o software
                            desenha um "túnel" de limites mínimo/máximo exclusivos para este indivíduo. Se a Hemoglobina
                            subir fora desse túnel privativo — mesmo sendo um valor normal para outra pessoa — o sistema
                            dispara um alerta de "Evidência Atípica (ATF)".</li>
                    </ul>
                </div>

                <div
                    style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative;">
                    <!-- Grafico Simulando Túnel Bayesiano (INTERATIVO) -->
                    <div class="bayes-interactive"
                        style="width: 100%; height: 280px; background: rgba(0,0,0,0.5); border-radius: 8px; position: relative; overflow: hidden; border-left: 2px solid rgba(255,255,255,0.2); border-bottom: 2px solid rgba(255,255,255,0.2); transition: all 0.3s; cursor: crosshair;">

                        <!-- Eixo Y Label -->
                        <span
                            style="position: absolute; top: 50%; left: -2px; transform: rotate(-90deg) translateX(-50%); transform-origin: left center; font-size: 0.55rem; color: #6B7280; font-family: var(--font-mono); letter-spacing: 0.1em; white-space: nowrap;">CONCENTRAÇÃO</span>

                        <!-- Eixo X Label -->
                        <span
                            style="position: absolute; bottom: 2px; right: 35%; font-size: 0.55rem; color: #6B7280; font-family: var(--font-mono); letter-spacing: 0.1em;">TEMPO
                            (MESES) →</span>

                        <!-- Limite Populacional Fixo (Antigo WADA) -->
                        <div
                            style="position: absolute; top: 12%; left: 0; width: 100%; height: 1px; background: rgba(239, 68, 68, 0.3); border-top: 1px dashed #EF4444;">
                        </div>
                        <span
                            style="position: absolute; top: 5%; left: 10px; font-size: 0.6rem; color: #EF4444; font-family: var(--font-mono);">──
                            Limite Fixo WADA (4.0 T/E)</span>

                        <!-- Tunel Interativo SVG -->
                        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none"
                            style="position: absolute; top:0; left:0; pointer-events: none;">

                            <!-- Area sombreada SEGURA -->
                            <path class="safe-zone" d="M 0,55 Q 25,60 50,42 T 100,22 L 100,52 Q 75,65 50,60 T 0,72 Z"
                                fill="rgba(96, 165, 250, 0.20)" style="pointer-events: auto;"></path>

                            <!-- Limite Superior Individual -->
                            <path d="M 0,55 Q 25,60 50,42 T 100,22" fill="none" stroke="#60A5FA" stroke-width="0.6"
                                stroke-dasharray="2,2"></path>
                            <!-- Limite Inferior Individual -->
                            <path d="M 0,72 Q 25,77 50,60 T 100,52" fill="none" stroke="#60A5FA" stroke-width="0.6"
                                stroke-dasharray="2,2"></path>

                            <!-- Label do Corredor -->
                            <text x="50" y="50" fill="rgba(96, 165, 250, 0.5)" font-size="3.5" text-anchor="middle"
                                font-family="monospace">CORREDOR INDIVIDUAL</text>

                            <!-- Pontos de Exame (Normais) com Labels -->
                            <circle cx="10" cy="63" r="1.8" fill="#10B981"></circle>
                            <text x="10" y="60" fill="#10B981" font-size="2.5" text-anchor="middle"
                                font-family="monospace">Ex.1</text>

                            <circle cx="30" cy="66" r="1.8" fill="#10B981"></circle>
                            <text x="30" y="63" fill="#10B981" font-size="2.5" text-anchor="middle"
                                font-family="monospace">Ex.2</text>

                            <circle cx="55" cy="50" r="1.8" fill="#FBBF24"></circle>
                            <text x="55" y="47" fill="#FBBF24" font-size="2.5" text-anchor="middle"
                                font-family="monospace">Ex.3 ⚠</text>

                            <circle cx="78" cy="35" r="1.8" fill="#F87171"></circle>
                            <text x="78" y="32" fill="#F87171" font-size="2.5" text-anchor="middle"
                                font-family="monospace">Ex.4</text>

                            <!-- Marcadores de Tempo no Eixo X -->
                            <text x="10" y="97" fill="#4B5563" font-size="2.5" text-anchor="middle"
                                font-family="monospace">Jan</text>
                            <text x="30" y="97" fill="#4B5563" font-size="2.5" text-anchor="middle"
                                font-family="monospace">Mar</text>
                            <text x="55" y="97" fill="#4B5563" font-size="2.5" text-anchor="middle"
                                font-family="monospace">Jun</text>
                            <text x="78" y="97" fill="#4B5563" font-size="2.5" text-anchor="middle"
                                font-family="monospace">Set</text>
                        </svg>

                        <!-- Elementos de Aviso Dinâmicos -->
                        <div class="danger-alert"
                            style="position: absolute; top: 40%; left: 50%; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; opacity: 0; transition: opacity 0.2s; pointer-events: none; z-index: 10;">
                            <span
                                style="font-size: 2.5rem; color: #EF4444; animation: pulse-glow 0.5s infinite;">⚠️</span>
                            <strong
                                style="color: #EF4444; font-family: var(--font-display); background: rgba(0,0,0,0.85); padding: 5px 15px; border-radius: 4px; white-space: nowrap; font-size: 0.85rem;">VIOLAÇÃO
                                ABP — FORA DO TÚNEL</strong>
                            <span
                                style="color: #FCA5A5; font-size: 0.65rem; margin-top: 4px; background: rgba(0,0,0,0.7); padding: 3px 8px; border-radius: 3px;">Probabilidade
                                de Doping: >99.9%</span>
                        </div>

                        <!-- Instrução -->
                        <span class="safe-text"
                            style="position: absolute; bottom: 18px; right: 10px; font-size: 0.65rem; color: #9CA3AF; pointer-events: none; opacity: 1; transition: opacity 0.2s; background: rgba(0,0,0,0.4); padding: 3px 8px; border-radius: 4px;">🖱️
                            PASSE O MOUSE FORA DO TÚNEL AZUL</span>
                    </div>

                    <!-- Legenda do Gráfico -->
                    <div
                        style="display: flex; gap: 1.5rem; justify-content: center; margin-top: 0.8rem; flex-wrap: wrap;">
                        <span style="font-size: 0.65rem; color: #9CA3AF; display: flex; align-items: center; gap: 4px;">
                            <span
                                style="width: 8px; height: 8px; border-radius: 50%; background: #10B981; display: inline-block;"></span>
                            Exame Normal
                        </span>
                        <span style="font-size: 0.65rem; color: #9CA3AF; display: flex; align-items: center; gap: 4px;">
                            <span
                                style="width: 8px; height: 8px; border-radius: 50%; background: #FBBF24; display: inline-block;"></span>
                            Limite do Corredor
                        </span>
                        <span style="font-size: 0.65rem; color: #9CA3AF; display: flex; align-items: center; gap: 4px;">
                            <span
                                style="width: 8px; height: 8px; border-radius: 50%; background: #F87171; display: inline-block;"></span>
                            Fora do Túnel (ATF)
                        </span>
                        <span style="font-size: 0.65rem; color: #9CA3AF; display: flex; align-items: center; gap: 4px;">
                            <span
                                style="width: 16px; height: 1px; border-top: 1px dashed #EF4444; display: inline-block;"></span>
                            Limite Fixo Antigo
                        </span>
                        <span style="font-size: 0.65rem; color: #9CA3AF; display: flex; align-items: center; gap: 4px;">
                            <span
                                style="width: 16px; height: 8px; background: rgba(96, 165, 250, 0.3); display: inline-block; border-radius: 2px;"></span>
                            Corredor Individual
                        </span>
                    </div>

                    <style>
                        .bayes-interactive:hover {
                            background: rgba(239, 68, 68, 0.2) !important;
                            box-shadow: inset 0 0 50px rgba(239, 68, 68, 0.3);
                        }

                        .bayes-interactive:hover .danger-alert {
                            opacity: 1;
                        }

                        .bayes-interactive:hover .safe-text {
                            opacity: 0;
                        }

                        .bayes-interactive:has(.safe-zone:hover) {
                            background: rgba(0, 0, 0, 0.5) !important;
                            box-shadow: none;
                        }

                        .bayes-interactive:has(.safe-zone:hover) .danger-alert {
                            opacity: 0 !important;
                        }

                        .bayes-interactive:has(.safe-zone:hover) .safe-text {
                            opacity: 1 !important;
                        }
                    </style>

                </div>
            </div>
        </div>`
  },
  {
    id: 24,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>O Futuro do Antidoping</span>
            <span>BLOCO 4.2</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">O Triângulo das Controvérsias</h2>

            <div
                style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.5rem; width: 100%; max-width: 1200px; margin-top: 3vh;">
                <!-- Card 1 -->
                <div class="card"
                    style="text-align: left; padding: 2rem 1.5rem; border-left: 4px solid #8B5CF6; border-radius: 12px; background: rgba(30, 41, 59, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <h3
                        style="color: white; font-size: 1.3rem; margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 10px; line-height: 1.2;">
                        <span
                            style="color: #8B5CF6; font-size: 1.1em; font-weight: 800; font-family: var(--font-display);">01</span>
                        Atletas Trans &<br>Testosterona
                    </h3>
                    <p style="font-size: 0.9rem; color: #E5E7EB; line-height: 1.7; margin-bottom: 1.5rem;">
                        <strong style="color: #A78BFA; font-family: var(--font-display);">O Paradoxo
                            Mionuclear:</strong> O limite atual da WADA (2.5
                        nmol/L) visa suprimir o fenótipo masculino. Contudo, a fisiologia demonstra que a exposição à
                        testosterona endógena durante a puberdade induz <em>adição permanente de mionúcleos</em> nas
                        fibras musculares estriadas, além de conferir arquitetura pélvica estreita, maior densidade
                        óssea e hipetrofia ventricular esquerda irreversível.
                    </p>
                    <p style="font-size: 0.9rem; color: #E5E7EB; line-height: 1.7;">
                        <span style="color: #A78BFA;">▶ O Embate:</span> Onde a vantagem biológica herdada se sobrepõe à
                        supressão farmacológica atual? A "memória muscular" androgênica anula a justiça da categoria
                        feminina, ou a bioética exige a inclusão independentemente dos resquícios histológicos?
                    </p>
                </div>
                <!-- Card 2 -->
                <div class="card"
                    style="text-align: left; padding: 2rem 1.5rem; border-left: 4px solid #F59E0B; border-radius: 12px; background: rgba(30, 41, 59, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <h3
                        style="color: white; font-size: 1.3rem; margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 10px; line-height: 1.2;">
                        <span
                            style="color: #F59E0B; font-size: 1.1em; font-weight: 800; font-family: var(--font-display);">02</span>
                        Contaminação Cruzada<br>(DILI)
                    </h3>
                    <p style="font-size: 0.9rem; color: #E5E7EB; line-height: 1.7; margin-bottom: 1.5rem;">
                        <strong style="color: #FBBF24; font-family: var(--font-display);">A Falha do Sistema:</strong> O
                        princípio da <em>Strict
                            Liability</em> (Responsabilidade Objetiva) determina que o atleta é 100% culpado pelo que há
                        em seu sangue. Porém, a cromatografia de massa moderna detecta em nível de picogramas (10⁻¹² g).
                        Isso flagra resíduos de SARMs (Ostarina/LGD-4033) e Diuréticos decantados em tanques não-lavados
                        de fábricas de suplementos asiáticas.
                    </p>
                    <p style="font-size: 0.9rem; color: #E5E7EB; line-height: 1.7;">
                        <span style="color: #FBBF24;">▶ O Embate:</span> Com a sensibilidade dos espectrômetros
                        ultrapassando a precisão do controle de qualidade da indústria nutracêutica global, suspensões
                        de 4 anos estão arruinando carreiras por "doping acidental" sem benefício de performance
                        provado.
                    </p>
                </div>
                <!-- Card 3 -->
                <div class="card"
                    style="text-align: left; padding: 2rem 1.5rem; border-left: 4px solid #EF4444; border-radius: 12px; background: rgba(30, 41, 59, 0.4); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <h3
                        style="color: white; font-size: 1.3rem; margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 10px; line-height: 1.2;">
                        <span
                            style="color: #EF4444; font-size: 1.1em; font-weight: 800; font-family: var(--font-display);">03</span>
                        O Teatro da WADA
                    </h3>
                    <p style="font-size: 0.9rem; color: #E5E7EB; line-height: 1.7; margin-bottom: 1.5rem;">
                        <strong style="color: #F87171; font-family: var(--font-display);">A Ilusão do Jogo
                            Limpo:</strong> O sistema gasta milhões em
                        logística, mas sofre de "cegueira seletiva". A insulina ultrarrápida sai do soro em 2 horas;
                        peptídeos secretores (IGF-1 LR3, CJC-1295) atuam sob as enzimas em minutos; e a transfusão
                        autóloga noturna burla o ABP misturando o próprio sangue do atleta.
                    </p>
                    <p style="font-size: 0.9rem; color: #E5E7EB; line-height: 1.7;">
                        <span style="color: #F87171;">▶ O Embate:</span> O teste antidoping na superelite serve
                        primariamente para proteger a saúde real dos atletas ou é um "imposto de relações públicas"
                        mantido pelos Comitês Olímpicos para não afugentar os patrocinadores ("sponsors")
                        bilionários corporativos?
                    </p>
                </div>
            </div>
        </div>`
  },
  {
    id: 25,
    classes: `bg-dark`,
    content: `<div class="geometric-accent circle-accent"
            style="width: 60vw; height: 60vw; background: radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, transparent 70%); top: -10vw; left: -10vw;">
        </div>
        <div class="slide-header">
            <span>Encerramento</span>
            <span>OS 5 ACHADOS</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">Os 5 Achados de Ouro da Imersão</h2>

            <div class="reveal-scale delay-2" style="width: 100%; max-width: 800px; margin-top: 3vh;">
                <ol
                    style="color: white; font-size: clamp(1.1rem, 2vw, 1.4rem); line-height: 1.8; list-style: none; counter-reset: achados;">
                    <li style="margin-bottom: 1rem; position: relative; padding-left: 2rem;">
                        <span
                            style="position: absolute; left: 0; color: var(--accent-main); font-weight: bold; font-family: var(--font-display);">1.</span>
                        <strong style="color: #60A5FA;">A Mágica está no Tempo e Dose:</strong> A testosterona exógena
                        traz ganhos dependentes de dose, atingindo limites notáveis no músculo esquelético entre a 3ª e
                        10ª semana de saturação via receptor AR.
                    </li>
                    <li style="margin-bottom: 1rem; position: relative; padding-left: 2rem;">
                        <span
                            style="position: absolute; left: 0; color: var(--accent-main); font-weight: bold; font-family: var(--font-display);">2.</span>
                        <strong style="color: #60A5FA;">O Sinergismo Supremo:</strong> O "Stack Olímpico" mistura
                        Testosterona (Músculo Bruto) + GH (Agente Abridor de Vias) + Insulina (Condutor e Bloqueador
                        Máximo da Quebra) orquestrando a via mTOR e formando o coquetel indestrutível.
                    </li>
                    <li style="margin-bottom: 1rem; position: relative; padding-left: 2rem;">
                        <span
                            style="position: absolute; left: 0; color: var(--accent-main); font-weight: bold; font-family: var(--font-display);">3.</span>
                        <strong style="color: #60A5FA;">O Reticulócito Mente:</strong> A Transfusão e o Passaporte
                        Biológico correm de braços dados. A injeção de sua própria bolsa de sangue semanas após coletada
                        em treino de altitude engana os sensores indiretos bayesianos na maioria dos casos.
                    </li>
                    <li style="margin-bottom: 1rem; position: relative; padding-left: 2rem;">
                        <span
                            style="position: absolute; left: 0; color: var(--accent-main); font-weight: bold; font-family: var(--font-display);">4.</span>
                        <strong style="color: #60A5FA;">Cuidado na Prateleira:</strong> Moduladores Seletivos de
                        Receptores Androgênicos (SARMs) mascaram-se e contaminam fórmulas proprietárias de vitaminas
                        "naturais", resultando no banimento diário de inocentes.
                    </li>
                    <li style="margin-bottom: 1rem; position: relative; padding-left: 2rem;">
                        <span
                            style="position: absolute; left: 0; color: var(--accent-main); font-weight: bold; font-family: var(--font-display);">5.</span>
                        <strong style="color: #60A5FA;">O Corpo Esconde seus Segredos:</strong> O terrível polimorfismo
                        UGT2B17 na espécie humana cria super-excretores negativos; onde pessoas tomam esteróides
                        sintéticos pesados e simplesmente "não pingam" de volta urina para acusar doping.
                    </li>
                </ol>
            </div>
        </div>`
  },
  {
    id: 26,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>Aplicação Prática</span>
            <span>CASO CLÍNICO 01</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">O Powerlifter com Exames "Alterados"</h2>
            <div class="reveal-scale delay-1"
                style="display: flex; gap: var(--content-gap); width: 100%; max-width: 1000px; margin-top: 2vh;">
                <!-- Perfil -->
                <div class="card" style="flex: 1; border-color: var(--accent-info); background: rgba(30, 58, 95, 0.2);">
                    <h3 style="color: #60A5FA;">Perfil & Relato</h3>
                    <p style="font-size: var(--small-size); color: #D1D5DB; margin-top: 0.5rem;">
                        <strong>Homem, 28 anos, Powerlifter (categoria -93kg)</strong><br><br>
                        Relata uso de "testosterona terapêutica" prescrita há 6 meses por hipogonadismo. Busca
                        otimização para mundial em 10 semanas. Relata energia excelente e progressão de carga.
                    </p>
                </div>
                <!-- Exames -->
                <div class="card" style="flex: 1.5; padding: 1.5rem;">
                    <h3 style="margin-bottom: 0.5rem;">Painel Laboratorial Crítico</h3>
                    <div
                        style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; font-size: 0.85rem; font-family: var(--font-mono);">
                        <div
                            style="background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 4px; border-left: 2px solid var(--accent-main);">
                            <span style="color: var(--text-secondary);">Testosterona Total:</span> <strong
                                style="color: var(--accent-main);">1.850 ng/dL</strong>
                        </div>
                        <div
                            style="background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 4px; border-left: 2px solid var(--accent-main);">
                            <span style="color: var(--text-secondary);">LH / FSH:</span> <strong
                                style="color: var(--accent-main);">
                                < 0.2 mIU/mL</strong>
                        </div>
                        <div
                            style="background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 4px; border-left: 2px solid #F59E0B;">
                            <span style="color: var(--text-secondary);">IGF-1:</span> <strong
                                style="color: #F59E0B;">380 ng/mL</strong> <span
                                style="font-size: 0.7em;">(Elevado)</span>
                        </div>
                        <div
                            style="background: rgba(0,0,0,0.4); padding: 0.5rem; border-radius: 4px; border-left: 2px solid var(--accent-main);">
                            <span style="color: var(--text-secondary);">Hematócrito:</span> <strong
                                style="color: var(--accent-main);">52%</strong>
                        </div>
                    </div>
                    <div class="reveal delay-3"
                        style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.2);">
                        <strong style="color: #10B981;">Diagnóstico Fisiológico Oculto:</strong><br>
                        <span style="font-size: var(--small-size);">Polifarmácia. Supressão HPG prova que o
                            hipogonadismo é induzido (secundário). O IGF-1 elevado sugere uso cruzado de GH/IGF-1
                            exógeno. A justificativa de "reposição" é álibi ("TUE informal").</span>
                    </div>
                </div>
            </div>
        </div>`
  },
  {
    id: 27,
    classes: `bg-secondary`,
    content: `<div class="slide-header">
            <span>Aplicação Prática</span>
            <span>CASO CLÍNICO 02</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">A Ciclista com Anemia "Paradoxal"</h2>
            <div class="reveal-scale delay-1"
                style="display: flex; gap: var(--content-gap); width: 100%; max-width: 1000px; margin-top: 2vh;">
                <!-- Exames -->
                <div class="card" style="flex: 1.5; padding: 1.5rem;">
                    <h3 style="margin-bottom: 0.5rem;">Cenário Sanguíneo</h3>
                    <table
                        style="width: 100%; font-size: 0.85rem; color: var(--text-primary); text-align: left; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);">
                            <th style="padding: 8px;">Parâmetro</th>
                            <th style="padding: 8px;">Valor do Atleta</th>
                            <th style="padding: 8px;">Referência</th>
                        </tr>
                        <tr>
                            <td style="padding: 8px;">Hemoglobina</td>
                            <td style="padding: 8px; color: var(--accent-main); font-weight: bold;">12.1 g/dL (Baixo)
                            </td>
                            <td style="padding: 8px; font-family: var(--font-mono);">12.0–16.0</td>
                        </tr>
                        <tr style="background: rgba(255,255,255,0.02);">
                            <td style="padding: 8px;">Reticulócitos</td>
                            <td style="padding: 8px; color: var(--accent-main); font-weight: bold;">0.2% (Supresso)</td>
                            <td style="padding: 8px; font-family: var(--font-mono);">0.5–1.5%</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px;">EPO Sérica</td>
                            <td style="padding: 8px; color: var(--accent-main); font-weight: bold;">2.1 mIU/mL (Baixa)
                            </td>
                            <td style="padding: 8px; font-family: var(--font-mono);">4.3–29.0</td>
                        </tr>
                        <tr style="background: rgba(255,255,255,0.02);">
                            <td style="padding: 8px;">Ferro S./Ferritina</td>
                            <td style="padding: 8px; color: #10B981; font-weight: bold;">Normais</td>
                            <td style="padding: 8px;">-</td>
                        </tr>
                    </table>
                </div>
                <!-- Perfil -->
                <div class="card"
                    style="flex: 1; border-color: var(--accent-main); background: rgba(153, 27, 27, 0.15);">
                    <h3 class="highlight-red">Interpretação Implacável</h3>
                    <p style="font-size: var(--small-size); color: #D1D5DB; margin-top: 0.5rem; line-height: 1.5;">
                        Esta atleta feminina de elite reclama de "fadiga inexplicável" com queda de VO2máx.<br><br>
                        <strong>Não é anemia ferropriva.</strong> É padrão clássico de supressão eritropoiética pós-uso
                        de rhEPO.<br><br>
                        Ao interromper a EPO para burlar o teste (limpar a janela), o corpo desliga a produção natural
                        devido ao feedback excessivo anterior, causando o "crash" paradoxal com reticulócitos zerados.
                    </p>
                </div>
            </div>
        </div>`
  },
  {
    id: 28,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>Aplicação Prática</span>
            <span>CASO CLÍNICO 03</span>
        </div>
        <div class="slide-content flex-center">
            <h2 class="reveal">O Lutador e o "Suplemento Contaminado"</h2>
            <div class="reveal-scale delay-1"
                style="display: flex; gap: var(--content-gap); width: 100%; max-width: 1000px; margin-top: 2vh;">
                <!-- Perfil -->
                <div class="card" style="flex: 1;">
                    <h3 style="color: white;">O Evento</h3>
                    <p style="font-size: var(--small-size); color: #D1D5DB; margin-top: 0.5rem;">
                        <strong>Homem, 31 anos, MMA Profissional (-77kg).</strong><br><br>
                        Testou positivo para SARM LGD-4033 em controle surpresa. Quantidade detectada (0.8 ng/mL) indica
                        traço baixo.<br>
                        Nega uso intencional. Traz o rótulo de um "Testo Booster Natural" (Fórmula Proprietária +
                        Tribulus).
                    </p>
                </div>
                <!-- Veredito -->
                <div class="card" style="flex: 1.2; border-color: #FBBF24;">
                    <h3 style="color: #FBBF24;">A Defesa e o Nutricionista</h3>
                    <ul
                        style="padding-left: 1.5rem; font-size: var(--small-size); color: var(--text-secondary); line-height: 1.6; margin-top: 0.5rem;">
                        <li><strong>Doping Involuntário é Fato:</strong> 10-25% dos suplementos de nicho no mercado
                            contém SARMs ou Pró-hormonais cruzados mascarados na linha de chão de fábrica.</li>
                        <li><strong>Responsabilidade Técnica:</strong> Só prescrever suplemento com selo (<em>NSF
                                Certified for Sport, Informed Sport</em>).</li>
                        <li><strong>Ação Preventiva:</strong> O prontuário clínico é defesa legal. Se você documentou
                            alerta contra "fórmulas ocultas", protege a si e ajuda a estabelecer "ausência de intenção",
                            reduzindo o ban de 4 para 1 ano.</li>
                    </ul>
                </div>
            </div>
        </div>`
  },
  {
    id: 29,
    classes: `bg-dark`,
    content: `<div class="slide-header">
            <span>Hall da Fama Revertida</span>
            <span>DOSSIÊ DE ATLETAS</span>
        </div>
        <div class="slide-content"
            style="justify-content: flex-start; padding-top: 4vh; max-width: 1100px; margin: 0 auto;">
            <h2 class="reveal" style="text-align: center; margin-bottom: 0.5rem; font-size: clamp(2rem, 4vw, 3rem);">O
                Dossiê Antidoping</h2>
            <p class="subtitle reveal delay-1"
                style="text-align: center; margin-bottom: 2rem; color: var(--text-secondary);">10 Casos Históricos de
                Queda no Esporte de Elite</p>

            <style>
                .dossier-v {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                    padding: 0 1rem;
                }

                .dv-card {
                    display: flex;
                    gap: 1.2rem;
                    align-items: flex-start;
                    background: rgba(31, 41, 55, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 12px;
                    padding: 1rem 1.2rem;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .dv-card:hover {
                    border-color: var(--accent-main);
                    background: rgba(31, 41, 55, 0.8);
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
                }

                .dv-num {
                    position: absolute;
                    top: -8px;
                    left: -8px;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--accent-main);
                    color: white;
                    font-family: var(--font-display);
                    font-size: 0.7rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.4);
                }

                .dv-img {
                    width: 80px;
                    height: 80px;
                    min-width: 80px;
                    border-radius: 50%;
                    object-fit: cover;
                    object-position: top;
                    filter: grayscale(60%) contrast(1.1);
                    border: 2px solid rgba(255, 255, 255, 0.15);
                    transition: filter 0.3s;
                }

                .dv-card:hover .dv-img {
                    filter: grayscale(0%) contrast(1.1);
                }

                .dv-body {
                    flex: 1;
                    min-width: 0;
                }

                .dv-header {
                    display: flex;
                    align-items: baseline;
                    gap: 0.8rem;
                    flex-wrap: wrap;
                    margin-bottom: 0.3rem;
                }

                .dv-name {
                    font-family: var(--font-display);
                    font-size: 1.1rem;
                    color: white;
                }

                .dv-sport {
                    font-size: 0.7rem;
                    color: #9CA3AF;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .dv-substance {
                    display: inline-block;
                    background: rgba(220, 38, 38, 0.15);
                    border-left: 3px solid var(--accent-main);
                    padding: 3px 8px;
                    font-size: 0.72rem;
                    color: #FCA5A5;
                    font-family: var(--font-mono);
                    margin-bottom: 0.4rem;
                }

                .dv-text {
                    font-size: 0.78rem;
                    color: #D1D5DB;
                    line-height: 1.5;
                    margin-bottom: 0.3rem;
                }

                .dv-details summary {
                    font-size: 0.7rem;
                    font-family: var(--font-display);
                    color: #FBBF24;
                    cursor: pointer;
                    padding: 2px 0;
                    list-style: none;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .dv-details summary::before {
                    content: '▶';
                    font-size: 0.45rem;
                    transition: transform 0.25s ease;
                    display: inline-block;
                }

                .dv-details[open] summary::before {
                    transform: rotate(90deg);
                }

                .dv-details .dv-extra {
                    font-size: 0.68rem;
                    line-height: 1.5;
                    padding: 6px 8px;
                    margin-top: 3px;
                    background: rgba(0, 0, 0, 0.35);
                    border-radius: 5px;
                    border-left: 2px solid rgba(251, 191, 36, 0.3);
                    color: #D1D5DB;
                }

                .dv-details .dv-extra strong {
                    color: white;
                }
            </style>

            <div class="dossier-v reveal-scale delay-2">

                <!-- 1. Ben Johnson -->
                <div class="dv-card">
                    <span class="dv-num">1</span>
                    <img class="dv-img" referrerpolicy="no-referrer"
                        src="https://upload.wikimedia.org/wikipedia/commons/3/3e/Ben_Johnson_2017_%28cropped%29.jpg"
                        alt="Ben Johnson">
                    <div class="dv-body">
                        <div class="dv-header"><span class="dv-name">Ben Johnson</span><span class="dv-sport">Atletismo
                                (100m) • 1988</span></div>
                        <div class="dv-substance">Estanozolol (Winstrol)</div>
                        <div class="dv-text">O maior escândalo olímpico da história. Bateu o recorde mundial nos Jogos
                            de Seul, mas falhou no antidoping 3 dias depois. Banido vitaliciamente após segunda infração
                            em 1993.</div>
                        <details class="dv-details">
                            <summary>Contexto farmacológico</summary>
                            <div class="dv-extra"><strong>Estanozolol</strong> é um derivado da DHT com alta afinidade
                                androgênica. Johnson usava 10-20mg/dia via oral. Meia-vida urinária de ~3 semanas.
                                Treinador Charlie Francis revelou doping sistemático desde 1981.</div>
                        </details>
                    </div>
                </div>

                <!-- 2. Lance Armstrong -->
                <div class="dv-card">
                    <span class="dv-num">2</span>
                    <img class="dv-img" referrerpolicy="no-referrer"
                        src="https://upload.wikimedia.org/wikipedia/commons/4/47/Lance_Armstrong_%28Tour_Down_Under_2009%29.jpg"
                        alt="Lance Armstrong">
                    <div class="dv-body">
                        <div class="dv-header"><span class="dv-name">Lance Armstrong</span><span
                                class="dv-sport">Ciclismo • 2012</span></div>
                        <div class="dv-substance">rhEPO, Testosterona, Transfusão Sanguínea, Cortisona</div>
                        <div class="dv-text">"O programa de doping mais sofisticado da história". Pego pela USADA por
                            testemunhos e provas forenses. Perdeu 7 títulos do Tour de France. Banido vitaliciamente.
                        </div>
                        <details class="dv-details">
                            <summary>A operação e a USADA</summary>
                            <div class="dv-extra">O médico <strong>Michele Ferrari</strong> orquestrou microdoses de EPO
                                com transfusões autólogas por GPS cardíaco. Equipe US Postal usava bolsas de sangue
                                congeladas entregues por motociclistas. <strong>11 ex-companheiros</strong>
                                testemunharam contra Armstrong.</div>
                        </details>
                    </div>
                </div>

                <!-- 3. Marion Jones -->
                <div class="dv-card">
                    <span class="dv-num">3</span>
                    <img class="dv-img" referrerpolicy="no-referrer"
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Marion_Jones_in_April_2024.jpg/960px-Marion_Jones_in_April_2024.jpg"
                        alt="Marion Jones">
                    <div class="dv-body">
                        <div class="dv-header"><span class="dv-name">Marion Jones</span><span class="dv-sport">Atletismo
                                • 2007</span></div>
                        <div class="dv-substance">THG ("The Clear" - Designer Steroid), EPO, GH</div>
                        <div class="dv-text">Rainha de Sydney 2000. Desmascarada pelo caso BALCO por esteroide
                            indetectável. Devolveu 5 medalhas olímpicas e ficou 6 meses presa por mentir a
                            investigadores federais.</div>
                        <details class="dv-details">
                            <summary>O que era o THG?</summary>
                            <div class="dv-extra">O <strong>THG (Tetrahidrogestrinona)</strong> foi sintetizado por
                                <strong>Patrick Arnold</strong> da BALCO para ser indetectável. Descoberto quando Trevor
                                Graham enviou anonimamente uma seringa à USADA. <strong>Don Catlin</strong> desenvolveu
                                um teste em semanas.
                            </div>
                        </details>
                    </div>
                </div>

                <!-- 4. Diego Maradona -->
                <div class="dv-card">
                    <span class="dv-num">4</span>
                    <img class="dv-img" referrerpolicy="no-referrer"
                        src="https://upload.wikimedia.org/wikipedia/commons/4/48/Argentina_celebrando_copa_%28cropped%29.jpg"
                        alt="Diego Maradona">
                    <div class="dv-body">
                        <div class="dv-header"><span class="dv-name">Diego Maradona</span><span class="dv-sport">Futebol
                                • 1994</span></div>
                        <div class="dv-substance">Efedrina (5 variações)</div>
                        <div class="dv-text">Expulso da Copa de 1994 nos EUA após coquetel de estimulantes da classe
                            Efedrina. Alegou "suplemento errado" do personal trainer.</div>
                        <details class="dv-details">
                            <summary>As 5 variantes de efedrina</summary>
                            <div class="dv-extra">A amostra revelou <strong>efedrina, pseudoefedrina, norefedrina,
                                    norpseudoefedrina e metilefedrina</strong> — perfil impossível de um único
                                suplemento. FIFA suspendeu por 15 meses. Já havia testado positivo para cocaína em 1991.
                            </div>
                        </details>
                    </div>
                </div>

                <!-- 5. Anderson Silva -->
                <div class="dv-card">
                    <span class="dv-num">5</span>
                    <img class="dv-img" referrerpolicy="no-referrer"
                        src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Anderson_Silva.png"
                        alt="Anderson Silva" style="object-fit: contain; background: #EEE;">
                    <div class="dv-body">
                        <div class="dv-header"><span class="dv-name">Anderson Silva</span><span class="dv-sport">MMA
                                (UFC) • 2015 / 2017</span></div>
                        <div class="dv-substance">Drostanolona, Androsterona (2015) | Trembolona (2017)</div>
                        <div class="dv-text">Lenda do UFC. Testou positivo antes e depois do retorno da fratura na
                            perna. Alegou contaminação via estimulante sexual tailandês e farmácia de manipulação
                            contaminada.</div>
                        <details class="dv-details">
                            <summary>A defesa da contaminação</summary>
                            <div class="dv-extra">A USADA aceitou a tese de <strong>contaminação cruzada</strong> —
                                <strong>Drostanolona</strong> em concentrações sub-terapêuticas. Gerou debate sobre
                                responsabilidade objetiva vs. intencionalidade no Código Antidoping.
                            </div>
                        </details>
                    </div>
                </div>

                <!-- 6. Jon Jones -->
                <div class="dv-card">
                    <span class="dv-num">6</span>
                    <img class="dv-img" referrerpolicy="no-referrer"
                        src="https://upload.wikimedia.org/wikipedia/commons/4/43/Jon_Jones_-_Supporting_Brain_Health_Study.jpg"
                        alt="Jon Jones">
                    <div class="dv-body">
                        <div class="dv-header"><span class="dv-name">Jon Jones</span><span class="dv-sport">MMA (UFC) •
                                2016 / 2017</span></div>
                        <div class="dv-substance">Clomifeno, Letrozol (2016) | Turinabol Oral (2017)</div>
                        <div class="dv-text">Caiu duas vezes no auge (UFC 200 e 214). Inibidores de aromatase para
                            retomar eixo HPG. Em 2017, Turinabol em picogramas pulsatíveis forçou alteração das métricas
                            da USADA.</div>
                        <details class="dv-details">
                            <summary>A teoria dos picogramas</summary>
                            <div class="dv-extra">Jones apresentou <strong>60 picogramas/mL</strong> do metabólito M3 de
                                Turinabol — levando a USADA a criar a política de "<strong>pulsação</strong>": resíduos
                                latentes que reaparecem sem re-administração. Cientistas criticam a base dessa teoria.
                            </div>
                        </details>
                    </div>
                </div>

                <!-- 7. Kamila Valieva -->
                <div class="dv-card">
                    <span class="dv-num">7</span>
                    <img class="dv-img" referrerpolicy="no-referrer"
                        src="https://upload.wikimedia.org/wikipedia/commons/6/62/%D0%9A%D0%B0%D0%BC%D0%B8%D0%BB%D0%B0_%D0%92%D0%B0%D0%BB%D0%B8%D0%B5%D0%B2%D0%B0_%2826-04-2022%29.jpg"
                        alt="Kamila Valieva">
                    <div class="dv-body">
                        <div class="dv-header"><span class="dv-name">Kamila Valieva</span><span
                                class="dv-sport">Patinação Artística • 2022</span></div>
                        <div class="dv-substance">Trimetazidina</div>
                        <div class="dv-text">Prodígio russa de 15 anos em Pequim. Trimetazidina modula metabolismo
                            cardíaco. Rússia alegou "copo contaminado do avô". Medalha de Ouro cassada pelo CAS em 2024,
                            suspensão de 4 anos.</div>
                        <details class="dv-details">
                            <summary>Trimetazidina: a droga cardíaca</summary>
                            <div class="dv-extra">A <strong>TMZ</strong> inibe beta-oxidação de ácidos graxos, forçando
                                miocárdio a usar glicose — mais eficiente em hipoxia. Normalmente prescrita para
                                <strong>angina pectoris</strong> em idosos. Caso expôs doping estatal russo (Operação
                                Icarus/McLaren).
                            </div>
                        </details>
                    </div>
                </div>

                <!-- 8. Maria Sharapova -->
                <div class="dv-card">
                    <span class="dv-num">8</span>
                    <img class="dv-img" referrerpolicy="no-referrer"
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Maria_Sharapova_during_opening_night_of_Web_Summit_2025_at_the_MEO_Arena_in_Lisbon%2C_Portugal.jpg/960px-Maria_Sharapova_during_opening_night_of_Web_Summit_2025_at_the_MEO_Arena_in_Lisbon%2C_Portugal.jpg"
                        alt="Maria Sharapova">
                    <div class="dv-body">
                        <div class="dv-header"><span class="dv-name">Maria Sharapova</span><span class="dv-sport">Tênis
                                • 2016</span></div>
                        <div class="dv-substance">Meldonium (Mildronato)</div>
                        <div class="dv-text">Meldonium entrou na lista WADA em jan/2016. Sharapova assumiu não ter lido
                            o e-mail de atualização, usava há 10 anos "por saúde". Suspensão reduzida de 24 para 15
                            meses.</div>
                        <details class="dv-details">
                            <summary>O efeito Meldonium</summary>
                            <div class="dv-extra">O <strong>Meldonium</strong> inibe carnitina palmitoiltransferase,
                                desviando metabolismo para glicose. Após proibição, <strong>+172 atletas</strong> (Leste
                                Europeu) testaram positivo em 2016 — WADA criou período de tolerância retroativa.</div>
                        </details>
                    </div>
                </div>

                <!-- 9. Paul Pogba -->
                <div class="dv-card">
                    <span class="dv-num">9</span>
                    <img class="dv-img" referrerpolicy="no-referrer"
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Paul_Pogba_at_the_2025_Cannes_Film_Festival_02.jpg/960px-Paul_Pogba_at_the_2025_Cannes_Film_Festival_02.jpg"
                        alt="Paul Pogba">
                    <div class="dv-body">
                        <div class="dv-header"><span class="dv-name">Paul Pogba</span><span class="dv-sport">Futebol •
                                2023</span></div>
                        <div class="dv-substance">Testosterona / DHEA</div>
                        <div class="dv-text">Testou positivo após jogo da Serie A pela Juventus. Banido por 4 anos,
                            conseguiu recurso provando suplemento contaminado da Flórida (DHEA redutor), reduzido para
                            18 meses.</div>
                        <details class="dv-details">
                            <summary>DHEA e suplementos contaminados</summary>
                            <div class="dv-extra">A <strong>DHEA</strong> é precursor adrenal que eleva T e E
                                indiretamente. Pogba demonstrou que o suplemento não listava DHEA no rótulo. Estudos:
                                <strong>~15% dos suplementos nutricionais</strong> contêm substâncias proibidas não
                                declaradas.
                            </div>
                        </details>
                    </div>
                </div>

                <!-- 10. TJ Dillashaw -->
                <div class="dv-card">
                    <span class="dv-num">10</span>
                    <img class="dv-img" referrerpolicy="no-referrer"
                        src="https://upload.wikimedia.org/wikipedia/commons/6/68/TJ_Dillashaw.png" alt="TJ Dillashaw"
                        style="object-fit: contain; background: #AAA;">
                    <div class="dv-body">
                        <div class="dv-header"><span class="dv-name">TJ Dillashaw</span><span class="dv-sport">MMA (UFC)
                                • 2019</span></div>
                        <div class="dv-substance">rhEPO (Eritropoietina Recombinante)</div>
                        <div class="dv-text">Campeão que desceu de categoria com corte de 15kg. Assumiu injetar EPO para
                            sobreviver à anemia severa do corte. Abriu mão do cinturão, banido por 2 anos pela USADA.
                        </div>
                        <details class="dv-details">
                            <summary>EPO no MMA: caso único</summary>
                            <div class="dv-extra">Dillashaw é o <strong>único lutador do UFC pego por EPO</strong>. A
                                substância dá <strong>resistência via transporte de O²</strong>, não força. Compensou
                                corte extremo de 135→125 lbs. Ao retornar em 2021, perdeu para Aljamain Sterling.</div>
                        </details>
                    </div>
                </div>

            </div>
        </div>`
  },
  {
    id: 30,
    classes: `bg-primary`,
    content: `<div class="geometric-accent circle-accent"
            style="left: 50%; top: 50%; transform: translate(-50%, -50%); width: 80vw; height: 80vw; background: radial-gradient(circle, rgba(220,38,38,0.1) 0%, transparent 60%);">
        </div>
        <div class="slide-content flex-center">
            <p class="quote-text reveal"
                style="font-size: clamp(2rem, 5vw, 4rem); font-style: normal; font-family: var(--font-display);">
                Conhecimento não é cumplicidade — <br><span class="highlight-red">é proteção.</span>
            </p>

            <p class="reveal delay-2"
                style="font-size: var(--small-size); margin-top: var(--slide-padding); text-align: center; max-width: 600px; color: var(--text-secondary);">
                Handelsman DJ, et al. (2018). Circulating Testosterone as the Hormonal Basis of Sex Differences in
                Athletic Performance.<br>
                Eichner AK, Tygart T. (2022). Insulin as a PED: What do we know?<br>
                Barker SB, et al. (2023). Autologous Blood Transfusion in Sport: The Detection Problem.
            </p>
        </div>`
  }
];
