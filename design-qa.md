# Design QA — Unseen Projects core gallery

## Comparison setup

- Source visual truth: `output/reference/feedback-1049-pointer-4_8.png` and the two-frame interaction detail `output/reference/feedback-1049-pointer-detail.png`, extracted from the supplied `20260909-1049-41.2257840.mp4` recording; the live source was also opened in the user's Chrome profile at `https://unseen.co/projects/`.
- Implementation rest capture: `output/qa/gallery-rest-later-chrome-recording-reference.png`.
- Implementation pointer capture: `output/qa/gallery-pointer-motion-chrome-recording-reference.png`.
- Implementation drag/depth captures: `output/qa/gallery-drag-chrome-recording-reference.png` and `output/qa/gallery-depth-chrome-recording-reference.png`.
- Full-view comparison input: `output/qa/comparison-feedback-1049-pointer-velocity.png`.
- Focused before/after pointer comparison: `output/qa/comparison-pointer-velocity-sequence.png` and `output/qa/comparison-pointer-local-crop.png`.
- Source pixels: 2560 × 1528 including browser chrome. Implementation pixels: 2189 × 1292 from a 1459 × 861 CSS viewport at device scale 1.5. The implementation was scaled to the source canvas only for the full-view comparison; browser chrome and capture compression were excluded from design findings.
- Cross-browser viewports: Chrome 1440 × 900, Edge 1920 × 1080, and Chrome 1459 × 861 at device scale 1.5.
- States: initial/resting gallery, pointer moving without a button press, pointer stopped for 500 ms, active drag, released inertia, and depth recession.
- Scope: desktop Projects gallery and pointer/wheel interaction. Mobile, project detail routes, sound, menu behavior, and production filter logic remain intentionally out of scope.

## Findings and comparison history

1. **P1 — previous pointer treatment formed fixed concentric rings.** The earlier shader used time-driven radial sine bands, a center glint, ring highlights, and a non-drag hover-strength floor. This remained visible after the pointer stopped and did not match the supplied recording.
2. **Fix:** The radial sine bands, glint, ring highlight, and pointer-light mix were removed. Pointer entry now records position without activating an effect. Pointer movement alone creates a velocity-oriented local membrane shift, texture smear, and restrained color separation. Non-drag pointer strength has no floor and becomes inactive after stopping.
3. **P2 — first velocity-only pass was too subtle in a captured frame.** Although the behavior was technically localized and transient, the initial 12-unit membrane lift and 0.008 texture-flow offset were difficult to distinguish from ambient motion at the matched recording scale.
4. **Fix:** The local field was widened modestly, membrane displacement increased to 22 world units, texture flow to 0.014, and chromatic separation to 0.009. The focused crop now shows directional surface change without a circular outline, white orb, or fixed decorative wave.
5. **Post-fix pointer evidence:** The source two-frame strip and the local rest/motion strip both show image-surface change between frames rather than a stationary cursor ornament. The local effect remains deliberately cleaner because the source recording contains browser compression, cursor capture, and a partially receded gallery state.
6. **P1 — earlier top behavior formed a flat stack.** It was replaced in prior iterations with perspective depth, negative-Z travel, X-axis tilt, depth-dependent scale, horizontal compensation, and continuing vanishing-path movement.
7. **P2 — background and imagery were too gray/dark.** Prior iterations moved the field to warm white, reduced background-sculpture opacity, narrowed the side forms, and added a restrained image wash.
8. **P2 — drag bending was too uniformly arched and shrink completed too abruptly.** Prior iterations reduced the symmetric velocity bow, introduced phase-offset deformation, widened the recession interval, and increased distance/tilt. Those approved behaviors are unchanged in this pointer-only iteration.
9. **P2 — too few examples shortened the experience.** The framework retains twenty-two replaceable English examples using local bundled imagery.

No actionable P0, P1, or P2 issue remains in the approved scope after the velocity-amplitude refinement.

## Required fidelity surfaces

- **Fonts and typography:** Heading, navigation, filter, count, metadata weight, line height, and wrapping remain unchanged from the previously approved pass. The local render is cleaner than the compressed source recording; no new typography drift was introduced.
- **Spacing and layout rhythm:** Two media columns, 42 px gutter, 1304 px cap, metadata spacing, protected heading region, and depth path remain unchanged. Browser-chrome differences were excluded from comparison.
- **Colors and visual tokens:** Warm-white background, translucent pale sculpture, black active filter, softened imagery, and subtle chromatic edges remain. The removed pointer implementation no longer adds a white orb or bright circular bands.
- **Image quality and asset fidelity:** Images are local, cover-cropped, shader-rendered, and free of hotlinks. Pointer movement now deforms the image surface while a stationary cursor contributes exactly zero shader displacement/light.
- **Copy and content:** Captured English title, filters, counts, navigation, and project metadata remain as framework content for later replacement with the user's portfolio.
- **Icons:** Existing brand, menu, project-arrow, and corner controls retain their earlier size/alignment. No icon was introduced or replaced in this iteration.
- **Accessibility and viewport resilience:** Pointer motion is decorative and does not gate navigation. Desktop Chrome/Edge layouts did not overlap or clip at the tested widths. Mobile remains outside the user-approved scope.

## Interaction and browser checks

- Pointer movement activates `data-pointer-active`; after 500 ms without movement it returns to `false`.
- Chrome and Edge: wheel, pointer move, pointer down/drag/up, bounded inertia, depth recession, and protected heading all passed.
- Standard browser suite: 9/9 passed across Chrome 1440, Edge 1080p, and the matched Chrome recording viewport.
- Visual capture suite: 12/12 passed across the same three projects.
- Unit/component suite: 28/28 passed across 5 files.
- Lint and production build: passed.
- Console: no application error was observed. The upstream Three.js `Clock` deprecation warning remains non-blocking.

## Follow-up polish

- P3: Static screenshots cannot fully convey the short-lived directional deformation; final acceptance should include the user's live mouse check in Chrome or Edge.
- P3: The source's private shader and exact background geometry are unavailable. The local implementation reproduces the visible interaction language without claiming identical source code.

final result: passed
