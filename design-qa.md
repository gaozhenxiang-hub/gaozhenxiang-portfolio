# Design QA — Unseen Projects core gallery

## Comparison setup

- Source visual truth: `output/reference/unseen-recording-frame.png` and `output/reference/feedback-0827-sheet.png`, extracted from the user recordings including `20260909-0827-38.7693774.mp4`.
- Implementation rest capture: `output/qa/gallery-chrome-recording-reference.png`.
- Implementation motion captures: `output/qa/gallery-drag-chrome-1440.png` and `output/qa/gallery-depth-chrome-1440.png`.
- Full-view comparison input: `output/qa/comparison-rest-source-vs-local.png`.
- Focused motion comparison input: `output/qa/comparison-motion-source-vs-local.png`.
- Rest-motion evidence: `output/qa/gallery-rest-motion-diff-current.png`, generated from two no-input frames 1.4 seconds apart.
- Matched recording viewport: Chrome 1459 × 861 CSS px at device scale 1.5. Source is 2188 × 1292 px; implementation is 2189 × 1292 px. The source was normalized by one horizontal pixel for the combined comparison.
- Cross-browser viewports: Chrome 1440 × 900 at scale 1; Edge 1920 × 1080 at scale 1.
- State: initial/resting gallery, active pointer drag, released inertia, and a row fully receding toward the vanishing path.
- Scope: desktop Projects gallery and pointer/wheel interaction. Mobile, project detail pages, menu, sound, and production filter behavior are intentionally out of scope.

## Findings and comparison history

1. **P1 — old top behavior formed a flat stack.** The earlier orthographic/pinned implementation compressed cards beneath the heading without true distance. It was replaced with a 35-degree perspective camera, negative-Z travel, X-axis tilt, depth-dependent scale, and a continuing vanishing path.
2. **P1 — the first perspective pass crossed the title and narrowed too much.** The receding row was over 100 px tall and converged toward the center. The full-depth pose now reaches 1600 world units, tilts 1.18 radians, preserves most horizontal span, and settles as a thin band below the heading.
3. **P2 — an approaching row stayed visually heavy.** Recession previously began after the card had already entered the title region. The transition now begins at a 420 px card center and reaches full depth at 225 px, so the card folds backward before it can cover the heading.
4. **P2 — old rows left hairline text across the title.** Media and metadata now fade only after continuing well beyond the visible depth band. The row remains visibly curled first, then disappears in the far distance.
5. **P2 — background and imagery were too gray/dark.** The backdrop is now warm-white with low-opacity, moving edge sculpture; the central top torus was removed, the side arches were narrowed, and the image shader gained a restrained white wash.
6. **P2 — no-input motion was too difficult to see.** Ambient vertex displacement and UV refraction were strengthened and given a subtle persistent chromatic split. The two-frame difference image shows motion along card edges and inside the imagery without pointer input.
7. **P2 — pointer travel was slower than the recording.** Drag distance now maps at 2× pointer displacement while release momentum remains bounded, which brings the next foreground row into view at the same interaction scale as the supplied recording.
8. Post-fix visual comparison shows the source and implementation share the required hierarchy, two-column proportions, card order, pale atmosphere, visible rest ripple, curved active drag, thin receding band, and clear protected heading.

## Required fidelity surfaces

- **Fonts and typography:** Heading hierarchy, navigation size, filter scale, metadata weight, line height, and two-line wrapping are aligned with the captured page. The local font rendering is slightly cleaner than the compressed recording, which is an expected capture difference.
- **Spacing and layout rhythm:** Two 1024:538 media columns, 42 px gap, 1304 px desktop cap, 58 px metadata row, and fixed title/filter region match the recorded structure. Receding media stays wide rather than collapsing into a centered pile.
- **Colors and visual tokens:** The page uses a luminous warm-white field, subtle grain, translucent pale arches, black active filter, and softened image grade. The result no longer reads as flat gray or dark.
- **Image quality and asset fidelity:** Project imagery uses local copies with cover cropping, continuous refraction, rounded clipping, and subtle RGB fringe. No source assets are hotlinked.
- **Copy and content:** The captured English title, filters, counts, project names, project categories, brand, and navigation are preserved for this framework stage, ready for later replacement with the user's projects.

## Interaction and browser checks

- Chrome 1440 × 900: 12 cards rendered; wheel, pointer down/drag/up, bounded inertia, depth recession, far-depth fade, and protected heading verified.
- Edge 1920 × 1080: the same interaction suite passed at the wider viewport.
- Visual capture suite: 9/9 captures passed across Chrome, Edge, and the matched recording viewport.
- Standard browser suite: 6 passed; 6 opt-in visual capture cases skipped as designed.
- Unit/component suite: 22 passed across 5 files.
- Lint, TypeScript, and production build: passed.
- Console: no application errors observed. The upstream Three.js clock deprecation warning remains non-blocking.

## Follow-up polish

- P3: the exact private background geometry and proprietary deformation shader are unavailable. The current locally built sculpture and shader reproduce the visible composition and interaction language, but they are not the source implementation.

final result: passed
