# Design QA — AIGC Portfolio Cover

## Comparison target

- Source visual truth: `docs/superpowers/specs/assets/aigc-cover-open-portal.png`
- Final implementation screenshot: `output/qa/hero-rest-chrome-1440.png`
- Final side-by-side evidence: `output/qa/hero-comparison-final.png`
- Pointer-response evidence: `output/qa/hero-pointer-chrome-1440.png`
- Transition evidence: `output/qa/hero-transition-chrome-1440.png`
- Gallery evidence: `output/qa/gallery-chrome-1440.png`
- Contact evidence: `output/qa/gallery-contact-finale-chrome-1440.png`
- Viewport: 1440 × 900 CSS px, Chrome, device scale factor 1
- Source pixels: 1586 × 992
- Implementation pixels: 1440 × 900
- Density normalization: the source was bicubically normalized to 1440 × 900 for the side-by-side comparison. Its aspect ratio matches the implementation within 0.02%, so no material crop mismatch was introduced.
- State: desktop cover at rest after WebGL readiness, before scrolling

## Full-view comparison evidence

The final comparison places the normalized source on the left and the browser-rendered implementation on the right. Composition, title placement, portal scale, bright ivory palette, atmospheric landscape, reflection line, `SELECTED WORKS`, and scroll cue align. The implementation deliberately uses the approved visual itself as the high-fidelity base, with a low-opacity Three.js film and source-image parallax layered above it for motion.

Focused-region evidence was not needed because the final implementation uses the exact approved raster, the full 1440 × 900 comparison preserves legible typography, and no separate icon or dense control region exists on the cover.

## Required fidelity surfaces

- Fonts and typography: the visible cover lettering is the exact approved artwork. Semantic DOM equivalents remain present for document structure without duplicating the raster lettering visually.
- Spacing and layout rhythm: full-bleed crop, left identity block, central portal, right cue, and bottom scroll cue match the approved composition. The gallery and contact page retain their previously accepted desktop spacing.
- Colors and visual tokens: the bright ivory, pale silver-blue, transparent glass, and low-contrast reflection values match the source. No dark procedural background remains.
- Image quality and asset fidelity: the approved 1586 × 992 visual is rendered directly, not recreated with CSS or substitute vector art. The WebGL overlay is limited to interaction response and does not replace the source artwork.
- Copy and content: `高振翔`, `AIGC CREATOR`, `SELECTED WORKS`, and `SCROLL TO EXPLORE` match the approved cover. The final contact page preserves the confirmed Chinese labels, phone number, and email address.
- Interaction and accessibility: wheel and pointer drag move forward and backward between cover, gallery, and contact. Pointer motion adds local film/parallax response; reduced-motion disables the ambient animation. Phone and email remain actionable links.

## Comparison history

1. Pass 1 — blocked
   - Finding: P1 image fidelity mismatch. The first browser render replaced the luminous landscape with sparse pale procedural geometry.
   - Evidence: `output/qa/hero-comparison-pass1.png`.
   - Fix: retained the approved cover artwork as the visual base and reduced WebGL to a transparent interaction layer.
2. Pass 2 — blocked
   - Finding: P2 duplicate portal outline. The WebGL frame appeared as a second rectangle behind the source portal.
   - Evidence: `output/qa/hero-comparison-pass2.png`.
   - Fix: removed the procedural frame, landscape, floor, and backing plane; retained only the thin responsive film.
3. Pass 3 — blocked
   - Finding: P2 rectangular film boundary. Increasing film opacity made its rectangular bounds visible at rest.
   - Evidence: `output/qa/hero-motion-comparison-pass2.png`.
   - Fix: lowered film opacity and moved the clearly visible response to subtle source-image parallax and brightness breathing.
4. Pass 4 — blocked
   - Finding: P2 persistent development indicator in the lower-left corner.
   - Evidence: `output/qa/hero-comparison-pass4.png`.
   - Fix: disabled Next.js development indicators through the documented `devIndicators: false` configuration.
5. Final pass — passed
   - Evidence: `output/qa/hero-comparison-final.png`.
   - No actionable P0, P1, or P2 differences remain.

## Browser and interaction verification

- Chrome 1440 × 900 and Edge 1920 × 1080: cover forward/reverse transition, wheel, pointer drag, gallery depth, contact finale, and muted hover-video playback tested.
- Primary interactions tested: idle breathing, pointer response, scroll into gallery, reverse scroll to cover, project dragging, contact reachability, hover play/pause/reset.
- Browser console errors: checked; none observed. Three.js emits a non-blocking deprecation warning for its internal Clock API.

## Follow-up polish

- P3: migrate the R3F timing source when its upstream Three.js Clock compatibility changes; this has no visible or functional effect now.

final result: passed
