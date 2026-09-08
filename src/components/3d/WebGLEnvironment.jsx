import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { useProductStore } from '../../store/useProductStore';

export function WebGLEnvironment() {
  const theme = useProductStore((s) => s.theme);
  const isDark = theme === 'dark';

  const dirLightRef = useRef();
  const ambientRef = useRef();

  useFrame((state, delta) => {
    // Smooth transition between Light/Dark lighting intensity and positions
    const targetSunPos = isDark ? [0, -10, -20] : [20, 40, 20];
    const targetDirIntensity = isDark ? 0.35 : 1.4;
    const targetAmbientIntensity = isDark ? 0.25 : 0.85;

    if (dirLightRef.current) {
      dirLightRef.current.position.lerp(new THREE.Vector3(...targetSunPos), delta * 3);
      dirLightRef.current.intensity = THREE.MathUtils.lerp(
        dirLightRef.current.intensity,
        targetDirIntensity,
        delta * 3
      );
    }

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        targetAmbientIntensity,
        delta * 3
      );
    }
  });

  return (
    <>
      {/* Background Color & Fog */}
      <color attach="background" args={[isDark ? '#090D16' : '#87CEEB']} />
      <fog attach="fog" args={[isDark ? '#090D16' : '#B0E0E6', 15, 60]} />

      {/* Dynamic Directional Sun/Moon Light */}
      <directionalLight
        ref={dirLightRef}
        position={[20, 40, 20]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-25}
        shadow-camera-right={25}
        shadow-camera-top={25}
        shadow-camera-bottom={-25}
        shadow-camera-near={0.5}
        shadow-camera-far={70}
        shadow-bias={-0.0005}
        color={isDark ? '#8299EC' : '#FFF3D6'}
      />

      {/* Soft Ambient Fill Light */}
      <ambientLight ref={ambientRef} intensity={0.7} color={isDark ? '#2E3856' : '#F1F8FF'} />

      {/* Ghibli Daytime Sky or Magical Nighttime Stars */}
      {!isDark ? (
        <Sky
          distance={450000}
          sunPosition={[20, 40, 20]}
          inclination={0.6}
          azimuth={0.25}
          turbidity={6}
          rayleigh={1.5}
          mieCoefficient={0.005}
          mieDirectionalG={0.8}
        />
      ) : (
        <>
          <Stars radius={100} depth={50} count={3500} factor={4} saturation={0.5} fade speed={1.5} />
          {/* Bioluminescent floating magic dust spores */}
          <Sparkles
            count={80}
            scale={40}
            size={4}
            speed={0.4}
            opacity={0.7}
            color="#A29BFE"
          />
        </>
      )}

      {/* Floating Musical / Spore Sparkles for both themes */}
      <Sparkles
        count={50}
        scale={30}
        size={3}
        speed={0.2}
        opacity={0.5}
        color={isDark ? '#74B9FF' : '#FFEAA7'}
      />
    </>
  );
}
