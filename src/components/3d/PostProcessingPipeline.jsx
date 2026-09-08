import React from 'react';
import { EffectComposer, Bloom, Vignette, HueSaturation } from '@react-three/postprocessing';
import { useProductStore } from '../../store/useProductStore';

export function PostProcessingPipeline() {
  const theme = useProductStore((s) => s.theme);
  const isDark = theme === 'dark';

  return (
    <EffectComposer autoClear={false}>
      {/* Soft Ghibli Magical Glow/Bloom */}
      <Bloom
        intensity={isDark ? 0.8 : 0.35}
        luminanceThreshold={0.7}
        luminanceSmoothing={0.9}
        mipmapBlur
      />

      {/* Vibrant Ghibli Color Saturation Boost */}
      <HueSaturation hue={0} saturation={isDark ? 0.2 : 0.35} />

      {/* Subtle Frame Focus Vignette */}
      <Vignette eskil={false} offset={0.15} darkness={isDark ? 0.5 : 0.2} />
    </EffectComposer>
  );
}
