# AIGC Portfolio Motion Cover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a luminous animated cover for 高振翔 that combines a transparent spatial portal with a responsive floating film and transitions bidirectionally into the existing portfolio gallery.

**Architecture:** A new `PortfolioExperience` owns one fixed viewport and one motion controller. The controller maps one continuous logical position into hero progress and gallery position, so wheel and pointer drag never compete. DOM renders all readable copy, a dedicated React Three Fiber canvas renders the portal and film, and the existing gallery receives shared motion refs without changing its project, video, or contact behavior.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, React Three Fiber, Three.js, Vitest, Testing Library, Playwright, CSS custom properties.

---

## File map

- Create `src/features/portfolio/portfolio-motion.ts`: pure progress and visual-state mapping.
- Create `src/features/portfolio/portfolio-motion.test.ts`: boundary and phase tests for the pure mapping.
- Create `src/features/portfolio/usePortfolioMotion.ts`: the only wheel, drag, pointer, and animation-frame controller.
- Create `src/features/portfolio/HeroCover.tsx`: semantic hero copy, fallback image, and canvas composition.
- Create `src/features/portfolio/HeroCanvas.tsx`: transparent portal and deforming film scene.
- Create `src/features/portfolio/portfolio.css`: cover, handoff, fallback, and reduced-motion styling.
- Create `src/features/portfolio/PortfolioExperience.tsx`: root composition and ref wiring.
- Create `src/features/portfolio/PortfolioExperience.test.tsx`: hero content and composition tests.
- Modify `src/features/gallery/GalleryPage.tsx`: consume shared refs and remove its private input hook.
- Modify `src/features/gallery/GalleryPage.test.tsx`: provide shared refs directly.
- Delete `src/features/gallery/useDragGallery.ts`: remove the second input controller after parity is established.
- Modify `src/app/page.tsx`: render `PortfolioExperience`.
- Copy `docs/superpowers/specs/assets/aigc-cover-open-portal.png` to `public/hero/aigc-cover-fallback.png`: approved static fallback.
- Modify `e2e/gallery.spec.ts`: enter the gallery before existing gallery assertions and add hero transition coverage.
- Modify `e2e/visual-capture.spec.ts`: capture hero idle, pointer response, midpoint, gallery handoff, and existing gallery states.

### Task 1: Add the pure experience timeline

**Files:**
- Create: `src/features/portfolio/portfolio-motion.ts`
- Create: `src/features/portfolio/portfolio-motion.test.ts`

- [ ] **Step 1: Write the failing timeline tests**

Create `src/features/portfolio/portfolio-motion.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import {
  calculateExperienceLayout,
  mapHeroProgressToVisuals,
  smoothRange,
} from "./portfolio-motion";

describe("portfolio motion", () => {
  it("holds the gallery at zero until the hero travel completes", () => {
    expect(calculateExperienceLayout(0, 900)).toEqual({ heroProgress: 0, galleryPosition: 0 });
    expect(calculateExperienceLayout(450, 900)).toEqual({ heroProgress: 0.5, galleryPosition: 0 });
    expect(calculateExperienceLayout(900, 900)).toEqual({ heroProgress: 1, galleryPosition: 0 });
    expect(calculateExperienceLayout(1120, 900)).toEqual({ heroProgress: 1, galleryPosition: 220 });
  });

  it("clamps invalid or reversed travel values", () => {
    expect(calculateExperienceLayout(-50, 900)).toEqual({ heroProgress: 0, galleryPosition: 0 });
    expect(calculateExperienceLayout(50, 0)).toEqual({ heroProgress: 1, galleryPosition: 50 });
  });

  it("maps the three approved transition phases", () => {
    const idle = mapHeroProgressToVisuals(0);
    const opening = mapHeroProgressToVisuals(0.45);
    const handoff = mapHeroProgressToVisuals(1);

    expect(idle.portalOpen).toBe(0);
    expect(idle.filmRetreat).toBe(0);
    expect(idle.copyOpacity).toBe(1);
    expect(opening.portalOpen).toBeGreaterThan(0.25);
    expect(opening.filmRetreat).toBeGreaterThan(0);
    expect(opening.copyOpacity).toBeGreaterThan(0);
    expect(handoff.portalOpen).toBe(1);
    expect(handoff.filmRetreat).toBe(1);
    expect(handoff.copyOpacity).toBe(0);
    expect(handoff.galleryReveal).toBe(1);
  });

  it("smooths a bounded range without overshooting", () => {
    expect(smoothRange(0.1, 0.22, 0.68)).toBe(0);
    expect(smoothRange(0.45, 0.22, 0.68)).toBeCloseTo(0.5, 5);
    expect(smoothRange(0.9, 0.22, 0.68)).toBe(1);
  });
});
```

