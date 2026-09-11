"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useRef } from "react";
import {
  DoubleSide,
  MathUtils,
  type BufferAttribute,
  type Group,
  type Mesh,
  type MeshPhysicalMaterial,
  type PlaneGeometry,
} from "three";

import type { PointerInteractionState } from "@/features/gallery/gallery-motion";
import { mapHeroProgressToVisuals } from "./portfolio-motion";

type NumberRef = { current: number };
type PointerRef = { current: PointerInteractionState };

function PortalScene({
  heroProgressRef,
  pointerRef,
}: {
  heroProgressRef: NumberRef;
  pointerRef: PointerRef;
}) {
  const portalRef = useRef<Group>(null);
  const filmRef = useRef<Mesh<PlaneGeometry, MeshPhysicalMaterial>>(null);
  const { viewport, gl } = useThree();
  const basePositions = useRef<Float32Array | null>(null);

  useEffect(() => {
    gl.domElement.closest(".portfolio-experience")?.classList.add("hero-webgl-ready");
  }, [gl]);

  const portalX = Math.min(viewport.width * 0.18, 2.45);
  const portalHeight = Math.min(viewport.height * 0.82, 5.8);
  const portalWidth = portalHeight * 0.58;

  useFrame(({ clock }) => {
    const progress = heroProgressRef.current;
    const visuals = mapHeroProgressToVisuals(progress);
    const pointer = pointerRef.current;
    const time = clock.elapsedTime;

    if (portalRef.current) {
      const idleYaw = Math.sin(time * 0.52) * MathUtils.degToRad(1.5);
      portalRef.current.rotation.y =
        -0.12 +
        visuals.portalOpen * 0.49 +
        idleYaw +
        pointer.velocityX * pointer.strength * 0.028;
      portalRef.current.rotation.x = pointer.velocityY * pointer.strength * 0.018;
      portalRef.current.position.x =
        portalX + (pointer.x - 0.5) * pointer.strength * 0.16;
      portalRef.current.position.y =
        Math.sin(time * 0.44) * 0.025 + (pointer.y - 0.5) * pointer.strength * 0.09;
      portalRef.current.position.z = visuals.cameraAdvance * 2.4;
    }

    const film = filmRef.current;
    if (!film) return;
    const positions = film.geometry.attributes.position as BufferAttribute;
    if (!basePositions.current) {
      basePositions.current = Float32Array.from(positions.array as Float32Array);
    }
    const base = basePositions.current;
    const pointerX = (pointer.x - 0.5) * portalWidth;
    const pointerY = (pointer.y - 0.5) * portalHeight;
    for (let index = 0; index < positions.count; index += 1) {
      const offset = index * 3;
      const x = base[offset];
      const y = base[offset + 1];
      const distance = Math.hypot(x - pointerX, y - pointerY);
      const influence = Math.exp(-distance * distance * 1.75) * pointer.strength;
      const idle =
        Math.sin(y * 2.15 + time * 0.62) * 0.035 +
        Math.cos(x * 2.8 - time * 0.48) * 0.018;
      positions.setZ(
        index,
        idle + influence * 0.22 - visuals.filmRetreat * (0.12 + Math.abs(x) * 0.045),
      );
    }
    positions.needsUpdate = true;
    film.rotation.y = pointer.velocityX * pointer.strength * 0.045;
    film.position.x = visuals.filmRetreat * 0.72;
    film.scale.x = 1 - visuals.filmRetreat * 0.24;
    film.material.opacity = 0.08 * (1 - visuals.cameraAdvance);
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={38} position={[0, 0, 8]} near={0.1} far={100} />
      <ambientLight intensity={1.1} />
      <directionalLight color="#ffffff" intensity={2.2} position={[-4, 5, 7]} />
      <directionalLight color="#f2eee7" intensity={1.1} position={[5, -2, 4]} />

      <group ref={portalRef} position={[portalX, 0, 0]}>
        <mesh ref={filmRef} position={[0, 0, 0.1]}>
          <planeGeometry args={[portalWidth * 0.92, portalHeight * 0.92, 40, 56]} />
          <meshPhysicalMaterial
            color="#fffdf8"
            roughness={0.07}
            transmission={0.92}
            thickness={0.08}
            ior={1.22}
            transparent
            opacity={0.08}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
      </group>
    </>
  );
}

export function HeroCanvas({
  heroProgressRef,
  pointerRef,
}: {
  heroProgressRef: NumberRef;
  pointerRef: PointerRef;
}) {
  return (
    <div className="hero-canvas" data-testid="hero-canvas" aria-hidden="true">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      >
        <Suspense fallback={null}>
          <PortalScene heroProgressRef={heroProgressRef} pointerRef={pointerRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
