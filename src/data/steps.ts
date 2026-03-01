export interface StepData {
    id: number;
    badge: string;
    title: string;
    description: string;
    cameraPosition: [number, number, number];
    cameraTarget: [number, number, number];
}

export const STEPS: StepData[] = [
    {
        id: 0,
        badge: 'OVERVIEW',
        title: 'Genomic Mechanism of Action',
        description: 'Testosterone is a lipophilic steroid that crosses the cell membrane, binds to intracellular androgen receptors, and activates gene transcription for muscle protein synthesis.',
        cameraPosition: [0, 8, 35],
        cameraTarget: [0, 0, 0]
    },
    {
        id: 1,
        badge: 'STEP 1 — DIFFUSION',
        title: 'Membrane Diffusion',
        description: 'Testosterone (C19H28O2) is a non-polar steroid hormone. Its lipophilic nature allows it to freely cross the phospholipid bilayer of the cell membrane via simple diffusion.',
        cameraPosition: [16, 5, 22],
        cameraTarget: [12, 0, 0]
    },
    {
        id: 2,
        badge: 'STEP 2 — BINDING',
        title: 'Androgen Receptor Binding',
        description: 'Inside the cytoplasm, testosterone binds to the Androgen Receptor (AR), displacing Heat Shock Proteins (HSP90). This causes conformational change, exposing the nuclear localization signal (NLS).',
        cameraPosition: [6, 2, 12],
        cameraTarget: [6, 0, 0]
    },
    {
        id: 3,
        badge: 'STEP 3 — TRANSLOCATION',
        title: 'Nuclear Translocation',
        description: 'The T-AR dimer translocates through Nuclear Pore Complexes (NPCs) via importin-β. Inside the nucleus, it binds to Androgen Response Elements (AREs) on target gene promoters.',
        cameraPosition: [1.5, 2.5, 8],
        cameraTarget: [0, 0, 0]
    },
    {
        id: 4,
        badge: 'STEP 4 — TRANSCRIPTION',
        title: 'Gene Transcription → mRNA',
        description: 'AR binding recruits coactivators and RNA Polymerase II, activating transcription of MYH (myosin) and ACTA (actin) genes. The resulting mRNA is processed and exported.',
        cameraPosition: [-4, 2, 8],
        cameraTarget: [-2, 0, 0]
    },
    {
        id: 5,
        badge: 'STEP 5 — SYNTHESIS',
        title: 'Protein Synthesis & Hypertrophy',
        description: 'Ribosomes translate mRNA into contractile proteins (actin, myosin). Testosterone increases muscle protein synthesis rate, leading to myofibrillar hypertrophy over time.',
        cameraPosition: [-8, -2, 14],
        cameraTarget: [-6, -2, 4]
    }
];
