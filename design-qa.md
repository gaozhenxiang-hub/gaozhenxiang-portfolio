# Design QA — Unseen Projects core gallery

## Comparison setup

- Source truth: `C:\Users\g3320\AppData\Local\Packages\Microsoft.ScreenSketch_8wekyb3d8bbwe\TempState\Recordings\20260909-0615-53.7727585.mp4`
- Drag reference: `C:\Users\g3320\AppData\Local\Packages\Microsoft.ScreenSketch_8wekyb3d8bbwe\TempState\Recordings\20260909-0750-29.1696819.mp4`
- Previous implementation recording: `C:\Users\g3320\AppData\Local\Packages\Microsoft.ScreenSketch_8wekyb3d8bbwe\TempState\Recordings\20260909-0751-17.2749447.mp4`
- Liquid/curl reference: `C:\Users\g3320\AppData\Local\Packages\Microsoft.ScreenSketch_8wekyb3d8bbwe\TempState\Recordings\20260909-0827-38.7693774.mp4`
- Source frame: `output/reference/unseen-recording-frame.png`
- Implementation capture: `output/qa/gallery-chrome-recording-reference.png`
- Combined comparison: `output/qa/comparison-final.png`
- Browser/viewport: Chrome, 1459 × 861 CSS px at 1.5 device scale; 2188 × 1292 output px
- State: initial/resting gallery; first four projects visible
- Scope: desktop Projects gallery and pointer/wheel drag interaction. Mobile, detail pages, menu, sound and production filters are intentionally out of scope.

## QA history

1. Pass 1 found P1 scale drift: the implementation grid was materially too wide and the title was oversized at the recording viewport.
2. Fixed grid width to the measured 1304 px cap, column gap to 42 px, and title to the measured 68 px size.
3. Pass 2 found P2 atmosphere drift: the flat background lost the source's pale sculptural edge forms.
4. Added a low-contrast WebGL background sculpture and small debris, then reduced its contrast and moved it to the frame edges so it does not compete with the work.
5. Final combined comparison verified title hierarchy, filter position, two-column composition, 1024:538 media ratio, metadata rows, image crop, grain, pale palette and card order.
6. User-recorded motion comparison found that the previous bend settled too quickly, release momentum could jump too far, cards remained visually heavy under the title, and the overall image grade was darker than the source.
7. Increased but bounded the velocity deformation, added a capped release projection, and lightened the texture grade.
8. A held-drag capture was compared against the source recording and the peak bend was reduced from the first revision to match the source's restrained curved-card profile while retaining a clearly visible response.
9. The 08:27 reference established that the source never relies on a top fade: cards continue moving at rest, then compress and curl into a visible ribbon near the heading.
10. Replaced the fade and metadata mask with continuous time/phase-driven surface refraction, a position-driven curl, a held top boundary, and metadata that follows the compressed card height.
11. Rest frames 1.4 seconds apart were differenced to confirm motion without pointer input. Rest, held-drag, and settled-curl captures were then inspected against the 08:27 contact sheet.

## Interaction and browser checks

- Chrome 1440 × 900: 12 cards rendered; wheel, pointer down/drag/up, bounded inertia and protected title area passed.
- Edge 1920 × 1080: 12 cards rendered; wheel, pointer down/drag/up, bounded inertia and protected title area passed.
- Manual Chrome drag: velocity bending and RGB edge split visibly activate and settle after release.
- Console: no application errors. One upstream Three.js deprecation warning (`THREE.Clock`) is emitted by the rendering stack and does not affect behavior.
- Unit/component tests: 19 passed.
- Browser tests: 6 passed across Chrome and Edge; 6 opt-in visual captures skipped in the standard run.
- Production build: passed.

## Residual observation

- P3: the pale background sculpture is a measured approximation because the source's private 3D scene geometry is not distributed with the page assets. It preserves the visible composition and does not affect the priority gallery or drag behavior.

final result: passed
