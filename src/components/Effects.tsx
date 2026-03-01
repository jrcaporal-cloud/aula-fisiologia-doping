
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing';
import { ACESFilmicToneMapping } from 'three';

export const Effects = () => {
    return (
        <EffectComposer enableNormalPass={false} multisampling={0}>
            <Bloom
                luminanceThreshold={0.5}
                luminanceSmoothing={0.9}
                intensity={2.5}
                radius={0.8}
            />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
            <ToneMapping mode={ACESFilmicToneMapping} maxLuminance={1.6} />
        </EffectComposer>
    );
};
