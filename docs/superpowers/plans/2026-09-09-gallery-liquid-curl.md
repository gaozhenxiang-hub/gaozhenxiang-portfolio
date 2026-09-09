# Gallery Liquid Curl Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reproduce the reference gallery's luminous atmosphere, continuous submerged-image movement, elastic drag response, and visible top-edge curl.

**Architecture:** Keep the existing React Three Fiber gallery and replace the fade-based header treatment with shader-driven geometry deformation. A deterministic TypeScript helper computes curl strength from each card's screen position; the vertex shader combines ambient ripple, interaction bow, and curl compression, while the fragment shader adds restrained refraction and lifting.

**Tech Stack:** Next.js 16, React 19, React Three Fiber, Three.js GLSL shaders, Vitest, Playwright

**Status:** Implemented and verified on 2026-09-09.

---

### Task 1: Define the top-curl motion contract

**Files:**
- Modify: `src/features/gallery/gallery-motion.ts`
- Modify: `src/features/gallery/gallery-motion.test.ts`

- [ ] **Step 1: Write the failing test**

Add assertions that `calculateTopCurl(320) === 0`, `calculateTopCurl(110) === 1`, and intermediate positions return a value strictly between zero and one.

- [ ] **Step 2: Run the focused test and verify RED**

Run `npm test -- src/features/gallery/gallery-motion.test.ts` and expect failure because `calculateTopCurl` is not exported.

- [ ] **Step 3: Implement the helper**

Add a clamped smoothstep helper and export `calculateTopCurl(screenY)` using a full-curl boundary of 125 px and a no-curl boundary of 300 px.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run `npm test -- src/features/gallery/gallery-motion.test.ts` and expect all motion tests to pass.

### Task 2: Replace fade with liquid and curl shader contracts

**Files:**
- Modify: `src/features/gallery/gallery-shaders.test.ts`
- Modify: `src/features/gallery/gallery-shaders.ts`

- [ ] **Step 1: Write failing shader contract tests**

Require `uTime`, `uPhase`, and `uCurl` in the vertex shader; require time-varying UV ripple in the fragment shader; and assert that `topVisibility` and `smoothstep(155.0, 270.0, topFromScreen)` are absent.

- [ ] **Step 2: Run the shader test and verify RED**

Run `npm test -- src/features/gallery/gallery-shaders.test.ts` and expect failures for missing uniforms and the old fade expression.

- [ ] **Step 3: Implement minimal shader behavior**

Add two low-amplitude sine waves gated away from hard card edges, keep the recorded velocity bow, compress local Y toward 14 percent at full curl, lift the middle into a shallow cylinder, and offset texture UV by at most 0.0025 at rest. Restore rounded-box alpha as the only alpha term.

- [ ] **Step 4: Run the shader test and verify GREEN**

Run `npm test -- src/features/gallery/gallery-shaders.test.ts` and expect all shader tests to pass.

### Task 3: Feed time, phase, and curl into every project plane

**Files:**
- Modify: `src/features/gallery/ProjectPlane.tsx`
- Modify: `src/features/gallery/GalleryCanvas.tsx`

- [ ] **Step 1: Extend plane uniforms**

Remove `pixelRatio`; add a numeric `phase` prop and uniforms for `uTime`, `uPhase`, and `uCurl`.

- [ ] **Step 2: Update the frame loop**

Use the render clock for continuous time, compute the card center's CSS screen Y from its current mesh position, call `calculateTopCurl`, and update all dynamic uniforms every frame.

- [ ] **Step 3: Increase mesh resolution and wire stable phases**

Use a 48 by 24 segmented plane and pass `index * 1.37` as the per-card phase from `GalleryCanvas`.

- [ ] **Step 4: Run unit tests and TypeScript build**

Run `npm test` followed by `npm run build`; expect zero failures.

### Task 4: Remove the disappearance mask and brighten the atmosphere

**Files:**
- Modify: `src/features/gallery/GalleryPage.test.tsx`
- Modify: `src/features/gallery/GalleryPage.tsx`
- Modify: `src/features/gallery/gallery.css`
- Modify: `src/features/gallery/GalleryCanvas.tsx`

- [ ] **Step 1: Write the failing component test**

Assert that `gallery-metadata-mask` is absent and that `gallery-top-veil` remains as a foreground readability layer.

- [ ] **Step 2: Run the component test and verify RED**

Run `npm test -- src/features/gallery/GalleryPage.test.tsx`; expect failure because the mask still exists.

- [ ] **Step 3: Remove mask markup and CSS**

Render the metadata grid directly, delete both CSS mask declarations, and reduce the top veil to a localized transparent backing that does not hide curled media.

- [ ] **Step 4: Brighten the background**

Set the base to warm off-white, use restrained white radial illumination and lower-contrast grain, and make the WebGL sculptures additively luminous with slow independent clock-driven drift.

- [ ] **Step 5: Run component tests and verify GREEN**

Run `npm test -- src/features/gallery/GalleryPage.test.tsx`; expect all component tests to pass.

### Task 5: Verify motion and visual fidelity

**Files:**
- Modify: `e2e/gallery.spec.ts`
- Modify: `e2e/visual-capture.spec.ts`
- Modify: `design-qa.md`

- [ ] **Step 1: Update browser expectations**

Replace the old fade assertion with checks that the top veil is translucent, the metadata mask is absent, and the WebGL canvas stays visible through pointer motion.

- [ ] **Step 2: Capture three states**

Capture resting, held-drag, and top-curl screenshots at the Chrome 1440 viewport. Compare them with `feedback-0827-sheet.png` and tune only bounded shader constants justified by visible differences.

- [ ] **Step 3: Run the complete verification**

Run `npm run check` and `npm run test:e2e -- --project=chrome-1440 --project=edge-1080p`; expect 15 or more unit/component tests, successful production build, and all non-capture browser tests passing.

- [ ] **Step 4: Record QA evidence and commit**

Update `design-qa.md` with the new reference, rest motion, top-curl evidence, browser results, and any remaining approximation. Run `git diff --check`, then commit the implementation.
