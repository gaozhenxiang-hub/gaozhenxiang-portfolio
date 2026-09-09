# Gallery Depth Recession Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed top ribbon with perspective depth recession and make rest water/background motion visibly match the reference.

**Architecture:** A perspective camera preserves the front-plane pixel composition while Z depth and X rotation create a vanishing path. Pure motion helpers compute recession and projected height; shaders handle continuous liquid displacement and interaction refraction.

**Tech Stack:** Next.js 16, React Three Fiber, Three.js, GLSL, Vitest, Playwright

---

### Task 1: Recession mathematics

**Files:** `src/features/gallery/gallery-motion.ts`, `src/features/gallery/gallery-motion.test.ts`

- [x] Write failing tests for `calculateDepthRecession` and `calculateProjectedMediaHeight`.
- [x] Run `npm test -- src/features/gallery/gallery-motion.test.ts` and verify missing exports fail.
- [x] Implement smooth recession before the title region and projected height from perspective scale and X rotation.
- [x] Run the focused tests and expect all to pass.

### Task 2: Perspective scene and plane path

**Files:** `src/features/gallery/GalleryCanvas.tsx`, `src/features/gallery/ProjectPlane.tsx`, `src/features/gallery/gallery-shaders.ts`, `src/features/gallery/gallery-shaders.test.ts`

- [x] Write failing shader assertions for `uRecession`, stronger ambient displacement, and absence of `curlScale`.
- [x] Run the shader tests and verify RED.
- [x] Configure a 35-degree perspective camera whose Z distance maps the front plane to CSS pixels.
- [x] Move each plane to negative Z and rotate X from its recession factor; remove pinned screen positioning.
- [x] Replace curl compression with shallow depth curvature and increase rest wave displacement to a visible but restrained range.
- [x] Run shader and motion tests and verify GREEN.

### Task 3: Metadata and luminous atmosphere

**Files:** `src/features/gallery/useDragGallery.ts`, `src/features/gallery/gallery-motion.ts`, `src/features/gallery/gallery.css`, `src/features/gallery/GalleryCanvas.tsx`

- [x] Update the metadata helper test to use projected height rather than curl compression and verify RED.
- [x] Move metadata to the projected media bottom using the shared recession calculation.
- [x] Move the translucent edge geometry into the recorded edge band and increase bounded luminous contrast.
- [x] Run component and motion tests and verify GREEN.

### Task 4: Visual and browser verification

**Files:** `e2e/visual-capture.spec.ts`, `design-qa.md`

- [x] Rename the top-state capture to depth recession and record rest, drag, and recession frames.
- [x] Compare them with `feedback-0827-sheet.png`; tune only source-justified constants.
- [x] Run `npm run check` and both Chrome/Edge e2e projects.
- [x] Update QA evidence, run `git diff --check`, and commit.
