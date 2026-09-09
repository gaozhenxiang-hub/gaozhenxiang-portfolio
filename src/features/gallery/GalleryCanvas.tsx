"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";
import type { Group } from "three";

import { projects } from "@/content/projects";
import type { MotionState, PointerInteractionState } from "./gallery-motion";
import { ProjectPlane } from "./ProjectPlane";

type MotionRef = { current: MotionState };
type PointerRef = { current: PointerInteractionState };

function SoftSculptureMaterial() {
  return (
    <meshPhongMaterial
      color="#d9e3de"
      transparent
      opacity={0.32}
      shininess={108}
      specular="#ffffff"
      depthWrite={false}
    />
  );
}

function BackgroundSculpture({ motionRef }: { motionRef: MotionRef }) {
  const groupRef = useRef<Group>(null);
  const { size } = useThree();

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const velocity = Math.max(-1, Math.min(1, motionRef.current.velocity / 16));
    const time = clock.elapsedTime;
    groupRef.current.rotation.z = 0.006 + Math.sin(time * 0.12) * 0.018 + velocity * 0.006;
    groupRef.current.rotation.x = Math.sin(time * 0.18) * 0.008;
    groupRef.current.position.y = Math.sin(time * 0.25) * 9 + Math.sin(motionRef.current.current * 0.0015) * 12;
  });

  const edgeX = size.width / 2;
  const topY = size.height / 2;
  return (
    <group ref={groupRef} position={[0, 0, -180]}>
      <mesh position={[-edgeX - 560, -20, 0]} rotation={[0.18, 0.06, -0.035]}>
        <torusGeometry args={[585, 50, 36, 128]} />
        <SoftSculptureMaterial />
      </mesh>
      <mesh position={[edgeX + 575, 5, -10]} rotation={[-0.12, 0.04, 0.035]}>
        <torusGeometry args={[600, 52, 36, 128]} />
        <SoftSculptureMaterial />
      </mesh>
      {[
        [-edgeX + 120, topY - 132, -5, 22, 7],
        [edgeX - 380, topY - 108, -12, 17, 6],
        [edgeX - 328, topY - 151, -18, 25, 8],
        [edgeX - 468, topY - 182, -8, 14, 5],
      ].map(([x, y, z, sx, sy], index) => (
        <mesh
          key={`${x}-${y}`}
          position={[x, y, z]}
          rotation={[0.32 + index * 0.23, -0.18 + index * 0.17, 0.46 + index * 0.61]}
          scale={[sx, sy, 8]}
        >
          <icosahedronGeometry args={[1, 0]} />
          <SoftSculptureMaterial />
        </mesh>
      ))}
    </group>
  );
}

function GalleryScene({ motionRef, pointerRef }: { motionRef: MotionRef; pointerRef: PointerRef }) {
  const { size } = useThree();
  const didSignalReady = useRef(false);
  const fov = 35;
  const cameraDistance = size.height / (2 * Math.tan((fov * Math.PI) / 360));
  const gridWidth = Math.min(size.width - 140, 1304);
  const gap = 42;
  const cardWidth = (gridWidth - gap) / 2;
  const cardHeight = cardWidth * (538 / 1024);
  const rowStep = cardHeight + 74;
  const startY = 262;
  const left = -size.width / 2 + (size.width - gridWidth) / 2;

  useFrame(({ gl }) => {
    if (didSignalReady.current) return;
    didSignalReady.current = true;
    gl.domElement.closest(".gallery-stage")?.classList.add("webgl-ready");
  });

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={fov}
        position={[0, 0, cameraDistance]}
        near={0.1}
        far={10000}
      />
      <ambientLight intensity={0.72} />
      <directionalLight color="#ffffff" intensity={2.4} position={[-420, 520, 720]} />
      <directionalLight color="#d8e6e2" intensity={1.1} position={[560, -120, 420]} />
      <BackgroundSculpture motionRef={motionRef} />
      {projects.map((project, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);
        const x = left + cardWidth / 2 + column * (cardWidth + gap);
        const baseY = size.height / 2 - (startY + row * rowStep + cardHeight / 2);

        return (
          <ProjectPlane
            key={project.id}
            project={project}
            x={x}
            baseY={baseY}
            width={cardWidth}
            height={cardHeight}
            viewportHeight={size.height}
            cameraDistance={cameraDistance}
            phase={index * 1.37}
            motionRef={motionRef}
            pointerRef={pointerRef}
          />
        );
      })}
    </>
  );
}

export function GalleryCanvas({ motionRef, pointerRef }: { motionRef: MotionRef; pointerRef: PointerRef }) {
  return (
    <div className="gallery-canvas" aria-hidden="true" data-testid="gallery-canvas">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <GalleryScene motionRef={motionRef} pointerRef={pointerRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
