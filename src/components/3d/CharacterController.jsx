import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, CapsuleCollider } from '@react-three/rapier';
import { useKeyboardControls, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import { useProductStore } from '../../store/useProductStore';

const SPEED = 7.5;
const ROTATION_SPEED = 10;

// Helper function for smooth angle interpolation
function lerpAngle(start, end, amount) {
  let shortest = ((end - start + Math.PI) % (Math.PI * 2)) - Math.PI;
  if (shortest < -Math.PI) shortest += Math.PI * 2;
  return start + shortest * amount;
}

// Inner component for loading user-provided GLB character
function GLBCharacterModel({ animationName = 'Idle', modelPath = '/models/character.glb' }) {
  const group = useRef();
  const { scene, animations } = useGLTF(modelPath);
  const { actions } = useAnimations(animations, group);

  useEffect(() => {
    if (actions && actions[animationName]) {
      actions[animationName].reset().fadeIn(0.2).play();
      return () => {
        if (actions[animationName]) actions[animationName].fadeOut(0.2);
      };
    }
  }, [actions, animationName]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={0.8} position={[0, -0.9, 0]} />
    </group>
  );
}

// Procedural Ghibli Traveler Bard fallback mesh
function ProceduralCharacter() {
  return (
    <group position={[0, -1, 0]}>
      {/* Torso */}
      <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.3, 0.45, 0.9, 16]} />
        <meshToonMaterial color="#4A69BD" />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshToonMaterial color="#FFEAA7" />
      </mesh>
      {/* Straw Hat */}
      <mesh castShadow position={[0, 1.82, 0]} rotation={[0.1, 0, 0]}>
        <coneGeometry args={[0.65, 0.25, 24]} />
        <meshToonMaterial color="#ECCC68" />
      </mesh>
      {/* Lute / Instrument */}
      <mesh castShadow position={[0, 0.9, -0.32]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.2, 0.7, 0.15]} />
        <meshToonMaterial color="#E15F41" />
      </mesh>
      {/* Shadow disc */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.1, 0.55, 32]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

class GLBErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // Suppress asset error logs for missing character GLB
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function CustomGLBCharacter({ animationName = 'Idle' }) {
  return (
    <GLBErrorBoundary fallback={<ProceduralCharacter />}>
      <React.Suspense fallback={<ProceduralCharacter />}>
        <GLBCharacterModel animationName={animationName} />
      </React.Suspense>
    </GLBErrorBoundary>
  );
}

export function CharacterController({ position = [0, 2, 0] }) {
  const rigidBodyRef = useRef();
  const characterGroupRef = useRef();

  const joystickVector = useProductStore((s) => s.joystickVector);
  const activeCollectionModal = useProductStore((s) => s.activeCollectionModal);

  const [, getKeys] = useKeyboardControls();
  const currentVelocity = useRef(new THREE.Vector3());
  const targetRotation = useRef(0);
  const [currentAnim, setCurrentAnim] = useState('Idle');

  useFrame((state, delta) => {
    if (!rigidBodyRef.current) return;

    if (activeCollectionModal) {
      rigidBodyRef.current.setLinvel({ x: 0, y: rigidBodyRef.current.linvel().y, z: 0 }, true);
      setCurrentAnim('Idle');
      return;
    }

    const keys = getKeys();
    let moveX = 0;
    let moveZ = 0;

    if (keys.forward) moveZ -= 1;
    if (keys.backward) moveZ += 1;
    if (keys.left) moveX -= 1;
    if (keys.right) moveX += 1;

    if (joystickVector.x !== 0 || joystickVector.y !== 0) {
      moveX = joystickVector.x;
      moveZ = joystickVector.y;
    }

    const inputDir = new THREE.Vector3(moveX, 0, moveZ);
    if (inputDir.length() > 1) inputDir.normalize();

    if (inputDir.length() > 0.1) {
      setCurrentAnim('Run');
    } else {
      setCurrentAnim('Idle');
    }

    const targetVelX = inputDir.x * SPEED;
    const targetVelZ = inputDir.z * SPEED;

    const currentLinvel = rigidBodyRef.current.linvel();

    currentVelocity.current.x = THREE.MathUtils.lerp(currentVelocity.current.x, targetVelX, delta * 12);
    currentVelocity.current.z = THREE.MathUtils.lerp(currentVelocity.current.z, targetVelZ, delta * 12);

    rigidBodyRef.current.setLinvel(
      {
        x: currentVelocity.current.x,
        y: currentLinvel.y,
        z: currentVelocity.current.z,
      },
      true
    );

    if (inputDir.length() > 0.1) {
      targetRotation.current = Math.atan2(inputDir.x, inputDir.z);
    }

    if (characterGroupRef.current) {
      characterGroupRef.current.rotation.y = lerpAngle(
        characterGroupRef.current.rotation.y,
        targetRotation.current,
        delta * ROTATION_SPEED
      );
    }

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
      enabledRotations={[false, false, false]}
      friction={0.2}
      restitution={0}
    >
      <CapsuleCollider args={[0.7, 0.4]} />

      <group name="player_mesh" ref={characterGroupRef}>
        <CustomGLBCharacter animationName={currentAnim} />
      </group>
    </RigidBody>
  );
}
