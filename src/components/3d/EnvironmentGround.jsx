import React from 'react';

export function EnvironmentGround() {
  return (
    <group position={[0, 0, 0]}>
      {/* Studio Ghibli Grass Terrain Plane */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[120, 120, 64, 64]} />
        <meshToonMaterial color="#55E6C1" />
      </mesh>

      {/* Cobblestone / Magical Path to Terminals */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[2, 18, 32]} />
        <meshToonMaterial color="#74B9FF" />
      </mesh>

      {/* Decorative Anime Forest Trees */}
      {[-20, -10, 10, 20].map((x, i) =>
        [-20, -5, 15, 25].map((z, j) => (
          <group key={`tree-${i}-${j}`} position={[x + (j % 2) * 3, 0, z + (i % 2) * 2]}>
            {/* Trunk */}
            <mesh castShadow position={[0, 1.5, 0]}>
              <cylinderGeometry args={[0.3, 0.5, 3, 8]} />
              <meshToonMaterial color="#784E2F" />
            </mesh>
            {/* Foliage */}
            <mesh castShadow position={[0, 3.8, 0]}>
              <dodecahedronGeometry args={[1.8, 1]} />
              <meshToonMaterial color="#00B894" />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}
