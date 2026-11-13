# Referência: CardioHydraulics (modelo do professor no AI Studio) — o que copiar e o que NÃO copiar

Pedido do professor (13/11/2026): o 3D "O circuito sob esteroides" (modal da tecla 3 no slide "O Coração sob Esteroides", id 109)
"ficou ruim, precisa de melhoras urgente". Ele quer que eu me inspire na **mecânica e nas interações** de um app que ele fez no
AI Studio (CardioHydraulics). Palavras dele: "a parte gráfica dele eu achei horrível, mas eu gostei muito da mecânica e interação".
=> COPIAR a mecânica/interação. NÃO copiar o visual (esferas brilhantes, tanque genérico, grid, tubos com bolinhas).

## Mecânica do CardioHydraulics (observada no app rodando + histórico de mudanças)
- **Analogia hidráulica de circuito fechado**: Bomba = coração, Tanque = volemia (pré-carga), Grampo/válvula = RVS (pós-carga),
  tubo fechado com o sangue circulando. Legenda fixa no topo dizendo o que é cada peça.
- **Controles contínuos (sliders) ao vivo**, cada um com valor e unidade: força da bomba (contratilidade, %), volume de ejeção
  (mL/batimento), volume do fluido (pré-carga, %), resistência (RVS), frequência, **viscosidade (hematócrito, %)**.
  Pausar / resetar a simulação.
- **Motor físico simples e explícito**: débito = f(contratilidade, VE, pré-carga, FC); resistência efetiva ∝ RVS × viscosidade
  (Poiseuille); pressão média = débito × resistência. Tudo recalculado a cada mudança, com transição suave.
- **O 3D responde a CADA variável, continuamente**: a bomba bate na FC e muda de tamanho/cor com a contratilidade; o grampo aperta
  com a RVS; o nível do tanque segue o volume; a densidade de hemácias no tubo segue a viscosidade; a velocidade do fluxo segue o
  débito; a luz/pulso sincroniza com o batimento; a cor ambiente acusa pressão alta/baixa.
- **Cenários clínicos (presets)**: um clique leva os sliders animados até o cenário (insuficiência cardíaca, desidratação grave,
  choque cardiogênico, crise hipertensiva). O aluno vê o estado mudar e depois pode mexer a partir dali.
- **Monitor hemodinâmico ao vivo**: cartões com débito (L/min), PAM (mmHg), volume (%) + **gráficos rolando no tempo**
  (fluxo, pressão, volume), para ver o efeito de cada mexida como série temporal.
- Câmera livre (girar, mover, zoom). (Tutor de IA: NÃO trazer — a aula é offline.)
- Fraquezas da física dele (não copiar): valores absurdos (ex.: PAM 17 mmHg no choque), escalas sem fonte.

## Como traduzir para a aula de doping (sugestão; decida com critério)
- Um modo **"Laboratório"** no modal 3D (ao lado do roteiro de 7 etapas atual, ou substituindo o que não funciona): o aluno liga e
  dosa os colaterais dos esteroides — hipertrofia da parede, relaxamento (E′), pressão/rigidez arterial, hematócrito/viscosidade,
  placa — e o coração/circuito responde ao vivo, com o monitor (PA, FEVE, E′, hematócrito, viscosidade, débito) e as séries no tempo.
- **Presets = os estados da aula**: coração treinado, em uso de EAA, depois de parar (e talvez "uso + hematócrito 54%").
  Números SÓ de `src/data/cardioSteps.ts` (fonte única, conferida — ver memória: FEVE 52×63%, E′ 9,3×11,1 cm/s, Ht 54%, PA 142/82 etc.).
  O que for modelo didático (a física entre os pontos medidos) leva selo "modelo didático" e nunca contradiz os números medidos.
- Gráfico: manter/elevar a linguagem visual da própria aula de doping (cores e tipografia da aula, sem brilho exagerado), com
  anatomia de coração crível — o professor achou o visual atual "ruim" e o do AI Studio "horrível".
