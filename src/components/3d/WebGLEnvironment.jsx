import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sky, Stars, Sparkles, Cloud } from '@react-three/drei';
import * as THREE from 'three';
import { useProductStore } from '../../store/useProductStore';

export function WebGLEnvironment() {
  const theme = useProductStore((s) => s.theme);
  const isDark = theme === 'dark';

  const dirLightRef = useRef();
  const ambientRef = useRef();

  useFrame((state, delta) => {
    const targetSunPos = isDark ? [0, -10, -20] : [20, 40, 20];
    const targetDirIntensity = isDark ? 0.35 : 1.4;
    const targetAmbientIntensity = isDark ? 0.3 : 0.85;

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
      <fog attach="fog" args={[isDark ? '#090D16' : '#C7ECEE', 20, 70]} />

      {/* Dynamic Sun/Moon Warm Ghibli Lighting */}
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

      <ambientLight ref={ambientRef} intensity={0.8} color={isDark ? '#2E3856' : '#FD2E22'} />

      {/* Painted Anime Cumulus Clouds & Skybox */}
      {!isDark ? (
        <>
          <Sky
            distance={450000}
            sunPosition={[20, 40, 20]}
            inclination={0.6}
            azimuth={0.25}
            turbidity={4}
            rayleigh={2}
            mieCoefficient={0.005}
            mieDirectionalG={0.8}
          />
          {/* Painted Fluffy Clouds */}
          <group position={[0, 15, -20]}>
            <Cloud segments={12} bounds={[10, 2, 10]} volume={6} color="#FFF5E1" opacity={0.85} speed={0.2} />
          </group>
          <group position={[-25, 20, -10]}>
            <Cloud segments={10} bounds={[8, 2, 8]} volume={5} color="#FFEAA7" opacity={0.75} speed={0.15} />
          </group>
        </>
      ) : (
        <>
          <Stars radius={100} depth={50} count={3500} factor={4} saturation={0.5} fade speed={1.5} />
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

      {/* Floating Musical Spore Sparkles */}
      <Sparkles
        count={60}
        scale={35}
        size={3}
        speed={0.2}
        opacity={0.6}
        color={isDark ? '#74B9FF' : '#FFEAA7'}
      />
    </>
  );
}
