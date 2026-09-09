# Design QA — Projects gallery and personal contact finale

## Comparison setup

- Source visual truth: `output/reference/feedback-1049-pointer-4_8.png` and the two-frame interaction detail `output/reference/feedback-1049-pointer-detail.png`, extracted from the supplied `20260909-1049-41.2257840.mp4` recording; the live source was also opened in the user's Chrome profile at `https://unseen.co/projects/`.
- Latest user edit target: `C:/Users/g3320/AppData/Local/Temp/codex-clipboard-e9a8f5c7-c0e1-4950-be21-bdac3176cdfe.png`, with the explicit instruction to remove the complete category/count row below `Selected Projects`.
- Contact source truth: the user-approved specification at `docs/superpowers/specs/2026-09-09-contact-finale-design.md`. The user explicitly chose not to provide a separate footer reference, so this section is evaluated as visible conformance to that approved spec rather than a pixel match to an external design.
- Implementation rest capture: `output/qa/gallery-rest-later-chrome-recording-reference.png`.
- Implementation pointer capture: `output/qa/gallery-pointer-motion-chrome-recording-reference.png`.
- Implementation drag/depth captures: `output/qa/gallery-drag-chrome-recording-reference.png` and `output/qa/gallery-depth-chrome-recording-reference.png`.
- Implementation contact captures: `output/qa/gallery-contact-finale-chrome-1440.png`, `output/qa/gallery-contact-finale-edge-1080p.png`, and `output/qa/gallery-contact-finale-chrome-recording-reference.png`.
- Current post-removal gallery capture: `output/qa/gallery-chrome-1440.png`.
- Full-view comparison input: `output/qa/comparison-feedback-1049-pointer-velocity.png`.
- Focused before/after pointer comparison: `output/qa/comparison-pointer-velocity-sequence.png` and `output/qa/comparison-pointer-local-crop.png`.
- Source pixels: 2560 × 1528 including browser chrome. Implementation pixels: 2189 × 1292 from a 1459 × 861 CSS viewport at device scale 1.5. The implementation was scaled to the source canvas only for the full-view comparison; browser chrome and capture compression were excluded from design findings.
- Cross-browser viewports: Chrome 1440 × 900, Edge 1920 × 1080, and Chrome 1459 × 861 at device scale 1.5.
- Contact implementation pixels/CSS/density: 1440 × 900 at 1440 × 900 CSS / 1x; 1920 × 1080 at 1920 × 1080 CSS / 1x; 2189 × 1292 at 1459 × 861 CSS / 1.5x. No density normalization was needed for layout judgment because each capture was checked against its own CSS viewport.
- States: initial/resting gallery, pointer moving without a button press, pointer stopped for 500 ms, active drag, released inertia, depth recession, contact entrance, contact final position, and reverse return to projects.
- Scope: desktop Projects gallery, pointer/wheel interaction, and the bottom personal contact finale. Mobile, cover screen, project detail routes, sound, menu behavior, public deployment, and production filter logic remain intentionally out of scope.

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
10. **P1 — first contact capture clipped the name and retained gallery chrome.** The initial final-position capture placed the contact panel above the viewport while the brand, navigation, `Selected Projects` title, filters, veil, and drag cue remained over it.
11. **Fix:** Contact entrance progress is now derived from bounded gallery travel. Gallery chrome and texture noise fade as the contact panel enters, while the panel's final travel aligns its top edge to the viewport.
12. **P2 — first alignment correction left a 48 px gallery-colored strip at the bottom.** The contact panel height and the gallery's extra end travel did not describe the same final frame.
13. **Fix:** The contact panel now occupies exactly `100vh`, and the bounded gallery maximum aligns content bottom to viewport bottom without extra travel. The post-fix captures show a continuous white field from top to bottom in all three desktop configurations.
14. **Post-fix contact evidence:** The three contact captures show the complete `高振翔` heading, `AIGC CREATOR`, Chinese `电话` and `邮箱` labels, readable values, no gallery header/filter overlap, and no cards, icons, borders, gradients, or decorative imagery. Phone and email interaction is verified separately by accessible link assertions.
15. **Latest requested simplification:** The entire `All 22 / Branding 5 / Digital 20 / Motion 5 / Experiment 6` row was removed. The current 1440 × 900 capture confirms the title remains centered, the first project row retains clear separation, and no empty pill container or residual filter styling remains.
16. **Top-corner removal:** The user explicitly requested removing both top corners. The current 1440 × 900 capture confirms `unseen studio®`, `Index / Projects / Contact`, and the three-dot menu are absent, while the centered title, gallery spacing, imagery, and interaction surface remain intact.

