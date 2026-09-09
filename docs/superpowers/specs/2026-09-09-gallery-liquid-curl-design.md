# Gallery Liquid Curl Design

## Goal

Rebuild the desktop project gallery motion so it matches the supplied Unseen recording in four observable ways: a luminous translucent background, continuous low-amplitude liquid movement at rest, elastic velocity-driven deformation during drag, and a visible curl/compression when cards pass through the title area instead of fading away.

Mobile behavior, project detail pages, menu behavior, sound, and replacing the placeholder project content remain out of scope.

## Reference and success criteria

The primary reference is `20260909-0827-38.7693774.mp4` at 2560 × 1528 and 30 fps.

The result succeeds when:

- the background reads as luminous off-white rather than flat gray;
- pale edge structures and fragments remain translucent and do not compete with the work;
- every card has a subtle, continuous, asynchronous surface motion with no pointer input;
- dragging produces elastic lag, curvature, slight internal refraction, and restrained rebound;
- a card approaching the header compresses vertically and curls into a narrow visible ribbon;
- the compressed card remains visible rather than being removed by opacity or a hard mask;
- reversing or stopping movement unfolds the card smoothly;
- the title and filters remain readable while the curled content passes behind their protected foreground layer;
- Chrome and Edge retain smooth input and render the same composition.

## Considered approaches

### A. Unified WebGL vertex and fragment deformation — selected

Drive rest ripple, drag deformation, and top curl from explicit shader uniforms. This most closely matches the source because card geometry and image sampling deform together, and it keeps all motion continuous. It also allows the curl to remain visible without a CSS fade.

### B. CSS transforms and clipping

Scale and skew each DOM card near the header. This is cheaper but cannot create the source's curved surface, local refraction, or ribbon-like roll. It would repeat the current mismatch.

### C. Pre-rendered motion overlay

Place a looping effect over the gallery. This can look fluid in one fixed composition but will not follow arbitrary project images or pointer velocity, so it is unsuitable for later replacement with the user's work.

## Architecture

### Motion state

Extend the existing gallery motion state with a monotonically advancing time value and a smoothed interaction velocity. Time drives ambient movement even at rest. Pointer and wheel input drive target position and velocity; release projection remains capped.

### Card geometry

Increase plane subdivisions so deformation is spatially smooth. The vertex shader combines three independent terms:

1. a small per-card ambient ripple using time and phase;
2. velocity-driven elastic bow and lateral shear;
3. screen-position-driven top curl that vertically compresses and bends the upper card around a horizontal virtual cylinder.

Top curl strength is derived from each vertex's screen-space distance to the protected header boundary. It must never use opacity as the primary disappearance mechanism.

### Image sampling

The fragment shader applies a very small time-varying UV displacement to create the submerged-image feeling. Drag velocity adds a restrained directional refraction and chromatic separation. The base grade lifts midtones and reduces contrast without washing out intentionally dark artwork.

### Header layering

Remove the current card alpha fade and metadata mask. Keep the title and filters on a higher foreground layer with only a subtle translucent local backing where needed for legibility. Curled cards remain rendered beneath it.

### Background atmosphere

Use a warmer luminous base and visible translucent side sculptures. Add slow, independent drift to the sculpture group and fragments. The background may contain soft gradients and grain, but no opaque gray veil.

## Test strategy

- Unit tests cover bounded release projection and deterministic helpers for ambient phase and top-curl strength.
- Shader contract tests require time, phase, ambient ripple, and top-curl uniforms and forbid the previous top-visibility alpha fade.
- Component tests verify the obsolete metadata mask is removed and the header foreground layer remains.
- Browser tests verify pointer/wheel response, bounded release, retained card visibility through the header zone, and stable rendering in Chrome and Edge.
- Visual QA captures rest, active drag, and top-curl states at the same viewport used for the reference contact sheet.

## Constraints and fallback

The private original geometry and shader source are unavailable, so the implementation will be matched from recorded pixels and motion. If a browser lacks WebGL, the existing static image fallback remains readable, but liquid and curl effects are not guaranteed in that fallback.
