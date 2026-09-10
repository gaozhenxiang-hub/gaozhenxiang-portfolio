"use client";

import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  LinearFilter,
  Mesh,
  ShaderMaterial,
  SRGBColorSpace,
  TextureLoader,
  Vector2,
  VideoTexture,
} from "three";

import type { Project } from "@/content/projects";
import {
  calculateDepthTransform,
  calculateDepthVisibility,
  type MotionState,
  type PointerInteractionState,
} from "./gallery-motion";
import { galleryFragmentShader, galleryVertexShader } from "./gallery-shaders";
import { projectVideoElementId, selectProjectTexture } from "./video-preview";

type MotionRef = { current: MotionState };
type PointerRef = { current: PointerInteractionState };

type ProjectPlaneProps = {
  project: Project;
  isActive: boolean;
  x: number;
  baseY: number;
  width: number;
  height: number;
  viewportHeight: number;
  cameraDistance: number;
  phase: number;
  motionRef: MotionRef;
  pointerRef: PointerRef;
};

export function ProjectPlane({
  project,
  isActive,
  x,
  baseY,
  width,
  height,
  viewportHeight,
  cameraDistance,
  phase,
  motionRef,
  pointerRef,
}: ProjectPlaneProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);
  const videoTextureRef = useRef<VideoTexture | null>(null);
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

  useEffect(() => {
    if (!project.video) return;
    const video = document.getElementById(projectVideoElementId(project.id));
    if (!(video instanceof HTMLVideoElement)) return;

    const videoTexture = new VideoTexture(video);
    videoTexture.colorSpace = SRGBColorSpace;
    videoTexture.minFilter = LinearFilter;
    videoTexture.magFilter = LinearFilter;
    videoTextureRef.current = videoTexture;

    return () => {
      videoTextureRef.current = null;
      videoTexture.dispose();
    };
  }, [project.id, project.video]);

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
      uPointerViewport: { value: new Vector2(0.5, 0.5) },
      uPointerVelocity: { value: new Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uViewportAspect: { value: 1 },
    }),
    [displayTexture, height, imageAspect, phase, width],
  );

  useFrame(({ clock, size }) => {
    if (!meshRef.current || !materialRef.current) return;
    const videoTexture = videoTextureRef.current;
    const videoReady = (videoTexture?.image?.readyState ?? 0) >= 2;
    materialRef.current.uniforms.uTexture.value = selectProjectTexture(
      displayTexture,
      videoTexture,
      isActive && videoReady,
    );
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
    materialRef.current.uniforms.uPointerViewport.value.set(pointerRef.current.x, pointerRef.current.y);
    materialRef.current.uniforms.uPointerVelocity.value.set(
      pointerRef.current.velocityX,
      pointerRef.current.velocityY,
    );
    materialRef.current.uniforms.uPointerStrength.value = pointerRef.current.strength;
    materialRef.current.uniforms.uViewportAspect.value = size.width / size.height;
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
