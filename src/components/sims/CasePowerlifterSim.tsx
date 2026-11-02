import { CaseFile } from './casefile/CaseFile';
import { POWERLIFTER } from './casefile/data/powerlifter';

/** Caso clínico: O Powerlifter com Exames "Alterados" (slide id 26). Passos: 0 relato · 1 exames · 2 hipótese · 3 lição/conduta. */
const CasePowerlifterSim = () => <CaseFile data={POWERLIFTER} />;

export default CasePowerlifterSim;
