import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CuboidCollider } from '@react-three/rapier';
import { Text, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useProductStore } from '../../store/useProductStore';
import { Sparkles as SparklesIcon, Lock, CheckCircle2 } from 'lucide-react';

export function POIStand({ collection }) {
  const meshRef = useRef();
  const crystalRef = useRef();
  const [isHovered, setIsHovered] = useState(false);
  const [isPlayerNear, setIsPlayerNear] = useState(false);

  const activePOI = useProductStore((s) => s.activePOI);
  const setActivePOI = useProductStore((s) => s.setActivePOI);
  const openCollectionModal = useProductStore((s) => s.openCollectionModal);
  const isCollectionActive = useProductStore((s) => s.isCollectionActive(collection.id));

  const isActiveSeason = isCollectionActive;

  // Proximity check trigger distance
  useFrame((state, delta) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.y += delta * 1.2;
      crystalRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.15 + 2.2;
    }

    // Distance calculation to player in scene
    if (meshRef.current) {
      const standPos = new THREE.Vector3();
      meshRef.current.getWorldPosition(standPos);

      // Search for player in scene or fallback to camera lookAt target
      const playerMesh = state.scene.getObjectByName('player_mesh');
      let targetPos = new THREE.Vector3();
      if (playerMesh) {
        playerMesh.getWorldPosition(targetPos);
      } else {
        // Fallback: character is always at origin offset center relative to camera target
        state.camera.getWorldDirection(targetPos);
        targetPos.multiplyScalar(-10).add(state.camera.position);
      }

      const distance = standPos.distanceTo(targetPos);

      // Trigger radius threshold ~ 8.5 units
      const near = distance < 8.5;
      if (near !== isPlayerNear) {
        setIsPlayerNear(near);
        if (near) {
          setActivePOI(collection);
        } else if (activePOI?.id === collection.id) {
          setActivePOI(null);
        }
      }
    }
  });

  const handleInteract = () => {
    openCollectionModal(collection);
  };

  return (
    <group ref={meshRef} position={collection.poiPosition} rotation={collection.poiRotation}>
      {/* Static Collider for Stand Body */}
      <RigidBody type="fixed" colliders="cuboid">
        {/* Ancient Musical Shrine Base */}
        <mesh castShadow receiveShadow position={[0, 0.6, 0]}>
          <cylinderGeometry args={[1.6, 2.0, 1.2, 12]} />
          <meshToonMaterial color={collection.themeColor} />
        </mesh>

        {/* Floating Magical Crystal Pedestal */}
        <mesh castShadow position={[0, 1.4, 0]}>
          <cylinderGeometry args={[1.1, 1.3, 0.4, 12]} />
          <meshToonMaterial color="#2C3A47" />
        </mesh>
      </RigidBody>

      {/* Floating Animated Collection Rune Crystal */}
      <mesh
        ref={crystalRef}
        castShadow
        onClick={handleInteract}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        scale={isHovered ? 1.2 : 1.0}
      >
        <octahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color={collection.themeColor}
          emissive={collection.accentGlow}
          emissiveIntensity={isActiveSeason ? 1.5 : 0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Dynamic 3D Title Floating Text */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text
          position={[0, 3.4, 0]}
          fontSize={0.45}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#000000"
        >
          {collection.name}
        </Text>
        <Text
          position={[0, 3.0, 0]}
          fontSize={0.22}
          color={isActiveSeason ? '#55E6C1' : '#E74C3C'}
          anchorX="center"
          anchorY="middle"
        >
          {isActiveSeason ? 'ACTIVE COLLECTION' : 'ARCHIVED COLLECTION'}
        </Text>
      </Float>

      {/* 2D HTML Interactive Prompt when Player is Proximity Near */}
      {isPlayerNear && (
        <Html position={[0, 1.8, 0]} center distanceFactor={12}>
          <button
            onClick={handleInteract}
            className="group relative flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900/90 text-white font-bold text-sm shadow-2xl border border-white/30 backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            style={{
              boxShadow: `0 0 25px ${collection.accentGlow}88`,
            }}
          >
            {isActiveSeason ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
            ) : (
              <Lock className="w-4 h-4 text-amber-400" />
            )}
            <span>
              {isActiveSeason ? `Explore ${collection.name}` : `View Archived ${collection.name}`}
            </span>
            <span className="ml-1 px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-md bg-white/20 text-white">
              [E / Tap]
            </span>
          </button>
        </Html>
      )}
    </group>
  );
}
