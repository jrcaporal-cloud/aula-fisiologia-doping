import { MotionConfig } from 'framer-motion';
import { AmbientBackground } from './components/three/AmbientBackground';
import { Deck } from './components/deck/Deck';
import { SimHarness } from './components/deck/SimHarness';
import { Presenter } from './components/deck/Presenter';

const params = new URLSearchParams(window.location.search);
const simName = params.get('sim');
const isPresenter = params.has('apresentador');

function App() {
  // Movimento reduzido do sistema vale para toda animação do framer-motion (transform some, opacidade fica).
  return (
    <MotionConfig reducedMotion="user">
      <main className="w-screen h-[100dvh] relative bg-[#050510] overflow-hidden">
        {isPresenter ? <Presenter /> : (
          <>
            <AmbientBackground />
            {simName ? <SimHarness name={simName} /> : <Deck />}
          </>
        )}
      </main>
    </MotionConfig>
  );
}

export default App;