- [ ] **Step 2: Run the focused test and verify red state**

Run:

```powershell
npx vitest run src/features/portfolio/portfolio-motion.test.ts
```

Expected: FAIL because `portfolio-motion.ts` does not exist.

- [ ] **Step 3: Implement the complete pure mapping**

Create `src/features/portfolio/portfolio-motion.ts`:

```ts
export interface ExperienceLayout {
  heroProgress: number;
  galleryPosition: number;
}

export interface HeroVisuals {
  portalOpen: number;
  filmRetreat: number;
  cameraAdvance: number;
  copyOpacity: number;
  galleryReveal: number;
}

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function smoothRange(value: number, start: number, end: number) {
  if (end <= start) return value >= end ? 1 : 0;
  const normalized = clamp01((value - start) / (end - start));
  return normalized * normalized * (3 - 2 * normalized);
}

export function calculateExperienceLayout(
  position: number,
  heroDistance: number,
): ExperienceLayout {
  const safePosition = Math.max(0, position);
  if (heroDistance <= 0) {
    return { heroProgress: 1, galleryPosition: safePosition };
  }
  return {
    heroProgress: clamp01(safePosition / heroDistance),
    galleryPosition: Math.max(0, safePosition - heroDistance),
  };
}

export function mapHeroProgressToVisuals(progress: number): HeroVisuals {
  const safe = clamp01(progress);
  return {
    portalOpen: smoothRange(safe, 0, 0.68),
    filmRetreat: smoothRange(safe, 0.22, 0.68),
    cameraAdvance: smoothRange(safe, 0.68, 1),
    copyOpacity: 1 - smoothRange(safe, 0.28, 0.76),
    galleryReveal: smoothRange(safe, 0.72, 1),
  };
}
```

- [ ] **Step 4: Run the focused test and verify green state**

Run:

```powershell
npx vitest run src/features/portfolio/portfolio-motion.test.ts
```

Expected: 4 tests pass.

- [ ] **Step 5: Commit the timeline**

```powershell
git add src/features/portfolio/portfolio-motion.ts src/features/portfolio/portfolio-motion.test.ts
git commit -m "feat: add portfolio cover timeline"
```

### Task 2: Replace competing input listeners with one controller

**Files:**
- Create: `src/features/portfolio/usePortfolioMotion.ts`
- Modify: `src/features/gallery/GalleryPage.tsx`
- Modify: `src/features/gallery/GalleryPage.test.tsx`
- Delete: `src/features/gallery/useDragGallery.ts`

- [ ] **Step 1: Change the gallery test to require shared refs**

In `src/features/gallery/GalleryPage.test.tsx`, delete the `vi.mock("./useDragGallery", ...)` block and add this helper below the `GalleryCanvas` mock:

```ts
const sharedMotion = {
  motionRef: { current: { current: 0, target: 0, velocity: 0 } },
  pointerRef: {
    current: {
      x: 0.5,
      y: 0.5,
      targetX: 0.5,
      targetY: 0.5,
      strength: 0,
      targetStrength: 0,
      velocityX: 0,
      velocityY: 0,
    },
  },
};

const renderGallery = () => render(<GalleryPage {...sharedMotion} />);
```

Replace every `render(<GalleryPage />);` in that file with:

```ts
renderGallery();
```

- [ ] **Step 2: Run the component test and verify the required-prop failure**

Run:

```powershell
npx vitest run src/features/gallery/GalleryPage.test.tsx
```

Expected: FAIL because `GalleryPage` does not accept `motionRef` and `pointerRef`.

- [ ] **Step 3: Make GalleryPage a presentation component**

Replace the imports and function signature at the top of `src/features/gallery/GalleryPage.tsx` with:

```tsx
"use client";

/* eslint-disable @next/next/no-img-element -- exact local source assets also back the WebGL texture layer */

import { useState } from "react";

import { projects } from "@/content/projects";
import { ContactFinale } from "@/features/contact/ContactFinale";
import { GalleryCanvas } from "./GalleryCanvas";
import type { MotionState, PointerInteractionState } from "./gallery-motion";
import { ProjectMedia } from "./ProjectMedia";

import "./gallery.css";

type MotionRef = { current: MotionState };
type PointerRef = { current: PointerInteractionState };

export function GalleryPage({
  motionRef,
  pointerRef,
}: {
  motionRef: MotionRef;
  pointerRef: PointerRef;
}) {
```

