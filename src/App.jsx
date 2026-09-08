import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls, Loader } from '@react-three/drei';
import { COLLECTIONS } from './data/products';
import { WebGLEnvironment } from './components/3d/WebGLEnvironment';
import { CharacterController } from './components/3d/CharacterController';
import { EnvironmentGround } from './components/3d/EnvironmentGround';
import { POIStand } from './components/3d/POIStand';
import { Navigation } from './components/ui/Navigation';
import { VirtualJoystick } from './components/ui/VirtualJoystick';
import { CollectionModal } from './components/ui/CollectionModal';
import { CartDrawer } from './components/ui/CartDrawer';
import './style.css';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

export default function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
        {/* Top Floating Navigation */}
        <Navigation />

        {/* 3D WebGL Canvas Viewport */}
        <Canvas
          shadows
          camera={{ position: [0, 6, 12], fov: 50 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <WebGLEnvironment />

            <Physics gravity={[0, -18, 0]}>
              <CharacterController position={[0, 2, 0]} />
              <EnvironmentGround />

              {/* 5 Total Collection Terminals (3 Seasonal + 2 Permanent) */}
              {COLLECTIONS.map((col) => (
                <POIStand key={col.id} collection={col} />
              ))}
            </Physics>
          </Suspense>
        </Canvas>

        {/* Loading Overlay */}
        <Loader
          dataInterpolation={(p) => `Entering Liquid Music Sanctuary... ${p.toFixed(0)}%`}
          containerStyles={{ background: '#090D16' }}
          innerStyles={{ width: '250px', backgroundColor: 'rgba(255,255,255,0.1)' }}
          barStyles={{ backgroundColor: '#FFD700' }}
          dataStyles={{ color: '#E2E8F0', fontSize: '13px', fontWeight: 'bold' }}
        />

        {/* Mobile On-Screen Virtual Joystick */}
        <VirtualJoystick />

        {/* Collection Flavor Browser Modal Window */}
        <CollectionModal />

        {/* Shopping Cart Drawer */}
        <CartDrawer />
      </div>
    </KeyboardControls>
  );
}
