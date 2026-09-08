import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls, Html } from '@react-three/drei';
import { COLLECTIONS } from './data/products';
import { WebGLEnvironment } from './components/3d/WebGLEnvironment';
import { CharacterController } from './components/3d/CharacterController';
import { EnvironmentGround } from './components/3d/EnvironmentGround';
import { POIStand } from './components/3d/POIStand';
import { PostProcessingPipeline } from './components/3d/PostProcessingPipeline';
import { Navigation } from './components/ui/Navigation';
import { VirtualJoystick } from './components/ui/VirtualJoystick';
import { CollectionModal } from './components/ui/CollectionModal';
import { CartDrawer } from './components/ui/CartDrawer';
import { ThreeDErrorBoundary } from './components/3d/3DErrorBoundary';
import './style.css';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
];

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-slate-900/90 text-white border border-white/20 backdrop-blur-xl shadow-2xl whitespace-nowrap">
        <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold tracking-wider uppercase">Loading 3D Sanctuary...</span>
      </div>
    </Html>
  );
}

export default function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
        {/* Top Floating UI Navigation */}
        <Navigation />

        {/* 3D WebGL Canvas Viewport with Strict CSS Layout & ErrorBoundary */}
        <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
          <ThreeDErrorBoundary>
            <Canvas
              shadows
              camera={{ position: [0, 6, 12], fov: 50 }}
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
              style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}
            >
              <Suspense fallback={<LoadingFallback />}>
                <WebGLEnvironment />

                <Physics gravity={[0, -18, 0]}>
                  <CharacterController position={[0, 2, 0]} />
                  <EnvironmentGround />

                  {/* 5 Total Collection Terminals */}
                  {COLLECTIONS.map((col) => (
                    <POIStand key={col.id} collection={col} />
                  ))}
                </Physics>

              </Suspense>
            </Canvas>
          </ThreeDErrorBoundary>
        </div>

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
