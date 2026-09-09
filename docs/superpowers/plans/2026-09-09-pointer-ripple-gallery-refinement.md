# Pointer Ripple Gallery Refinement Plan

**Goal:** Add the recorded cursor-local water/light response, smooth the depth transition, make distant cards thinner and more organic, and expand the replaceable gallery to 22 entries.

**Tech stack:** React Three Fiber, Three.js, GLSL, Vitest, Playwright

### Task 1: Lock the behavior with failing tests

- [x] Add motion tests for pointer activation/decay and slower recession.
- [x] Add shader assertions for viewport pointer uniforms, local ripple/refraction, and asymmetric membrane waves.
- [x] Update content/component/browser expectations from 12 to 22 cards.
- [x] Run focused tests and record the expected RED state.

### Task 2: Implement pointer-local liquid interaction

- [x] Track pointer position, velocity, drag state, and decaying strength in `useDragGallery`.
- [x] Pass the interaction ref through the canvas to every project plane.
- [x] Add screen-space light rings, refraction, chromatic fringe, and local vertex displacement.
- [x] Run focused tests and record GREEN.

### Task 3: Refine depth and content

- [x] Widen and soften the recession curve.
- [x] Increase distant depth and tilt while preserving the horizontal vanishing path.
- [x] Add ten neutral, local, replaceable study entries and update the visible total.
- [x] Run the unit/component suite.

### Task 4: Compare and verify

- [x] Capture rest, pointer, drag, and depth states at the matched recording viewport.
- [x] Build side-by-side comparisons with the supplied recording frames and fix P0/P1/P2 differences.
- [x] Run lint, tests, production build, Chrome and Edge suites, and `git diff --check`.
- [x] Update `design-qa.md`, commit the verified result, and keep the preview open.
