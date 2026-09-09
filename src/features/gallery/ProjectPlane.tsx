"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  LinearFilter,
  Mesh,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
} from "three";

import type { Project } from "@/content/projects";
import type { MotionState } from "./gallery-motion";
import { galleryFragmentShader, galleryVertexShader } from "./gallery-shaders";

type MotionRef = { current: MotionState };

type ProjectPlaneProps = {
  project: Project;
  x: number;
  baseY: number;
  width: number;
  height: number;
  motionRef: MotionRef;
};

export function ProjectPlane({
  project,
  x,
  baseY,
  width,
  height,
  motionRef,
}: ProjectPlaneProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const texture = useLoader(TextureLoader, project.image);
  const displayTexture = useMemo(() => {
    const clonedTexture = texture.clone();
    clonedTexture.colorSpace = SRGBColorSpace;
    clonedTexture.minFilter = LinearFilter;
    clonedTexture.magFilter = LinearFilter;
    clonedTexture.needsUpdate = true;
    return clonedTexture;
  }, [texture]);

  useEffect(() => () => displayTexture.dispose(), [displayTexture]);

  const image = displayTexture.image as { width?: number; height?: number } | undefined;
  const imageAspect = (image?.width ?? 1024) / (image?.height ?? 538);
  const uniforms = useMemo(
    () => ({
      uTexture: { value: displayTexture },
      uVelocity: { value: 0 },
      uImageAspect: { value: imageAspect },
      uPlaneAspect: { value: width / height },
    }),
    [displayTexture, height, imageAspect, width],
  );

  useFrame(() => {
    if (!meshRef.current || !materialRef.current) return;
    const velocity = Math.max(-1, Math.min(1, motionRef.current.velocity / 16));
    meshRef.current.position.y = baseY + motionRef.current.current;
    meshRef.current.rotation.z = velocity * 0.0035;
    materialRef.current.uniforms.uVelocity.value = velocity;
  });

  return (
    <mesh ref={meshRef} position={[x, baseY, 0]} frustumCulled={false}>
      <planeGeometry args={[width, height, 32, 16]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={galleryVertexShader}
        fragmentShader={galleryFragmentShader}
        transparent
      />
    </mesh>
  );
}
