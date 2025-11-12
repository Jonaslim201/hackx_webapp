// ForenStick3D.tsx
// 'use client'; // uncomment if you're on Next.js App Router

import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center } from '@react-three/drei';
import * as THREE from 'three';

type XY = { x: number; y: number };

function ForenStickModel({ rotation }: { rotation: XY }) {
  // Path is relative to /public (place your file at public/models/foren-stick.glb)
  const { scene } = useGLTF('/models/foren-stick.glb') as any;

  return (
    <primitive
      object={scene}
      rotation={[
        THREE.MathUtils.degToRad(rotation.x),
        THREE.MathUtils.degToRad(rotation.y),
        0,
      ]}
      // No scale here — Center will fit it for us
    />
  );
}

// Preload to reduce pop-in
useGLTF.preload('/models/foren-stick.glb');

export const ForenStick3D: React.FC = () => {
  const [rotation, setRotation] = useState<XY>({ x: -15, y: 25 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHovering) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 20;   // left/right
    const rotateX = -((y - centerY) / centerY) * 20;  // up/down

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: -15, y: 25 });
  };

  return (
    <div
      className="relative w-full h-[500px] flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full h-full max-w-[700px] rounded-2xl border border-white/20 bg-black/40 overflow-hidden">
        <Canvas camera={{ position: [0, 0, 4], fov: 40 }} dpr={[1, 2]}>
          {/* Lights */}
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={1.1} />
          <directionalLight position={[-5, -3, -2]} intensity={0.5} />

          {/* Auto-fit + recenter the model */}
          <Center /* options: disable, top, bottom, etc. */>
            <ForenStickModel rotation={rotation} />
          </Center>

          {/* Drag to inspect (zoom/pan disabled to keep layout tidy) */}
          <OrbitControls enableZoom={false} enablePan={false} />
        </Canvas>
      </div>

      {/* Interaction hint */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
        <p className="text-sm text-gray-400">Hover to tilt • Drag to inspect</p>
      </div>
    </div>
  );
};
