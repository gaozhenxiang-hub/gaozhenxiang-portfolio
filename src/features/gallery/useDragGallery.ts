"use client";

import { useEffect, useRef } from "react";

import {
  clampPosition,
  createMotionFrame,
  mapVelocityToVisuals,
  projectReleaseTarget,
  type MotionState,
} from "./gallery-motion";

export function useDragGallery() {
  const stageRef = useRef<HTMLElement>(null);
  const motionRef = useRef<MotionState>({ current: 0, target: 0, velocity: 0 });

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

    const getMaximum = () => {
      const grid = stage.querySelector<HTMLElement>(".gallery-grid--metadata");
      if (!grid) return 0;
      return Math.max(0, grid.offsetTop + grid.scrollHeight - window.innerHeight + 48);
    };

    const setTarget = (next: number) => {
      motionRef.current.target = clampPosition(next, getMaximum());
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      setTarget(motionRef.current.target + event.deltaY * 0.92);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      dragging = true;
      activePointer = event.pointerId;
      previousPointerY = event.clientY;
      previousPointerTime = event.timeStamp;
      pointerVelocity = 0;
      stage.dataset.dragging = "true";
      stage.setPointerCapture(event.pointerId);
      event.preventDefault();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== activePointer) return;
      const delta = event.clientY - previousPointerY;
      const elapsed = Math.max(event.timeStamp - previousPointerTime, 8);
      previousPointerY = event.clientY;
      previousPointerTime = event.timeStamp;
      const galleryDelta = -delta * 1.38;
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
      stage.dataset.dragging = "false";
    };

    const onResize = () => setTarget(motionRef.current.target);

    const tick = (now: number) => {
      const delta = Math.min(now - lastFrame, 34);
      lastFrame = now;
      motionRef.current = createMotionFrame(motionRef.current, delta);
      const visuals = mapVelocityToVisuals(motionRef.current.velocity);
      stage.style.setProperty("--gallery-y", motionRef.current.current.toFixed(3));
      stage.style.setProperty("--gallery-bend", visuals.bend.toFixed(4));
      stage.style.setProperty("--gallery-skew", visuals.skew.toFixed(4));
      stage.style.setProperty("--gallery-stretch", visuals.stretch.toFixed(4));
      animationFrame = requestAnimationFrame(tick);
    };

    stage.addEventListener("wheel", onWheel, { passive: false });
    stage.addEventListener("pointerdown", onPointerDown);
    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerup", stopDragging);
    stage.addEventListener("pointercancel", stopDragging);
    window.addEventListener("resize", onResize);
    animationFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrame);
      stage.removeEventListener("wheel", onWheel);
      stage.removeEventListener("pointerdown", onPointerDown);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerup", stopDragging);
      stage.removeEventListener("pointercancel", stopDragging);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return { stageRef, motionRef };
}
