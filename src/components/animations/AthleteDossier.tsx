import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Athlete {
    id: number;
    name: string;
    sport: string;
    year: string;
    substance: string;
    substanceColor: string;
    image: string;
    headline: string;
    expandedContent: {
        pharmacology: string;
        mechanism: string;
        detection: string;
        outcome: string;
        trivia: string;
    };
}

const ATHLETES: Athlete[] = [
    {
        id: 1,
        name: 'Ben Johnson',
        sport: 'Atletismo (100m)',
        year: '1988',
        substance: 'Estanozolol (Winstrol)',
        substanceColor: '#e11d48',
        image: '/athletes/ben_johnson.jpg',
        headline: 'O maior escândalo olímpico da história. Bateu o recorde mundial nos Jogos de Seul, mas falhou no antidoping 3 dias depois. Banido vitaliciamente após segunda infração em 1993.',
        expandedContent: {
            pharmacology: 'Estanozolol é um derivado sintético da DHT com alta afinidade androgênica. Johnson usava 10–20mg/dia via oral. Meia-vida urinária de ~3 semanas. Excreção detectável pelos metabólitos 3′-OH-stanozolol. Treinador Charlie Francis revelou doping sistemático desde 1981.',
            mechanism: 'Liga-se ao Receptor Androgênico com Ki ~5× superior à testosterona, promovendo síntese proteica acelerada e retenção de nitrogênio em doses supra-fisiológicas. Não converte em estrogênio (ausência de sítio de aromatização no anel A modificado). Produz eritropoiese aumentada via upregulation de EPO.',
            detection: 'A IAAF utilizava cromatografia gasosa acoplada a espectrometria de massas (GC-MS) para identificação dos metabólitos urinários. Em 1988, a janela de detecção era de 3–4 semanas. Johnson teria sido enganado pela equipe sobre o timing da administração pré-prova.',
            outcome: 'Suspensão inicial: 2 anos. 1993: positivo novamente, banimento vitalício. Recorde de 9.79s cassado. O COI retroativamente redisribuiu medalhas, mas 3 dos 8 finalistas da prova também testaram positivo em outros momentos de suas carreiras.',
            trivia: 'O "Caso Johnson" foi o catalisador direto para a criação da WADA em 1999. Estimula-se que 6 dos 8 finalistas dos 100m de Seul usavam substâncias proibidas em algum período de sua carreira.'
        }
    },
    {
        id: 2,
        name: 'Lance Armstrong',
        sport: 'Ciclismo (Tour de France)',
        year: '1999–2005',
        substance: 'EPO, Testosterona, Transfusões, HCG',
        substanceColor: '#f59e0b',
        image: '/athletes/lance_armstrong.jpg',
        headline: 'Sete Tours de France cancelados em 2012 após investigação da USADA. Confirmou uso sistemático de doping em entrevista para Oprah Winfrey em 2013. Considerado o dopador mais sofisticado da história.',
        expandedContent: {
            pharmacology: 'Stack operacional: rhEPO microdosada (uso noturno para evitar controles matinais), testosterona em patch subdérmico, transfusão autóloga (bolsas guardadas em altitude), cortisona (uso terapêutico fraudulento) e HGH. Médico Michele Ferrari é considerado o arquiteto do esquema.',
            mechanism: 'A EPO microdosada (1.000–2.000 UI, 3×/semana) elevava hematócrito para 49–50% sem ultrapassar o limite de 50% da UCI. Transfusões autólogas (recolhidas 8–12 semanas antes) garantiam eritrócitos frescos indetectáveis na véspera de etapas montanhosas. Testosterona em patch: T/E ratio mantido em ~4:1.',
            detection: 'A USADA utilizou amostras B de 1999 retestadas em 2005 com método anticorpo anti-rhEPO (isoeletrofocalização). Em 2012, 26 depoimentos de ex-companheiros e funcionários da US Postal/Discovery consolidaram evidências não-analíticas. A UCI foi acusada de encobrir resultados positivos.',
            outcome: 'Todos os 7 Tours cassados. Banimento vitalício do esporte profissional. Processo civil do DOJ (EUA) de ~$100M encerrado em 2018 com pagamento mínimo. Fundação Livestrong perdeu patrocinadores e apoio massivo. Armstrong processou a USADA alegando procedimentos irregulares.',
            trivia: 'Armstrong sobreviveu a câncer testicular estágio IV com metástases cerebrais e pulmonares em 1996. Seu oncologista Jim Reeves argumenta que o doping pré-câncer provavelmente não contribuiu para o desenvolvimento do tumor. O uso de GH e insulina pós-câncer é considerado o mais grave.'
        }
    },
    {
        id: 3,
        name: 'Marion Jones',
        sport: 'Atletismo (Velocidade)',
        year: '2000',
        substance: 'THG (The Clear) + EPO',
        substanceColor: '#a855f7',
        image: '/athletes/marion_jones.jpg',
        headline: 'Cinco medalhas de Sydney 2000 cassadas. Admitiu uso do THG, a droga designer criada por BALCO. Presa por falsas declarações ao FBI em 2007, cumpriu 6 meses de prisão.',
        expandedContent: {
            pharmacology: 'THG (tetrahidrogestrinona) é um EAA designer sintetizado por Patrick Arnold especificamente para não ser detectado. Estrutura química: 1,2-desidrogestrinona com modificações no anel D. Administração sublingual em gotas (indetectável nos anos 2000). Descoberto apenas via doping de traição ("tip" anônima à USADA em 2003).',
            mechanism: 'THG tem affinity ao AR comparável à testosterona mas com farmacocinética modificada que prolonga a ligação. Também ativa Receptores de Glucocorticoides, com efeitos anti-inflamatórios e preservação muscular. A molécula foi reversa-engenheirada a partir da gestrinona (abortiva).',
            detection: 'A USADA enviou uma seringa usada de THG ao Dr. Don Catlin (UCLA). Em 72 horas, ele desenvolveu o primeiro método de detecção por LC-MS/MS. Retroativamente, centenas de amostras foram retestadas. A BALCO (Bay Area Laboratory Co-Operative) foi o fornecedor central identificado.',
            outcome: 'Jones devolveu 5 medalhas olímpicas. Condenada por perjúrio (2 contagens). 6 meses de prisão federal. Multas de $500k. A investigação BALCO expôs Tim Montgomery, Marion, vários jogadores da MLB e NFL.',
            trivia: 'O escândalo BALCO levou à criação do "WADA Anti-Doping Code" reformado em 2003. Patrick Arnold, o químico que sintetizou o THG, cumpriu pena reduzida (3 meses) por cooperação. O THG ainda não tem uso médico aprovado.'
        }
    },
    {
        id: 4,
        name: 'Jon Jones',
        sport: 'MMA (UFC)',
        year: '2016 / 2017',
        substance: 'Clomifeno, Letrozol (2016) | Turinabol (2017)',
        substanceColor: '#f59e0b',
        image: '/athletes/jon_jones.jpg',
        headline: 'Caiu duas vezes no auge (UFC 200 e 214). Inibidores de aromatase para retomar eixo HPG. Em 2017, Turinabol em picogramas pulsatíveis forçou alteração das métricas da USADA.',
        expandedContent: {
            pharmacology: 'Clomifeno (SERM) e Letrozol (inibidor de aromatase) são usados em PCT (Post-Cycle Therapy) para reiniciar o eixo HPG após ciclo de EAA. Clomifeno bloqueia feedback negativo de estrogênio no hipotálamo → elevando LH/FSH → estimulando produção de testosterona endógena. Letrozol suprime estrógenos sistêmicos.',
            mechanism: '2017: Metabólito M3 do Turinabol oral em picogramas (60 pg/mL). A USADA propôs a teoria de "pulsação pulsátil" — liberação tardia de metabólitos depositados em tecido adiposo sem re-administração. Turinabol (clorodehydromethyltestosterone) foi historicamente o EAA do programa estatal da Alemanha Oriental.',
            detection: 'A USADA testou amostras de urina com método ultra-sensível de cromatografia líquida-espectrometria de massa em tandem (LC-MS/MS) capaz de detectar sub-100 picogramas. A teoria de pulsação foi controversa: alguns cientistas argumentam que doses tão baixas não têm efeito ergogênico relevante.',
            outcome: 'Suspensão de 15 meses após UFC 200 por Clomifeno. Resultado do UFC 214 (vitória sobre Cormier) anulado pelo positivo de Turinabol. NYAC (NY Athletic Commission) reduziu suspensão para retroativamente deixá-lo lutar. Jones mantém cinturão mas com asterisco permanente.',
            trivia: 'O "caso dos picogramas" de Jones mudou o debate sobre limiares de detecção na USADA e WADA. A teoria de pulsação foi inicialmente rejeitada por Travis Tygart (USADA), mas depois aceita como possibilidade científica válida por revisores externos. '
        }
    },
    {
        id: 5,
        name: 'Kamila Valieva',
        sport: 'Patinação Artística',
        year: '2022',
        substance: 'Trimetazidina',
        substanceColor: '#60a5fa',
        image: '/athletes/kamila_valieva.jpg',
        headline: 'Prodígio russa de 15 anos em Pequim. Trimetazidina modula metabolismo cardíaco. Rússia alegou "copo contaminado do avô". Medalha de Ouro cassada pelo CAS em 2024, suspensão de 4 anos.',
        expandedContent: {
            pharmacology: 'Trimetazidina (TMZ) é um agente antiangina: inibe beta-oxidação de ácidos graxos via supressão de 3-ketoacyl CoA thiolase, modulando o metabolismo miocárdico para glicose (mais eficiente em hipoxia/isquemia). Usada normalmente em pacientes com cardiopatia isquêmica. Banida pela WADA em 2014.',
            mechanism: 'Ao forçar uso de glicose como substrato mitocondrial, TMZ aumenta eficiência cardíaca e reduz produção de espécies reativas de oxigênio durante exercício de alta intensidade. Pode melhorar resistência em esforços de 3–4 min (duração do programa artístico). Efeito marginal mas significativo em atletas de elite.',
            detection: 'Valieva testou positivo em amostra coletada em 25/12/2021 (campeonato russo), resultado retornou em 08/02/2022 — durante os Jogos de Pequim. CAS autorizou sua participação temporária durante apelação. Revelação acendeu debate sobre atletas menores e responsabilidade dos adultos ao redor.',
            outcome: 'Medalha de Ouro Olímpica (Individual Feminina) cassada retroativamente pelo CAS. Suspensão de 4 anos (2022–2026, retroativa). Treinadora Eteri Tutberidze notificada para investigação. O caso expôs práticas sistemáticas no patinação artística russa — já envolvida no escândalo de doping estatal de Sochi 2014.',
            trivia: 'Valieva era parte da geração "treinada para o sacrifício" de Tutberidze — atletas estimuladas a competir com lesões, em horários extremos, com pressão psicológica documentada. Várias ex-alunas de Tutberidze se aposentaram antes dos 18 anos por burnout e lesões crônicas.'
        }
    },
    {
        id: 6,
        name: 'Maria Sharapova',
        sport: 'Tênis',
        year: '2016',
        substance: 'Meldonium (Mildronato)',
        substanceColor: '#34d399',
        image: '/athletes/maria_sharapova.jpg',
        headline: 'Meldonium entrou na lista WADA em jan/2016. Sharapova assumiu não ter lido o e-mail de atualização, usava há 10 anos "por saúde". Suspensão reduzida de 24 para 15 meses.',
        expandedContent: {
            pharmacology: 'Meldonium (Mildronate) inibe a carnitina palmitoiltransferase 1 (CPT1), enzima que transporta ácidos graxos de cadeia longa para mitocôndria. Isso desvia o substrato para metabolismo de glicose — mais eficiente em condições de oxigênio limitado. Desenvolvido na Letônia para tratamento de insuficiência cardíaca.',
            mechanism: 'Evidências de eficácia ergogênica: limitadas em atletas saudáveis, porém robustas em contexto de cardiopatia. Estudos russos e bálticos sugerem melhora de VO₂max e tempo de recuperação. Sharapova usava para "prevenir deficiência de magnésio e isquemia" — indicação off-label.',
            detection: 'Após proibição WADA (jan/2016), mais de 172 atletas de esportes individuais (majoritariamente Europa do Leste) testaram positivo no primeiro semestre de 2016. WADA criou política de tolerância retroativa baseando-se na meia-vida longa do composto (excreção pode levar mais de 100 dias).',
            outcome: 'Suspensão inicial: 24 meses. Tribunal de Apelação reduziu para 15 meses por "culpa reduzida" (desconhecimento comprovável). Sharapova perdeu patrocinadores como Nike (temporariamente) e Porsche. Retornou ao circuito em 2017 e se aposentou em 2020 por lesão crônica no ombro.',
            trivia: 'O caso Meldonium foi o maior escândalo farmacológico coletivo da WADA em termos de número de atletas. Especialistas criticaram a proibição: nenhum estudo clínico robusto comprova vantagem de performance significativa em atletas saudáveis. A decisão foi considerada politicamente motivada por alguns pesquisadores.'
        }
    },
    {
        id: 7,
        name: 'Paul Pogba',
        sport: 'Futebol',
        year: '2023',
        substance: 'Testosterona / DHEA',
        substanceColor: '#e11d48',
        image: '/athletes/paul_pogba.jpg',
        headline: 'Testou positivo após jogo da Serie A. Banido por 4 anos, conseguiu recurso comprovando suplemento contaminado da Flórida (DHEA), reduzido para 18 meses.',
        expandedContent: {
            pharmacology: 'DHEA (deidroepiandrosterona) é precursor adrenal de androgênios e estrogênios. Pode elevar T e E endógenas indiretamente via metabolismo periférico (17β-HSD). Banida pela WADA desde 2004. Amplamente disponível como suplemento dietético nos EUA (não regulamentado como medicamento pelo FDA).',
            mechanism: 'A DHEA converte em androstenediona → testosterona e/ou estradiol dependendo do perfil enzimático individual (5α-redutase, 17β-HSD). Em doses suprafisiológicas (100–1.000mg/dia), pode elevar T total em 10–20% em homens adultos. Efeito ergogênico direto sobre massa muscular é controverso em estudos controlados.',
            detection: 'Pogba apresentou extrato de suplemento norte-americano de "força e vitalidade" não listando DHEA no rótulo. Análise laboratorial independente confirmou presença do composto. Estudos do IOC/WADA: ~14–15% dos suplementos nutricionais disponíveis comercialmente contêm substâncias proibidas não declaradas.',
            outcome: 'Suspensão inicial: 4 anos pelo TFA (Tribunale Federale Antidoping italiano). CAS reduziu para 18 meses com base na culpa reduzida (suplemento contaminado). Contrato com Juventus rescindido. Estimativas de perdas: €30M em salários e patrocínios.',
            trivia: 'O mercado de suplementos esportivos movimenta >$50 bilhões anuais. A contaminação cruzada em fábricas é documentada: prohormônios e androgênios são processados na mesma linha de creatina e proteínas. Atletas de elite são aconselhados a usar apenas suplementos certificados (NSF, Informed Sport).'
        }
    },
    {
        id: 8,
        name: 'TJ Dillashaw',
        sport: 'MMA (UFC)',
        year: '2019',
        substance: 'rhEPO (Eritropoietina Recombinante)',
        substanceColor: '#f87171',
        image: '/athletes/tj_dillashaw.png',
        headline: 'Campeão que desceu de categoria com corte de 15kg. Assumiu injetar EPO para sobreviver à anemia severa do corte. Abriu mão do cinturão, banido por 2 anos.',
        expandedContent: {
            pharmacology: 'rhEPO é a versão recombinante da eritropoietina — hormônio renal que estimula eritropoiese na medula óssea. Meia-vida plasmática: ~4–6h (IV) ou ~24h (SC). Meia-vida biológica: 3–4 dias (pelo efeito hematopoiético). Detectável por isoeletrofocalização e Passport SAR. Dose típica no esporte: 50–200 UI/kg 3×/semana.',
            mechanism: 'rhEPO liga-se ao receptor EPOR e ativa via JAK2/STAT5 → transcrição de genes eritropoiéticos. Aumento de eritrócitos → VO₂max aumentado (+3–7% documentado em ciclistas). Para Dillashaw, o corte de 135→125 lbs causava anemia fisiológica aguda — EPO foi usada para compensar a depleção eritrocitária.',
            detection: 'USADA realiza controles fora-de-competição com 24h de aviso. O "Passaporte Biológico" (ABP) detecta manipulações pela variação longitudinal de Hb, Hct, reticulócitos e o modelo ABPS. Em 2019, Dillashaw admitiu uso após confirmação da amostra B, tornando apelação inviável.',
            outcome: 'Suspensão: 2 anos (jan/2019–jan/2021). Cinturão de bantamweight abandonado voluntariamente. Multa de ~$300k. Retornou em 2021 mas perdeu para Aljamain Sterling. Em 2023, venceu Cory Sandhagen para reconquistar posição no ranking.',
            trivia: 'Dillashaw é o ÚNICO lutador de MMA na história suspenso pelo uso de EPO — substância associada ao ciclismo e atletismo. O UFC contrata a USADA para controles fora-de-competição desde 2015, tornando-o o esporte de combate com programa antidoping mais robusto do mundo.'
        }
    }
];

