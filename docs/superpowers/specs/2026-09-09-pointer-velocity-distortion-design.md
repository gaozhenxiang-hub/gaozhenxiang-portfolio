# Pointer Velocity Distortion Design

## Approved outcome

The desktop Projects gallery must remove the current cursor-centered concentric ripple and replace it with a transient image-surface response that exists only while the pointer is moving or a drag is still carrying momentum.

## Interaction model

- Pointer position remains shared across the WebGL gallery so the response can cross card boundaries naturally.
- Pointer movement speed creates a short-lived local impulse. Faster movement produces slightly more displacement, texture smear, and restrained chromatic separation.
- A stationary pointer creates no ring, halo, glint, or minimum-strength effect. The impulse eases to visually inactive within roughly 300 milliseconds.
- Press-and-drag uses the same local impulse while retaining the existing stronger gallery-wide bend and inertial movement.
- Existing ambient deformation may continue at low amplitude, but it must not form a pointer-centered circle or become a fixed decorative wave.

## Shader model

The vertex shader replaces the time-driven radial sine ring with a soft, velocity-oriented membrane displacement. The fragment shader removes both radial wave bands and the bright pointer glint. It samples the texture with a small offset along pointer velocity and uses the movement impulse for subtle edge color separation. With zero pointer speed and zero strength, the pointer contribution is exactly zero.

## Motion lifecycle

Pointer entry records position but does not activate the effect. Pointer moves raise interaction strength from measured delta and elapsed time. The non-dragging strength floor is zero, and both strength and pointer velocity decay after movement. Pointer leave clears the target strength. Dragging retains a small floor only while the primary pointer is pressed.

## Scope

This iteration changes only pointer-driven image behavior and its related automated/visual tests. It preserves the approved desktop layout, twenty-two example projects, depth recession, wheel navigation, drag navigation, typography, background treatment, and content. Deployment is intentionally deferred until the visual result is approved.

## Verification

- Unit tests prove that shader source contains velocity-oriented deformation and no radial pointer-ring or pointer-glint implementation.
- Motion tests prove that a pointer impulse decays below the visible threshold without a stationary floor.
- Browser tests prove the pointer state activates after movement and becomes inactive after stopping, while wheel and drag navigation still work.
- Chrome and Edge captures compare the rest, pointer-motion, and drag/depth states against the source recording and live reference at matching desktop dimensions.
- `design-qa.md` must finish with `final result: passed` before handoff.
