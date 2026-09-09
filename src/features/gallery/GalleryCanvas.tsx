"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef } from "react";

import { projects } from "@/content/projects";
import type { MotionState } from "./gallery-motion";
import { ProjectPlane } from "./ProjectPlane";

type MotionRef = { current: MotionState };

function GalleryScene({ motionRef }: { motionRef: MotionRef }) {
  const { size } = useThree();
  const didSignalReady = useRef(false);
  const gridWidth = Math.min(size.width * 0.765, 1480);
  const gap = Math.max(30, size.width * 0.0246);
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

  return projects.map((project, index) => {
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
        motionRef={motionRef}
      />
    );
  });
}

export function GalleryCanvas({ motionRef }: { motionRef: MotionRef }) {
  return (
    <div className="gallery-canvas" aria-hidden="true" data-testid="gallery-canvas">
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1000], zoom: 1, near: 0.1, far: 2000 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <GalleryScene motionRef={motionRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
