import { CaseFile } from './casefile/CaseFile';
import { LONGEVITY } from './casefile/data/longevity';

/** Caso de consultório do módulo de peptídeos (slide id 108). Passos: 0 relato · 1 exames · 2 hipótese · 3 conduta. */
const CaseLongevitySim = () => <CaseFile data={LONGEVITY} />;

export default CaseLongevitySim;
