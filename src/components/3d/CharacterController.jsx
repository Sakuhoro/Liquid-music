import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useKeyboardControls } from '@react-three/drei';
import * as THREE from 'three';
import { useProductStore } from '../../store/useProductStore';

const SPEED = 7.5;
const ROTATION_SPEED = 10;

export function CharacterController({ position = [0, 2, 0] }) {
  const rigidBodyRef = useRef();
  const characterGroupRef = useRef();

  const joystickVector = useProductStore((s) => s.joystickVector);
  const activeCollectionModal = useProductStore((s) => s.activeCollectionModal);

  // Keyboard controls from Drei KeyboardControls
  const [, getKeys] = useKeyboardControls();

  // Smooth movement vector interpolation
  const currentVelocity = useRef(new THREE.Vector3());
  const targetRotation = useRef(0);

  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return;

    // Freeze character movement if collection modal overlay is open
    if (activeCollectionModal) {
      rigidBodyRef.current.setLinvel({ x: 0, y: rigidBodyRef.current.linvel().y, z: 0 }, true);
      return;
    }

    const keys = getKeys();

    // 1. Calculate Input Direction (Keyboard W/A/S/D or Mobile Joystick)
    let moveX = 0;
    let moveZ = 0;

    if (keys.forward) moveZ -= 1;
    if (keys.backward) moveZ += 1;
    if (keys.left) moveX -= 1;
    if (keys.right) moveX += 1;

    // Combine with Mobile Joystick input
    if (joystickVector.x !== 0 || joystickVector.y !== 0) {
      moveX = joystickVector.x;
      moveZ = joystickVector.y;
    }

    const inputDir = new THREE.Vector3(moveX, 0, moveZ);
    if (inputDir.length() > 1) inputDir.normalize();

    // 2. Apply Physics Velocity via Rapier
    const targetVelX = inputDir.x * SPEED;
    const targetVelZ = inputDir.z * SPEED;

    const currentLinvel = rigidBodyRef.current.linvel();

    // Smooth velocity interpolation for game-like feel
    currentVelocity.current.x = THREE.MathUtils.lerp(currentVelocity.current.x, targetVelX, delta * 12);
    currentVelocity.current.z = THREE.MathUtils.lerp(currentVelocity.current.z, targetVelZ, delta * 12);

    rigidBodyRef.current.setLinvel(
      {
        x: currentVelocity.current.x,
        y: currentLinvel.y, // preserve gravity
        z: currentVelocity.current.z,
      },
      true
    );

    // 3. Smooth Character Mesh Rotation towards movement direction
    if (inputDir.length() > 0.1) {
      targetRotation.current = Math.atan2(inputDir.x, inputDir.z);
    }

    if (characterGroupRef.current) {
      characterGroupRef.current.rotation.y = THREE.MathUtils.lerpAngle(
        characterGroupRef.current.rotation.y,
        targetRotation.current,
        delta * ROTATION_SPEED
      );
    }

    // 4. Smooth Camera Follow
    const playerPos = rigidBodyRef.current.translation();
    const cameraTargetPos = new THREE.Vector3(
      playerPos.x,
      playerPos.y + 4.5,
      playerPos.z + 10.5
    );

    const lookAtPos = new THREE.Vector3(playerPos.x, playerPos.y + 1.2, playerPos.z);

    state.camera.position.lerp(cameraTargetPos, delta * 4);
    state.camera.lookAt(lookAtPos);
  });

  return (
    <RigidBody
      ref={rigidBodyRef}
      colliders={false}
      mass={1}
      type="dynamic"
      position={position}
      enabledRotations={[false, false, false]} // Lock physics rotation
      friction={0.2}
      restitution={0}
    >
      <CapsuleCollider args={[0.7, 0.4]} />

      {/* Ghibli Style Character Mesh (Anime Traveler / Bard) */}
      <group name="player_mesh" ref={characterGroupRef} position={[0, -1, 0]}>
        {/* Character Torso & Robes */}
        <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.3, 0.45, 0.9, 16]} />
          <meshToonMaterial color="#4A69BD" />
        </mesh>

        {/* Character Head */}
        <mesh castShadow position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.32, 16, 16]} />
          <meshToonMaterial color="#FFEAA7" />
        </mesh>

        {/* Studio Ghibli Straw/Traveler Hat */}
        <mesh castShadow position={[0, 1.82, 0]} rotation={[0.1, 0, 0]}>
          <coneGeometry args={[0.65, 0.25, 24]} />
          <meshToonMaterial color="#ECCC68" />
        </mesh>

        {/* Magical Musical Lute / Vape Device on back */}
        <mesh castShadow position={[0, 0.9, -0.32]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.2, 0.7, 0.15]} />
          <meshToonMaterial color="#E15F41" />
        </mesh>

        {/* Soft Shadow / Glow ring beneath character */}
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.1, 0.55, 32]} />
          <meshBasicMaterial color="#000" transparent opacity={0.3} />
        </mesh>
      </group>
    </RigidBody>
  );
}
