import { AmbientBackground } from './components/three/AmbientBackground';
import { Deck } from './components/deck/Deck';

function App() {
  return (
    <main className="w-screen h-[100dvh] relative bg-[#050510] overflow-hidden">
      <AmbientBackground />
      <Deck />
    </main>
  );
}

export default App;