Inside the function, remove:

```ts
const { stageRef, motionRef, pointerRef } = useDragGallery();
```

Change the root element from `main` to `section`, remove `ref={stageRef}`, and keep the existing classes and data attributes:

```tsx
<section
  className="gallery-stage"
  data-testid="gallery-stage"
  data-dragging="false"
  data-pointer-active="false"
>
```

Change the matching closing tag from `</main>` to `</section>`. Do not change the project loop, `ProjectMedia`, `GalleryCanvas`, or `ContactFinale`.

- [ ] **Step 4: Run the gallery component tests**

Run:

```powershell
npx vitest run src/features/gallery/GalleryPage.test.tsx
```

Expected: all 5 tests pass.

- [ ] **Step 5: Add the unified motion controller**

Create `src/features/portfolio/usePortfolioMotion.ts` by moving the event and frame logic from `useDragGallery.ts` and applying these required changes:

```ts
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
      pointerRef.current.targetX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width));
      pointerRef.current.targetY = 1 - Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
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
      setTarget(projectReleaseTarget(experienceMotionRef.current.target, pointerVelocity, getMaximum()));
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
        galleryStage.dataset.pointerActive = pointerRef.current.strength > 0.025 ? "true" : "false";
      }

      const grid = stage.querySelector<HTMLElement>(".gallery-grid--metadata");
      if (grid) {
        const cameraDistance = window.innerHeight / (2 * Math.tan((35 * Math.PI) / 360));
        const gridLeft = (window.innerWidth - grid.offsetWidth) / 2;
        cards.forEach((card) => {
          const media = card.querySelector<HTMLElement>(".project-media");
          if (!media) return;
          const centerY = grid.offsetTop + card.offsetTop + media.offsetHeight / 2 - motionRef.current.current;
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
```

- [ ] **Step 6: Delete the old controller and run all unit/component tests**

Delete `src/features/gallery/useDragGallery.ts`, then run:

```powershell
npm test
```

Expected: all existing tests plus the 4 new timeline tests pass; no import references `useDragGallery`.

- [ ] **Step 7: Commit the unified controller**

```powershell
git add src/features/portfolio/usePortfolioMotion.ts src/features/gallery/GalleryPage.tsx src/features/gallery/GalleryPage.test.tsx src/features/gallery/useDragGallery.ts
git commit -m "refactor: unify portfolio motion input"
```

### Task 3: Add the semantic cover and static fallback

**Files:**
- Create: `src/features/portfolio/HeroCover.tsx`
- Create: `src/features/portfolio/portfolio.css`
- Copy: `public/hero/aigc-cover-fallback.png`

- [ ] **Step 1: Copy the approved visual into the runtime assets**

Run:

```powershell
New-Item -ItemType Directory -Path public/hero -Force | Out-Null
Copy-Item -LiteralPath docs/superpowers/specs/assets/aigc-cover-open-portal.png -Destination public/hero/aigc-cover-fallback.png
```

Expected: `public/hero/aigc-cover-fallback.png` exists and is 1586×992; `object-fit: cover` supplies the 1440×900 viewport crop.

- [ ] **Step 2: Create the semantic cover component**

Create `src/features/portfolio/HeroCover.tsx`:

