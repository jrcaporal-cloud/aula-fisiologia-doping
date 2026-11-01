export interface StepData {
    id: number;
    badge: string;
    title: string;
    /** Rótulo curto para a linha do tempo. */
    short: string;
    description: string;
    cameraPosition: [number, number, number];
    cameraTarget: [number, number, number];
    /** Pose intermediária da câmera no meio da transição que chega a esta etapa (opcional). */
    via?: { position: [number, number, number]; target: [number, number, number] };
}

/*
 * Roteiro do modelo 3D da via genômica (slide 3 "O Receptor Androgênico (AR)" — CellularSignaling —
 * e slide 6 "A Base do Doping Moderno" — EAAInteractive). A transição k-1 → k mostra o processo da etapa k.
 */
export const STEPS: StepData[] = [
    {
        id: 0,
        badge: 'VISÃO GERAL',
        title: 'Via genômica do androgênio',
        short: 'Visão geral',
        description: 'O androgênio, lipofílico, atravessa a membrana, ativa o receptor androgênico (AR) no citosol, o complexo entra no núcleo e liga-se ao DNA. O resultado são proteínas estruturais (actina, miosina pesada): a via genômica, lenta.',
        cameraPosition: [8, 11, 56],
        cameraTarget: [1, -2, 0],
    },
    {
        id: 1,
        badge: 'ETAPA 1 — INFILTRAÇÃO',
        title: 'Difusão pela bicamada lipídica',
        short: 'Difusão',
        description: 'O esteroide é apolar: atravessa a bicamada fosfolipídica passivamente, por lipofilia pura, sem canal nem transportador.',
        cameraPosition: [18.5, 3.5, 15],
        cameraTarget: [13.8, 1.0, 1.5],
    },
    {
        id: 2,
        badge: 'ETAPA 2 — LIGAÇÃO AO AR',
        title: 'Encaixe no domínio de ligação',
        short: 'Ligação',
        description: 'No citosol, o AR está preso a chaperonas inibitórias (HSP90/HSP70). O ligante entra no bolsão do domínio de ligação (LBD), a hélice 12 fecha como uma tampa e as chaperonas se dissociam.',
        cameraPosition: [13.5, 4.4, 13.5],
        cameraTarget: [6.8, 0.2, 0],
    },
    {
        id: 3,
        badge: 'ETAPA 3 — DIMERIZAÇÃO',
        title: 'Dimerização homóloga',
        short: 'Dímero',
        description: 'A mudança de conformação expõe o sinal de localização nuclear (NLS). Dois complexos AR–ligante idênticos se unem em um dímero.',
        cameraPosition: [11, 5, 12.5],
        cameraTarget: [8.2, -0.5, -1],
    },
    {
        id: 4,
        badge: 'ETAPA 4 — TRANSLOCAÇÃO',
        title: 'Entrada ativa no núcleo',
        short: 'Poro nuclear',
        description: 'O dímero é transportado ativamente pelo complexo do poro nuclear (via importina-β) e chega ao nucleoplasma.',
        cameraPosition: [4.5, 7.0, 8.5],
        cameraTarget: [-4.0, 0.8, -4.2],
    },
    {
        id: 5,
        badge: 'ETAPA 5 — ARE',
        title: 'Ligação ao DNA (ARE)',
        short: 'ARE',
        description: 'O dímero reconhece os Elementos de Resposta Androgênica (ARE) no DNA e recruta coativadores (SRC-1), que atraem a RNA polimerase II para o promotor dos genes-alvo.',
        cameraPosition: [-1, 9.5, 6],
        cameraTarget: [-8.8, 0.6, -2.0],
    },
    {
        id: 6,
        badge: 'ETAPA 6 — TRANSCRIÇÃO',
        title: 'Transcrição gênica → mRNA',
        short: 'Transcrição',
        description: 'A dupla-hélice se abre localmente e a RNA polimerase II desliza sobre a fita-molde, sintetizando o mRNA que codifica proteínas estruturais (actina, miosina pesada).',
        cameraPosition: [1.5, 10, 7],
        cameraTarget: [-8.5, 0.3, 1.8],
    },
    {
        id: 7,
        badge: 'ETAPA 7 — TRADUÇÃO',
        title: 'Exportação do mRNA e tradução',
        short: 'Tradução',
        description: 'O mRNA sai pelo poro nuclear. No citoplasma, as subunidades menor e maior do ribossomo se encaixam sobre ele e leem os códons; a cadeia polipeptídica cresce e se dobra.',
        cameraPosition: [7, 2, 21.5],
        cameraTarget: [2.5, -4.5, 4.5],
        via: { position: [4.5, -10.2, 9.6], target: [-3.4, -8.4, 4.5] },
    },
    {
        id: 8,
        badge: 'ETAPA 8 — HIPERTROFIA',
        title: 'Síntese proteica → hipertrofia',
        short: 'Hipertrofia',
        description: 'Actina e miosina recém-sintetizadas são incorporadas à miofibrila: mais filamentos em paralelo, fibra mais espessa. Na via genômica, o resultado estrutural é atestado em 24–72 h.',
        cameraPosition: [3.5, -11, 18.5],
        cameraTarget: [6.4, -10.8, 2],
    },
];
