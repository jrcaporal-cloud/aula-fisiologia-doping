import { CaseFile } from './casefile/CaseFile';
import { CYCLIST } from './casefile/data/cyclist';

/** Caso clínico: A Ciclista com Anemia "Paradoxal" (slide id 27). Passos: 0 relato · 1 exames · 2 hipótese · 3 lição/conduta. */
const CaseCyclistSim = () => <CaseFile data={CYCLIST} />;

export default CaseCyclistSim;
