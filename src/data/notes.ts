/**
 * Notas do apresentador por slide (chave = id do slide no JSON). Aparecem na janela P.
 * `minutos` é o tempo-alvo com discussão; a janela do apresentador soma tudo e mostra o ritmo.
 * `pergunta` é um gancho para a turma; `transicao` é a frase que leva ao próximo slide.
 */
export interface SlideNote {
    minutos: number;
    mensagem: string;
    pergunta?: string;
    transicao?: string;
}

export const NOTES: Record<number, SlideNote> = {
    0: {
        minutos: 2,
        mensagem: 'A fisiologia explica o que o antidoping ainda não consegue provar. A aula mostra o mecanismo para que o médico reconheça o padrão no consultório.',
        pergunta: 'Mão levantada: quem já atendeu alguém que usava esteroides? Quantos souberam porque perguntaram?',
        transicao: 'Antes do mecanismo, um dado que muda o enquadramento.',
    },
    1: {
        minutos: 5,
        mensagem: 'O número oficial de positivos e a prevalência estimada por pesquisa anônima não contam a mesma história. Esse é o abismo.',
        pergunta: 'Peça o palpite da turma antes de revelar: quantos atletas de elite usam substâncias proibidas?',
        transicao: 'Se existe esse abismo, o que o médico tem a ver com isso?',
    },
    100: {
        minutos: 1,
        mensagem: 'Deixe a pergunta na tela e a turma pensando. A resposta volta no último slide.',
        transicao: 'Para responder, primeiro o mapa de onde o doping age.',
    },
    2: {
        minutos: 3,
        mensagem: 'Os três pilares organizam a aula: em que sistema do organismo cada estratégia atua.',
        transicao: 'Agora, o mapa do que o teste enxerga e do que escapa.',
    },
    5: {
        minutos: 3,
        mensagem: 'O mapa ordena as substâncias por detectabilidade: o que o teste pega depende do mecanismo, não só da molécula.',
        pergunta: 'O que faz uma substância ser mais fácil ou mais difícil de detectar?',
        transicao: 'Vamos entender o receptor, porque tudo começa nele.',
    },
    3: {
        minutos: 5,
        mensagem: 'O receptor androgênico age por duas vias: genômica (lenta, muda a expressão gênica) e não genômica (rápida, na membrana).',
        pergunta: 'Por que um mesmo hormônio produz efeitos em minutos e também em semanas?',
        transicao: 'A tecla 3 abre o modelo 3D, se a turma quiser ver o mecanismo em movimento.',
    },
    4: {
        minutos: 1,
        mensagem: 'O receptor não tem ética, apenas afinidade: o organismo responde ao sinal químico, não à origem da molécula.',
        transicao: 'Com essa ideia, a base do doping moderno.',
    },
    6: {
        minutos: 6,
        mensagem: 'Os EAA derivam de uma mesma base química. Pequenas modificações mudam absorção, potência e risco.',
        transicao: 'Dessa base saem as famílias de esteroides.',
    },
    7: {
        minutos: 4,
        mensagem: 'As famílias de esteroides se distinguem por derivações estruturais, que deixam assinaturas bioquímicas diferentes.',
        transicao: 'Cada composto tem um perfil: anabolismo, androgenismo e tempo.',
    },
    75: {
        minutos: 3,
        mensagem: 'Os perfis farmacológicos comparam efeito anabólico, androgênico e tempo de ação.',
        transicao: 'Mais dose rende mais efeito? Nem sempre.',
    },
    8: {
        minutos: 4,
        mensagem: 'A resposta à dose tem retornos decrescentes: acima de certo ponto, cresce o risco mais do que o benefício.',
        pergunta: 'Palpite antes da curva: dobrar a dose dobra o efeito?',
        transicao: 'Depois dos EAA, o outro eixo hormonal: GH e IGF-1.',
    },
    10: {
        minutos: 3,
        mensagem: 'O eixo GH-IGF-1 tem vários pontos de ação fisiológica que o doping pode explorar.',
        transicao: 'Por que o GH é tão difícil de flagrar?',
    },
    35: {
        minutos: 5,
        mensagem: 'A farmacocinética do GH exógeno explica a dificuldade de detecção: meia-vida curta e confusão com o hormônio natural.',
        transicao: 'O GH age em parte por meio do IGF-1.',
    },
    36: {
        minutos: 4,
        mensagem: 'O IGF-1 age de duas formas: local (no tecido) e sistêmica (pelo sangue). A vantagem no esporte vem da combinação.',
        transicao: 'Agora, como essas peças se combinam.',
    },
    11: {
        minutos: 4,
        mensagem: 'Os esquemas combinados visam sinergia. O ponto para o médico é o que a combinação deixa no exame de sangue.',
        transicao: 'Do músculo para o metabolismo: insulina.',
    },
    20: {
        minutos: 4,
        mensagem: 'A recuperação do eixo hormonal depois do uso é um problema clínico real: supressão de LH e FSH.',
        pergunta: 'Que exames ajudam a reconhecer um eixo suprimido num atleta que nega uso?',
        transicao: 'Agora, o metabolismo e a insulina.',
    },
    12: {
        minutos: 4,
        mensagem: 'A insulina tem efeito anabólico e risco de hipoglicemia. A margem entre os dois é estreita.',
        pergunta: 'Qual é o sinal clínico mais importante da hipoglicemia num atleta?',
        transicao: 'A mágica molecular por trás: o transportador GLUT4.',
    },
    13: {
        minutos: 3,
        mensagem: 'O GLUT4 migra massivamente para a membrana da célula muscular, e é isso que explica o efeito anabólico e o perigo.',
        transicao: 'Do metabolismo para o sangue.',
    },
    14: {
        minutos: 3,
        mensagem: 'Aumentar a massa de hemácias melhora o transporte de oxigênio, mas eleva a viscosidade e os riscos vasculares.',
        pergunta: 'Palpite: a partir de que hematócrito você tomaria uma conduta?',
        transicao: 'Entre as fronteiras atuais, comecemos pelos SARMs.',
    },
    18: {
        minutos: 4,
        mensagem: 'Os SARMs ocupam uma zona cinzenta molecular: seletivos no papel, com perfil de segurança pouco conhecido.',
        transicao: 'Outra zona cinzenta: um remédio de asma.',
    },
    19: {
        minutos: 3,
        mensagem: 'Os beta-2 agonistas passam de medicamento de asma a possível ergogênico, e a regra depende da substância e da via.',
        transicao: 'O detalhe de cada agente no próximo slide.',
    },
    191: {
        minutos: 4,
        mensagem: 'A farmacocinética de cada agente define a janela em que ele pode ser encontrado.',
        transicao: 'Falando em janelas: ação versus detecção.',
    },
    15: {
        minutos: 3,
        mensagem: 'O efeito biológico e a janela de detecção não coincidem. É por isso que o teste pontual é limitado.',
        pergunta: 'Se o efeito dura mais do que a detecção, o que o antidoping pode fazer?',
        transicao: 'A resposta foi mudar a pergunta: do teste pontual para o acompanhamento longitudinal.',
    },
    9: {
        minutos: 4,
        mensagem: 'A genética muda o resultado do teste padrão: o polimorfismo UGT2B17 altera a excreção e pode cegar a razão T/E.',
        pergunta: 'Palpite: que fração de uma população tem a deleção do gene?',
        transicao: 'Se o teste pontual falha, o passaporte biológico olha o atleta ao longo do tempo.',
    },
    16: {
        minutos: 4,
        mensagem: 'O Passaporte Biológico compara o atleta com ele mesmo ao longo do tempo, em vez de com um limite populacional.',
        transicao: 'Como o algoritmo decide que um valor é atípico?',
    },
    23: {
        minutos: 4,
        mensagem: 'O algoritmo bayesiano estreita a faixa esperada do atleta a cada exame, e um valor normal para a população pode ser atípico para ele.',
        transicao: 'Raio-X do passaporte: o que aparece num caso real.',
    },
    22: {
        minutos: 4,
        mensagem: 'O raio-x do passaporte mostra, parâmetro a parâmetro, como o padrão aparece no exame seriado.',
        transicao: 'Mesmo o passaporte tem um calcanhar de Aquiles.',
    },
    17: {
        minutos: 4,
        mensagem: 'A transfusão é o ponto fraco do passaporte biológico: o que o sistema enxerga é o efeito sobre os parâmetros do sangue.',
        pergunta: 'Como você reconheceria uma transfusão pelos exames de sangue?',
        transicao: 'Lembram do palpite do início?',
    },
    21: {
        minutos: 1,
        mensagem: 'Volte ao palpite do início: o paradoxo da detecção é que o número oficial é pequeno e a prevalência estimada é muito maior.',
        transicao: 'Hora de aplicar tudo em casos clínicos.',
    },
    26: {
        minutos: 5,
        mensagem: 'Caso 1: exames alterados num atleta de força. Deixe a turma levantar hipóteses antes da resposta.',
        pergunta: 'Qual é a sua hipótese? Que exame você pediria a seguir?',
        transicao: 'Segundo caso: um quadro de sangue que parece paradoxal.',
    },
    27: {
        minutos: 5,
        mensagem: 'Caso 2: anemia aparente numa atleta. Atenção ao que a faixa de referência mostra e ao que o contexto muda.',
        pergunta: 'O exame está realmente alterado? O que mais você investigaria?',
        transicao: 'Terceiro caso: o suplemento contaminado.',
    },
    28: {
        minutos: 5,
        mensagem: 'Caso 3: positivo atribuído a suplemento contaminado. A responsabilidade do atleta e do profissional que o orienta.',
        pergunta: 'O atleta tem culpa? E o profissional que indicou o suplemento?',
        transicao: 'Esse debate tem nome: as controvérsias do antidoping.',
    },
    101: {
        minutos: 5,
        mensagem: 'O médico entra na regra: pessoal de apoio responde pelo Código, a AUT tem critérios e o consultório tem limites éticos.',
        pergunta: 'O que você faria se um paciente competidor pedisse acompanhamento durante o uso?',
        transicao: 'Agora, as controvérsias que o sistema ainda não resolveu.',
    },
    24: {
        minutos: 5,
        mensagem: 'Três controvérsias abertas. O objetivo é discutir, não fechar: cada vértice tem um embate legítimo.',
        pergunta: 'Votação: concordo ou discordo em cada controvérsia, antes de ver o embate.',
        transicao: 'Uma delas merece mais tempo: a elegibilidade e o dimorfismo sexual.',
    },
    32: {
        minutos: 3,
        mensagem: 'A testosterona e a estrutura corporal como variável atlética: o que se sabe e o que ainda é debatido.',
        transicao: 'Os casos que mudaram as regras.',
    },
    33: {
        minutos: 4,
        mensagem: 'Os casos mais citados mostram como cada decisão redefiniu as regras de elegibilidade.',
        pergunta: 'Que regra seria simultaneamente justa e viável?',
        transicao: 'O que a ciência diz, e onde ela termina.',
    },
    34: {
        minutos: 4,
        mensagem: 'Os estudos têm limitações. Separe sempre o que está demonstrado do que é inferência.',
        transicao: 'Voltando ao que a aula deixa de achados.',
    },
    29: {
        minutos: 4,
        mensagem: 'O dossiê reúne casos históricos de atletas de elite sancionados.',
        pergunta: 'Quiz de revisão: mostre o atleta e o ano; a turma diz o que o pegou.',
        transicao: 'O que levar de tudo isso para o consultório?',
    },
    25: {
        minutos: 3,
        mensagem: 'Cinco achados que resumem a imersão: cada um foi visto num simulador ao longo da aula.',
        transicao: 'E na prática, o que muda segunda-feira?',
    },
    102: {
        minutos: 3,
        mensagem: 'Ações clínicas concretas: suspeitar pelo padrão, usar a AUT antes, orientar suplementos certificados, documentar e acompanhar sem prescrever.',
        pergunta: 'O que você muda no consultório na segunda-feira?',
        transicao: 'Agora a resposta à pergunta do início.',
    },
    30: {
        minutos: 2,
        mensagem: 'Conhecimento não é cumplicidade, é proteção. Responda à pergunta do começo: o médico precisa entender como o doping funciona para proteger o paciente e a si mesmo.',
        pergunta: 'Perguntas da turma.',
    },
};
