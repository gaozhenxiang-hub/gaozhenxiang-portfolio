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
import {
  calculateDepthTransform,
  calculateDepthVisibility,
  type MotionState,
} from "./gallery-motion";
import { galleryFragmentShader, galleryVertexShader } from "./gallery-shaders";

type MotionRef = { current: MotionState };

type ProjectPlaneProps = {
  project: Project;
  x: number;
  baseY: number;
  width: number;
  height: number;
  viewportHeight: number;
  cameraDistance: number;
  phase: number;
  motionRef: MotionRef;
};

export function ProjectPlane({
  project,
  x,
  baseY,
  width,
  height,
  viewportHeight,
  cameraDistance,
  phase,
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
      uTime: { value: 0 },
      uPhase: { value: phase },
      uRecession: { value: 0 },
      uDistanceAlpha: { value: 1 },
      uImageAspect: { value: imageAspect },
      uPlaneAspect: { value: width / height },
    }),
    [displayTexture, height, imageAspect, phase, width],
  );

  useFrame(({ clock }) => {
    if (!meshRef.current || !materialRef.current) return;
    const velocity = Math.max(-1, Math.min(1, motionRef.current.velocity / 11));
    const rawScreenY = viewportHeight / 2 - (baseY + motionRef.current.current);
    const depthTransform = calculateDepthTransform(rawScreenY, cameraDistance);
    meshRef.current.position.x = x * depthTransform.horizontalCompensation;
    meshRef.current.position.y = (viewportHeight / 2 - depthTransform.screenY) / depthTransform.scale;
    meshRef.current.position.z = -depthTransform.depth;
    meshRef.current.rotation.x = -depthTransform.tilt;
    meshRef.current.rotation.z = velocity * 0.0035;
    meshRef.current.scale.x = depthTransform.horizontalCompensation;
    materialRef.current.uniforms.uVelocity.value = velocity;
    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uRecession.value = depthTransform.recession;
    materialRef.current.uniforms.uDistanceAlpha.value = calculateDepthVisibility(rawScreenY);
  });

  return (
    <mesh ref={meshRef} position={[x, baseY, 0]} frustumCulled={false}>
      <planeGeometry args={[width, height, 48, 24]} />
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
