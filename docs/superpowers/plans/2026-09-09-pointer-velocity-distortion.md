# Pointer Velocity Distortion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed cursor ripple with a brief pointer-velocity-driven image deformation that returns to rest after the mouse stops.

**Architecture:** Keep the existing shared pointer state and WebGL plane pipeline. Make pointer impulse strength a pure, unit-tested motion function, remove every time-driven radial pointer wave from the shaders, and use pointer velocity only for local membrane displacement, texture smear, and restrained chromatic separation.

**Tech Stack:** Next.js 16, React 19, React Three Fiber, Three.js GLSL shaders, Vitest, Playwright.

---

### Task 1: Specify the transient pointer lifecycle

**Files:**
- Modify: `src/features/gallery/gallery-motion.test.ts`
- Modify: `src/features/gallery/gallery-motion.ts`

- [ ] **Step 1: Write the failing pointer impulse tests**

Add tests that import `calculatePointerImpulse` and assert that a stationary hover returns `0`, speed increases the impulse, drag has a bounded movement floor, and twenty idle frames drive `createPointerInteractionFrame(...).strength` below the visible `0.025` threshold.

```ts
expect(calculatePointerImpulse(0, false)).toBe(0);
expect(calculatePointerImpulse(0.2, false)).toBeGreaterThan(0);
expect(calculatePointerImpulse(1.5, false)).toBeLessThanOrEqual(1);
expect(calculatePointerImpulse(0, true)).toBeGreaterThan(0);
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run: `npm test -- src/features/gallery/gallery-motion.test.ts`

Expected: FAIL because `calculatePointerImpulse` is not exported and the current decay remains above the new idle threshold.

- [ ] **Step 3: Implement the minimal lifecycle function and faster decay**

Add this bounded speed mapping to `gallery-motion.ts`:

```ts
export function calculatePointerImpulse(speed: number, dragging: boolean) {
  const movement = Math.max(0, speed) * 1.15;
  return Math.min(1, movement + (dragging ? 0.28 : 0));
}
```

Change the falling strength response base from `0.9` to `0.78` and the velocity decay base from `0.82` to `0.72`, preserving the existing fast activation path.

- [ ] **Step 4: Run the focused tests and verify GREEN**

Run: `npm test -- src/features/gallery/gallery-motion.test.ts`

Expected: all gallery motion tests pass.

### Task 2: Remove radial rings and implement velocity-oriented image response

**Files:**
- Modify: `src/features/gallery/gallery-shaders.test.ts`
- Modify: `src/features/gallery/gallery-shaders.ts`

- [ ] **Step 1: Replace ring expectations with failing velocity-only shader contracts**

Assert that both shaders retain pointer uniforms and contain `pointerImpulse`/`pointerFlow`, but contain none of `pointerRing`, `ringA`, `ringB`, `liquidRipple`, `pointerGlint`, `ringHighlight`, or a time-driven sine using `pointerDistance`.

- [ ] **Step 2: Run the shader tests and verify RED**

Run: `npm test -- src/features/gallery/gallery-shaders.test.ts`

Expected: FAIL because the existing shader still contains fixed radial rings and pointer light.

- [ ] **Step 3: Implement velocity-oriented vertex displacement**

In `galleryVertexShader`, retain the projected pointer distance and replace the radial sine section with a speed-gated local impulse:

```glsl
float pointerSpeed = length(uPointerVelocity);
float pointerImpulse = pointerCore * uPointerStrength * min(1.0, pointerSpeed * 2.4);
transformed.z += pointerImpulse * 12.0;
transformed.y += uPointerVelocity.y * pointerImpulse * 7.0;
transformed.x += uPointerVelocity.x * pointerImpulse * 8.0;
```

- [ ] **Step 4: Implement velocity-oriented texture smear and color separation**

In `galleryFragmentShader`, remove radial sine waves, glint, ring highlight, and pointer brightness mixing. Build a local flow vector and offset texture/color samples along pointer velocity:

```glsl
float pointerSpeed = length(uPointerVelocity);
float pointerImpulse = pointerFalloff * uPointerStrength * min(1.0, pointerSpeed * 2.4);
vec2 pointerFlow = uPointerVelocity * pointerImpulse;
uv -= pointerFlow * 0.008;
vec2 pointerDirection = uPointerVelocity / max(pointerSpeed, 0.001);
float pointerChromatic = pointerImpulse * 0.006;
vec2 splitOffset = vec2(shift * direction, 0.0) + pointerDirection * pointerChromatic;
```

Use `splitOffset` for the red/blue samples and leave the existing low-amplitude ambient refraction unchanged.

- [ ] **Step 5: Run the shader tests and verify GREEN**

Run: `npm test -- src/features/gallery/gallery-shaders.test.ts`

Expected: all shader tests pass and the forbidden ring identifiers are absent.

### Task 3: Wire real pointer speed with no stationary hover floor

**Files:**
- Modify: `src/features/gallery/useDragGallery.ts`
- Modify: `e2e/gallery.spec.ts`

- [ ] **Step 1: Add a failing browser assertion for recovery after movement**

After activating the pointer state, stop mouse movement, wait `500` milliseconds, and assert `data-pointer-active="false"`. Keep the existing wheel and drag assertions.

- [ ] **Step 2: Run the focused browser test and verify RED**

Run: `npx playwright test e2e/gallery.spec.ts --project=chromium`

Expected: FAIL because the current `0.06` hover floor keeps the pointer active.

- [ ] **Step 3: Use the tested impulse function in the interaction hook**

Import `calculatePointerImpulse`. Replace the fixed `0.38 + speed * 0.34` activation with `calculatePointerImpulse(speed, dragging)`. Set the non-dragging pointer floor to `0` and decay non-dragging target strength with base `0.72`. Preserve a drag-only floor while the primary pointer is pressed.

- [ ] **Step 4: Run the focused browser test and verify GREEN**

Run: `npx playwright test e2e/gallery.spec.ts --project=chromium`

Expected: all gallery browser tests pass.

### Task 4: Update visual evidence and run the full quality gate

**Files:**
- Modify: `e2e/visual-capture.spec.ts`
- Modify: `design-qa.md`

- [ ] **Step 1: Rename the pointer capture state**

Rename the test and artifact from `pointer-local liquid light` / `gallery-pointer-ripple` to `pointer-velocity image response` / `gallery-pointer-motion`. Capture immediately after a multi-step pointer move so the transient response is visible.

- [ ] **Step 2: Run complete automated verification**

Run: `npm run lint && npm test && npm run build`

Expected: ESLint exits with zero errors, all Vitest tests pass, and the Next.js production build exits `0`.

- [ ] **Step 3: Run standard Chrome and Edge interaction coverage**

Run: `npx playwright test e2e/gallery.spec.ts --project=chromium --project=msedge`

Expected: all standard desktop interaction tests pass in both browser projects.

- [ ] **Step 4: Capture visual QA states**

Run: `$env:CAPTURE_QA='1'; npx playwright test e2e/visual-capture.spec.ts --project=chromium --project=msedge; Remove-Item Env:CAPTURE_QA`

Expected: rest, drag, pointer-motion, and depth screenshots are written under `output/qa/` for both browsers.

- [ ] **Step 5: Compare source and prototype evidence**

Place the matching reference frame from `output/reference/feedback-1049-pointer-4_8.png` beside the new Chrome pointer-motion capture, inspect the combined image, and verify that no stationary concentric ring remains, the moving image response is localized and subtle, and the approved layout/depth behavior is unchanged.

- [ ] **Step 6: Update the QA report and commit**

Record viewport, source evidence, automated results, Chrome/Edge inspection, visible mismatches, and the final result in `design-qa.md`. Only use `final result: passed` if no P0/P1/P2 issue remains. Then commit the implementation and verification artifacts excluding the untracked `output/` folder.