No actionable P0, P1, or P2 issue remains in the approved scope after the velocity-amplitude refinement.

## Required fidelity surfaces

- **Fonts and typography:** Gallery heading and metadata remain unchanged from the previously approved pass; the original brand/navigation and category/count typography are intentionally absent. The contact finale uses a dominant large Chinese name, regular optical weight, tight display spacing, smaller uppercase role text, and readable contact values without wrapping at the three tested desktop widths.
- **Spacing and layout rhythm:** The gallery retains its two media columns, 42 px gutter, 1304 px cap, metadata spacing, protected heading region, and depth path. The finale fills one viewport, uses generous top/side/bottom padding, and separates identity from a bottom-aligned two-column contact row.
- **Colors and visual tokens:** The gallery retains its warm-white atmosphere and softened imagery. The finale is a continuous pure-white field with near-black typography; the gallery texture/noise and fixed chrome fade to zero before the final state.
- **Image quality and asset fidelity:** Images are local, cover-cropped, shader-rendered, and free of hotlinks. Pointer movement now deforms the image surface while a stationary cursor contributes exactly zero shader displacement/light.
- **Copy and content:** Gallery English framework copy remains for later portfolio replacement, except the user-requested studio brand, top navigation, menu, and category/count row have been removed completely. The contact finale uses the exact approved content: `高振翔`, `AIGC CREATOR`, `电话 13293941800`, and `邮箱 13293941800@163.com`.
- **Icons:** Existing brand, menu, project-arrow, and corner controls retain their earlier size/alignment. No icon was introduced or replaced in this iteration.
- **Accessibility and viewport resilience:** Pointer motion is decorative and does not gate navigation. The phone and email are semantic links with descriptive accessible names and correct `tel:`/`mailto:` targets. Desktop Chrome/Edge layouts did not overlap or clip at the tested widths. Mobile remains outside the user-approved scope.

Focused-region comparison was not required for the contact finale because all four text groups and the entire white frame are clearly readable in the full-view captures. The previously recorded focused pointer comparisons remain the relevant detail evidence for shader fidelity.

## Interaction and browser checks

- Pointer movement activates `data-pointer-active`; after 500 ms without movement it returns to `false`.
- Chrome and Edge: wheel, pointer move, pointer down/drag/up, bounded inertia, depth recession, and protected heading all passed.
- Current browser regression suite: 8/8 passed across Chrome 1440 and Edge 1080p; the matched recording viewport remains covered by the preceding 12/12 pass.
- Visual capture suite: 15/15 passed across the same three projects.
- Latest category-row removal capture: 1/1 passed at Chrome 1440 × 900 and was visually inspected.
- Unit/component suite: 31/31 passed across 5 files.
- Lint and production build: passed.
- Console: no application error was observed. The upstream Three.js `Clock` deprecation warning remains non-blocking.

## Follow-up polish

- P3: Static screenshots cannot fully convey the short-lived directional deformation; final acceptance should include the user's live mouse check in Chrome or Edge.
- P3: The source's private shader and exact background geometry are unavailable. The local implementation reproduces the visible interaction language without claiming identical source code.

final result: passed
