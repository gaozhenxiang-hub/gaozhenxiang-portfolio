"use client";

import { useEffect, useRef } from "react";

import {
  calculateContactProgress,
  calculateGalleryMaximum,
  calculateMetadataDepthLayout,
  calculatePointerImpulse,
  clampPosition,
  createMotionFrame,
  createPointerInteractionFrame,
  mapPointerDeltaToGallery,
  mapVelocityToVisuals,
  normalizePointerVelocity,
  projectReleaseTarget,
  type MotionState,
  type PointerInteractionState,
} from "@/features/gallery/gallery-motion";
import { calculateExperienceLayout, mapHeroProgressToVisuals } from "./portfolio-motion";

export function usePortfolioMotion() {
  const stageRef = useRef<HTMLDivElement>(null);
  const experienceMotionRef = useRef<MotionState>({ current: 0, target: 0, velocity: 0 });
  const motionRef = useRef<MotionState>({ current: 0, target: 0, velocity: 0 });
  const heroProgressRef = useRef(0);
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
    let previousPointerX = 0;
    let previousInteractionY = 0;
    let previousInteractionTime = 0;
    let hasPreviousInteraction = false;

    const galleryStage = stage.querySelector<HTMLElement>(".gallery-stage");
    const cards = Array.from(stage.querySelectorAll<HTMLElement>(".project-card"));
    const getHeroDistance = () => window.innerHeight;
    const getGalleryMaximum = () => {
      const grid = stage.querySelector<HTMLElement>(".gallery-grid--metadata");
      if (!grid) return 0;
      return calculateGalleryMaximum(grid.offsetTop, grid.scrollHeight, window.innerHeight);
    };
    const getMaximum = () => getHeroDistance() + getGalleryMaximum();
    const setTarget = (next: number) => {
      experienceMotionRef.current.target = clampPosition(next, getMaximum());
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
      setTarget(experienceMotionRef.current.target + event.deltaY * 0.92);
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
      galleryStage?.setAttribute("data-dragging", "true");
      stage.setPointerCapture(event.pointerId);
      event.preventDefault();
    };
    const onPointerMove = (event: PointerEvent) => {
      updatePointerTarget(event);
      if (!hasPreviousInteraction) {
        rememberPointer(event);
        return;
      }
      const elapsedInteraction = Math.max(event.timeStamp - previousInteractionTime, 8);
      const deltaX = event.clientX - previousPointerX;
      const deltaY = event.clientY - previousInteractionY;
      const speed = Math.hypot(deltaX, deltaY) / elapsedInteraction;
      pointerRef.current.velocityX = normalizePointerVelocity(deltaX, elapsedInteraction);
      pointerRef.current.velocityY = normalizePointerVelocity(-deltaY, elapsedInteraction);
      pointerRef.current.targetStrength = Math.max(
        pointerRef.current.targetStrength,
        calculatePointerImpulse(speed, dragging),
      );
      rememberPointer(event);
      if (!dragging || event.pointerId !== activePointer) return;
      const delta = event.clientY - previousPointerY;
      const elapsed = Math.max(event.timeStamp - previousPointerTime, 8);
      previousPointerY = event.clientY;
      previousPointerTime = event.timeStamp;
      const travel = mapPointerDeltaToGallery(delta);
      pointerVelocity = pointerVelocity * 0.38 + (travel / elapsed) * 0.62;
      setTarget(experienceMotionRef.current.target + travel);
      event.preventDefault();
    };
    const stopDragging = (event: PointerEvent) => {
      if (event.pointerId !== activePointer) return;
      if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
      setTarget(
        projectReleaseTarget(experienceMotionRef.current.target, pointerVelocity, getMaximum()),
      );
      dragging = false;
      activePointer = null;
      pointerVelocity = 0;
      pointerRef.current.targetStrength = Math.max(pointerRef.current.targetStrength, 0.5);
      stage.dataset.dragging = "false";
      galleryStage?.setAttribute("data-dragging", "false");
    };
    const onPointerEnter = (event: PointerEvent) => {
      updatePointerTarget(event);
      rememberPointer(event);
    };
    const onPointerLeave = () => {
      if (!dragging) pointerRef.current.targetStrength = 0;
    };
    const onResize = () => setTarget(experienceMotionRef.current.target);

    const tick = (now: number) => {
      const delta = Math.min(now - lastFrame, 34);
      lastFrame = now;
      experienceMotionRef.current = createMotionFrame(experienceMotionRef.current, delta);
      const layout = calculateExperienceLayout(
        experienceMotionRef.current.current,
        getHeroDistance(),
      );
      heroProgressRef.current = layout.heroProgress;
      const galleryTarget = calculateExperienceLayout(
        experienceMotionRef.current.target,
        getHeroDistance(),
      ).galleryPosition;
      motionRef.current = {
        current: layout.galleryPosition,
        target: galleryTarget,
        velocity: layout.heroProgress === 1 ? experienceMotionRef.current.velocity : 0,
      };

      const normalizedDelta = Math.min(Math.max(delta / 16.667, 0), 2);
      const pointerFloor = dragging ? 0.42 : 0;
      pointerRef.current.targetStrength = Math.max(
        pointerFloor,
        pointerRef.current.targetStrength * Math.pow(dragging ? 0.96 : 0.72, normalizedDelta),
      );
      pointerRef.current = createPointerInteractionFrame(pointerRef.current, delta);

      const hero = mapHeroProgressToVisuals(layout.heroProgress);
      stage.style.setProperty("--hero-progress", layout.heroProgress.toFixed(4));
      stage.style.setProperty("--portal-open", hero.portalOpen.toFixed(4));
      stage.style.setProperty("--film-retreat", hero.filmRetreat.toFixed(4));
      stage.style.setProperty("--camera-advance", hero.cameraAdvance.toFixed(4));
      stage.style.setProperty("--hero-copy-opacity", hero.copyOpacity.toFixed(4));
      stage.style.setProperty("--gallery-reveal", hero.galleryReveal.toFixed(4));
      stage.dataset.phase = layout.heroProgress >= 0.999 ? "gallery" : "hero";
      stage.dataset.pointerActive = pointerRef.current.strength > 0.025 ? "true" : "false";

      if (galleryStage) {
        const visuals = mapVelocityToVisuals(motionRef.current.velocity);
        const contactProgress = calculateContactProgress(
          motionRef.current.current,
          getGalleryMaximum(),
          window.innerHeight,
        );
        galleryStage.style.setProperty("--gallery-y", motionRef.current.current.toFixed(3));
        galleryStage.style.setProperty("--gallery-bend", visuals.bend.toFixed(4));
        galleryStage.style.setProperty("--gallery-skew", visuals.skew.toFixed(4));
        galleryStage.style.setProperty("--gallery-stretch", visuals.stretch.toFixed(4));
        galleryStage.style.setProperty("--pointer-x", pointerRef.current.x.toFixed(4));
        galleryStage.style.setProperty("--pointer-y", pointerRef.current.y.toFixed(4));
        galleryStage.style.setProperty("--pointer-strength", pointerRef.current.strength.toFixed(4));
        galleryStage.style.setProperty("--contact-progress", contactProgress.toFixed(4));
        galleryStage.dataset.pointerActive =
          pointerRef.current.strength > 0.025 ? "true" : "false";
      }

      const grid = stage.querySelector<HTMLElement>(".gallery-grid--metadata");
      if (grid) {
        const cameraDistance = window.innerHeight / (2 * Math.tan((35 * Math.PI) / 360));
        const gridLeft = (window.innerWidth - grid.offsetWidth) / 2;
        cards.forEach((card) => {
          const media = card.querySelector<HTMLElement>(".project-media");
          if (!media) return;
          const centerY =
            grid.offsetTop + card.offsetTop + media.offsetHeight / 2 - motionRef.current.current;
          const centerX = gridLeft + card.offsetLeft + card.offsetWidth / 2;
          const metadata = calculateMetadataDepthLayout(
            centerY,
            media.offsetHeight,
            cameraDistance,
            centerX,
            window.innerWidth,
          );
          card.style.setProperty("--meta-depth-x", metadata.shiftX.toFixed(3));
          card.style.setProperty("--meta-depth-y", metadata.shiftY.toFixed(3));
          card.style.setProperty("--meta-depth-scale", metadata.scale.toFixed(4));
          card.style.setProperty("--meta-depth-opacity", metadata.opacity.toFixed(4));
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

  return { stageRef, motionRef, pointerRef, heroProgressRef };
}
