import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { SceneRoot } from './components/SceneRoot';
import { Environment } from '@react-three/drei';
import { PresentationOverlay } from './components/PresentationOverlay';

function App() {
  return (
    <div className="w-screen h-screen relative bg-[#050510] overflow-hidden">
      {/* Base Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 15], fov: 45 }}>
          <color attach="background" args={['#050510']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} />
          <Suspense fallback={null}>
            <Environment preset="night" />
            <SceneRoot />
          </Suspense>
        </Canvas>
      </div>

      {/* HTML Presentation Overlay */}
      <PresentationOverlay />
    </div>
  );
}

export default App;
