# Pointer Ripple Gallery Refinement Design

## Approved outcome

The desktop Projects gallery must match the latest recording in this order:

1. Pointer-local liquid light and refraction while moving or dragging, with a soft decaying wake after release.
2. Slower, more progressive depth shrink instead of reaching the thin state abruptly.
3. A thinner distant media band, like flexible film rather than a rigid card.
4. Asymmetric, organic bending from several low-amplitude waves plus pointer-local displacement.
5. Twenty-two replaceable English example entries, without inventing additional client claims or downloading new third-party assets.

## Interaction model

Pointer position is tracked in viewport-normalized coordinates even before drag begins. Movement energy rises with pointer speed, stays stronger during drag, and eases back to a small hover level. Every media shader receives the same viewport pointer state, so the visible highlight is spatially continuous across the gallery instead of being attached to one card.

The fragment shader creates a bright liquid core, two travelling rings, subtle texture refraction, and a restrained chromatic rim. The vertex shader uses the same pointer field for a small local membrane lift and combines it with phase-offset ambient waves, preventing symmetrical bowing.

## Depth model

The recession interval is widened and eased so it starts at the same safe boundary but reaches the distant pose later. Distant cards travel farther in negative Z and rotate closer to edge-on. Horizontal compensation remains so rows extend into depth rather than collapsing into a centered stack.

## Content model

The first twelve captured examples remain. Ten additional neutral “Visual Study” entries reuse the bundled local artwork in a different order. They are explicit framework placeholders for later replacement with the user's real work.

## Verification

Vitest covers pointer energy decay, widened recession, thin projected height, shader contracts, and twenty-two unique entries. Playwright checks card count, pointer response state, drag/wheel behavior, and Chrome/Edge rendering. Visual captures are compared side-by-side with frames from `20260909-1049-41.2257840.mp4`.
