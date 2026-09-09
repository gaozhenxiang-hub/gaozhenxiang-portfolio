# Gallery Depth Recession Design

## Status

This design supersedes the top-ribbon behavior in `2026-09-09-gallery-liquid-curl-design.md`. The user confirmed that cards must extend backward into the scene like a flexible conveyor, not compress and remain stacked beneath the heading.

## Selected approach

Use a real perspective camera and position every project plane in three dimensions. This is preferred over orthographic scale simulation because depth must move both columns toward the vanishing point, reduce their apparent size, and foreshorten their height consistently. CSS 3D transforms were rejected because they cannot share the same liquid vertex surface as the WebGL media.

## Motion model

- Normal rows remain on the front plane and keep the captured two-column layout.
- As a row center enters the top 300 CSS pixels, a smooth recession factor increases from zero to one.
- Recession moves the plane backward on Z and rotates it around X, so the image appears to bend away from the viewer.
- Rows continue travelling upward; they are never pinned to one Y coordinate.
- Perspective naturally moves the two columns toward the center and reduces their visible height, producing depth rather than a flat stack.
- The previous vertical curl scale, pinned screen position, and opacity disappearance are removed.

## Liquid surface

Rest motion must be visible without interaction. Each plane receives a stable phase and two slow waves that produce roughly 3–5 CSS pixels of edge movement plus a small time-varying UV refraction. Drag velocity adds a stronger elastic bow and directional refraction. The waves remain asynchronous across cards.

## Background

The center is high-key warm white, with pale translucent edge arches and fragments visible at rest. The geometry uses additive light but occupies enough of the viewport to be legible. Grain is retained at low contrast and cannot turn the scene gray.

## Metadata and header

Metadata follows the foreshortened media bottom using the same recession factor. The heading and filters stay in the foreground, while receding media passes behind them without an opaque fade or fixed pile.

## Verification

- Unit tests cover the recession factor and projected media height.
- Shader tests require recession depth behavior and stronger ambient wave amplitude, and forbid the old `curlScale` path.
- Visual QA captures rest frames separated by time, active drag, and a receding top row.
- Chrome and Edge must pass pointer, wheel, and rendering checks.
