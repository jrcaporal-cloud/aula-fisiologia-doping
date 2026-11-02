import { CaseFile } from './casefile/CaseFile';
import { FIGHTER } from './casefile/data/fighter';

/** Caso clínico: O Lutador e o "Suplemento Contaminado" (slide id 28). Passos: 0 relato · 1 exames · 2 hipótese · 3 lição/conduta. */
const CaseFighterSim = () => <CaseFile data={FIGHTER} />;

export default CaseFighterSim;
