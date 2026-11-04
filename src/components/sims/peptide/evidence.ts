import { Activity, Archive, Biohazard, FlaskConical, Gavel, Microscope, Scale, ShieldAlert, Sprout, Syringe, type LucideIcon } from 'lucide-react';

/**
 * Slide "Promessa × evidência × risco". Fontes: Liu et al., Ann Intern Med 2008 (GH em jovens saudáveis);
 * Meinhardt et al., Ann Intern Med 2010 (GH em atletas recreativos); Nass et al., Ann Intern Med 2008 e
 * Adunsky et al. 2011 (ibutamoren); revisão de BPC-157, Pharmaceutics 2026; FDA (página de substâncias de risco
 * para manipulação, atualizada em 04/2026); Anvisa, alerta de 07/2026; Lista Proibida WADA 2026 (S0 e cláusula de
 * estrutura ou efeito semelhante); Código Mundial Antidopagem (reanálise de amostras em até 10 anos); teste de biomarcadores do GH.
 */

export const LEVELS = ['Célula', 'Animal', 'Humanos sem controle', 'Ensaio clínico', 'Em atletas'] as const;

export interface EvidenceRow {
    name: string;
    promise: string;
    /** Índice em LEVELS: o degrau mais alto em que a promessa foi testada. */
    level: number;
    finding: string;
}

export const EVIDENCE_ROWS: readonly EvidenceRow[] = [
    { name: 'TB-500', promise: '"acelera a recuperação"', level: 1, finding: 'Só modelos animais; a FDA não achou dados de exposição em humanos.' },
    { name: 'BPC-157', promise: '"cura tendão e músculo"', level: 2, finding: 'Menos de 30 pessoas em 3 estudos-piloto, todos sem grupo controle.' },
    { name: 'Secretagogos de GH', promise: '"mais músculo"', level: 3, finding: 'Idosos saudáveis: massa magra subiu, força e função não mudaram.' },
    { name: 'GH', promise: '"mais força"', level: 4, finding: 'Jovens saudáveis: massa magra subiu, força não. Atletas recreativos: pequena melhora só no sprint.' },
];

export interface RiskCard {
    icon: LucideIcon;
    title: string;
    text: string;
}

export const VIAL_RISKS: readonly RiskCard[] = [
    { icon: FlaskConical, title: 'Composição', text: 'Sem registro, ninguém garante a molécula, a quantidade nem as impurezas. A Anvisa diz que não há garantia de qualidade, composição ou origem.' },
    { icon: Syringe, title: 'Esterilidade', text: 'Pó reconstituído e injetado em casa: risco de infecção no local e de contaminação por endotoxina.' },
    { icon: Biohazard, title: 'Imunogenicidade', text: 'Peptídeo estranho ao corpo pode gerar anticorpos e reação. É um dos riscos que a FDA cita para essas substâncias.' },
    { icon: Gavel, title: 'Regulação', text: 'A FDA mantém GHRP-2, GHRP-6 e ipamorelina na lista de risco para manipulação desde 2023. BPC-157 e TB-500 saíram da lista porque as indicações foram retiradas, não porque se provou segurança.' },
];

export const MOLECULE_RISKS: readonly RiskCard[] = [
    { icon: Activity, title: 'Secretagogos de GH', text: 'Em 2 anos de ibutamoren em idosos: fome, edema leve, glicemia de jejum e cortisol mais altos, sensibilidade à insulina menor. Em pacientes com fratura de quadril, um ensaio foi interrompido por sinal de insuficiência cardíaca.' },
    { icon: ShieldAlert, title: 'GH', text: 'Edema e fadiga mais frequentes nos ensaios em jovens saudáveis, e o efeito diabetogênico que vimos no eixo GH-IGF-1.' },
    { icon: Sprout, title: 'Fatores de crescimento', text: 'Estimulam proliferação celular e formação de vasos. O risco de favorecer tumores é teórico, porque não há dados de longo prazo em humanos, e esse é justamente o problema.' },
];

export const DETECTION_FACTS: readonly RiskCard[] = [
    { icon: Microscope, title: 'Meia-vida curta não é invisibilidade', text: 'Os laboratórios credenciados pela WADA procuram o peptídeo e os fragmentos que ele deixa na urina e no sangue, por espectrometria de massa.' },
    { icon: Scale, title: 'Análogo novo não escapa da regra', text: 'A S0 e a cláusula "estrutura química ou efeito biológico semelhante" cobrem moléculas que nem têm nome na lista.' },
    { icon: Archive, title: 'A amostra espera', text: 'Pode ser guardada e reanalisada por até 10 anos, quando surge um método novo.' },
    { icon: Activity, title: 'O efeito também denuncia', text: 'O teste de biomarcadores do GH (IGF-1 e P-III-NP) olha a resposta do corpo, não a molécula, como o passaporte faz com o sangue.' },
];

export const EVIDENCE_STEPS = [
    { tab: 'Promessa × evidência', foot: 'Quanto mais alto o degrau, menor a promessa: onde houve ensaio clínico, a massa magra subiu e a força não acompanhou.' },
    { tab: 'O frasco', foot: 'Antes da molécula, o risco é o produto: o que está no frasco e como ele foi parar na seringa.' },
    { tab: 'A molécula', foot: 'No consultório: pergunte pelo nome, peça para ver o frasco e registre. Sem isso, nem o paciente sabe o que usou.' },
    { tab: 'A detecção', foot: 'O que o paciente não lê no rótulo, o laboratório pode ler anos depois.' },
] as const;