```tsx
/* eslint-disable @next/next/no-img-element -- the approved generated mock is the exact static fallback */

import type { RefObject } from "react";

import type { PointerInteractionState } from "@/features/gallery/gallery-motion";
import { HeroCanvas } from "./HeroCanvas";

export function HeroCover({
  heroProgressRef,
  pointerRef,
}: {
  heroProgressRef: RefObject<number>;
  pointerRef: RefObject<PointerInteractionState>;
}) {
  return (
    <section className="hero-cover" data-testid="hero-cover" aria-labelledby="hero-title">
      <img
        className="hero-fallback"
        src="/hero/aigc-cover-fallback.png"
        alt=""
        aria-hidden="true"
      />
      <HeroCanvas heroProgressRef={heroProgressRef} pointerRef={pointerRef} />
      <div className="hero-copy">
        <p className="hero-role">AIGC CREATOR</p>
        <h1 id="hero-title">高振翔</h1>
      </div>
      <div className="hero-works-cue" aria-hidden="true">
        <span>SELECTED WORKS</span>
        <i />
      </div>
      <div className="hero-scroll-cue" aria-hidden="true">
        <span>SCROLL TO EXPLORE</span>
        <i />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Add the complete cover and handoff styles**

Create `src/features/portfolio/portfolio.css`:

```css
.portfolio-experience {
  --hero-progress: 0;
  --portal-open: 0;
  --film-retreat: 0;
  --camera-advance: 0;
  --hero-copy-opacity: 1;
  --gallery-reveal: 0;
  position: fixed;
  inset: 0;
  min-width: 980px;
  overflow: hidden;
  background: #fdfdf9;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.portfolio-experience[data-dragging="true"] { cursor: grabbing; }

.hero-cover {
  position: fixed;
  z-index: 20;
  inset: 0;
  overflow: hidden;
  color: #171717;
  background: #fdfdf9;
  opacity: calc(1 - var(--gallery-reveal));
  transform: scale(calc(1 + var(--camera-advance) * 0.08));
  transform-origin: 66% 50%;
  pointer-events: none;
  will-change: opacity, transform;
}

.hero-fallback,
.hero-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.hero-fallback {
  object-fit: cover;
  opacity: 1;
  transition: opacity 420ms ease;
}

.hero-canvas { opacity: 0; transition: opacity 420ms ease; }
.hero-webgl-ready .hero-fallback { opacity: 0; }
.hero-webgl-ready .hero-canvas { opacity: 1; }
.portfolio-experience:not(.hero-webgl-ready) .hero-copy,
.portfolio-experience:not(.hero-webgl-ready) .hero-works-cue,
.portfolio-experience:not(.hero-webgl-ready) .hero-scroll-cue { opacity: 0; }

.hero-copy {
  position: absolute;
  z-index: 2;
  top: 49%;
  left: clamp(74px, 7.6vw, 122px);
  opacity: var(--hero-copy-opacity);
  transform: translate3d(calc(var(--hero-progress) * -90px), -50%, 0);
  will-change: opacity, transform;
}

.hero-copy h1 {
  margin: 18px 0 0;
  font-size: clamp(118px, 10.2vw, 164px);
  font-weight: 500;
  line-height: 0.9;
  letter-spacing: -0.075em;
}

.hero-role,
.hero-works-cue,
.hero-scroll-cue {
  font-size: 16px;
  letter-spacing: 0.44em;
}

.hero-role { margin: 0; }

.hero-works-cue {
  position: absolute;
  z-index: 2;
  top: 49%;
  right: clamp(54px, 8.2vw, 132px);
  display: grid;
  gap: 20px;
  opacity: calc(var(--hero-copy-opacity) * 0.82);
}

.hero-works-cue i { width: 58px; height: 1px; background: currentColor; }

.hero-scroll-cue {
  position: absolute;
  z-index: 2;
  bottom: 28px;
  left: 50%;
  display: grid;
  justify-items: center;
  gap: 15px;
  font-size: 11px;
  opacity: calc(var(--hero-copy-opacity) * 0.72);
  transform: translateX(-50%);
}

.hero-scroll-cue i { width: 1px; height: 44px; background: currentColor; }

.portfolio-experience .gallery-stage {
  z-index: 1;
  opacity: var(--gallery-reveal);
  pointer-events: none;
}

.portfolio-experience[data-phase="gallery"] .gallery-stage { pointer-events: auto; }

@media (prefers-reduced-motion: reduce) {
  .hero-canvas { display: none; }
  .hero-fallback { opacity: 1; }
  .hero-cover,
  .hero-copy { transition: none; transform: none; }
}
```

- [ ] **Step 4: Commit the semantic cover**

```powershell
git add src/features/portfolio/HeroCover.tsx src/features/portfolio/portfolio.css public/hero/aigc-cover-fallback.png
git commit -m "feat: add AIGC portfolio cover"
```

### Task 4: Build the transparent portal and responsive film

**Files:**
- Create: `src/features/portfolio/HeroCanvas.tsx`

- [ ] **Step 1: Create the WebGL hero scene**

Create `src/features/portfolio/HeroCanvas.tsx`:

```tsx
"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
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

function PortalScene({ heroProgressRef, pointerRef }: { heroProgressRef: NumberRef; pointerRef: PointerRef }) {
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
  const frameDepth = 0.1;
  const frameThickness = 0.055;
  const framePieces = useMemo(
    () => [
      { position: [-portalWidth / 2, 0, 0] as [number, number, number], scale: [frameThickness, portalHeight, frameDepth] as [number, number, number] },
      { position: [portalWidth / 2, 0, 0] as [number, number, number], scale: [frameThickness, portalHeight, frameDepth] as [number, number, number] },
      { position: [0, portalHeight / 2, 0] as [number, number, number], scale: [portalWidth, frameThickness, frameDepth] as [number, number, number] },
      { position: [0, -portalHeight / 2, 0] as [number, number, number], scale: [portalWidth, frameThickness, frameDepth] as [number, number, number] },
    ],
    [portalHeight, portalWidth],
  );

  useFrame(({ clock }) => {
    const progress = heroProgressRef.current;
    const visuals = mapHeroProgressToVisuals(progress);
    const pointer = pointerRef.current;
    const time = clock.elapsedTime;

    if (portalRef.current) {
      const idleYaw = Math.sin(time * 0.52) * MathUtils.degToRad(1.5);
      portalRef.current.rotation.y =
        -0.12 + visuals.portalOpen * 0.49 + idleYaw + pointer.velocityX * pointer.strength * 0.028;
      portalRef.current.rotation.x = pointer.velocityY * pointer.strength * 0.018;
      portalRef.current.position.x = portalX + (pointer.x - 0.5) * pointer.strength * 0.16;
      portalRef.current.position.y = Math.sin(time * 0.44) * 0.025 + (pointer.y - 0.5) * pointer.strength * 0.09;
      portalRef.current.position.z = visuals.cameraAdvance * 2.4;
    }

    const film = filmRef.current;
    if (!film) return;
    const positions = film.geometry.attributes.position as BufferAttribute;
    if (!basePositions.current) basePositions.current = Float32Array.from(positions.array as Float32Array);
    const base = basePositions.current;
    const pointerX = (pointer.x - 0.5) * portalWidth;
    const pointerY = (pointer.y - 0.5) * portalHeight;
    for (let index = 0; index < positions.count; index += 1) {
      const offset = index * 3;
      const x = base[offset];
      const y = base[offset + 1];
      const distance = Math.hypot(x - pointerX, y - pointerY);
      const influence = Math.exp(-distance * distance * 1.75) * pointer.strength;
      const idle = Math.sin(y * 2.15 + time * 0.62) * 0.035 + Math.cos(x * 2.8 - time * 0.48) * 0.018;
      positions.setZ(index, idle + influence * 0.22 - visuals.filmRetreat * (0.12 + Math.abs(x) * 0.045));
    }
    positions.needsUpdate = true;
    film.rotation.y = pointer.velocityX * pointer.strength * 0.045;
    film.position.x = visuals.filmRetreat * 0.72;
    film.scale.x = 1 - visuals.filmRetreat * 0.24;
    film.material.opacity = 0.48 * (1 - visuals.cameraAdvance);
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={38} position={[0, 0, 8]} near={0.1} far={100} />
      <ambientLight intensity={1.6} />
      <directionalLight color="#ffffff" intensity={3.2} position={[-4, 5, 7]} />
      <directionalLight color="#f2eee7" intensity={1.8} position={[5, -2, 4]} />
      <group position={[portalX, -1.9, -3.2]}>
        <mesh position={[-2.6, 0.1, 0]} scale={[3.2, 0.85, 1.35]}>
          <sphereGeometry args={[1, 48, 24]} />
          <meshStandardMaterial color="#edf0eb" roughness={0.92} transparent opacity={0.42} />
        </mesh>
        <mesh position={[2.5, 0.32, -0.3]} scale={[3.6, 1.05, 1.5]}>
          <sphereGeometry args={[1, 48, 24]} />
          <meshStandardMaterial color="#e8ece7" roughness={0.9} transparent opacity={0.36} />
        </mesh>
      </group>
      <mesh position={[0, -2.72, -0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshPhysicalMaterial
          color="#fbfcf8"
          roughness={0.18}
          transmission={0.16}
          transparent
          opacity={0.54}
        />
      </mesh>
      <group ref={portalRef} position={[portalX, 0, 0]}>
        {framePieces.map((piece, index) => (
          <mesh key={index} position={piece.position} scale={piece.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshPhysicalMaterial
              color="#fffefa"
              roughness={0.04}
              transmission={0.95}
              thickness={0.28}
              ior={1.28}
              transparent
              opacity={0.78}
            />
          </mesh>
        ))}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[portalWidth, portalHeight, 1, 1]} />
          <meshPhysicalMaterial
            color="#fbfcf8"
            roughness={0.12}
            transmission={0.94}
            thickness={0.12}
            ior={1.18}
            transparent
            opacity={0.22}
            side={DoubleSide}
            depthWrite={false}
          />
        </mesh>
        <mesh ref={filmRef} position={[0, 0, 0.1]}>
          <planeGeometry args={[portalWidth * 0.92, portalHeight * 0.92, 40, 56]} />
          <meshPhysicalMaterial
            color="#fffdf8"
            roughness={0.07}
            transmission={0.92}
            thickness={0.08}
            ior={1.22}
            transparent
            opacity={0.48}
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
      <Canvas dpr={[1, 1.5]} gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}>
        <Suspense fallback={null}>
          <PortalScene heroProgressRef={heroProgressRef} pointerRef={pointerRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
```

- [ ] **Step 2: Check the scene types and lint rules**

Run:

```powershell
npx eslint src/features/portfolio/HeroCanvas.tsx
npx tsc --noEmit
```

Expected: both commands exit 0.

- [ ] **Step 3: Commit the WebGL scene**

```powershell
git add src/features/portfolio/HeroCanvas.tsx
git commit -m "feat: animate portal and floating film"
```

### Task 5: Compose the cover and gallery

**Files:**
- Create: `src/features/portfolio/PortfolioExperience.tsx`
- Create: `src/features/portfolio/PortfolioExperience.test.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Write the failing composition test**

Create `src/features/portfolio/PortfolioExperience.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PortfolioExperience } from "./PortfolioExperience";

vi.mock("./HeroCanvas", () => ({ HeroCanvas: () => <div data-testid="hero-canvas" /> }));
vi.mock("@/features/gallery/GalleryPage", () => ({
  GalleryPage: () => <section data-testid="gallery-stage"><h2>Selected Works</h2></section>,
}));
vi.mock("./usePortfolioMotion", () => ({
  usePortfolioMotion: () => ({
    stageRef: { current: null },
    heroProgressRef: { current: 0 },
    motionRef: { current: { current: 0, target: 0, velocity: 0 } },
    pointerRef: {
      current: {
        x: 0.5,
        y: 0.5,
        targetX: 0.5,
        targetY: 0.5,
        strength: 0,
        targetStrength: 0,
        velocityX: 0,
        velocityY: 0,
      },
    },
  }),
}));

describe("PortfolioExperience", () => {
  it("renders the approved cover before the existing gallery", () => {
    render(<PortfolioExperience />);

    expect(screen.getByTestId("portfolio-experience")).toHaveAttribute("data-phase", "hero");
    expect(screen.getByRole("heading", { name: "高振翔", level: 1 })).toBeVisible();
    expect(screen.getByText("AIGC CREATOR")).toBeVisible();
    expect(screen.getByText("SELECTED WORKS")).toBeInTheDocument();
    expect(screen.getByText("SCROLL TO EXPLORE")).toBeInTheDocument();
    expect(screen.getByTestId("hero-canvas")).toBeVisible();
    expect(screen.getByTestId("gallery-stage")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the focused test and verify red state**

Run:

```powershell
npx vitest run src/features/portfolio/PortfolioExperience.test.tsx
```

Expected: FAIL because `PortfolioExperience.tsx` does not exist.

- [ ] **Step 3: Implement the root composition**

Create `src/features/portfolio/PortfolioExperience.tsx`:

```tsx
"use client";

import { GalleryPage } from "@/features/gallery/GalleryPage";
import { HeroCover } from "./HeroCover";
import { usePortfolioMotion } from "./usePortfolioMotion";

import "./portfolio.css";

export function PortfolioExperience() {
  const { stageRef, motionRef, pointerRef, heroProgressRef } = usePortfolioMotion();

  return (
    <main
      className="portfolio-experience"
      data-testid="portfolio-experience"
      data-phase="hero"
      data-dragging="false"
      data-pointer-active="false"
      ref={stageRef}
    >
      <GalleryPage motionRef={motionRef} pointerRef={pointerRef} />
      <HeroCover heroProgressRef={heroProgressRef} pointerRef={pointerRef} />
    </main>
  );
}
```

Replace `src/app/page.tsx` with:

```tsx
import { PortfolioExperience } from "@/features/portfolio/PortfolioExperience";

export default function Home() {
  return <PortfolioExperience />;
}
```

- [ ] **Step 4: Run the focused and full test suites**

Run:

```powershell
npx vitest run src/features/portfolio/PortfolioExperience.test.tsx
npm test
```

Expected: the focused test passes and the complete suite has no failures.

- [ ] **Step 5: Commit the composition**

```powershell
git add src/features/portfolio/PortfolioExperience.tsx src/features/portfolio/PortfolioExperience.test.tsx src/app/page.tsx
git commit -m "feat: place cover before portfolio gallery"
```

### Task 6: Add end-to-end transition coverage

**Files:**
- Modify: `e2e/gallery.spec.ts`

- [ ] **Step 1: Add a reusable gallery-entry helper**

At the top of `e2e/gallery.spec.ts`, change the import and add:

```ts
import { expect, test, type Page } from "@playwright/test";

async function enterGallery(page: Page) {
  await page.mouse.wheel(0, 1400);
  await expect(page.getByTestId("portfolio-experience")).toHaveAttribute("data-phase", "gallery");
  await expect(page.getByTestId("gallery-stage")).toHaveCSS("pointer-events", "auto");
}
```

- [ ] **Step 2: Add the cover interaction test before the gallery tests**

Add:

```ts
test("cover responds to pointer and transitions bidirectionally", async ({ page }) => {
  await page.goto("/");

  const experience = page.getByTestId("portfolio-experience");
  await expect(page.getByRole("heading", { name: "高振翔", level: 1 })).toBeVisible();
  await expect(page.getByText("AIGC CREATOR").first()).toBeVisible();
  await expect(experience).toHaveAttribute("data-phase", "hero");
  await expect(experience).toHaveClass(/hero-webgl-ready/);

  await page.mouse.move(920, 430);
  await page.mouse.move(1040, 360, { steps: 6 });
  await expect(experience).toHaveAttribute("data-pointer-active", "true");

  await enterGallery(page);
  const galleryPosition = await page.getByTestId("gallery-stage").evaluate((element) =>
    Number(getComputedStyle(element).getPropertyValue("--gallery-y")),
  );
  expect(galleryPosition).toBeGreaterThanOrEqual(0);

  await page.mouse.wheel(0, -1800);
  await expect(experience).toHaveAttribute("data-phase", "hero");
  await expect(page.getByRole("heading", { name: "高振翔", level: 1 })).toBeVisible();
});
```

- [ ] **Step 3: Enter the gallery before every existing gallery-only assertion**

Immediately after each existing `await page.goto("/");` in gallery-only tests, add:

```ts
await enterGallery(page);
```

Do not add it to the new cover test. In the contact-finale and later-video tests, the existing large positive wheel continues from the gallery state.

- [ ] **Step 4: Run Chrome and Edge end-to-end tests**

Run:

```powershell
npx playwright test e2e/gallery.spec.ts --project=chrome-1440
npx playwright test e2e/gallery.spec.ts --project=edge-1080p
```

Expected: all gallery and cover tests pass in both projects.

- [ ] **Step 5: Commit the end-to-end coverage**

```powershell
git add e2e/gallery.spec.ts
git commit -m "test: cover portfolio transition"
```

### Task 7: Capture and compare the visual states

**Files:**
- Modify: `e2e/visual-capture.spec.ts`
- Update: `design-qa.md`

- [ ] **Step 1: Add hero keyframe captures**

Add these tests to the top of `e2e/visual-capture.spec.ts`:

```ts
test("capture the AIGC cover idle and pointer states", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");
  await page.goto("/");
  await expect(page.getByTestId("portfolio-experience")).toHaveClass(/hero-webgl-ready/);
  await page.waitForTimeout(500);
  await page.screenshot({ path: `output/qa/hero-idle-${testInfo.project.name}.png` });
  await page.mouse.move(890, 520);
  await page.mouse.move(1080, 360, { steps: 8 });
  await page.waitForTimeout(32);
  await page.screenshot({ path: `output/qa/hero-pointer-${testInfo.project.name}.png` });
});

test("capture the cover midpoint and gallery handoff", async ({ page }, testInfo) => {
  test.skip(process.env.CAPTURE_QA !== "1", "Run with CAPTURE_QA=1 for visual QA artifacts.");
  await page.goto("/");
  await page.mouse.wheel(0, 480);
  await page.waitForTimeout(420);
  await page.screenshot({ path: `output/qa/hero-midpoint-${testInfo.project.name}.png` });
  await page.mouse.wheel(0, 1000);
  await expect(page.getByTestId("portfolio-experience")).toHaveAttribute("data-phase", "gallery");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `output/qa/hero-handoff-${testInfo.project.name}.png` });
});
```

- [ ] **Step 2: Advance to the gallery in all existing capture tests**

After `await page.goto("/");` in each existing gallery capture, add:

```ts
await page.mouse.wheel(0, 1400);
await expect(page.getByTestId("portfolio-experience")).toHaveAttribute("data-phase", "gallery");
```

- [ ] **Step 3: Generate the Chrome and Edge visual artifacts**

Run:

```powershell
$env:CAPTURE_QA='1'
npx playwright test e2e/visual-capture.spec.ts --project=chrome-1440 --project=edge-1080p
Remove-Item Env:CAPTURE_QA
```

Expected: hero idle, pointer, midpoint, handoff, gallery, drag, depth, video, and contact PNG files exist under `output/qa/` for both browsers.

- [ ] **Step 4: Build a same-canvas source comparison**

Use PowerShell and `System.Drawing` to place the approved Open Portal source and Chrome hero capture side by side:

```powershell
Add-Type -AssemblyName System.Drawing
$left=[System.Drawing.Image]::FromFile((Resolve-Path 'docs/superpowers/specs/assets/aigc-cover-open-portal.png'))
$right=[System.Drawing.Image]::FromFile((Resolve-Path 'output/qa/hero-idle-chrome-1440.png'))
$height=[Math]::Max($left.Height,$right.Height)
$canvas=New-Object System.Drawing.Bitmap ($left.Width+$right.Width),$height
$graphics=[System.Drawing.Graphics]::FromImage($canvas)
$graphics.Clear([System.Drawing.Color]::White)
$graphics.DrawImage($left,0,0,$left.Width,$left.Height)
$graphics.DrawImage($right,$left.Width,0,$right.Width,$right.Height)
$canvas.Save((Join-Path (Resolve-Path 'output/qa') 'hero-source-vs-build.png'),[System.Drawing.Imaging.ImageFormat]::Png)
$graphics.Dispose(); $canvas.Dispose(); $left.Dispose(); $right.Dispose()
```

Open `output/qa/hero-source-vs-build.png` and compare: copy alignment, background brightness, portal placement, film thickness, refraction strength, and empty-space balance. Make one focused correction pass if any mismatch is visually dominant, then rerun the two hero capture tests.

- [ ] **Step 5: Record the evidence in design-qa.md**

Append a section with this exact structure and replace each outcome only with observed facts:

```md
## 2026-09-11 AIGC cover

- Source comparison: `output/qa/hero-source-vs-build.png`
- Chrome 1440×900: idle, pointer, midpoint, reverse transition checked
- Edge 1920×1080: idle, pointer, midpoint, reverse transition checked
- Gallery regression: first row, depth curl, drag, video hover, and contact finale checked
- Console: no runtime errors observed during the checked flows
```

- [ ] **Step 6: Commit the capture workflow and QA record**

Do not add `output/`. Run:

```powershell
git add e2e/visual-capture.spec.ts design-qa.md
git commit -m "test: capture AIGC cover visual states"
```

### Task 8: Run the final quality gate

**Files:**
- Verify all modified source, test, and design files.

- [ ] **Step 1: Run lint, unit/component tests, and production build**

Run:

```powershell
npm run check
```

Expected: ESLint exits 0, all Vitest tests pass, and Next.js production build completes.

- [ ] **Step 2: Run the full Chrome and Edge browser matrix**

Run:

```powershell
npm run test:e2e
```

Expected: every Playwright test passes for `chrome-1440`, `edge-1080p`, and `chrome-recording-reference`.

- [ ] **Step 3: Confirm the worktree contains no accidental files**

Run:

```powershell
git status --short
git diff --check
```

Expected: only the intentionally untracked `output/` directory remains; `git diff --check` prints nothing.

- [ ] **Step 4: Create a final polish commit only if verification produced tracked fixes**

If tracked fixes were required, stage only those exact files and run:

```powershell
git commit -m "fix: polish AIGC cover transition"
```

If no tracked fixes were required, do not create an empty commit.
