"use client";

import { useEffect, useRef } from "react";

import {
  calculateMetadataDepthLayout,
  clampPosition,
  createMotionFrame,
  createPointerInteractionFrame,
  mapVelocityToVisuals,
  mapPointerDeltaToGallery,
  normalizePointerVelocity,
  projectReleaseTarget,
  type MotionState,
  type PointerInteractionState,
} from "./gallery-motion";

export function useDragGallery() {
  const stageRef = useRef<HTMLElement>(null);
  const motionRef = useRef<MotionState>({ current: 0, target: 0, velocity: 0 });
  const pointerRef = useRef<PointerInteractionState>({
    x: 0.5,
    y: 0.5,
    targetX: 0.5,
    targetY: 0.5,
    strength: 0,
    targetStrength: 0,
    velocityX: 0,
    velocityY: 0,
  });

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let animationFrame = 0;
    let lastFrame = performance.now();
    let dragging = false;
    let activePointer: number | null = null;
    let previousPointerY = 0;
    let previousPointerTime = 0;
    let pointerVelocity = 0;
    let pointerInside = false;
    let previousPointerX = 0;
    let previousInteractionY = 0;
    let previousInteractionTime = 0;
    let hasPreviousInteraction = false;
    const cards = Array.from(stage.querySelectorAll<HTMLElement>(".project-card"));

    const getMaximum = () => {
      const grid = stage.querySelector<HTMLElement>(".gallery-grid--metadata");
      if (!grid) return 0;
      return Math.max(0, grid.offsetTop + grid.scrollHeight - window.innerHeight + 48);
    };

    const setTarget = (next: number) => {
      motionRef.current.target = clampPosition(next, getMaximum());
    };

    const updatePointerTarget = (event: PointerEvent) => {
      const bounds = stage.getBoundingClientRect();
      pointerRef.current.targetX = Math.min(
        1,
        Math.max(0, (event.clientX - bounds.left) / bounds.width),
      );
      pointerRef.current.targetY = 1 - Math.min(
        1,
        Math.max(0, (event.clientY - bounds.top) / bounds.height),
      );
    };

    const rememberPointer = (event: PointerEvent) => {
      previousPointerX = event.clientX;
      previousInteractionY = event.clientY;
      previousInteractionTime = event.timeStamp;
      hasPreviousInteraction = true;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setTarget(motionRef.current.target + event.deltaY * 0.92);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      updatePointerTarget(event);
      rememberPointer(event);
      dragging = true;
      activePointer = event.pointerId;
      previousPointerY = event.clientY;
      previousPointerTime = event.timeStamp;
      pointerVelocity = 0;
      pointerRef.current.targetStrength = Math.max(pointerRef.current.targetStrength, 0.82);
      stage.dataset.dragging = "true";
      stage.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      updatePointerTarget(event);
      if (!hasPreviousInteraction) {
        rememberPointer(event);
        pointerInside = true;
        pointerRef.current.targetStrength = Math.max(pointerRef.current.targetStrength, 0.16);
        return;
      }
      const elapsedInteraction = Math.max(event.timeStamp - previousInteractionTime, 8);
      const deltaX = event.clientX - previousPointerX;
      const deltaY = event.clientY - previousInteractionY;
      const speed = Math.hypot(deltaX, deltaY) / elapsedInteraction;
      pointerInside = true;
      pointerRef.current.velocityX = normalizePointerVelocity(deltaX, elapsedInteraction);
      pointerRef.current.velocityY = normalizePointerVelocity(-deltaY, elapsedInteraction);
      pointerRef.current.targetStrength = Math.max(
        pointerRef.current.targetStrength,
        Math.min(1, 0.38 + speed * 0.34 + (dragging ? 0.34 : 0)),
      );
      previousPointerX = event.clientX;
      previousInteractionY = event.clientY;
      previousInteractionTime = event.timeStamp;
      if (!dragging || event.pointerId !== activePointer) return;
      const delta = event.clientY - previousPointerY;
      const elapsed = Math.max(event.timeStamp - previousPointerTime, 8);
      previousPointerY = event.clientY;
      previousPointerTime = event.timeStamp;
      const galleryDelta = mapPointerDeltaToGallery(delta);
      const instantaneousVelocity = galleryDelta / elapsed;
      pointerVelocity = pointerVelocity * 0.38 + instantaneousVelocity * 0.62;
      setTarget(motionRef.current.target + galleryDelta);
      event.preventDefault();
    };

    const stopDragging = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      setTarget(projectReleaseTarget(motionRef.current.target, pointerVelocity, getMaximum()));
      dragging = false;
      activePointer = null;
      pointerVelocity = 0;
      pointerRef.current.targetStrength = Math.max(pointerRef.current.targetStrength, 0.5);
      stage.dataset.dragging = "false";
    };

    const onPointerEnter = (event: PointerEvent) => {
      pointerInside = true;
      updatePointerTarget(event);
      rememberPointer(event);
    };

    const onPointerLeave = () => {
      if (dragging) return;
      pointerInside = false;
      pointerRef.current.targetStrength = 0;
    };

    const onResize = () => setTarget(motionRef.current.target);

    const tick = (now: number) => {
      const delta = Math.min(now - lastFrame, 34);
      lastFrame = now;
      motionRef.current = createMotionFrame(motionRef.current, delta);
      const normalizedDelta = Math.min(Math.max(delta / 16.667, 0), 2);
      const pointerFloor = dragging ? 0.58 : pointerInside ? 0.06 : 0;
      pointerRef.current.targetStrength = Math.max(
        pointerFloor,
        pointerRef.current.targetStrength * Math.pow(dragging ? 0.96 : 0.86, normalizedDelta),
      );
      pointerRef.current = createPointerInteractionFrame(pointerRef.current, delta);
      const visuals = mapVelocityToVisuals(motionRef.current.velocity);
      stage.style.setProperty("--gallery-y", motionRef.current.current.toFixed(3));
      stage.style.setProperty("--gallery-bend", visuals.bend.toFixed(4));
      stage.style.setProperty("--gallery-skew", visuals.skew.toFixed(4));
      stage.style.setProperty("--gallery-stretch", visuals.stretch.toFixed(4));
      stage.style.setProperty("--pointer-x", pointerRef.current.x.toFixed(4));
      stage.style.setProperty("--pointer-y", pointerRef.current.y.toFixed(4));
      stage.style.setProperty("--pointer-strength", pointerRef.current.strength.toFixed(4));
      stage.dataset.pointerActive = pointerRef.current.strength > 0.025 ? "true" : "false";
      const grid = stage.querySelector<HTMLElement>(".gallery-grid--metadata");
      if (grid) {
        const cameraDistance = window.innerHeight / (2 * Math.tan((35 * Math.PI) / 360));
        const gridLeft = (window.innerWidth - grid.offsetWidth) / 2;
        cards.forEach((card) => {
          const media = card.querySelector<HTMLElement>(".project-media");
          if (!media) return;
          const centerY = grid.offsetTop + card.offsetTop + media.offsetHeight / 2 - motionRef.current.current;
          const centerX = gridLeft + card.offsetLeft + card.offsetWidth / 2;
          const layout = calculateMetadataDepthLayout(
            centerY,
            media.offsetHeight,
            cameraDistance,
            centerX,
            window.innerWidth,
          );
          card.style.setProperty("--meta-depth-x", layout.shiftX.toFixed(3));
          card.style.setProperty("--meta-depth-y", layout.shiftY.toFixed(3));
          card.style.setProperty("--meta-depth-scale", layout.scale.toFixed(4));
          card.style.setProperty("--meta-depth-opacity", layout.opacity.toFixed(4));
        });
      }
      animationFrame = requestAnimationFrame(tick);
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointerenter", onPointerEnter);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);
    stage.addEventListener("pointerup", stopDragging);
    stage.addEventListener("pointercancel", stopDragging);
    window.addEventListener("resize", onResize);
    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointerenter", onPointerEnter);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
      stage.removeEventListener("pointerup", stopDragging);
      stage.removeEventListener("pointercancel", stopDragging);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return { stageRef, motionRef, pointerRef };
}