const SECTION_LABELS = {
    pharmacology: '🔬 Farmacologia Detalhada',
    mechanism: '⚙️ Mecanismo Molecular',
    detection: '🧪 Como Foi Detectado',
    outcome: '⚖️ Consequências',
    trivia: '💡 O Que Poucos Sabem',
};

export const AthleteDossier = () => {
    const [expandedAthlete, setExpandedAthlete] = useState<number | null>(null);
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const handleAthleteClick = (id: number) => {
        if (expandedAthlete === id) {
            setExpandedAthlete(null);
            setExpandedSection(null);
        } else {
            setExpandedAthlete(id);
            setExpandedSection(null);
        }
    };

    return (
        <div className="w-full space-y-3 mt-4 font-body">
            {ATHLETES.map((athlete, idx) => {
                const isOpen = expandedAthlete === athlete.id;
                return (
                    <motion.div
                        key={athlete.id}
                        className="rounded-2xl border overflow-hidden"
                        style={{
                            borderColor: isOpen ? `${athlete.substanceColor}55` : 'rgba(255,255,255,0.07)',
                            background: isOpen ? 'rgba(10,10,25,0.95)' : 'rgba(8,8,18,0.7)',
                        }}
                        layout
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Header row — always visible */}
                        <div
                            className="flex items-start gap-4 p-4 cursor-pointer hover:bg-white/3 transition-colors"
                            onClick={() => handleAthleteClick(athlete.id)}
                        >
                            {/* Number */}
                            <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border border-white/10 text-gray-400 mt-1">
                                {idx + 1}
                            </div>

                            {/* Photo */}
                            <motion.div
                                layout
                                className="flex-shrink-0 overflow-hidden border border-white/10 relative"
                                initial={false}
                                animate={{
                                    width: isOpen ? 120 : 56,
                                    height: isOpen ? 120 : 56,
                                    borderRadius: isOpen ? 16 : 12,
                                }}
                                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                            >
                                <img
                                    src={athlete.image}
                                    alt={athlete.name}
                                    className="w-full h-full object-cover object-top absolute inset-0"
                                    referrerPolicy="no-referrer"
                                    onError={e => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(athlete.name.replace(' ', '+'))}&background=111827&color=fff&size=256`;
                                    }}
                                />
                            </motion.div>

                            {/* Info */}
                            <motion.div layout className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <span className="font-display font-bold text-white text-lg leading-tight">{athlete.name}</span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">{athlete.sport} · {athlete.year}</span>
                                </div>
                                <span
                                    className="inline-block text-[10px] px-2 py-0.5 rounded-full border mb-2"
                                    style={{ color: athlete.substanceColor, borderColor: `${athlete.substanceColor}44`, background: `${athlete.substanceColor}11` }}
                                >
                                    {athlete.substance}
                                </span>
                                <motion.p
                                    layout
                                    className={`text-gray-400 text-xs leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}
                                >
                                    {athlete.headline}
                                </motion.p>
                            </motion.div>

                            {/* Chevron */}
                            <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
                                className="flex-shrink-0 text-gray-500 mt-2 text-sm"
                            >
                                ▼
                            </motion.div>
                        </div>

                        {/* Expanded content */}
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                    style={{ overflow: 'hidden' }}
                                >
                                    <div className="px-4 pb-5 pt-2">
                                        {/* Sections accordion */}
                                        <div className="space-y-2">
                                            {(Object.keys(SECTION_LABELS) as Array<keyof typeof SECTION_LABELS>).map(section => {
                                                const secOpen = expandedSection === section;
                                                return (
                                                    <div
                                                        key={section}
                                                        className="rounded-xl border overflow-hidden"
                                                        style={{ borderColor: secOpen ? `${athlete.substanceColor}44` : 'rgba(255,255,255,0.06)' }}
                                                    >
                                                        <button
                                                            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/4 transition-colors cursor-pointer"
                                                            style={{ background: secOpen ? `${athlete.substanceColor}08` : 'transparent' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setExpandedSection(secOpen ? null : section);
                                                            }}
                                                        >
                                                            <span className="text-xs font-medium" style={{ color: secOpen ? athlete.substanceColor : '#9ca3af' }}>
                                                                {SECTION_LABELS[section]}
                                                            </span>
                                                            <motion.span
                                                                animate={{ rotate: secOpen ? 180 : 0 }}
                                                                transition={{ duration: 0.2 }}
                                                                className="text-gray-500 text-xs"
                                                            >▼</motion.span>
                                                        </button>
                                                        <AnimatePresence>
                                                            {secOpen && (
                                                                <motion.div
                                                                    initial={{ height: 0, opacity: 0 }}
                                                                    animate={{ height: 'auto', opacity: 1 }}
                                                                    exit={{ height: 0, opacity: 0 }}
                                                                    transition={{ duration: 0.25 }}
                                                                    style={{ overflow: 'hidden' }}
                                                                >
                                                                    <p className="px-4 pb-4 pt-2 text-xs text-gray-300 leading-relaxed">
                                                                        {athlete.expandedContent[section as keyof typeof athlete.expandedContent]}
                                                                    </p>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
};
